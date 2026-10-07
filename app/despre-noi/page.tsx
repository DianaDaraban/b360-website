import type { Metadata } from "next"
import Image from "next/image"
import { Icon } from "@/components/Icon"
import { ContactCta } from "@/components/ContactCta"
import styles from "../content.module.css"

export const metadata: Metadata = {
    title: "Despre noi – colantări și producție publicitară din 2012",
    description:
        "B360 oferă din 2012 colantări auto, branding de flote, inscripționări vitrine și printuri publicitare. Echipă de design, producție și montaj în Corbeanca, Ilfov.",
    alternates: { canonical: "/despre-noi" },
}

const oferim = [
    { title: "Colantări auto și flote", text: "Soluția ideală pentru companii care doresc un branding mobil și vizibil în trafic." },
    { title: "Inscripționări vitrine și geamuri", text: "Perfecte pentru magazine, showroom-uri și spații de birouri." },
    { title: "Printuri publicitare indoor și outdoor", text: "Bannere, mesh-uri, postere și alte materiale de mari sau mici dimensiuni." },
]

const deCe = [
    "Experiență de peste 10 ani în domeniu",
    "Colaborări stabile și de lungă durată cu branduri locale și naționale",
    "Soluții personalizate pentru fiecare client",
    "Montaj profesionist și rezultate durabile",
    "Servicii complete de producție publicitară, toate într-un singur loc",
]

export default function DesprePage() {
    return (
        <>
            <section className="section tinted">
                <Image src="/img/wrap-green.webp" alt="" fill priority sizes="100vw" className="tint-photo" />
                <div className={`narrow ${styles.block}`}>
                    <h1 className={styles.pageTitle}>La <span className="red">B360</span> transformăm ideile în vizibilitate.</h1>
                    <div className="prose">
                        <p>
                            Din 2012 oferim servicii complete de <strong>colantări</strong> și <strong>inscripționări auto</strong>, ajutând
                            companiile să își consolideze brandul prin soluții creative și durabile.
                        </p>
                        <p>
                            Suntem partenerul de încredere pentru firme care vor să fie remarcate în piață, fie prin <strong>colantări auto</strong> și{" "}
                            <strong>branding de flote</strong>, fie prin <strong>inscripționări vitrine, litere volumetrice</strong> sau{" "}
                            <strong>printuri publicitare indoor și outdoor</strong>.
                        </p>
                    </div>

                    <h2 className={styles.subTitle}>Peste <span className="red">10 ani</span> de experiență în colantări și producție publicitară</h2>
                    <div className="prose">
                        <p>
                            De la primul proiect realizat în 2012 și până astăzi, am crescut alături de clienți care ne-au rămas fideli peste ani.
                            Acest lucru ne confirmă profesionalismul și seriozitatea cu care tratăm fiecare lucrare.
                        </p>
                        <p>
                            Echipa noastră este formată din specialiști în <strong>design grafic, producție și montaj</strong>, cu experiență dovedită
                            în <strong>publicitate vizuală</strong>. Folosim materiale de calitate premium și echipamente moderne pentru a asigura
                            rezultate durabile și estetice.
                        </p>
                    </div>
                </div>
            </section>

            <section className="section tinted" style={{ "--tint": "rgb(80 72 76 / 0.8)" } as React.CSSProperties}>
                <Image src="/img/wrap-hands.webp" alt="" fill sizes="100vw" className="tint-photo" />
                <div className={`narrow ${styles.block}`}>
                    <p className="lead">
                        La <strong className="red">B360</strong> ne ocupăm de tot procesul – de la <strong>concept grafic</strong>, la{" "}
                        <strong>execuție</strong> și <strong>montaj</strong>.
                    </p>
                    <p>Oferim:</p>
                    <ul className={styles.offerList}>
                        {oferim.map(o => (
                            <li key={o.title}>
                                <h3 className={`${styles.offerTitle}`}>{o.title}</h3>
                                <p>{o.text}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            <section className={`section ${styles.white}`}>
                <div className={`narrow ${styles.block}`}>
                    <h2 className={styles.subTitle}>De ce să alegi <span className="red">B360</span>?</h2>
                    <ul className="checklist">
                        {deCe.map(item => <li key={item}><Icon name="check" size={30} /><span>{item}</span></li>)}
                    </ul>
                </div>
            </section>

            <section className="section tinted">
                <Image src="/img/letters-3d.webp" alt="" fill sizes="100vw" className="tint-photo" />
                <div className={`narrow ${styles.block} ${styles.center}`}>
                    <h2 className={styles.subTitle}>Misiunea noastră</h2>
                    <p>
                        Credem că fiecare brand merită să fie vizibil și memorabil. Misiunea noastră este să oferim clienților nu doar materiale
                        publicitare, ci <strong>soluții care atrag atenția, cresc încrederea și susțin dezvoltarea afacerii.</strong>
                    </p>
                    <p>Pentru noi, fiecare proiect reprezintă o oportunitate de a crea <strong>o nouă poveste de succes.</strong></p>
                </div>
            </section>

            <ContactCta />
        </>
    )
}
