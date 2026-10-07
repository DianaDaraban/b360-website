import type { Metadata } from "next"
import Image from "next/image"
import { Blobs } from "@/components/Blobs"
import styles from "../form.module.css"

export const metadata: Metadata = {
    title: "Calcul estimativ colantare",
    description: "Alege tipul de lucrare, vehiculul, folia și zonele dorite și primești o estimare orientativă pentru colantarea mașinii tale.",
    alternates: { canonical: "/calculator" },
}

// Options from the Figma calculator screen. Prices and the live estimate come in phase 4,
// once B360 confirms the price list.
const servicii = ["Colantare auto integrală", "Colantare auto parțială", "Folie PPF", "Inscripționare / stickere"]
const vehicule = ["Autoturism", "SUV", "Autoutilitară", "Camion", "Autocar", "Motocicletă"]
const folii = ["Standard (polimerică ORAFOL)", "Premium (turnată)", "Folie PPF transparentă"]
const zone = ["Capotă", "Plafon", "Portbagaj", "Uși laterale", "Aripi", "Bară față", "Bară spate", "Oglinzi", "Geamuri"]

export default function CalculatorPage() {
    return (
        <div className={`tinted ${styles.page}`}>
            <Image src="/img/letters.webp" alt="" fill priority sizes="100vw" className="tint-photo" />
            <Blobs variant="photo" />

            <section className={`narrow ${styles.intro}`}>
                <h1>Calculează rapid costul colantării sau inscripționării tale</h1>
                <p>Selectează tipul de lucrare, alege zonele dorite și primești instant o estimare orientativă de preț.</p>
            </section>

            <form className={`${styles.form} ${styles.calcForm}`}>
                <fieldset className={styles.group}>
                    <legend><span>Lucrarea</span></legend>
                    <div className={styles.inner}>
                        <label className={styles.field}>Alege tipul de serviciu<select name="serviciu">{servicii.map(s => <option key={s}>{s}</option>)}</select></label>
                        <label className={styles.field}>Alege tipul de autovehicul<select name="vehicul">{vehicule.map(s => <option key={s}>{s}</option>)}</select></label>
                        <label className={styles.field}>Alege tipul de folie<select name="folie">{folii.map(s => <option key={s}>{s}</option>)}</select></label>
                        <p className={styles.question}>Servicii suplimentare</p>
                        <div className={styles.choices}>
                            <label className={styles.choice}><input type="checkbox" name="extra" value="design" defaultChecked />Design grafic personalizat</label>
                            <label className={styles.choice}><input type="checkbox" name="extra" value="demontare" />Demontare colant vechi</label>
                        </div>
                    </div>
                </fieldset>

                <fieldset className={styles.group}>
                    <legend><span>Selectează elementele</span></legend>
                    <div className={styles.inner}>
                        <div className={styles.zones}>
                            {zone.map(z => <label key={z} className={styles.zone}><input type="checkbox" name="zone" value={z} />{z}</label>)}
                        </div>
                        <label className={styles.field}>Specifică dimensiunea / suprafața (opțional)<input name="suprafata" placeholder="ex. 2 m² sau 120 × 80 cm" /></label>
                        <div className={styles.estimate} aria-live="polite">
                            Estimare orientativă
                            <strong>în curând</strong>
                        </div>
                    </div>
                </fieldset>

                <div className={styles.submit}>
                    <button type="submit" className="btn">Trimite cererea de ofertă</button>
                    <p className={styles.note}>Estimarea e orientativă. Prețul final îl confirmăm după ce vedem vehiculul și grafica.</p>
                </div>
            </form>
        </div>
    )
}
