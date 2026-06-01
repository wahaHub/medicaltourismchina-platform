// handlers/case-intakes.mjs
import { supa } from '../config/supabase.mjs'
import { json } from '../utils/response.mjs'
import { sendCaseIntakeNotificationEmail, sendCaseIntakeConfirmationEmail } from '../utils/email.mjs'

/**
 * 从 form_data 中提取结构化字段用于数据库快速查询
 */
const extractStructuredFields = (formData) => {
  const fields = {}

  // Step 2: 快速分类
  if (formData?.step2) {
    fields.chief_complaint = formData.step2.chiefComplaint || null
    fields.main_category = formData.step2.mainCategory || null
    fields.onset_time_category = formData.step2.onsetTimeCategory || null
    fields.current_diagnosis_stage = formData.step2.currentDiagnosisStage || null
  }

  // Step 3: 现病史
  if (formData?.step3) {
    fields.symptom_severity = formData.step3.symptomSeverity || null
    // 计算病程月数
    if (formData.step3.diseaseDurationMonths) {
      fields.disease_duration_months = parseInt(formData.step3.diseaseDurationMonths) || null
    }
  }

  // Step 4: 既往史
  if (formData?.step4) {
    fields.has_past_major_diseases = Boolean(formData.step4.hasPastMajorDiseases)
    fields.has_past_surgeries = Boolean(formData.step4.hasPastSurgeries)
    fields.has_chronic_conditions = Boolean(formData.step4.hasChronicConditions)
    fields.has_family_history = Boolean(formData.step4.hasFamilyHistory)
  }

  // Step 5: 用药和过敏
  if (formData?.step5) {
    fields.has_current_medications = Boolean(formData.step5.hasCurrentMedications)
    fields.has_allergies = Boolean(formData.step5.hasAllergies)
  }

  // Step 6: 检查和检验
  if (formData?.step6) {
    fields.has_recent_exams = Boolean(formData.step6.hasRecentExams)
    fields.has_imaging_available = Boolean(formData.step6.hasImagingAvailable)
    fields.has_lab_results = Boolean(formData.step6.hasLabResults)
  }

  // Step 7: 诊疗期待
  if (formData?.step7) {
    fields.treatment_expectation_primary = formData.step7.treatmentExpectationPrimary || null
    fields.budget_range_usd = formData.step7.budgetRangeUsd || null
    fields.preferred_timing = formData.step7.preferredTiming || null
  }

  return fields
}

/**
 * 获取用户的 case intakes 列表
 * GET /case-intakes?status=draft,submitted
 */
export const getCaseIntakes = async (user, event) => {
  const queryParams = event.queryStringParameters || {}
  const statusFilter = queryParams.status?.split(',') || null

  let query = supa
    .from('case_intakes')
    .select(`
      id,
      status,
      current_step,
      chief_complaint,
      main_category,
      form_data,
      created_at,
      updated_at,
      submitted_at
    `)
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (statusFilter && statusFilter.length > 0) {
    query = query.in('status', statusFilter)
  }

  const { data, error } = await query

  if (error) {
    console.error('Database error:', error)
    return json(400, { error: error.message })
  }

  return json(200, { ok: true, data })
}

/**
 * 获取单个 case intake 详情
 * GET /case-intakes/{id}
 */
export const getCaseIntakeById = async (user, caseIntakeId) => {
  const { data, error } = await supa
    .from('case_intakes')
    .select('*')
    .eq('id', caseIntakeId)
    .eq('user_id', user.id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return json(404, { error: 'Case intake not found' })
    }
    console.error('Database error:', error)
    return json(400, { error: error.message })
  }

  return json(200, { ok: true, data })
}

/**
 * 创建新的 case intake
 * POST /case-intakes
 * @param user - users 表的用户记录 (包含 id)
 * @param authUser - Supabase auth 用户对象 (包含 email, user_metadata 等)
 * @param body - 请求体
 */
export const createCaseIntake = async (user, authUser, body) => {
  const formData = body.form_data || {}
  const currentStep = body.current_step || 2
  const status = body.status || 'draft'

  // 验证 status
  if (!['draft', 'submitted'].includes(status)) {
    return json(400, { error: 'Invalid status. Must be draft or submitted' })
  }

  // 验证 current_step
  if (currentStep < 2 || currentStep > 7) {
    return json(400, { error: 'Invalid current_step. Must be between 2 and 7' })
  }

  // 提取结构化字段
  const structuredFields = extractStructuredFields(formData)

  const payload = {
    user_id: user.id,
    status,
    current_step: currentStep,
    form_data: formData,
    ...structuredFields,
  }

  // 如果是提交状态，设置 submitted_at
  if (status === 'submitted') {
    payload.submitted_at = new Date().toISOString()
  }

  const { data, error } = await supa
    .from('case_intakes')
    .insert([payload])
    .select('*')
    .single()

  if (error) {
    console.error('Database error:', error)
    return json(400, { error: error.message })
  }

  console.log('Created case intake:', data.id, 'status:', status)

  // 如果是提交状态，发送通知邮件给管理员和确认邮件给用户
  if (status === 'submitted') {
    try {
      // 直接从 authUser 获取用户信息（authUser 是 Supabase auth 用户对象）
      const userMeta = authUser?.user_metadata || {}
      const userEmail = authUser?.email || ''
      const userName = userMeta.name || userMeta.full_name || userMeta.first_name || ''

      console.log('Email info - email:', userEmail, 'name:', userName, 'phone:', userMeta.phone)

      // 1. 发送通知邮件给管理员
      const notificationResult = await sendCaseIntakeNotificationEmail(data, {
        name: userName,
        email: userEmail,
        phone: userMeta.phone || ''
      })

      if (notificationResult.success) {
        console.log('Case intake notification email sent successfully')
      } else {
        console.error('Case intake notification email failed:', notificationResult.error)
      }

      // 2. 发送确认邮件给用户
      if (userEmail) {
        const confirmationResult = await sendCaseIntakeConfirmationEmail(userEmail, userName || userEmail.split('@')[0], data)

        if (confirmationResult.success) {
          console.log('Case intake confirmation email sent to user successfully')
        } else {
          console.error('Case intake confirmation email failed:', confirmationResult.error)
        }
      } else {
        console.warn('No user email available, skipping confirmation email')
      }
    } catch (notifyError) {
      console.error('Error sending case intake emails:', notifyError)
    }
  }

  return json(201, { ok: true, data })
}

/**
 * 更新 case intake (保存草稿或提交)
 * PUT /case-intakes/{id}
 * @param user - users 表的用户记录 (包含 id)
 * @param authUser - Supabase auth 用户对象 (包含 email, user_metadata 等)
 * @param caseIntakeId - case intake ID
 * @param body - 请求体
 */
export const updateCaseIntake = async (user, authUser, caseIntakeId, body) => {
  // 首先检查是否存在且属于该用户
  const { data: existing, error: fetchError } = await supa
    .from('case_intakes')
    .select('id, status, user_id')
    .eq('id', caseIntakeId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !existing) {
    return json(404, { error: 'Case intake not found' })
  }

  // 检查是否可以更新 (只有 draft 状态可以更新)
  if (existing.status !== 'draft' && body.status !== 'submitted') {
    return json(400, { error: 'Cannot update a non-draft case intake' })
  }

  const formData = body.form_data || {}
  const currentStep = body.current_step
  const status = body.status

  // 验证 status (如果提供)
  if (status && !['draft', 'submitted'].includes(status)) {
    return json(400, { error: 'Invalid status. Must be draft or submitted' })
  }

  // 验证 current_step (如果提供)
  if (currentStep !== undefined && (currentStep < 2 || currentStep > 7)) {
    return json(400, { error: 'Invalid current_step. Must be between 2 and 7' })
  }

  // 提取结构化字段
  const structuredFields = extractStructuredFields(formData)

  const payload = {
    form_data: formData,
    ...structuredFields,
    updated_at: new Date().toISOString(),
  }

  if (currentStep !== undefined) {
    payload.current_step = currentStep
  }

  if (status) {
    payload.status = status
    // 如果是提交状态，设置 submitted_at
    if (status === 'submitted' && existing.status !== 'submitted') {
      payload.submitted_at = new Date().toISOString()
    }
  }

  const { data, error } = await supa
    .from('case_intakes')
    .update(payload)
    .eq('id', caseIntakeId)
    .eq('user_id', user.id)
    .select('*')
    .single()

  if (error) {
    console.error('Database error:', error)
    return json(400, { error: error.message })
  }

  console.log('Updated case intake:', data.id, 'status:', data.status)

  // 如果状态刚变为 submitted（之前不是 submitted），发送通知邮件给管理员和确认邮件给用户
  if (status === 'submitted' && existing.status !== 'submitted') {
    try {
      // 直接从 authUser 获取用户信息（authUser 是 Supabase auth 用户对象）
      const userMeta = authUser?.user_metadata || {}
      const userEmail = authUser?.email || ''
      const userName = userMeta.name || userMeta.full_name || userMeta.first_name || ''

      console.log('Email info - email:', userEmail, 'name:', userName, 'phone:', userMeta.phone)

      // 1. 发送通知邮件给管理员
      const notificationResult = await sendCaseIntakeNotificationEmail(data, {
        name: userName,
        email: userEmail,
        phone: userMeta.phone || ''
      })

      if (notificationResult.success) {
        console.log('Case intake notification email sent successfully')
      } else {
        console.error('Case intake notification email failed:', notificationResult.error)
      }

      // 2. 发送确认邮件给用户
      if (userEmail) {
        const confirmationResult = await sendCaseIntakeConfirmationEmail(userEmail, userName || userEmail.split('@')[0], data)

        if (confirmationResult.success) {
          console.log('Case intake confirmation email sent to user successfully')
        } else {
          console.error('Case intake confirmation email failed:', confirmationResult.error)
        }
      } else {
        console.warn('No user email available, skipping confirmation email')
      }
    } catch (notifyError) {
      console.error('Error sending case intake emails:', notifyError)
    }
  }

  return json(200, { ok: true, data })
}

/**
 * 删除 case intake (只能删除 draft 状态)
 * DELETE /case-intakes/{id}
 */
export const deleteCaseIntake = async (user, caseIntakeId) => {
  // 首先检查是否存在且属于该用户
  const { data: existing, error: fetchError } = await supa
    .from('case_intakes')
    .select('id, status, user_id')
    .eq('id', caseIntakeId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !existing) {
    return json(404, { error: 'Case intake not found' })
  }

  // 只能删除 draft 状态
  if (existing.status !== 'draft') {
    return json(400, { error: 'Can only delete draft case intakes' })
  }

  const { error } = await supa
    .from('case_intakes')
    .delete()
    .eq('id', caseIntakeId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Database error:', error)
    return json(400, { error: error.message })
  }

  console.log('Deleted case intake:', caseIntakeId)
  return json(200, { ok: true, message: 'Case intake deleted successfully' })
}

/**
 * 获取用户当前的 case intake (draft 优先，否则最新的 submitted)
 * GET /case-intakes/current
 */
export const getCurrentCaseIntake = async (user) => {
  // 首先尝试获取 draft
  let { data, error } = await supa
    .from('case_intakes')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'draft')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()

  // 如果没有 draft，获取最新的 submitted
  if (error?.code === 'PGRST116' || !data) {
    const result = await supa
      .from('case_intakes')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'submitted')
      .order('submitted_at', { ascending: false })
      .limit(1)
      .single()

    data = result.data
    error = result.error
  }

  if (error?.code === 'PGRST116' || !data) {
    // 没有任何 case intake
    return json(200, { ok: true, data: null })
  }

  if (error) {
    console.error('Database error:', error)
    return json(400, { error: error.message })
  }

  return json(200, { ok: true, data })
}

/**
 * 创建 case intake (Token 模式 - 不需要认证)
 * POST /case-intakes/token-submit
 * 用于 sales token 流程 (Flow B)，在前端创建用户后直接提交
 */
export const createCaseIntakeWithToken = async (body) => {
  const { user_id, form_data, sales_token, user_info } = body

  // 验证必需字段
  if (!user_id) {
    return json(400, { error: 'user_id is required' })
  }
  if (!form_data) {
    return json(400, { error: 'form_data is required' })
  }
  if (!user_info || !user_info.email) {
    return json(400, { error: 'user_info with email is required' })
  }

  // 验证 sales token (如果提供)
  if (sales_token) {
    const { data: tokenData, error: tokenError } = await supa
      .from('sales_tokens')
      .select('id, sales_id, status')
      .eq('token', sales_token)
      .single()

    if (tokenError || !tokenData) {
      console.warn('Invalid sales token provided:', sales_token)
      // 不阻止提交，只是记录警告
    } else if (tokenData.status !== 'pending') {
      console.warn('Sales token already used:', sales_token)
    }
  }

  // 提取结构化字段
  const structuredFields = extractStructuredFields(form_data)

  const payload = {
    user_id,
    status: 'submitted',
    current_step: 7,
    form_data,
    submitted_at: new Date().toISOString(),
    ...structuredFields,
  }

  const { data, error } = await supa
    .from('case_intakes')
    .insert([payload])
    .select('*')
    .single()

  if (error) {
    console.error('Database error:', error)
    return json(400, { error: error.message })
  }

  console.log('Created case intake via token mode:', data.id)

  // 如果有 sales token，更新 token 状态并链接到 case intake
  if (sales_token) {
    const { error: updateError } = await supa
      .from('sales_tokens')
      .update({
        status: 'used',
        case_intake_id: data.id,
        used_at: new Date().toISOString()
      })
      .eq('token', sales_token)

    if (updateError) {
      console.error('Error updating sales token:', updateError)
    } else {
      console.log('Sales token linked to case intake:', sales_token)
    }
  }

  // 发送邮件通知
  try {
    const userName = user_info.name || `${user_info.first_name || ''} ${user_info.last_name || ''}`.trim()
    const userEmail = user_info.email
    const userPhone = user_info.phone || ''
    const userWhatsapp = user_info.whatsapp || ''

    // 1. 发送通知邮件给管理员
    const notificationResult = await sendCaseIntakeNotificationEmail(data, {
      name: userName,
      email: userEmail,
      phone: userPhone,
      whatsapp: userWhatsapp
    })

    if (notificationResult.success) {
      console.log('Case intake notification email sent successfully')
    } else {
      console.error('Case intake notification email failed:', notificationResult.error)
    }

    // 2. 发送确认邮件给用户
    const confirmationResult = await sendCaseIntakeConfirmationEmail(
      userEmail,
      userName || userEmail.split('@')[0],
      data
    )

    if (confirmationResult.success) {
      console.log('Case intake confirmation email sent to user successfully')
    } else {
      console.error('Case intake confirmation email failed:', confirmationResult.error)
    }
  } catch (notifyError) {
    console.error('Error sending case intake emails:', notifyError)
  }

  return json(201, { ok: true, data })
}
