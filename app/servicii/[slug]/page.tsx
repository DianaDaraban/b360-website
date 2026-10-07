import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Fragment } from "react"
import { Blobs } from "@/components/Blobs"
import { CarCompare } from "@/components/CarCompare"
import { ContactCta } from "@/components/ContactCta"
import { Icon } from "@/components/Icon"
import { Rich } from "@/components/Rich"
import { getServiciu, servicii } from "@/data/servicii"
import { site } from "@/lib/site"
import styles from "./service.module.css"

const benefitsTitle: Record<string, string> = {
    "colantare-auto": "Beneficiile colantării auto",
    "autocolante-inscriptionari": "De ce stickere personalizate",
    "colantare-vitrine": "Beneficiile colantării vitrinelor",
    "folie-ppf": "Beneficiile foliei PPF",
}

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
    return servicii.map(s => ({ slug: s.slug }))
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
    const words = s.title.split(" ")

    return (
        <>
            <section className={`tinted ${styles.hero}`}>
                <Image src={s.hero} alt="" fill priority sizes="100vw" className="tint-photo" />
                <Blobs variant="photo" />
                <div className="container" style={{ "--n": words.length } as React.CSSProperties}>
                    <Link href="/servicii" className={styles.back}><span aria-hidden="true">←</span> Toate serviciile</Link>
                    <p className={styles.heroKicker}>Servicii B360</p>
                    <h1 aria-label={s.title}>
                        {words.map((w, i) => <Fragment key={i}><span aria-hidden="true" className={styles.word} style={{ "--i": i } as React.CSSProperties}>{w}</span>{" "}</Fragment>)}
                    </h1>
                    <p className={styles.heroTeaser}>{s.teaser}</p>
                    <Link href="/oferta" className={`btn ${styles.heroCta}`}>Cere o ofertă personalizată</Link>
                </div>
            </section>

            {/* intro beside the service photo */}
            <section className={`section ${styles.light}`}>
                <div className={`container ${styles.intro}`}>
                    <div className={styles.introText}>
                        <p className={styles.eyebrow}>Pe scurt</p>
                        <h2 className={styles.leadTitle}>{s.lead.title}</h2>
                        <p className="lead"><Rich text={s.lead.text} /></p>
                    </div>
                    <figure className={styles.introPhoto}>
                        <Image src={s.image} alt="" width={720} height={540} sizes="(min-width: 1024px) 500px, 92vw" />
                    </figure>
                </div>
            </section>

            <section className={`section ${styles.types}`}>
                <div className="narrow">
                    <h2 className={styles.checkTitle}>{s.typesTitle}</h2>
                    <p className={styles.typesText}>{s.typesText}</p>
                    {s.types.map(t => (
                        <div key={t.title} className={styles.type}>
                            {/* Figma: chevrons, the title, then a dotted line with an arrow running to the gallery sticker */}
                            <Link href={gallery} className={styles.typeHead}>
                                <span className={styles.chevrons} aria-hidden="true" />
                                <h3>{t.title}</h3>
                                <span className={styles.trail} aria-hidden="true" />
                                <span className={styles.trailLabel} aria-hidden="true">Vezi lucrările</span>
                                <span className={`${styles.galleryDot} peel`} aria-hidden="true"><Icon name="gallery" size={24} /></span>
                                <span className="sr-only">Vezi lucrările din galerie</span>
                            </Link>
                            <ul className="squares">
                                {t.items.map(i => <li key={i}>{i}</li>)}
                            </ul>
                        </div>
                    ))}
                    {s.comparison && <CarCompare />}
                </div>
            </section>

            <section className="section tinted">
                <Image src={s.benefitsPhoto} alt="" fill sizes="100vw" className="tint-photo" />
                <Blobs variant="photo" />
                <div className="container">
                    <p className={`${styles.eyebrow} ${styles.onPhoto}`}>Beneficii</p>
                    <h2 className={styles.center}>{benefitsTitle[s.slug] ?? "Beneficii"}</h2>
                    <ul className={styles.benefits}>
                        {s.benefits.map(b => {
                            // "Promovare mobilă 24/7 – brandul tău e vizibil…": the part before the dash is the tile title
                            const [title, rest] = b.split(/ – /)
                            return <li key={b}><strong>{title}</strong>{rest && <span>{rest}</span>}</li>
                        })}
                    </ul>
                </div>
            </section>

            {s.extra && (
                <section className="section">
                    <div className="container">
                        {/* highlighted banner: the question, the answer and the portfolio button */}
                        <div className={styles.banner}>
                            <div>
                                <p className={styles.question}>{s.extra.question}</p>
                                <h2>{s.extra.title}</h2>
                                <p><Rich text={s.extra.text} /></p>
                            </div>
                            <Link href={gallery} className="btn">{s.portfolio.label}</Link>
                        </div>
                    </div>
                </section>
            )}

            <section className={`section tinted ${styles.faq}`}>
                <Image src="/img/paper.webp" alt="" fill sizes="100vw" className="tint-photo" />
                <Blobs variant="photo" />
                <div className="narrow">
                    <h2 className={styles.center}>Întrebări frecvente (FAQ)</h2>
                    <div className={styles.faqList}>
                        {s.faq.map(f => (
                            <details key={f.q} className={styles.faqItem}>
                                <summary>{f.q}</summary>
                                <p>{f.a}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            <ContactCta />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        </>
    )
}
