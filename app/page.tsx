import Image from "next/image"
import Link from "next/link"
import { servicii } from "@/data/servicii"
import { ContactCta } from "@/components/ContactCta"
import { Icon } from "@/components/Icon"
import { Blobs } from "@/components/Blobs"
import { Carousel } from "@/components/Carousel"
import { ScrollCue } from "@/components/ScrollCue"
import { clienti, logoBox, tilts } from "@/data/clienti"
import { getProjects } from "@/lib/projects"
import styles from "./home.module.css"


// Hero slideshow, like the old WordPress header: photos crossfade under a moving colour wash
const heroPhotos = ["/img/hero-graffiti.webp", "/img/colorful-convertible.webp", "/img/hero-dragon.webp", "/img/storefront-stickers.webp"]

// "Cele mai recente lucrări": the newest projects (the ones added from /admin come first)
const RECENT = 8
// the page is rebuilt when something is saved in the admin, and at least once an hour
export const revalidate = 3600



export default async function Home() {
    const lucrariRecente = (await getProjects()).slice(0, RECENT)
    return (
        <div className="snap-page">
            <section className={`snap-slide hero-sheen ${styles.hero}`} data-label="Început">
                <div className={styles.slides} aria-hidden="true">
                    {heroPhotos.map((src, i) => (
                        <Image key={src} src={src} alt="" fill priority={i === 0} sizes="100vw" className={styles.slide} />
                    ))}
                </div>
                <Blobs variant="photo" />
                <div className={`container ${styles.heroText}`}>
                    <p className={`eyebrow on-photo ${styles.kicker}`}>Din 2012</p>
                    <h1>
                        {/* revealed word by word like vinyl being applied (styles in globals) */}
                        <span className={styles.h1Main}>
                            <span className="reveal-word" style={{ "--i": 0 } as React.CSSProperties}><span>Colantări</span></span>{" "}
                            <span className="reveal-word" style={{ "--i": 1 } as React.CSSProperties}><span>auto</span></span>
                        </span>
                        <span className={styles.h1Sub}>
                            <span className="reveal-word" style={{ "--i": 2 } as React.CSSProperties}><span>și</span></span>{" "}
                            <span className="reveal-word" style={{ "--i": 3 } as React.CSSProperties}><span>inscripționări</span></span>{" "}
                            <em className="reveal-word" style={{ "--i": 4 } as React.CSSProperties}><span>publicitare</span></em>
                        </span>
                    </h1>
                    <p className={styles.heroLead}>
                        La <strong>B360</strong> transformăm ideile în vizibilitate: colantări auto, branding de flote,
                        vitrine și stickere, de la concept grafic la montaj.
                    </p>
                    <div className={styles.heroActions}>
                        <Link href="/calculator" className="btn-ghost"><Icon name="calculator" size={20} /> Calculează costul</Link>
                        <Link href="/portofoliu" className="btn-ghost"><Icon name="gallery" size={20} /> Vezi lucrările</Link>
                    </div>
                </div>
            </section>

            <section className={`section snap-slide ${styles.services}`} aria-labelledby="servicii" data-label="Servicii">
                <Blobs variant="soft" />
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
                                <span className="arrow-sticker" aria-hidden="true"><Icon name="arrow" size={20} /></span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>

            {/* clients and recent work share one screen */}
            <div className={`snap-slide ${styles.pair}`} data-label="Clienți și lucrări">
            <section className={`tinted ${styles.clients}`} aria-labelledby="clienti">
                <Image src="/img/wrap-salon.webp" alt="" fill sizes="100vw" className="tint-photo" />
                <Blobs variant="photo" />
                <div className="container">
                    <h2 id="clienti" className={styles.clientsTitle}>Clienții noștri fideli</h2>
                    <Carousel label="Clienți" className={styles.clientStrip}>
                        {clienti.map((c, i) => {
                            const style = { "--tilt": `${tilts[i % tilts.length]}deg` } as React.CSSProperties
                            const logo = <img src={`/clienti/${c.logo}.webp`} alt={c.name} width={300} height={139} loading="lazy" style={logoBox(c.logo)} />
                            return (
                                <li key={c.slug}>
                                    {c.match
                                        ? <Link href={`/portofoliu?client=${c.slug}`} className="client-sticker peel" style={style} title={`Lucrări pentru ${c.name}`}>{logo}</Link>
                                        : <span className="client-sticker peel" style={style} title={c.name}>{logo}</span>}
                                </li>
                            )
                        })}
                    </Carousel>
                </div>
            </section>

            <section className={styles.recent} aria-labelledby="lucrari">
                <div className="container">
                    <h2 id="lucrari" className={`section-title ${styles.recentTitle}`}>Cele mai recente lucrări</h2>
                    <Carousel label="Cele mai recente lucrări" className={styles.workStrip}>
                        {lucrariRecente.map(l => (
                            <li key={l.slug}>
                                <Link href={`/portofoliu?categorie=${l.cat}`} className={styles.work}>
                                    <Image src={l.photos[0].src} alt={l.photos[0].alt} width={640} height={480} sizes="(min-width: 768px) 360px, 78vw" />
                                    <span className={styles.workCaption}>
                                        <small>{l.catLabel}</small>
                                        <strong>{l.title}</strong>
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </Carousel>
                    <p className={styles.more}><Link href="/portofoliu" className="btn-ghost on-light">Vezi tot portofoliul</Link></p>
                </div>
            </section>
            </div>

            <div className="snap-slide snap-last snap-cta" data-label="Contact">
                <ContactCta />
            </div>
            <ScrollCue />
        </div>
    )
}
