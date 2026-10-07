import type { Metadata } from "next"
import Image from "next/image"
import styles from "./test.module.css"

// Temporary comparison page for choosing the sticker button; not linked, not indexed
export const metadata: Metadata = { title: "Test butoane", robots: { index: false, follow: false } }

const variante = [
    { cls: "", name: "1 · Se ridică", note: "colțul crește și se ridică în 3D (sticker_button1)" },
    { cls: styles.peelOff, name: "2 · Se dezlipește", note: "colțul se desprinde și dispare (sticker_button)" },
    { cls: styles.still, name: "3 · Fix", note: "colțul stă pe loc, doar culoarea se schimbă (sticker_button2)" },
]

export default function TestButoane() {
    return (
        <>
            <link rel="stylesheet" href="/test/sticker-original.css" />
            <section className="section">
                <div className="container">
                    <h1 className={styles.title}>Test butoane sticker</h1>

                    <h2 className={styles.rowTitle}>Originalele tale (D:\IT\button_test)</h2>
                    <div className={styles.row}>
                        <button className="sticker_button1">Vezi portofoliu de lucrari</button>
                        <button className="sticker_button">Vezi portofoliu de lucrari</button>
                        <button className="sticker_button2">Vezi portofoliu de lucrari</button>
                    </div>

                    <h2 className={styles.rowTitle}>Refăcute: aceeași geometrie la orice lățime</h2>
                    {variante.map(v => (
                        <div key={v.name} className={styles.variant}>
                            <p><strong>{v.name}</strong> – {v.note}</p>
                            <div className={styles.row}>
                                <button className={`btn ${v.cls}`}>Cere ofertă</button>
                                <button className={`btn ${v.cls}`}>Vezi portofoliu de lucrări</button>
                                <button className={`btn ${v.cls}`}>Vezi portofoliu stickere și inscripționări</button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className={`section tinted ${styles.photo}`}>
                <Image src="/img/hero-graffiti.webp" alt="" fill sizes="100vw" className="tint-photo" />
                <div className="container">
                    <h2 className={styles.rowTitle}>Pe fundal foto (ca în hero)</h2>
                    {variante.map(v => (
                        <div key={v.name} className={styles.row}>
                            <button className={`btn ${v.cls}`}>Cere ofertă</button>
                            <span className={styles.label}>{v.name}</span>
                        </div>
                    ))}
                </div>
            </section>
        </>
    )
}
