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
        <div className={styles.banner} role="dialog" aria-labelledby="cookie-title">
            <svg className={styles.icon} viewBox="0 0 48 48" aria-hidden="true">
                <path d="M24 4a20 20 0 1 0 20 20 7 7 0 0 1-8-7 7 7 0 0 1-7-8 5 5 0 0 1-5-5z" />
                <circle cx="16" cy="18" r="2.6" /><circle cx="27" cy="28" r="3" /><circle cx="15" cy="31" r="2.2" /><circle cx="34" cy="36" r="1.8" />
            </svg>
            <div className={styles.text}>
                <h2 id="cookie-title">Cookie-uri doar cu acordul tău</h2>
                <p>
                    Folosim Google Analytics ca să vedem ce pagini sunt utile. Fără reclame, fără urmărire pe alte site-uri.{" "}
                    <Link href="/politica-de-confidentialitate#cookie">Detalii</Link>
                </p>
            </div>
            <div className={styles.actions}>
                <button type="button" className={`btn-ghost on-light ${styles.no}`} onClick={() => answer("nu")}>Refuz</button>
                <button type="button" className={`btn ${styles.yes}`} onClick={() => answer("da")}>Accept</button>
            </div>
        </div>
    )
}

// the footer link that lets a visitor change their answer
export function CookieSettings({ className }: { className?: string }) {
    if (!GA_ID) return null
    return <button type="button" className={className} onClick={() => window.dispatchEvent(new Event(CONSENT_OPEN))}>Setări cookie-uri</button>
}
