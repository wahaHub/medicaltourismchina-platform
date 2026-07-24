#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const inputPath = args[0];
const outIndex = args.indexOf('--out');
const outPath = outIndex >= 0 ? args[outIndex + 1] : null;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const fail = (message) => {
  console.error(message);
  process.exit(1);
};

if (!inputPath || !outPath) {
  fail('Usage: node scripts/procedure_english_title_seed.mjs <titles.json> --out <result.json>');
}

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) {
  fail('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const apiBase = supabaseUrl.replace(/\/+$/, '');
const writeJson = (filePath, data) => {
  fs.mkdirSync(path.dirname(path.resolve(filePath)), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
};

const request = async (table, { method = 'GET', params = {}, body, headers = {} } = {}) => {
  const url = new URL(`${apiBase}/rest/v1/${table}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  const response = await fetch(url, {
    method,
    headers: {
      apikey: serviceRoleKey,
      authorization: `Bearer ${serviceRoleKey}`,
      accept: 'application/json',
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  let payload = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      throw new Error(`${method} ${table} returned invalid JSON with ${response.status}: ${text.slice(0, 500)}`);
    }
  }
  if (!response.ok) throw new Error(`${method} ${table} failed with ${response.status}: ${text.slice(0, 500)}`);
  return payload;
};

const getAllEnglishTitles = async () => {
  const rows = [];
  for (let offset = 0; ; offset += 1000) {
    const batch = await request('procedure_i18n', {
      params: {
        locale: 'eq.en',
        select: 'procedure_id,locale,name',
        order: 'procedure_id.asc',
      },
      headers: { Range: `${offset}-${offset + 999}` },
    });
    if (!Array.isArray(batch)) throw new Error('procedure_i18n returned a non-array response');
    rows.push(...batch);
    if (batch.length < 1000) return rows;
  }
};

const input = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
if (input?.version !== 1 || !Array.isArray(input.titles) || input.titles.length === 0) {
  fail('Expected a version 1 title file with a non-empty titles array');
}

const ids = new Set();
for (const entry of input.titles) {
  if (!UUID_PATTERN.test(entry?.id || '') || !entry.englishName?.trim()) {
    fail('Every title needs a UUID id and a non-empty englishName');
  }
  if (ids.has(entry.id)) fail(`Duplicate title entry for ${entry.id}`);
  ids.add(entry.id);
}

const liveEnglish = await getAllEnglishTitles();
const existing = liveEnglish.filter((row) => ids.has(row.procedure_id));
if (existing.length > 0) {
  fail(`Refusing to seed: ${existing.length} target procedure(s) already have an English title`);
}

const result = {
  status: 'in_progress',
  startedAt: new Date().toISOString(),
  source: path.resolve(inputPath),
  requestedCount: input.titles.length,
};
writeJson(outPath, result);

try {
  // One INSERT statement: if any row is invalid or races with another writer, PostgreSQL writes none.
  const inserted = await request('procedure_i18n', {
    method: 'POST',
    params: { select: 'procedure_id,locale,name' },
    body: input.titles.map((entry) => ({ procedure_id: entry.id, locale: 'en', name: entry.englishName })),
    headers: {
      'content-type': 'application/json',
      Prefer: 'return=representation',
    },
  });
  if (!Array.isArray(inserted) || inserted.length !== input.titles.length) {
    throw new Error(`Atomic title insert returned ${Array.isArray(inserted) ? inserted.length : 'a non-array'} result for ${input.titles.length} title(s)`);
  }
  const insertedById = new Map(inserted.map((entry) => [entry.procedure_id, entry.name]));
  for (const entry of input.titles) {
    if (insertedById.get(entry.id) !== entry.englishName) {
      throw new Error(`Atomic title insert returned an unexpected name for ${entry.id}`);
    }
  }
  result.status = 'applied';
  result.inserted = input.titles.map(({ id, englishName }) => ({ id, englishName }));
} catch (error) {
  const current = await getAllEnglishTitles();
  const namesById = new Map(current.map((entry) => [entry.procedure_id, entry.name]));
  const allInserted = input.titles.every((entry) => namesById.get(entry.id) === entry.englishName);
  const noneInserted = input.titles.every((entry) => !namesById.has(entry.id));
  result.status = allInserted ? 'applied_after_transport_error' : noneInserted ? 'not_applied' : 'unexpected_partial_state';
  result.error = error instanceof Error ? error.message : String(error);
}

result.finishedAt = new Date().toISOString();
writeJson(outPath, result);
console.log(JSON.stringify({ out: path.resolve(outPath), status: result.status, requestedCount: result.requestedCount }));
if (!['applied', 'applied_after_transport_error'].includes(result.status)) process.exit(1);
