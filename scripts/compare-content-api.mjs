#!/usr/bin/env node

const OLD_BASE = (process.env.OLD_CONTENT_API_BASE_URL || 'https://api.medicaltourismchina.health').replace(/\/+$/, '')
const NEW_BASE = (process.env.NEW_CONTENT_API_BASE_URL || process.env.CONTENT_API_BASE_URL || 'http://127.0.0.1:8787').replace(/\/+$/, '')

const BASE_ROUTES = [
  { path: '/departments?locale=en', kind: 'list', keys: ['id', 'slug'] },
  { path: '/departments?locale=zh', kind: 'list', keys: ['id', 'slug'] },
  { path: '/hospitals?locale=en&limit=3&offset=0', kind: 'list', keys: ['id', 'slug', 'name'] },
  { path: '/hospitals/hospital-mm4eqlha/extended?locale=en', kind: 'detail', keys: ['id', 'slug', 'name'] },
  {
    path: '/hospitals/xinhua-hospital-shanghai-jiao-tong-university-school-of-medicine/extended?locale=en',
    kind: 'detail',
    keys: ['id', 'slug', 'name'],
  },
  { path: '/procedures?locale=en&limit=3', kind: 'list', keys: ['id', 'slug'] },
  { path: '/featured-treatments?locale=en', kind: 'list', keys: ['id', 'slug'] },
]

const fetchJson = async (base, path) => {
  const response = await fetch(`${base}${path}`, {
    headers: { accept: 'application/json' },
  })
  const text = await response.text()
  let body = null
  try {
    body = text ? JSON.parse(text) : null
  } catch {
    body = { parse_error: text.slice(0, 500) }
  }

  return { status: response.status, body }
}

const dataValue = (body) => body?.data ?? body
const detailValue = (body) => {
  const data = dataValue(body)
  return Array.isArray(data) ? data[0] : data
}
const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value)

const getList = (body) => {
  const data = dataValue(body)
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.results)) return data.results
  return null
}

const compareShape = ({ route, oldResult, newResult }) => {
  const issues = []
  const statusImproved = route.allowStatusImprovement
    && oldResult.status >= 500
    && newResult.status >= 200
    && newResult.status < 300

  if (oldResult.status !== newResult.status && !statusImproved) {
    issues.push(`status ${oldResult.status} -> ${newResult.status}`)
  }

  if (statusImproved) {
    console.log(`WARN ${route.path}: old status ${oldResult.status}, new status ${newResult.status}`)
  }

  if (!oldResult.body || typeof oldResult.body !== 'object') {
    issues.push('old response is not JSON object')
  }
  if (!newResult.body || typeof newResult.body !== 'object') {
    issues.push('new response is not JSON object')
  }

  if (route.kind === 'list') {
    const oldList = getList(oldResult.body)
    const newList = getList(newResult.body)
    if (!Array.isArray(oldList) && !statusImproved) issues.push('old data is not a list')
    if (!Array.isArray(newList)) issues.push('new data is not a list')

    const oldFirst = oldList?.[0]
    const newFirst = newList?.[0]
    for (const key of route.keys || []) {
      if (oldFirst && !(key in oldFirst) && !statusImproved) issues.push(`old first item missing ${key}`)
      if (newFirst && !(key in newFirst)) issues.push(`new first item missing ${key}`)
    }
  }

  if (route.kind === 'detail') {
    const oldData = detailValue(oldResult.body)
    const newData = detailValue(newResult.body)
    if (!isObject(oldData)) issues.push('old data is not an object')
    if (!isObject(newData)) issues.push('new data is not an object')

    for (const key of route.keys || []) {
      if (isObject(oldData) && !(key in oldData)) issues.push(`old detail missing ${key}`)
      if (isObject(newData) && !(key in newData)) issues.push(`new detail missing ${key}`)
    }
  }

  return issues
}

const discoverProcedureRoute = async () => {
  const result = await fetchJson(NEW_BASE, '/procedures?locale=en&limit=1')
  const first = getList(result.body)?.[0]
  const slug = first?.slug || first?.procedure_slug
  const routes = []
  if (slug) {
    routes.push({ path: `/procedures/${slug}?locale=en`, kind: 'detail', keys: ['id', 'slug'] })
  }

  const diseaseId = first?.disease_id || first?.primary_disease_id || first?.associated_diseases?.[0]?.disease_id
  if (diseaseId) {
    routes.push({
      path: `/procedures?locale=en&limit=1&disease_id=${encodeURIComponent(diseaseId)}`,
      kind: 'list',
      keys: ['id', 'slug'],
      allowStatusImprovement: true,
    })
  }

  return routes
}

const main = async () => {
  const extraRoutes = await discoverProcedureRoute().catch((error) => {
    console.warn(`WARN could not discover procedure detail route: ${error?.message || error}`)
    return []
  })
  const routes = [...BASE_ROUTES, ...extraRoutes]
  let failed = 0

  console.log(`Old API: ${OLD_BASE}`)
  console.log(`New API: ${NEW_BASE}`)

  for (const route of routes) {
    const [oldResult, newResult] = await Promise.all([
      fetchJson(OLD_BASE, route.path),
      fetchJson(NEW_BASE, route.path),
    ])
    const issues = compareShape({ route, oldResult, newResult })
    if (issues.length > 0) {
      failed += 1
      console.error(`FAIL ${route.path}`)
      for (const issue of issues) console.error(`  - ${issue}`)
    } else {
      console.log(`OK ${route.path}`)
    }
  }

  if (failed > 0) {
    console.error(`${failed}/${routes.length} route comparisons failed`)
    process.exit(1)
  }

  console.log(`${routes.length}/${routes.length} route comparisons passed`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
