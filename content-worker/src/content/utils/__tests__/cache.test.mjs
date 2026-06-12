import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  isPublicCacheableRequest,
  withPublicCache,
} from '../cache.mjs'

const eventFor = (path, headers = {}, rawQueryString = 'locale=zh') => ({
  rawPath: path,
  rawQueryString,
  queryStringParameters: rawQueryString ? Object.fromEntries(new URLSearchParams(rawQueryString)) : {},
  requestContext: { http: { method: 'GET' } },
  headers,
})

describe('worker public content cache policy', () => {
  it('allows only audited public GET routes with explicit locale', () => {
    assert.equal(isPublicCacheableRequest(eventFor('/departments')), true)
    assert.equal(isPublicCacheableRequest(eventFor('/departments/oncology/capability')), true)
    assert.equal(isPublicCacheableRequest(eventFor('/departments/oncology/diseases')), true)
    assert.equal(isPublicCacheableRequest(eventFor('/diseases/lung-cancer/procedures')), true)
    assert.equal(isPublicCacheableRequest(eventFor('/procedures')), true)
    assert.equal(isPublicCacheableRequest(eventFor('/procedures/sbrt')), true)
    assert.equal(isPublicCacheableRequest(eventFor('/featured-treatments')), true)
    assert.equal(isPublicCacheableRequest(eventFor('/featured-treatments/type/cancer')), true)
    assert.equal(isPublicCacheableRequest(eventFor('/featured-treatments/proton-therapy')), true)

    assert.equal(isPublicCacheableRequest(eventFor('/hospitals')), false)
    assert.equal(isPublicCacheableRequest(eventFor('/hospitals/shanghai-hospital')), false)
    assert.equal(isPublicCacheableRequest(eventFor('/hospitals/shanghai-hospital/extended')), false)
    assert.equal(isPublicCacheableRequest(eventFor('/hospitals/shanghai-hospital/packages/pkg-1')), false)
  })

  it('rejects requests with auth, cookie, or Accept-Language-only locale state', () => {
    assert.equal(isPublicCacheableRequest(eventFor('/departments', { Authorization: 'Bearer token' })), false)
    assert.equal(isPublicCacheableRequest(eventFor('/departments', { cookie: 'session=abc' })), false)
    assert.equal(isPublicCacheableRequest(eventFor('/departments', { 'Accept-Language': 'zh-CN,zh;q=0.9' }, '')), false)
  })

  it('adds cache headers only to successful allowlisted responses', () => {
    const response = { statusCode: 200, headers: { 'content-type': 'application/json' }, body: '{}' }
    const cached = withPublicCache(response, eventFor('/procedures'))

    assert.equal(cached.headers['Cache-Control'], 'public, max-age=60, s-maxage=600, stale-while-revalidate=86400')
    assert.equal(cached.headers.Vary, 'Origin, Accept-Encoding')

    const notFound = withPublicCache({ ...response, statusCode: 404 }, eventFor('/procedures'))
    assert.equal(notFound.headers['Cache-Control'], undefined)
  })
})
