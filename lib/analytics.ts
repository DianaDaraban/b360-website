// Google Analytics 4 with Consent Mode: cookies and identifiers only after the visitor accepts the
// cookie banner, anonymous pings before that (components/CookieConsent)
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? ""
// Microsoft Clarity (session recordings, click and scroll maps): only after "Accept", only on the live site
export const CLARITY_ID = "zgnd2u6pol"
export const CONSENT_KEY = "b360-cookies"          // "da" | "nu", kept in the visitor's browser
export const CONSENT_OPEN = "b360:cookies-open"    // the footer link fires this to show the banner again

declare global {
    interface Window { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void; clarity?: ((...args: unknown[]) => void) & { q?: unknown[][] } }
}

export function readConsent(): string | null {
    try { return localStorage.getItem(CONSENT_KEY) } catch { return null }
}

// a no-op until the tag has loaded; without consent Google receives it as an anonymous ping
// the same event also goes to Clarity (when it runs, i.e. after consent), so its recordings can be
// filtered by it ("saw the price", "asked to be called"...)
export function track(event: string, params: Record<string, string | number> = {}) {
    if (typeof window === "undefined") return
    window.gtag?.("event", event, params)
    window.clarity?.("event", event)
}

// Enhanced conversions for leads: the email and phone from a sent form go with the next event
// (generate_lead), so Google Ads can match the lead to the ad click. The Google tag hashes them
// (SHA-256) before anything leaves the browser. Only after the visitor has accepted cookies.
export function setLeadData(email: string, phone: string) {
    if (typeof window === "undefined" || !window.gtag || readConsent() !== "da") return
    // the forms take a Romanian number with or without +40 / 0040 / 0 in front: sent as +40XXXXXXXXX
    const digits = phone.replace(/\D/g, "").replace(/^(0040|40|0)/, "")
    const user = { email: email.trim().toLowerCase(), ...(digits.length === 9 ? { phone_number: `+40${digits}` } : {}) }
    if (user.email || "phone_number" in user) window.gtag("set", "user_data", user)
}
