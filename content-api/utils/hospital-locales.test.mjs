import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  mergeHospitalSummaryLocaleRows,
  selectHospitalSummaryPage,
} from './hospital-locales.mjs'

describe('hospital locale fallback', () => {
  it('prefers requested-locale rows and falls back per entity', () => {
    const rows = [
      { id: 'private-1', locale: 'en', name: 'Private Hospital', ownership_type: 'Private' },
      { id: 'public-1', locale: 'en', name: 'Public Hospital', ownership_type: '公立' },
      { id: 'private-1', locale: 'ar', name: 'المستشفى الخاص', ownership_type: 'خاص' },
    ]

    assert.deepEqual(
      mergeHospitalSummaryLocaleRows(rows, 'ar').map(({ id, locale }) => ({ id, locale })),
      [
        { id: 'private-1', locale: 'ar' },
        { id: 'public-1', locale: 'en' },
      ],
    )
  })

  it('sorts private hospitals before paginating mixed locale rows', () => {
    const rows = [
      { id: 'public-1', locale: 'en', ownership_type: '公立' },
      { id: 'private-1', locale: 'en', ownership_type: 'Private' },
      { id: 'private-1', locale: 'ar', ownership_type: 'خاص' },
    ]

    assert.deepEqual(
      selectHospitalSummaryPage(rows, 'ar', { offset: 0, limit: 1 }),
      {
        rows: [{ id: 'private-1', locale: 'ar', ownership_type: 'Private' }],
        total: 2,
        fallbackCount: 1,
      },
    )
  })
})
