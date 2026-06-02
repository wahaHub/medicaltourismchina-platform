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
