import Link from "next/link"
import { site } from "@/lib/site"
import { Icon } from "./Icon"
import styles from "./ContactCta.module.css"

// Closing block from the Figma pages: "Contactează-ne acum…"
export function ContactCta() {
    return (
        <section className={styles.cta} aria-labelledby="contacteaza">
            <div className="narrow">
                <h2 id="contacteaza" className={styles.title}>Contactează-ne acum</h2>
                <p className={styles.text}>pentru o ofertă personalizată și hai să lucrăm împreună la imaginea brandului tău!</p>
                <div className={styles.actions}>
                    <a href={site.phoneHref} className="btn"><Icon name="phone" size={20} /> {site.phone}</a>
                    <Link href="/oferta" className={styles.link}>sau trimite o cerere de ofertă</Link>
                </div>
            </div>
        </section>
    )
}
