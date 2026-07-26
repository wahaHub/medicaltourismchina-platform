import { normalizeLocale } from './locale.mjs'

export const mergeHospitalSummaryLocaleRows = (
  rows = [],
  requestedLocale = 'zh',
  fallbackLocale = 'en',
) => {
  const normalizedRequestedLocale = normalizeLocale(requestedLocale)
  const normalizedFallbackLocale = normalizeLocale(fallbackLocale)
  const groupedRows = new Map()

  for (const row of rows) {
    if (!row) continue

    const entityKey = row.id || row.slug
    if (!entityKey) continue

    const rowLocale = normalizeLocale(row.locale || fallbackLocale)
    const group = groupedRows.get(entityKey) || { first: row }
    if (rowLocale === normalizedRequestedLocale) group.requested = row
    if (rowLocale === normalizedFallbackLocale) group.fallback = row
    groupedRows.set(entityKey, group)
  }

  return [...groupedRows.values()].map(({ requested, fallback, first }) => {
    const selected = requested || fallback || first

    if (
      selected !== fallback
      && fallback?.ownership_type
    ) {
      return {
        ...selected,
        // Ownership is a business classification, not translated display copy.
        ownership_type: fallback.ownership_type,
      }
    }

    return selected
  })
}

const getOwnershipPriority = (ownershipType) => {
  const normalized = typeof ownershipType === 'string'
    ? ownershipType.trim().toLowerCase()
    : ''

  if (normalized.includes('private') || normalized.includes('私立')) return 0
  if (normalized.includes('public') || normalized.includes('公立')) return 1
  return 2
}

export const sortHospitalsByOwnershipPriority = (hospitals = []) =>
  hospitals
    .map((hospital, index) => ({ hospital, index }))
    .sort((left, right) => {
      const priorityDifference =
        getOwnershipPriority(left.hospital?.ownership_type)
        - getOwnershipPriority(right.hospital?.ownership_type)

      return priorityDifference || left.index - right.index
    })
    .map(({ hospital }) => hospital)

export const selectHospitalSummaryPage = (
  rows = [],
  requestedLocale = 'zh',
  { offset = 0, limit = 24, fallbackLocale = 'en' } = {},
) => {
  const normalizedRequestedLocale = normalizeLocale(requestedLocale)
  const hospitals = sortHospitalsByOwnershipPriority(
    mergeHospitalSummaryLocaleRows(rows, requestedLocale, fallbackLocale),
  )

  return {
    rows: hospitals.slice(offset, offset + limit),
    total: hospitals.length,
    fallbackCount: hospitals.filter(
      (hospital) => normalizeLocale(hospital.locale) !== normalizedRequestedLocale,
    ).length,
  }
}
