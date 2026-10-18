import type { Metadata } from "next"
import Image from "next/image"
import { Blobs } from "@/components/Blobs"
import { Calculator } from "@/components/Calculator"
import { eurRate, getPricing } from "@/lib/pricing-store"
import form from "../form.module.css"
import styles from "./calculator.module.css"

export const metadata: Metadata = {
    title: "Calculator cost colantare auto",
    description: "Alege mașina și piesele, spune-ne cât timp ții folia și ce fel de lucrare vrei: calculatorul alege materialul și îți arată pe loc o estimare orientativă.",
    alternates: { canonical: "/calculator" },
}

// rebuilt every hour (it then reads the price workbook again) and when prices change in the admin
export const revalidate = 3600

export default async function CalculatorPage() {
    const pricing = await getPricing()
    const { rate } = await eurRate(pricing)
    return (
        <section className={`tinted ${form.page} ${styles.page}`}>
            <Image src="/img/letters.webp" alt="" fill priority sizes="100vw" className="tint-photo" />
            <Blobs variant="photo" />
            <div className={`container ${styles.inner}`}>
                <header className={styles.head}>
                    <p className="eyebrow">Calculator</p>
                    <h1 className={styles.title}>Cât costă colantarea mașinii tale?</h1>
                    <p className={styles.lead}>Alege mașina, apasă pe piesele dorite și răspunde la trei întrebări simple. Noi alegem materialul potrivit și îți arătăm estimarea pe loc.</p>
                </header>
                <Calculator pricing={pricing} rate={rate} />
            </div>
        </section>
    )
}
