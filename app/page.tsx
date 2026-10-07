import Image from "next/image"
import Link from "next/link"
import { servicii } from "@/data/servicii"
import { ContactCta } from "@/components/ContactCta"
import { Icon } from "@/components/Icon"
import { Blobs } from "@/components/Blobs"
import { Carousel } from "@/components/Carousel"
import { ScrollCue } from "@/components/ScrollCue"
import { clienti, tilts } from "@/data/clienti"
import styles from "./home.module.css"


// Hero slideshow, like the old WordPress header: photos crossfade under a moving colour wash
const heroPhotos = ["/img/hero-graffiti.webp", "/img/colorful-convertible.webp", "/img/hero-dragon.webp", "/img/storefront-stickers.webp"]

const lucrariRecente = [
    { src: "/lucrari/autoturisme/castrol.webp", alt: "Colantare autoturism Castrol", cat: "autoturisme", label: "Autoturisme" },
    { src: "/lucrari/autocare/flixbus.webp", alt: "Inscripționare autocar Flixbus", cat: "autocare", label: "Autocare" },
    { src: "/lucrari/autoutilitare/ambulanta-1.webp", alt: "Inscripționare ambulanță", cat: "autoutilitare", label: "Autoutilitare" },
    { src: "/lucrari/autoturisme/masina-de-curse-1.webp", alt: "Colantare mașină de curse", cat: "autoturisme", label: "Autoturisme" },
    { src: "/lucrari/camioane/ravitex-1.webp", alt: "Inscripționare camion Ravitex", cat: "camioane", label: "Camioane" },
    { src: "/lucrari/vitrine/godac.webp", alt: "Colantare vitrină Godac", cat: "vitrine", label: "Vitrine" },
    { src: "/lucrari/camioane/holcim-1.webp", alt: "Inscripționare camion Holcim", cat: "camioane", label: "Camioane" },
    { src: "/lucrari/vitrine/tiriac-auto-1.webp", alt: "Colantare vitrină Țiriac Auto", cat: "vitrine", label: "Vitrine" },
]

// empty red stickers after the logos, waiting for the clients still to come
const EMPTY_STICKERS = 4


export default function Home() {
    return (
        <div className="snap-page">
            <section className={`snap-slide ${styles.hero}`}>
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
                        <Link href="/calculator" className="btn"><Icon name="calculator" size={20} /> Calculează costul</Link>
                        <Link href="/portofoliu" className="btn">Vezi lucrările</Link>
                    </div>
                </div>
            </section>

            <section className={`section snap-slide ${styles.services}`} aria-labelledby="servicii">
                <div className="container">
                    <h2 id="servicii" className="section-title">Servicii</h2>
                </div>
                {/* Figma: long pill buttons, each closed by a round photo sticker that alternates sides */}
                <ul className={`container ${styles.servicePills}`}>
                    {servicii.map(s => (
                        <li key={s.slug}>
                            <Link href={`/servicii/${s.slug}`} className={styles.servicePill}>
                                <span className={`${styles.serviceDot} peel`}>
                                    <Image src={s.image} alt="" width={300} height={300} sizes="(min-width: 1024px) 150px, 96px" />
                                </span>
                                <span className={styles.serviceText}>
                                    <strong>{s.short}</strong>
                                    <small>{s.teaser}</small>
                                </span>
                                <span className="arrow-sticker peel" aria-hidden="true"><Icon name="arrow" size={20} /></span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>

            {/* clients and recent work share one screen */}
            <div className={`snap-slide ${styles.pair}`}>
            <section className={`tinted ${styles.clients}`} aria-labelledby="clienti">
                <Image src="/img/wrap-salon.webp" alt="" fill sizes="100vw" className="tint-photo" />
                <Blobs variant="photo" />
                <div className="container">
                    <h2 id="clienti" className={styles.clientsTitle}>Clienții noștri fideli</h2>
                    <Carousel label="Clienți" className={styles.clientStrip}>
                        {clienti.map((c, i) => {
                            const style = { "--tilt": `${tilts[i % tilts.length]}deg` } as React.CSSProperties
                            const logo = <img src={`/clienti/${c.logo}.webp`} alt={c.name} width={300} height={139} loading="lazy" />
                            return (
                                <li key={c.slug}>
                                    {c.match
                                        ? <Link href={`/portofoliu?client=${c.slug}`} className="client-sticker peel" style={style} title={`Lucrări pentru ${c.name}`}>{logo}</Link>
                                        : <span className="client-sticker peel" style={style} title={c.name}>{logo}</span>}
                                </li>
                            )
                        })}
                        {Array.from({ length: EMPTY_STICKERS }, (_, i) => (
                            <li key={`gol-${i}`} aria-hidden="true">
                                <span className="client-sticker peel" style={{ "--tilt": `${tilts[(clienti.length + i) % tilts.length]}deg` } as React.CSSProperties} />
                            </li>
                        ))}
                    </Carousel>
                </div>
            </section>

            <section className={styles.recent} aria-labelledby="lucrari">
                <div className="container">
                    <h2 id="lucrari" className={`section-title ${styles.recentTitle}`}>Cele mai recente lucrări</h2>
                    <Carousel label="Cele mai recente lucrări" className={styles.workStrip}>
                        {lucrariRecente.map(l => (
                            <li key={l.src}>
                                <Link href={`/portofoliu?categorie=${l.cat}`} className={styles.work}>
                                    <Image src={l.src} alt={l.alt} width={640} height={480} sizes="(min-width: 768px) 360px, 78vw" />
                                    <span className={styles.workCaption}>
                                        <small>{l.label}</small>
                                        <strong>{l.alt}</strong>
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </Carousel>
                    <p className={styles.more}><Link href="/portofoliu" className="btn">Vezi tot portofoliul</Link></p>
                </div>
            </section>
            </div>

            <div className="snap-slide snap-last">
                <ContactCta />
            </div>
            <ScrollCue />
        </div>
    )
}
