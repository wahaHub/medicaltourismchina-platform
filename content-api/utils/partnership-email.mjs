import { SESClient, SendRawEmailCommand } from '@aws-sdk/client-ses'

const sesClient = new SESClient({ region: process.env.AWS_SES_REGION || 'eu-west-1' })

const SENDER_EMAIL = 'Medora Health <customer@medicaltourismchina.health>'
const REPLY_TO = 'contact@medicaltourismchina.health'
const PARTNERSHIP_NOTIFICATION_RECIPIENTS = [
  'contactmecontact@medicaltourismchina.health',
  'customer@medicaltourismchina.health',
]

const APPLICATION_TYPE_LABELS = {
  hospitals: 'Hospital Network Application',
  'referral-partners': 'Referral Partner Application',
  'travel-services': 'Service Provider Application',
}

const encodeBase64 = (str) => Buffer.from(str, 'utf-8').toString('base64')

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function formatValue(value) {
  const normalized = typeof value === 'string' ? value.trim() : value
  if (!normalized) return 'Not provided'
  return String(normalized)
}

function renderDetailRows(details = {}) {
  return Object.entries(details)
    .filter(([, value]) => typeof value === 'string' && value.trim().length > 0)
    .map(([key, value]) => {
      const label = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^\w/, (char) => char.toUpperCase())

      return {
        label,
        value: String(value).trim(),
      }
    })
}

async function sendRawEmail({ to, replyTo, subject, htmlBody, textBody }) {
  const rawEmail = [
    `From: ${SENDER_EMAIL}`,
    `To: ${to.join(', ')}`,
    `Reply-To: ${replyTo}`,
    `Subject: =?UTF-8?B?${encodeBase64(subject)}?=`,
    'MIME-Version: 1.0',
    'Content-Type: multipart/alternative; boundary="alt_boundary"',
    '',
    '--alt_boundary',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    encodeBase64(textBody),
    '',
    '--alt_boundary',
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    encodeBase64(htmlBody),
    '',
    '--alt_boundary--',
  ].join('\r\n')

  const command = new SendRawEmailCommand({
    RawMessage: {
      Data: Buffer.from(rawEmail),
    },
  })

  const response = await sesClient.send(command)
  return { success: true, messageId: response.MessageId }
}

export async function sendPartnershipNotificationEmail(application) {
  const detailRows = renderDetailRows(application.application_details)
  const applicationLabel = APPLICATION_TYPE_LABELS[application.application_type] || 'Partnership Application'
  const submittedAt = new Date(application.created_at || Date.now()).toLocaleString('en-US', {
    timeZone: 'Asia/Shanghai',
    dateStyle: 'full',
    timeStyle: 'medium',
  })

  const subject = `🤝 ${applicationLabel} from ${application.organization_name}`

  const htmlBody = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 720px; margin: 0 auto; padding: 24px; }
    .header { background: linear-gradient(135deg, #0f638e 0%, #1da78a 100%); color: white; padding: 24px; border-radius: 20px 20px 0 0; }
    .panel { border: 1px solid #dbe4ea; border-top: 0; border-radius: 0 0 20px 20px; overflow: hidden; }
    .section { padding: 24px; background: #ffffff; }
    .section + .section { border-top: 1px solid #e5edf3; }
    .row { margin-bottom: 12px; }
    .label { display: inline-block; min-width: 180px; font-weight: 700; color: #0f638e; vertical-align: top; }
    .value { color: #334155; }
    .note { white-space: pre-wrap; background: #f8fafc; border-radius: 16px; padding: 16px; margin-top: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h2 style="margin: 0;">${escapeHtml(applicationLabel)}</h2>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">A new partnership application has been submitted on the Work With Us page.</p>
  </div>

  <div class="panel">
    <div class="section">
      <div class="row"><span class="label">Organization</span><span class="value">${escapeHtml(formatValue(application.organization_name))}</span></div>
      <div class="row"><span class="label">Contact name</span><span class="value">${escapeHtml(formatValue(application.contact_name))}</span></div>
      <div class="row"><span class="label">Title</span><span class="value">${escapeHtml(formatValue(application.job_title))}</span></div>
      <div class="row"><span class="label">Email</span><span class="value">${escapeHtml(formatValue(application.email))}</span></div>
      <div class="row"><span class="label">Phone</span><span class="value">${escapeHtml(formatValue(application.phone))}</span></div>
      <div class="row"><span class="label">WhatsApp</span><span class="value">${escapeHtml(formatValue(application.whatsapp))}</span></div>
      <div class="row"><span class="label">WeChat</span><span class="value">${escapeHtml(formatValue(application.wechat))}</span></div>
      <div class="row"><span class="label">Website</span><span class="value">${escapeHtml(formatValue(application.website))}</span></div>
      <div class="row"><span class="label">Country / city</span><span class="value">${escapeHtml([application.country, application.city].filter(Boolean).join(' / ') || 'Not provided')}</span></div>
      <div class="row"><span class="label">Submitted at</span><span class="value">${escapeHtml(submittedAt)}</span></div>
      <div class="row"><span class="label">Application ID</span><span class="value">${escapeHtml(application.id)}</span></div>
    </div>

    <div class="section">
      <h3 style="margin-top: 0; color: #0f638e;">Application details</h3>
      ${detailRows.length > 0
        ? detailRows
            .map((row) => `<div class="row"><span class="label">${escapeHtml(row.label)}</span><span class="value">${escapeHtml(row.value)}</span></div>`)
            .join('')
        : '<p style="margin: 0; color: #64748b;">No additional details were provided.</p>'}
      ${application.notes ? `<div class="note"><strong>Notes</strong><br/>${escapeHtml(application.notes)}</div>` : ''}
    </div>
  </div>
</body>
</html>`

  const textBody = [
    applicationLabel,
    ''.padEnd(applicationLabel.length, '='),
    '',
    `Organization: ${formatValue(application.organization_name)}`,
    `Contact name: ${formatValue(application.contact_name)}`,
    `Title: ${formatValue(application.job_title)}`,
    `Email: ${formatValue(application.email)}`,
    `Phone: ${formatValue(application.phone)}`,
    `WhatsApp: ${formatValue(application.whatsapp)}`,
    `WeChat: ${formatValue(application.wechat)}`,
    `Website: ${formatValue(application.website)}`,
    `Country / city: ${[application.country, application.city].filter(Boolean).join(' / ') || 'Not provided'}`,
    `Submitted at: ${submittedAt}`,
    `Application ID: ${application.id}`,
    '',
    'Application details',
    '-------------------',
    ...(detailRows.length > 0
      ? detailRows.map((row) => `${row.label}: ${row.value}`)
      : ['No additional details were provided.']),
    '',
    `Notes: ${formatValue(application.notes)}`,
  ].join('\n')

  try {
    return await sendRawEmail({
      to: PARTNERSHIP_NOTIFICATION_RECIPIENTS,
      replyTo: application.email,
      subject,
      htmlBody,
      textBody,
    })
  } catch (error) {
    console.error('Failed to send partnership notification email:', error)
    return { success: false, error: error.message }
  }
}

export async function sendPartnershipConfirmationEmail(application) {
  const applicationLabel = APPLICATION_TYPE_LABELS[application.application_type] || 'partnership application'
  const subject = `We received your ${applicationLabel.toLowerCase()} | Medora Health`

  const htmlBody = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 640px; margin: 0 auto; padding: 24px; }
    .hero { background: linear-gradient(135deg, #0f638e 0%, #1da78a 100%); color: white; padding: 28px; border-radius: 20px; }
    .card { margin-top: 20px; border: 1px solid #dbe4ea; border-radius: 20px; padding: 24px; background: white; }
  </style>
</head>
<body>
  <div class="hero">
    <h2 style="margin: 0;">Thank you for applying</h2>
    <p style="margin: 10px 0 0 0; opacity: 0.92;">We received your ${escapeHtml(applicationLabel.toLowerCase())} and our partnerships team will review it shortly.</p>
  </div>

  <div class="card">
    <p>Hi ${escapeHtml(application.contact_name.split(' ')[0] || application.contact_name)},</p>
    <p>Thank you for your interest in working with Medora Health. We have recorded your submission for <strong>${escapeHtml(application.organization_name)}</strong>.</p>
    <p>Our team usually replies within 2 business days if we need more details or would like to move to the next step.</p>
    <p style="margin-bottom: 0;">If you need to add context, simply reply to this email.</p>
  </div>
</body>
</html>`

  const textBody = `Hi ${application.contact_name.split(' ')[0] || application.contact_name},

Thank you for your interest in working with Medora Health. We received your ${applicationLabel.toLowerCase()} for ${application.organization_name}.

Our partnerships team usually replies within 2 business days if we need more details or would like to move to the next step.

If you need to add context, simply reply to this email.
`

  try {
    return await sendRawEmail({
      to: [application.email],
      replyTo: REPLY_TO,
      subject,
      htmlBody,
      textBody,
    })
  } catch (error) {
    console.error('Failed to send partnership confirmation email:', error)
    return { success: false, error: error.message }
  }
}
