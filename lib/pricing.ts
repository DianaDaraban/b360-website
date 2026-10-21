// The calculator's price model. Every number comes from the price workbook that B360 uploads in /admin
// (sheets Materiale, Piese, Grafică, Setări); the questions and the way the numbers combine live here.
// Shared by the calculator in the browser and by the import in the admin.

export type JobType = "decupată" | "print" | "integrală" | "specială" | "PPF"
export const JOB_TYPES: { id: JobType; label: string; hint: string }[] = [
    { id: "decupată", label: "Branding cu folie decupată", hint: "litere, logo-uri și forme tăiate din folie colorată" },
    { id: "print", label: "Branding cu folie printată și laminată", hint: "grafică color, fotografii, degradeuri" },
    { id: "integrală", label: "Colantare integrală cu folie premium", hint: "toată mașina, schimbare de culoare sau grafică pe toată caroseria" },
    { id: "specială", label: "Folie specială", hint: "carbon, cameleon, mat, satin și altele" },
    { id: "PPF", label: "Protecție cu folie PPF", hint: "folie transparentă care protejează vopseaua" },
]
export const DURATIONS = [
    { years: 1, label: "1–2 ani" },        // the short-life films (1 year in the workbook) qualify
    { years: 3, label: "Până la 3 ani" },
    { years: 5, label: "Până la 5 ani" },
    { years: 7, label: "Până la 7 ani" },
] as const
export type Graphics = "am" | "noi" | "ai"

export type Material = {
    code: string
    name: string
    description: string        // what the client reads (brand, range, what it is); falls back to the name
    type: JobType | "laminare" | "transfer"
    subtype: string            // the kind of special film / PPF (carbon, cameleon, mat…), shown as a choice
    years: number              // how long it lasts on a car
    width: number              // roll width in metres: piece area = linear metres × width
    eur: number                // euro per square metre
    laminate: string | null    // code of the laminate that goes over it, if any
    transfer: string | null    // code of the transfer film used to apply it (thrown away after; priced, never shown)
    printed: boolean           // ink is added for printed films
    labour?: number | null     // its own labour coefficient (a full wrap: 2); empty → the general one from Setări
}
export type PricingConfig = {
    materials: Material[]
    pieces: Record<string, Record<string, number>>   // body type → piece kind → linear metres (one side)
    graphics: { from: number; to: number; eur: number }[]
    // labour: the coefficient for a small job (up to 4 doors and the boot); it slides down to labourLarge
    // as the job grows toward a whole coach (by square metres, between smallMp and largeMp)
    settings: { labour: number; labourLarge?: number; smallMp?: number; largeMp?: number; ink: number; eurRate: number | "BNR"; vat: number; margin: number; aiSurcharge: number }
    updatedAt?: string
}

export type Choice = { years: number; job: JobType; subtype: string; graphics: Graphics; withVat: boolean }

// the material for a job: the cheapest of that type (and kind) lasting at least as long as asked;
// when nothing lasts that long, the longest-lasting one, with a note
export function pickMaterial(cfg: PricingConfig, job: JobType, years: number, subtype = "") {
    // a material with no lifetime filled in (wallpaper, a helper film) is not offered for a vehicle
    const pool = cfg.materials.filter(m => m.type === job && m.years > 0 && (!subtype || m.subtype === subtype))
    if (!pool.length) return null
    const lam = (m: Material) => (m.laminate ? cfg.materials.find(l => l.code === m.laminate && l.type === "laminare") ?? null : null)
    const tr = (m: Material) => (m.transfer ? cfg.materials.find(t => t.code === m.transfer && t.type === "transfer") ?? null : null)
    // compared on what a square metre really costs: the film with its laminate and transfer film
    const cost = (m: Material) => m.eur + (lam(m)?.eur ?? 0) + (tr(m)?.eur ?? 0)
    const fit = pool.filter(m => m.years >= years).sort((a, b) => cost(a) - cost(b))
    const material = fit[0] ?? [...pool].sort((a, b) => b.years - a.years || cost(a) - cost(b))[0]
    const laminate = lam(material), transfer = tr(material)
    return { material, laminate, transfer, shortfall: fit.length ? null : material.years }
}

export const subtypesOf = (cfg: PricingConfig, job: JobType) => [...new Set(cfg.materials.filter(m => m.type === job && m.subtype).map(m => m.subtype))]
export const jobAvailable = (cfg: PricingConfig, job: JobType) => cfg.materials.some(m => m.type === job)

// the labour coefficient for a job of `mp` square metres: the small-job coefficient up to smallMp
// (about 4 doors and a boot), then down in a straight line to the large-job one at largeMp (a coach)
export function labourFor(cfg: PricingConfig, mp: number) {
    const s = cfg.settings, small = s.labour, large = s.labourLarge ?? small
    const a = s.smallMp ?? 10, b = s.largeMp ?? 135
    if (mp <= a || b <= a) return small
    if (mp >= b) return large
    return small + ((large - small) * (mp - a)) / (b - a)
}

export function graphicsPrice(cfg: PricingConfig, pieces: number, graphics: Graphics) {
    if (graphics === "am" || !pieces) return 0
    const tier = cfg.graphics.find(g => pieces >= g.from && pieces <= g.to) ?? cfg.graphics[cfg.graphics.length - 1]
    const eur = tier?.eur ?? 0
    return graphics === "ai" ? eur * (1 + cfg.settings.aiSurcharge / 100) : eur
}

// pieceIds look like "capota" or "usa-fata-st"; the area comes from the piece kind (both sides alike)
// prices are in euro; `rate` turns them into another currency (lei, for the scripts)
export function estimate(cfg: PricingConfig, body: string, pieceIds: string[], choice: Choice, rate = 1) {
    const picked = pickMaterial(cfg, choice.job, choice.years, choice.subtype)
    if (!picked) return null
    const { material, laminate, transfer } = picked
    const perMp = material.eur + (laminate?.eur ?? 0) + (transfer?.eur ?? 0) + (material.printed ? cfg.settings.ink : 0)
    const areas = pieceIds.map(id => ({ id, mp: (cfg.pieces[body]?.[id.replace(/-(st|dr)$/, "")] ?? 0) * material.width }))
    const mp = areas.reduce((n, l) => n + l.mp, 0)
    const labour = material.labour ?? labourFor(cfg, mp)
    const lines = areas.map(l => ({ ...l, eur: l.mp * perMp * labour }))
    const graphicsEur = graphicsPrice(cfg, pieceIds.length, choice.graphics)
    const eur = lines.reduce((n, l) => n + l.eur, 0) + graphicsEur
    const vat = choice.withVat ? 1 + cfg.settings.vat / 100 : 1
    const total = eur * rate * vat
    const round = (n: number) => Math.round(n / 5) * 5
    const m = cfg.settings.margin / 100
    return {
        ...picked,
        perMp,
        labour,
        mp,
        graphicsTotal: round(graphicsEur * rate * vat),
        lines: lines.map(l => ({ ...l, total: round(l.eur * rate * vat) })),
        total: round(total),
        low: round(total * (1 - m)),
        high: round(total * (1 + m)),
    }
}
