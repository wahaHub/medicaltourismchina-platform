import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  convertConsultation,
  fetchMedicalFormTemplateById,
  getQuestionnaireResponse,
  initOnboarding,
  patientEntryApi,
  getQuestionnaireTemplate,
  submitQuestionnaireResponse,
} from '../patient-entry';

describe('patientEntryApi.initOnboarding', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('submits onboarding without any captcha token while captcha is disabled', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({
        patientId: 'patient-1',
        caseId: 'case-1',
        restoreToken: 'restore-token-1',
        nextStep: 'messages-ready',
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await initOnboarding({
      name: 'Rosie',
      email: 'rosie@example.com',
      phone: '23534253431',
      age: '',
      gender: 'female',
      country: 'Australia',
      whatsapp: '',
      messenger: '',
      department: 'ENT/Otolaryngology',
      departmentCode: 'ent-otolaryngology',
      disease: '耳朵红了',
      destination: 'Shenzhen',
      treatmentTime: '3-6 months',
    });

    const [, init] = vi.mocked(globalThis.fetch).mock.calls[0]!;
    expect(JSON.parse(String(init?.body))).not.toHaveProperty('captchaToken');
  });

  it('surfaces the first backend validation detail instead of the generic validation failed message', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({
        error: 'Validation failed',
        code: 'VALIDATION_FAILED',
        details: [
          {
            path: ['captchaToken'],
            message: 'Required',
          },
        ],
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect(initOnboarding({
      name: 'Rosie',
      email: 'rosie@example.com',
      phone: '23534253431',
      age: '',
      gender: 'female',
      country: 'Australia',
      whatsapp: '',
      messenger: '',
      department: 'ENT/Otolaryngology',
      departmentCode: 'ent-otolaryngology',
      disease: '耳朵红了',
      destination: 'Shenzhen',
      treatmentTime: '3-6 months',
    })).rejects.toThrow('Captcha verification is required. Please refresh and try again.');
  });
});

describe('patientEntryApi.convertConsultation', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('posts the full conversion draft to the absolute chatbot convert path', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await convertConsultation({
      convertPath: '/api/v2/chatbot/convert',
      requestedAction: 'INVITE_ONLINE_CONSULT',
      conversionDraft: {
        sessionId: 'session-1',
        name: 'Alice',
        email: 'alice@example.com',
        country: 'China',
        conditionSummary: 'Eye pain and blurred vision',
        budget: 'Flexible',
      },
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe('/api/v2/chatbot/convert');
    expect(init).toMatchObject({
      method: 'POST',
      credentials: 'include',
    });
    expect(JSON.parse(String(init?.body))).toEqual({
      requestedAction: 'INVITE_ONLINE_CONSULT',
      sessionId: 'session-1',
      name: 'Alice',
      email: 'alice@example.com',
      country: 'China',
      conditionSummary: 'Eye pain and blurred vision',
      budget: 'Flexible',
    });
  });

  it('rejects partial consult drafts before posting', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect(convertConsultation({
      convertPath: '/api/v2/chatbot/convert',
      requestedAction: 'INVITE_ONLINE_CONSULT',
      conversionDraft: {
        sessionId: 'session-2',
        name: 'Alice',
        email: 'alice@example.com',
        country: '',
        conditionSummary: '',
        budget: '',
      },
    })).rejects.toThrow('Please complete the consultation details before requesting consultation.');

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('throws a helpful error when any consult draft field is still missing', async () => {
    await expect(convertConsultation({
      convertPath: '/api/v2/chatbot/convert',
      requestedAction: 'INVITE_ONLINE_CONSULT',
      conversionDraft: {
        sessionId: 'session-3',
        name: '',
        email: '',
        country: '',
        conditionSummary: '',
        budget: '',
      },
    })).rejects.toThrow('Please complete the consultation details before requesting consultation.');
  });

  it('throws a helpful error when the conversion draft session id is blank', async () => {
    await expect(convertConsultation({
      convertPath: '/api/v2/chatbot/convert',
      requestedAction: 'INVITE_ONLINE_CONSULT',
      conversionDraft: {
        sessionId: '',
        name: 'Alice',
        email: 'alice@example.com',
        country: 'China',
        conditionSummary: 'Eye pain and blurred vision',
        budget: 'Flexible',
      },
    })).rejects.toThrow('Cannot submit consultation request: no active session ID');
  });

  it('throws a helpful error when no active session id is available', async () => {
    await expect(convertConsultation({
      convertPath: '/api/v2/chatbot/convert',
      requestedAction: 'INVITE_ONLINE_CONSULT',
      conversionDraft: {
        sessionId: '',
        name: 'Alice',
        email: 'alice@example.com',
        country: 'China',
        conditionSummary: 'Eye pain and blurred vision',
        budget: 'Flexible',
      },
    })).rejects.toThrow('Cannot submit consultation request: no active session ID');
  });

  it('does not expose the removed temporary-history import API surface', () => {
    expect(patientEntryApi).not.toHaveProperty('importTemporaryHistory');
  });

  it('fetches the formal questionnaire template for the active case', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({
        caseId: 'case-1',
        questions: [
          { id: 'q1', label: 'What is your main concern?', type: 'text', required: true },
        ],
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await getQuestionnaireTemplate({ caseId: 'case-1' });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe('/api/patient/intake/case-1/template');
    expect(init).toMatchObject({
      method: 'GET',
      credentials: 'include',
    });
  });

  it('fetches a patient-safe medical form template by templateId', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({
        template: {
          id: '11111111-1111-4111-8111-111111111111',
          templateName: 'Cancer Intake Template',
          category: 'CANCER',
          procedureTypes: [],
          questions: { steps: [] },
          translations: {},
          isActive: true,
          createdAt: '2026-04-07T00:00:00.000Z',
          updatedAt: '2026-04-07T00:00:00.000Z',
        },
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const result = await fetchMedicalFormTemplateById('11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe('/api/patient/qc-templates/11111111-1111-4111-8111-111111111111?caseId=22222222-2222-4222-8222-222222222222');
    expect(init).toMatchObject({
      method: 'GET',
      credentials: 'include',
    });
    expect(result.category).toBe('CANCER');
  });

  it('prefers customizedQuestions when the patient-safe template response includes customization', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({
        template: {
          id: '11111111-1111-4111-8111-111111111111',
          templateName: 'Cancer Intake Template',
          category: 'CANCER',
          procedureTypes: [],
          questions: {
            steps: [
              {
                id: 'base-step',
                questions: [{ id: 'base-question', prompt: 'Base question', type: 'TEXT', required: true }],
              },
            ],
          },
          translations: {},
          isActive: true,
          createdAt: '2026-04-07T00:00:00.000Z',
          updatedAt: '2026-04-07T00:00:00.000Z',
        },
        customization: {
          customizedQuestions: {
            steps: [
              {
                id: 'custom-step',
                questions: [{ id: 'custom-question', prompt: 'Customized question', type: 'TEXT', required: true }],
              },
            ],
          },
        },
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const result = await fetchMedicalFormTemplateById(
      '11111111-1111-4111-8111-111111111111',
      '22222222-2222-4222-8222-222222222222',
    );

    expect(result.questions).toEqual({
      steps: [
        {
          id: 'custom-step',
          questions: [{ id: 'custom-question', prompt: 'Customized question', type: 'TEXT', required: true }],
        },
      ],
    });
  });

  it('passes the requested templateId through the formal questionnaire template request when available', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({
        caseId: 'case-1',
        templateId: 'template-1',
        questions: [],
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await getQuestionnaireTemplate({ caseId: 'case-1', templateId: 'template-1' });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url] = fetchMock.mock.calls[0]!;
    expect(url).toBe('/api/patient/intake/case-1/template?templateId=template-1');
  });

  it('rejects when the backend questionnaire template does not match the requested templateId', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({
        caseId: 'case-1',
        templateId: 'template-2',
        questions: [],
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect(getQuestionnaireTemplate({ caseId: 'case-1', templateId: 'template-1' }))
      .rejects.toThrow('Questionnaire template mismatch');
  });

  it('submits questionnaire responses to the formal backend response path', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({
        response: {
          id: 'response-1',
          caseId: 'case-1',
          templateId: 'template-1',
        },
      }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await submitQuestionnaireResponse({
      caseId: 'case-1',
      templateId: 'template-1',
      responses: {
        q1: 'Eye pain',
      },
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe('/api/patient/intake/case-1/response');
    expect(init).toMatchObject({
      method: 'POST',
      credentials: 'include',
    });
    expect(JSON.parse(String(init?.body))).toEqual({
      templateId: 'template-1',
      responses: {
        q1: 'Eye pain',
      },
    });
  });

  it('fetches the saved questionnaire response for the active case', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({
        response: {
          id: 'response-1',
          caseId: 'case-1',
          templateId: 'template-1',
          userId: 'patient-1',
          responses: { q1: 'Eye pain' },
          extractedData: null,
          riskFlags: [],
          completionStatus: 'COMPLETED',
          translations: {},
          submittedAt: '2026-04-07T00:00:00.000Z',
          createdAt: '2026-04-07T00:00:00.000Z',
          updatedAt: '2026-04-07T00:00:00.000Z',
        },
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const result = await getQuestionnaireResponse({ caseId: 'case-1' });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe('/api/patient/intake/case-1/response');
    expect(init).toMatchObject({
      method: 'GET',
      credentials: 'include',
    });
    expect(result.response?.responses).toEqual({ q1: 'Eye pain' });
  });
});
