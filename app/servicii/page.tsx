import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ContactCta } from "@/components/ContactCta"
import { servicii } from "@/data/servicii"
import styles from "./servicii.module.css"

export const metadata: Metadata = {
    title: "Servicii – colantări auto, stickere, vitrine și folie PPF",
    description:
        "Colantări auto integrale și parțiale, inscripționări și stickere personalizate, colantări vitrine și folie PPF. Concept grafic, producție și montaj.",
    alternates: { canonical: "/servicii" },
}

export default function ServiciiPage() {
    return (
        <>
            <section className="section">
                <div className="narrow prose">
                    <h1 className={styles.title}>Servicii de colantare și producție publicitară</h1>
                    <p className="lead">
                        Din 2012, la <strong className="red">B360</strong> realizăm servicii complete de colantări și producție publicitară pentru
                        companii și branduri care vor să fie vizibile.
                    </p>
                    <p>Folosim materiale premium și oferim soluții personalizate, de la concept grafic până la execuție și montaj.</p>
                </div>

                <ul className={`container ${styles.grid}`}>
                    {servicii.map(s => (
                        <li key={s.slug}>
                            <Link href={`/servicii/${s.slug}`} className={styles.card}>
                                <span className={styles.photo}>
                                    <Image src={s.image} alt="" width={640} height={480} sizes="(min-width: 1024px) 380px, (min-width: 640px) 46vw, 92vw" />
                                </span>
                                <span className={styles.body}>
                                    <span className={styles.cardTitle}>{s.short}</span>
                                    <span className={styles.text}>{s.intro}</span>
                                    <span className={styles.more}>
                                        Află mai mult
                                        <span className="arrow-sticker peel" aria-hidden="true">
                                            <svg viewBox="0 0 24 24" width="18" height="18"><path d="M4 12h15m-6-6 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                        </span>
                                    </span>
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>
            <ContactCta />
        </>
    )
}
