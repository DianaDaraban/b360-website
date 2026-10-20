import type { Metadata } from "next"
import { Calculator } from "@/components/Calculator"
import { getPricing } from "@/lib/pricing-store"
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
    return (
        <section className={`${form.page} ${styles.page}`}>
            <div className={`container ${styles.inner}`}>
                <header className={styles.head}>
                    <p className="eyebrow">Calculator</p>
                    <h1 className={styles.title}>Cât costă colantarea mașinii tale?</h1>
                    <p className={styles.lead}>Șapte pași simpli: alegi mașina, apeși pe piese și răspunzi la trei întrebări. Noi alegem materialul potrivit și îți arătăm estimarea pe loc.</p>
                </header>
                <Calculator pricing={pricing} />
            </div>
        </section>
    )
}
