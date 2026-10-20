// Google Analytics 4, loaded only after the visitor accepts the cookie banner (components/CookieConsent)
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? ""
export const CONSENT_KEY = "b360-cookies"          // "da" | "nu", kept in the visitor's browser
export const CONSENT_OPEN = "b360:cookies-open"    // the footer link fires this to show the banner again

declare global {
    interface Window { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void }
}

export function readConsent(): string | null {
    try { return localStorage.getItem(CONSENT_KEY) } catch { return null }
}

// a no-op until analytics has been accepted and loaded
export function track(event: string, params: Record<string, string | number> = {}) {
    if (typeof window !== "undefined") window.gtag?.("event", event, params)
}
