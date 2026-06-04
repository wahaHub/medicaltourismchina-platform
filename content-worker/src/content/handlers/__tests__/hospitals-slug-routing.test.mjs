import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

process.env.SUPABASE_URL ||= 'https://example.supabase.co'
process.env.SUPABASE_SERVICE_ROLE_KEY ||= 'test-service-role-key'

const { buildHospitalSlugRedirectResponse } = await import('../hospitals.mjs')

const redirectResolution = {
  type: 'redirect',
  fromSlug: 'old-slug',
  toSlug: 'canonical-slug',
  status: 301,
  hospitalId: 'hospital-1',
}

test('builds detail redirects with query string preservation', () => {
  const response = buildHospitalSlugRedirectResponse(
    { rawQueryString: 'locale=en' },
    redirectResolution,
  )

  assert.equal(response.statusCode, 301)
  assert.equal(response.headers.Location, '/hospitals/canonical-slug?locale=en')
})

test('builds extended redirects without changing endpoint shape', () => {
  const response = buildHospitalSlugRedirectResponse(
    { rawQueryString: 'locale=en' },
    redirectResolution,
    '/extended',
  )

  assert.equal(response.statusCode, 301)
  assert.equal(response.headers.Location, '/hospitals/canonical-slug/extended?locale=en')
})

test('builds package redirects with query string preservation', () => {
  const response = buildHospitalSlugRedirectResponse(
    { rawQueryString: 'locale=en' },
    redirectResolution,
    '/packages/pkg-a',
  )

  assert.equal(response.statusCode, 301)
  assert.equal(response.headers.Location, '/hospitals/canonical-slug/packages/pkg-a?locale=en')
})

test('does not build redirects for canonical resolutions', () => {
  assert.equal(
    buildHospitalSlugRedirectResponse({}, { type: 'canonical', slug: 'canonical-slug' }),
    null,
  )
})

test('routes slug-resolution before generic hospital detail routes', () => {
  const currentFile = fileURLToPath(import.meta.url)
  const routerPath = path.resolve(path.dirname(currentFile), '../../../router.mjs')
  const routerSource = fs.readFileSync(routerPath, 'utf8')

  const slugResolutionIndex = routerSource.indexOf('getHospitalSlugResolution(event)')
  const detailIndex = routerSource.indexOf('getHospitalBySlug(event)')

  assert.ok(slugResolutionIndex > 0)
  assert.ok(detailIndex > slugResolutionIndex)
})
