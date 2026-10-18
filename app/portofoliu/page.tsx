import type { Metadata } from "next"
import { Suspense } from "react"
import { ContactCta } from "@/components/ContactCta"
import { Gallery } from "@/components/Gallery"
import Image from "next/image"
import gallery from "@/components/Gallery.module.css"
import { categorii, toateFotografiile } from "@/data/lucrari"
import { getProjects } from "@/lib/projects"
import { clienti } from "@/data/clienti"
import styles from "../content.module.css"

export const metadata: Metadata = {
    title: "Portofoliu – lucrări de colantare auto, flote și vitrine",
    description: `Peste ${Math.floor(toateFotografiile.length / 10) * 10} de lucrări B360: autoturisme, autoutilitare, autocare, camioane, vitrine, tapet printat și stickere, pentru Țiriac Auto, City Grill, Castrol, Ravitex și alții.`,
    alternates: { canonical: "/portofoliu" },
}

// rebuilt when something is saved in the admin, and at least once an hour
export const revalidate = 3600

export default async function PortofoliuPage() {
    const proiecte = await getProjects()
    return (
        <>
            <section className={`section ${styles.compact}`}>
                <div className="container">
                    <h1 className={styles.pageTitle}>Portofoliu</h1>
                    <p className={styles.center}>Proiectele noastre din ultimii ani, de la o singură mașină la flote întregi. Deschide un proiect ca să vezi toate fotografiile, sau alege o categorie ori un client.</p>
                    {/* The filter reads ?categorie= on the client; the static HTML (what Google sees) holds the first photos */}
                    <Suspense fallback={<StaticGrid proiecte={proiecte} />}>
                        <Gallery items={proiecte} categories={categorii} clients={clienti.filter(c => c.match).map(({ slug, name, logo }) => ({ slug, name, logo }))} />
                    </Suspense>
                </div>
            </section>
            <ContactCta />
        </>
    )
}

function StaticGrid({ proiecte }: { proiecte: Awaited<ReturnType<typeof getProjects>> }) {
    return (
        <ul className={gallery.grid} style={{ marginTop: 28 }}>
            {proiecte.slice(0, 24).map(({ slug, photos: [item] }) => (
                <li key={slug}>
                    <Image src={item.src} alt={item.alt} width={400} height={400} sizes="(min-width: 1024px) 290px, (min-width: 640px) 31vw, 47vw" />
                </li>
            ))}
        </ul>
    )
}
