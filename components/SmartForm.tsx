"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { site } from "@/lib/site"

type Kind = "oferta" | "contact" | "calculator"
type Status = "idle" | "sending" | "sent" | "error"

const MAX_FILES_BYTES = 4 * 1024 * 1024

const ERRORS: Record<string, string> = {
    missing: "Completează câmpurile obligatorii și bifează acordul pentru prelucrarea datelor.",
    email: "Adresa de email nu pare corectă.",
    files: "Fișierele atașate depășesc 4 MB în total. Trimite-ne fișierele mari pe email.",
    "not-configured": "Formularul nu este încă activ.",
}

// A site form that sends itself to /api/form without leaving the page: it shows "sending", then a
// thank-you panel, or an error with the phone number as a fallback. Adds the spam traps the route
// checks (a hidden field and the time the form was shown).
export function SmartForm({ kind, className, children, ...rest }: { kind: Kind; className?: string; children: React.ReactNode } & React.FormHTMLAttributes<HTMLFormElement>) {
    const [status, setStatus] = useState<Status>("idle")
    const [error, setError] = useState("")
    const shownAt = useRef(0)
    useEffect(() => { shownAt.current = Date.now() }, [])

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const data = new FormData(e.currentTarget)
        data.set("kind", kind)
        data.set("t", String(shownAt.current))
        const size = data.getAll("fisiere").reduce((n, f) => n + (f instanceof File ? f.size : 0), 0)
        if (size > MAX_FILES_BYTES) {
            setError(ERRORS.files)
            setStatus("error")
            return
        }
        setStatus("sending")
        setError("")
        try {
            const res = await fetch("/api/form", { method: "POST", body: data })
            const body = await res.json().catch(() => ({}))
            if (res.ok) {
                setStatus("sent")
                return
            }
            setError(ERRORS[body.error] ?? "")
            setStatus("error")
        } catch {
            setStatus("error")
        }
    }

    if (status === "sent") {
        return (
            <div className={`${className ?? ""} form-done`} role="status">
                <span className="form-done-tick" aria-hidden="true" />
                <h2>Mulțumim, am primit!</h2>
                <p>{kind === "contact" ? "Îți răspundem cât de curând." : "Revenim cu oferta cât de curând, de obicei în aceeași zi lucrătoare."}</p>
                <p>Dacă e urgent, sună-ne la <a href={site.phoneHref}>{site.phone}</a>.</p>
                <button type="button" className="btn-ghost" onClick={() => setStatus("idle")}>Trimite alt mesaj</button>
            </div>
        )
    }

    return (
        <form className={className} onSubmit={onSubmit} {...rest}>
            {/* people never see or fill this field; bots usually do */}
            <label className="sr-only" aria-hidden="true">Site web<input name="website" tabIndex={-1} autoComplete="off" /></label>
            <fieldset disabled={status === "sending"} className="form-body">
                {children}
            </fieldset>
            {status === "sending" && <p className="form-status" role="status">Se trimite…</p>}
            {status === "error" && (
                <p className="form-status form-error" role="alert">
                    {error || "Mesajul nu a putut fi trimis."} Ne poți suna la <a href={site.phoneHref}>{site.phone}</a> sau scrie la{" "}
                    <a href={`mailto:${site.email}`}>{site.email}</a>.
                </p>
            )}
        </form>
    )
}

// GDPR consent checkbox, required on every form
export function Consent() {
    return (
        <label className="consent">
            <input type="checkbox" name="gdpr" value="da" required />
            <span>
                Sunt de acord cu prelucrarea datelor mele pentru a primi un răspuns, conform{" "}
                <Link href="/politica-de-confidentialitate" target="_blank">Politicii de confidențialitate</Link>. *
            </span>
        </label>
    )
}
