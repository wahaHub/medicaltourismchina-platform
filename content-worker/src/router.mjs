import { handleOptions } from './content/middleware/cors.mjs'
import { getDepartments, getDepartmentCapability } from './content/handlers/departments.mjs'
import { getDiseasesByDepartment, getProceduresByDisease as getDiseaseProcedures } from './content/handlers/diseases.mjs'
import { getProcedures, getProcedureBySlug } from './content/handlers/procedures.mjs'
import {
  getHospitals,
  getHospitalBySlug,
  getHospitalExtendedBySlug,
  getHospitalPackageDetailBySlug,
  getHospitalSlugResolution,
} from './content/handlers/hospitals.mjs'
import {
  getFeaturedTreatments,
  getFeaturedTreatmentBySlug,
  getFeaturedTreatmentsByType,
} from './content/handlers/featured-treatments.mjs'
import { json } from './content/utils/response.mjs'
import { withCors } from './content/middleware/cors.mjs'

const matchPath = (path, pattern) => path?.match(pattern)
const matchSlug = (path, pattern) => matchPath(path, pattern)?.[1]

const routeRequest = async (event) => {
  const optionsResponse = handleOptions(event)
  if (optionsResponse) return optionsResponse

  const method = event.requestContext?.http?.method || event.httpMethod
  const path = event.rawPath || event.path || ''

  if (path.endsWith('/health') && method === 'GET') {
    return json(200, { ok: true, service: 'medicaltourismchina-content-worker' })
  }

  if (path.endsWith('/departments') && method === 'GET') {
    return await getDepartments(event)
  }

  if (matchPath(path, /\/departments\/([^/]+)\/capability$/) && method === 'GET') {
    event.pathParameters = { slug: matchSlug(path, /\/departments\/([^/]+)\/capability$/) }
    return await getDepartmentCapability(event)
  }

  if (matchPath(path, /\/departments\/([^/]+)\/diseases$/) && method === 'GET') {
    event.pathParameters = { slug: matchSlug(path, /\/departments\/([^/]+)\/diseases$/) }
    return await getDiseasesByDepartment(event)
  }

  if (matchPath(path, /\/diseases\/([^/]+)\/procedures$/) && method === 'GET') {
    event.pathParameters = { slug: matchSlug(path, /\/diseases\/([^/]+)\/procedures$/) }
    return await getDiseaseProcedures(event)
  }

  if (path.endsWith('/procedures') && method === 'GET') {
    return await getProcedures(event)
  }

  if (matchPath(path, /\/procedures\/([^/]+)$/) && method === 'GET') {
    event.pathParameters = { slug: decodeURIComponent(matchSlug(path, /\/procedures\/([^/]+)$/)) }
    return await getProcedureBySlug(event)
  }

  if (path.endsWith('/hospitals') && method === 'GET') {
    return await getHospitals(event)
  }

  if (matchPath(path, /\/hospitals\/([^/]+)\/slug-resolution$/) && method === 'GET') {
    event.pathParameters = { slug: matchSlug(path, /\/hospitals\/([^/]+)\/slug-resolution$/) }
    return await getHospitalSlugResolution(event)
  }

  if (matchPath(path, /\/hospitals\/([^/]+)\/extended$/) && method === 'GET') {
    event.pathParameters = { slug: matchSlug(path, /\/hospitals\/([^/]+)\/extended$/) }
    return await getHospitalExtendedBySlug(event)
  }

  if (matchPath(path, /\/hospitals\/([^/]+)\/packages\/([^/]+)$/) && method === 'GET') {
    const [, slug, packageSlug] = matchPath(path, /\/hospitals\/([^/]+)\/packages\/([^/]+)$/)
    event.pathParameters = { slug, packageSlug }
    return await getHospitalPackageDetailBySlug(event)
  }

  if (matchPath(path, /\/hospitals\/([^/]+)$/) && method === 'GET') {
    event.pathParameters = { slug: matchSlug(path, /\/hospitals\/([^/]+)$/) }
    return await getHospitalBySlug(event)
  }

  if (path.endsWith('/featured-treatments') && method === 'GET') {
    return await getFeaturedTreatments(event)
  }

  if (matchPath(path, /\/featured-treatments\/type\/([^/]+)$/) && method === 'GET') {
    event.pathParameters = { type: matchSlug(path, /\/featured-treatments\/type\/([^/]+)$/) }
    return await getFeaturedTreatmentsByType(event)
  }

  if (matchPath(path, /\/featured-treatments\/([^/]+)$/) && method === 'GET') {
    event.pathParameters = { slug: matchSlug(path, /\/featured-treatments\/([^/]+)$/) }
    return await getFeaturedTreatmentBySlug(event)
  }

  return json(404, { error: 'Not found' })
}

export const handler = async (event) => {
  try {
    return withCors(await routeRequest(event), event)
  } catch (error) {
    console.error('Content Worker handler error:', error)
    return withCors(json(500, { error: error?.message || 'internal error' }), event)
  }
}
