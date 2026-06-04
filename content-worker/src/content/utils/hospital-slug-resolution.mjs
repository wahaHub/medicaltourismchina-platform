const NOT_FOUND_CODE = 'PGRST116'

const isNotFound = (result) => result?.error?.code === NOT_FOUND_CODE

export const createHospitalSlugResolver = ({ supa }) => async (slug, locale = 'zh') => {
  const identifier = typeof slug === 'string' ? slug.trim() : ''
  if (!identifier) {
    return { type: 'not_found' }
  }

  const canonical = await supa
    .from('v_hospital_details')
    .select('id, slug')
    .eq('slug', identifier)
    .eq('locale', locale)
    .single()

  if (canonical.data) {
    return {
      type: 'canonical',
      slug: canonical.data.slug || identifier,
      hospitalId: canonical.data.id,
    }
  }

  if (canonical.error && !isNotFound(canonical)) {
    throw canonical.error
  }

  const alias = await supa
    .from('hospital_slug_aliases')
    .select('hospital_id, old_slug, new_slug, redirect_status')
    .eq('old_slug', identifier)
    .single()

  if (!alias.data) {
    if (alias.error && !isNotFound(alias)) {
      throw alias.error
    }
    return { type: 'not_found' }
  }

  const current = await supa
    .from('hospitals')
    .select('id, slug')
    .eq('id', alias.data.hospital_id)
    .single()

  if (!current.data) {
    if (current.error && !isNotFound(current)) {
      throw current.error
    }
    return { type: 'not_found' }
  }

  const toSlug = current.data.slug || alias.data.new_slug
  if (!toSlug || toSlug === identifier) {
    return { type: 'not_found' }
  }

  return {
    type: 'redirect',
    fromSlug: identifier,
    toSlug,
    status: alias.data.redirect_status || 301,
    hospitalId: current.data.id,
  }
}

export const appendQueryString = (location, event) => {
  const rawQueryString = event?.rawQueryString
  if (typeof rawQueryString === 'string' && rawQueryString) {
    return `${location}?${rawQueryString}`
  }

  const query = event?.queryStringParameters
  if (!query || typeof query !== 'object') {
    return location
  }

  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null) {
      params.set(key, String(value))
    }
  }

  const serialized = params.toString()
  return serialized ? `${location}?${serialized}` : location
}
