"use server"

import { revalidatePath } from "next/cache"
import { isAdmin, logIn, logOut } from "@/lib/admin-auth"
import { readAdminContent, writeAdminContent, type AddedProject, type ProjectEdit } from "@/lib/projects"
import { deleteFile } from "@/lib/store"
import { categorii } from "@/data/lucrari"

// every page that shows projects is rebuilt after a change, so it appears on the site at once
const refresh = () => {
    revalidatePath("/", "layout")
}
const guard = async () => {
    if (!(await isAdmin())) throw new Error("Nu ești autentificat.")
}
const cats = new Set<string>(categorii.map(c => c.slug))
const clean = (s: unknown, max: number) => String(s ?? "").trim().slice(0, max)

export async function loginAction(_prev: string | null, form: FormData): Promise<string | null> {
    const ok = await logIn(String(form.get("password") ?? ""))
    if (!ok) return process.env.ADMIN_PASSWORD ? "Parolă greșită." : "Parola de admin nu e setată pe server (ADMIN_PASSWORD)."
    revalidatePath("/admin")
    return null
}

export async function logoutAction() {
    await logOut()
    revalidatePath("/admin")
}

export type ProjectInput = {
    slug?: string                                   // missing for a new project
    title: string
    client: string
    cat: string
    description: string
    photos?: { src: string; w: number; h: number }[] // only for projects made in the admin
}

const slugify = (s: string) =>
    s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50) || "proiect"

export async function saveProject(input: ProjectInput): Promise<{ ok: true; slug: string } | { ok: false; error: string }> {
    await guard()
    const title = clean(input.title, 120)
    const cat = clean(input.cat, 40)
    if (!title) return { ok: false, error: "Scrie un titlu." }
    if (!cats.has(cat)) return { ok: false, error: "Alege o categorie." }
    const fields = { title, cat, client: clean(input.client, 80) || null, description: clean(input.description, 1200) }

    const content = await readAdminContent()
    const added = content.added.find(p => p.slug === input.slug)
    if (!input.slug || added) {
        const photos = (input.photos ?? []).filter(p => typeof p.src === "string" && p.src.startsWith("/media/"))
        if (!photos.length) return { ok: false, error: "Adaugă cel puțin o fotografie." }
        if (added) {
            // photos taken off the project are deleted from the store too
            for (const old of added.photos) if (!photos.some(p => p.src === old.src)) await deleteFile(old.src.replace(/^\/media\//, ""))
            Object.assign(added, fields, { photos })
            delete content.edits[added.slug]
        } else {
            const slug = `${slugify(title)}-${Date.now().toString(36)}`
            const project: AddedProject = { slug, ...fields, photos, createdAt: new Date().toISOString() }
            content.added.unshift(project)
            input.slug = slug
        }
    } else {
        // a project that ships with the code: only its texts and category can change
        content.edits[input.slug] = fields satisfies ProjectEdit
    }
    await writeAdminContent(content)
    refresh()
    return { ok: true, slug: input.slug! }
}

export async function setHidden(slug: string, hidden: boolean) {
    await guard()
    const content = await readAdminContent()
    content.hidden = content.hidden.filter(s => s !== slug)
    if (hidden) content.hidden.push(slug)
    await writeAdminContent(content)
    refresh()
}

// projects made in the admin are deleted for good (with their photos); the others can only be hidden
export async function deleteProject(slug: string) {
    await guard()
    const content = await readAdminContent()
    const project = content.added.find(p => p.slug === slug)
    if (!project) return
    for (const photo of project.photos) await deleteFile(photo.src.replace(/^\/media\//, ""))
    content.added = content.added.filter(p => p.slug !== slug)
    delete content.edits[slug]
    content.hidden = content.hidden.filter(s => s !== slug)
    await writeAdminContent(content)
    refresh()
}
