import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Blobs } from "@/components/Blobs"
import { CarCompare } from "@/components/CarCompare"
import { ContactCta } from "@/components/ContactCta"
import { Icon } from "@/components/Icon"
import { Rich } from "@/components/Rich"
import { RevealTitle } from "@/components/RevealTitle"
import { ScrollCue } from "@/components/ScrollCue"
import { Specializate } from "@/components/Specializate"
import { getProjects } from "@/lib/projects"
import { getServiciu, toateServiciile, vehicule } from "@/data/servicii"
import { site } from "@/lib/site"
import styles from "./service.module.css"

const benefitsTitle: Record<string, string> = {
    "colantare-auto": "Beneficiile colantării auto",
    "autocolante-inscriptionari": "De ce stickere personalizate",
    "colantare-vitrine": "Beneficiile colantării vitrinelor",
    "folie-ppf": "Beneficiile foliei PPF",
    "tapet-printat": "De ce tapet printat",
    "colantare-moto": "De ce colantare moto",
    "colantare-camioane": "De ce să colantezi camioanele",
    "colantare-autocare": "De ce să colantezi autocarele",
    "colantare-autoutilitare": "De ce să inscripționezi flota",
    "colantare-barci-avioane": "De ce folii, nu vopsea",
}

// rebuilt when something is saved in the admin, and at least once an hour
export const revalidate = 3600

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
    return toateServiciile.map(s => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const s = getServiciu((await params).slug)
    if (!s) return {}
    return {
        title: s.title.replace(/ – .*/, ""),
        description: s.metaDescription,
        alternates: { canonical: `/servicii/${s.slug}` },
        openGraph: { images: [s.hero] },
    }
}

export default async function ServiciuPage({ params }: Props) {
    const s = getServiciu((await params).slug)
    if (!s) notFound()

    // Service + FAQ structured data, so Google can show the questions under the result
    const jsonLd = [
        {
            "@context": "https://schema.org",
            "@type": "Service",
            name: s.title,
            description: s.metaDescription,
            provider: { "@id": `${site.url}/#business` },
            areaServed: "RO",
        },
        {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: s.faq.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        },
    ]
    const gallery = `/portofoliu?categorie=${s.portfolio.category}`
    const proiecte = s.showcase ? await getProjects() : []
    const showcase = !s.showcase ? [] : s.showcase.projects ? proiecte.filter(p => s.showcase!.projects!.includes(p.slug)) : proiecte.filter(p => p.cat === s.portfolio.category)
    // one card per project; a single project shows its photos (up to five) instead
    const specializat = vehicule.some(v => v.slug === s.slug)
    // a grid of at most seven cards; the rest is one click away in the gallery
    const cards = (showcase.length === 1
        ? showcase[0].photos.slice(0, 5).map((f, k) => ({ key: f.src, photo: f, title: k ? null : showcase[0].title, count: k ? 0 : showcase[0].photos.length }))
        // a loose photo with no client is named after the page ("Colantare moto"), not "Inscripționare"
        : showcase.map(p => ({ key: p.slug, photo: p.photos[0], title: p.slug.startsWith("/") ? s.short : p.title, count: p.photos.length }))).slice(0, 7)

    return (
        <div className="snap-page">
            <section className={`tinted snap-slide hero-sheen ${styles.hero}`} data-label="Început">
                <Image src={s.hero} alt="" fill priority sizes="100vw" className="tint-photo" />
                <Blobs variant="photo" />
                <div className="container" style={{ "--n": s.title.split(" ").length } as React.CSSProperties}>
                    <Link href="/servicii" className={styles.back}><span aria-hidden="true">←</span> Toate serviciile</Link>
                    <p className={`eyebrow ${styles.heroKicker}`}>{specializat ? "Colantări specializate B360" : "Servicii B360"}</p>
                    <RevealTitle text={s.title} delay={0.2} />
                    <p className={styles.heroTeaser}>{s.teaser}</p>
                    <Link href="/oferta" className={`btn ${styles.heroCta}`}>Cere o ofertă personalizată</Link>
                </div>
            </section>

            {/* overview: the intro on the left, the kinds of work as cards on the right */}
            <section className={`section snap-slide ${styles.overview}`} data-label="Pe scurt">
                <div className={`container ${styles.overviewGrid}`}>
                    <div className={styles.introText}>
                        <p className="eyebrow">Pe scurt</p>
                        <h2 className={styles.leadTitle}>{s.lead.title}</h2>
                        <p className={styles.leadText}><Rich text={s.lead.text} /></p>
                        <h3 className={styles.checkTitle}>{s.typesTitle}</h3>
                        <p className={styles.typesText}>{s.typesText}</p>
                    </div>
                    <div className={styles.typeGrid}>
                        {s.types.map(t => (
                            <div key={t.title} className={styles.type}>
                                {/* Figma: chevrons, the title, then a dotted line with an arrow running to the gallery sticker */}
                                <Link href={gallery} className={styles.typeHead}>
                                    <span className={styles.chevrons} aria-hidden="true" />
                                    <h3>{t.title}</h3>
                                    <span className={styles.trail} aria-hidden="true" />
                                    <span className={styles.trailLabel} aria-hidden="true">Vezi lucrările</span>
                                    <span className={`${styles.galleryDot} peel`} aria-hidden="true"><Icon name="gallery" size={22} /></span>
                                    <span className="sr-only">Vezi lucrările din galerie</span>
                                </Link>
                                <ul className="squares">
                                    {t.items.map(i => <li key={i}>{i}</li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* the service's own projects, each a card into the gallery */}
            {showcase.length > 0 && (
                <section className={`section snap-slide ${styles.showcase}`} data-label="Lucrări">
                    <div className="container">
                        <p className={`eyebrow ${styles.showcaseKicker}`}>{s.showcase?.kicker}</p>
                        <h2 className={styles.center}>Lucrări realizate</h2>
                        <ul className={styles.showcaseGrid}>
                            {cards.map((c, i) => (
                                <li key={c.key} className={i === 0 ? styles.showcaseFirst : undefined}>
                                    <Link href={gallery} className={styles.showcaseCard}>
                                        <Image src={c.photo.src} alt={c.photo.alt} width={c.photo.w} height={c.photo.h} sizes={i === 0 ? "(min-width: 1024px) 600px, 100vw" : "(min-width: 1024px) 300px, 50vw"} />
                                        {c.title && (
                                            <span className={styles.showcaseCaption}>
                                                <strong>{c.title}</strong>
                                                <small>{c.count} {c.count === 1 ? "fotografie" : "fotografii"}</small>
                                            </span>
                                        )}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <p className={styles.showcaseMore}><Link href={gallery} className="btn-ghost on-light">{s.portfolio.label}</Link></p>
                    </div>
                </section>
            )}

            {/* the integral / partial slider gets a screen of its own */}
            {s.comparison && (
                <section className={`section snap-slide ${styles.types}`} data-label="Integral sau parțial">
                    <div className="narrow">
                        <h2 className={styles.center}>Integral sau parțial?</h2>
                        <p className={styles.compareHint}>Trage de linie ca să compari cele două variante pe aceeași mașină.</p>
                        <CarCompare />
                    </div>
                </section>
            )}

            {/* benefits and FAQ side by side on one photo screen; the fleet / PPF note as a strip under them */}
            <section className={`section tinted snap-slide ${styles.details}`} data-label="Beneficii și întrebări">
                <Image src={s.benefitsPhoto} alt="" fill sizes="100vw" className="tint-photo" />
                <Blobs variant="photo" />
                <div className="container">
                    <div className={styles.detailsGrid}>
                        <div>
                            <p className="eyebrow">Beneficii</p>
                            <h2 className={styles.detailsTitle}>{benefitsTitle[s.slug] ?? "Beneficii"}</h2>
                            <ul className={styles.benefits}>
                                {s.benefits.map(b => {
                                    // "Promovare mobilă 24/7 – brandul tău e vizibil…": the part before the dash is the title
                                    const [title, rest] = b.split(/ – /)
                                    return <li key={b}><strong>{title}</strong>{rest && <span>{rest}</span>}</li>
                                })}
                            </ul>
                        </div>
                        <div>
                            <p className="eyebrow">Întrebări frecvente</p>
                            <h2 className={styles.detailsTitle}>Ce ne întreabă clienții</h2>
                            <div className={styles.faqList}>
                                {s.faq.map(f => (
                                    <details key={f.q} className={styles.faqItem}>
                                        <summary>{f.q}</summary>
                                        <p>{f.a}</p>
                                    </details>
                                ))}
                            </div>
                        </div>
                    </div>
                    {s.extra && (
                        <div className={styles.banner}>
                            <div>
                                <p className={styles.question}>{s.extra.question}</p>
                                <h2>{s.extra.title}</h2>
                                <p><Rich text={s.extra.text} /></p>
                            </div>
                            <Link href={s.extra.link?.href ?? gallery} className="btn-ghost">{s.extra.link?.label ?? s.portfolio.label}</Link>
                        </div>
                    )}
                </div>
            </section>

            {/* the specialised pages, grouped: on the car wrap page and on each of them */}
            {(specializat || s.slug === "colantare-auto") && (
                // not a full screen of its own: a short strip before the contact screen
                <section className={`section ${styles.special}`}>
                    <div className="container">
                        <Specializate current={s.slug} title={specializat ? "Mai colantăm" : "Colantări specializate"} />
                    </div>
                </section>
            )}

            <div className="snap-slide snap-last snap-cta" data-label="Contact">
                <ContactCta />
            </div>
            <ScrollCue />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        </div>
    )
}
