import { beforeEach, describe, expect, it, vi } from 'vitest';
import { crmApiRequest } from '../crmApiClient';
import { getHistory, patientChatbotApi } from '../patient-chatbot';

vi.mock('../crmApiClient', () => ({
  crmApiRequest: vi.fn(),
}));

describe('patientChatbotApi legacy compatibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exposes only getHistory on the legacy chatbot bridge', () => {
    expect(Object.keys(patientChatbotApi).sort()).toEqual(['getHistory']);
  });

  it('keeps only the legacy chatbot history bridge pinned to the v2 restore route', async () => {
    vi.mocked(crmApiRequest).mockResolvedValue({ ok: true } as never);

    await getHistory({
      sessionId: 'widget-session-1',
      limit: 50,
    });

    expect(vi.mocked(crmApiRequest)).toHaveBeenCalledWith('/api/v2/chatbot/history/widget-session-1?limit=50', {
      method: 'GET',
    });
  });
});
