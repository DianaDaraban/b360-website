import type { Metadata } from "next"
import { CalculatorTabs } from "@/components/CalculatorTabs"
import { TapetCalculator } from "@/components/TapetCalculator"
import form from "../form.module.css"
import styles from "../calculator/calculator.module.css"

export const metadata: Metadata = {
    title: "Calculator preț tapet printat și fototapet",
    description: "Scrie dimensiunile pereților și vezi pe loc prețul tapetului printat: 220 lei/mp + TVA, cu print și montaj. Alege din peste 200 de modele sau încarcă imaginea ta.",
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
