import { site } from "@/lib/site"

// Receives the three site forms (ofertă, contact, calculator) and mails them to B360 through Resend
// (https://resend.com). Settings, all on the host, none in the code:
//   RESEND_API_KEY  the Resend API key (without it the forms answer "not configured")
//   FORM_TO         where the messages go, comma separated (default: the site e-mail)
//   RESEND_API_URL  only for local tests (a fake mail endpoint)
//   FORM_FROM       sender; until b360.ro is verified in Resend it must stay onboarding@resend.dev,
//                   which only delivers to the Resend account's own address
export const runtime = "nodejs"

const KINDS = {
    oferta: { subject: "Cerere ofertă colantare", required: ["nume", "telefon", "email"] },
    contact: { subject: "Mesaj de pe site", required: ["nume", "email", "mesaj"] },
    calculator: { subject: "Cerere din calculatorul de preț", required: ["nume", "telefon", "email"] },
} as const

// readable names for the field keys, in the order they appear in the e-mail
const LABELS: Record<string, string> = {
    nume: "Nume", companie: "Companie", telefon: "Telefon", email: "Email", subiect: "Subiect",
    serviciu: "Serviciu", tip: "Tip colantare", vehicul: "Tip vehicul", altTip: "Alt tip de vehicul", vehicule: "Număr vehicule",
    caroserie: "Caroserie", model: "Model", piese: "Piese selectate", estimare: "Estimare afișată",
    folie: "Folie", extra: "Servicii suplimentare", zone: "Zone", suprafata: "Suprafață", design: "Are deja designul",
    mesaj: "Mesaj",
}
const SKIP = new Set(["kind", "gdpr", "website", "t", "fisiere"])
const MAX_FILES_BYTES = 4 * 1024 * 1024 // the host accepts ~4.5 MB per request

const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!)
const reply = (status: number, body: object) => Response.json(body, { status })

export async function POST(req: Request) {
    let data: FormData
    try {
        data = await req.formData()
    } catch {
        return reply(400, { error: "invalid" })
    }

    const kind = String(data.get("kind")) as keyof typeof KINDS
    const config = KINDS[kind]
    if (!config) return reply(400, { error: "invalid" })

    // spam traps: a hidden field people never fill in, and a form sent less than 3 s after it was shown
    const shownAt = Number(data.get("t"))
    if (data.get("website") || (shownAt && Date.now() - shownAt < 3000)) return reply(200, { ok: true })

    const value = (k: string) => String(data.get(k) ?? "").trim()
    if (config.required.some(k => !value(k)) || data.get("gdpr") !== "da") return reply(422, { error: "missing" })
    const email = value("email")
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply(422, { error: "email" })

    const files = data.getAll("fisiere").filter((f): f is File => f instanceof File && f.size > 0)
    if (files.reduce((n, f) => n + f.size, 0) > MAX_FILES_BYTES) return reply(413, { error: "files" })

    // trimmed: a key pasted through some shells arrives with an invisible BOM in front
    const key = process.env.RESEND_API_KEY?.replace(/^\uFEFF/, "").trim()
    if (!key) return reply(503, { error: "not-configured" })

    // every filled field, grouped (checkbox lists joined), known fields first
    const keys = [...new Set([...data.keys()])].filter(k => !SKIP.has(k))
    keys.sort((a, b) => (Object.keys(LABELS).indexOf(a) + 1 || 99) - (Object.keys(LABELS).indexOf(b) + 1 || 99))
    const rows = keys
        .map(k => [LABELS[k] ?? k, data.getAll(k).map(v => String(v).trim()).filter(Boolean).join(", ")] as const)
        .filter(([, v]) => v)
    if (kind !== "contact" && value("telefon")) {
        const i = rows.findIndex(([l]) => l === "Telefon")
        if (i >= 0 && !value("telefon").startsWith("+")) rows[i] = ["Telefon", `+40 ${value("telefon")}`]
    }

    const html = `
        <div style="font-family:Arial,sans-serif;color:#3a3638;max-width:620px">
            <h2 style="color:#ee3338;margin:0 0 16px">${esc(config.subject)}</h2>
            <table style="border-collapse:collapse;width:100%">
                ${rows.map(([l, v]) => `<tr><td style="padding:8px 12px;border-bottom:1px solid #eadccf;font-weight:bold;white-space:nowrap;vertical-align:top">${esc(l)}</td><td style="padding:8px 12px;border-bottom:1px solid #eadccf;white-space:pre-wrap">${esc(v)}</td></tr>`).join("")}
            </table>
            ${files.length ? `<p style="margin-top:16px">Fișiere atașate: ${files.map(f => esc(f.name)).join(", ")}</p>` : ""}
            <p style="margin-top:20px;font-size:12px;color:#8d8a8e">Trimis de pe ${esc(site.url)} · Răspunde direct la acest email ca să-i scrii clientului.</p>
        </div>`

    const res = await fetch(process.env.RESEND_API_URL ?? "https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
            from: process.env.FORM_FROM ?? "Site B360 <onboarding@resend.dev>",
            to: (process.env.FORM_TO ?? site.email).split(",").map(s => s.trim()),
            reply_to: email,
            subject: `${config.subject} – ${value("nume")}`,
            html,
            attachments: await Promise.all(files.map(async f => ({ filename: f.name, content: Buffer.from(await f.arrayBuffer()).toString("base64") }))),
        }),
    })
    if (!res.ok) {
        console.error("Resend error", res.status, await res.text())
        return reply(502, { error: "send" })
    }
    return reply(200, { ok: true })
}
