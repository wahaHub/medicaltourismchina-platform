import { useEffect, useMemo, useRef, useState } from 'react';
import { shouldUseSameOriginPatientProxy } from '@/services/api/crmApiClient';
import { usePatientSessionDetail } from './usePatientSessions';

const WS_RETRY_DELAYS_MS = [0, 1000, 3000, 5000, 10000] as const;
const FALLBACK_POLL_INTERVAL_MS = 5000;

function buildSessionWebSocketUrl(sessionId: string): string {
  const crmApiBaseUrl = (import.meta.env.VITE_CRM_API_BASE_URL || '').replace(/\/+$/, '');
  const baseOrigin = crmApiBaseUrl
    ? new URL(crmApiBaseUrl, typeof window !== 'undefined' ? window.location.origin : 'http://localhost').origin
    : (typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
  const url = new URL(`/ws/conversations/${sessionId}`, baseOrigin);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  url.searchParams.set('site', 'china');
  return url.toString();
}

export function useActivePatientSessionController(input: {
  sessionId: string | null;
  enabled: boolean;
  limit?: number;
}) {
  const detailQuery = usePatientSessionDetail(input.sessionId, input.limit ?? 50, { enabled: input.enabled });
  const { refetch } = detailQuery;
  const [connectionState, setConnectionState] = useState<'idle' | 'ws' | 'polling'>('idle');
  const retryAttemptRef = useRef(0);
  const retryTimerRef = useRef<number | null>(null);
  const pollingTimerRef = useRef<number | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const needsCatchUpRef = useRef(false);
  const shouldSkipWebSocket = shouldUseSameOriginPatientProxy();

  useEffect(() => {
    if (!input.enabled || !input.sessionId || typeof window === 'undefined' || typeof WebSocket === 'undefined') {
      setConnectionState('idle');
      return;
    }

    let cancelled = false;

    const stopPolling = () => {
      if (pollingTimerRef.current !== null) {
        window.clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
    };

    const startPolling = () => {
      if (cancelled || pollingTimerRef.current !== null) {
        return;
      }

      setConnectionState('polling');
      pollingTimerRef.current = window.setInterval(() => {
        void refetch();
      }, FALLBACK_POLL_INTERVAL_MS);
    };

    if (shouldSkipWebSocket) {
      startPolling();
      return () => {
        cancelled = true;
        setConnectionState('idle');
        stopPolling();
      };
    }

    const scheduleReconnect = () => {
      if (cancelled) {
        return;
      }

      needsCatchUpRef.current = true;
      const nextAttempt = Math.min(retryAttemptRef.current, WS_RETRY_DELAYS_MS.length - 1);
      const delay = WS_RETRY_DELAYS_MS[nextAttempt];
      retryAttemptRef.current = nextAttempt + 1;
      startPolling();

      if (retryTimerRef.current !== null) {
        window.clearTimeout(retryTimerRef.current);
      }

      retryTimerRef.current = window.setTimeout(() => {
        connect();
      }, delay);
    };

    const connect = () => {
      if (cancelled || !input.sessionId) {
        return;
      }

      try {
        const socket = new WebSocket(buildSessionWebSocketUrl(input.sessionId));
        socketRef.current = socket;

        socket.onopen = () => {
          if (cancelled) {
            return;
          }

          const shouldCatchUp = needsCatchUpRef.current;
          needsCatchUpRef.current = false;
          retryAttemptRef.current = 0;
          stopPolling();
          setConnectionState('ws');
          if (shouldCatchUp) {
            void refetch();
          }
        };

        socket.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data) as { type?: string };
            if (payload.type !== 'new_message') {
              return;
            }

            void refetch();
          } catch {
            // Ignore malformed websocket payloads and keep the last stable session detail.
          }
        };

        socket.onerror = () => {
          if (cancelled) {
            return;
          }

          socket.close();
        };

        socket.onclose = () => {
          if (cancelled) {
            return;
          }

          scheduleReconnect();
        };
      } catch {
        scheduleReconnect();
      }
    };

    connect();

    return () => {
      cancelled = true;
      setConnectionState('idle');
      if (retryTimerRef.current !== null) {
        window.clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
      stopPolling();
      needsCatchUpRef.current = false;
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [input.enabled, input.limit, input.sessionId, refetch, shouldSkipWebSocket]);

  return useMemo(() => ({
    ...detailQuery,
    connectionState,
    refresh: detailQuery.refetch,
    isFallbackPolling: connectionState === 'polling',
  }), [connectionState, detailQuery]);
}
