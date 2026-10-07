"use client"

import { useEffect, useState } from "react"
import styles from "./ScrollCue.module.css"

// Mouse with a rolling wheel and a bouncing chevron (as on the portfolio site). It stays at the
// bottom of the screen and jumps to the next .snap-slide; on the last one it goes away.
export function ScrollCue() {
    const [last, setLast] = useState(false)

    const slides = () => [...document.querySelectorAll<HTMLElement>(".snap-slide")]
    const nextSlide = () => slides().find(s => s.getBoundingClientRect().top > 100)

    useEffect(() => {
        const update = () => setLast(!nextSlide())
        update()
        window.addEventListener("scroll", update, { passive: true })
        return () => window.removeEventListener("scroll", update)
    }, [])

    return (
        <button type="button" className={styles.cue} data-hidden={last || undefined} onClick={() => nextSlide()?.scrollIntoView({ behavior: "smooth" })} aria-label="Secțiunea următoare">
            <span className={styles.mouse}><span className={styles.wheel} /></span>
            <svg className={styles.chevron} viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
        </button>
    )
}
