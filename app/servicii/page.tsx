import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Icon } from "@/components/Icon"
import { Rich } from "@/components/Rich"
import { ContactCta } from "@/components/ContactCta"
import { servicii } from "@/data/servicii"
import styles from "../content.module.css"

export const metadata: Metadata = {
    title: "Servicii – colantări auto, stickere, vitrine și folie PPF",
    description:
        "Colantări auto integrale și parțiale, inscripționări și stickere personalizate, colantări vitrine și folie PPF. Concept grafic, producție și montaj.",
    alternates: { canonical: "/servicii" },
}

const backgrounds = ["/img/racing-stripes.webp", "/img/colorful-convertible.webp", "/img/storefront-stickers.webp", "/img/wrap-fan.webp"]

export default function ServiciiPage() {
    return (
        <>
            <section className={`section ${styles.white}`}>
                <div className={`narrow ${styles.block}`}>
                    <h1 className={styles.pageTitle}>Servicii de colantare și producție publicitară</h1>
                    <p>
                        Din 2012, la <strong className="red">B360</strong> realizăm servicii complete de colantări și producție publicitară pentru
                        companii și branduri care vor să fie vizibile.
                    </p>
                    <p>Folosim materiale premium și oferim soluții personalizate, de la concept grafic până la execuție și montaj.</p>

                    {/* Figma: round photo stickers with a pointer, each jumps to its section */}
                    <ul className={styles.jumpList}>
                        {servicii.map((s, i) => (
                            <li key={s.slug} data-side={i % 2 ? "right" : "left"}>
                                <a href={`#${s.slug}`}>
                                    <span className={`${styles.jumpPhoto} peel`}>
                                        <Image src={s.image} alt="" width={160} height={160} />
                                    </span>
                                    <span>{s.title.split(" – ")[0]}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {servicii.map((s, i) => {
                const dark = i % 2 === 0
                return (
                    <section key={s.slug} id={s.slug} className={`section ${dark ? "tinted" : styles.white}`}>
                        {dark && <Image src={backgrounds[i]} alt="" fill sizes="100vw" className="tint-photo" />}
                        <div className={`narrow ${styles.block}`}>
                            <h2 className={`${styles.offerTitle} ${styles.serviceTitle}`}>{s.title}</h2>
                            <p className="lead"><Rich text={s.intro} /></p>
                            {s.offerLabel && <p>{s.offerLabel}</p>}
                            <ul className="checklist">
                                {s.offers.map(o => (
                                    <li key={o.title}>
                                        <Icon name="check" size={30} />
                                        <span><strong>{o.title}</strong>{o.text}</span>
                                    </li>
                                ))}
                            </ul>
                            <p className={styles.center}>
                                <Link href={`/portofoliu?categorie=${s.portfolio.category}`} className="btn">{s.portfolio.label}</Link>
                            </p>
                        </div>
                    </section>
                )
            })}

            <ContactCta />
        </>
    )
}
