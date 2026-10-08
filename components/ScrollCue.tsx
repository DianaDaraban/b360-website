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
        const update = () => {
            const mid = window.innerHeight * 0.4
            const list = slides()
            // the last slide whose top has passed 40 % of the screen
            const current = list.reduce((found, s, i) => (s.getBoundingClientRect().top <= mid ? i : found), 0)
            setActive(current)
            setMoving(true)
            window.clearTimeout(idle.current)
            idle.current = window.setTimeout(() => setMoving(false), 700)
        }
        update()
        setMoving(false)
        window.addEventListener("scroll", update, { passive: true })
        return () => {
            window.removeEventListener("scroll", update)
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
            <button type="button" className={styles.hint} data-hidden={last || undefined} onClick={() => go(active + 1)} aria-label="Secțiunea următoare">
                <span className={styles.line} />
                <span className={styles.word}>scroll</span>
            </button>
        </nav>
    )
}
