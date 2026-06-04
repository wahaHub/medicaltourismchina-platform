#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const DEFAULT_PUBLIC_MEDIA_BASE_URL = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev'
const LEGACY_MEDIA_HOSTS = new Set([
  'd1wwcixye6at8o.cloudfront.net',
  'medchina-cloudfront.s3.amazonaws.com',
])

const args = process.argv.slice(2)
const inputPath = args[0]
const outIndex = args.indexOf('--out')
const outPath = outIndex >= 0 ? args[outIndex + 1] : null

const fail = (message) => {
  console.error(message)
  process.exit(1)
}

if (!inputPath) {
  fail('Usage: node scripts/hospital_slug_migration_preflight.mjs <candidates.json> --out <artifact.json>')
}

const supabaseUrl = process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!supabaseUrl || !serviceRoleKey) {
  fail('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
}

const publicMediaBaseUrl = (process.env.PUBLIC_MEDIA_BASE_URL || DEFAULT_PUBLIC_MEDIA_BASE_URL).replace(/\/+$/, '')

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))

const restFetch = async (table, query) => {
  const url = `${supabaseUrl.replace(/\/+$/, '')}/rest/v1/${table}?${query}`
  const response = await fetch(url, {
    headers: {
      apikey: serviceRoleKey,
      authorization: `Bearer ${serviceRoleKey}`,
      accept: 'application/json',
    },
  })
  if (!response.ok) {
    throw new Error(`${table} query failed with ${response.status}: ${await response.text()}`)
  }
  return response.json()
}

const normalizeMediaUrl = (value) => {
  if (typeof value !== 'string' || !value.trim()) return null
  const raw = value.trim()
  if (/^https?:\/\//i.test(raw)) {
    try {
      const url = new URL(raw)
      if (LEGACY_MEDIA_HOSTS.has(url.hostname)) {
        return `${publicMediaBaseUrl}${url.pathname}`
      }
    } catch {
      return raw
    }
    return raw
  }
  if (raw.startsWith('/')) return `${publicMediaBaseUrl}${raw}`
  if (raw.startsWith('crm/') || raw.startsWith('hospital_photos/') || raw.startsWith('low/')) {
    return `${publicMediaBaseUrl}/${raw}`
  }
  return null
}

const collectImageUrls = (detail) => {
  const urls = []
  const add = (value) => {
    const normalized = normalizeMediaUrl(value)
    if (normalized) urls.push(normalized)
  }

  add(detail?.hero_image_url)
  for (const item of Array.isArray(detail?.gallery) ? detail.gallery : []) add(item?.url || item)
  for (const item of Array.isArray(detail?.equipment) ? detail.equipment : []) add(item?.image_url || item?.image)
  for (const item of Array.isArray(detail?.surgeons) ? detail.surgeons : []) {
    add(item?.image_url)
    add(item?.images?.profile)
    add(item?.images?.hero)
  }
  for (const item of Array.isArray(detail?.procedure_cases) ? detail.procedure_cases : []) {
    for (const imageUrl of Array.isArray(item?.image_urls) ? item.image_urls : []) add(imageUrl)
    for (const mediaItem of Array.isArray(item?.media) ? item.media : []) add(mediaItem?.url)
  }

  return Array.from(new Set(urls)).slice(0, 8)
}

const countArray = (value) => Array.isArray(value) ? value.length : 0

const fetchDetail = async (hospitalId) => {
  const rows = await restFetch(
    'v_hospital_details',
    new URLSearchParams({
      id: `eq.${hospitalId}`,
      locale: 'eq.zh',
      select: '*',
      limit: '1',
    }).toString(),
  )
  return rows[0] || null
}

const fetchHospital = async (hospitalId) => {
  const rows = await restFetch(
    'hospitals',
    new URLSearchParams({
      id: `eq.${hospitalId}`,
      select: 'id,slug,city,status,updated_at,data_source',
      limit: '1',
    }).toString(),
  )
  return rows[0] || null
}

const fetchSlugCollision = async (newSlug, hospitalId) => {
  const rows = await restFetch(
    'hospitals',
    new URLSearchParams({
      slug: `eq.${newSlug}`,
      select: 'id,slug,city,status,data_source',
      limit: '2',
    }).toString(),
  )
  return rows.find((row) => row.id !== hospitalId) || null
}

const fetchPackageSamples = async (hospitalId) => {
  const crmUrl = process.env.CRM_SUPABASE_URL
  const crmKey = process.env.CRM_SUPABASE_SERVICE_ROLE_KEY
  if (!crmUrl || !crmKey) return { packageSlugSamples: [], packageCount: 0, warning: 'CRM Supabase env missing; package samples unavailable' }

  const url = `${crmUrl.replace(/\/+$/, '')}/rest/v1/hospital_material_packages?${new URLSearchParams({
    hospital_id: `eq.${hospitalId}`,
    is_active: 'eq.true',
    select: 'slug',
    order: 'sort_order.asc,created_at.asc',
  })}`
  const response = await fetch(url, {
    headers: {
      apikey: crmKey,
      authorization: `Bearer ${crmKey}`,
      accept: 'application/json',
    },
  })
  if (!response.ok) {
    return { packageSlugSamples: [], packageCount: 0, warning: `CRM package query failed with ${response.status}` }
  }
  const rows = await response.json()
  return {
    packageSlugSamples: rows.map((row) => row.slug).filter(Boolean).slice(0, 3),
    packageCount: rows.length,
    warning: rows.length === 0 ? 'No active packages found; package redirect coverage skipped for this hospital' : null,
  }
}

const candidates = readJson(inputPath)
const output = {
  generatedAt: new Date().toISOString(),
  source: path.resolve(inputPath),
  candidates: [],
  unresolved: [],
}

for (const entry of candidates.confirmed || []) {
  const warnings = []
  const [detail, currentHospital, slugCollision, packages] = await Promise.all([
    fetchDetail(entry.hospitalId),
    fetchHospital(entry.hospitalId),
    fetchSlugCollision(entry.newSlug, entry.hospitalId),
    fetchPackageSamples(entry.hospitalId),
  ])

  if (!detail) warnings.push('No v_hospital_details row found for hospitalId')
  if (!currentHospital) warnings.push('No hospitals row found for hospitalId')
  const oldSlugMatchesCurrent = Boolean(currentHospital && currentHospital.slug === entry.oldSlug)
  if (currentHospital && !oldSlugMatchesCurrent) {
    warnings.push(`Current hospital slug "${currentHospital.slug}" does not match candidate oldSlug "${entry.oldSlug}"`)
  }
  if (slugCollision) warnings.push(`Target slug is already used by hospital ${slugCollision.id}`)
  if (packages.warning) warnings.push(packages.warning)

  const representativeImageUrls = collectImageUrls(detail || {})
  const homepageFeatured = entry.homepageFeatured === true
  const homepageFeaturedImageSamples = homepageFeatured ? representativeImageUrls.slice(0, 3) : []
  if (homepageFeatured && homepageFeaturedImageSamples.length === 0) {
    warnings.push('homepageFeatured is true but no homepage image sample could be collected')
  }

  output.candidates.push({
    hospitalId: entry.hospitalId,
    oldSlug: entry.oldSlug,
    newSlug: entry.newSlug,
    nameHint: entry.nameHint,
    reason: entry.reason,
    currentHospital,
    slugCollision,
    materialCounts: {
      gallery: countArray(detail?.gallery),
      surgeons: countArray(detail?.surgeons),
      equipment: countArray(detail?.equipment),
      procedure_cases: countArray(detail?.procedure_cases),
      reviews: countArray(detail?.patient_reviews || detail?.reviews || detail?.user_reviews),
      packages: packages.packageCount,
    },
    packageSlugSamples: packages.packageSlugSamples,
    representativeImageUrls,
    homepageFeatured,
    homepageFeaturedImageSamples,
    ready: Boolean(detail && currentHospital && oldSlugMatchesCurrent && !slugCollision && (!homepageFeatured || homepageFeaturedImageSamples.length > 0)),
    warnings,
  })
}

for (const entry of candidates.unresolved || []) {
  output.unresolved.push({
    ...entry,
    matches: [],
    ready: false,
    warnings: ['No confirmed hospitalId; resolve manually before migration'],
  })
}

const serialized = `${JSON.stringify(output, null, 2)}\n`
if (outPath) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, serialized)
}
process.stdout.write(serialized)
