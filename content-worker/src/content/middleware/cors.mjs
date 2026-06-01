const DEFAULT_ALLOWED_ORIGINS = [
  'https://medicaltourismchina.health',
  'https://www.medicaltourismchina.health',
  'https://*.vercel.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]

export const CORS_HEADERS = {
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization,Content-Type,Origin,Accept',
  'Access-Control-Max-Age': '600',
}

const parseAllowedOrigins = () => {
  const configured = process.env.ALLOWED_ORIGINS
  if (!configured) return DEFAULT_ALLOWED_ORIGINS

  return configured
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}

const getRequestOrigin = (event) => {
  const headers = event?.headers || {}
  return headers.origin || headers.Origin || ''
}

const matchesOrigin = (origin, allowedOrigin) => {
  if (allowedOrigin === '*') return true
  if (origin === allowedOrigin) return true

  if (allowedOrigin.includes('*')) {
    const escaped = allowedOrigin
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '[^.]+')
    return new RegExp(`^${escaped}$`).test(origin)
  }

  return false
}

export const getCorsHeaders = (event) => {
  const origin = getRequestOrigin(event)
  const allowedOrigins = parseAllowedOrigins()
  const allowedOrigin = origin
    ? allowedOrigins.find((candidate) => matchesOrigin(origin, candidate))
    : null

  return {
    ...CORS_HEADERS,
    'Access-Control-Allow-Origin': allowedOrigin ? origin : allowedOrigins[0] || '*',
    Vary: 'Origin',
  }
}

export const withCors = (response, event) => ({
  ...response,
  headers: {
    ...getCorsHeaders(event),
    ...(response?.headers || {}),
  },
})

export const handleOptions = (event) => {
  if (event.requestContext?.http?.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request for:', event.rawPath)
    return {
      statusCode: 204,
      headers: getCorsHeaders(event),
      body: ''
    }
  }
  return null
}
