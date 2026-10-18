import "server-only"
import { defaultPricing } from "@/data/pricing-default"
import type { PricingConfig } from "./pricing"
import { diffPricing, downloadUrl, parseWorkbook } from "./pricing-import"
import { readJSON, writeJSON } from "./store"

// The calculator's prices: the last workbook that passed the checks. The workbook is a Google Sheets /
// Drive file (its link saved in the admin, or PRICING_SHEET_URL) read again at most once an hour, or a
// file uploaded in the admin. A workbook with mistakes never replaces good prices: the mistakes are
// kept in the status for the admin to show.
const PRICES = "pricing"
const SOURCE = "pricing-source"
const STATUS = "pricing-status"
const EVERY = 60 * 60 * 1000

export type PricingStatus = { checkedAt: string; ok: boolean; errors: string[]; changes: string[]; via: "drive" | "upload" }

export async function getSourceLink(): Promise<string | null> {
    const saved = await readJSON<{ url: string | null }>(SOURCE).catch(() => null)
    return saved ? saved.url : process.env.PRICING_SHEET_URL ?? null
}
export const setSourceLink = (url: string | null) => writeJSON(SOURCE, { url })
export const getStatus = () => readJSON<PricingStatus>(STATUS).catch(() => null)

async function stored(): Promise<PricingConfig | null> {
    return readJSON<PricingConfig>(PRICES).catch(() => null)
}

// check a workbook and, when it has no mistakes, make it the calculator's prices
export async function applyWorkbook(file: Buffer, via: PricingStatus["via"]): Promise<PricingStatus> {
    const before = (await stored()) ?? defaultPricing
    const { config, errors } = await parseWorkbook(file)
    const status: PricingStatus = { checkedAt: new Date().toISOString(), ok: Boolean(config), errors, changes: config ? diffPricing(before, config) : [], via }
    if (config) await writeJSON(PRICES, { ...config, updatedAt: status.checkedAt })
    await writeJSON(STATUS, status)
    return status
}

export async function syncFromDrive(): Promise<PricingStatus | null> {
    const link = await getSourceLink()
    const url = link && downloadUrl(link)
    if (!url) return null
    try {
        const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(10_000) })
        if (!res.ok) throw new Error(String(res.status))
        return await applyWorkbook(Buffer.from(await res.arrayBuffer()), "drive")
    } catch {
        const status: PricingStatus = { checkedAt: new Date().toISOString(), ok: false, changes: [], via: "drive", errors: ["Tabelul din Drive nu a putut fi descărcat. Verifică linkul și că e partajat cu „Oricine are linkul”."] }
        await writeJSON(STATUS, status)
        return status
    }
}

// the prices for the calculator; reads the Drive workbook again when the last check is over an hour old
export async function getPricing(): Promise<PricingConfig> {
    try {
        const status = await getStatus()
        if (!status || Date.now() - Date.parse(status.checkedAt) > EVERY) await syncFromDrive()
        const cfg = await stored()
        if (!cfg) return defaultPricing
        // bodies added after the workbook was read (coach, truck) take the default lengths
        const pieces = { ...defaultPricing.pieces, ...cfg.pieces }
        for (const [b, list] of Object.entries(defaultPricing.pieces)) pieces[b] = { ...list, ...cfg.pieces[b] }
        return { ...cfg, pieces }
    } catch {
        return defaultPricing
    }
}

// lei per euro: the rate from the workbook, or the BNR rate of the day when it says "BNR"
export async function eurRate(cfg: PricingConfig): Promise<{ rate: number; source: string }> {
    if (typeof cfg.settings.eurRate === "number") return { rate: cfg.settings.eurRate, source: "fix" }
    try {
        const xml = await (await fetch("https://www.bnr.ro/nbrfxrates.xml", { next: { revalidate: 6 * 3600 } })).text()
        const rate = Number(xml.match(/<Rate currency="EUR">([\d.]+)<\/Rate>/)?.[1])
        if (rate > 3 && rate < 10) return { rate, source: "BNR" }
    } catch {}
    return { rate: 5, source: "estimat" }
}
