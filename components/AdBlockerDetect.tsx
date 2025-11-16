'use client';

import { useEffect, useState } from 'react';
import { detectAdBlocker } from '@/lib/adsense';
import { X } from 'lucide-react';

const AD_BLOCKER_DISMISS_KEY = 'adBlockerBannerDismissed';

export default function AdBlockerDetect() {
  const [showBanner, setShowBanner] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function checkAdBlocker() {
      // Check if user has already dismissed the banner
      const dismissed = localStorage.getItem(AD_BLOCKER_DISMISS_KEY);
      if (dismissed === 'true') {
        setIsChecking(false);
        return;
      }

      // Detect ad blocker
      try {
        const hasAdBlocker = await detectAdBlocker();
        setShowBanner(hasAdBlocker);
      } catch (error) {
        console.error('Error detecting ad blocker:', error);
      } finally {
        setIsChecking(false);
      }
    }

    checkAdBlocker();
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(AD_BLOCKER_DISMISS_KEY, 'true');
    setShowBanner(false);
  };

  // Don't render anything while checking or if banner shouldn't show
  if (isChecking || !showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom-5">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="font-semibold">Ad Blocker Detected</h3>
              </div>
              <p className="text-sm text-white/90 ml-7">
                We use ads to support our creators and keep this platform free. Please
                consider disabling your ad blocker to help us continue providing quality
                educational content.
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-1 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
