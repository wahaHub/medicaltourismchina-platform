#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const REPORT_VERSION = 2;
const PAGE_SIZE = 1000;
const args = process.argv.slice(2);
const applyIndex = args.indexOf('--apply');
const outIndex = args.indexOf('--out');
const overridesIndex = args.indexOf('--overrides');

const fail = (message) => {
  console.error(message);
  process.exit(1);
};

const inputPath = applyIndex >= 0 ? args[applyIndex + 1] : null;
const outPath = outIndex >= 0 ? args[outIndex + 1] : null;
const overridesPath = overridesIndex >= 0 ? args[overridesIndex + 1] : null;

if (applyIndex >= 0 && !inputPath) {
  fail('Usage: node scripts/procedure_slug_migration.mjs --apply <candidate-report.json> --overrides <slug-overrides.json> [--out <result.json>]');
}

if (applyIndex < 0 && !outPath) {
  fail('Usage: node scripts/procedure_slug_migration.mjs --out <candidate-report.json> [--overrides <slug-overrides.json>]');
}

if (overridesIndex >= 0 && !overridesPath) {
  fail('Expected a file path after --overrides');
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

const candidateFingerprint = (candidates) => crypto
  .createHash('sha256')
  .update(JSON.stringify(candidates))
  .digest('hex');

const request = async (table, { method = 'GET', params = {}, body, headers = {} } = {}) => {
  const url = new URL(`${apiBase}/rest/v1/${table}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

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

  if (!response.ok) {
    throw new Error(`${method} ${table} failed with ${response.status}: ${text.slice(0, 500)}`);
  }

  return payload;
};

const getAll = async (table, params) => {
  const rows = [];

  for (let offset = 0; ; offset += PAGE_SIZE) {
    const batch = await request(table, {
      params,
      headers: { Range: `${offset}-${offset + PAGE_SIZE - 1}` },
    });

    if (!Array.isArray(batch)) {
      throw new Error(`${table} returned a non-array response`);
    }

    rows.push(...batch);
    if (batch.length < PAGE_SIZE) return rows;
  }
};

const slugifyEnglishName = (name) => String(name ?? '')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[µμ]/g, ' micro ')
  .replace(/β/gi, 'beta')
  .replace(/α/gi, 'alpha')
  .replace(/γ/gi, 'gamma')
  .replace(/δ/gi, 'delta')
  .replace(/&/g, ' and ')
  .replace(/\+/g, ' plus ')
  .replace(/[’'`]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const readSlugOverrides = (filePath) => {
  if (!filePath) return new Map();
  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (parsed?.version !== 1 || !Array.isArray(parsed.slugOverrides)) {
    fail('Expected a slug override file with version 1 and a slugOverrides array');
  }

  const overrides = new Map();
  for (const entry of parsed.slugOverrides) {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(entry?.id || '') || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.slug || '')) {
      fail('Every slug override needs a UUID id and a lowercase ASCII slug');
    }
    if (overrides.has(entry.id)) fail(`Duplicate slug override for ${entry.id}`);
    overrides.set(entry.id, entry.slug);
  }
  return overrides;
};

const buildReport = async (slugOverrides) => {
  const [englishDetails, procedures] = await Promise.all([
    getAll('v_procedure_detail', {
      select: 'id,name',
      locale: 'eq.en',
      order: 'id.asc',
    }),
    getAll('procedures', {
      select: 'id,slug',
      order: 'id.asc',
    }),
  ]);

  const englishDetailsById = new Map();
  for (const detail of englishDetails) {
    const details = englishDetailsById.get(detail.id) || [];
    details.push(detail);
    englishDetailsById.set(detail.id, details);
  }

  const slugOwners = new Map();
  for (const procedure of procedures) {
    if (procedure.slug) slugOwners.set(procedure.slug, procedure.id);
  }

  const candidates = procedures.map((procedure) => {
    const matchingDetails = englishDetailsById.get(procedure.id) || [];
    const englishNames = [...new Set(matchingDetails.map((detail) => detail.name?.trim()).filter(Boolean))];
    const englishName = englishNames.length === 1 ? englishNames[0] : null;
    const generatedSlug = slugifyEnglishName(englishName);
    const newSlug = slugOverrides.get(procedure.id) || generatedSlug;
    const candidate = {
      id: procedure.id,
      englishName,
      oldSlug: procedure.slug || null,
      newSlug: newSlug || null,
      status: 'ready',
      reasons: [],
    };

    if (matchingDetails.length === 0) {
      candidate.status = 'skipped';
      candidate.reasons.push('english_detail_missing');
    } else if (englishNames.length !== 1) {
      candidate.status = 'skipped';
      candidate.reasons.push(englishNames.length === 0 ? 'english_name_missing' : 'multiple_english_names');
    }
    if (!generatedSlug) {
      candidate.status = 'skipped';
      candidate.reasons.push('generated_slug_empty');
    }
    if (!candidate.oldSlug) {
      candidate.status = 'skipped';
      candidate.reasons.push('current_slug_missing');
    }
    if (candidate.status === 'ready' && candidate.oldSlug === candidate.newSlug) {
      candidate.status = 'unchanged';
    }

    return candidate;
  });

  const targetGroups = new Map();
  for (const candidate of candidates) {
    if (!candidate.newSlug || candidate.status === 'skipped') continue;
    const group = targetGroups.get(candidate.newSlug) || [];
    group.push(candidate);
    targetGroups.set(candidate.newSlug, group);
  }

  for (const group of targetGroups.values()) {
    if (group.length < 2) continue;
    for (const candidate of group) {
      if (candidate.status === 'ready') candidate.status = 'conflict';
      candidate.reasons.push('duplicate_generated_slug');
    }
  }

  for (const candidate of candidates) {
    if (candidate.status !== 'ready') continue;
    const ownerId = slugOwners.get(candidate.newSlug);
    if (ownerId && ownerId !== candidate.id) {
      candidate.status = 'conflict';
      candidate.reasons.push(`target_slug_already_used_by:${ownerId}`);
    }
  }

  const summary = candidates.reduce((counts, candidate) => {
    counts[candidate.status] = (counts[candidate.status] || 0) + 1;
    return counts;
  }, { ready: 0, unchanged: 0, skipped: 0, conflict: 0 });

  return {
    reportVersion: REPORT_VERSION,
    generatedAt: new Date().toISOString(),
    source: {
      detailView: 'v_procedure_detail',
      locale: 'en',
      procedureTable: 'procedures',
      slugOverrideCount: slugOverrides.size,
    },
    summary: {
      totalEnglishDetails: englishDetails.length,
      totalProcedureRows: procedures.length,
      ...summary,
    },
    candidates,
    integrity: { candidatesSha256: candidateFingerprint(candidates) },
  };
};

const validateReport = (report) => {
  if (!report || report.reportVersion !== REPORT_VERSION || !Array.isArray(report.candidates)) {
    fail(`Refusing to apply: expected procedure slug report version ${REPORT_VERSION}`);
  }
  if (report.integrity?.candidatesSha256 !== candidateFingerprint(report.candidates)) {
    fail('Refusing to apply: candidate report integrity hash does not match its contents');
  }
  if (report.summary?.totalProcedureRows !== report.candidates.length) {
    fail('Refusing to apply: candidate report does not account for every procedures row');
  }

  const blocked = report.candidates.filter((candidate) => candidate.status === 'skipped' || candidate.status === 'conflict');
  if (blocked.length > 0) {
    fail(`Refusing to apply: candidate report contains ${blocked.length} skipped or conflicting procedure(s)`);
  }
};

const reconcileLiveSlugs = async (candidates) => {
  const procedures = await getAll('procedures', {
    select: 'id,slug',
    order: 'id.asc',
  });
  const slugById = new Map(procedures.map((procedure) => [procedure.id, procedure.slug]));
  const states = candidates.map((candidate) => ({
    id: candidate.id,
    expectedOldSlug: candidate.oldSlug,
    expectedNewSlug: candidate.newSlug,
    actualSlug: slugById.get(candidate.id) || null,
  }));
  const allNew = states.every((state) => state.actualSlug === state.expectedNewSlug);
  const allOld = states.every((state) => state.actualSlug === state.expectedOldSlug);
  return { allNew, allOld, states };
};

const applyCandidatesAtomically = async (candidates) => {
  // A PostgREST bulk upsert is a single PostgreSQL statement and therefore atomic.
  const updated = await request('procedures', {
    method: 'POST',
    params: {
      on_conflict: 'id',
      select: 'id,slug',
    },
    body: candidates.map((candidate) => ({ id: candidate.id, slug: candidate.newSlug })),
    headers: {
      'content-type': 'application/json',
      Prefer: 'resolution=merge-duplicates,missing=default,return=representation',
    },
  });

  if (!Array.isArray(updated) || updated.length !== candidates.length) {
    throw new Error(`Atomic bulk upsert returned ${Array.isArray(updated) ? updated.length : 'a non-array'} result for ${candidates.length} procedure(s)`);
  }

  const updatedSlugById = new Map(updated.map((procedure) => [procedure.id, procedure.slug]));
  for (const candidate of candidates) {
    if (updatedSlugById.get(candidate.id) !== candidate.newSlug) {
      throw new Error(`Atomic bulk upsert returned an unexpected slug for ${candidate.id}`);
    }
  }
};

const applyReport = async (report, resultPath, slugOverrides) => {
  validateReport(report);

  // Rebuild from the live English view so a stale or hand-edited report cannot be applied.
  const liveReport = await buildReport(slugOverrides);
  if (liveReport.integrity.candidatesSha256 !== report.integrity.candidatesSha256) {
    fail('Refusing to apply: live procedure or English-detail data changed since the candidate report was generated');
  }
  validateReport(liveReport);

  const candidates = report.candidates.filter((candidate) => candidate.status === 'ready');
  const result = {
    reportVersion: REPORT_VERSION,
    status: 'in_progress',
    startedAt: new Date().toISOString(),
    inputGeneratedAt: report.generatedAt || null,
    candidatesSha256: report.integrity.candidatesSha256,
    applied: [],
  };
  writeJson(resultPath, result);

  try {
    await applyCandidatesAtomically(candidates);
    result.applied = candidates.map((candidate) => ({
      id: candidate.id,
      oldSlug: candidate.oldSlug,
      newSlug: candidate.newSlug,
      englishName: candidate.englishName,
    }));
    result.status = 'applied';
    result.finishedAt = new Date().toISOString();
    writeJson(resultPath, result);
    return result;
  } catch (error) {
    result.error = error instanceof Error ? error.message : String(error);
    const reconciliation = await reconcileLiveSlugs(candidates);
    result.reconciliation = reconciliation;
    if (reconciliation.allNew) {
      result.status = 'applied_after_transport_error';
      result.applied = candidates.map((candidate) => ({
        id: candidate.id,
        oldSlug: candidate.oldSlug,
        newSlug: candidate.newSlug,
        englishName: candidate.englishName,
      }));
    } else if (reconciliation.allOld) {
      result.status = 'not_applied';
    } else {
      result.status = 'unexpected_partial_state';
    }
    result.finishedAt = new Date().toISOString();
    writeJson(resultPath, result);
    throw new Error(`Procedure slug migration failed; result written to ${resultPath} with status ${result.status}: ${result.error}`);
  }
};

if (applyIndex < 0) {
  const report = await buildReport(readSlugOverrides(overridesPath));
  writeJson(outPath, report);
  console.log(JSON.stringify({ out: path.resolve(outPath), summary: report.summary }));
} else {
  const report = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const resultPath = outPath || `${inputPath.replace(/\.json$/i, '')}.applied.json`;
  const result = await applyReport(report, resultPath, readSlugOverrides(overridesPath));
  console.log(JSON.stringify({ out: path.resolve(resultPath), appliedCount: result.applied.length, status: result.status }));
}
