import type { Metadata } from "next"
import Link from "next/link"
import { Icon } from "@/components/Icon"
import { site } from "@/lib/site"
import { Blobs } from "@/components/Blobs"
import Image from "next/image"
import styles from "../content.module.css"
import form from "../form.module.css"

export const metadata: Metadata = {
    title: "Contact – B360 Corbeanca, Ilfov",
    description: `Sună-ne la ${site.phone}, scrie-ne la ${site.email} sau vino la atelier: ${site.address.street}, ${site.address.locality}, ${site.address.region}.`,
    alternates: { canonical: "/contact" },
}

const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`B360, ${site.address.street}, ${site.address.locality}, ${site.address.region}`)}`

export default function ContactPage() {
    return (
        <>
        <section className={`section ${styles.white}`}>
            <div className={`narrow ${styles.block}`}>
                <h1 className={styles.pageTitle}>Contact</h1>
                <p className={styles.center}>Spune-ne ce vrei să colantezi și revenim cu o ofertă.</p>
                <ul className={styles.contactList}>
                    <li>
                        <Icon name="phone" size={28} />
                        <span><strong>Telefon</strong><a href={site.phoneHref}>{site.phone}</a></span>
                    </li>
                    <li>
                        <Icon name="at" size={28} />
                        <span><strong>Email</strong><a href={`mailto:${site.email}`}>{site.email}</a></span>
                    </li>
                    <li>
                        <Icon name="home" size={28} />
                        <span><strong>Atelier</strong><a href={mapsUrl} target="_blank" rel="noopener">{site.address.street}, {site.address.locality}, {site.address.region}</a></span>
                    </li>
                </ul>
                <p className={styles.center}><Link href="/oferta" className="btn">Cere ofertă online</Link></p>
            </div>
        </section>

        {/* Messages that are not a quote request: feedback, opinions, proposals */}
        <section className={`section tinted ${form.page}`} aria-labelledby="mesaj">
            <Image src="/img/paper.webp" alt="" fill sizes="100vw" className="tint-photo" />
            <Blobs variant="photo" />
            <div className="narrow">
                <h2 id="mesaj" className={styles.subTitle}>Trimite-ne un mesaj</h2>
                <p className={styles.center}>Feedback, păreri, propuneri de colaborare sau o întrebare. Citim tot ce primim.</p>
            </div>
            <form className={form.form}>
                <div className={form.inner} style={{ marginTop: 24 }}>
                    <label className={form.field}>Nume *<input name="nume" autoComplete="name" required /></label>
                    <label className={form.field}>Email *<input name="email" type="email" autoComplete="email" required /></label>
                    <label className={form.field}>
                        Despre ce e vorba
                        <select name="subiect" defaultValue="Feedback">
                            <option>Feedback</option>
                            <option>Sugestie</option>
                            <option>Propunere de colaborare</option>
                            <option>Întrebare</option>
                        </select>
                    </label>
                    <label className={form.field}>Mesajul tău *<textarea name="mesaj" required minLength={10} /></label>
                </div>
                <div className={form.submit}>
                    <button type="submit" className="btn">Trimite mesajul</button>
                </div>
            </form>
        </section>
        </>
    )
}
