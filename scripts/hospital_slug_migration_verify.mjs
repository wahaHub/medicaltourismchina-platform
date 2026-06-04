#!/usr/bin/env node
import fs from 'node:fs'

const args = process.argv.slice(2)
const artifactPath = args[0]
const baseUrlIndex = args.indexOf('--base-url')
const baseUrl = baseUrlIndex >= 0 ? args[baseUrlIndex + 1] : 'https://www.medicaltourismchina.health'
const DEFAULT_CONTENT_API_BASE_URL = 'https://medicaltourismchina-content-worker.contact-82c.workers.dev'
const contentApiBaseUrl = (process.env.VITE_CONTENT_API_BASE_URL || process.env.VITE_API_BASE_URL || DEFAULT_CONTENT_API_BASE_URL).replace(/\/+$/, '')

const fail = (message) => {
  console.error(message)
  process.exit(1)
}

if (!artifactPath) {
  fail('Usage: node scripts/hospital_slug_migration_verify.mjs <preflight-artifact.json> --base-url <site-url>')
}

const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'))
const siteBase = baseUrl.replace(/\/+$/, '')

const fetchJson = async (url) => {
  const response = await fetch(url)
  if (!response.ok) return { ok: false, status: response.status, data: null }
  return { ok: true, status: response.status, data: await response.json() }
}

const fetchHead = async (url) => fetch(url, { method: 'HEAD', redirect: 'manual' })

const countArray = (value) => Array.isArray(value) ? value.length : 0

const materialCountsFromExtended = (data) => ({
  gallery: countArray(data?.gallery),
  surgeons: countArray(data?.surgeons),
  equipment: countArray(data?.equipment),
  procedure_cases: countArray(data?.procedure_cases),
  reviews: countArray(data?.patient_reviews || data?.reviews || data?.user_reviews),
  packages: countArray(data?.packages),
})

const countsDoNotDrop = (before, after) => {
  const failures = []
  for (const key of ['gallery', 'surgeons', 'equipment', 'procedure_cases', 'reviews', 'packages']) {
    if ((after?.[key] ?? 0) < (before?.[key] ?? 0)) failures.push(key)
  }
  return failures
}

const verifyRedirect = async (url, expectedLocation) => {
  const response = await fetchHead(url)
  const location = response.headers.get('location') || ''
  return {
    status: response.status,
    location,
    ok: response.status === 301 && location === expectedLocation,
  }
}

const verifyImageSamples = async (urls) => {
  const results = []
  for (const url of urls) {
    try {
      const response = await fetchHead(url)
      results.push({ url, status: response.status, ok: response.status >= 200 && response.status < 400 })
    } catch (error) {
      results.push({ url, status: 0, ok: false, error: error.message })
    }
  }
  return results
}

const sitemapResponse = await fetch(`${siteBase}/sitemap.xml`)
const sitemap = sitemapResponse.ok ? await sitemapResponse.text() : ''
const output = {
  generatedAt: new Date().toISOString(),
  baseUrl: siteBase,
  source: artifactPath,
  candidates: [],
}

for (const candidate of artifact.candidates || []) {
  const blockingFailures = []
  for (const key of ['materialCounts', 'packageSlugSamples', 'representativeImageUrls']) {
    if (candidate[key] === undefined) blockingFailures.push(`Preflight artifact missing ${key}`)
  }
  if (candidate.homepageFeatured && (!Array.isArray(candidate.homepageFeaturedImageSamples) || candidate.homepageFeaturedImageSamples.length === 0)) {
    blockingFailures.push('Preflight artifact missing homepageFeaturedImageSamples for homepage featured hospital')
  }
  if (Array.isArray(candidate.packageSlugSamples) && candidate.packageSlugSamples.length === 0) {
    const hasPackageSkipWarning = (candidate.warnings || []).some((warning) => String(warning).includes('package redirect coverage skipped'))
    if (!hasPackageSkipWarning) blockingFailures.push('packageSlugSamples is empty without an explicit preflight skip warning')
  }

  const browserNewUrl = `${siteBase}/hospitals/${candidate.newSlug}`
  const oldBrowserUrl = `${siteBase}/hospitals/${candidate.oldSlug}`
  const oldBrowserQueryUrl = `${oldBrowserUrl}?locale=en`
  const canonicalBrowserQueryUrl = `${browserNewUrl}?locale=en`
  const detailApiUrl = `${contentApiBaseUrl}/hospitals/${candidate.newSlug}?locale=zh`
  const extendedApiUrl = `${contentApiBaseUrl}/hospitals/${candidate.newSlug}/extended?locale=zh`

  const [browserNewResponse, detailApi, extendedApi, oldRedirect, oldQueryRedirect] = await Promise.all([
    fetchHead(browserNewUrl),
    fetchJson(detailApiUrl),
    fetchJson(extendedApiUrl),
    verifyRedirect(oldBrowserUrl, browserNewUrl),
    verifyRedirect(oldBrowserQueryUrl, canonicalBrowserQueryUrl),
  ])

  if (browserNewResponse.status !== 200) blockingFailures.push(`New browser URL returned ${browserNewResponse.status}`)
  if (!detailApi.ok) blockingFailures.push(`Detail API returned ${detailApi.status}`)
  if (!extendedApi.ok) blockingFailures.push(`Extended API returned ${extendedApi.status}`)
  if (!oldRedirect.ok) blockingFailures.push(`Old slug did not 301 to canonical URL: ${oldRedirect.status} ${oldRedirect.location}`)
  if (!oldQueryRedirect.ok) blockingFailures.push(`Old slug query redirect failed: ${oldQueryRedirect.status} ${oldQueryRedirect.location}`)

  const materialCountsAfter = materialCountsFromExtended(extendedApi.data?.data)
  for (const key of countsDoNotDrop(candidate.materialCounts || {}, materialCountsAfter)) {
    blockingFailures.push(`Material count dropped for ${key}`)
  }

  const packageRedirects = []
  for (const packageSlug of candidate.packageSlugSamples || []) {
    const oldPackageUrl = `${siteBase}/hospitals/${candidate.oldSlug}/packages/${packageSlug}`
    const newPackageUrl = `${siteBase}/hospitals/${candidate.newSlug}/packages/${packageSlug}`
    const oldPackageQueryUrl = `${oldPackageUrl}?locale=en`
    const newPackageQueryUrl = `${newPackageUrl}?locale=en`
    const [plain, query] = await Promise.all([
      verifyRedirect(oldPackageUrl, newPackageUrl),
      verifyRedirect(oldPackageQueryUrl, newPackageQueryUrl),
    ])
    if (!plain.ok) blockingFailures.push(`Package slug did not 301: ${packageSlug}`)
    if (!query.ok) blockingFailures.push(`Package slug query redirect failed: ${packageSlug}`)
    packageRedirects.push({ packageSlug, plain, query })
  }

  const sitemapHasNewSlug = sitemap.includes(`${siteBase}/hospitals/${candidate.newSlug}`)
  const sitemapNotHasOldSlug = !sitemap.includes(`${siteBase}/hospitals/${candidate.oldSlug}`)
  if (!sitemapHasNewSlug) blockingFailures.push('Sitemap does not include new slug')
  if (!sitemapNotHasOldSlug) blockingFailures.push('Sitemap still includes old slug')

  const representativeImageSamples = await verifyImageSamples(candidate.representativeImageUrls || [])
  const homepageFeaturedImageSamples = await verifyImageSamples(candidate.homepageFeaturedImageSamples || [])
  for (const item of [...representativeImageSamples, ...homepageFeaturedImageSamples]) {
    if (!item.ok) blockingFailures.push(`Image sample failed: ${item.url}`)
  }

  output.candidates.push({
    hospitalId: candidate.hospitalId,
    oldSlug: candidate.oldSlug,
    newSlug: candidate.newSlug,
    browserNewUrl200: browserNewResponse.status === 200,
    detailApi200: detailApi.ok,
    extendedApi200: extendedApi.ok,
    materialCountsBefore: candidate.materialCounts,
    materialCountsAfter,
    oldSlug301: oldRedirect.ok,
    oldSlugQueryPreserved: oldQueryRedirect.ok,
    packageOldSlug301: packageRedirects.every((item) => item.plain.ok && item.query.ok),
    packageRedirects,
    sitemapHasNewSlug,
    sitemapNotHasOldSlug,
    representativeImageSamples,
    homepageFeaturedImageSamples,
    blockingFailures,
  })
}

process.stdout.write(`${JSON.stringify(output, null, 2)}\n`)

const failures = output.candidates.flatMap((candidate) => candidate.blockingFailures)
if (failures.length > 0) {
  process.exit(1)
}
