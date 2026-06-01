import { CORS_HEADERS } from '../middleware/cors.mjs'

export const json = (status, body) => ({
  statusCode: status,
  headers: {
    'content-type': 'application/json',
    ...CORS_HEADERS,
  },
  body: JSON.stringify(body),
})
