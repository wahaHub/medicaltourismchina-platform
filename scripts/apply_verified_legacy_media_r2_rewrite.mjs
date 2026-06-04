#!/usr/bin/env node
import fs from 'node:fs'

const args = process.argv.slice(2)
const getArg = (name, fallback = null) => {
  const index = args.indexOf(name)
  return index >= 0 ? args[index + 1] : fallback
}
const hasFlag = (name) => args.includes(name)

const auditPath = getArg('--audit', 'artifacts/hospital_media_r2_object_audit.json')
const verifyPath = getArg('--verify', 'artifacts/hospital_legacy_media_target_verify.json')
const retryPath = getArg('--retry', 'artifacts/hospital_legacy_media_target_retry.json')
const extraRetryPath = getArg('--extra-retry', 'artifacts/hospital_legacy_media_target_extra_retry.json')
const dryRun = hasFlag('--dry-run')

const fail = (message) => {
  console.error(message)
  process.exit(1)
}

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
if (!supabaseUrl || !supabaseKey) {
  fail('Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY/SUPABASE_ANON_KEY')
}

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))

const audit = readJson(auditPath)
const verify = readJson(verifyPath)
const retry = readJson(retryPath)
const extraRetry = fs.existsSync(extraRetryPath) ? readJson(extraRetryPath) : { results: [] }

const retryTargetExists = new Map((retry.results || []).map((row) => [row.targetKey, row.target?.exists === true]))
const extraRetryTargetExists = new Map((extraRetry.results || []).map((row) => [row.key, row.exists === true]))
const verifyTargetExists = new Map((verify.checked || []).map((row) => [row.targetKey, row.target?.exists === true]))

const replacements = audit.rows
  .filter((row) => row.source === 'legacy_s3_cloudfront')
  .filter((row) => {
    if (extraRetryTargetExists.has(row.targetKey)) return extraRetryTargetExists.get(row.targetKey)
    if (retryTargetExists.has(row.targetKey)) return retryTargetExists.get(row.targetKey)
    return verifyTargetExists.get(row.targetKey) === true
  })
  .map((row) => ({
    hospitalId: row.hospitalId,
    oldSlug: row.oldSlug,
    newSlug: row.newSlug,
    kind: row.kind,
    oldUrl: row.oldUrl,
    newUrl: row.targetUrl,
  }))

const replacementsByHospital = new Map()
for (const row of replacements) {
  if (!replacementsByHospital.has(row.hospitalId)) replacementsByHospital.set(row.hospitalId, [])
  replacementsByHospital.get(row.hospitalId).push(row)
}

const headers = {
  apikey: supabaseKey,
  authorization: `Bearer ${supabaseKey}`,
  accept: 'application/json',
}

const restFetch = async (table, params, options = {}) => {
  const url = `${supabaseUrl.replace(/\/+$/, '')}/rest/v1/${table}?${new URLSearchParams(params)}`
  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
  })
  if (!response.ok) {
    throw new Error(`${table} ${options.method || 'GET'} failed with ${response.status}: ${await response.text()}`)
  }
  if (response.status === 204) return null
  return response.json()
}

const patchRows = async (table, params, payload) => {
  if (dryRun) return { dryRun: true }
  return restFetch(table, params, {
    method: 'PATCH',
    headers: {
      'content-type': 'application/json',
      prefer: 'return=minimal',
    },
    body: JSON.stringify(payload),
  })
}

const replaceString = (value, replacementsForHospital) => {
  if (typeof value !== 'string') return value
  let next = value
  for (const row of replacementsForHospital) {
    next = next.replaceAll(row.oldUrl, row.newUrl)
  }
  return next
}

const replaceJson = (value, replacementsForHospital) => {
  if (value === null || value === undefined) return value
  return JSON.parse(replaceString(JSON.stringify(value), replacementsForHospital))
}

const changed = (before, after) => JSON.stringify(before) !== JSON.stringify(after)

const output = {
  generatedAt: new Date().toISOString(),
  dryRun,
  replacementCount: replacements.length,
  hospitals: [],
  surgeons: [],
  caseMedia: [],
}

for (const [hospitalId, replacementsForHospital] of replacementsByHospital) {
  const rows = await restFetch('hospitals', {
    id: `eq.${hospitalId}`,
    select: 'id,slug,hero_image_url,gallery,equipment',
    limit: '1',
  })
  const hospital = rows[0]
  if (!hospital) {
    output.hospitals.push({ hospitalId, error: 'missing hospitals row' })
    continue
  }

  const payload = {}
  const nextHero = replaceString(hospital.hero_image_url, replacementsForHospital)
  const nextGallery = replaceJson(hospital.gallery, replacementsForHospital)
  const nextEquipment = replaceJson(hospital.equipment, replacementsForHospital)
  if (nextHero !== hospital.hero_image_url) payload.hero_image_url = nextHero
  if (changed(hospital.gallery, nextGallery)) payload.gallery = nextGallery
  if (changed(hospital.equipment, nextEquipment)) payload.equipment = nextEquipment

  if (Object.keys(payload).length > 0) {
    await patchRows('hospitals', { id: `eq.${hospitalId}` }, payload)
  }
  output.hospitals.push({ hospitalId, slug: hospital.slug, changedFields: Object.keys(payload) })

  const surgeonRows = await restFetch('surgeons', {
    hospital_id: `eq.${hospitalId}`,
    select: 'id,hospital_id,image_url,images',
  })
  for (const surgeon of surgeonRows) {
    const surgeonPayload = {}
    const nextImageUrl = replaceString(surgeon.image_url, replacementsForHospital)
    const nextImages = replaceJson(surgeon.images, replacementsForHospital)
    if (nextImageUrl !== surgeon.image_url) surgeonPayload.image_url = nextImageUrl
    if (changed(surgeon.images, nextImages)) surgeonPayload.images = nextImages
    if (Object.keys(surgeonPayload).length > 0) {
      await patchRows('surgeons', { id: `eq.${surgeon.id}` }, surgeonPayload)
    }
    output.surgeons.push({ id: surgeon.id, hospitalId, changedFields: Object.keys(surgeonPayload) })
  }
}

for (const row of replacements) {
  const matchingRows = await restFetch('case_media', {
    media_url: `eq.${row.oldUrl}`,
    select: 'id,case_id,media_url',
  })
  for (const mediaRow of matchingRows) {
    await patchRows('case_media', { id: `eq.${mediaRow.id}` }, { media_url: row.newUrl })
    output.caseMedia.push({ id: mediaRow.id, caseId: mediaRow.case_id, oldUrl: row.oldUrl, newUrl: row.newUrl })
  }
}

process.stdout.write(`${JSON.stringify(output, null, 2)}\n`)
