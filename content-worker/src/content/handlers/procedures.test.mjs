import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

process.env.SUPABASE_URL ||= 'https://example.supabase.co'
process.env.SUPABASE_SERVICE_ROLE_KEY ||= 'test-service-role-key'

const { createGetProcedures } = await import('./procedures.mjs')

const completeListRow = {
  id: 'procedure-1',
  slug: 'procedure-one',
  locale: 'en',
  name: 'Procedure One',
  waiting_time: '1 day',
  stay_in_china: '2 days',
  surgery_detailed_description: 'Localized detail',
  when_is_needed: 'When clinically indicated',
  associated_diseases: [],
  primary_disease_id: null,
}

const makeClient = ({ completenessError = null } = {}) => {
  const state = {
    listSelect: null,
    completenessQueries: 0,
  }

  const client = {
    from(table) {
      if (table === 'v_procedure_list') {
        return {
          select(columns) {
            state.listSelect = columns
            const query = {
              eq() {
                return query
              },
              filter() {
                return query
              },
              order() {
                return query
              },
              async range() {
                return {
                  data: [completeListRow],
                  error: null,
                  count: 1,
                }
              },
            }
            return query
          },
        }
      }

      if (table === 'procedure_i18n') {
        state.completenessQueries += 1
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
                    return completenessError
                      ? { data: null, error: completenessError }
                      : {
                          data: [{ procedure_id: completeListRow.id }],
                          error: null,
                        }
                  },
                }
                return query
              },
            }
          },
        }
      }

      throw new Error(`Unexpected table ${table}`)
    },
  }

  return { client, state }
}

const parseBody = (response) => JSON.parse(response.body)

describe('getProcedures SEO completeness mode', () => {
  it('keeps ordinary procedure lists on the original query path', async () => {
    const { client, state } = makeClient()
    const response = await createGetProcedures(client)({
      queryStringParameters: { locale: 'en', limit: '1' },
    })
    const body = parseBody(response)

    assert.equal(response.statusCode, 200)
    assert.equal(state.listSelect, '*')
    assert.equal(state.completenessQueries, 0)
    assert.equal(
      Object.hasOwn(body.data[0], 'content_complete'),
      false,
    )
  })

  it('returns boolean completeness only for successful SEO lists', async () => {
    const { client, state } = makeClient()
    const response = await createGetProcedures(client)({
      queryStringParameters: { locale: 'en', seo: '1', limit: '1' },
    })
    const body = parseBody(response)

    assert.equal(response.statusCode, 200)
    assert.match(state.listSelect, /^id,slug,locale,name,/)
    assert.equal(state.completenessQueries, 1)
    assert.equal(body.data[0].content_complete, true)
  })

  it('returns HTTP 500 when SEO completeness cannot be verified', async () => {
    const { client, state } = makeClient({
      completenessError: new Error('database unavailable'),
    })
    const response = await createGetProcedures(client)({
      queryStringParameters: { locale: 'en', seo: '1', limit: '1' },
    })
    const body = parseBody(response)

    assert.equal(response.statusCode, 500)
    assert.equal(state.completenessQueries, 1)
    assert.equal(
      body.error,
      'Unable to verify procedure content completeness',
    )
  })
})
