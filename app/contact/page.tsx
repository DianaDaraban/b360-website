import type { Metadata } from "next"
import Link from "next/link"
import { Icon } from "@/components/Icon"
import { site } from "@/lib/site"
import styles from "../content.module.css"

export const metadata: Metadata = {
    title: "Contact – B360 Corbeanca, Ilfov",
    description: `Sună-ne la ${site.phone}, scrie-ne la ${site.email} sau vino la atelier: ${site.address.street}, ${site.address.locality}, ${site.address.region}.`,
    alternates: { canonical: "/contact" },
}

const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`B360, ${site.address.street}, ${site.address.locality}, ${site.address.region}`)}`

export default function ContactPage() {
    return (
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
    )
}
