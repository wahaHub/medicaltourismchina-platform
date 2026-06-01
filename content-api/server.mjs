import http from 'node:http'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))

const loadEnvFile = (path) => {
  if (!existsSync(path)) return

  for (const rawLine of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#') || !line.includes('=')) continue
    const [key, ...rest] = line.split('=')
    if (!process.env[key]) {
      process.env[key] = rest.join('=').replace(/^['"]|['"]$/g, '')
    }
  }
}

loadEnvFile(resolve(here, '.env.local'))
loadEnvFile(resolve(here, '../.env.local'))
loadEnvFile(resolve(here, '../../.env.local'))

if (process.env.MIGRATION_CONTENT_API_ENV_FILE) {
  loadEnvFile(process.env.MIGRATION_CONTENT_API_ENV_FILE)
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_KEY) {
  process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_KEY
}

if (!process.env.SUPABASE_URL && process.env.VITE_SUPABASE_URL) {
  process.env.SUPABASE_URL = process.env.VITE_SUPABASE_URL
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.VITE_SUPABASE_ANON_KEY) {
  process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_ANON_KEY
}

process.env.SUPABASE_URL ||= 'https://jjlrlwopsdmxkqyjshuc.supabase.co'

const { handler } = await import('./index.mjs')

const readBody = async (request) => {
  const chunks = []
  for await (const chunk of request) chunks.push(chunk)
  return Buffer.concat(chunks).toString('utf8')
}

const toHeadersObject = (headers) => {
  const result = {}
  for (const [key, value] of Object.entries(headers)) {
    if (Array.isArray(value)) result[key] = value.join(', ')
    else if (value !== undefined) result[key] = value
  }
  return result
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`)
    const body = await readBody(request)
    const event = {
      rawPath: url.pathname,
      path: url.pathname,
      rawQueryString: url.searchParams.toString(),
      queryStringParameters: Object.fromEntries(url.searchParams.entries()),
      headers: toHeadersObject(request.headers),
      body,
      httpMethod: request.method,
      requestContext: {
        http: {
          method: request.method,
          path: url.pathname
        }
      }
    }

    const result = await handler(event)
    response.writeHead(result.statusCode || 200, result.headers || {})
    response.end(result.body || '')
  } catch (error) {
    console.error('Unhandled server error:', error)
    response.writeHead(500, { 'content-type': 'application/json' })
    response.end(JSON.stringify({ error: 'internal error' }))
  }
})

const port = Number(process.env.PORT || 8787)
const host = process.env.HOST || (process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1')
server.listen(port, host, () => {
  console.log(`Migration content API listening on http://${host}:${port}`)
})
