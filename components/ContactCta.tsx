import Image from "next/image"
import Link from "next/link"
import { site } from "@/lib/site"
import { Icon } from "./Icon"
import styles from "./ContactCta.module.css"

// Closing block of every page (Figma: "Contactează-ne acum…"), over a faded work photo with
// the floating colour blobs
export function ContactCta() {
    return (
        <section className={`contact-cta ${styles.cta}`} aria-labelledby="contacteaza">
            <Image src="/img/wrap-hands.webp" alt="" fill sizes="100vw" className={styles.photo} />
            <div className={styles.blobs} aria-hidden="true"><span /><span /><span /></div>
            {/* as wide as the sentence: the buttons spread evenly under it */}
            <div className={styles.inner}>
                <h2 id="contacteaza" className={styles.title}>Contactează-ne acum</h2>
                <p className={styles.text}>pentru o ofertă personalizată și hai să lucrăm împreună la imaginea brandului tău!</p>
                {/* four ways in, as round stickers with the Figma icons */}
                <ul className={styles.actions}>
                    <li><a href={site.phoneHref} className={styles.action}><span className={`${styles.icon} peel`}><Icon name="phone" size={26} /></span><span>Sună-ne</span></a></li>
                    <li><a href={`mailto:${site.email}`} className={styles.action}><span className={`${styles.icon} peel`}><Icon name="at" size={28} /></span><span>Scrie-ne</span></a></li>
                    <li><Link href="/oferta" className={styles.action}><span className={`${styles.icon} peel`}><Icon name="mail" size={30} /></span><span>Cere ofertă</span></Link></li>
                    <li><Link href="/calculator" className={styles.action}><span className={`${styles.icon} peel`}><Icon name="calculator" size={28} /></span><span>Calculează costul</span></Link></li>
                </ul>
            </div>
        </section>
    )
}
