"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { site } from "@/lib/site"
import { setLeadData, track } from "@/lib/analytics"
import { sourceFields } from "@/lib/source"

type Kind = "oferta" | "contact" | "calculator" | "tapet"
type Status = "idle" | "sending" | "sent" | "error"

const MAX_FILES_BYTES = 4 * 1024 * 1024

const ERRORS: Record<string, string> = {
    missing: "Completează câmpurile obligatorii și bifează acordul pentru prelucrarea datelor.",
    email: "Adresa de email nu pare corectă.",
    files: "Fișierele atașate depășesc 4 MB în total. Trimite-ne fișierele mari pe email.",
    "not-configured": "Formularul nu este încă activ.",
}

type Field = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement

// A phone as people type it: with or without +40 / 0040 / 0 in front, with spaces, dots or dashes.
// A Romanian number comes back as its 9 digits; one from abroad (+33…, 0049…) as "+" and its digits.
function readPhone(raw: string): { number: string; problem: string } {
    const v = raw.trim()
    const ex = "de exemplu 722 123 456 sau 0722 123 456"
    if (/[a-z]/i.test(v)) return { number: v, problem: `În numărul de telefon pot fi doar cifre, ${ex}.` }
    const compact = v.replace(/[\s.()-]/g, "")
    if (/^(\+|00)(?!40)/.test(compact)) {
        const d = compact.replace(/\D/g, "").replace(/^00/, "")
        return { number: `+${d}`, problem: d.length >= 8 && d.length <= 15 ? "" : "Numărul pare greșit. Pentru alte țări scrie-l cu prefixul țării, de exemplu +33 6 12 34 56 78." }
    }
    const d = compact.replace(/\D/g, "").replace(/^(0040|40|0)/, "")
    if (d.length < 9) return { number: d, problem: `Numărul pare incomplet: lipsesc ${9 - d.length === 1 ? "o cifră" : `${9 - d.length} cifre`}. Scrie-l întreg, ${ex}.` }
    if (d.length > 9) return { number: d, problem: `Numărul are prea multe cifre. Scrie-l așa: ${ex}.` }
    return { number: d, problem: "" }
}

// What is wrong with one field, in words the visitor can act on ("" when it is fine). The browser's own
// bubbles said only "match the requested format", vanished after a moment and never showed in Clarity.
function problemOf(el: Field): string {
    if (el instanceof HTMLInputElement && el.type === "checkbox") return el.required && !el.checked ? "Bifează acordul de mai sus, ca să-ți putem trimite oferta." : ""
    if (el instanceof HTMLInputElement && el.type === "file") return ""
    const v = el.value.trim()
    if (el.name === "telefon") return v ? readPhone(v).problem : el.required ? "Scrie numărul tău de telefon, ca să te putem suna cu oferta." : ""
    if (!v) return !el.required ? "" : el.name === "nume" ? "Scrie-ne numele tău." : el.name === "email" ? "Scrie adresa ta de email." : "Completează și acest câmp."
    if (el.name === "nume" && v.length < 3) return "Numele pare prea scurt: scrie cel puțin 3 litere."
    if (el instanceof HTMLInputElement && el.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "Adresa de email pare greșită, de exemplu nume@gmail.com."
    if ("minLength" in el && el.minLength > 0 && v.length < el.minLength) return `Mai scrie puțin: cel puțin ${el.minLength} caractere.`
    return ""
}

// the message goes under the field, inside its label (or the consent line); gone as soon as it is fixed
function showProblem(el: Field, text: string) {
    const host = el.closest("label") ?? el.parentElement
    let note = host?.querySelector<HTMLElement>(":scope > .field-error")
    if (!text) {
        note?.remove()
        el.removeAttribute("aria-invalid")
        return
    }
    if (!note && host) {
        note = document.createElement("small")
        note.className = "field-error"
        note.setAttribute("role", "alert")
        host.append(note)
    }
    if (note) note.textContent = text
    el.setAttribute("aria-invalid", "true")
}

const fieldsOf = (f: HTMLFormElement) => [...f.elements].filter((el): el is Field =>
    (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) && !!el.name && el.name !== "website" && el.type !== "hidden" && !el.closest("[hidden]"))

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
        const formEl = e.currentTarget
        // our own checks, with a message under each field that needs fixing
        const wrong = fieldsOf(formEl).filter(el => {
            const p = problemOf(el)
            showProblem(el, p)
            return !!p
        })
        if (wrong.length) {
            const first = wrong[0]
            first.closest("details")?.setAttribute("open", "")
            first.scrollIntoView({ block: "center", behavior: "smooth" })
            first.focus({ preventScroll: true })
            // countable in GA and filterable in Clarity: which field stopped people
            track("form_invalid", { formular: kind, camp: wrong.map(el => el.name).join(",") })
            return
        }
        const data = new FormData(formEl)
        // the phone as one clean number, whatever way it was typed
        const phone = formEl.querySelector<HTMLInputElement>('input[name="telefon"]')
        if (phone?.value.trim()) data.set("telefon", readPhone(phone.value).number)
        data.set("kind", kind)
        data.set("t", String(shownAt.current))
        // where the visitor came from (Google Ads, search, social…), shown in the request e-mail
        for (const [k, v] of Object.entries(sourceFields())) data.set(k, v)
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
                setLeadData(String(data.get("email") ?? ""), String(data.get("telefon") ?? ""))
                track("generate_lead", { formular: kind })
                setStatus("sent")
                return
            }
            setError(ERRORS[body.error] ?? "")
            setStatus("error")
        } catch {
            setStatus("error")
        }
    }

    const recheck = (e: React.FormEvent<HTMLFormElement>) => {
        const el = e.target as Field
        if (el.getAttribute?.("aria-invalid") && !problemOf(el)) showProblem(el, "")
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
        // the form itself stays visible in Clarity (calculator choices, prices); the personal fields inside
        // carry their own data-clarity-mask, so what people type never reaches Clarity, whatever its panel settings
        // noValidate: the checks above replace the browser's bubbles; a message clears once its field is fixed
        <form className={className} onSubmit={onSubmit} noValidate onInput={recheck} onChange={recheck} {...rest}>
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
                Sunt de acord cu prelucrarea datelor conform{" "}
                <Link href="/politica-de-confidentialitate" target="_blank">Politicii de confidențialitate</Link>. *
            </span>
        </label>
    )
}
