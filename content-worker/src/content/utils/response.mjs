import { CORS_HEADERS } from '../middleware/cors.mjs'

export const json = (status, body) => ({
  statusCode: status,
  headers: {
    'content-type': 'application/json',
    ...CORS_HEADERS,
  },
  body: JSON.stringify(body),
})

export const redirect = (status, location, body = '') => ({
  statusCode: status,
  headers: {
    Location: location,
    ...CORS_HEADERS,
  },
  body: typeof body === 'string' ? body : JSON.stringify(body),
})
