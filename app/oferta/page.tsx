import type { Metadata } from "next"
import Image from "next/image"
import styles from "../form.module.css"

export const metadata: Metadata = {
    title: "Cerere ofertă colantare",
    description: "Completează formularul și îți trimitem rapid o ofertă personalizată pentru colantarea auto, branding de flotă sau vitrine.",
    alternates: { canonical: "/oferta" },
}

const tipColantare = ["Integrală", "Parțială", "Sticker / elemente personalizate"]
const tipVehicul = ["Autoturism", "Autoutilitară", "Camion / Flotă"]

// Fields and texts from the Figma "Cerere ofertă" screen. Sending is wired in phase 4.
export default function OfertaPage() {
    return (
        <>
            <section className={`tinted ${styles.intro}`}>
                <Image src="/img/colorful-convertible.webp" alt="" fill priority sizes="100vw" className="tint-photo" />
                <div className="narrow">
                    <h1>Cerere ofertă colantare</h1>
                    <p className="lead">Completează formularul de mai jos și îți vom trimite rapid o ofertă personalizată pentru proiectul tău de colantare auto.</p>
                </div>
            </section>

            <form className={styles.form}>
                <fieldset className={styles.group}>
                    <div className={styles.inner}>
                        <legend>Datele de contact</legend>
                        <label className={styles.field}>Nume și prenume *<input name="nume" autoComplete="name" required /></label>
                        <label className={styles.field}>Companie<input name="companie" autoComplete="organization" /></label>
                        <label className={styles.field}>
                            Telefon *
                            <span className={styles.phoneRow}><span>+40</span><input name="telefon" type="tel" autoComplete="tel-national" inputMode="tel" placeholder="722 12 34 56" required /></span>
                        </label>
                        <label className={styles.field}>Email *<input name="email" type="email" autoComplete="email" required /></label>
                    </div>
                </fieldset>

                <fieldset className={styles.group}>
                    <div className={styles.inner}>
                        <legend>Detalii despre proiect</legend>
                        <p className={styles.question}>Tip colantare dorit</p>
                        <div className={styles.choices}>
                            {tipColantare.map(t => <label key={t} className={styles.choice}><input type="checkbox" name="tip" value={t} />{t}</label>)}
                        </div>
                        <label className={styles.field}>Număr vehicule<input name="vehicule" type="number" min={1} defaultValue={1} inputMode="numeric" /></label>
                        <p className={styles.question}>Tip vehicul</p>
                        <div className={styles.choices}>
                            {tipVehicul.map(t => <label key={t} className={styles.choice}><input type="checkbox" name="vehicul" value={t} />{t}</label>)}
                            <div className={styles.otherRow}>
                                <label className={styles.choice}><input type="checkbox" name="vehicul" value="Alt tip" />Alt tip</label>
                                <label className={styles.field}><span className="sr-only">Ce tip de vehicul</span><input name="altTip" placeholder="ex. motocicletă" /></label>
                            </div>
                        </div>
                        <p className={styles.question}>Ai deja designul grafic?</p>
                        <div className={styles.choices}>
                            <label className={styles.choice}><input type="radio" name="design" value="da" />Da</label>
                            <label className={styles.choice}><input type="radio" name="design" value="nu" />Nu, vreau să fie realizată grafica</label>
                        </div>
                        <label className={styles.field}>Atașare fișiere<input name="fisiere" type="file" multiple accept="image/*,.pdf,.ai,.eps,.svg,.cdr" /></label>
                        <label className={styles.field}>Informații suplimentare<textarea name="mesaj" /></label>
                    </div>
                </fieldset>

                <div className={styles.submit}>
                    <button type="submit" className="btn">Trimite cererea de ofertă</button>
                    <p className={styles.note}>Câmpurile marcate cu * sunt obligatorii.</p>
                </div>
            </form>
        </>
    )
}
