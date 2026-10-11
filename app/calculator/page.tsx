import type { Metadata } from "next"
import Image from "next/image"
import { Blobs } from "@/components/Blobs"
import { Calculator } from "@/components/Calculator"
import form from "../form.module.css"
import styles from "./calculator.module.css"

export const metadata: Metadata = {
    title: "Calculator cost colantare auto",
    description: "Alege mașina, apasă pe piesele pe care vrei să le colantezi sau să le inscripționezi și vezi pe loc o estimare orientativă a costului.",
    alternates: { canonical: "/calculator" },
}

export default function CalculatorPage() {
    return (
        <section className={`tinted ${form.page} ${styles.page}`}>
            <Image src="/img/letters.webp" alt="" fill priority sizes="100vw" className="tint-photo" />
            <Blobs variant="photo" />
            <div className={`container ${styles.inner}`}>
                <header className={styles.head}>
                    <p className="eyebrow">Calculator</p>
                    <h1 className={styles.title}>Cât costă colantarea mașinii tale?</h1>
                    <p className={styles.lead}>Alege mașina, apasă pe piesele dorite și vezi estimarea pe loc. Poți combina colantarea, inscripționarea și logo-urile pe aceeași mașină.</p>
                </header>
                <Calculator />
            </div>
        </section>
    )
}
