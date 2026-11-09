import type { Metadata } from "next"
import { CalculatorTabs } from "@/components/CalculatorTabs"
import { TapetCalculator } from "@/components/TapetCalculator"
import form from "../form.module.css"
import styles from "../calculator/calculator.module.css"

export const metadata: Metadata = {
    title: "Calculator tapet printat și fototapet",
    description: "Scrie lățimea și înălțimea pereților și vezi pe loc câți metri pătrați de tapet printat îți trebuie. Încarcă imaginea ta și vezi dacă are rezoluție destulă pentru perete.",
    alternates: { canonical: "/calculator-tapet" },
}

export default function TapetCalculatorPage() {
    return (
        <section className={`${form.page} ${styles.page}`}>
            <div className={`container ${styles.inner}`}>
                <header className={styles.head}>
                    <CalculatorTabs active="/calculator-tapet" />
                    <h1 className={styles.title}>Cât tapet printat îți trebuie?</h1>
                    <p className={styles.lead}>Scrie dimensiunile pereților, încarcă imaginea dorită și vezi pe loc suprafața și cum arată imaginea pe pereții tăi.</p>
                </header>
                <TapetCalculator />
            </div>
        </section>
    )
}
