import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Blobs } from "@/components/Blobs"
import { Icon } from "@/components/Icon"
import { Select } from "@/components/Select"
import { Consent, SmartForm } from "@/components/SmartForm"
import { site } from "@/lib/site"
import styles from "./contact.module.css"
import form from "../form.module.css"

export const metadata: Metadata = {
    title: "Contact – B360 Corbeanca, Ilfov",
    description: `Sună-ne la ${site.phone}, scrie-ne la ${site.email} sau vino la atelier: ${site.address.street}, ${site.address.locality}, ${site.address.region}.`,
    alternates: { canonical: "/contact" },
}

const canale = [
    { icon: "phone", label: "Telefon", value: site.phone, href: site.phoneHref, note: "cel mai rapid răspuns" },
    { icon: "at", label: "Email", value: site.email, href: `mailto:${site.email}`, note: "pentru detalii și fișiere" },
    { icon: "home", label: "Atelier", value: `${site.address.street}, ${site.address.locality}`, href: site.wazeUrl, note: "deschide în Waze" },
] as const

// One photo section: the ways to reach us on the left, the message form on the right
export default function ContactPage() {
    return (
        <section className={`tinted contact-page ${form.page} ${styles.page}`}>
            <Image src="/img/paper.webp" alt="" fill priority sizes="100vw" className="tint-photo" />
            <Blobs variant="photo" />
            <div className={`container ${styles.grid}`}>
                <div className={styles.side}>
                    <p className="eyebrow start">Contact</p>
                    <h1 className={styles.title}>Hai să vorbim</h1>
                    <p className={styles.lead}>Spune-ne ce vrei să colantezi și revenim cu o ofertă.</p>
                    <ul className={styles.channels}>
                        {canale.map(c => (
                            <li key={c.label}>
                                <a href={c.href} className={styles.channel} {...(c.icon === "home" ? { target: "_blank", rel: "noopener" } : {})}>
                                    <span className={`${styles.channelIcon} peel`}><Icon name={c.icon} size={26} /></span>
                                    <span className={styles.channelText}>
                                        <small>{c.label}</small>
                                        <strong>{c.value}</strong>
                                        <em>{c.note}</em>
                                    </span>
                                </a>
                            </li>
                        ))}
                    </ul>
                    <Link href="/oferta" className="btn-ghost">Cere ofertă online</Link>
                </div>

                {/* Messages that are not a quote request: feedback, opinions, proposals */}
                <SmartForm kind="contact" className={`${form.form} ${styles.card}`} aria-labelledby="mesaj">
                    <h2 id="mesaj" className={styles.cardTitle}>Trimite-ne un mesaj</h2>
                    <p className={styles.cardText}>Feedback, păreri, propuneri de colaborare sau o întrebare. Citim tot ce primim.</p>
                    <div className={styles.fields}>
                        <label className={form.field}>Nume *<input name="nume" autoComplete="name" required /></label>
                        <label className={form.field}>Email *<input name="email" type="email" autoComplete="email" required /></label>
                        <div className={`${form.field} ${styles.topic}`}>
                            <span id="subiect-label">Despre ce e vorba</span>
                            <Select name="subiect" labelledBy="subiect-label" options={["Feedback", "Sugestie", "Propunere de colaborare", "Întrebare"]} />
                        </div>
                        <label className={`${form.field} ${styles.wide}`}>Mesajul tău *<textarea name="mesaj" required minLength={10} /></label>
                    </div>
                    {/* consent on the left, the send button on the right */}
                    <div className={styles.sendRow}>
                        <Consent />
                        <button type="submit" className="btn">Trimite mesajul</button>
                    </div>
                </SmartForm>
            </div>
        </section>
    )
}
