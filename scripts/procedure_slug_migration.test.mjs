import assert from 'node:assert/strict';
import http from 'node:http';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';

const run = promisify(execFile);
const scriptPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'procedure_slug_migration.mjs');

const startFakeSupabase = async ({ procedures, englishDetails, failId = null }) => {
  const state = { procedures: structuredClone(procedures), englishDetails: structuredClone(englishDetails) };
  const server = http.createServer(async (request, response) => {
    const url = new URL(request.url, 'http://localhost');
    const send = (status, body) => {
      response.writeHead(status, { 'content-type': 'application/json' });
      response.end(JSON.stringify(body));
    };

    if (request.method === 'GET' && url.pathname === '/rest/v1/v_procedure_detail') {
      return send(200, state.englishDetails);
    }
    if (request.method === 'GET' && url.pathname === '/rest/v1/procedures') {
      return send(200, state.procedures);
    }
    if (request.method === 'POST' && url.pathname === '/rest/v1/procedures') {
      const chunks = [];
      for await (const chunk of request) chunks.push(chunk);
      const updates = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      if (updates.some((entry) => entry.id === failId)) return send(500, { message: 'simulated failure' });
      const updated = updates.map(({ id, slug }) => {
        const procedure = state.procedures.find((entry) => entry.id === id);
        if (!procedure) return null;
        procedure.slug = slug;
        return procedure;
      });
      if (updated.some((entry) => entry === null)) return send(400, { message: 'unknown procedure' });
      return send(200, updated);
    }
    return send(404, { message: 'not found' });
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  return {
    state,
    apiUrl: `http://127.0.0.1:${port}`,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
};

const withTempDir = async (callback) => {
  const directory = mkdtempSync(path.join(os.tmpdir(), 'procedure-slug-migration-'));
  try {
    await callback(directory);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
};

const execute = async (apiUrl, args) => run(process.execPath, [scriptPath, ...args], {
  env: { ...process.env, SUPABASE_URL: apiUrl, SUPABASE_SERVICE_ROLE_KEY: 'test-key' },
});

test('generates a complete report and applies all safe procedure slugs', async () => {
  const fake = await startFakeSupabase({
    procedures: [
      { id: 'one', slug: '中文手术一' },
      { id: 'two', slug: 'aortic-valve-repair' },
    ],
    englishDetails: [
      { id: 'one', name: 'Surgical Aortic Valve Replacement (SAVR)' },
      { id: 'two', name: 'Aortic Valve Repair' },
    ],
  });

  try {
    await withTempDir(async (directory) => {
      const reportPath = path.join(directory, 'candidates.json');
      const resultPath = path.join(directory, 'result.json');
      await execute(fake.apiUrl, ['--out', reportPath]);
      const report = JSON.parse(readFileSync(reportPath, 'utf8'));
      assert.deepEqual(report.summary, {
        totalEnglishDetails: 2,
        totalProcedureRows: 2,
        ready: 1,
        unchanged: 1,
        skipped: 0,
        conflict: 0,
      });
      assert.equal(report.candidates[0].newSlug, 'surgical-aortic-valve-replacement-savr');

      await execute(fake.apiUrl, ['--apply', reportPath, '--out', resultPath]);
      assert.equal(fake.state.procedures[0].slug, 'surgical-aortic-valve-replacement-savr');
      assert.equal(JSON.parse(readFileSync(resultPath, 'utf8')).status, 'applied');
    });
  } finally {
    await fake.close();
  }
});

test('refuses an incomplete migration when an English detail is missing', async () => {
  const fake = await startFakeSupabase({
    procedures: [
      { id: 'one', slug: '中文手术一' },
      { id: 'two', slug: '中文手术二' },
    ],
    englishDetails: [{ id: 'one', name: 'Aortic Valve Repair' }],
  });

  try {
    await withTempDir(async (directory) => {
      const reportPath = path.join(directory, 'candidates.json');
      await execute(fake.apiUrl, ['--out', reportPath]);
      const report = JSON.parse(readFileSync(reportPath, 'utf8'));
      assert.equal(report.summary.skipped, 1);
      await assert.rejects(execute(fake.apiUrl, ['--apply', reportPath]), /skipped or conflicting/);
      assert.equal(fake.state.procedures[0].slug, '中文手术一');
    });
  } finally {
    await fake.close();
  }
});

test('does not write any procedure when the atomic bulk upsert fails', async () => {
  const fake = await startFakeSupabase({
    procedures: [
      { id: 'one', slug: '中文手术一' },
      { id: 'two', slug: '中文手术二' },
    ],
    englishDetails: [
      { id: 'one', name: 'Aortic Valve Repair' },
      { id: 'two', name: 'Heart Valve Replacement' },
    ],
    failId: 'two',
  });

  try {
    await withTempDir(async (directory) => {
      const reportPath = path.join(directory, 'candidates.json');
      const resultPath = path.join(directory, 'result.json');
      await execute(fake.apiUrl, ['--out', reportPath]);
      await assert.rejects(execute(fake.apiUrl, ['--apply', reportPath, '--out', resultPath]), /status not_applied/);
      assert.equal(fake.state.procedures[0].slug, '中文手术一');
      assert.equal(JSON.parse(readFileSync(resultPath, 'utf8')).status, 'not_applied');
    });
  } finally {
    await fake.close();
  }
});
