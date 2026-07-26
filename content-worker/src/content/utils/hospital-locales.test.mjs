import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  mergeHospitalSummaryLocaleRows,
  selectHospitalSummaryPage,
} from './hospital-locales.mjs'

describe('hospital locale fallback', () => {
  it('keeps requested-locale content and fills untranslated entities from English', () => {
    const rows = [
      { id: 'private-1', locale: 'en', name: 'Private Hospital', ownership_type: 'Private' },
      { id: 'public-1', locale: 'en', name: 'Public Hospital', ownership_type: '公立' },
      { id: 'private-1', locale: 'ar', name: 'المستشفى الخاص', ownership_type: 'خاص' },
    ]

    assert.deepEqual(
      mergeHospitalSummaryLocaleRows(rows, 'ar').map(({ id, locale, name, ownership_type }) => ({
        id,
        locale,
        name,
        ownership_type,
      })),
      [
        {
          id: 'private-1',
          locale: 'ar',
          name: 'المستشفى الخاص',
          ownership_type: 'Private',
        },
        {
          id: 'public-1',
          locale: 'en',
          name: 'Public Hospital',
          ownership_type: '公立',
        },
      ],
    )
  })

  it('deduplicates by stable slug when an id is unavailable', () => {
    const rows = [
      { slug: 'hospital-one', locale: 'en', name: 'Hospital One' },
      { slug: 'hospital-one', locale: 'ar', name: 'المستشفى الأول' },
    ]

    assert.deepEqual(
      mergeHospitalSummaryLocaleRows(rows, 'ar'),
      [{ slug: 'hospital-one', locale: 'ar', name: 'المستشفى الأول' }],
    )
  })

  it('sorts before pagination and reports the unique fallback total', () => {
    const rows = [
      { id: 'public-1', locale: 'en', ownership_type: '公立' },
      { id: 'private-1', locale: 'en', ownership_type: 'Private' },
      { id: 'private-1', locale: 'ar', ownership_type: 'خاص' },
      { id: 'public-2', locale: 'en', ownership_type: 'Public' },
    ]

    assert.deepEqual(
      selectHospitalSummaryPage(rows, 'ar', { offset: 0, limit: 2 }),
      {
        rows: [
          { id: 'private-1', locale: 'ar', ownership_type: 'Private' },
          { id: 'public-1', locale: 'en', ownership_type: '公立' },
        ],
        total: 3,
        fallbackCount: 2,
      },
    )
  })
})
