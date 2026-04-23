'use client';

import { useEffect, useCallback, useRef } from 'react';

export interface AnalyticsEvent {
  eventType: string;
  eventData?: Record<string, any>;
  url?: string;
}

const BATCH_SIZE = 10;
const BATCH_TIMEOUT = 2000; // 2 seconds

export function useAnalytics() {
  const queueRef = useRef<AnalyticsEvent[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const sendEvents = useCallback(async (events: AnalyticsEvent[]) => {
    if (events.length === 0) return;

    try {
      await Promise.all(
        events.map(event =>
          fetch('/api/analytics/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...event,
              url: event.url || window.location.href,
            }),
          }).catch(err => {
            console.warn('Analytics event failed:', err);
          })
        )
      );
    } catch (err) {
      console.warn('Analytics batch failed:', err);
    }
  }, []);

  const flushQueue = useCallback(() => {
    if (queueRef.current.length > 0) {
      sendEvents([...queueRef.current]);
      queueRef.current = [];
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [sendEvents]);

  const trackEvent = useCallback((eventType: string, eventData?: Record<string, any>) => {
    queueRef.current.push({ eventType, eventData });

    if (queueRef.current.length >= BATCH_SIZE) {
      flushQueue();
    } else if (!timeoutRef.current) {
      timeoutRef.current = setTimeout(flushQueue, BATCH_TIMEOUT);
    }
  }, [flushQueue]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      flushQueue();
    };
  }, [flushQueue]);

  return { trackEvent, flushQueue };
}

// Auto-track page views
export function usePageTracking() {
  const { trackEvent, flushQueue } = useAnalytics();

  useEffect(() => {
    // Track initial page view
    trackEvent('page_view', {
      path: window.location.pathname,
      referrer: document.referrer,
    });

    // Track route changes (for Next.js App Router)
    const handleRouteChange = () => {
      trackEvent('page_view', {
        path: window.location.pathname,
      });
    };

    // Listen for popstate (back/forward navigation)
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      flushQueue();
    };
  }, [trackEvent, flushQueue]);
}
