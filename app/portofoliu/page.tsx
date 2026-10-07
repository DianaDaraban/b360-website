import type { Metadata } from "next"
import { Suspense } from "react"
import { ContactCta } from "@/components/ContactCta"
import { Gallery } from "@/components/Gallery"
import Image from "next/image"
import gallery from "@/components/Gallery.module.css"
import { categorii, toateLucrarile } from "@/data/lucrari"
import styles from "../content.module.css"

export const metadata: Metadata = {
    title: "Portofoliu – lucrări de colantare auto, flote și vitrine",
    description: `Peste ${Math.floor(toateLucrarile.length / 10) * 10} de lucrări B360: autoturisme, autoutilitare, autocare, camioane, vitrine și stickere, pentru Țiriac Auto, City Grill, Castrol, Ravitex și alții.`,
    alternates: { canonical: "/portofoliu" },
}

export default function PortofoliuPage() {
    return (
        <>
            <section className={`section ${styles.white}`}>
                <div className="container">
                    <h1 className={styles.pageTitle}>Portofoliu</h1>
                    <p className={styles.center}>Câteva dintre lucrările noastre din ultimii ani. Alege o categorie ca să vezi doar ce te interesează.</p>
                    {/* The filter reads ?categorie= on the client; the static HTML (what Google sees) holds the first photos */}
                    <Suspense fallback={<StaticGrid />}>
                        <Gallery items={toateLucrarile} categories={categorii} />
                    </Suspense>
                </div>
            </section>
            <ContactCta />
        </>
    )
}

function StaticGrid() {
    return (
        <ul className={gallery.grid} style={{ marginTop: 28 }}>
            {toateLucrarile.slice(0, 24).map(item => (
                <li key={item.src}>
                    <Image src={item.src} alt={item.alt} width={400} height={400} sizes="(min-width: 1024px) 290px, (min-width: 640px) 31vw, 47vw" />
                </li>
            ))}
        </ul>
    )
}
