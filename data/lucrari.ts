import lucrari from "./lucrari.json"
import proiecteNoi from "./proiecte.json"
import { clienti } from "./clienti"

export type Lucrare = { src: string; cat: string; client: string | null; w: number; h: number }
type ProiectRaw = { slug: string; title: string; client: string | null; cat: string; photos: { src: string; w: number; h: number }[] }

export const categorii = [
    { slug: "autoturisme", label: "Autoturisme", singular: "Colantare autoturism" },
    { slug: "autoutilitare", label: "Autoutilitare", singular: "Inscripționare autoutilitară" },
    { slug: "autocare", label: "Autocare", singular: "Inscripționare autocar" },
    { slug: "camioane", label: "Camioane și cisterne", singular: "Inscripționare camion" },
    { slug: "vitrine", label: "Vitrine", singular: "Colantare vitrină" },
    { slug: "tapet", label: "Tapet printat", singular: "Tapet printat" },
    // signage photos are filed under stickers (too few of either to stand alone)
    { slug: "stickere", label: "Stickere și signalistică", singular: "Stickere și signalistică" },
    { slug: "speciale", label: "Moto, bărci, avioane", singular: "Inscripționare" },
] as const

export type Foto = { src: string; w: number; h: number; alt: string }
// A project: one job (a car, a fleet, a room) with one or more photos. The gallery shows one tile
// per project; projects with three photos or more get a wide collage tile.
export type Proiect = {
    slug: string
    title: string
    cat: string
    catLabel: string
    clientName: string | null
    clientSlug: string | null
    photos: Foto[]
    description?: string     // optional text shown in the lightbox (projects added from /admin)
}

const merged: Record<string, string> = { signalistica: "stickere" }
// the client of a project, matched by name (the client filter in the gallery uses its slug)
export function findClient(name: string | null) {
    return name ? clienti.find(c => c.match?.test(name)) : undefined
}
const label = (slug: string) => categorii.find(c => c.slug === slug)

// the new projects (Freepik cut-out + one shared look), newest work first
const noi: Proiect[] = (proiecteNoi as ProiectRaw[]).map(p => {
    const client = findClient(p.client)
    return {
        slug: p.slug,
        title: p.title,
        cat: p.cat,
        catLabel: label(p.cat)?.label ?? "",
        clientName: client?.name ?? p.client,
        clientSlug: client?.slug ?? null,
        photos: p.photos.map((f, i) => ({ ...f, alt: p.photos.length > 1 ? `${p.title} (${i + 1} din ${p.photos.length})` : p.title })),
    }
})

// the older photos: one project per client and category (holcim-1, holcim-2 ... belong together)
const vechi: Proiect[] = []
for (const raw of lucrari as Lucrare[]) {
    const cat = merged[raw.cat] ?? raw.cat
    const client = findClient(raw.client)
    const clientName = client?.name ?? raw.client
    const slug = clientName ? `${cat}-${clientName}` : raw.src
    let p = vechi.find(v => v.slug === slug)
    if (!p) {
        p = { slug, title: [label(cat)?.singular, clientName].filter(Boolean).join(" – "), cat, catLabel: label(cat)?.label ?? "", clientName, clientSlug: client?.slug ?? null, photos: [] }
        vechi.push(p)
    }
    p.photos.push({ src: raw.src, w: raw.w, h: raw.h, alt: p.title })
}

// Round-robin over the categories so the unfiltered gallery starts varied, not with a run of coaches
const roundRobin = (list: Proiect[]) => {
    const queues = categorii.map(c => list.filter(l => l.cat === c.slug))
    const out: Proiect[] = []
    while (queues.some(q => q.length)) for (const q of queues) if (q.length) out.push(q.shift()!)
    return out
}
// the projects that ship with the code; lib/projects.ts adds what was saved from /admin on top
export const proiecte: Proiect[] = [...roundRobin(noi), ...roundRobin(vechi)]
export const toateFotografiile = proiecte.flatMap(p => p.photos)
export const categoryLabel = (slug: string) => categorii.find(c => c.slug === slug)?.label ?? ""
