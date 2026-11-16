// Where a visitor came from, sent along with the site forms so every request e-mail says whether it
// came from our Google Ads, a Google search, social media and so on. Read once, on the first page of
// the visit, and kept only in memory: nothing is stored in the browser, so a reload or a new tab
// starts over (the visit then counts as "direct").

let first: { sursa: string; intrare: string } | null = null

const SEARCH: [RegExp, string][] = [
    [/(^|\.)google\./, "Google – căutare gratuită"],
    [/(^|\.)bing\.com$/, "Bing – căutare"],
    [/(^|\.)duckduckgo\.com$/, "DuckDuckGo – căutare"],
    [/(^|\.)yahoo\.com$/, "Yahoo – căutare"],
    [/(^|\.)(chatgpt\.com|openai\.com)$/, "ChatGPT"],
    [/(^|\.)perplexity\.ai$/, "Perplexity"],
    [/(^|\.)(facebook\.com|fb\.com|fb\.me)$/, "Facebook"],
    [/(^|\.)instagram\.com$/, "Instagram"],
    [/(^|\.)tiktok\.com$/, "TikTok"],
    [/(^|\.)linkedin\.com$|(^|\.)lnkd\.in$/, "LinkedIn"],
    [/(^|\.)youtube\.com$/, "YouTube"],
]

function describe(): string {
    const q = new URLSearchParams(location.search)
    if (q.has("gclid") || q.has("gbraid") || q.has("wbraid") || q.get("utm_medium") === "cpc" && /google/i.test(q.get("utm_source") ?? ""))
        return "Google Ads – reclamă"
    const utm = q.get("utm_source")
    if (utm) return [utm, q.get("utm_medium"), q.get("utm_campaign")].filter(Boolean).join(" / ")
    if (q.has("fbclid")) return "Facebook / Instagram – link"

    let host = ""
    try { host = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, "") : "" } catch {}
    if (!host || host === location.hostname.replace(/^www\./, "")) return "Direct – adresa scrisă, un link salvat sau trimis (WhatsApp, email)"
    // the Android Google app sends this as the referrer
    if (host === "com.google.android.googlequicksearchbox") return "Google – căutare gratuită"
    return SEARCH.find(([re]) => re.test(host))?.[1] ?? `Link de pe ${host}`
}

// called once, as the first page of the visit loads
export function rememberSource() {
    if (first || typeof window === "undefined") return
    first = { sursa: describe(), intrare: location.pathname }
}

// the fields added to a form before it is sent
export function sourceFields(): Record<string, string> {
    rememberSource()
    return { sursa: first!.sursa, intrare: first!.intrare, trimisDe: location.pathname }
}
