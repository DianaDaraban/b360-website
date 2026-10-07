import Image from "next/image"
import Link from "next/link"
import { servicii } from "@/data/servicii"
import { ContactCta } from "@/components/ContactCta"
import { Icon } from "@/components/Icon"
import { Blobs } from "@/components/Blobs"
import { clienti } from "@/data/clienti"
import styles from "./home.module.css"


// Hero slideshow, like the old WordPress header: photos crossfade under a moving colour wash
const heroPhotos = ["/img/hero-graffiti.webp", "/img/colorful-convertible.webp", "/img/hero-dragon.webp", "/img/storefront-stickers.webp"]

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
                <div className={styles.slides} aria-hidden="true">
                    {heroPhotos.map((src, i) => (
                        <Image key={src} src={src} alt="" fill priority={i === 0} sizes="100vw" className={styles.slide} />
                    ))}
                </div>
                <Blobs variant="photo" />
                <div className={`container ${styles.heroText}`}>
                    <p className={styles.kicker}>Din 2012 · Corbeanca, Ilfov</p>
                    <h1>
                        <span className={styles.h1Main}>Colantări auto</span>
                        <span className={styles.h1Sub}>și inscripționări <em>publicitare</em></span>
                    </h1>
                    <p className={styles.heroLead}>
                        La <strong>B360</strong> transformăm ideile în vizibilitate: colantări auto, branding de flote,
                        vitrine și stickere, de la concept grafic la montaj.
                    </p>
                    <div className={styles.heroActions}>
                        <Link href="/oferta" className="btn">Cere ofertă</Link>
                        <Link href="/portofoliu" className="btn-ghost">
                            Vezi lucrările
                            <span className="arrow-sticker peel" aria-hidden="true"><Icon name="arrow" size={18} /></span>
                        </Link>
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
                            <Link href={`/servicii/${s.slug}`} className={styles.serviceCard}>
                                <Image src={s.image} alt="" width={600} height={600} sizes="(min-width: 1024px) 280px, 46vw" />
                                <span>{s.short}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>

            <section className={`section tinted ${styles.clients}`} aria-labelledby="clienti">
                <Image src="/img/wrap-salon.webp" alt="" fill sizes="100vw" className="tint-photo" />
                <Blobs variant="photo" />
                <div className="container">
                    <h2 id="clienti" className="section-title">Clienții noștri fideli</h2>
                    <ul className={styles.logos}>
                        {clienti.slice(0, 12).map(c => (
                            <li key={c.slug}>
                                {c.match ? (
                                    <Link href={`/portofoliu?client=${c.slug}`} className={`${styles.logo} peel`} title={`Lucrări pentru ${c.name}`}>
                                        <img src={`/clienti/${c.logo}.webp`} alt={c.name} width={300} height={139} loading="lazy" />
                                    </Link>
                                ) : (
                                    <span className={`${styles.logo} peel`}>
                                        <img src={`/clienti/${c.logo}.webp`} alt={c.name} width={300} height={139} loading="lazy" />
                                    </span>
                                )}
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
                    <p className={styles.more}><Link href="/portofoliu" className="btn">Vezi tot portofoliul</Link></p>
                </div>
            </section>

            <ContactCta />
        </>
    )
}
