"use client"

import { useEffect, useRef, useState } from "react"
import type { Box } from "./privacy-detect"
import styles from "./admin.module.css"

// Before a photo goes up: the plates and faces found are shown as boxes on it. A ticked box is
// blurred; tap a box to tick or untick it, drag on the photo to add one by hand.
export function PrivacyReview({ url, boxes, onChange, note }: { url: string; boxes: Box[]; onChange: (b: Box[]) => void; note?: string }) {
    const host = useRef<HTMLDivElement>(null)
    const [draft, setDraft] = useState<{ x0: number; y0: number; x: number; y: number } | null>(null)
    const at = (e: React.PointerEvent) => {
        const r = host.current!.getBoundingClientRect()
        return { x: Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), y: Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)) }
    }
    useEffect(() => setDraft(null), [url])

    return (
        <div className={styles.privacy}>
            <div
                ref={host}
                className={styles.privacyPhoto}
                onPointerDown={e => { if ((e.target as HTMLElement).dataset.box) return; const p = at(e); setDraft({ x0: p.x, y0: p.y, ...p }); (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId) }}
                onPointerMove={e => draft && setDraft({ ...draft, ...at(e) })}
                onPointerUp={() => {
                    if (draft) {
                        const x = Math.min(draft.x0, draft.x), y = Math.min(draft.y0, draft.y), w = Math.abs(draft.x - draft.x0), h = Math.abs(draft.y - draft.y0)
                        if (w > 0.01 && h > 0.01) onChange([...boxes, { x, y, w, h, kind: "manual", on: true, score: 1 }])
                    }
                    setDraft(null)
                }}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" draggable={false} />
                {boxes.map((b, i) => (
                    <button
                        key={i}
                        type="button"
                        data-box="1"
                        className={styles.privacyBox}
                        data-on={b.on || undefined}
                        style={{ left: `${b.x * 100}%`, top: `${b.y * 100}%`, width: `${b.w * 100}%`, height: `${b.h * 100}%` }}
                        onClick={() => onChange(boxes.map((x, j) => (j === i ? { ...x, on: !x.on } : x)))}
                        title={b.kind === "plate" ? "Număr de înmatriculare" : b.kind === "face" ? "Față" : "Zonă adăugată"}
                    >
                        <span>{b.kind === "plate" ? "număr" : b.kind === "face" ? "față" : "zonă"}</span>
                    </button>
                ))}
                {draft && <i className={styles.privacyDraft} style={{ left: `${Math.min(draft.x0, draft.x) * 100}%`, top: `${Math.min(draft.y0, draft.y) * 100}%`, width: `${Math.abs(draft.x - draft.x0) * 100}%`, height: `${Math.abs(draft.y - draft.y0) * 100}%` }} />}
            </div>
            <p className={styles.note}>
                {note ?? (boxes.length ? "Zonele bifate (pline) se blurează. Apasă pe o zonă ca s-o bifezi sau s-o scoți; trage pe poză ca să adaugi una." : "N-am găsit numere sau fețe. Dacă vezi unul, trage pe poză un dreptunghi peste el.")}
            </p>
        </div>
    )
}
