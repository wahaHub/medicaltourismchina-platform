import { handleOptions, withCors } from './middleware/cors.mjs'
import { getDepartments, getDepartmentCapability } from './handlers/departments.mjs'
import { getDiseasesByDepartment, getProceduresByDisease as getDiseaseProcedures } from './handlers/diseases.mjs'
import { getProcedures, getProcedureBySlug } from './handlers/procedures.mjs'
import {
  getHospitals,
  getHospitalBySlug,
  getHospitalExtendedBySlug,
  getHospitalPackageDetailBySlug
} from './handlers/hospitals.mjs'
import {
  getFeaturedTreatments,
  getFeaturedTreatmentBySlug,
  getFeaturedTreatmentsByType,
  trackFeaturedTreatment
} from './handlers/featured-treatments.mjs'
import { createBookingRequest } from './handlers/booking-requests.mjs'
import { createPartnershipApplication } from './handlers/partnership-applications.mjs'
import { createCaseIntakeWithToken } from './handlers/case-intakes.mjs'
import { json } from './utils/response.mjs'

const matchPath = (path, pattern) => path?.match(pattern)
const matchSlug = (path, pattern) => matchPath(path, pattern)?.[1]

const routeRequest = async (event) => {
  const optionsResponse = handleOptions(event)
  if (optionsResponse) return optionsResponse

  const method = event.requestContext?.http?.method || event.httpMethod
  const path = event.rawPath || event.path || ''

  if (path.endsWith('/health') && method === 'GET') {
    return json(200, { ok: true, service: 'medicaltourismchina-content-api' })
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
    event.pathParameters = { slug: matchSlug(path, /\/procedures\/([^/]+)$/) }
    return await getProcedureBySlug(event)
  }

  if (path.endsWith('/hospitals') && method === 'GET') {
    return await getHospitals(event)
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

  if (matchPath(path, /\/featured-treatments\/([^/]+)\/track$/) && method === 'POST') {
    event.pathParameters = { slug: matchSlug(path, /\/featured-treatments\/([^/]+)\/track$/) }
    return await trackFeaturedTreatment(event)
  }

  if (matchPath(path, /\/featured-treatments\/([^/]+)$/) && method === 'GET') {
    event.pathParameters = { slug: matchSlug(path, /\/featured-treatments\/([^/]+)$/) }
    return await getFeaturedTreatmentBySlug(event)
  }

  if (path.endsWith('/booking-requests') && method === 'POST') {
    return await createBookingRequest(event)
  }

  if (path.endsWith('/partnership-applications') && method === 'POST') {
    return await createPartnershipApplication(event)
  }

  if (path.endsWith('/case-intakes/token-submit') && method === 'POST') {
    const body = JSON.parse(event.body || '{}')
    return await createCaseIntakeWithToken(body)
  }

  return json(404, { error: 'Not found' })
}

export const handler = async (event) => {
  try {
    return withCors(await routeRequest(event), event)
  } catch (error) {
    console.error('Content API handler error:', error)
    return withCors(json(500, { error: error?.message || 'internal error' }), event)
  }
}
