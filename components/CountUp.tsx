"use client"

import { useEffect, useRef, useState } from "react"

// A number that counts up (eased) the first time it comes into view
export function CountUp({ to, from = 0, suffix = "", duration = 1600 }: { to: number; from?: number; suffix?: string; duration?: number }) {
    const el = useRef<HTMLSpanElement>(null)
    const [value, setValue] = useState(from)

    useEffect(() => {
        const node = el.current
        if (!node) return
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setValue(to)
            return
        }
        let frame = 0
        const observer = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) return
            observer.disconnect()
            const start = performance.now()
            const tick = (now: number) => {
                const t = Math.min(1, (now - start) / duration)
                setValue(Math.round(from + (to - from) * (1 - Math.pow(1 - t, 3))))
                if (t < 1) frame = requestAnimationFrame(tick)
            }
            frame = requestAnimationFrame(tick)
        })
        observer.observe(node)
        return () => {
            observer.disconnect()
            cancelAnimationFrame(frame)
        }
    }, [to, from, duration])

    return <span ref={el}>{value}{suffix}</span>
}
