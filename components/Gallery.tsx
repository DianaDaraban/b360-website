"use client"

import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { useRef, useState } from "react"
import styles from "./Gallery.module.css"

type Item = { src: string; cat: string; alt: string; w: number; h: number }
type Category = { slug: string; label: string }

const PAGE = 24

export function Gallery({ items, categories }: { items: Item[]; categories: readonly Category[] }) {
    const router = useRouter()
    const params = useSearchParams()
    const active = params.get("categorie") ?? ""
    const [shown, setShown] = useState(PAGE)
    const [open, setOpen] = useState<number | null>(null)
    const dialog = useRef<HTMLDialogElement>(null)

    const filtered = active ? items.filter(i => i.cat === active) : items
    const visible = filtered.slice(0, shown)

    const select = (slug: string) => {
        setShown(PAGE)
        router.replace(slug ? `/portofoliu?categorie=${slug}` : "/portofoliu", { scroll: false })
    }
    const show = (index: number) => {
        setOpen(index)
        if (!dialog.current?.open) dialog.current?.showModal()
    }
    const step = (delta: number) => setOpen(i => (i === null ? i : (i + delta + filtered.length) % filtered.length))

    return (
        <>
            <div className={styles.filters} role="group" aria-label="Filtrează după categorie">
                <button aria-pressed={!active} onClick={() => select("")}>Toate</button>
                {categories.map(c => (
                    <button key={c.slug} aria-pressed={active === c.slug} onClick={() => select(c.slug)}>{c.label}</button>
                ))}
            </div>

            <ul className={styles.grid}>
                {visible.map((item, i) => (
                    <li key={item.src}>
                        <button onClick={() => show(i)} aria-label={`Mărește: ${item.alt}`}>
                            <Image src={item.src} alt={item.alt} width={400} height={400} sizes="(min-width: 1024px) 290px, (min-width: 640px) 31vw, 47vw" />
                        </button>
                    </li>
                ))}
            </ul>

            {shown < filtered.length && (
                <p className={styles.more}>
                    <button className="btn peel" onClick={() => setShown(s => s + PAGE)}>
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
                    <figure>
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
