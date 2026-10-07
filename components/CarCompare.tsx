"use client"

import { useState } from "react"
import styles from "./CarCompare.module.css"

// Figma "Colantări integrale / Colantări parțiale" element: the same car shown two ways, split
// by a diagonal red line. The round handle sits right on the line; the whole picture is the
// drag area (a transparent range input over it, so keyboard and screen readers work too).
export function CarCompare({
    integral = "/img/rally-uni-studio.webp",
    partial = "/img/rally-side-studio.webp",
}: { integral?: string; partial?: string }) {
    const [split, setSplit] = useState(52)

    return (
        <figure className={styles.compare} style={{ "--split": `${split}%` } as React.CSSProperties}>
            <div className={styles.stage}>
                <img src={partial} alt="Mașină cu colantare parțială" className={styles.car} width={2000} height={726} loading="lazy" />
                <img src={integral} alt="Aceeași mașină cu colantare integrală, într-o singură culoare" className={`${styles.car} ${styles.integral}`} width={2000} height={726} loading="lazy" />
                <span className={styles.divider} aria-hidden="true" />
                <span className={styles.knob} aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="18" height="18"><path d="M9 6 3 12l6 6M15 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
                <label className={styles.range}>
                    <span className="sr-only">Compară colantarea integrală cu cea parțială</span>
                    <input type="range" min={8} max={92} value={split} onChange={e => setSplit(Number(e.target.value))} />
                </label>
            </div>
            <figcaption className={styles.labels}>
                <span>Colantări integrale</span>
                <span>Colantări parțiale</span>
            </figcaption>
        </figure>
    )
}
