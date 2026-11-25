"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Icon } from "./Icon"
import { setLeadData, track } from "@/lib/analytics"
import { site } from "@/lib/site"
import { sourceFields } from "@/lib/source"
import calc from "./Calculator.module.css"

type Status = "idle" | "sending" | "sent" | "error"
const MAX_FILES_BYTES = 4 * 1024 * 1024

// Under a calculator's estimate, on the dark card, two ways in that look alike: WhatsApp (the visitor
// sends us the estimate, already written; the line under it says we call back) and "leave your number,
// we call you". The big call button went (Nov 2026: three differently styled buttons in one small card;
// on a phone the call stays in the bottom bar). It sits inside the calculator's own <form>, so it cannot
// be a form itself: the callback sends that form's fields (the whole configuration) with the number
// typed here, as a "callback" request.
export function CallFirst({ from, whatsappHref, whatsappLabel }: { from: "calculator" | "tapet"; whatsappHref: string; whatsappLabel: string }) {
    const [phone, setPhone] = useState("")
    const [status, setStatus] = useState<Status>("idle")
    // the button is always pressable; pressing it without a whole number marks the field and says why
    const [invalid, setInvalid] = useState(false)
    const input = useRef<HTMLInputElement>(null)
    const shownAt = useRef(0)
    const box = useRef<HTMLDivElement>(null)
    useEffect(() => { shownAt.current = Date.now() }, [])

    // a Romanian number with or without +40 / 0040 / 0 in front: kept as its 9 digits
    const digits = phone.replace(/\D/g, "").replace(/^(0040|40|0)/, "")
    const valid = digits.length === 9

    const send = async () => {
        if (status === "sending") return
        if (!valid) { setInvalid(true); input.current?.focus(); return }
        const outer = box.current?.closest("form")
        const data = outer ? new FormData(outer) : new FormData()
        // the visitor's own number from here; the long form's contact fields go too, if they were filled in
        data.set("kind", "callback")
        data.set("calculatorul", from === "tapet" ? "Calculatorul de tapet" : "Calculatorul auto")
        data.set("telefon", digits)
        data.set("t", String(shownAt.current))
        for (const [k, v] of Object.entries(sourceFields())) data.set(k, v)
        const size = data.getAll("fisiere").reduce((n, f) => n + (f instanceof File ? f.size : 0), 0)
        if (size > MAX_FILES_BYTES) data.delete("fisiere")
        setStatus("sending")
        try {
            const res = await fetch("/api/form", { method: "POST", body: data })
            if (!res.ok) throw new Error(String(res.status))
            setLeadData("", digits)
            track("generate_lead", { formular: `${from}-suna-ma` })
            setStatus("sent")
        } catch {
            setStatus("error")
        }
    }

    return (
        <div className={calc.reach} ref={box}>
            {/* one band, two buttons of the same size and colour: WhatsApp, then the number field */}
            <div className={calc.callback}>
            <a href={whatsappHref} target="_blank" rel="noopener" className={calc.waBtn}><Icon name="whatsapp" size={24} uncut />{whatsappLabel}</a>
            <small className={calc.waNote}>Te sunăm noi, de obicei în aceeași zi.</small>

            {status === "sent" ? (
                <p className={calc.callbackDone} role="status">
                    <b>Mulțumim, te sunăm noi!</b> În programul de lucru, de obicei în aceeași zi. Ai primit deja configurația ta la noi.
                </p>
            ) : (
                <div className={calc.callbackForm} data-clarity-mask="true">
                    <label htmlFor={`cb-${from}`}>Sau <b>lasă-ne numărul și te sunăm noi:</b></label>
                    <div className={calc.callbackRow}>
                        <span>+40</span>
                        <input
                            ref={input}
                            id={`cb-${from}`}
                            type="tel"
                            inputMode="tel"
                            autoComplete="tel-national"
                            placeholder="722 12 34 56"
                            value={phone}
                            onChange={e => { setPhone(e.target.value); setInvalid(false) }}
                            // Enter here asks for the call, not for the long form below
                            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); send() } }}
                            aria-invalid={invalid || undefined}
                            aria-describedby={`cb-${from}-note`}
                        />
                        <button type="button" className={calc.callbackBtn} onClick={send} disabled={status === "sending"}>
                            <Icon name="phone" size={20} uncut />{status === "sending" ? "Se trimite…" : "Sună-mă"}
                        </button>
                    </div>
                    <small id={`cb-${from}-note`} className={calc.callbackNote} data-error={invalid || status === "error" || undefined} role={invalid ? "alert" : undefined}>
                        {status === "error"
                            ? <>Nu s-a putut trimite. Sună-ne la <a href={site.phoneHref}>{site.phone}</a>.</>
                            : invalid
                                ? <>{digits.length ? "Numărul pare incomplet: " : "Scrie mai întâi numărul tău de telefon: "}9 cifre după +40, de exemplu 722 12 34 56.</>
                                : <>Primim și configurația de mai sus. Folosim numărul doar ca să te sunăm (<Link href="/politica-de-confidentialitate" target="_blank">confidențialitate</Link>).</>}
                    </small>
                </div>
            )}
            </div>
        </div>
    )
}
