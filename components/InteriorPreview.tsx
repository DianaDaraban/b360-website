"use client"

import { useEffect, useRef, useState } from "react"
import styles from "./InteriorPreview.module.css"

// Real interiors (photographed rooms with the back wall cut out) where a chosen wallpaper shows
// through behind the furniture. The box is where the wall sits in each photo, in percent.
const ROOMS = [
    { id: "living", label: "Living", ratio: 1.3389, box: { x: 15, y: 7.45, w: 85, h: 67.87 } },
    { id: "dormitor", label: "Dormitor", ratio: 1.3389, box: { x: 11.25, y: 15.23, w: 77.56, h: 59.33 } },
    { id: "dining", label: "Dining", ratio: 1.3389, box: { x: 4.56, y: 11.55, w: 89.38, h: 64.02 } },
    { id: "copii", label: "Camera copiilor", ratio: 1.3389, box: { x: 8.06, y: 2.34, w: 87.44, h: 75.9 } },
] as const
type View = (typeof ROOMS)[number]["id"] | "intreg"

// url: the picture for walls and rooms; full: a sharper one for the design seen whole; thumb: a
// small one shown at once, under the larger while it loads
export type Design = { url: string; name: string; full?: string; thumb?: string }

// One tile per chosen design (with a magnifier); a tap opens it in the interiors, room by room.
export function InteriorPreview({ designs }: { designs: Design[] }) {
    const [open, setOpen] = useState<number | null>(null)
    if (!designs.length) return null
    return (
        <div className={styles.wrap}>
            <p className={styles.title}>Vezi tapetul într-un interior</p>
            <div className={styles.tiles}>
                {designs.map((d, i) => (
                    <button type="button" key={d.url} className={styles.tile} onClick={() => setOpen(i)} aria-label={`Vezi ${d.name} într-un interior`}>
                        <span className={styles.thumb} style={{ backgroundImage: `url(${d.url})` }} />
                        <span className={styles.lens} aria-hidden="true"><Lens /></span>
                        <span className={styles.name}>{d.name}</span>
                    </button>
                ))}
            </div>
            <InteriorDialog designs={designs} index={open} onIndex={setOpen} />
        </div>
    )
}

// the picture over its small version, so something shows straight away
const layers = (d: Design) => [d.url, d.thumb].filter(Boolean).map(u => `url(${u})`).join(", ")

export function Lens() {
    return <svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5" /></svg>
}

// The design big: whole, or on the wall of a furnished room. With many designs (the catalogue) it
// steps through them with arrows; with an action it can choose the design straight from here.
export function InteriorDialog({ designs, index, onIndex, full = false, action }: {
    designs: Design[]
    index: number | null
    onIndex: (i: number | null) => void
    full?: boolean
    action?: { label: string; run: (i: number) => void }
}) {
    const [view, setView] = useState<View>(full ? "intreg" : "living")
    const dialog = useRef<HTMLDialogElement>(null)
    const many = designs.length > 6

    useEffect(() => {
        const d = dialog.current
        if (!d) return
        if (index != null && !d.open) d.showModal()
        if (index == null && d.open) d.close()
    }, [index])

    // the four rooms load ahead, once the page is idle, so changing room is instant
    useEffect(() => {
        const load = () => ROOMS.forEach(r => { new Image().src = `/tapet/interior/${r.id}.webp` })
        if ("requestIdleCallback" in window) { const id = requestIdleCallback(load); return () => cancelIdleCallback(id) }
        const t = setTimeout(load, 1500)
        return () => clearTimeout(t)
    }, [])

    // the designs next to the open one load ahead too, so the arrows feel instant
    useEffect(() => {
        if (index == null || designs.length < 2) return
        for (const i of [index + 1, index - 1, index + 2]) {
            const d = designs[(i + designs.length) % designs.length]
            new Image().src = d.url
        }
    }, [index, designs])

    // the arrow keys step through the designs
    useEffect(() => {
        if (index == null || designs.length < 2) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") onIndex((index + 1) % designs.length)
            if (e.key === "ArrowLeft") onIndex((index - 1 + designs.length) % designs.length)
        }
        addEventListener("keydown", onKey)
        return () => removeEventListener("keydown", onKey)
    }, [index, designs.length, onIndex])

    const current = index != null ? designs[index] : null
    const tabs = [...(full ? [{ id: "intreg" as const, label: "Modelul întreg" }] : []), ...ROOMS.map(r => ({ id: r.id, label: r.label }))]
    const room = ROOMS.find(r => r.id === view)
    return (
        <dialog ref={dialog} className={styles.dialog} onClose={() => onIndex(null)} onClick={e => { if (e.target === dialog.current) onIndex(null) }}>
            {current && index != null && (
                <div className={styles.panel}>
                    <div className={styles.bar}>
                        <div className={styles.rooms} role="tablist" aria-label="Încăperea">
                            {tabs.map(t => <button type="button" role="tab" key={t.id} aria-selected={view === t.id} onClick={() => setView(t.id)}>{t.label}</button>)}
                        </div>
                        <button type="button" className={styles.close} onClick={() => onIndex(null)} aria-label="Închide">×</button>
                    </div>
                    <div className={styles.stage}>
                        {/* every room stays in place, only the chosen one shows: switching is instant */}
                        {ROOMS.map(r => (
                            <div key={r.id} className={styles.scene} hidden={r.id !== view} style={{ "--ratio": r.ratio } as React.CSSProperties}>
                                <div className={styles.paper} style={{ left: `${r.box.x}%`, top: `${r.box.y}%`, width: `${r.box.w}%`, height: `${r.box.h}%`, backgroundImage: layers(current) }} />
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={`/tapet/interior/${r.id}.webp`} alt={`${r.label} cu tapetul ${current.name}`} className={styles.room} decoding="async" />
                            </div>
                        ))}
                        {!room && (
                            <div className={styles.wholeBox}>
                                {/* the lighter picture on ordinary screens, the sharper one on dense (retina) ones */}
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img key={current.url} src={current.url} srcSet={current.full ? `${current.url} 1000w, ${current.full} 1600w` : undefined} sizes="(max-width: 1140px) 92vw, 1060px" alt={current.name} className={styles.whole} />
                            </div>
                        )}
                        {many && (
                            <>
                                <button type="button" className={`${styles.step} ${styles.prev}`} onClick={() => onIndex((index - 1 + designs.length) % designs.length)} aria-label="Modelul anterior">‹</button>
                                <button type="button" className={`${styles.step} ${styles.next}`} onClick={() => onIndex((index + 1) % designs.length)} aria-label="Modelul următor">›</button>
                            </>
                        )}
                    </div>
                    <div className={styles.foot}>
                        <p className={styles.caption}><b>{current.name}</b> · {room ? "simulare orientativă, la montaj imaginea se potrivește exact pe peretele tău" : many ? `${index + 1} din ${designs.length}` : "imaginea la rezoluție mare"}</p>
                        {action && <button type="button" className={`btn ${styles.action}`} onClick={() => { action.run(index); onIndex(null) }}>{action.label}</button>}
                    </div>
                    {!many && designs.length > 1 && (
                        <div className={styles.switch}>
                            {designs.map((d, i) => (
                                <button type="button" key={d.url} aria-pressed={i === index} onClick={() => onIndex(i)} style={{ backgroundImage: `url(${d.url})` }} aria-label={d.name} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </dialog>
    )
}
