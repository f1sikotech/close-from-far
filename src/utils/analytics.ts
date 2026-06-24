/**
 * Safe wrapper for Google Analytics tracking using the existing gtag setup.
 */
export function trackEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window !== "undefined" && (window as any).gtag) {
    try {
      (window as any).gtag("event", eventName, params);
      console.log(`[Analytics] Tracked event: ${eventName}`, params);
    } catch (e) {
      console.error(`[Analytics] Error tracking event: ${eventName}`, e);
    }
  } else {
    console.warn(`[Analytics] gtag not found. Event logged to console: ${eventName}`, params);
  }
}
