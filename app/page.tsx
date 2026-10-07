import Image from "next/image"
import Link from "next/link"
import { servicii } from "@/data/servicii"
import { ContactCta } from "@/components/ContactCta"
import styles from "./home.module.css"

const clienti = [
    ["mercedes-benz", "Mercedes-Benz"],
    ["city-grill", "City Grill"],
    ["tiriac-auto", "Țiriac Auto"],
    ["carrefour", "Carrefour"],
    ["continental", "Continental"],
    ["ravitex", "Ravitex"],
    ["polach", "Polach"],
    ["amgen", "Amgen"],
    ["draper-tools", "Draper Tools"],
    ["jaguar", "Jaguar"],
    ["basilica-travel", "Basilica Travel"],
    ["astra-giurgiu", "Astra Giurgiu"],
] as const

const lucrariRecente = [
    { src: "/lucrari/autoturisme/castrol.webp", alt: "Colantare autoturism Castrol" },
    { src: "/lucrari/autocare/flixbus.webp", alt: "Inscripționare autocar Flixbus" },
    { src: "/lucrari/autoutilitare/ambulanta-1.webp", alt: "Inscripționare ambulanță" },
    { src: "/lucrari/autoturisme/masina-de-curse-1.webp", alt: "Colantare mașină de curse" },
    { src: "/lucrari/camioane/ravitex-1.webp", alt: "Inscripționare camion Ravitex" },
    { src: "/lucrari/vitrine/godac.webp", alt: "Colantare vitrină Godac" },
]

export default function Home() {
    return (
        <>
            <section className={styles.hero}>
                <Image src="/img/hero-graffiti.webp" alt="" fill priority sizes="100vw" className={styles.heroPhoto} />
                <div className={`container ${styles.heroText}`}>
                    <p className={styles.kicker}>Din 2012 · Corbeanca, Ilfov</p>
                    <h1>Colantări auto și inscripționări publicitare</h1>
                    <p className="lead">
                        La <strong>B360</strong> transformăm ideile în vizibilitate: colantări auto, branding de flote,
                        vitrine și stickere, de la concept grafic la montaj.
                    </p>
                    <div className={styles.heroActions}>
                        <Link href="/oferta" className="btn peel">Cere ofertă</Link>
                        <Link href="/portofoliu" className={styles.textLink}>Vezi lucrările</Link>
                    </div>
                </div>
            </section>

            <section className={`section ${styles.services}`} aria-labelledby="servicii">
                <div className="container">
                    <h2 id="servicii" className="section-title">Servicii</h2>
                </div>
                <ul className={styles.serviceRail}>
                    {servicii.map(s => (
                        <li key={s.slug}>
                            <Link href={`/servicii#${s.slug}`} className={styles.serviceCard}>
                                <Image src={s.image} alt="" width={600} height={600} sizes="(min-width: 1024px) 280px, 46vw" />
                                <span>{s.short}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>

            <section className={`section tinted ${styles.clients}`} aria-labelledby="clienti">
                <Image src="/img/wrap-salon.webp" alt="" fill sizes="100vw" className="tint-photo" />
                <div className="container">
                    <h2 id="clienti" className="section-title">Clienții noștri fideli</h2>
                    <ul className={styles.logos}>
                        {clienti.map(([file, name]) => (
                            <li key={file} className="peel">
                                <img src={`/clienti/${file}.webp`} alt={name} width={300} height={139} loading="lazy" />
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            <section className={`section ${styles.recent}`} aria-labelledby="lucrari">
                <div className="container">
                    <h2 id="lucrari" className="section-title">Cele mai recente lucrări</h2>
                    <ul className={styles.workGrid}>
                        {lucrariRecente.map(l => (
                            <li key={l.src}>
                                <Image src={l.src} alt={l.alt} width={600} height={600} sizes="(min-width: 1024px) 380px, 31vw" />
                            </li>
                        ))}
                    </ul>
                    <p className={styles.more}><Link href="/portofoliu" className="btn peel">Vezi tot portofoliul</Link></p>
                </div>
            </section>

            <ContactCta />
        </>
    )
}
