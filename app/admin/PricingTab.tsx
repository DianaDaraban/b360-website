"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import type { PricingConfig } from "@/lib/pricing"
import type { PricingStatus } from "@/lib/pricing-store"
import { savePricingLink, syncPricingNow, uploadPricing } from "./actions"
import styles from "./admin.module.css"

const when = (iso?: string) => (iso ? new Date(iso).toLocaleString("ro-RO", { dateStyle: "medium", timeStyle: "short" }) : "–")

// The calculator's prices come from a workbook in Google Drive (read again every hour, or now with the
// button); a file can also be uploaded by hand. Mistakes are listed and the previous prices stay on the site.
export function PricingTab({ link, status, pricing, usingDefaults }: { link: string; status: PricingStatus | null; pricing: PricingConfig; usingDefaults: boolean }) {
    const router = useRouter()
    const [url, setUrl] = useState(link)
    const [message, setMessage] = useState<string | null>(null)
    const [last, setLast] = useState<PricingStatus | null>(status)
    const [busy, start] = useTransition()

    const run = (action: () => Promise<PricingStatus | null>) => start(async () => {
        setMessage(null)
        const s = await action()
        if (s) setLast(s)
        else setMessage("Nu e salvat niciun link către tabel.")
        router.refresh()
    })
    const saveLink = () => start(async () => {
        const res = await savePricingLink(url)
        setMessage(res.ok ? "Linkul a fost salvat." : res.error ?? null)
        if (res.ok && url) run(syncPricingNow)
    })

    const s = pricing.settings
    return (
        <div className={styles.card}>
            <h2>Prețuri calculator</h2>
            <p>Prețurile se iau din tabelul din Google Drive. Site-ul îl citește singur o dată pe oră; după ce modifici tabelul, apasă „Actualizează acum” ca schimbările să apară imediat. Dacă tabelul are greșeli, site-ul păstrează prețurile de dinainte și îți arată aici ce trebuie corectat.</p>

            <div className={styles.fields}>
                <label className={styles.wide}>Linkul tabelului (Google Sheets / Drive, partajat cu „Oricine are linkul”)
                    <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://docs.google.com/spreadsheets/d/…" />
                </label>
            </div>
            <div className={styles.actions}>
                <button className="btn" onClick={() => run(syncPricingNow)} disabled={busy || !link}>{busy ? "Se verifică…" : "Actualizează acum"}</button>
                <button className="btn-ghost on-light" onClick={saveLink} disabled={busy || url === link}>Salvează linkul</button>
                {link && <a className={styles.link} href={link} target="_blank" rel="noreferrer">Deschide tabelul</a>}
            </div>
            {message && <p className={styles.note} role="status">{message}</p>}

            {last && (
                <div className={last.ok ? styles.statusOk : styles.statusBad} role="status">
                    <strong>{last.ok ? "Prețurile au fost actualizate" : "Tabelul are greșeli: pe site au rămas prețurile de dinainte"}</strong>
                    <small>verificat {when(last.checkedAt)} · {last.via === "drive" ? "din Google Drive" : "din fișier încărcat"}</small>
                    {last.ok && (last.changes.length ? <ul>{last.changes.map(c => <li key={c}>{c}</li>)}</ul> : <p>Nicio schimbare față de prețurile de dinainte.</p>)}
                    {!last.ok && <ul>{last.errors.map(e => <li key={e}>{e}</li>)}</ul>}
                </div>
            )}

            <details className={styles.more}>
                <summary>Ce prețuri folosește acum calculatorul {usingDefaults ? "(valorile inițiale, încă nu s-a citit niciun tabel)" : `(din ${when(pricing.updatedAt)})`}</summary>
                <table className={styles.table}>
                    <thead><tr><th>Cod</th><th>Denumire</th><th>Tip</th><th>Ani</th><th>Lățime</th><th>€/mp</th><th>Laminare</th></tr></thead>
                    <tbody>
                        {pricing.materials.map(m => (
                            <tr key={`${m.code}-${m.laminate ?? ""}`}><td>{m.code}</td><td>{m.name}{m.subtype && ` (${m.subtype})`}</td><td>{m.type}</td><td>{m.years}</td><td>{m.width} m</td><td>{m.eur}</td><td>{m.laminate ?? "–"}</td></tr>
                        ))}
                    </tbody>
                </table>
                <p className={styles.note}>Manoperă ×{s.labour} · cerneală {s.ink} €/mp · curs {s.eurRate === "BNR" ? "BNR (automat)" : `${s.eurRate} lei`} · TVA {s.vat}% · interval ±{s.margin}% · grafică AI +{s.aiSurcharge}% · grafică: {pricing.graphics.map(g => `${g.from}–${g.to} piese ${g.eur} €`).join(", ")}</p>
            </details>

            <details className={styles.more}>
                <summary>Încarcă un fișier Excel în loc de tabelul din Drive</summary>
                <form action={f => run(() => uploadPricing(f))} className={styles.actions}>
                    <input type="file" name="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" required />
                    <button className="btn-ghost on-light" disabled={busy}>Verifică și aplică</button>
                </form>
                <p className={styles.note}>Fișierul trebuie să aibă aceleași foi ca tabelul (Materiale, Piese, Grafică, Setări). Atenție: la următoarea citire automată, tabelul din Drive îl înlocuiește.</p>
            </details>
        </div>
    )
}
