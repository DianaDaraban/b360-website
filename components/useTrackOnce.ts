"use client"

import { useEffect, useRef, useState } from "react"

// whether the element with this id is on screen now (the floating total steps aside while the
// estimate card it points to is being read, instead of covering its buttons)
export function useInView(id: string) {
    const [inView, setInView] = useState(false)
    useEffect(() => {
        const el = document.getElementById(id)
        if (!el || !("IntersectionObserver" in window)) return
        const io = new IntersectionObserver(entries => setInView(entries.some(e => e.isIntersecting)), { threshold: 0.15 })
        io.observe(el)
        return () => io.disconnect()
    }, [id])
    return inView
}
import { track } from "@/lib/analytics"

// Calculator steps measured once per visit, so GA4 and Clarity show where people drop out
// (picked something → saw the price → asked for a call / sent the request):
// - when `when` first becomes true
export function useTrackWhen(event: string, when: boolean, params: Record<string, string | number> = {}) {
    const done = useRef(false)
    const latest = useRef(params)
    useEffect(() => { latest.current = params })
    useEffect(() => {
        if (!when || done.current) return
        done.current = true
        track(event, latest.current)
    }, [event, when])
}

// - when the element with this id first scrolls into view while `when` is true (the price card read)
export function useTrackSeen(event: string, id: string, when: boolean) {
    const done = useRef(false)
    useEffect(() => {
        const el = document.getElementById(id)
        if (!when || done.current || !el || !("IntersectionObserver" in window)) return
        const io = new IntersectionObserver(entries => {
            if (!entries.some(e => e.isIntersecting) || done.current) return
            done.current = true
            track(event)
            io.disconnect()
        }, { threshold: 0.5 })
        io.observe(el)
        return () => io.disconnect()
    }, [event, id, when])
}
