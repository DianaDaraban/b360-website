"use client"

import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { useRef, useState } from "react"
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
    const dialog = useRef<HTMLDialogElement>(null)

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
            <div className={styles.filters} role="group" aria-label="Filtrează după categorie">
                <button className={styles.chip} aria-pressed={!category && !client} onClick={() => go("")}>Toate</button>
                {categories.map(c => (
                    <button key={c.slug} className={styles.chip} aria-pressed={category === c.slug && !client} onClick={() => go(`categorie=${c.slug}`)}>{c.label}</button>
                ))}
            </div>

            {/* client stickers: the logo on a red disc whose corner peels; pressing one shows only that client's work */}
            <div className={styles.clients} role="group" aria-label="Filtrează după client">
                {clients.map(c => (
                    <button
                        key={c.slug}
                        className={`${styles.clientSticker} peel`}
                        aria-pressed={client === c.slug}
                        onClick={() => go(client === c.slug ? "" : `client=${c.slug}`)}
                        title={c.name}
                    >
                        <img src={`/clienti/${c.logo}.webp`} alt={c.name} width={300} height={139} />
                    </button>
                ))}
            </div>

            <p className={styles.count} aria-live="polite">
                {filtered.length} {filtered.length === 1 ? "lucrare" : "lucrări"}
                {client && <> pentru <strong>{clients.find(c => c.slug === client)?.name}</strong></>}
            </p>

            <ul className={styles.grid}>
                {visible.map((item, i) => (
                    <li key={item.src} style={{ "--n": i % PAGE } as React.CSSProperties}>
                        <button className={styles.frame} onClick={() => show(i)} aria-label={`Mărește: ${item.alt}`}>
                            <Image src={item.src} alt={item.alt} width={480} height={480} sizes="(min-width: 1024px) 290px, (min-width: 640px) 31vw, 47vw" />
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
                    <button className="btn" onClick={() => setShown(s => s + PAGE)}>
                        Mai multe lucrări ({filtered.length - shown})
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
                        <Image src={filtered[open].src} alt={filtered[open].alt} width={filtered[open].w} height={filtered[open].h} sizes="100vw" />
                        <figcaption>{filtered[open].alt}</figcaption>
                    </figure>
                )}
                <button className={styles.close} onClick={() => dialog.current?.close()} aria-label="Închide">×</button>
                <button className={styles.prev} onClick={() => step(-1)} aria-label="Lucrarea anterioară">‹</button>
                <button className={styles.next} onClick={() => step(1)} aria-label="Lucrarea următoare">›</button>
            </dialog>
        </>
    )
}
