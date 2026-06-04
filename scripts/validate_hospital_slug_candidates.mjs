#!/usr/bin/env node
import fs from 'node:fs'

const fail = (message) => {
  console.error(message)
  process.exit(1)
}

const isObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const requireString = (entry, key, path) => {
  if (typeof entry?.[key] !== 'string' || !entry[key].trim()) {
    fail(`${path}.${key} must be a non-empty string`)
  }
}

const assertUnique = (values, label) => {
  const seen = new Set()
  for (const value of values) {
    if (seen.has(value)) fail(`${label} contains duplicate value: ${value}`)
    seen.add(value)
  }
}

const file = process.argv[2]
if (!file) fail('Usage: node scripts/validate_hospital_slug_candidates.mjs <candidates.json>')

let parsed
try {
  parsed = JSON.parse(fs.readFileSync(file, 'utf8'))
} catch (error) {
  fail(`Failed to read or parse ${file}: ${error.message}`)
}

if (!isObject(parsed)) fail('Candidate file root must be an object')
if (!Array.isArray(parsed.confirmed)) fail('Candidate file must include confirmed[]')
if (!Array.isArray(parsed.unresolved)) fail('Candidate file must include unresolved[]')

for (const [index, entry] of parsed.confirmed.entries()) {
  const path = `confirmed[${index}]`
  if (!isObject(entry)) fail(`${path} must be an object`)
  for (const key of ['hospitalId', 'oldSlug', 'newSlug', 'nameHint', 'reason']) {
    requireString(entry, key, path)
  }
  if (entry.oldSlug === entry.newSlug) fail(`${path}.oldSlug must not equal newSlug`)
  if (entry.packageSlugSamples !== undefined && !Array.isArray(entry.packageSlugSamples)) {
    fail(`${path}.packageSlugSamples must be an array when present`)
  }
  if (entry.homepageFeatured !== undefined && typeof entry.homepageFeatured !== 'boolean') {
    fail(`${path}.homepageFeatured must be a boolean when present`)
  }
}

for (const [index, entry] of parsed.unresolved.entries()) {
  const path = `unresolved[${index}]`
  if (!isObject(entry)) fail(`${path} must be an object`)
  for (const key of ['nameHint', 'proposedSlug']) {
    requireString(entry, key, path)
  }
}

assertUnique(parsed.confirmed.map((entry) => entry.hospitalId), 'confirmed.hospitalId')
assertUnique(parsed.confirmed.map((entry) => entry.oldSlug), 'confirmed.oldSlug')
assertUnique(parsed.confirmed.map((entry) => entry.newSlug), 'confirmed.newSlug')
assertUnique(parsed.unresolved.map((entry) => entry.proposedSlug), 'unresolved.proposedSlug')

const confirmedNewSlugs = new Set(parsed.confirmed.map((entry) => entry.newSlug))
for (const entry of parsed.unresolved) {
  if (confirmedNewSlugs.has(entry.proposedSlug)) {
    fail(`unresolved.proposedSlug collides with confirmed.newSlug: ${entry.proposedSlug}`)
  }
}

console.log('ok')
