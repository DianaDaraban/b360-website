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

// Enhanced conversions for leads: the email and phone from a sent form go with the next event
// (generate_lead), so Google Ads can match the lead to the ad click. The Google tag hashes them
// (SHA-256) before anything leaves the browser. A no-op until analytics has been accepted.
export function setLeadData(email: string, phone: string) {
    if (typeof window === "undefined" || !window.gtag) return
    // the forms take a Romanian number with or without +40 / 0040 / 0 in front: sent as +40XXXXXXXXX
    const digits = phone.replace(/\D/g, "").replace(/^(0040|40|0)/, "")
    const user = { email: email.trim().toLowerCase(), ...(digits.length === 9 ? { phone_number: `+40${digits}` } : {}) }
    if (user.email || "phone_number" in user) window.gtag("set", "user_data", user)
}
