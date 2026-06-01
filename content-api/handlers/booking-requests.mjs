// handlers/booking-requests.mjs
import { supa } from '../config/supabase.mjs'
import { json } from '../utils/response.mjs'
import { sendCaseIntakeInviteEmail, sendBookingNotificationEmail } from '../utils/email.mjs'

const SITE_URL = 'https://www.medicaltourismchina.health'

/**
 * 创建预约/咨询请求（公开API，不需要认证）
 * 自动为所有新用户创建无密码账户，这样可以：
 * 1. 生成 Magic Link 让用户填写 Medical Case Intake
 * 2. 关联用户之后的所有请求到同一个账户
 * 3. 用户可以通过 Magic Link 登录或之后设置密码
 */
export const createBookingRequest = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}')

    // 验证必需字段
    const {
      name, email, phone, age, gender, country,
      whatsapp, messenger,
      procedure, destination, treatmentTime,
      message
    } = body

    if (!name || !email || !phone || !age || !gender || !country) {
      return json(400, {
        error: 'Missing required fields',
        details: 'name, email, phone, age, gender, and country are required'
      })
    }

    // At least one of WhatsApp or Messenger is required
    if (!whatsapp && !messenger) {
      return json(400, {
        error: 'Missing contact method',
        details: 'At least WhatsApp or Messenger is required'
      })
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return json(400, { error: 'Invalid email format' })
    }

    let userId = null
    let isNewUser = false
    let existingUser = null

    // 先检查邮箱是否已在 Auth 中注册
    const { data: existingUsers, error: listError } = await supa.auth.admin.listUsers()

    if (listError) {
      console.error('Error checking existing users:', listError)
      return json(500, { error: 'Failed to verify email availability' })
    }

    existingUser = existingUsers?.users?.find(u =>
      u.email?.toLowerCase() === email.toLowerCase()
    )

    if (existingUser) {
      // 用户已存在，使用现有用户 ID
      userId = existingUser.id
      console.log('Using existing user:', userId)
    } else {
      // 新用户：自动创建无密码账户
      // 用户可以通过 Magic Link 登录，之后也可以设置密码
      const { data: authData, error: authError } = await supa.auth.admin.createUser({
        email,
        email_confirm: true, // 自动确认邮箱
        user_metadata: {
          name,
          phone,
          age: parseInt(age),
          gender,
          country,
          whatsapp: whatsapp || null,
          messenger: messenger || null,
          has_password: false // 标记用户没有设置密码
        }
      })

      if (authError) {
        console.error('Auto account creation error:', authError)
        // 账户创建失败不阻止预约请求，继续作为匿名请求处理
        console.log('Proceeding as anonymous request due to account creation failure')
      } else {
        userId = authData.user.id
        isNewUser = true
        console.log('Created new passwordless user:', userId)
      }
    }

    // 保存咨询/预约请求到数据库（包含新字段）
    const requestPayload = {
      user_id: userId, // null if anonymous
      name,
      email,
      phone,
      age: parseInt(age),
      gender,
      country,
      whatsapp: whatsapp || null,
      messenger: messenger || null,
      procedure: procedure || null,
      destination: destination || null,
      treatment_time: treatmentTime || null,
      message: message || null,
      status: 'pending',
      is_anonymous: !userId // 标记是否为匿名请求
    }

    const { data: bookingData, error: bookingError } = await supa
      .from('booking_requests')
      .insert([requestPayload])
      .select('id,name,email,phone,status,created_at')
      .single()

    if (bookingError) {
      console.error('Booking request creation error:', bookingError)

      // 如果创建预约失败但已创建用户，尝试回滚（删除用户）
      if (userId && isNewUser) {
        try {
          await supa.auth.admin.deleteUser(userId)
          console.log('Rolled back user creation:', userId)
        } catch (rollbackError) {
          console.error('Rollback failed:', rollbackError)
        }
      }

      return json(400, {
        error: 'Failed to create booking request',
        details: bookingError.message
      })
    }

    console.log('Created booking request:', bookingData.id)

    // 发送通知邮件给管理员（带附件）
    let adminNotificationSent = false
    try {
      const notificationResult = await sendBookingNotificationEmail({
        id: bookingData.id,
        name,
        email,
        phone,
        age: parseInt(age),
        gender,
        country,
        whatsapp: whatsapp || null,
        messenger: messenger || null,
        procedure: procedure || null,
        destination: destination || null,
        treatment_time: treatmentTime || null,
        message: message || null,
        created_at: bookingData.created_at
      })
      adminNotificationSent = notificationResult.success
      if (!notificationResult.success) {
        console.error('Admin notification email failed:', notificationResult.error)
      } else {
        console.log('Admin notification email sent successfully')
      }
    } catch (notifyError) {
      console.error('Error sending admin notification:', notifyError)
    }

    // 生成 Magic Link 并发送邮件
    let emailSent = false
    let magicLinkError = null

    try {
      // 生成 Magic Link
      const { data: linkData, error: linkError } = await supa.auth.admin.generateLink({
        type: 'magiclink',
        email: email,
        options: {
          redirectTo: `${SITE_URL}/medical-case-intake`
        }
      })

      if (linkError) {
        console.error('Magic link generation error:', linkError)
        magicLinkError = linkError.message
      } else {
        // 从 linkData 获取 magic link URL
        // Supabase 返回的是 action_link，格式为:
        // https://xxx.supabase.co/auth/v1/verify?token=xxx&type=magiclink&redirect_to=xxx
        const magicLink = linkData.properties?.action_link

        if (magicLink) {
          console.log('Generated magic link for:', email)

          // 发送邮件（包含完整的用户信息作为确认）
          const emailResult = await sendCaseIntakeInviteEmail(
            email,
            name,
            magicLink,
            {
              procedure,
              destination,
              treatmentTime,
              phone,
              age: parseInt(age),
              gender,
              country,
              whatsapp: whatsapp || null,
              messenger: messenger || null,
              requestId: bookingData.id
            }
          )

          emailSent = emailResult.success
          if (!emailResult.success) {
            console.error('Email sending failed:', emailResult.error)
            magicLinkError = emailResult.error
          }
        } else {
          console.error('Magic link URL not found in response')
          magicLinkError = 'Magic link URL not found'
        }
      }
    } catch (emailError) {
      console.error('Error in magic link/email process:', emailError)
      magicLinkError = emailError.message
    }

    // 返回成功响应（即使邮件发送失败，预约请求仍然成功）
    return json(201, {
      ok: true,
      data: bookingData,
      emailSent: emailSent,
      message: emailSent
        ? 'Booking request submitted successfully. Please check your email to complete your Medical Case Intake for personalized recommendations.'
        : 'Booking request submitted successfully. We will contact you soon.',
      ...(magicLinkError && !emailSent && { emailNote: 'We could not send the intake form email, but your request has been recorded.' })
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return json(500, { error: 'Internal server error', details: error.message })
  }
}
