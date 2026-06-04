#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const DEFAULT_PUBLIC_MEDIA_BASE_URL = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev'

const args = process.argv.slice(2)
const getArg = (name, fallback = null) => {
  const index = args.indexOf(name)
  return index >= 0 ? args[index + 1] : fallback
}

const fail = (message) => {
  console.error(message)
  process.exit(1)
}

const inventoryPath = getArg('--inventory')
const candidatesPath = getArg('--candidates', 'data/hospital_slug_migration_candidates.json')
const outPath = getArg('--out')
const publicMediaBaseUrl = getArg('--public-media-base-url', DEFAULT_PUBLIC_MEDIA_BASE_URL).replace(/\/+$/, '')

if (!inventoryPath || !outPath) {
  fail('Usage: node scripts/hospital_media_migration_manifest.mjs --inventory <inventory.json> --out <manifest.json> [--candidates <candidates.json>]')
}

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))

const extensionFor = (urlValue) => {
  try {
    const pathname = new URL(urlValue).pathname
    const extension = path.extname(pathname).toLowerCase()
    if (/^\.(jpe?g|png|webp|gif|avif)$/i.test(extension)) return extension
  } catch {
    // Fall through to a safe default.
  }
  return '.jpg'
}

const slugSegment = (value) => String(value || 'media')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 48) || 'media'

const folderForKind = (kind) => {
  if (kind === 'hero' || kind === 'summary_hero') return ''
  if (kind.startsWith('surgeon')) return 'surgeons'
  if (kind.startsWith('case_')) return 'cases'
  if (kind.startsWith('crm_package')) return 'packages'
  if (kind.startsWith('crm_review') || kind.startsWith('review_')) return 'reviews'
  return slugSegment(kind)
}

const targetNameFor = (item, index) => {
  const extension = extensionFor(item.normalized)
  if (item.kind === 'hero' || item.kind === 'summary_hero') return `hero${extension}`
  return `${String(index + 1).padStart(3, '0')}-${slugSegment(item.owner || item.kind)}${extension}`
}

const sourceStatusFor = (item) => {
  if (item.source === 'legacy_s3_cloudfront') return 'legacy_source_unverified'
  if (item.source === 'r2_crm_storage') return 'r2_source_unverified'
  if (item.source === 'r2_hospital_photos') return 'already_public_r2_hospital_photos'
  if (item.source === 'r2_low_fallback') return 'low_fallback_source'
  return 'source_unverified'
}

const candidates = readJson(candidatesPath)
const inventory = readJson(inventoryPath)
const confirmedById = new Map((candidates.confirmed || []).map((entry) => [entry.hospitalId, entry]))
const manifest = {
  generatedAt: new Date().toISOString(),
  inventory: path.resolve(inventoryPath),
  candidates: path.resolve(candidatesPath),
  publicMediaBaseUrl,
  totals: {
    hospitals: 0,
    mediaItems: 0,
    incompleteHospitals: 0,
  },
  hospitals: [],
}

for (const hospital of inventory.hospitals || []) {
  const candidate = confirmedById.get(hospital.hospitalId)
  if (!candidate) continue

  const rawMediaItems = hospital.media?.samples || []
  const mediaItems = [...new Map(rawMediaItems.map((item) => [item.normalized, item])).values()]
  const expectedTotal = hospital.media?.summary?.total || 0
  const warnings = []
  if (rawMediaItems.length < expectedTotal) {
    warnings.push(`Inventory only includes ${rawMediaItems.length} of ${expectedTotal} media items; rerun inventory with a larger --image-sample-limit before applying migration`)
  }

  const rows = mediaItems.map((item, index) => {
    const folder = folderForKind(item.kind)
    const targetKey = [
      'hospital_photos',
      'public',
      hospital.hospitalId,
      folder,
      targetNameFor(item, index),
    ].filter(Boolean).join('/')

    return {
      hospitalId: hospital.hospitalId,
      oldSlug: candidate.oldSlug,
      newSlug: candidate.newSlug,
      hospitalName: hospital.name,
      kind: item.kind,
      owner: item.owner,
      source: item.source,
      sourceHost: item.host,
      oldUrl: item.normalized,
      targetKey,
      targetUrl: `${publicMediaBaseUrl}/${targetKey}`,
      sourceStatus: sourceStatusFor(item),
      action: item.source === 'r2_hospital_photos' ? 'verify_existing' : 'copy_or_reupload_then_update_read_model',
    }
  })

  manifest.totals.hospitals += 1
  manifest.totals.mediaItems += rows.length
  if (warnings.length > 0) manifest.totals.incompleteHospitals += 1
  manifest.hospitals.push({
    hospitalId: hospital.hospitalId,
    oldSlug: candidate.oldSlug,
    newSlug: candidate.newSlug,
    name: hospital.name,
    expectedMediaTotal: expectedTotal,
    manifestMediaTotal: rows.length,
    duplicateSourceUrlCount: rawMediaItems.length - mediaItems.length,
    mediaBySource: hospital.media?.summary?.bySource || {},
    warnings,
    media: rows,
  })
}

const missing = [...confirmedById.values()]
  .filter((entry) => !manifest.hospitals.some((hospital) => hospital.hospitalId === entry.hospitalId))
  .map((entry) => entry.hospitalId)
if (missing.length > 0) {
  fail(`Missing inventory rows for candidate hospital ids: ${missing.join(', ')}`)
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, `${JSON.stringify(manifest, null, 2)}\n`)
process.stdout.write(`${JSON.stringify(manifest, null, 2)}\n`)
