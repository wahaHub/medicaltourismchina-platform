import { normalizeLocale } from './locale.mjs'

export const QUARANTINED_PROCEDURE_IDS = new Set([
  '7f86085c-8f53-4ddb-b7cb-1e9802fb71c1',
  '6b961100-b9dc-42e5-b1a1-343aee6cf064',
  '5a9fdec7-d3ef-4b25-9938-999afdf5b99c',
])

export const PROCEDURE_DETAIL_CONTENT_FIELDS = [
  'waiting_time',
  'cost_coverage',
  'cost_factors',
  'stay_at_hospital',
  'stay_at_hotel',
  'stay_in_china',
  'surgery_detailed_description',
  'when_is_needed',
  'preparation_before_surgery',
  'recovery_process',
  'surgery_options',
  'faqs',
  'surgery_steps',
  'recovery_steps',
]

export const PROCEDURE_DETAIL_LOCALE_SELECT = [
  'id',
  'locale',
  'name',
  ...PROCEDURE_DETAIL_CONTENT_FIELDS,
].join(',')

export const PROCEDURE_TRANSLATION_CONTENT_SELECT = [
  'procedure_id',
].join(',')

const PROCEDURE_TRANSLATION_TEXT_FIELDS = [
  'name',
  ...PROCEDURE_DETAIL_CONTENT_FIELDS.filter(
    (field) => !['faqs', 'surgery_steps', 'recovery_steps'].includes(field),
  ),
]

const PROCEDURE_TRANSLATION_JSON_FIELDS = [
  'faqs',
  'surgery_steps',
  'recovery_steps',
]

const SITE_LOCALE_ORDER = new Map(
  ['en', 'zh', 'es', 'fr', 'de', 'ru', 'ar', 'id'].map((locale, index) => [
    locale,
    index,
  ]),
)

const isNonEmptyContentValue = (value) => {
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  if (value && typeof value === 'object') return Object.keys(value).length > 0
  return value !== null && value !== undefined
}

export const hasCompleteProcedureLocaleContent = (procedure) =>
  isNonEmptyContentValue(procedure?.name) &&
  PROCEDURE_DETAIL_CONTENT_FIELDS.every((field) =>
    isNonEmptyContentValue(procedure?.[field]),
  )

export const getCompleteProcedureLocales = (procedures = []) => {
  const locales = new Set()

  for (const procedure of procedures ?? []) {
    if (
      typeof procedure?.locale !== 'string' ||
      !procedure.locale.trim() ||
      !hasCompleteProcedureLocaleContent(procedure)
    ) {
      continue
    }

    locales.add(normalizeLocale(procedure.locale))
  }

  return [...locales].sort((left, right) => {
    const leftOrder = SITE_LOCALE_ORDER.get(left) ?? Number.MAX_SAFE_INTEGER
    const rightOrder = SITE_LOCALE_ORDER.get(right) ?? Number.MAX_SAFE_INTEGER
    return leftOrder - rightOrder || left.localeCompare(right)
  })
}

export const getCompleteProcedureIds = (procedures = []) =>
  new Set(
    (procedures ?? [])
      .filter(hasCompleteProcedureLocaleContent)
      .map((procedure) => procedure?.procedure_id)
      .filter((procedureId) => typeof procedureId === 'string' && procedureId),
  )

export const fetchCompleteProcedureIds = async ({
  client,
  procedureIds,
  locale,
}) => {
  const ids = [
    ...new Set(
      (procedureIds ?? [])
        .filter((procedureId) => typeof procedureId === 'string')
        .map((procedureId) => procedureId.trim())
        .filter(
          (procedureId) =>
            procedureId && !QUARANTINED_PROCEDURE_IDS.has(procedureId),
        ),
    ),
  ]

  if (ids.length === 0) {
    return {
      procedureIds: new Set(),
      error: null,
    }
  }

  let query = client
    .from('procedure_i18n')
    .select(PROCEDURE_TRANSLATION_CONTENT_SELECT)
    .in('procedure_id', ids)

  for (const field of PROCEDURE_TRANSLATION_TEXT_FIELDS) {
    query = query.not(field, 'is', null).neq(field, '')
  }
  for (const field of PROCEDURE_TRANSLATION_JSON_FIELDS) {
    query = query
      .not(field, 'is', null)
      .not(field, 'eq', '{}')
      .not(field, 'eq', '[]')
  }

  const { data, error } = await query.eq('locale', normalizeLocale(locale))

  if (error) {
    return {
      procedureIds: new Set(),
      error,
    }
  }

  return {
    procedureIds: new Set(
      (data ?? [])
        .map((procedure) => procedure?.procedure_id)
        .filter((procedureId) => typeof procedureId === 'string' && procedureId),
    ),
    error: null,
  }
}

export const fetchProcedureListCompleteness = async ({
  client,
  procedureIds,
  locale,
  seoMode,
}) => {
  if (!seoMode) {
    return {
      enabled: false,
      procedureIds: new Set(),
      error: null,
    }
  }

  const result = await fetchCompleteProcedureIds({
    client,
    procedureIds,
    locale,
  })

  return {
    enabled: true,
    ...result,
  }
}

export const fetchAvailableProcedureLocales = async ({ client, procedure }) => {
  if (QUARANTINED_PROCEDURE_IDS.has(procedure?.id)) {
    return {
      locales: [],
      error: null,
    }
  }

  if (!procedure?.id) {
    return {
      locales: getCompleteProcedureLocales([procedure]),
      error: null,
    }
  }

  const { data, error } = await client
    .from('v_procedure_detail')
    .select(PROCEDURE_DETAIL_LOCALE_SELECT)
    .eq('id', procedure.id)

  if (error) {
    return {
      locales: getCompleteProcedureLocales([procedure]),
      error,
    }
  }

  return {
    locales: getCompleteProcedureLocales(data),
    error: null,
  }
}
