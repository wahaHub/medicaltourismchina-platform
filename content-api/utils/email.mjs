// utils/email.mjs
import { SESClient, SendRawEmailCommand } from '@aws-sdk/client-ses'

const sesClient = new SESClient({ region: process.env.AWS_SES_REGION || 'eu-west-1' })

const SENDER_EMAIL = 'Medora Health <customer@medicaltourismchina.health>'
const REPLY_TO = 'contact@medicaltourismchina.health'
const ADMIN_EMAIL = 'customer@medicaltourismchina.health'  // TODO: change back to contact@medicaltourismchina.health after testing

// Medora Health logo (hosted on website for email compatibility)
const LOGO_URL = 'https://www.medicaltourismchina.health/Medora%20Health-logo/logo-1.png'

/**
 * Encode string to Base64 for MIME transfer
 */
const encodeBase64 = (str) => Buffer.from(str, 'utf-8').toString('base64')

/**
 * 发送 Medical Case Intake 邀请邮件（同时作为预约确认邮件）
 * @param {string} recipientEmail - 收件人邮箱
 * @param {string} recipientName - 收件人姓名
 * @param {string} magicLink - Magic Link 链接
 * @param {object} bookingInfo - 预约信息
 */
export const sendCaseIntakeInviteEmail = async (recipientEmail, recipientName, magicLink, bookingInfo = {}) => {
  const {
    procedure, destination, treatmentTime,
    phone, age, gender, country, whatsapp, messenger, requestId
  } = bookingInfo
  const firstName = recipientName.split(' ')[0] || recipientName

  const subject = '✅ Request Received - Complete Your Medical Information | Medora Health'

  // 构建请求确认摘要
  const hasContactInfo = phone || whatsapp || messenger
  const hasTreatmentInfo = procedure || destination || treatmentTime
  const hasPersonalInfo = age || gender || country

  let requestConfirmation = `
    <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #10b981;">
      <div style="display: flex; align-items: center; margin-bottom: 15px;">
        <span style="font-size: 24px; margin-right: 10px;">✅</span>
        <h3 style="margin: 0; color: #065f46; font-size: 18px;">Your Consultation Request Has Been Received!</h3>
      </div>
      <p style="margin: 0 0 15px 0; color: #047857;">Request ID: <strong>${requestId || 'Processing'}</strong></p>
      <p style="margin: 0; color: #065f46; font-size: 14px;">Our medical coordination team will review your request and contact you within <strong>24-48 hours</strong>.</p>
    </div>
  `

  // 个人信息摘要
  let personalInfoSummary = ''
  if (hasPersonalInfo || hasContactInfo) {
    personalInfoSummary = `
      <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #0f766e; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0 0 12px 0; font-weight: bold; color: #0f766e;">📋 Your Information:</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 5px 10px 5px 0; color: #64748b; width: 120px;">Name:</td>
            <td style="padding: 5px 0; color: #1e293b; font-weight: 500;">${recipientName}</td>
          </tr>
          <tr>
            <td style="padding: 5px 10px 5px 0; color: #64748b;">Email:</td>
            <td style="padding: 5px 0; color: #1e293b;">${recipientEmail}</td>
          </tr>
          ${phone ? `<tr><td style="padding: 5px 10px 5px 0; color: #64748b;">Phone:</td><td style="padding: 5px 0; color: #1e293b;">${phone}</td></tr>` : ''}
          ${whatsapp ? `<tr><td style="padding: 5px 10px 5px 0; color: #64748b;">WhatsApp:</td><td style="padding: 5px 0; color: #1e293b;"><a href="https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}" style="color: #25D366;">${whatsapp}</a></td></tr>` : ''}
          ${messenger ? `<tr><td style="padding: 5px 10px 5px 0; color: #64748b;">Messenger:</td><td style="padding: 5px 0; color: #1e293b;">${messenger}</td></tr>` : ''}
          ${age ? `<tr><td style="padding: 5px 10px 5px 0; color: #64748b;">Age:</td><td style="padding: 5px 0; color: #1e293b;">${age} years old</td></tr>` : ''}
          ${gender ? `<tr><td style="padding: 5px 10px 5px 0; color: #64748b;">Gender:</td><td style="padding: 5px 0; color: #1e293b;">${gender}</td></tr>` : ''}
          ${country ? `<tr><td style="padding: 5px 10px 5px 0; color: #64748b;">Country:</td><td style="padding: 5px 0; color: #1e293b;">${country}</td></tr>` : ''}
        </table>
      </div>
    `
  }

  // 治疗信息摘要
  let treatmentSummary = ''
  if (hasTreatmentInfo) {
    treatmentSummary = `
      <div style="background-color: #f0f9ff; padding: 15px; border-left: 4px solid #0284c7; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0 0 12px 0; font-weight: bold; color: #0369a1;">🏥 Treatment Interest:</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          ${procedure ? `<tr><td style="padding: 5px 10px 5px 0; color: #64748b; width: 120px;">Procedure:</td><td style="padding: 5px 0; color: #1e293b; font-weight: 500;">${procedure}</td></tr>` : ''}
          ${destination ? `<tr><td style="padding: 5px 10px 5px 0; color: #64748b;">Destination:</td><td style="padding: 5px 0; color: #1e293b;">${destination}</td></tr>` : ''}
          ${treatmentTime ? `<tr><td style="padding: 5px 10px 5px 0; color: #64748b;">Timing:</td><td style="padding: 5px 0; color: #1e293b;">${treatmentTime}</td></tr>` : ''}
        </table>
      </div>
    `
  }

  const htmlBody = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .btn-primary { display: inline-block; background-color: #0f766e; color: white !important; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px; margin: 10px 0; }
    .btn-primary:hover { background-color: #0d5d56; }
    .info-box { background-color: #f0fdf4; border: 1px solid #22c55e; padding: 20px; border-radius: 8px; margin: 25px 0; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px; }
    .contact-info { color: #0f766e; font-weight: bold; }
  </style>
</head>
<body>

  <!-- Logo Header -->
  <div style="text-align: center; margin-bottom: 30px; padding: 20px 0; border-bottom: 2px solid #0f766e;">
    <img src="${LOGO_URL}" alt="Medora Health - Premium Care, Right Fare" style="max-width: 220px; height: auto;" />
  </div>

  <!-- Main CTA Button at Top -->
  <div style="text-align: center; background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%); padding: 30px; border-radius: 12px; margin-bottom: 25px;">
    <h2 style="color: white; margin: 0 0 15px 0; font-size: 24px;">Complete Your Medical Information</h2>
    <p style="color: #d1fae5; margin: 0 0 20px 0;">Get personalized treatment recommendations from top Chinese hospitals</p>
    <a href="${magicLink}" class="btn-primary" style="background-color: white; color: #0f766e !important; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px; display: inline-block;">
      📋 Fill Medical Case Form
    </a>
  </div>

  <p>Hi ${firstName},</p>

  <p>Thank you for your interest in <strong>Medora Health</strong>! We're excited to help you explore world-class medical treatment options in China.</p>

  ${requestConfirmation}

  ${personalInfoSummary}

  ${treatmentSummary}

  <p>To provide you with the most accurate treatment plan and cost estimates, please take a few minutes to complete our <strong>Medical Case Intake Form</strong>.</p>

  <div class="info-box">
    <p style="margin: 0 0 15px 0; font-size: 16px; font-weight: bold; color: #166534;">✨ Why complete this form?</p>
    <ul style="margin: 0; padding-left: 20px; color: #374151;">
      <li>Receive personalized treatment recommendations</li>
      <li>Get accurate cost estimates from top hospitals</li>
      <li>Connect with the most suitable medical specialists</li>
      <li>Fast-track your consultation process</li>
    </ul>
  </div>

  <!-- Account Benefits Section -->
  <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); padding: 20px; border-radius: 12px; margin: 25px 0; border: 1px solid #3b82f6;">
    <div style="display: flex; align-items: center; margin-bottom: 12px;">
      <span style="font-size: 20px; margin-right: 10px;">🔐</span>
      <h3 style="margin: 0; color: #1e40af; font-size: 16px;">Your Secure Medical Dashboard</h3>
    </div>
    <p style="margin: 0 0 12px 0; color: #1e3a8a; font-size: 14px;">
      By clicking the link above, you'll access your personal medical dashboard where you can:
    </p>
    <ul style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px;">
      <li style="margin-bottom: 6px;">📊 Track your consultation status in real-time</li>
      <li style="margin-bottom: 6px;">📁 Securely store and manage your medical records</li>
      <li style="margin-bottom: 6px;">📅 Manage appointments and follow-ups</li>
    </ul>
    <p style="margin: 12px 0 0 0; color: #6b7280; font-size: 12px; font-style: italic;">
      Your account has been created automatically. Use the Magic Link above to access it anytime.
    </p>
  </div>

  <!-- Secondary CTA -->
  <div style="text-align: center; margin: 30px 0;">
    <a href="${magicLink}" style="display: inline-block; background-color: #0f766e; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
      Complete Medical Case Intake →
    </a>
    <p style="margin: 15px 0 0 0; font-size: 13px; color: #6b7280;">
      This secure link will log you in automatically (valid for 24 hours)
    </p>
  </div>

  <p style="font-size: 13px; color: #6b7280;">If the button doesn't work, copy and paste this link into your browser:</p>
  <p style="word-break: break-all; background-color: #f3f4f6; padding: 12px; border-radius: 6px; font-size: 11px; color: #4b5563; font-family: monospace;">
    ${magicLink}
  </p>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />

  <p>If you have any questions, our team is here to help:</p>
  <p style="line-height: 2;">
    <span class="contact-info">📧</span> <a href="mailto:contact@medicaltourismchina.health" style="color: #0f766e; text-decoration: none;">contact@medicaltourismchina.health</a><br/>
    <span class="contact-info">📱</span> WhatsApp: <a href="https://wa.me/14708613825" style="color: #0f766e; text-decoration: none;">(+1) 470-861-3825</a>
  </p>

  <!-- Signature with Logo -->
  <div style="margin-top: 30px; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
    <p style="margin: 0;">
      Warm regards,<br/>
      <strong>The Medora Health Team</strong><br/>
      <em style="color: #0f766e;">Premium Care, Right Fare</em>
    </p>
  </div>

  <!-- Footer -->
  <div class="footer">
    <img src="${LOGO_URL}" alt="Medora Health" style="max-width: 120px; height: auto; margin-bottom: 10px;" />
    <p>
      <a href="https://www.medicaltourismchina.health" style="color: #0f766e; text-decoration: none;">www.medicaltourismchina.health</a>
    </p>
    <p>© ${new Date().getFullYear()} Medora Health. All rights reserved.</p>
    <p style="font-size: 11px; color: #9ca3af;">
      You received this email because you submitted a consultation request on our website.
    </p>
  </div>

</body>
</html>`

  const textBody = `Hi ${firstName},

Thank you for your interest in Medora Health! We're excited to help you explore world-class medical treatment options in China.

✅ YOUR CONSULTATION REQUEST HAS BEEN RECEIVED!
================================================
Request ID: ${requestId || 'Processing'}
Our medical coordination team will review your request and contact you within 24-48 hours.

YOUR INFORMATION
----------------
Name: ${recipientName}
Email: ${recipientEmail}
${phone ? `Phone: ${phone}` : ''}
${whatsapp ? `WhatsApp: ${whatsapp}` : ''}
${messenger ? `Messenger: ${messenger}` : ''}
${age ? `Age: ${age} years old` : ''}
${gender ? `Gender: ${gender}` : ''}
${country ? `Country: ${country}` : ''}

${hasTreatmentInfo ? `TREATMENT INTEREST
------------------
${procedure ? `Procedure: ${procedure}` : ''}
${destination ? `Destination: ${destination}` : ''}
${treatmentTime ? `Timing: ${treatmentTime}` : ''}
` : ''}

COMPLETE YOUR MEDICAL INFORMATION
==================================
To provide you with the most accurate treatment plan and cost estimates, please complete our Medical Case Intake Form:

${magicLink}

This secure link will log you in automatically (valid for 24 hours).

Why complete this form?
• Receive personalized treatment recommendations
• Get accurate cost estimates from top hospitals
• Connect with the most suitable medical specialists
• Fast-track your consultation process

🔐 YOUR SECURE MEDICAL DASHBOARD
---------------------------------
By clicking the link above, you'll access your personal medical dashboard where you can:
• Track your consultation status in real-time
• Securely store and manage your medical records
• Manage appointments and follow-ups

Your account has been created automatically. Use the Magic Link above to access it anytime.

If you have any questions, our team is here to help:
📧 Email: contact@medicaltourismchina.health
📱 WhatsApp: (+1) 470-861-3825

Warm regards,
The Medora Health Team
Premium Care, Right Fare

www.medicaltourismchina.health
© ${new Date().getFullYear()} Medora Health. All rights reserved.`

  // 构建 MIME 邮件 - 使用 Base64 编码避免 URL 被破坏
  const boundary = `----=_Part_${Date.now()}`

  const rawEmail = [
    `From: ${SENDER_EMAIL}`,
    `To: ${recipientEmail}`,
    `Reply-To: ${REPLY_TO}`,
    `Subject: =?UTF-8?B?${encodeBase64(subject)}?=`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    encodeBase64(textBody),
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    encodeBase64(htmlBody),
    '',
    `--${boundary}--`
  ].join('\r\n')

  try {
    const command = new SendRawEmailCommand({
      RawMessage: {
        Data: Buffer.from(rawEmail)
      }
    })

    const response = await sesClient.send(command)
    console.log('Email sent successfully:', response.MessageId)
    return { success: true, messageId: response.MessageId }
  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * 生成 CSV 格式的附件内容
 */
const generateCSV = (data, headers) => {
  const csvRows = [headers.join(',')]
  const values = headers.map(h => {
    const val = data[h] ?? ''
    // 如果值包含逗号、引号或换行符，需要用引号包裹并转义内部引号
    const strVal = String(val).replace(/"/g, '""')
    return strVal.includes(',') || strVal.includes('"') || strVal.includes('\n') ? `"${strVal}"` : strVal
  })
  csvRows.push(values.join(','))
  return csvRows.join('\r\n')
}

/**
 * 发送 Booking Request 通知邮件给管理员
 * @param {object} bookingData - 预约请求数据
 */
export const sendBookingNotificationEmail = async (bookingData) => {
  const {
    name, email, phone, age, gender, country,
    whatsapp, messenger,
    procedure, destination, treatment_time, message,
    created_at, id
  } = bookingData

  const subject = `🔔 New Booking Request from ${name}`
  const timestamp = new Date(created_at || Date.now()).toLocaleString('en-US', {
    timeZone: 'Asia/Shanghai',
    dateStyle: 'full',
    timeStyle: 'medium'
  })

  // CSV 附件内容
  const csvData = {
    'Request ID': id || 'N/A',
    'Name': name,
    'Email': email,
    'Phone': phone,
    'WhatsApp': whatsapp || 'Not provided',
    'Messenger': messenger || 'Not provided',
    'Age': age,
    'Gender': gender,
    'Country': country,
    'Procedure': procedure || 'Not specified',
    'Destination': destination || 'Not specified',
    'Treatment Time': treatment_time || 'Not specified',
    'Message': message || 'No message',
    'Submitted At': timestamp
  }
  const csvContent = generateCSV(csvData, Object.keys(csvData))
  const csvBase64 = encodeBase64(csvContent)

  const htmlBody = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #0f766e; display: inline-block; min-width: 140px; }
    .value { color: #334155; }
    .message-box { background: white; padding: 15px; border-left: 4px solid #0f766e; margin-top: 20px; }
    .footer { padding: 15px; text-align: center; color: #64748b; font-size: 12px; }
    .urgent { color: #dc2626; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <h2 style="margin: 0;">🔔 New Booking Request</h2>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">A new consultation request has been submitted</p>
  </div>

  <div class="content">
    <h3 style="color: #0f766e; margin-top: 0;">📋 Patient Information</h3>

    <div class="field">
      <span class="label">Name:</span>
      <span class="value">${name}</span>
    </div>
    <div class="field">
      <span class="label">Email:</span>
      <span class="value"><a href="mailto:${email}">${email}</a></span>
    </div>
    <div class="field">
      <span class="label">Phone:</span>
      <span class="value">${phone}</span>
    </div>
    <div class="field">
      <span class="label">WhatsApp:</span>
      <span class="value">${whatsapp ? `<a href="https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}">${whatsapp}</a>` : '<em>Not provided</em>'}</span>
    </div>
    <div class="field">
      <span class="label">Messenger:</span>
      <span class="value">${messenger || '<em>Not provided</em>'}</span>
    </div>
    <div class="field">
      <span class="label">Age:</span>
      <span class="value">${age} years old</span>
    </div>
    <div class="field">
      <span class="label">Gender:</span>
      <span class="value">${gender}</span>
    </div>
    <div class="field">
      <span class="label">Country:</span>
      <span class="value">${country}</span>
    </div>

    <h3 style="color: #0f766e;">🏥 Treatment Details</h3>

    <div class="field">
      <span class="label">Procedure:</span>
      <span class="value">${procedure || '<em>Not specified</em>'}</span>
    </div>
    <div class="field">
      <span class="label">Destination:</span>
      <span class="value">${destination || '<em>Not specified</em>'}</span>
    </div>
    <div class="field">
      <span class="label">Treatment Time:</span>
      <span class="value ${treatment_time === 'ASAP' ? 'urgent' : ''}">${treatment_time || '<em>Not specified</em>'}</span>
    </div>

    ${message ? `
    <div class="message-box">
      <strong>💬 Patient Message:</strong>
      <p style="margin: 10px 0 0 0; white-space: pre-wrap;">${message}</p>
    </div>
    ` : ''}

    <p style="margin-top: 20px; color: #64748b; font-size: 13px;">
      <strong>Submitted:</strong> ${timestamp}<br/>
      <strong>Request ID:</strong> ${id || 'N/A'}
    </p>
  </div>

  <div class="footer">
    <p>This email was automatically generated by Medora Health system.</p>
    <p>Please respond to the patient within 24 hours.</p>
  </div>
</body>
</html>`

  const textBody = `NEW BOOKING REQUEST
==================

PATIENT INFORMATION
Name: ${name}
Email: ${email}
Phone: ${phone}
WhatsApp: ${whatsapp || 'Not provided'}
Messenger: ${messenger || 'Not provided'}
Age: ${age} years old
Gender: ${gender}
Country: ${country}

TREATMENT DETAILS
Procedure: ${procedure || 'Not specified'}
Destination: ${destination || 'Not specified'}
Treatment Time: ${treatment_time || 'Not specified'}

${message ? `PATIENT MESSAGE:\n${message}\n` : ''}

Submitted: ${timestamp}
Request ID: ${id || 'N/A'}

---
This email was automatically generated by Medora Health system.
Please respond to the patient within 24 hours.`

  // 构建带附件的 MIME 邮件
  const boundary = `----=_Part_${Date.now()}`
  const filename = `booking_request_${name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`

  const rawEmail = [
    `From: ${SENDER_EMAIL}`,
    `To: ${ADMIN_EMAIL}`,
    `Reply-To: ${email}`,
    `Subject: =?UTF-8?B?${encodeBase64(subject)}?=`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
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
    '',
    `--${boundary}`,
    `Content-Type: text/csv; name="${filename}"`,
    'Content-Transfer-Encoding: base64',
    `Content-Disposition: attachment; filename="${filename}"`,
    '',
    csvBase64,
    '',
    `--${boundary}--`
  ].join('\r\n')

  try {
    const command = new SendRawEmailCommand({
      RawMessage: {
        Data: Buffer.from(rawEmail)
      }
    })

    const response = await sesClient.send(command)
    console.log('Booking notification email sent:', response.MessageId)
    return { success: true, messageId: response.MessageId }
  } catch (error) {
    console.error('Failed to send booking notification email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * 发送 Case Intake 提交确认邮件给用户
 * @param {string} recipientEmail - 收件人邮箱
 * @param {string} recipientName - 收件人姓名
 * @param {object} caseIntakeData - Case Intake 数据
 */
export const sendCaseIntakeConfirmationEmail = async (recipientEmail, recipientName, caseIntakeData) => {
  const { id, form_data, submitted_at } = caseIntakeData
  const firstName = recipientName.split(' ')[0] || recipientName

  const subject = '✅ Medical Case Form Submitted Successfully | Medora Health'
  const timestamp = new Date(submitted_at || Date.now()).toLocaleString('en-US', {
    timeZone: 'Asia/Shanghai',
    dateStyle: 'full',
    timeStyle: 'medium'
  })

  // 提取表单数据的关键信息
  const step2 = form_data?.step2 || {}
  const step3 = form_data?.step3 || {}
  const step4 = form_data?.step4 || {}
  const step5 = form_data?.step5 || {}
  const step6 = form_data?.step6 || {}
  const step7 = form_data?.step7 || {}

  const htmlBody = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .section { background: #f8fafc; padding: 15px; margin-bottom: 15px; border-radius: 8px; border-left: 4px solid #0f766e; }
    .section h4 { color: #0f766e; margin: 0 0 10px 0; font-size: 15px; }
    .field { margin-bottom: 8px; font-size: 14px; }
    .label { font-weight: bold; color: #475569; display: inline-block; min-width: 140px; }
    .value { color: #334155; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
    .badge-yes { background: #dcfce7; color: #166534; }
    .badge-no { background: #f3f4f6; color: #6b7280; }
  </style>
</head>
<body>

  <!-- Logo Header -->
  <div style="text-align: center; margin-bottom: 30px; padding: 20px 0; border-bottom: 2px solid #0f766e;">
    <img src="${LOGO_URL}" alt="Medora Health - Premium Care, Right Fare" style="max-width: 220px; height: auto;" />
  </div>

  <!-- Success Banner -->
  <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); padding: 25px; border-radius: 12px; margin-bottom: 25px; border: 1px solid #10b981; text-align: center;">
    <span style="font-size: 48px; display: block; margin-bottom: 15px;">✅</span>
    <h2 style="margin: 0 0 10px 0; color: #065f46; font-size: 22px;">Medical Case Form Submitted Successfully!</h2>
    <p style="margin: 0; color: #047857; font-size: 14px;">Case ID: <strong>${id}</strong></p>
  </div>

  <p>Hi ${firstName},</p>

  <p>Thank you for completing your Medical Case Intake Form. Our medical coordination team will review your information and contact you within <strong>48 hours</strong> with personalized treatment recommendations.</p>

  <p style="font-size: 14px; color: #6b7280;">Submitted on: ${timestamp}</p>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;" />

  <h3 style="color: #0f766e; margin-bottom: 15px;">📋 Your Submitted Information</h3>

  <div class="section">
    <h4>🩺 Chief Complaint & Classification</h4>
    <div class="field">
      <span class="label">Chief Complaint:</span>
      <span class="value">${step2.chiefComplaint || step2.chief_complaint || 'N/A'}</span>
    </div>
    <div class="field">
      <span class="label">Primary Location:</span>
      <span class="value">${step2.primary_location || 'N/A'}</span>
    </div>
    <div class="field">
      <span class="label">Main Category:</span>
      <span class="value">${step2.main_category || step2.mainCategory || 'N/A'}</span>
    </div>
    <div class="field">
      <span class="label">Symptom Nature:</span>
      <span class="value">${Array.isArray(step2.symptom_nature) ? step2.symptom_nature.join(', ') : (step2.symptom_nature || 'N/A')}</span>
    </div>
    <div class="field">
      <span class="label">Diagnosis Stage:</span>
      <span class="value">${step2.current_diagnosis_stage || step2.currentDiagnosisStage || 'N/A'}</span>
    </div>
  </div>

  <div class="section">
    <h4>📝 Present Illness History</h4>
    <div class="field">
      <span class="label">Detailed Symptoms:</span>
      <span class="value">${step3.detailed_symptoms || step3.detailedSymptoms || 'N/A'}</span>
    </div>
    <div class="field">
      <span class="label">Symptom Severity:</span>
      <span class="value">${step3.symptom_severity || step3.symptomSeverity || 'N/A'}</span>
    </div>
    <div class="field">
      <span class="label">Disease Duration:</span>
      <span class="value">${step3.disease_duration_months || step3.diseaseDurationMonths ? `${step3.disease_duration_months || step3.diseaseDurationMonths} months` : 'N/A'}</span>
    </div>
  </div>

  <div class="section">
    <h4>📋 Medical History</h4>
    <div class="field">
      <span class="label">Past Major Diseases:</span>
      <span class="badge ${step4.has_past_major_diseases || step4.hasPastMajorDiseases ? 'badge-yes' : 'badge-no'}">${step4.has_past_major_diseases || step4.hasPastMajorDiseases ? 'Yes' : 'No'}</span>
      ${(step4.past_major_diseases_detail || step4.pastMajorDiseasesDetail) ? `<br/><span style="margin-left: 140px; font-size: 13px; color: #64748b;">${step4.past_major_diseases_detail || step4.pastMajorDiseasesDetail}</span>` : ''}
    </div>
    <div class="field">
      <span class="label">Past Surgeries:</span>
      <span class="badge ${step4.has_past_surgeries || step4.hasPastSurgeries ? 'badge-yes' : 'badge-no'}">${step4.has_past_surgeries || step4.hasPastSurgeries ? 'Yes' : 'No'}</span>
      ${(step4.past_surgeries_detail || step4.pastSurgeriesDetail) ? `<br/><span style="margin-left: 140px; font-size: 13px; color: #64748b;">${step4.past_surgeries_detail || step4.pastSurgeriesDetail}</span>` : ''}
    </div>
    <div class="field">
      <span class="label">Chronic Conditions:</span>
      <span class="badge ${step4.has_chronic_conditions || step4.hasChronicConditions ? 'badge-yes' : 'badge-no'}">${step4.has_chronic_conditions || step4.hasChronicConditions ? 'Yes' : 'No'}</span>
    </div>
    <div class="field">
      <span class="label">Family History:</span>
      <span class="badge ${step4.has_family_history || step4.hasFamilyHistory ? 'badge-yes' : 'badge-no'}">${step4.has_family_history || step4.hasFamilyHistory ? 'Yes' : 'No'}</span>
    </div>
  </div>

  <div class="section">
    <h4>💊 Medications & Allergies</h4>
    <div class="field">
      <span class="label">Current Medications:</span>
      <span class="badge ${step5.has_current_medications || step5.hasCurrentMedications ? 'badge-yes' : 'badge-no'}">${step5.has_current_medications || step5.hasCurrentMedications ? 'Yes' : 'No'}</span>
      ${(step5.current_medications_detail || step5.currentMedicationsDetail) ? `<br/><span style="margin-left: 140px; font-size: 13px; color: #64748b;">${step5.current_medications_detail || step5.currentMedicationsDetail}</span>` : ''}
    </div>
    <div class="field">
      <span class="label">Allergies:</span>
      <span class="badge ${step5.has_allergies || step5.hasAllergies ? 'badge-yes' : 'badge-no'}">${step5.has_allergies || step5.hasAllergies ? 'Yes' : 'No'}</span>
      ${(step5.allergies_detail || step5.allergiesDetail) ? `<br/><span style="margin-left: 140px; font-size: 13px; color: #64748b;">${step5.allergies_detail || step5.allergiesDetail}</span>` : ''}
    </div>
  </div>

  <div class="section">
    <h4>🔬 Tests & Imaging</h4>
    <div class="field">
      <span class="label">Recent Exams:</span>
      <span class="badge ${step6.has_recent_exams || step6.hasRecentExams ? 'badge-yes' : 'badge-no'}">${step6.has_recent_exams || step6.hasRecentExams ? 'Yes' : 'No'}</span>
    </div>
    <div class="field">
      <span class="label">Imaging Available:</span>
      <span class="badge ${step6.has_imaging_available || step6.hasImagingAvailable ? 'badge-yes' : 'badge-no'}">${step6.has_imaging_available || step6.hasImagingAvailable ? 'Yes' : 'No'}</span>
    </div>
    <div class="field">
      <span class="label">Lab Results:</span>
      <span class="badge ${step6.has_lab_results || step6.hasLabResults ? 'badge-yes' : 'badge-no'}">${step6.has_lab_results || step6.hasLabResults ? 'Yes' : 'No'}</span>
    </div>
  </div>

  <div class="section">
    <h4>🎯 Treatment Expectations</h4>
    <div class="field">
      <span class="label">Expectations:</span>
      <span class="value">${Array.isArray(step7.treatment_expectations) ? step7.treatment_expectations.join(', ') : (step7.treatment_expectations || step7.treatmentExpectations || 'N/A')}</span>
    </div>
    <div class="field">
      <span class="label">Budget Range:</span>
      <span class="value">${step7.budget_range || step7.budgetRangeUsd || 'N/A'}</span>
    </div>
    <div class="field">
      <span class="label">Preferred Timing:</span>
      <span class="value">${step7.preferred_timing || step7.preferredTiming || 'N/A'}</span>
    </div>
    ${(step7.additional_notes || step7.additionalNotes) ? `
    <div class="field">
      <span class="label">Additional Notes:</span>
      <span class="value">${step7.additional_notes || step7.additionalNotes}</span>
    </div>
    ` : ''}
  </div>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;" />

  <!-- What Happens Next -->
  <div style="background: #eff6ff; padding: 20px; border-radius: 12px; margin: 25px 0; border: 1px solid #3b82f6;">
    <h3 style="margin: 0 0 15px 0; color: #1e40af; font-size: 16px;">📌 What Happens Next?</h3>
    <ol style="margin: 0; padding-left: 20px; color: #1e3a8a; font-size: 14px;">
      <li style="margin-bottom: 8px;">Our medical team will review your case within <strong>48 hours</strong></li>
      <li style="margin-bottom: 8px;">We'll match you with the most suitable hospitals and specialists</li>
      <li style="margin-bottom: 8px;">You'll receive personalized treatment recommendations and cost estimates</li>
      <li style="margin-bottom: 8px;">A dedicated coordinator will contact you to discuss next steps</li>
    </ol>
  </div>

  <!-- Dashboard Access -->
  <div style="text-align: center; margin: 25px 0;">
    <p style="margin: 0 0 15px 0; color: #374151;">Access your dashboard to track your case status:</p>
    <a href="https://www.medicaltourismchina.health/dashboard" style="display: inline-block; background-color: #0f766e; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
      View My Dashboard →
    </a>
  </div>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;" />

  <p>If you have any questions or need to update your information, please contact us:</p>
  <p style="line-height: 2;">
    <span style="color: #0f766e; font-weight: bold;">📧</span> <a href="mailto:contact@medicaltourismchina.health" style="color: #0f766e; text-decoration: none;">contact@medicaltourismchina.health</a><br/>
    <span style="color: #0f766e; font-weight: bold;">📱</span> WhatsApp: <a href="https://wa.me/14708613825" style="color: #0f766e; text-decoration: none;">(+1) 470-861-3825</a>
  </p>

  <!-- Signature -->
  <div style="margin-top: 30px; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
    <p style="margin: 0;">
      Warm regards,<br/>
      <strong>The Medora Health Team</strong><br/>
      <em style="color: #0f766e;">Premium Care, Right Fare</em>
    </p>
  </div>

  <!-- Footer -->
  <div class="footer">
    <img src="${LOGO_URL}" alt="Medora Health" style="max-width: 120px; height: auto; margin-bottom: 10px;" />
    <p>
      <a href="https://www.medicaltourismchina.health" style="color: #0f766e; text-decoration: none;">www.medicaltourismchina.health</a>
    </p>
    <p>© ${new Date().getFullYear()} Medora Health. All rights reserved.</p>
    <p style="font-size: 11px; color: #9ca3af;">
      This is a confirmation email for your medical case intake submission.<br/>
      Please keep this email for your records.
    </p>
  </div>

</body>
</html>`

  const textBody = `Hi ${firstName},

Thank you for completing your Medical Case Intake Form!

✅ SUBMISSION CONFIRMED
=======================
Case ID: ${id}
Submitted: ${timestamp}

Our medical coordination team will review your information and contact you within 48 hours with personalized treatment recommendations.

YOUR SUBMITTED INFORMATION
==========================

CHIEF COMPLAINT & CLASSIFICATION
Chief Complaint: ${step2.chiefComplaint || step2.chief_complaint || 'N/A'}
Primary Location: ${step2.primary_location || 'N/A'}
Main Category: ${step2.main_category || step2.mainCategory || 'N/A'}
Symptom Nature: ${Array.isArray(step2.symptom_nature) ? step2.symptom_nature.join(', ') : (step2.symptom_nature || 'N/A')}
Diagnosis Stage: ${step2.current_diagnosis_stage || step2.currentDiagnosisStage || 'N/A'}

PRESENT ILLNESS HISTORY
Detailed Symptoms: ${step3.detailed_symptoms || step3.detailedSymptoms || 'N/A'}
Symptom Severity: ${step3.symptom_severity || step3.symptomSeverity || 'N/A'}
Disease Duration: ${step3.disease_duration_months || step3.diseaseDurationMonths ? `${step3.disease_duration_months || step3.diseaseDurationMonths} months` : 'N/A'}

MEDICAL HISTORY
Past Major Diseases: ${step4.has_past_major_diseases || step4.hasPastMajorDiseases ? 'Yes' : 'No'}
Past Surgeries: ${step4.has_past_surgeries || step4.hasPastSurgeries ? 'Yes' : 'No'}
Chronic Conditions: ${step4.has_chronic_conditions || step4.hasChronicConditions ? 'Yes' : 'No'}
Family History: ${step4.has_family_history || step4.hasFamilyHistory ? 'Yes' : 'No'}

MEDICATIONS & ALLERGIES
Current Medications: ${step5.has_current_medications || step5.hasCurrentMedications ? 'Yes' : 'No'}
Allergies: ${step5.has_allergies || step5.hasAllergies ? 'Yes' : 'No'}

TESTS & IMAGING
Recent Exams: ${step6.has_recent_exams || step6.hasRecentExams ? 'Yes' : 'No'}
Imaging Available: ${step6.has_imaging_available || step6.hasImagingAvailable ? 'Yes' : 'No'}
Lab Results: ${step6.has_lab_results || step6.hasLabResults ? 'Yes' : 'No'}

TREATMENT EXPECTATIONS
Expectations: ${Array.isArray(step7.treatment_expectations) ? step7.treatment_expectations.join(', ') : (step7.treatment_expectations || step7.treatmentExpectations || 'N/A')}
Budget Range: ${step7.budget_range || step7.budgetRangeUsd || 'N/A'}
Preferred Timing: ${step7.preferred_timing || step7.preferredTiming || 'N/A'}

WHAT HAPPENS NEXT?
==================
1. Our medical team will review your case within 48 hours
2. We'll match you with the most suitable hospitals and specialists
3. You'll receive personalized treatment recommendations and cost estimates
4. A dedicated coordinator will contact you to discuss next steps

Access your dashboard: https://www.medicaltourismchina.health/dashboard

If you have any questions, please contact us:
📧 Email: contact@medicaltourismchina.health
📱 WhatsApp: (+1) 470-861-3825

Warm regards,
The Medora Health Team
Premium Care, Right Fare

www.medicaltourismchina.health
© ${new Date().getFullYear()} Medora Health. All rights reserved.`

  // 构建 MIME 邮件
  const boundary = `----=_Part_${Date.now()}`

  const rawEmail = [
    `From: ${SENDER_EMAIL}`,
    `To: ${recipientEmail}`,
    `Reply-To: ${REPLY_TO}`,
    `Subject: =?UTF-8?B?${encodeBase64(subject)}?=`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    encodeBase64(textBody),
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    encodeBase64(htmlBody),
    '',
    `--${boundary}--`
  ].join('\r\n')

  try {
    const command = new SendRawEmailCommand({
      RawMessage: {
        Data: Buffer.from(rawEmail)
      }
    })

    const response = await sesClient.send(command)
    console.log('Case intake confirmation email sent to user:', response.MessageId)
    return { success: true, messageId: response.MessageId }
  } catch (error) {
    console.error('Failed to send case intake confirmation email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * 发送 Case Intake 提交通知邮件给管理员
 * @param {object} caseIntakeData - Case Intake 数据
 * @param {object} userData - 用户信息
 */
export const sendCaseIntakeNotificationEmail = async (caseIntakeData, userData) => {
  const { id, form_data, submitted_at, created_at } = caseIntakeData
  const { name, email, phone, whatsapp } = userData

  const subject = `🏥 New Medical Case Intake Submitted by ${name || email}`
  const timestamp = new Date(submitted_at || created_at || Date.now()).toLocaleString('en-US', {
    timeZone: 'Asia/Shanghai',
    dateStyle: 'full',
    timeStyle: 'medium'
  })

  // 提取表单数据的关键信息
  const step2 = form_data?.step2 || {}
  const step3 = form_data?.step3 || {}
  const step4 = form_data?.step4 || {}
  const step5 = form_data?.step5 || {}
  const step6 = form_data?.step6 || {}
  const step7 = form_data?.step7 || {}

  // 生成 JSON 附件
  const jsonContent = JSON.stringify({
    case_intake_id: id,
    patient: { name, email, phone, whatsapp },
    submitted_at: timestamp,
    form_data: form_data
  }, null, 2)
  const jsonBase64 = encodeBase64(jsonContent)

  // 生成 CSV 附件 - 摘要信息
  const summaryData = {
    'Case ID': id,
    'Patient Name': name || 'N/A',
    'Patient Email': email,
    'Patient Phone': phone || 'N/A',
    'Patient WhatsApp': whatsapp || 'N/A',
    'Chief Complaint': step2.chiefComplaint || step2.chief_complaint || 'N/A',
    'Primary Location': step2.primary_location || 'N/A',
    'Main Category': step2.main_category || step2.mainCategory || 'N/A',
    'Symptom Nature': Array.isArray(step2.symptom_nature) ? step2.symptom_nature.join('; ') : (step2.symptom_nature || 'N/A'),
    'Diagnosis Stage': step2.current_diagnosis_stage || step2.currentDiagnosisStage || 'N/A',
    'Detailed Symptoms': step3.detailed_symptoms || step3.detailedSymptoms || 'N/A',
    'Symptom Severity': step3.symptom_severity || step3.symptomSeverity || 'N/A',
    'Disease Duration': step3.disease_duration_months || step3.diseaseDurationMonths || 'N/A',
    'Has Past Diseases': step4.has_past_major_diseases || step4.hasPastMajorDiseases ? 'Yes' : 'No',
    'Has Past Surgeries': step4.has_past_surgeries || step4.hasPastSurgeries ? 'Yes' : 'No',
    'Has Chronic Conditions': step4.has_chronic_conditions || step4.hasChronicConditions ? 'Yes' : 'No',
    'Has Family History': step4.has_family_history || step4.hasFamilyHistory ? 'Yes' : 'No',
    'Has Current Medications': step5.has_current_medications || step5.hasCurrentMedications ? 'Yes' : 'No',
    'Has Allergies': step5.has_allergies || step5.hasAllergies ? 'Yes' : 'No',
    'Has Recent Exams': step6.has_recent_exams || step6.hasRecentExams ? 'Yes' : 'No',
    'Has Imaging': step6.has_imaging_available || step6.hasImagingAvailable ? 'Yes' : 'No',
    'Has Lab Results': step6.has_lab_results || step6.hasLabResults ? 'Yes' : 'No',
    'Treatment Expectations': Array.isArray(step7.treatment_expectations) ? step7.treatment_expectations.join('; ') : (step7.treatment_expectations || 'N/A'),
    'Budget Range': step7.budget_range || step7.budgetRangeUsd || 'N/A',
    'Preferred Timing': step7.preferred_timing || step7.preferredTiming || 'N/A',
    'Submitted At': timestamp
  }
  const csvContent = generateCSV(summaryData, Object.keys(summaryData))
  const csvBase64 = encodeBase64(csvContent)

  const htmlBody = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; }
    .section { background: white; padding: 15px; margin-bottom: 15px; border-radius: 6px; border-left: 4px solid #3b82f6; }
    .section h4 { color: #1e40af; margin: 0 0 10px 0; }
    .field { margin-bottom: 8px; }
    .label { font-weight: bold; color: #475569; display: inline-block; min-width: 160px; }
    .value { color: #334155; }
    .footer { padding: 15px; text-align: center; color: #64748b; font-size: 12px; }
    .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 12px; }
    .badge-yes { background: #dcfce7; color: #166534; }
    .badge-no { background: #fee2e2; color: #991b1b; }
    .attachment-note { background: #fef3c7; border: 1px solid #f59e0b; padding: 10px; border-radius: 6px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <h2 style="margin: 0;">🏥 New Medical Case Intake Submitted</h2>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">A patient has completed their medical case intake form</p>
  </div>

  <div class="content">
    <div class="section">
      <h4>👤 Patient Information</h4>
      <div class="field">
        <span class="label">Name:</span>
        <span class="value">${name || 'N/A'}</span>
      </div>
      <div class="field">
        <span class="label">Email:</span>
        <span class="value"><a href="mailto:${email}">${email}</a></span>
      </div>
      <div class="field">
        <span class="label">Phone:</span>
        <span class="value">${phone || 'N/A'}</span>
      </div>
      <div class="field">
        <span class="label">WhatsApp:</span>
        <span class="value">${whatsapp ? `<a href="https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}">${whatsapp}</a>` : 'N/A'}</span>
      </div>
    </div>

    <div class="section">
      <h4>🩺 Quick Classification (Step 2)</h4>
      <div class="field">
        <span class="label">Chief Complaint:</span>
        <span class="value">${step2.chiefComplaint || step2.chief_complaint || 'N/A'}</span>
      </div>
      <div class="field">
        <span class="label">Primary Location:</span>
        <span class="value">${step2.primary_location || 'N/A'}</span>
      </div>
      <div class="field">
        <span class="label">Main Category:</span>
        <span class="value">${step2.main_category || step2.mainCategory || 'N/A'}</span>
      </div>
      <div class="field">
        <span class="label">Symptom Nature:</span>
        <span class="value">${Array.isArray(step2.symptom_nature) ? step2.symptom_nature.join(', ') : (step2.symptom_nature || 'N/A')}</span>
      </div>
      <div class="field">
        <span class="label">Diagnosis Stage:</span>
        <span class="value">${step2.current_diagnosis_stage || step2.currentDiagnosisStage || 'N/A'}</span>
      </div>
    </div>

    <div class="section">
      <h4>📋 Present Illness (Step 3)</h4>
      <div class="field">
        <span class="label">Detailed Symptoms:</span>
        <span class="value">${step3.detailed_symptoms || step3.detailedSymptoms || 'N/A'}</span>
      </div>
      <div class="field">
        <span class="label">Symptom Severity:</span>
        <span class="value">${step3.symptom_severity || step3.symptomSeverity || 'N/A'}</span>
      </div>
    </div>

    <div class="section">
      <h4>📝 Medical History (Step 4)</h4>
      <div class="field">
        <span class="label">Past Major Diseases:</span>
        <span class="badge ${step4.has_past_major_diseases || step4.hasPastMajorDiseases ? 'badge-yes' : 'badge-no'}">${step4.has_past_major_diseases || step4.hasPastMajorDiseases ? 'Yes' : 'No'}</span>
      </div>
      <div class="field">
        <span class="label">Past Surgeries:</span>
        <span class="badge ${step4.has_past_surgeries || step4.hasPastSurgeries ? 'badge-yes' : 'badge-no'}">${step4.has_past_surgeries || step4.hasPastSurgeries ? 'Yes' : 'No'}</span>
      </div>
      <div class="field">
        <span class="label">Chronic Conditions:</span>
        <span class="badge ${step4.has_chronic_conditions || step4.hasChronicConditions ? 'badge-yes' : 'badge-no'}">${step4.has_chronic_conditions || step4.hasChronicConditions ? 'Yes' : 'No'}</span>
      </div>
      <div class="field">
        <span class="label">Family History:</span>
        <span class="badge ${step4.has_family_history || step4.hasFamilyHistory ? 'badge-yes' : 'badge-no'}">${step4.has_family_history || step4.hasFamilyHistory ? 'Yes' : 'No'}</span>
      </div>
    </div>

    <div class="section">
      <h4>💊 Medications & Allergies (Step 5)</h4>
      <div class="field">
        <span class="label">Current Medications:</span>
        <span class="badge ${step5.has_current_medications || step5.hasCurrentMedications ? 'badge-yes' : 'badge-no'}">${step5.has_current_medications || step5.hasCurrentMedications ? 'Yes' : 'No'}</span>
      </div>
      <div class="field">
        <span class="label">Allergies:</span>
        <span class="badge ${step5.has_allergies || step5.hasAllergies ? 'badge-yes' : 'badge-no'}">${step5.has_allergies || step5.hasAllergies ? 'Yes' : 'No'}</span>
      </div>
    </div>

    <div class="section">
      <h4>🔬 Tests & Imaging (Step 6)</h4>
      <div class="field">
        <span class="label">Recent Exams:</span>
        <span class="badge ${step6.has_recent_exams || step6.hasRecentExams ? 'badge-yes' : 'badge-no'}">${step6.has_recent_exams || step6.hasRecentExams ? 'Yes' : 'No'}</span>
      </div>
      <div class="field">
        <span class="label">Imaging Available:</span>
        <span class="badge ${step6.has_imaging_available || step6.hasImagingAvailable ? 'badge-yes' : 'badge-no'}">${step6.has_imaging_available || step6.hasImagingAvailable ? 'Yes' : 'No'}</span>
      </div>
      <div class="field">
        <span class="label">Lab Results:</span>
        <span class="badge ${step6.has_lab_results || step6.hasLabResults ? 'badge-yes' : 'badge-no'}">${step6.has_lab_results || step6.hasLabResults ? 'Yes' : 'No'}</span>
      </div>
    </div>

    <div class="section">
      <h4>🎯 Treatment Expectations (Step 7)</h4>
      <div class="field">
        <span class="label">Expectations:</span>
        <span class="value">${Array.isArray(step7.treatment_expectations) ? step7.treatment_expectations.join(', ') : (step7.treatment_expectations || 'N/A')}</span>
      </div>
      <div class="field">
        <span class="label">Budget Range:</span>
        <span class="value">${step7.budget_range || step7.budgetRangeUsd || 'N/A'}</span>
      </div>
      <div class="field">
        <span class="label">Preferred Timing:</span>
        <span class="value">${step7.preferred_timing || step7.preferredTiming || 'N/A'}</span>
      </div>
    </div>

    <div class="attachment-note">
      <strong>📎 Attachments:</strong>
      <ul style="margin: 5px 0 0 0; padding-left: 20px;">
        <li>CSV Summary - Quick overview of all form data</li>
        <li>JSON Full Data - Complete form data for system integration</li>
      </ul>
    </div>

    <p style="margin-top: 20px; color: #64748b; font-size: 13px;">
      <strong>Submitted:</strong> ${timestamp}<br/>
      <strong>Case ID:</strong> ${id}
    </p>
  </div>

  <div class="footer">
    <p>This email was automatically generated by Medora Health system.</p>
    <p>Please review the case and contact the patient within 48 hours.</p>
  </div>
</body>
</html>`

  const textBody = `NEW MEDICAL CASE INTAKE SUBMITTED
==================================

PATIENT INFORMATION
Name: ${name || 'N/A'}
Email: ${email}
Phone: ${phone || 'N/A'}
WhatsApp: ${whatsapp || 'N/A'}

QUICK CLASSIFICATION (Step 2)
Chief Complaint: ${step2.chiefComplaint || step2.chief_complaint || 'N/A'}
Primary Location: ${step2.primary_location || 'N/A'}
Main Category: ${step2.main_category || step2.mainCategory || 'N/A'}
Symptom Nature: ${Array.isArray(step2.symptom_nature) ? step2.symptom_nature.join(', ') : (step2.symptom_nature || 'N/A')}
Diagnosis Stage: ${step2.current_diagnosis_stage || step2.currentDiagnosisStage || 'N/A'}

PRESENT ILLNESS (Step 3)
Detailed Symptoms: ${step3.detailed_symptoms || step3.detailedSymptoms || 'N/A'}
Symptom Severity: ${step3.symptom_severity || step3.symptomSeverity || 'N/A'}

MEDICAL HISTORY (Step 4)
Past Major Diseases: ${step4.has_past_major_diseases || step4.hasPastMajorDiseases ? 'Yes' : 'No'}
Past Surgeries: ${step4.has_past_surgeries || step4.hasPastSurgeries ? 'Yes' : 'No'}
Chronic Conditions: ${step4.has_chronic_conditions || step4.hasChronicConditions ? 'Yes' : 'No'}
Family History: ${step4.has_family_history || step4.hasFamilyHistory ? 'Yes' : 'No'}

MEDICATIONS & ALLERGIES (Step 5)
Current Medications: ${step5.has_current_medications || step5.hasCurrentMedications ? 'Yes' : 'No'}
Allergies: ${step5.has_allergies || step5.hasAllergies ? 'Yes' : 'No'}

TESTS & IMAGING (Step 6)
Recent Exams: ${step6.has_recent_exams || step6.hasRecentExams ? 'Yes' : 'No'}
Imaging Available: ${step6.has_imaging_available || step6.hasImagingAvailable ? 'Yes' : 'No'}
Lab Results: ${step6.has_lab_results || step6.hasLabResults ? 'Yes' : 'No'}

TREATMENT EXPECTATIONS (Step 7)
Expectations: ${Array.isArray(step7.treatment_expectations) ? step7.treatment_expectations.join(', ') : (step7.treatment_expectations || 'N/A')}
Budget Range: ${step7.budget_range || step7.budgetRangeUsd || 'N/A'}
Preferred Timing: ${step7.preferred_timing || step7.preferredTiming || 'N/A'}

Submitted: ${timestamp}
Case ID: ${id}

---
This email was automatically generated by Medora Health system.
Please review the case and contact the patient within 48 hours.`

  // 构建带多个附件的 MIME 邮件
  const boundary = `----=_Part_${Date.now()}`
  const patientName = (name || email.split('@')[0]).replace(/\s+/g, '_')
  const dateStr = new Date().toISOString().slice(0, 10)
  const csvFilename = `case_intake_summary_${patientName}_${dateStr}.csv`
  const jsonFilename = `case_intake_full_${patientName}_${dateStr}.json`

  const rawEmail = [
    `From: ${SENDER_EMAIL}`,
    `To: ${ADMIN_EMAIL}`,
    `Reply-To: ${email}`,
    `Subject: =?UTF-8?B?${encodeBase64(subject)}?=`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
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
    '',
    `--${boundary}`,
    `Content-Type: text/csv; name="${csvFilename}"`,
    'Content-Transfer-Encoding: base64',
    `Content-Disposition: attachment; filename="${csvFilename}"`,
    '',
    csvBase64,
    '',
    `--${boundary}`,
    `Content-Type: application/json; name="${jsonFilename}"`,
    'Content-Transfer-Encoding: base64',
    `Content-Disposition: attachment; filename="${jsonFilename}"`,
    '',
    jsonBase64,
    '',
    `--${boundary}--`
  ].join('\r\n')

  try {
    const command = new SendRawEmailCommand({
      RawMessage: {
        Data: Buffer.from(rawEmail)
      }
    })

    const response = await sesClient.send(command)
    console.log('Case intake notification email sent:', response.MessageId)
    return { success: true, messageId: response.MessageId }
  } catch (error) {
    console.error('Failed to send case intake notification email:', error)
    return { success: false, error: error.message }
  }
}
