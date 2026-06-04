#!/usr/bin/env node
import fs from 'node:fs'

const args = process.argv.slice(2)
const getArg = (name, fallback = null) => {
  const index = args.indexOf(name)
  return index >= 0 ? args[index + 1] : fallback
}
const hasFlag = (name) => args.includes(name)

const candidatesPath = getArg('--candidates', 'data/crm_regular_hospital_backfill_candidates.json')
const dryRun = hasFlag('--dry-run')

const fail = (message) => {
  console.error(message)
  process.exit(1)
}

const crmSupabaseUrl = process.env.CRM_SUPABASE_URL
const crmServiceRoleKey = process.env.CRM_SUPABASE_SERVICE_ROLE_KEY
if (!crmSupabaseUrl || !crmServiceRoleKey) {
  fail('Missing CRM_SUPABASE_URL or CRM_SUPABASE_SERVICE_ROLE_KEY')
}

const payload = JSON.parse(fs.readFileSync(candidatesPath, 'utf8'))
const candidates = payload.candidates || []

const headers = {
  apikey: crmServiceRoleKey,
  authorization: `Bearer ${crmServiceRoleKey}`,
  accept: 'application/json',
}

const restFetch = async (table, params, options = {}) => {
  const url = `${crmSupabaseUrl.replace(/\/+$/, '')}/rest/v1/${table}?${new URLSearchParams(params)}`
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

const existing = await restFetch('hospitals', { select: 'id', limit: '2000' })
const existingIds = new Set(existing.map((row) => row.id))

const rows = candidates
  .filter((candidate) => !existingIds.has(candidate.id))
  .map((candidate) => {
    const row = { ...candidate.crmInsert }
    if (row.name_en === row.name) row.name_en = null
    row.updated_at = new Date().toISOString()
    return row
  })

const output = {
  generatedAt: new Date().toISOString(),
  dryRun,
  candidates: candidates.length,
  existing: existingIds.size,
  insertCount: rows.length,
  inserted: [],
}

if (!dryRun && rows.length > 0) {
  const response = await fetch(`${crmSupabaseUrl.replace(/\/+$/, '')}/rest/v1/hospitals`, {
    method: 'POST',
    headers: {
      ...headers,
      'content-type': 'application/json',
      prefer: 'return=representation,resolution=ignore-duplicates',
    },
    body: JSON.stringify(rows),
  })
  if (!response.ok) {
    fail(`hospitals POST failed with ${response.status}: ${await response.text()}`)
  }
  output.inserted = await response.json()
}

process.stdout.write(`${JSON.stringify(output, null, 2)}\n`)
