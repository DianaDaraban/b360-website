"use client"

import { useState } from "react"
import styles from "./CarCompare.module.css"

// Figma "Colantări integrale / Colantări parțiale" element: the same car shown two ways, split
// by a diagonal line that the visitor drags. Until the Figma mockups are exported, both sides use
// the rally car photo, the integral side recoloured as a full wrap.
export function CarCompare({
    integral = "/img/rally-side.webp",
    partial = "/img/rally-side.webp",
    recolourIntegral = true,
}: { integral?: string; partial?: string; recolourIntegral?: boolean }) {
    const [split, setSplit] = useState(52)

    return (
        <figure className={styles.compare} style={{ "--split": `${split}%` } as React.CSSProperties}>
            <div className={styles.stage}>
                <img src={partial} alt="Mașină cu colantare parțială" className={styles.car} width={1600} height={800} loading="lazy" />
                <img
                    src={integral}
                    alt="Aceeași mașină cu colantare integrală"
                    className={`${styles.car} ${styles.integral}`}
                    data-recolour={recolourIntegral || undefined}
                    width={1600}
                    height={800}
                    loading="lazy"
                />
                <span className={styles.divider} aria-hidden="true" />
            </div>
            <figcaption className={styles.labels}>
                <span>Colantări integrale</span>
                <span>Colantări parțiale</span>
            </figcaption>
            <label className={styles.handle}>
                <span className="sr-only">Compară colantarea integrală cu cea parțială</span>
                <input type="range" min={8} max={92} value={split} onChange={e => setSplit(Number(e.target.value))} />
            </label>
        </figure>
    )
}
