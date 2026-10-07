import Image from "next/image"
import Link from "next/link"
import { site } from "@/lib/site"
import { Icon } from "./Icon"
import styles from "./ContactCta.module.css"

// Closing block of every page (Figma: "Contactează-ne acum…"), over a faded work photo with
// the floating colour blobs
export function ContactCta() {
    return (
        <section className={styles.cta} aria-labelledby="contacteaza">
            <Image src="/img/wrap-hands.webp" alt="" fill sizes="100vw" className={styles.photo} />
            <div className={styles.blobs} aria-hidden="true"><span /><span /><span /></div>
            <div className="narrow">
                <h2 id="contacteaza" className={styles.title}>Contactează-ne acum</h2>
                <p className={styles.text}>pentru o ofertă personalizată și hai să lucrăm împreună la imaginea brandului tău!</p>
                <div className={styles.actions}>
                    <a href={site.phoneHref} className="btn"><Icon name="phone" size={20} /> {site.phone}</a>
                    <Link href="/oferta" className="btn-ghost on-light">
                        Cere ofertă online
                        <span className="arrow-sticker peel" aria-hidden="true"><Icon name="arrow" size={18} /></span>
                    </Link>
                </div>
            </div>
        </section>
    )
}
