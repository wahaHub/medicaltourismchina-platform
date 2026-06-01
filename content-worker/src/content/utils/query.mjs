// utils/query.mjs
// Robustly parse query params from different AWS event shapes (Lambda URL, API GW, CloudFront)

export const getQuery = (event) => {
  try {
    // 1) Standard shape
    const qs = event?.queryStringParameters
    if (qs && typeof qs === 'object' && Object.keys(qs).length > 0) return qs

    // 2) rawQueryString (Lambda URLs / HTTP API)
    const raw = event?.rawQueryString
    if (raw && typeof raw === 'string') {
      return Object.fromEntries(new URLSearchParams(raw))
    }

    // 3) Fallbacks some proxies might use
    const alt = event?.queryString || event?.rawQuery || ''
    if (alt && typeof alt === 'string') {
      return Object.fromEntries(new URLSearchParams(alt))
    }
  } catch (e) {
    // swallow and continue to empty object
  }
  return {}
}

// Helper: derive locale from query or Accept-Language
export const getRequestedLocale = (event, defaultLocale = 'en') => {
  const q = getQuery(event)
  if (q?.locale) return String(q.locale)

  const h = event?.headers || {}
  const al = h['accept-language'] || h['Accept-Language']
  if (typeof al === 'string' && al.length > 1) {
    // Parse first token like "en-US,en;q=0.9"
    const token = al.split(',')[0]?.trim()
    return token || defaultLocale
  }
  return defaultLocale
}

