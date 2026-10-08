"use client"

import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { Carousel } from "./Carousel"
import { tilts } from "@/data/clienti"
import styles from "./Gallery.module.css"

type Item = { src: string; cat: string; alt: string; w: number; h: number; catLabel: string; clientName: string | null; clientSlug: string | null }
type Category = { slug: string; label: string }
type ClientLogo = { slug: string; name: string; logo: string }

const PAGE = 24

export function Gallery({ items, categories, clients }: { items: Item[]; categories: readonly Category[]; clients: ClientLogo[] }) {
    const router = useRouter()
    const params = useSearchParams()
    const category = params.get("categorie") ?? ""
    const client = params.get("client") ?? ""
    const [shown, setShown] = useState(PAGE)
    const [open, setOpen] = useState<number | null>(null)
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

    const filtered = client ? items.filter(i => i.clientSlug === client) : category ? items.filter(i => i.cat === category) : items
    const visible = filtered.slice(0, shown)

    const go = (query: string) => {
        setShown(PAGE)
        router.replace(query ? `/portofoliu?${query}` : "/portofoliu", { scroll: false })
    }
    const show = (index: number) => {
        setOpen(index)
        if (!dialog.current?.open) dialog.current?.showModal()
    }
    const step = (delta: number) => setOpen(i => (i === null ? i : (i + delta + filtered.length) % filtered.length))

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
                {filtered.length} {filtered.length === 1 ? "lucrare" : "lucrări"}
                {client && <> pentru <strong>{clients.find(c => c.slug === client)?.name}</strong></>}
            </p>

            <ul className={styles.grid}>
                {visible.map((item, i) => (
                    <li key={item.src} style={{ "--n": i % PAGE } as React.CSSProperties}>
                        <button className={styles.frame} onClick={() => show(i)} aria-label={`Mărește: ${item.alt}`}>
                            <span className={styles.photo}><Image src={item.src} alt={item.alt} width={480} height={480} sizes="(min-width: 1024px) 290px, (min-width: 640px) 31vw, 47vw" /></span>
                            <span className={styles.caption} aria-hidden="true">
                                <small>{item.catLabel}</small>
                                {item.clientName && <strong>{item.clientName}</strong>}
                            </span>
                        </button>
                    </li>
                ))}
            </ul>

            {shown < filtered.length && (
                <p className={styles.more}>
                    <button className="btn-ghost on-light" onClick={() => setShown(s => s + PAGE)}>
                        Mai multe lucrări
                    </button>
                </p>
            )}

            <dialog
                ref={dialog}
                className={styles.lightbox}
                onClose={() => setOpen(null)}
                onClick={e => e.target === dialog.current && dialog.current.close()}
                onKeyDown={e => { if (e.key === "ArrowRight") step(1); if (e.key === "ArrowLeft") step(-1) }}
                aria-label="Lucrare mărită"
            >
                {open !== null && filtered[open] && (
                    <figure key={filtered[open].src}>
                        {/* the grid thumbnail (already in the browser cache) shows at once; the large photo fades in over it */}
                        <span className={styles.lbStage}>
                            <Image src={filtered[open].src} alt="" aria-hidden width={filtered[open].w} height={filtered[open].h} sizes="(min-width: 1024px) 290px, (min-width: 640px) 31vw, 47vw" className={styles.lbThumb} />
                            <Image
                                src={filtered[open].src}
                                alt={filtered[open].alt}
                                width={filtered[open].w}
                                height={filtered[open].h}
                                sizes="(min-width: 1240px) 1200px, 100vw"
                                priority
                                className={styles.lbFull}
                                data-loaded={loaded === filtered[open].src || undefined}
                                onLoad={() => setLoaded(filtered[open].src)}
                            />
                        </span>
                        <figcaption>{filtered[open].alt}</figcaption>
                    </figure>
                )}
                {/* the neighbours load in the background, so the arrows feel instant */}
                {open !== null && filtered.length > 1 && [open - 1, open + 1].map(n => {
                    const item = filtered[(n + filtered.length) % filtered.length]
                    return <Image key={`pre-${item.src}`} src={item.src} alt="" aria-hidden width={item.w} height={item.h} sizes="(min-width: 1240px) 1200px, 100vw" loading="eager" className={styles.preload} />
                })}
                <button className={styles.close} onClick={() => dialog.current?.close()} aria-label="Închide"><svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
                <button className={styles.prev} onClick={() => step(-1)} aria-label="Lucrarea anterioară"><svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
                <button className={styles.next} onClick={() => step(1)} aria-label="Lucrarea următoare"><svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
            </dialog>
        </>
    )
}
