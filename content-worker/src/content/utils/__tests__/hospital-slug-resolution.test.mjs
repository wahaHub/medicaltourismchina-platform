import assert from 'node:assert/strict'
import test from 'node:test'
import { appendQueryString, createHospitalSlugResolver } from '../hospital-slug-resolution.mjs'

class FakeQuery {
  constructor(result) {
    this.result = result
  }

  select() {
    return this
  }

  eq() {
    return this
  }

  single() {
    return Promise.resolve(this.result)
  }
}

const makeSupa = (results) => ({
  from(table) {
    const result = results[table]?.shift?.() || { data: null, error: { code: 'PGRST116' } }
    return new FakeQuery(result)
  },
})

test('resolves canonical slugs directly from hospital details', async () => {
  const resolve = createHospitalSlugResolver({
    supa: makeSupa({
      v_hospital_details: [{ data: { id: 'hospital-1', slug: 'canonical' }, error: null }],
    }),
  })

  assert.deepEqual(await resolve('canonical', 'zh'), {
    type: 'canonical',
    slug: 'canonical',
    hospitalId: 'hospital-1',
  })
})

test('resolves old aliases through current hospitals.slug instead of stale new_slug', async () => {
  const resolve = createHospitalSlugResolver({
    supa: makeSupa({
      v_hospital_details: [{ data: null, error: { code: 'PGRST116' } }],
      hospital_slug_aliases: [{
        data: {
          hospital_id: 'hospital-1',
          old_slug: 'old-slug',
          new_slug: 'stale-new-slug',
          redirect_status: 301,
        },
        error: null,
      }],
      hospitals: [{ data: { id: 'hospital-1', slug: 'current-new-slug' }, error: null }],
    }),
  })

  assert.deepEqual(await resolve('old-slug', 'zh'), {
    type: 'redirect',
    fromSlug: 'old-slug',
    toSlug: 'current-new-slug',
    status: 301,
    hospitalId: 'hospital-1',
  })
})

test('returns not_found for unknown slugs', async () => {
  const resolve = createHospitalSlugResolver({
    supa: makeSupa({
      v_hospital_details: [{ data: null, error: { code: 'PGRST116' } }],
      hospital_slug_aliases: [{ data: null, error: { code: 'PGRST116' } }],
    }),
  })

  assert.deepEqual(await resolve('missing', 'zh'), { type: 'not_found' })
})

test('returns not_found for self aliases', async () => {
  const resolve = createHospitalSlugResolver({
    supa: makeSupa({
      v_hospital_details: [{ data: null, error: { code: 'PGRST116' } }],
      hospital_slug_aliases: [{
        data: {
          hospital_id: 'hospital-1',
          old_slug: 'same-slug',
          new_slug: 'same-slug',
          redirect_status: 301,
        },
        error: null,
      }],
      hospitals: [{ data: { id: 'hospital-1', slug: 'same-slug' }, error: null }],
    }),
  })

  assert.deepEqual(await resolve('same-slug', 'zh'), { type: 'not_found' })
})

test('preserves raw query strings when building redirect locations', () => {
  assert.equal(
    appendQueryString('/hospitals/canonical', { rawQueryString: 'locale=en&x=1' }),
    '/hospitals/canonical?locale=en&x=1',
  )
})

test('serializes queryStringParameters when rawQueryString is unavailable', () => {
  assert.equal(
    appendQueryString('/hospitals/canonical', { queryStringParameters: { locale: 'en' } }),
    '/hospitals/canonical?locale=en',
  )
})
