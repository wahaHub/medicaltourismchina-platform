import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  PROCEDURE_DETAIL_CONTENT_FIELDS,
  PROCEDURE_DETAIL_LOCALE_SELECT,
  QUARANTINED_PROCEDURE_IDS,
  fetchAvailableProcedureLocales,
  fetchCompleteProcedureIds,
  fetchProcedureListCompleteness,
  getCompleteProcedureIds,
  getCompleteProcedureLocales,
  hasCompleteProcedureLocaleContent,
} from './procedure-locales.mjs'

const completeProcedure = (locale, overrides = {}) => ({
  id: 'procedure-1',
  procedure_id: 'procedure-1',
  locale,
  name: `${locale}-name`,
  ...Object.fromEntries(
    PROCEDURE_DETAIL_CONTENT_FIELDS.map((field) => [
      field,
      `${locale}-${field}`,
    ]),
  ),
  ...overrides,
})

describe('procedure list completeness', () => {
  it('skips the completeness query outside SEO mode', async () => {
    const result = await fetchProcedureListCompleteness({
      client: {
        from() {
          throw new Error('ordinary procedure lists must not query completeness')
        },
      },
      procedureIds: ['procedure-1'],
      locale: 'en',
      seoMode: false,
    })

    assert.equal(result.enabled, false)
    assert.deepEqual([...result.procedureIds], [])
    assert.equal(result.error, null)
  })

  it('preserves SEO completeness query failures for the handler', async () => {
    const queryError = new Error('database unavailable')
    const client = {
      from() {
        return {
          select() {
            return {
              in() {
                const query = {
                  not() {
                    return query
                  },
                  neq() {
                    return query
                  },
                  async eq() {
                    return { data: null, error: queryError }
                  },
                }
                return query
              },
            }
          },
        }
      },
    }

    const result = await fetchProcedureListCompleteness({
      client,
      procedureIds: ['procedure-1'],
      locale: 'en',
      seoMode: true,
    })

    assert.equal(result.enabled, true)
    assert.deepEqual([...result.procedureIds], [])
    assert.equal(result.error, queryError)
  })

  it('excludes quarantined IDs before querying completeness', async () => {
    const quarantinedId = [...QUARANTINED_PROCEDURE_IDS][0]
    let queriedIds = null
    const client = {
      from() {
        return {
          select() {
            return {
              in(_field, values) {
                queriedIds = values
                const query = {
                  not() {
                    return query
                  },
                  neq() {
                    return query
                  },
                  async eq() {
                    return {
                      data: [{ procedure_id: 'procedure-1' }],
                      error: null,
                    }
                  },
                }
                return query
              },
            }
          },
        }
      },
    }

    const result = await fetchCompleteProcedureIds({
      client,
      procedureIds: [quarantinedId, 'procedure-1'],
      locale: 'en',
    })

    assert.deepEqual(queriedIds, ['procedure-1'])
    assert.deepEqual([...result.procedureIds], ['procedure-1'])
  })

  it('returns only IDs whose names and all detail fields are complete', () => {
    assert.deepEqual(
      [...getCompleteProcedureIds([
        completeProcedure('en'),
        completeProcedure('ru', {
          procedure_id: 'procedure-2',
          recovery_process: null,
        }),
      ])],
      ['procedure-1'],
    )
  })

  it('loads a page of target rows in one query and fails closed on errors', async () => {
    const calls = []
    const client = {
      from(table) {
        const call = { table }
        calls.push(call)
        return {
          select(columns) {
            call.columns = columns
            return {
              in(field, values) {
                call.in = { field, values }
                const query = {
                  not(filterField, operator, value) {
                    call.filters ??= []
                    call.filters.push({
                      kind: 'not',
                      field: filterField,
                      operator,
                      value,
                    })
                    return query
                  },
                  neq(filterField, value) {
                    call.filters ??= []
                    call.filters.push({
                      kind: 'neq',
                      field: filterField,
                      value,
                    })
                    return query
                  },
                  async eq(eqField, value) {
                    call.eq = { field: eqField, value }
                    return {
                      data: [{ procedure_id: 'procedure-1' }],
                      error: null,
                    }
                  },
                }
                return query
              },
            }
          },
        }
      },
    }

    const result = await fetchCompleteProcedureIds({
      client,
      procedureIds: ['procedure-1', 'procedure-2', 'procedure-1'],
      locale: 'ru-RU',
    })

    assert.deepEqual([...result.procedureIds], ['procedure-1'])
    assert.equal(result.error, null)
    assert.equal(calls.length, 1)
    assert.deepEqual(calls[0].in, {
      field: 'procedure_id',
      values: ['procedure-1', 'procedure-2'],
    })
    assert.deepEqual(calls[0].eq, { field: 'locale', value: 'ru' })

    const queryError = new Error('database unavailable')
    const failingClient = {
      from() {
        return {
          select() {
            return {
              in() {
                const query = {
                  not() {
                    return query
                  },
                  neq() {
                    return query
                  },
                  async eq() {
                    return { data: null, error: queryError }
                  },
                }
                return query
              },
            }
          },
        }
      },
    }
    const failed = await fetchCompleteProcedureIds({
      client: failingClient,
      procedureIds: ['procedure-1'],
      locale: 'ru',
    })
    assert.deepEqual([...failed.procedureIds], [])
    assert.equal(failed.error, queryError)
  })
})

describe('procedure locale completeness', () => {
  it('requires every translated detail field, not merely a localized name', () => {
    const incomplete = completeProcedure('ru', {
      name: 'Локализованное название',
      recovery_steps: '',
    })

    assert.equal(hasCompleteProcedureLocaleContent(incomplete), false)
    assert.deepEqual(
      getCompleteProcedureLocales([completeProcedure('en'), incomplete]),
      ['en'],
    )
  })

  it('also requires a localized procedure name', () => {
    assert.equal(
      hasCompleteProcedureLocaleContent(
        completeProcedure('ru', { name: '   ' }),
      ),
      false,
    )
  })

  it('rejects whitespace, empty arrays, and empty objects', () => {
    assert.equal(
      hasCompleteProcedureLocaleContent(
        completeProcedure('ru', { waiting_time: '   ' }),
      ),
      false,
    )
    assert.equal(
      hasCompleteProcedureLocaleContent(
        completeProcedure('ar', { faqs: [] }),
      ),
      false,
    )
    assert.equal(
      hasCompleteProcedureLocaleContent(
        completeProcedure('id', { surgery_steps: {} }),
      ),
      false,
    )
  })

  it('normalizes and de-duplicates complete locales in site order', () => {
    assert.deepEqual(
      getCompleteProcedureLocales([
        completeProcedure('ru'),
        completeProcedure('zh-CN'),
        completeProcedure('en-US'),
        completeProcedure('ru-RU'),
      ]),
      ['en', 'zh', 'ru'],
    )
  })
})

describe('fetchAvailableProcedureLocales', () => {
  it('returns no locales for a quarantined procedure without querying', async () => {
    const quarantinedId = [...QUARANTINED_PROCEDURE_IDS][0]
    const result = await fetchAvailableProcedureLocales({
      client: {
        from() {
          throw new Error('quarantined procedure must not query locales')
        },
      },
      procedure: completeProcedure('en', { id: quarantinedId }),
    })

    assert.deepEqual(result, { locales: [], error: null })
  })

  it('loads all locale rows with exactly one additional query', async () => {
    const calls = []
    const client = {
      from(table) {
        const call = { table }
        calls.push(call)
        return {
          select(columns) {
            call.columns = columns
            return {
              async eq(field, value) {
                call.eq = { field, value }
                return {
                  data: [
                    completeProcedure('en'),
                    completeProcedure('ru'),
                    completeProcedure('ar', { recovery_steps: '' }),
                  ],
                  error: null,
                }
              },
            }
          },
        }
      },
    }

    const result = await fetchAvailableProcedureLocales({
      client,
      procedure: completeProcedure('en'),
    })

    assert.deepEqual(result, { locales: ['en', 'ru'], error: null })
    assert.deepEqual(calls, [
      {
        table: 'v_procedure_detail',
        columns: PROCEDURE_DETAIL_LOCALE_SELECT,
        eq: { field: 'id', value: 'procedure-1' },
      },
    ])
  })

  it('fails closed to the complete resolved row when the locale query fails', async () => {
    const queryError = new Error('database unavailable')
    const client = {
      from() {
        return {
          select() {
            return {
              async eq() {
                return { data: null, error: queryError }
              },
            }
          },
        }
      },
    }

    const completeResult = await fetchAvailableProcedureLocales({
      client,
      procedure: completeProcedure('en'),
    })
    const incompleteResult = await fetchAvailableProcedureLocales({
      client,
      procedure: completeProcedure('ru', { surgery_options: null }),
    })

    assert.deepEqual(completeResult, {
      locales: ['en'],
      error: queryError,
    })
    assert.deepEqual(incompleteResult, {
      locales: [],
      error: queryError,
    })
  })
})
