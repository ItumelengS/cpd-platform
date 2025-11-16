'use client';

import { useEffect, useRef, useState } from 'react';

interface UseViewTrackingReturn {
  trackView: () => Promise<void>;
  viewId: string | null;
}

export function useViewTracking(
  contentType: 'course' | 'publication',
  contentId: string
): UseViewTrackingReturn {
  const [viewId, setViewId] = useState<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasTrackedRef = useRef(false);

  const trackView = async () => {
    if (hasTrackedRef.current) return;

    try {
      const response = await fetch('/api/analytics/track-view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentType,
          contentId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setViewId(data.viewId);
        hasTrackedRef.current = true;
        startTimeRef.current = Date.now();
      }
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const updateDuration = async (duration: number) => {
    if (!viewId) return;

    try {
      await fetch('/api/analytics/update-duration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          viewId,
          duration,
        }),
      });
    } catch (error) {
      console.error('Error updating duration:', error);
    }
  };

  // Track initial view on mount
  useEffect(() => {
    trackView();
  }, [contentType, contentId]);

  // Set up interval to update duration every 30 seconds
  useEffect(() => {
    if (!viewId) return;

    intervalRef.current = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      updateDuration(elapsedSeconds);
    }, 30000); // 30 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [viewId]);

  // Send final duration on unmount
  useEffect(() => {
    return () => {
      if (viewId) {
        const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
        // Use navigator.sendBeacon for reliable cleanup tracking
        const data = JSON.stringify({ viewId, duration: elapsedSeconds });
        const blob = new Blob([data], { type: 'application/json' });
        navigator.sendBeacon('/api/analytics/update-duration', blob);
      }
    };
  }, [viewId]);

  return { trackView, viewId };
}
