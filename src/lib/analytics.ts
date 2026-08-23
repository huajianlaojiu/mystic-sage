/**
 * Minimal GA4 helpers. Declares gtag so TypeScript does not complain when
 * gtag is loaded by Google's script tag.
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

const CONSENT_KEY = "mysticsage_cookie_consent";

export function gtagEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", eventName, params);
}

export function gtagConsent(granted: boolean) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("consent", "update", { analytics_storage: granted ? "granted" : "denied" });
}

export function getConsent(): boolean | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(CONSENT_KEY);
  if (v === "granted") return true;
  if (v === "denied") return false;
  return null;
}

export function setConsent(granted: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CONSENT_KEY, granted ? "granted" : "denied");
  gtagConsent(granted);
}
