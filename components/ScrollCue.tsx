"use client"

import { useEffect, useRef, useState } from "react"
import styles from "./ScrollCue.module.css"

// Section rail on the right edge (desktop): one dot per .snap-slide, the current one stretched into
// a red bar, its name shown on hover; under it a small scroll hint that jumps to the next section.
// While the page is moving the rail fades back, and it comes back once scrolling stops.
export function ScrollCue() {
    const [labels, setLabels] = useState<string[]>([])
    const [active, setActive] = useState(0)
    const [moving, setMoving] = useState(false)
    const idle = useRef<number | undefined>(undefined)

    const slides = () => [...document.querySelectorAll<HTMLElement>(".snap-slide")]

    useEffect(() => {
        setLabels(slides().map((s, i) => s.dataset.label ?? `Secțiunea ${i + 1}`))
        // the rail shows only on wide screens (ScrollCue.module.css): phones skip the scroll work, and
        // the slides are measured at most once a frame
        const wide = matchMedia("(min-width: 1024px)")
        let frame = 0
        const measure = () => {
            frame = 0
            const mid = window.innerHeight * 0.4
            // the last slide whose top has passed 40 % of the screen
            setActive(slides().reduce((found, s, i) => (s.getBoundingClientRect().top <= mid ? i : found), 0))
        }
        const update = () => {
            if (!frame) frame = requestAnimationFrame(measure)
            setMoving(true)
            window.clearTimeout(idle.current)
            idle.current = window.setTimeout(() => setMoving(false), 700)
        }
        const toggle = () => {
            window.removeEventListener("scroll", update)
            if (!wide.matches) return
            measure()
            window.addEventListener("scroll", update, { passive: true })
        }
        toggle()
        wide.addEventListener("change", toggle)
        return () => {
            window.removeEventListener("scroll", update)
            wide.removeEventListener("change", toggle)
            cancelAnimationFrame(frame)
            window.clearTimeout(idle.current)
        }
    }, [])

    const go = (i: number) => slides()[i]?.scrollIntoView({ behavior: "smooth" })
    const last = active >= labels.length - 1

    return (
        <nav className={styles.rail} data-moving={moving || undefined} aria-label="Secțiunile paginii">
            <ol>
                {labels.map((label, i) => (
                    <li key={label}>
                        <button type="button" className={styles.dot} aria-current={i === active || undefined} onClick={() => go(i)}>
                            <span className={styles.label}>{label}</span>
                        </button>
                    </li>
                ))}
            </ol>
            <button type="button" className={styles.hint} data-hidden={last || undefined} onClick={() => go(active + 1)} aria-label="Scroll la secțiunea următoare">
                <span className={styles.line} />
                <span className={styles.word}>scroll</span>
            </button>
        </nav>
    )
}
