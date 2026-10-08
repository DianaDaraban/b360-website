"use client"

import { useEffect, useRef, useState } from "react"
import styles from "./Carousel.module.css"

// Horizontal strip that scrolls by itself (touch, trackpad) or with the two arrows;
// an arrow fades out once that end is reached. Children are the <li> items.
export function Carousel({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
    const track = useRef<HTMLUListElement>(null)
    const [atStart, setAtStart] = useState(true)
    const [atEnd, setAtEnd] = useState(false)

    useEffect(() => {
        const el = track.current
        if (!el) return
        const update = () => {
            setAtStart(el.scrollLeft < 4)
            setAtEnd(el.scrollLeft + el.clientWidth > el.scrollWidth - 4)
        }
        update()
        el.addEventListener("scroll", update, { passive: true })
        window.addEventListener("resize", update)
        return () => {
            el.removeEventListener("scroll", update)
            window.removeEventListener("resize", update)
        }
    }, [])

    const move = (dir: 1 | -1) => track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.8, behavior: "smooth" })

    return (
        <div className={`${styles.carousel} ${className}`} role="region" aria-label={label} data-no-reveal>
            <button type="button" className={`${styles.arrow} ${styles.prev}`} onClick={() => move(-1)} disabled={atStart} aria-label="Înapoi">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 4l-8 8 8 8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <ul ref={track} className={styles.track} data-start={atStart || undefined} data-end={atEnd || undefined}>{children}</ul>
            <button type="button" className={`${styles.arrow} ${styles.next}`} onClick={() => move(1)} disabled={atEnd} aria-label="Înainte">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4l8 8-8 8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
        </div>
    )
}
