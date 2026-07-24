#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const reportPath = args[0];
const outIndex = args.indexOf('--out');
const apiIndex = args.indexOf('--content-api');
const resultIndex = args.indexOf('--result');
const outPath = outIndex >= 0 ? args[outIndex + 1] : null;
const contentApiBaseUrl = (apiIndex >= 0 ? args[apiIndex + 1] : 'https://content.medicaltourismchina.health')?.replace(/\/+$/, '');
const resultPath = resultIndex >= 0 ? args[resultIndex + 1] : null;

const fail = (message) => {
  console.error(message);
  process.exit(1);
};

if (!reportPath || !outPath || !contentApiBaseUrl || !resultPath) {
  fail('Usage: node scripts/procedure_slug_migration_verify.mjs <candidate-report.json> --result <applied.json> --out <verification.json> [--content-api <url>]');
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const result = JSON.parse(fs.readFileSync(resultPath, 'utf8'));
const fingerprint = (candidates) => crypto.createHash('sha256').update(JSON.stringify(candidates)).digest('hex');
if (report.reportVersion !== 2 || !Array.isArray(report.candidates) || report.summary?.totalProcedureRows !== report.candidates.length) {
  fail('Expected a procedure slug candidate report version 2');
}
const candidateIds = new Set(report.candidates.map((candidate) => candidate.id));
if (candidateIds.size !== report.candidates.length) {
  fail('Candidate report contains duplicate procedure IDs');
}
if (report.integrity?.candidatesSha256 !== fingerprint(report.candidates)) {
  fail('Candidate report integrity hash does not match its contents');
}
const blocked = report.candidates.filter((candidate) => candidate.status === 'skipped' || candidate.status === 'conflict');
if (blocked.length > 0) {
  fail(`Candidate report still contains ${blocked.length} skipped or conflicting procedure(s)`);
}
const readyCandidates = report.candidates.filter((candidate) => candidate.status === 'ready');
const unchangedCandidates = report.candidates.filter((candidate) => candidate.status === 'unchanged');
if (readyCandidates.length + unchangedCandidates.length !== report.candidates.length || report.summary?.ready !== readyCandidates.length || report.summary?.unchanged !== unchangedCandidates.length) {
  fail('Candidate report summary does not account for every procedure');
}
if (result.reportVersion !== report.reportVersion || !['applied', 'applied_after_transport_error'].includes(result.status) || result.candidatesSha256 !== report.integrity.candidatesSha256) {
  fail('Apply result does not confirm this exact candidate report was fully applied');
}
if (!Array.isArray(result.applied) || result.applied.length !== readyCandidates.length) {
  fail('Apply result does not account for every changed procedure');
}
const appliedById = new Map();
for (const applied of result.applied) {
  if (appliedById.has(applied.id)) fail(`Apply result contains duplicate procedure ID ${applied.id}`);
  appliedById.set(applied.id, applied);
}
for (const candidate of readyCandidates) {
  const applied = appliedById.get(candidate.id);
  if (!applied || applied.oldSlug !== candidate.oldSlug || applied.newSlug !== candidate.newSlug || applied.englishName !== candidate.englishName) {
    fail(`Apply result does not exactly match candidate ${candidate.id}`);
  }
}

const fetchJson = async (url) => {
  try {
    const response = await fetch(url);
    const body = await response.text();
    return {
      status: response.status,
      data: body ? JSON.parse(body) : null,
    };
  } catch (error) {
    return { status: 0, data: null, error: error instanceof Error ? error.message : String(error) };
  }
};

const candidates = report.candidates.filter((candidate) => ['ready', 'unchanged'].includes(candidate.status));
const verifyCandidate = async (candidate) => {
  const url = `${contentApiBaseUrl}/procedures/${encodeURIComponent(candidate.newSlug)}?locale=en`;
  const response = await fetchJson(url);
  const procedure = response.data?.data?.[0] || null;
  const failures = [];
  if (response.status !== 200) failures.push(`content_api_status_${response.status}`);
  if (procedure?.id !== candidate.id) failures.push('procedure_id_mismatch');
  if (procedure?.slug !== candidate.newSlug) failures.push('procedure_slug_mismatch');
  if (procedure?.name !== candidate.englishName) failures.push('procedure_name_mismatch');
  return { id: candidate.id, newSlug: candidate.newSlug, status: response.status, failures };
};

const results = [];
const concurrency = 20;
for (let offset = 0; offset < candidates.length; offset += concurrency) {
  results.push(...await Promise.all(candidates.slice(offset, offset + concurrency).map(verifyCandidate)));
}

const output = {
  verifiedAt: new Date().toISOString(),
  reportPath: path.resolve(reportPath),
  resultPath: path.resolve(resultPath),
  contentApiBaseUrl,
  total: results.length,
  passed: results.filter((result) => result.failures.length === 0).length,
  failed: results.filter((result) => result.failures.length > 0).length,
  results,
};

fs.mkdirSync(path.dirname(path.resolve(outPath)), { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify({ out: path.resolve(outPath), total: output.total, passed: output.passed, failed: output.failed }));
if (output.failed > 0) process.exit(1);
