let routerPromise = null

const ENV_KEYS = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'CRM_SUPABASE_URL',
  'CRM_SUPABASE_SERVICE_ROLE_KEY',
  'PUBLIC_MEDIA_BASE_URL',
  'ACTION_API_BASE_URL',
  'ALLOWED_ORIGINS',
  'DEBUG_LOGS',
]

const applyEnv = (env) => {
  globalThis.process ||= { env: {} }
  globalThis.process.env ||= {}

  for (const key of ENV_KEYS) {
    if (env?.[key] !== undefined && globalThis.process.env[key] === undefined) {
      globalThis.process.env[key] = env[key]
    }
  }

  globalThis.process.env.SUPABASE_URL ||= 'https://jjlrlwopsdmxkqyjshuc.supabase.co'
  globalThis.process.env.PUBLIC_MEDIA_BASE_URL ||= 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev'
  globalThis.process.env.ACTION_API_BASE_URL ||= 'http://ec2-35-87-184-138.us-west-2.compute.amazonaws.com'
  globalThis.process.env.DEBUG_LOGS ||= 'false'
}

const getRouter = async (env) => {
  applyEnv(env)
  routerPromise ||= import('./router.mjs')
  return routerPromise
}

const headersToObject = (headers) => {
  const result = {}
  for (const [key, value] of headers.entries()) result[key] = value
  return result
}

const mediaObjectKey = (request) => {
  const { pathname } = new URL(request.url)
  if (pathname.startsWith('/media/')) return decodeURIComponent(pathname.slice('/media/'.length))
  if (pathname.startsWith('/low/')) return decodeURIComponent(pathname.slice(1))
  return null
}

const contentTypeFor = (key) => {
  if (key.endsWith('.png')) return 'image/png'
  if (key.endsWith('.jpg') || key.endsWith('.jpeg')) return 'image/jpeg'
  if (key.endsWith('.webp')) return 'image/webp'
  if (key.endsWith('.svg')) return 'image/svg+xml'
  if (key.endsWith('.gif')) return 'image/gif'
  return 'application/octet-stream'
}

const maybeServeMedia = async (request, env) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') return null
  const key = mediaObjectKey(request)
  if (!key) return null
  if (!env?.MEDIA_BUCKET) {
    return new Response(JSON.stringify({ error: 'R2 media bucket is not configured' }), {
      status: 503,
      headers: { 'content-type': 'application/json' },
    })
  }

  const object = await env.MEDIA_BUCKET.get(key)
  if (!object) {
    return new Response(JSON.stringify({ error: 'Media object not found' }), {
      status: 404,
      headers: { 'content-type': 'application/json' },
    })
  }

  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('etag', object.httpEtag)
  headers.set('cache-control', object.httpMetadata?.cacheControl || 'public, max-age=31536000, immutable')
  if (!headers.has('content-type')) headers.set('content-type', contentTypeFor(key))

  return new Response(request.method === 'HEAD' ? null : object.body, { headers })
}

const toEvent = async (request) => {
  const url = new URL(request.url)
  return {
    rawPath: url.pathname,
    path: url.pathname,
    rawQueryString: url.searchParams.toString(),
    queryStringParameters: Object.fromEntries(url.searchParams.entries()),
    headers: headersToObject(request.headers),
    body: request.method === 'GET' || request.method === 'HEAD' ? '' : await request.text(),
    httpMethod: request.method,
    requestContext: {
      http: {
        method: request.method,
        path: url.pathname,
      },
    },
  }
}

const toResponse = (result) => new Response(result.body || '', {
  status: result.statusCode || 200,
  headers: result.headers || {},
})

const ACTION_ROUTE_PATTERNS = [
  /^\/booking-requests$/,
  /^\/case-intakes(?:\/.*)?$/,
  /^\/partnership-applications$/,
  /^\/featured-treatments\/[^/]+\/track$/,
]

const isActionProxyRequest = (request) => {
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) return false
  const { pathname } = new URL(request.url)
  return ACTION_ROUTE_PATTERNS.some((pattern) => pattern.test(pathname))
}

const actionCorsHeaders = (request, env) => {
  const origin = request.headers.get('origin') || ''
  const configured = env?.ALLOWED_ORIGINS || ''
  const allowedOrigins = configured
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
  const matches = (allowedOrigin) => {
    if (allowedOrigin === '*') return true
    if (origin === allowedOrigin) return true
    if (!allowedOrigin.includes('*')) return false
    const escaped = allowedOrigin
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '[^.]+')
    return new RegExp(`^${escaped}$`).test(origin)
  }
  const matchedOrigin = origin ? allowedOrigins.find(matches) : null

  return {
    'access-control-allow-origin': matchedOrigin ? origin : allowedOrigins[0] || '*',
    'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'access-control-allow-headers': 'Authorization,Content-Type,Origin,Accept',
    'access-control-max-age': '600',
    vary: 'Origin',
  }
}

const maybeProxyAction = async (request, env) => {
  if (!isActionProxyRequest(request)) return null

  const base = (env?.ACTION_API_BASE_URL || 'http://ec2-35-87-184-138.us-west-2.compute.amazonaws.com').replace(/\/+$/, '')
  const url = new URL(request.url)
  const upstreamUrl = `${base}${url.pathname}${url.search}`
  const headers = new Headers(request.headers)
  headers.set('host', new URL(base).host)

  const upstreamResponse = await fetch(upstreamUrl, {
    method: request.method,
    headers,
    body: request.body,
    redirect: 'manual',
  })

  const responseHeaders = new Headers(upstreamResponse.headers)
  for (const [key, value] of Object.entries(actionCorsHeaders(request, env))) {
    responseHeaders.set(key, value)
  }

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders,
  })
}

export default {
  async fetch(request, env) {
    const mediaResponse = await maybeServeMedia(request, env)
    if (mediaResponse) return mediaResponse

    const actionResponse = await maybeProxyAction(request, env)
    if (actionResponse) return actionResponse

    const { handler } = await getRouter(env)
    return toResponse(await handler(await toEvent(request)))
  },
}
