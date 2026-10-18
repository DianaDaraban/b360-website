"use client"

import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { Carousel } from "./Carousel"
import { tilts } from "@/data/clienti"
import type { Proiect } from "@/data/lucrari"
import styles from "./Gallery.module.css"

type Category = { slug: string; label: string }
type ClientLogo = { slug: string; name: string; logo: string }

const PAGE = 24
const THUMB = "(min-width: 1024px) 290px, (min-width: 640px) 31vw, 47vw"
const WIDE = "(min-width: 1024px) 600px, (min-width: 640px) 64vw, 96vw"

export function Gallery({ items, categories, clients }: { items: Proiect[]; categories: readonly Category[]; clients: ClientLogo[] }) {
    const router = useRouter()
    const params = useSearchParams()
    const category = params.get("categorie") ?? ""
    const client = params.get("client") ?? ""
    const [shown, setShown] = useState(PAGE)
    // the open project (index in the filtered list) and the photo shown inside it
    const [open, setOpen] = useState<{ p: number; f: number } | null>(null)
    const [loaded, setLoaded] = useState<string | null>(null)
    const dialog = useRef<HTMLDialogElement>(null)
    const filters = useRef<HTMLDivElement>(null)

    // the pressed category chip is brought to the middle of the (scrollable) chip strip
    useEffect(() => {
        const strip = filters.current
        const chip = strip?.querySelector<HTMLElement>("[aria-pressed='true']")
        if (!strip || !chip || strip.scrollWidth <= strip.clientWidth) return
        strip.scrollTo({ left: chip.offsetLeft - (strip.clientWidth - chip.offsetWidth) / 2, behavior: "smooth" })
    }, [category, client])

    // a fresh order on every visit, so the gallery never opens on the same projects; it is shuffled
    // after the first render, as the server-rendered HTML must match the first client render
    const [shuffled, setShuffled] = useState<Proiect[] | null>(null)
    useEffect(() => {
        const list = [...items]
        for (let i = list.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[list[i], list[j]] = [list[j], list[i]]
        }
        setShuffled(list)
    }, [items])
    const all = shuffled ?? items
    const filtered = client ? all.filter(i => i.clientSlug === client) : category ? all.filter(i => i.cat === category) : all
    const visible = filtered.slice(0, shown)
    const project = open ? filtered[open.p] : null
    const photo = project && open ? project.photos[open.f] : null

    const go = (query: string) => {
        setShown(PAGE)
        router.replace(query ? `/portofoliu?${query}` : "/portofoliu", { scroll: false })
    }
    const show = (p: number, f = 0) => {
        setOpen({ p, f })
        if (!dialog.current?.open) dialog.current?.showModal()
    }
    // the arrows walk through the photos of the project, then on to the next project
    const step = (delta: number) => setOpen(o => {
        if (!o) return o
        const f = o.f + delta
        if (f >= 0 && f < filtered[o.p].photos.length) return { p: o.p, f }
        const p = (o.p + delta + filtered.length) % filtered.length
        return { p, f: delta > 0 ? 0 : filtered[p].photos.length - 1 }
    })
    const neighbours = open && project ? [-1, 1].map(d => {
        const f = open.f + d
        if (f >= 0 && f < project.photos.length) return project.photos[f]
        const p = filtered[(open.p + d + filtered.length) % filtered.length]
        return d > 0 ? p.photos[0] : p.photos[p.photos.length - 1]
    }) : []

    return (
        <>
            <div ref={filters} className={styles.filters} role="group" aria-label="Filtrează după categorie">
                <button className={styles.chip} aria-pressed={!category && !client} onClick={() => go("")}>Toate</button>
                {categories.map(c => (
                    <button key={c.slug} className={styles.chip} aria-pressed={category === c.slug && !client} onClick={() => go(`categorie=${c.slug}`)}>{c.label}</button>
                ))}
            </div>

            {/* client stickers in a carousel: pressing one shows only that client's work */}
            <Carousel label="Filtrează după client" className={styles.clients}>
                {clients.map((c, i) => (
                    <li key={c.slug}>
                        <button
                            className={`client-sticker peel ${styles.clientSticker}`}
                            style={{ "--tilt": `${tilts[i % tilts.length]}deg` } as React.CSSProperties}
                            aria-pressed={client === c.slug}
                            onClick={() => go(client === c.slug ? "" : `client=${c.slug}`)}
                            title={c.name}
                        >
                            <img src={`/clienti/${c.logo}.webp`} alt={c.name} width={300} height={139} />
                        </button>
                    </li>
                ))}
            </Carousel>

            <p className="sr-only" aria-live="polite">
                {filtered.length} {filtered.length === 1 ? "proiect" : "proiecte"}
                {client && <> pentru <strong>{clients.find(c => c.slug === client)?.name}</strong></>}
            </p>

            <ul className={styles.grid}>
                {visible.map((item, i) => {
                    const collage = item.photos.length >= 3
                    return (
                        <li key={item.slug} className={collage ? styles.wide : undefined} style={{ "--n": i % PAGE } as React.CSSProperties}>
                            <button className={styles.frame} onClick={() => show(i)} aria-label={`Deschide: ${item.title}${item.photos.length > 1 ? `, ${item.photos.length} fotografii` : ""}`}>
                                {collage ? (
                                    // the same story in one tile: the cover large, two more photos beside it
                                    <span className={styles.collage}>
                                        {item.photos.slice(0, 3).map((f, k) => (
                                            <span key={f.src} className={styles.photo}><Image src={f.src} alt={k ? "" : f.alt} width={k ? 400 : 800} height={k ? 300 : 600} sizes={k ? THUMB : WIDE} /></span>
                                        ))}
                                    </span>
                                ) : (
                                    <span className={styles.photo}><Image src={item.photos[0].src} alt={item.photos[0].alt} width={480} height={480} sizes={THUMB} /></span>
                                )}
                                {item.photos.length > 1 && (
                                    <span className={styles.count} aria-hidden="true">
                                        <svg viewBox="0 0 24 24" width="15" height="15"><rect x="3" y="7" width="14" height="13" rx="2" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M7 4h12a2 2 0 0 1 2 2v11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                                        {item.photos.length}
                                    </span>
                                )}
                                <span className={styles.caption} aria-hidden="true">
                                    <small>{item.catLabel}</small>
                                    <strong>{item.clientName ?? item.title}</strong>
                                </span>
                            </button>
                        </li>
                    )
                })}
            </ul>

            {shown < filtered.length && (
                <p className={styles.more}>
                    <button className="btn-ghost on-light" onClick={() => setShown(s => s + PAGE)}>
                        Mai multe proiecte
                    </button>
                </p>
            )}

            <dialog
                ref={dialog}
                className={styles.lightbox}
                onClose={() => setOpen(null)}
                onClick={e => e.target === dialog.current && dialog.current.close()}
                onKeyDown={e => { if (e.key === "ArrowRight") step(1); if (e.key === "ArrowLeft") step(-1) }}
                aria-label="Proiect mărit"
            >
                {project && photo && open && (
                    <figure key={photo.src}>
                        {/* the grid thumbnail (already in the browser cache) shows at once; the large photo fades in over it */}
                        <span className={styles.lbStage}>
                            <Image src={photo.src} alt="" aria-hidden width={photo.w} height={photo.h} sizes={THUMB} className={styles.lbThumb} />
                            <Image
                                src={photo.src}
                                alt={photo.alt}
                                width={photo.w}
                                height={photo.h}
                                sizes="(min-width: 1240px) 1200px, 100vw"
                                priority
                                className={styles.lbFull}
                                data-loaded={loaded === photo.src || undefined}
                                onLoad={() => setLoaded(photo.src)}
                            />
                        </span>
                        <figcaption>
                            <strong>{project.title}</strong>
                            {project.photos.length > 1 && <span className={styles.lbCount}>{open.f + 1} / {project.photos.length}</span>}
                        </figcaption>
                        {project.photos.length > 1 && (
                            <ul className={styles.strip} aria-label="Fotografiile proiectului">
                                {project.photos.map((f, k) => (
                                    <li key={f.src}>
                                        <button onClick={() => setOpen({ p: open.p, f: k })} aria-current={k === open.f || undefined} aria-label={`Fotografia ${k + 1}`}>
                                            <Image src={f.src} alt="" width={120} height={90} sizes="96px" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </figure>
                )}
                {/* the neighbours load in the background, so the arrows feel instant */}
                {neighbours.map(item => (
                    <Image key={`pre-${item.src}`} src={item.src} alt="" aria-hidden width={item.w} height={item.h} sizes="(min-width: 1240px) 1200px, 100vw" loading="eager" className={styles.preload} />
                ))}
                <button className={styles.close} onClick={() => dialog.current?.close()} aria-label="Închide"><svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
                <button className={styles.prev} onClick={() => step(-1)} aria-label="Fotografia anterioară"><svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
                <button className={styles.next} onClick={() => step(1)} aria-label="Fotografia următoare"><svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
            </dialog>
        </>
    )
}
