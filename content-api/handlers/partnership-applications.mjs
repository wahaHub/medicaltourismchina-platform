import { supa } from '../config/supabase.mjs'
import { json } from '../utils/response.mjs'
import {
  sendPartnershipConfirmationEmail,
  sendPartnershipNotificationEmail,
} from '../utils/partnership-email.mjs'

const VALID_APPLICATION_TYPES = new Set(['hospitals', 'referral-partners', 'travel-services'])

const REQUIRED_DETAIL_FIELDS = {
  hospitals: ['services', 'readiness', 'credentials'],
  'referral-partners': ['referralVolume', 'languages'],
  'travel-services': ['serviceCategory', 'coverage', 'languages', 'experience'],
}

function normalizeString(value, maxLength = 2000) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed.slice(0, maxLength)
}

export const createPartnershipApplication = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}')
    const applicationType = normalizeString(body.applicationType, 40)
    const organizationName = normalizeString(body.organizationName, 255)
    const website = normalizeString(body.website, 500)
    const contactName = normalizeString(body.contactName, 255)
    const jobTitle = normalizeString(body.jobTitle, 255)
    const email = normalizeString(body.email, 255)
    const phone = normalizeString(body.phone, 50)
    const whatsapp = normalizeString(body.whatsapp, 50)
    const wechat = normalizeString(body.wechat, 100)
    const country = normalizeString(body.country, 100)
    const city = normalizeString(body.city, 100)
    const notes = normalizeString(body.notes, 4000)
    const details = body.details && typeof body.details === 'object' && !Array.isArray(body.details) ? body.details : {}

    if (!applicationType || !VALID_APPLICATION_TYPES.has(applicationType)) {
      return json(400, { error: 'Invalid application type' })
    }

    if (!organizationName || !contactName || !email) {
      return json(400, { error: 'organizationName, contactName, and email are required' })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return json(400, { error: 'Invalid email format' })
    }

    const requiredDetailFields = REQUIRED_DETAIL_FIELDS[applicationType]
    const normalizedDetails = Object.fromEntries(
      Object.entries(details).map(([key, value]) => [key, normalizeString(value, 4000)]),
    )

    for (const field of requiredDetailFields) {
      if (!normalizedDetails[field]) {
        return json(400, { error: `${field} is required` })
      }
    }

    const payload = {
      application_type: applicationType,
      organization_name: organizationName,
      website,
      contact_name: contactName,
      job_title: jobTitle,
      email,
      phone,
      whatsapp,
      wechat,
      country,
      city,
      notes,
      application_details: normalizedDetails,
      status: 'pending',
    }

    const { data, error } = await supa
      .from('partnership_applications')
      .insert([payload])
      .select('*')
      .single()

    if (error) {
      console.error('Partnership application insert failed:', error)
      return json(400, { error: error.message })
    }

    let notificationSent = false
    let confirmationSent = false

    try {
      const result = await sendPartnershipNotificationEmail(data)
      notificationSent = result.success
    } catch (notifyError) {
      console.error('Partnership notification email error:', notifyError)
    }

    try {
      const result = await sendPartnershipConfirmationEmail(data)
      confirmationSent = result.success
    } catch (confirmationError) {
      console.error('Partnership confirmation email error:', confirmationError)
    }

    return json(201, {
      ok: true,
      data: {
        id: data.id,
        status: data.status,
      },
      notificationSent,
      confirmationSent,
    })
  } catch (error) {
    console.error('Unexpected partnership application error:', error)
    return json(500, { error: error.message || 'Internal server error' })
  }
}
