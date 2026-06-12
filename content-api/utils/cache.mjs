const PUBLIC_CACHE_CONTROL = 'public, max-age=60, s-maxage=600, stale-while-revalidate=86400'

const PUBLIC_CACHEABLE_PATTERNS = [
  /^\/departments$/,
  /^\/departments\/[^/]+\/capability$/,
  /^\/departments\/[^/]+\/diseases$/,
  /^\/diseases\/[^/]+\/procedures$/,
  /^\/procedures$/,
  /^\/procedures\/[^/]+$/,
  /^\/featured-treatments$/,
  /^\/featured-treatments\/type\/[^/]+$/,
  /^\/featured-treatments\/[^/]+$/,
]

const getMethod = (event) => event?.requestContext?.http?.method || event?.httpMethod || ''
const getPath = (event) => event?.rawPath || event?.path || ''
const getQuery = (event) => {
  const qs = event?.queryStringParameters
  if (qs && typeof qs === 'object' && qs.locale) return qs

  const raw = event?.rawQueryString
  if (raw && typeof raw === 'string') {
    return Object.fromEntries(new URLSearchParams(raw))
  }

  const alt = event?.queryString || event?.rawQuery
  if (alt && typeof alt === 'string') {
    return Object.fromEntries(new URLSearchParams(alt))
  }

  return {}
}

const hasHeader = (event, name) => {
  const headers = event?.headers || {}
  const target = name.toLowerCase()
  return Object.keys(headers).some((key) => key.toLowerCase() === target && headers[key])
}

export const isPublicCacheableRequest = (event) => {
  if (getMethod(event) !== 'GET') return false
  if (hasHeader(event, 'authorization') || hasHeader(event, 'cookie')) return false
  if (!getQuery(event).locale) return false

  const path = getPath(event)
  return PUBLIC_CACHEABLE_PATTERNS.some((pattern) => pattern.test(path))
}

export const withPublicCache = (response, event) => {
  if (!isPublicCacheableRequest(event) || response?.statusCode !== 200) {
    return response
  }

  return {
    ...response,
    headers: {
      ...(response.headers || {}),
      'Cache-Control': PUBLIC_CACHE_CONTROL,
      Vary: 'Origin, Accept-Encoding',
    },
  }
}
