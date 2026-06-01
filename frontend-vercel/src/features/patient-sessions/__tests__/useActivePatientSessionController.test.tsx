import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useActivePatientSessionController } from '../useActivePatientSessionController';
import { shouldUseSameOriginPatientProxy } from '@/services/api/crmApiClient';
import { usePatientSessionDetail } from '../usePatientSessions';

vi.mock('../usePatientSessions', () => ({
  usePatientSessionDetail: vi.fn(),
}));

vi.mock('@/services/api/crmApiClient', () => ({
  shouldUseSameOriginPatientProxy: vi.fn(() => false),
}));

class MockWebSocket {
  static instances: MockWebSocket[] = [];

  readonly url: string;
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }

  close() {
    this.onclose?.({} as CloseEvent);
  }
}

describe('useActivePatientSessionController', () => {
  const refetch = vi.fn().mockResolvedValue(null);

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    MockWebSocket.instances = [];
    vi.stubGlobal('WebSocket', MockWebSocket as unknown as typeof WebSocket);
    vi.mocked(shouldUseSameOriginPatientProxy).mockReturnValue(false);
    vi.mocked(usePatientSessionDetail).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      refetch,
    } as never);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('does not recreate the websocket during a normal rerender with the same session id', () => {
    const { result, rerender } = renderHook(
      ({ sessionId }) => useActivePatientSessionController({
        sessionId,
        enabled: true,
        limit: 50,
      }),
      {
        initialProps: {
          sessionId: 'widget-chat:patient-1:case-1',
        },
      },
    );

    expect(MockWebSocket.instances).toHaveLength(1);

    act(() => {
      MockWebSocket.instances[0]?.onopen?.({} as Event);
    });

    expect(result.current.connectionState).toBe('ws');

    rerender({ sessionId: 'widget-chat:patient-1:case-1' });

    expect(MockWebSocket.instances).toHaveLength(1);
  });

  it('falls back to 5s polling while the websocket reconnects, then returns to ws mode', () => {
    const { result } = renderHook(() => useActivePatientSessionController({
      sessionId: 'widget-chat:patient-1:case-1',
      enabled: true,
      limit: 50,
    }));

    expect(MockWebSocket.instances).toHaveLength(1);

    act(() => {
      MockWebSocket.instances[0]?.onclose?.({} as CloseEvent);
    });

    expect(result.current.connectionState).toBe('polling');

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(refetch).toHaveBeenCalled();
    expect(MockWebSocket.instances.length).toBeGreaterThanOrEqual(2);

    act(() => {
      MockWebSocket.instances.at(-1)?.onopen?.({} as Event);
    });

    expect(result.current.connectionState).toBe('ws');
  });

  it('forces a catch-up refetch when the websocket reconnects before the first poll tick', () => {
    const { result } = renderHook(() => useActivePatientSessionController({
      sessionId: 'widget-chat:patient-1:case-1',
      enabled: true,
      limit: 50,
    }));

    expect(MockWebSocket.instances).toHaveLength(1);
    refetch.mockClear();

    act(() => {
      MockWebSocket.instances[0]?.onclose?.({} as CloseEvent);
      vi.advanceTimersByTime(0);
    });

    expect(result.current.connectionState).toBe('polling');
    expect(MockWebSocket.instances.length).toBeGreaterThanOrEqual(2);

    act(() => {
      MockWebSocket.instances.at(-1)?.onopen?.({} as Event);
    });

    expect(result.current.connectionState).toBe('ws');
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('uses stable polling without websocket retries while patient APIs are same-origin proxied', () => {
    vi.mocked(shouldUseSameOriginPatientProxy).mockReturnValue(true);

    const { result } = renderHook(() => useActivePatientSessionController({
      sessionId: 'widget-chat:patient-1:case-1',
      enabled: true,
      limit: 50,
    }));

    expect(MockWebSocket.instances).toHaveLength(0);
    expect(result.current.connectionState).toBe('polling');

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(refetch).toHaveBeenCalledTimes(1);
    expect(MockWebSocket.instances).toHaveLength(0);
  });
});
