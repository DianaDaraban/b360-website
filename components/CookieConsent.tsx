"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { CONSENT_KEY, CONSENT_OPEN, GA_ID, readConsent, track } from "@/lib/analytics"
import styles from "./CookieConsent.module.css"

function loadAnalytics() {
    if (!GA_ID || window.gtag) return
    window.dataLayer = window.dataLayer ?? []
    // gtag.js reads the arguments object itself, so this has to stay a plain function
    window.gtag = function () { window.dataLayer!.push(arguments) }
    window.gtag("js", new Date())
    window.gtag("config", GA_ID)
    const s = document.createElement("script")
    s.async = true
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
    document.head.appendChild(s)
}

// Asks once and remembers the answer; analytics starts only after "Accept"
export function CookieConsent() {
    const [open, setOpen] = useState(false)

    useEffect(() => {
        if (!GA_ID) return
        const answer = readConsent()
        if (answer === "da") loadAnalytics()
        else if (answer === null) setOpen(true)
        const reopen = () => setOpen(true)
        window.addEventListener(CONSENT_OPEN, reopen)
        // phone, WhatsApp and email taps anywhere on the site count as contacts
        const onClick = (e: MouseEvent) => {
            const href = (e.target as Element).closest?.("a")?.getAttribute("href") ?? ""
            const where = { pagina: location.pathname }
            if (href.startsWith("tel:")) track("click_telefon", where)
            else if (href.startsWith("mailto:")) track("click_email", where)
            else if (/wa\.me|whatsapp/.test(href)) track("click_whatsapp", where)
        }
        document.addEventListener("click", onClick)
        return () => { window.removeEventListener(CONSENT_OPEN, reopen); document.removeEventListener("click", onClick) }
    }, [])

    const answer = (value: "da" | "nu") => {
        try { localStorage.setItem(CONSENT_KEY, value) } catch {}
        setOpen(false)
        if (value === "da") return loadAnalytics()
        // consent withdrawn: the _ga cookies go, and a reload drops the script already running
        if (window.gtag) {
            for (const name of document.cookie.split(";").map(c => c.split("=")[0].trim()).filter(n => n.startsWith("_ga"))) {
                document.cookie = `${name}=; max-age=0; path=/; domain=.${location.hostname.replace(/^www\./, "")}`
                document.cookie = `${name}=; max-age=0; path=/`
            }
            location.reload()
        }
    }

    if (!open) return null
    return (
        <div className={styles.banner} role="dialog" aria-label="Cookie-uri">
            <p>
                Folosim Google Analytics ca să vedem ce pagini sunt utile. Pornește doar dacă ești de acord.{" "}
                <Link href="/politica-de-confidentialitate#cookie">Detalii</Link>
            </p>
            <div className={styles.actions}>
                <button type="button" className={styles.no} onClick={() => answer("nu")}>Refuz</button>
                <button type="button" className={styles.yes} onClick={() => answer("da")}>Accept</button>
            </div>
        </div>
    )
}

// the footer link that lets a visitor change their answer
export function CookieSettings({ className }: { className?: string }) {
    if (!GA_ID) return null
    return <button type="button" className={className} onClick={() => window.dispatchEvent(new Event(CONSENT_OPEN))}>Setări cookie-uri</button>
}
