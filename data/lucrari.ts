import lucrari from "./lucrari.json"

export type Lucrare = { src: string; cat: string; client: string | null; w: number; h: number }

export const categorii = [
    { slug: "autoturisme", label: "Autoturisme", singular: "Colantare autoturism" },
    { slug: "autoutilitare", label: "Autoutilitare", singular: "Inscripționare autoutilitară" },
    { slug: "autocare", label: "Autocare", singular: "Inscripționare autocar" },
    { slug: "camioane", label: "Camioane și cisterne", singular: "Inscripționare camion" },
    { slug: "vitrine", label: "Vitrine", singular: "Colantare vitrină" },
    { slug: "signalistica", label: "Signalistică", singular: "Signalistică" },
    { slug: "stickere", label: "Stickere", singular: "Stickere" },
    { slug: "speciale", label: "Moto, bărci, avioane", singular: "Inscripționare" },
] as const

const withAlt = (lucrari as Lucrare[]).map(l => {
    const cat = categorii.find(c => c.slug === l.cat)
    return { ...l, alt: [cat?.singular, l.client].filter(Boolean).join(" – ") }
})

// Round-robin over the categories so the unfiltered gallery starts varied, not with 17 coaches
const queues = categorii.map(c => withAlt.filter(l => l.cat === c.slug))
export const toateLucrarile: typeof withAlt = []
while (queues.some(q => q.length)) for (const q of queues) if (q.length) toateLucrarile.push(q.shift()!)
