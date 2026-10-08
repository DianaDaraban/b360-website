"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"

// Fades and lifts page content in as it scrolls into view. Siblings get a growing delay so
// lists and grids arrive one after another. Once an element has arrived the attribute is
// removed, so its own transitions (sticker corners, hovers) work normally again.
const SELECTOR = [
    "main h1", "main h2", "main h3", "main p", "main li", "main figure",
    "main fieldset", "main details", "main [data-reveal-item]",
].join(",")

export function Reveal() {
    const pathname = usePathname()

    useEffect(() => {
        if (matchMedia("(prefers-reduced-motion: reduce)").matches) return
        const elements = [...document.querySelectorAll<HTMLElement>(SELECTOR)]
            // skip nested matches (a p inside an li that already animates) and the dialog/lightbox
            .filter(el => !el.parentElement?.closest("[data-reveal], dialog") && !el.closest("dialog, [data-no-reveal]"))

        const observer = new IntersectionObserver(entries => {
            for (const entry of entries) {
                if (!entry.isIntersecting) continue
                const el = entry.target as HTMLElement
                el.dataset.in = ""
                observer.unobserve(el)
                el.addEventListener("transitionend", () => {
                    delete el.dataset.reveal
                    delete el.dataset.in
                    el.style.removeProperty("--i")
                }, { once: true })
            }
        }, { rootMargin: "0px 0px -8% 0px" })

        for (const el of elements) {
            const siblings = el.parentElement ? [...el.parentElement.children] : [el]
            el.style.setProperty("--i", String(Math.min(siblings.indexOf(el), 8)))
            el.dataset.reveal = ""
            observer.observe(el)
        }
        return () => observer.disconnect()
    }, [pathname])

    return null
}
