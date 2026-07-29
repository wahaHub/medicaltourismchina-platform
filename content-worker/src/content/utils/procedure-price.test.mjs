import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { parseProcedurePrice } from './procedure-price.mjs'

describe('parseProcedurePrice', () => {
  it('normalizes the legacy USD display string without losing its source amount', () => {
    assert.deepEqual(parseProcedurePrice('Approx. $5,400'), {
      display: 'Approx. $5,400',
      amount: 5400,
      minAmount: 5400,
      maxAmount: 5400,
      currency: 'USD',
    })
  })

  it('detects CNY instead of trusting the legacy cost_usd field name', () => {
    assert.deepEqual(parseProcedurePrice('CNY 89,900'), {
      display: 'CNY 89,900',
      amount: 89900,
      minAmount: 89900,
      maxAmount: 89900,
      currency: 'CNY',
    })
  })

  it('keeps a source range and defaults an unlabelled legacy number to USD', () => {
    assert.deepEqual(parseProcedurePrice('4,000 - 5,500'), {
      display: '4,000 - 5,500',
      amount: null,
      minAmount: 4000,
      maxAmount: 5500,
      currency: 'USD',
    })
  })
})
