"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { deleteProject, logoutAction, saveProject, setHidden } from "./actions"
import styles from "./admin.module.css"
import { PrivacyReview } from "./PrivacyReview"
import type { Box } from "./privacy-detect"

type Photo = { src: string; w: number; h: number }
export type AdminProject = {
    slug: string
    title: string
    client: string
    cat: string
    description: string
    photos: Photo[]
    origin: "admin" | "code"     // made in the admin (fully editable) or shipped with the site (texts only)
    hidden: boolean
}
type Category = { slug: string; label: string }

// categories where the scene itself is the work: their photos get the colour and gradient, no blur
const PLAIN = new Set(["tapet", "vitrine", "stickere"])

// phone photos are shrunk in the browser first, so uploads stay small and fast
async function shrink(file: File): Promise<Blob> {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" })
    const scale = Math.min(1, 2400 / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    return new Promise((resolve, reject) => canvas.toBlob(b => (b ? resolve(b) : reject(new Error("canvas"))), "image/jpeg", 0.9))
}

export function AdminPanel({ projects, categories, clients, pricingTab }: { projects: AdminProject[]; categories: Category[]; clients: string[]; pricingTab: React.ReactNode }) {
    const router = useRouter()
    const [tab, setTab] = useState<"proiecte" | "preturi">("proiecte")
    const [query, setQuery] = useState("")
    const [show, setShow] = useState<"toate" | "admin" | "ascunse">("toate")
    const [editing, setEditing] = useState<AdminProject | null>(null)
    const [pending, start] = useTransition()
    const catLabel = (slug: string) => categories.find(c => c.slug === slug)?.label ?? slug

    const list = useMemo(() => {
        const q = query.trim().toLowerCase()
        return projects.filter(p =>
            (show === "toate" || (show === "admin" ? p.origin === "admin" : p.hidden)) &&
            (!q || `${p.title} ${p.client} ${catLabel(p.cat)}`.toLowerCase().includes(q)))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projects, query, show])

    const run = (action: () => Promise<unknown>) => start(async () => { await action(); router.refresh() })
    const blank: AdminProject = { slug: "", title: "", client: "", cat: "autoturisme", description: "", photos: [], origin: "admin", hidden: false }

    return (
        <div className={styles.panel}>
            <header className={styles.head}>
                <h1 className={styles.title}>Administrare</h1>
                <form action={logoutAction}><button className={styles.link}>Ieșire</button></form>
            </header>

            <div className={styles.tabs} role="tablist">
                <button role="tab" aria-selected={tab === "proiecte"} onClick={() => setTab("proiecte")}>Proiecte</button>
                <button role="tab" aria-selected={tab === "preturi"} onClick={() => setTab("preturi")}>Prețuri calculator</button>
            </div>

            {tab === "preturi" && pricingTab}

            {tab === "proiecte" && !editing && (
                <>
                    <div className={styles.toolbar}>
                        <button className="btn" onClick={() => setEditing(blank)}>+ Proiect nou</button>
                        <input className={styles.search} type="search" placeholder="Caută după titlu, client sau categorie" value={query} onChange={e => setQuery(e.target.value)} />
                        <select value={show} onChange={e => setShow(e.target.value as typeof show)} aria-label="Ce proiecte arăt">
                            <option value="toate">Toate ({projects.length})</option>
                            <option value="admin">Adăugate din admin ({projects.filter(p => p.origin === "admin").length})</option>
                            <option value="ascunse">Ascunse ({projects.filter(p => p.hidden).length})</option>
                        </select>
                    </div>
                    <ul className={styles.list} aria-busy={pending}>
                        {list.map(p => (
                            <li key={p.slug} className={styles.row} data-hidden={p.hidden || undefined}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={p.photos[0]?.src} alt="" width={96} height={72} loading="lazy" />
                                <div className={styles.rowText}>
                                    <strong>{p.title}</strong>
                                    <span>{catLabel(p.cat)}{p.client && ` · ${p.client}`} · {p.photos.length} {p.photos.length === 1 ? "fotografie" : "fotografii"}</span>
                                    <span className={styles.badges}>
                                        {p.origin === "admin" && <em className={styles.badgeNew}>adăugat din admin</em>}
                                        {p.hidden && <em className={styles.badgeHidden}>ascuns de pe site</em>}
                                    </span>
                                </div>
                                <div className={styles.rowActions}>
                                    <button onClick={() => setEditing(p)}>Editează</button>
                                    <button onClick={() => run(() => setHidden(p.slug, !p.hidden))}>{p.hidden ? "Arată" : "Ascunde"}</button>
                                    {p.origin === "admin" && (
                                        <button className={styles.danger} onClick={() => confirm(`Ștergi definitiv „${p.title}” și pozele lui?`) && run(() => deleteProject(p.slug))}>Șterge</button>
                                    )}
                                </div>
                            </li>
                        ))}
                        {!list.length && <li className={styles.empty}>Niciun proiect găsit.</li>}
                    </ul>
                </>
            )}

            {tab === "proiecte" && editing && (
                <Editor
                    key={editing.slug || "nou"}
                    project={editing}
                    categories={categories}
                    clients={clients}
                    onClose={() => setEditing(null)}
                    onSaved={() => { setEditing(null); router.refresh() }}
                />
            )}
        </div>
    )
}

function Editor({ project, categories, clients, onClose, onSaved }: {
    project: AdminProject
    categories: Category[]
    clients: string[]
    onClose: () => void
    onSaved: () => void
}) {
    const isNew = !project.slug
    const canEditPhotos = project.origin === "admin"
    const [form, setForm] = useState({ title: project.title, client: project.client, cat: project.cat, description: project.description })
    const [photos, setPhotos] = useState<Photo[]>(project.photos)
    const [plain, setPlain] = useState(PLAIN.has(project.cat))
    const [uploading, setUploading] = useState(0)
    // photos waiting for the plate / face check before they go up, the first one shown
    const [queue, setQueue] = useState<{ name: string; blob: Blob; url: string; boxes: Box[] | null }[]>([])
    const [error, setError] = useState<string | null>(null)
    const [saving, start] = useTransition()
    const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

    // chosen photos are shrunk, then checked for plates and faces one by one (the check runs in the
    // browser); each goes up once its boxes are confirmed, and is blurred on the server
    const choose = async (list: FileList | null) => {
        // copied first: the input is cleared right after, and that empties its FileList
        const files = Array.from(list ?? [])
        if (!files.length) return
        setError(null)
        const { detect } = await import("./privacy-detect")
        for (const file of files) {
            try {
                const blob = await shrink(file)
                const item = { name: file.name, blob, url: URL.createObjectURL(blob), boxes: null as Box[] | null }
                setQueue(q => [...q, item])
                const boxes = await detect(await createImageBitmap(blob)).catch(() => [] as Box[])
                setQueue(q => q.map(x => (x.url === item.url ? { ...x, boxes } : x)))
            } catch {
                setError(`„${file.name}” nu a putut fi citită.`)
            }
        }
    }
    const next = () => setQueue(q => { if (q[0]) URL.revokeObjectURL(q[0].url); return q.slice(1) })
    const upload = async () => {
        const item = queue[0]
        if (!item) return
        next()
        setUploading(n => n + 1)
        try {
            const body = new FormData()
            body.append("photo", item.blob, "photo.jpg")
            body.append("plain", plain ? "1" : "0")
            body.append("blur", JSON.stringify((item.boxes ?? []).filter(b => b.on).map(({ x, y, w, h }) => ({ x, y, w, h }))))
            const res = await fetch("/api/admin/upload", { method: "POST", body })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error)
            setPhotos(p => [...p, json as Photo])
        } catch (e) {
            setError(`„${item.name}” nu a putut fi încărcată${e instanceof Error && e.message ? `: ${e.message}` : "."}`)
        } finally {
            setUploading(n => n - 1)
        }
    }
    const move = (i: number, d: number) => setPhotos(p => {
        const next = [...p]
        ;[next[i], next[i + d]] = [next[i + d], next[i]]
        return next
    })

    const save = () => start(async () => {
        setError(null)
        const res = await saveProject({ slug: project.slug || undefined, ...form, photos: canEditPhotos ? photos : undefined })
        if (res.ok) onSaved()
        else setError(res.error)
    })

    return (
        <div className={styles.card}>
            <h2>{isNew ? "Proiect nou" : "Editează proiectul"}</h2>
            {!canEditPhotos && <p className={styles.note}>Proiectul face parte din galeria inițială: îi poți schimba textele și categoria; pozele rămân cele de acum.</p>}

            <div className={styles.fields}>
                <label>Titlu<input value={form.title} onChange={set("title")} placeholder="ex. FlixBus – autocare" required maxLength={120} /></label>
                <label>Client<input value={form.client} onChange={set("client")} list="admin-clients" placeholder="opțional" maxLength={80} /></label>
                <datalist id="admin-clients">{clients.map(c => <option key={c} value={c} />)}</datalist>
                <label>Categorie
                    <select value={form.cat} onChange={e => { set("cat")(e); setPlain(PLAIN.has(e.target.value)) }}>
                        {categories.map(c => <option key={c.slug} value={c.slug}>{c.label}</option>)}
                    </select>
                </label>
                <label className={styles.wide}>Descriere <small>(opțional, apare sub fotografie)</small>
                    <textarea value={form.description} onChange={set("description")} rows={3} maxLength={1200} />
                </label>
            </div>

            {canEditPhotos && (
                <div className={styles.photos}>
                    <h3>Fotografii <small>(prima e coperta)</small></h3>
                    <ul>
                        {photos.map((p, i) => (
                            <li key={p.src}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={p.src} alt="" />
                                {i === 0 && <em className={styles.cover}>copertă</em>}
                                <div>
                                    <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="Mută mai în față">←</button>
                                    <button onClick={() => move(i, 1)} disabled={i === photos.length - 1} aria-label="Mută mai în spate">→</button>
                                    <button onClick={() => setPhotos(ps => ps.filter(x => x !== p))} aria-label="Scoate fotografia">✕</button>
                                </div>
                            </li>
                        ))}
                        {Array.from({ length: uploading }, (_, i) => <li key={`up-${i}`} className={styles.uploading}>Se procesează…</li>)}
                    </ul>
                    <label className={styles.upload}>
                        + Adaugă fotografii
                        <input type="file" accept="image/*" multiple onChange={e => { choose(e.target.files); e.target.value = "" }} />
                    </label>
                    {queue[0] && (
                        <div className={styles.review}>
                            <h3>Numere și fețe <small>({queue.length === 1 ? "o poză" : `${queue.length} poze`} de verificat)</small></h3>
                            {queue[0].boxes === null ? (
                                <p className={styles.note}>Caut numere de înmatriculare și fețe…</p>
                            ) : (
                                <PrivacyReview url={queue[0].url} boxes={queue[0].boxes} onChange={boxes => setQueue(q => [{ ...q[0], boxes }, ...q.slice(1)])} />
                            )}
                            <div className={styles.actions}>
                                <button type="button" className="btn" onClick={upload} disabled={queue[0].boxes === null}>Încarcă poza</button>
                                <button type="button" className="btn-ghost on-light" onClick={next}>Renunță la ea</button>
                            </div>
                        </div>
                    )}
                    <label className={styles.check}>
                        <input type="checkbox" checked={plain} onChange={e => setPlain(e.target.checked)} />
                        Fără blur pe margini (pentru tapet, vitrine, stickere: acolo decorul e lucrarea)
                    </label>
                    <p className={styles.note}>Pozele primesc automat editarea galeriei: lumină și culori corectate, blur ușor spre margini și gradient închis. Înainte de încărcare, numerele de înmatriculare și fețele găsite se blurează (le poți verifica). Bifa se aplică pozelor încărcate de acum înainte.</p>
                </div>
            )}

            {error && <p className={styles.error} role="alert">{error}</p>}
            <div className={styles.actions}>
                <button className="btn" onClick={save} disabled={saving || uploading > 0 || queue.length > 0}>{saving ? "Se salvează…" : "Salvează"}</button>
                <button className="btn-ghost on-light" onClick={onClose} disabled={saving}>Renunță</button>
            </div>
        </div>
    )
}
