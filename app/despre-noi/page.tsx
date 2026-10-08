import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Blobs } from "@/components/Blobs"
import { ContactCta } from "@/components/ContactCta"
import { CountUp } from "@/components/CountUp"
import { Icon } from "@/components/Icon"
import { RevealTitle } from "@/components/RevealTitle"
import { ScrollCue } from "@/components/ScrollCue"
import styles from "./about.module.css"

export const metadata: Metadata = {
    title: "Despre noi – colantări și producție publicitară din 2012",
    description:
        "B360 oferă din 2012 colantări auto, branding de flote, inscripționări vitrine și printuri publicitare. Echipă de design, producție și montaj în Corbeanca, Ilfov.",
    alternates: { canonical: "/despre-noi" },
}

// The page reads in short blocks: numbers, the story in two sentences, the three steps of
// the work, the offer, the reasons to choose B360 and the mission as one line.
const cifre = [
    { value: <CountUp from={1990} to={2012} />, label: "anul în care am început" },
    { value: <CountUp to={10} suffix="+" />, label: "ani de experiență" },
    { value: "3 în 1", label: "design, producție și montaj" },
]

const pasi = [
    { title: "Concept grafic", text: "Pornim de la brandul tău și propunem grafica potrivită pentru suport." },
    { title: "Producție", text: "Printăm și decupăm pe materiale premium, cu echipamente moderne." },
    { title: "Montaj", text: "Aplicăm atent și verificăm fiecare detaliu înainte de predare." },
]

const oferim = [
    { icon: "car", title: "Colantări auto și flote", text: "Branding mobil, vizibil în trafic.", href: "/servicii/colantare-auto" },
    { icon: "store", title: "Vitrine și geamuri", text: "Pentru magazine, showroom-uri și birouri.", href: "/servicii/colantare-vitrine" },
    { icon: "printer", title: "Print indoor și outdoor", text: "Bannere, mesh-uri, postere, de orice dimensiune.", href: "/servicii" },
] as const

const deCe = [
    { title: "10+ ani", text: "de experiență în domeniu" },
    { title: "Clienți fideli", text: "branduri locale și naționale, de ani buni" },
    { title: "Personalizat", text: "o soluție gândită pentru fiecare client" },
    { title: "Durabil", text: "montaj profesionist, rezultate care rezistă" },
    { title: "Totul într-un loc", text: "de la idee la montaj, fără intermediari" },
]

export default function DesprePage() {
    return (
        <div className="snap-page">
            <section className={`tinted snap-slide hero-sheen ${styles.hero}`} data-label="Început">
                <Image src="/img/wrap-green.webp" alt="" fill priority sizes="100vw" className="tint-photo" />
                <Blobs variant="photo" />
                <div className="container">
                    <p className={styles.kicker}>Despre noi</p>
                    <RevealTitle className={styles.title} text="La B360 transformăm ideile în vizibilitate." red={["B360"]} delay={0.15} />
                    <p className={styles.lead}>Colantări auto, branding de flote, vitrine și print publicitar, de la concept grafic la montaj.</p>
                    <ul className={styles.stats}>
                        {cifre.map(c => (
                            <li key={c.label}><strong>{c.value}</strong><span>{c.label}</span></li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* story and the three steps share one screen */}
            <div className={`snap-slide ${styles.pair}`} data-label="Povestea">
            <section className="section">
                <div className={`container ${styles.story}`}>
                    <div className={styles.storyText}>
                        <p className={styles.eyebrow}>Povestea pe scurt</p>
                        <h2 className={styles.h2}>Peste <span className="red">10 ani</span> alături de clienți care ne-au rămas fideli</h2>
                        <p>Am pornit în 2012 cu colantări auto și am crescut odată cu clienții noștri. Faptul că revin an de an e cea mai bună dovadă de seriozitate.</p>
                        <p>Echipa noastră acoperă <strong>design grafic, producție și montaj</strong>, așa că tot proiectul rămâne într-o singură mână.</p>
                    </div>
                    <figure className={styles.storyPhoto}>
                        <Image src="/img/wrap-hands.webp" alt="Montaj folie pe caroseria unei mașini" width={720} height={540} sizes="(min-width: 1024px) 520px, 92vw" />
                        <span className={`${styles.badge} peel`}>din<br /><strong>2012</strong></span>
                    </figure>
                </div>
            </section>

            <section className={`section ${styles.band}`}>
                <div className="container">
                    <p className={styles.eyebrow}>Cum lucrăm</p>
                    <h2 className={styles.h2}>Trei pași, o singură echipă</h2>
                    <ol className={styles.steps}>
                        {pasi.map((p, i) => (
                            <li key={p.title}>
                                <span className={styles.stepNo}>0{i + 1}</span>
                                <h3>{p.title}</h3>
                                <p>{p.text}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>
            </div>

            {/* what we offer and why B360, on one screen */}
            <div className={`snap-slide ${styles.pair}`} data-label="Ce oferim">
            <section className="section tinted" style={{ "--tint": "rgb(80 72 76 / 0.8)" } as React.CSSProperties}>
                <Image src="/img/wrap-hands.webp" alt="" fill sizes="100vw" className="tint-photo" />
                <Blobs variant="photo" />
                <div className="container">
                    <p className={`${styles.eyebrow} ${styles.onPhoto}`}>Ce oferim</p>
                    <h2 className={styles.h2}>Producție publicitară completă</h2>
                    <ul className={styles.offers}>
                        {oferim.map(o => (
                            <li key={o.title}>
                                <Link href={o.href} className={styles.offer}>
                                    <span className={`${styles.offerIcon} peel`} aria-hidden="true"><Icon name={o.icon} size={30} /></span>
                                    <h3>{o.title}</h3>
                                    <p>{o.text}</p>
                                    <span className="arrow-sticker" aria-hidden="true"><Icon name="arrow" size={18} /></span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            <section className="section">
                <div className="container">
                    <p className={styles.eyebrow}>De ce B360</p>
                    <h2 className={styles.h2}>Cinci motive să lucrăm împreună</h2>
                    <ul className={styles.reasons}>
                        {deCe.map(r => (
                            <li key={r.title}>
                                <strong>{r.title}</strong>
                                <span>{r.text}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
            </div>

            {/* the mission line closes the page together with the contact block and the footer */}
            <div className="snap-slide snap-last" data-label="Misiunea">
            <section className={`tinted ${styles.mission}`}>
                <Image src="/img/letters-3d.webp" alt="" fill sizes="100vw" className="tint-photo" />
                <Blobs variant="photo" />
                <div className="narrow">
                    <p className={`${styles.eyebrow} ${styles.onPhoto}`}>Misiunea noastră</p>
                    <blockquote className={styles.quote}>Fiecare brand merită să fie vizibil și memorabil.</blockquote>
                    <p className={styles.quoteText}>Nu livrăm doar materiale publicitare, ci soluții care atrag atenția, cresc încrederea și ajută afacerea să crească.</p>
                </div>
            </section>

            <ContactCta />
            </div>
            <ScrollCue />
        </div>
    )
}
