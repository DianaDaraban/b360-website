import lucrari from "./lucrari.json"
import { clienti } from "./clienti"

export type Lucrare = { src: string; cat: string; client: string | null; w: number; h: number }

export const categorii = [
    { slug: "autoturisme", label: "Autoturisme", singular: "Colantare autoturism" },
    { slug: "autoutilitare", label: "Autoutilitare", singular: "Inscripționare autoutilitară" },
    { slug: "autocare", label: "Autocare", singular: "Inscripționare autocar" },
    { slug: "camioane", label: "Camioane și cisterne", singular: "Inscripționare camion" },
    { slug: "vitrine", label: "Vitrine", singular: "Colantare vitrină" },
    // signage photos are filed under stickers (too few of either to stand alone)
    { slug: "stickere", label: "Stickere și signalistică", singular: "Stickere și signalistică" },
    { slug: "speciale", label: "Moto, bărci, avioane", singular: "Inscripționare" },
] as const

const merged: Record<string, string> = { signalistica: "stickere" }
const withAlt = (lucrari as Lucrare[]).map(raw => {
    const l = { ...raw, cat: merged[raw.cat] ?? raw.cat }
    const cat = categorii.find(c => c.slug === l.cat)
    const client = l.client ? clienti.find(c => c.match?.test(l.client!)) : undefined
    return {
        ...l,
        alt: [cat?.singular, client?.name ?? l.client].filter(Boolean).join(" – "),
        catLabel: cat?.label ?? "",
        clientName: client?.name ?? l.client,
        clientSlug: client?.slug ?? null,
    }
})

// Round-robin over the categories so the unfiltered gallery starts varied, not with 17 coaches
const queues = categorii.map(c => withAlt.filter(l => l.cat === c.slug))
export const toateLucrarile: typeof withAlt = []
while (queues.some(q => q.length)) for (const q of queues) if (q.length) toateLucrarile.push(q.shift()!)
