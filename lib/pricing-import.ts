import "server-only"
import readXlsxFile from "read-excel-file/node"
import { panelNames, type BodyId } from "@/data/calculator"
import type { Material, PricingConfig } from "./pricing"
import { defaultPricing } from "@/data/pricing-default"

// Reads the price workbook (uploaded, or fetched from Google Drive / Sheets) into the calculator's
// price model. Columns are found by their heading, so their order does not matter; every value is
// checked and each problem reported with its sheet and row, in words the client understands.

const BODIES: BodyId[] = ["hatchback", "sedan", "break", "suv", "utilitara", "autocar", "camion"]
// added later: a workbook without them keeps the default lengths for them
const OPTIONAL: BodyId[] = ["autocar", "camion"]
const PIECES = Object.keys(panelNames)
const TYPES: Record<string, Material["type"]> = {
    decupata: "decupată", print: "print", integrala: "integrală", speciala: "specială", ppf: "PPF", laminare: "laminare", transfer: "transfer",
}

const plain = (v: unknown) => String(v ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim()
const num = (v: unknown) => {
    if (typeof v === "number") return v
    const n = Number(String(v ?? "").replace(/\s/g, "").replace(",", "."))
    return String(v ?? "").trim() === "" || Number.isNaN(n) ? null : n
}

// a Google Sheets / Drive link → the address that downloads it as .xlsx
export function downloadUrl(link: string) {
    const id = link.match(/\/d\/([\w-]{20,})/)?.[1] ?? link.match(/[?&]id=([\w-]{20,})/)?.[1]
    return id ? `https://docs.google.com/spreadsheets/d/${id}/export?format=xlsx` : null
}

export async function parseWorkbook(input: Buffer): Promise<{ config: PricingConfig | null; errors: string[] }> {
    const errors: string[] = []
    let sheets: { sheet: string; data: unknown[][] }[]
    try {
        sheets = (await readXlsxFile(input)) as { sheet: string; data: unknown[][] }[]
    } catch {
        return { config: null, errors: ["Fișierul nu e un Excel valid (.xlsx)."] }
    }
    const find = (name: string) => sheets.find(s => plain(s.sheet) === plain(name))
    // the rows of a sheet as objects keyed by the column that matches each wanted heading
    // columns named in `optional` may be missing (added to the template later)
    const table = (name: string, columns: Record<string, string[]>, optional: string[] = []) => {
        const s = find(name)
        if (!s) { errors.push(`Lipsește foaia „${name}”.`); return [] }
        const head = (s.data[0] ?? []).map(plain)
        const at: Record<string, number> = {}
        for (const [key, words] of Object.entries(columns)) {
            const i = head.findIndex(h => words.some(w => h.includes(w)))
            if (i < 0 && !optional.includes(key)) errors.push(`Foaia „${name}”: lipsește coloana „${words[0]}”.`)
            at[key] = i
        }
        return s.data.slice(1)
            .map((r, i) => ({ row: i + 2, get: (k: string) => (at[k] >= 0 ? r[at[k]] : undefined) }))
            .filter(r => Object.keys(columns).some(k => String(r.get(k) ?? "").trim() !== ""))
    }

    // ---------- Materiale ----------
    const materials: Material[] = []
    for (const r of table("Materiale", {
        code: ["cod"], name: ["denumire"], type: ["tip"], subtype: ["subtip"], years: ["durata"],
        width: ["latime"], eur: ["euro"], laminate: ["laminare"], printed: ["printeaza"], transfer: ["transfer"], description: ["descriere"],
    }, ["transfer", "description"])) {
        const where = `Materiale, rândul ${r.row}`
        const code = String(r.get("code") ?? "").trim()
        const rawType = plain(r.get("type")), rawSub = plain(r.get("subtype"))
        // spelling slips ("folie tranfer") and PPF filed under integrală are read the way they are meant
        let type = TYPES[rawType] ?? (/tran?s?fer/.test(rawType) ? "transfer" : undefined)
        if (rawSub === "ppf") type = "PPF"
        const years = num(r.get("years")), width = num(r.get("width")), eur = num(r.get("eur"))
        if (!code) { errors.push(`${where}: lipsește codul produsului.`); continue }
        if (!type) { errors.push(`${where}: „tip lucrare” trebuie să fie decupată, print, integrală, specială, PPF, laminare sau transfer.`); continue }
        if (years !== null && years < 0) errors.push(`${where}: durata (ani) nu e un număr pozitiv.`)
        if (!width || width <= 0 || width > 5) errors.push(`${where}: lățimea rolei (m) lipsește sau nu e un număr între 0 și 5.`)
        if (eur === null || eur < 0) errors.push(`${where}: euro/mp lipsește sau nu e un număr.`)
        const laminate = String(r.get("laminate") ?? "").trim()
        const transfer = String(r.get("transfer") ?? "").trim()
        materials.push({
            code, type,
            name: String(r.get("name") ?? "").trim() || code,
            subtype: rawSub === "ppf" ? "" : String(r.get("subtype") ?? "").trim(),
            description: String(r.get("description") ?? "").trim(),
            years: years ?? 0, width: width ?? 0, eur: eur ?? 0,
            laminate: laminate && plain(laminate) !== "null" ? laminate : null,
            transfer: transfer && plain(transfer) !== "null" ? transfer : null,
            printed: plain(r.get("printed")) === "da",
        })
    }
    if (!materials.some(m => m.type !== "laminare" && m.type !== "transfer")) errors.push("Foaia „Materiale” nu are niciun material.")
    for (const m of materials) {
        if (m.laminate && !materials.some(l => l.code === m.laminate && l.type === "laminare"))
            errors.push(`Materiale: ${m.code} se laminează cu ${m.laminate}, dar ${m.laminate} nu există ca „laminare”.`)
        if (m.transfer && !materials.some(l => l.code === m.transfer && l.type === "transfer"))
            errors.push(`Materiale: ${m.code} se montează cu folia de transfer ${m.transfer}, dar ${m.transfer} nu există ca „transfer”.`)
    }
    const dup = materials.map(m => m.code).filter((c, i, a) => a.indexOf(c) !== i)
    if (dup.length) errors.push(`Materiale: codul ${[...new Set(dup)].join(", ")} apare de mai multe ori.`)

    // ---------- Piese ----------
    const pieces: PricingConfig["pieces"] = {}
    for (const r of table("Piese", { body: ["caroserie"], piece: ["cod piesa"], ml: ["metri"] })) {
        const where = `Piese, rândul ${r.row}`
        const body = plain(r.get("body")) as BodyId, piece = plain(r.get("piece")), ml = num(r.get("ml"))
        if (!BODIES.includes(body)) { errors.push(`${where}: caroseria trebuie să fie ${BODIES.join(", ")}.`); continue }
        if (!PIECES.includes(piece)) { errors.push(`${where}: codul piesei „${r.get("piece")}” nu e cunoscut.`); continue }
        if (ml === null || ml < 0) { errors.push(`${where}: metrii liniari lipsesc sau nu sunt un număr.`); continue }
        ;(pieces[body] ??= {})[piece] = ml
    }
    for (const b of BODIES) {
        if (pieces[b]) continue
        if (OPTIONAL.includes(b)) pieces[b] = { ...defaultPricing.pieces[b] }
        else errors.push(`Foaia „Piese” nu are piese pentru ${b}.`)
    }

    // ---------- Grafică ----------
    const graphics: PricingConfig["graphics"] = []
    for (const r of table("Grafică", { from: ["de la"], to: ["pana la"], eur: ["pret"] })) {
        const from = num(r.get("from")), to = num(r.get("to")), eur = num(r.get("eur"))
        if (from === null || to === null || eur === null || to < from) { errors.push(`Grafică, rândul ${r.row}: completează „de la”, „până la” și prețul (numere).`); continue }
        graphics.push({ from, to, eur })
    }
    graphics.sort((a, b) => a.from - b.from)

    // ---------- Setări ----------
    const settings: Partial<PricingConfig["settings"]> = {}
    // the order matters: the more specific labels first ("manopera lucrare mare" before "manopera")
    const keys: [keyof PricingConfig["settings"], string][] = [["labourLarge", "manopera lucrare mare"], ["smallMp", "mp lucrare mica"], ["largeMp", "mp lucrare mare"], ["labour", "manoper"], ["ink", "cerneal"], ["eurRate", "curs"], ["vat", "tva"], ["margin", "marj"], ["aiSurcharge", "reproducere"]]
    const optional = new Set(["labourLarge", "smallMp", "largeMp"])
    for (const r of table("Setări", { key: ["setare"], value: ["valoare"] })) {
        const label = plain(r.get("key"))
        const key = keys.find(([, w]) => label.includes(w))?.[0]
        if (!key) continue
        if (key === "eurRate" && plain(r.get("value")) === "bnr") { settings.eurRate = "BNR"; continue }
        const v = num(r.get("value"))
        if (v === null || v < 0) errors.push(`Setări, rândul ${r.row}: valoarea pentru „${r.get("key")}” nu e un număr.`)
        else settings[key] = v as never
    }
    // the sliding labour coefficient: without its own rows, a large job (a coach) is billed at 3
    if (settings.labourLarge === undefined) settings.labourLarge = defaultPricing.settings.labourLarge
    for (const [key, w] of keys) if (settings[key] === undefined && !optional.has(key)) errors.push(`Foaia „Setări”: lipsește setarea „${w}…”.`)

    if (errors.length) return { config: null, errors }
    return { config: { materials, pieces, graphics, settings: settings as PricingConfig["settings"] }, errors }
}

// what changed between two price sets, as short lines for the admin to check before saving
export function diffPricing(before: PricingConfig, after: PricingConfig): string[] {
    const out: string[] = []
    const fmt = (m: Material) => `${m.code} ${m.name}`
    for (const m of after.materials) {
        const old = before.materials.find(o => o.code === m.code)
        if (!old) { out.push(`Material nou: ${fmt(m)} (${m.type}, ${m.years} ani, ${m.eur} €/mp)`); continue }
        const changes = ([["eur", "€/mp"], ["years", "ani"], ["width", "lățime rolă"], ["type", "tip"], ["subtype", "subtip"], ["laminate", "laminare"], ["printed", "se printează"], ["name", "denumire"]] as const)
            .filter(([k]) => String(old[k] ?? "") !== String(m[k] ?? ""))
            .map(([k, label]) => `${label} ${old[k] ?? "–"} → ${m[k] ?? "–"}`)
        if (changes.length) out.push(`${fmt(m)}: ${changes.join(", ")}`)
    }
    for (const m of before.materials) if (!after.materials.some(n => n.code === m.code)) out.push(`Material scos: ${fmt(m)}`)
    let pieceChanges = 0
    for (const [body, list] of Object.entries(after.pieces)) for (const [k, ml] of Object.entries(list)) if (before.pieces[body]?.[k] !== ml) pieceChanges++
    if (pieceChanges) out.push(`Piese: ${pieceChanges} ${pieceChanges === 1 ? "valoare de metri liniari schimbată" : "valori de metri liniari schimbate"}`)
    if (JSON.stringify(before.graphics) !== JSON.stringify(after.graphics)) out.push(`Grafică: ${after.graphics.map(g => `${g.from}–${g.to} piese ${g.eur} €`).join(", ")}`)
    const names: Record<string, string> = { labourLarge: "coeficient manoperă lucrare mare", smallMp: "mp lucrare mică", largeMp: "mp lucrare mare", labour: "coeficient manoperă", ink: "cerneală", eurRate: "curs EUR", vat: "TVA", margin: "marjă interval", aiSurcharge: "majorare grafică AI" }
    for (const [k, label] of Object.entries(names)) {
        const a = before.settings[k as keyof PricingConfig["settings"]], b = after.settings[k as keyof PricingConfig["settings"]]
        if (a !== b) out.push(`Setări: ${label} ${a} → ${b}`)
    }
    return out
}

