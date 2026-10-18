import "server-only"
import { categoryLabel, findClient, proiecte, type Proiect } from "@/data/lucrari"
import { readJSON, writeJSON } from "./store"

// What /admin saves, on top of the projects that ship with the code:
// - added: projects created in the admin (newest first), photos in the media store
// - edits: title / client / category / description changed on any project, by slug
// - hidden: slugs of projects taken off the site
export type AddedProject = {
    slug: string
    title: string
    client: string | null
    cat: string
    description?: string
    photos: { src: string; w: number; h: number }[]
    createdAt: string
}
export type ProjectEdit = { title?: string; client?: string | null; cat?: string; description?: string }
export type AdminContent = { added: AddedProject[]; edits: Record<string, ProjectEdit>; hidden: string[] }

const KEY = "projects"
const EMPTY: AdminContent = { added: [], edits: {}, hidden: [] }

export async function readAdminContent(): Promise<AdminContent> {
    try {
        return { ...EMPTY, ...((await readJSON<AdminContent>(KEY)) ?? {}) }
    } catch {
        // the store is not reachable (e.g. while building): the site still shows the projects in the code
        return EMPTY
    }
}
export const writeAdminContent = (content: AdminContent) => writeJSON(KEY, content)

const build = (p: { slug: string; title: string; client: string | null; cat: string; description?: string; photos: { src: string; w: number; h: number }[] }): Proiect => {
    const client = findClient(p.client)
    const n = p.photos.length
    return {
        slug: p.slug,
        title: p.title,
        cat: p.cat,
        catLabel: categoryLabel(p.cat),
        clientName: client?.name ?? p.client,
        clientSlug: client?.slug ?? null,
        description: p.description || undefined,
        photos: p.photos.map((f, i) => ({ ...f, alt: n > 1 ? `${p.title} (${i + 1} din ${n})` : p.title })),
    }
}

// every project shown on the site: the ones added in the admin first (newest first), then the rest
export async function getProjects(): Promise<Proiect[]> {
    const { added, edits, hidden } = await readAdminContent()
    const fromAdmin = added.map(p => build({ ...p, ...edits[p.slug] }))
    const fromCode = proiecte
        .filter(p => !hidden.includes(p.slug))
        .map(p => {
            const e = edits[p.slug]
            if (!e) return p
            return build({ slug: p.slug, title: e.title ?? p.title, client: e.client !== undefined ? e.client : p.clientName, cat: e.cat ?? p.cat, description: e.description ?? p.description, photos: p.photos })
        })
    return [...fromAdmin.filter(p => !hidden.includes(p.slug)), ...fromCode]
}
