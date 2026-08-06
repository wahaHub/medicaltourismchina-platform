import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../crmApiClient';

describe('CRM API base URL selection', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('uses the same-origin patient proxy on Vercel preview domains', async () => {
    const { shouldUseSameOriginPatientProxy } = await import('../crmApiClient');

    expect(shouldUseSameOriginPatientProxy('frontend-vercel-eta-lemon.vercel.app')).toBe(true);
    expect(shouldUseSameOriginPatientProxy('medicaltourismchina.health')).toBe(true);
    expect(shouldUseSameOriginPatientProxy('www.medicaltourismchina.health')).toBe(true);
  });
});

describe('crmApiRequest', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('adds the china site header to CRM requests', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: vi.fn().mockResolvedValue('{"ok":true}'),
    });
    vi.stubGlobal('fetch', fetchMock);

    const { crmApiRequest } = await import('../crmApiClient');

    await crmApiRequest('/me', { method: 'GET' });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = new Headers(init.headers);
    expect(headers.get('x-medora-site')).toBe('china');
  });

  it('aborts timed chatbot requests and surfaces a TIMEOUT api error', async () => {
    vi.useFakeTimers();

    const fetchMock = vi.fn((_url: string, init?: RequestInit) => new Promise((_, reject) => {
      init?.signal?.addEventListener('abort', () => {
        reject(new DOMException('The operation was aborted.', 'AbortError'));
      });
    }));
    vi.stubGlobal('fetch', fetchMock);

    const { crmApiRequest } = await import('../crmApiClient');

    const requestPromise = crmApiRequest('/api/v3/chatbot/chat', {
      method: 'POST',
      timeoutMs: 10000,
    });
    const timeoutExpectation = expect(requestPromise).rejects.toMatchObject<ApiError>({
      name: 'ApiError',
      status: 408,
      code: 'TIMEOUT',
    });

    await vi.advanceTimersByTimeAsync(10000);
    await timeoutExpectation;

    vi.useRealTimers();
  });
});

describe('patient intake API', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('submits the medical intake through the authenticated CRM patient route', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValue(JSON.stringify({
          template: { id: 'template-1', templateName: 'Default', category: 'DEFAULT' },
        })),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValue(JSON.stringify({
          response: {
            id: 'response-1',
            caseId: 'case-1',
            templateId: 'template-1',
            completionStatus: 'COMPLETED',
          },
        })),
      });
    vi.stubGlobal('fetch', fetchMock);

    const { crmApi } = await import('../crmApiClient');
    const { template } = await crmApi.getIntakeTemplate();
    await crmApi.submitIntakeResponse('case-1', template.id, { step2: { main_category: 'oncology' } });

    expect(fetchMock.mock.calls[0]?.[0]).toBe('/api/patient/qc-templates/by-disease?disease=DEFAULT');
    expect(fetchMock.mock.calls[1]?.[0]).toBe('/api/patient/intake/case-1/response');
    expect(fetchMock.mock.calls[1]?.[1]).toMatchObject({
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        templateId: 'template-1',
        responses: { step2: { main_category: 'oncology' } },
      }),
    });
  });

  it('starts and confirms a Written Review Stripe checkout through CRM orders', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValue(JSON.stringify({
          orderId: 'order-1',
          checkoutUrl: 'https://checkout.stripe.com/c/pay/test',
        })),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValue(JSON.stringify({
          orderId: 'order-1',
          paymentStatus: 'paid',
        })),
      });
    vi.stubGlobal('fetch', fetchMock);

    const { crmApi } = await import('../crmApiClient');
    await crmApi.startWrittenReviewCheckout('case-1', 'written-review-response-1');
    await crmApi.confirmOrderCheckout('cs_test_1');

    expect(fetchMock.mock.calls[0]?.[0]).toBe('/api/patient/orders/written-review/checkout');
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      method: 'POST',
      body: JSON.stringify({ caseId: 'case-1', idempotencyKey: 'written-review-response-1' }),
    });
    expect(fetchMock.mock.calls[1]?.[0]).toBe('/api/patient/orders/checkout-session/cs_test_1/confirm');
  });

  it('retrieves an existing intake response so checkout can be retried', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: vi.fn().mockResolvedValue(JSON.stringify({
        response: {
          id: 'response-1',
          caseId: 'case-1',
          templateId: 'template-1',
          completionStatus: 'COMPLETED',
        },
      })),
    });
    vi.stubGlobal('fetch', fetchMock);

    const { crmApi } = await import('../crmApiClient');
    const result = await crmApi.getIntakeResponse('case-1');

    expect(result.response?.id).toBe('response-1');
    expect(fetchMock.mock.calls[0]?.[0]).toBe('/api/patient/intake/case-1/response');
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({ method: 'GET' });
  });
});
