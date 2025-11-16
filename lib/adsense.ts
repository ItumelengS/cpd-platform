/**
 * Google AdSense utility functions
 */

/**
 * Load the AdSense script dynamically
 * This is typically handled by Next.js Script component, but can be used for dynamic loading
 */
export function loadAdSenseScript(): void {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;

  if (!adsenseId) {
    console.warn('AdSense ID not configured');
    return;
  }

  // Check if script already exists
  const existingScript = document.querySelector(
    `script[src*="pagead2.googlesyndication.com"]`
  );

  if (existingScript) {
    return;
  }

  // Create and append script
  const script = document.createElement('script');
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`;
  script.async = true;
  script.crossOrigin = 'anonymous';

  document.head.appendChild(script);
}

/**
 * Detect if user has an ad blocker enabled
 * This uses a common technique of attempting to load a test ad element
 * and checking if it's blocked or hidden by ad blocking software
 */
export async function detectAdBlocker(): Promise<boolean> {
  // Create a bait element that ad blockers typically block
  const bait = document.createElement('div');
  bait.className = 'ad ads adsbox doubleclick ad-placement ad-placeholder adbadge BannerAd';
  bait.style.cssText = 'width: 1px; height: 1px; position: absolute; left: -10000px;';

  document.body.appendChild(bait);

  // Wait a moment for ad blockers to process
  await new Promise(resolve => setTimeout(resolve, 100));

  // Check various indicators that ad blockers use
  const isBlocked =
    bait.offsetHeight === 0 ||
    bait.offsetWidth === 0 ||
    bait.offsetParent === null ||
    window.getComputedStyle(bait).display === 'none' ||
    window.getComputedStyle(bait).visibility === 'hidden';

  // Clean up
  document.body.removeChild(bait);

  return isBlocked;
}

/**
 * Track ad impression for analytics
 * This is a placeholder - integrate with your analytics system
 *
 * @param creatorId - ID of the content creator
 * @param adSlot - AdSense ad slot ID
 */
export function trackAdImpression(creatorId: string, adSlot: string): void {
  // TODO: Implement analytics tracking
  // This could send data to your backend API or analytics service

  if (process.env.NODE_ENV === 'development') {
    console.log('Ad impression tracked:', {
      creatorId,
      adSlot,
      timestamp: new Date().toISOString()
    });
  }

  // Example implementation:
  // fetch('/api/analytics/ad-impression', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     creatorId,
  //     adSlot,
  //     timestamp: new Date().toISOString(),
  //     userAgent: navigator.userAgent,
  //     referrer: document.referrer
  //   })
  // }).catch(console.error);
}

/**
 * Get estimated revenue per thousand impressions (eCPM)
 * This is a rough estimate - actual values vary by niche, geography, etc.
 *
 * @param impressions - Number of ad impressions
 * @param averageECPM - Average eCPM (default $2-5 for educational content)
 * @returns Estimated revenue in dollars
 */
export function estimateRevenue(impressions: number, averageECPM: number = 3.5): number {
  return (impressions / 1000) * averageECPM;
}

/**
 * Format revenue for display
 *
 * @param amount - Revenue amount in dollars
 * @returns Formatted currency string
 */
export function formatRevenue(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}
