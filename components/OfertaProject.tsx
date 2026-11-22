"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Pills, Stepper } from "./FormBits"
import { TAPET } from "@/data/tapet"
import form from "@/app/form.module.css"
import styles from "@/app/oferta/oferta.module.css"
import bits from "./FormBits.module.css"

// The "Proiectul" block of the quote form: first what the work is, then only the questions that fit it.
// Wallpaper had car questions before (tip vehicul, număr vehicule), so wallpaper visitors could not
// say what they wanted. /oferta?serviciu=tapet (the wallpaper pages' bottom bar) opens on wallpaper.
const SERVICES = [
    { id: "auto", label: "Colantare auto" },
    { id: "tapet", label: "Tapet printat" },
    { id: "vitrine", label: "Vitrine" },
    { id: "stickere", label: "Stickere / inscripționări" },
    { id: "altceva", label: "Altceva" },
] as const
type Service = (typeof SERVICES)[number]["id"]

export function OfertaProject() {
    const [service, setService] = useState<Service>("auto")
    // the service asked for in the address, once the page is in the browser
    useEffect(() => {
        const asked = new URLSearchParams(location.search).get("serviciu")
        const found = SERVICES.find(s => s.id === asked)
        // eslint-disable-next-line react-hooks/set-state-in-effect -- read once from the address after hydration
        if (found) setService(found.id)
    }, [])

    return (
        <>
            <p className={styles.question}>Ce vrei să facem?</p>
            {/* drawn like the other answer pills (FormBits), but held here, since the questions below follow it */}
            <div className={bits.pills} role="radiogroup" aria-label="Serviciul">
                {SERVICES.map(s => (
                    <label key={s.id} className={bits.pill}>
                        <input type="radio" name="serviciu" value={s.label} checked={service === s.id} onChange={() => setService(s.id)} />
                        <span>{s.label}</span>
                    </label>
                ))}
            </div>

            {/* key: the questions of one service start empty when switching (no stray car answers on a wallpaper request) */}
            <div key={service} className={styles.serviceFields}>
                {service === "auto" && <>
                    <p className={styles.question}>Tip colantare</p>
                    <Pills name="tip" type="radio" options={["Integrală", "Parțială", "Sticker / elemente personalizate"]} />
                    <p className={styles.question}>Tip vehicul</p>
                    <Pills name="vehicul" options={["Autoturism", "Autoutilitară", "Camion / Flotă"]} other={{ label: "Alt tip", name: "altTip", placeholder: "ex. motocicletă, barcă" }} />
                    <div className={styles.twoCols}>
                        <div>
                            <p className={styles.question}>Număr vehicule</p>
                            <Stepper name="vehicule" label="Număr vehicule" />
                        </div>
                        <div>
                            <p className={styles.question}>Ai deja designul grafic?</p>
                            <Pills name="design" type="radio" options={["Da", "Nu, vreau grafică"]} />
                        </div>
                    </div>
                    <p className={styles.hint}>Vrei prețul pe loc? <Link href="/calculator">Calculatorul de colantare</Link> îți arată o estimare în 2 minute.</p>
                </>}

                {service === "tapet" && <>
                    <p className={styles.question}>Unde se montează?</p>
                    <Pills name="camera" type="radio" options={["Cameră de locuit", "Bucătărie sau baie", "Birou, restaurant sau magazin"]} />
                    <label className={form.field}>
                        Dimensiunile pereților <small>(aproximativ)</small>
                        <input name="pereti" placeholder="ex. 2 pereți: 350 × 260 cm și 300 × 260 cm" />
                    </label>
                    <p className={styles.question}>Ce imagine punem pe perete?</p>
                    <Pills name="imagine" type="radio" options={["Am imaginea mea", "Din catalogul B360", "Vreau o grafică făcută de voi"]} />
                    <p className={styles.question}>În ce oraș?</p>
                    <Pills name="oras" type="radio" options={["București sau Ilfov", "Alt oraș"]} />
                    <p className={styles.hint}>Tapetul costă {TAPET.pricePerMp.casa} lei/mp + TVA, cu print, material și <b>montaj inclus</b>. Vrei să vezi prețul și imaginea pe pereții tăi? <Link href="/calculator-tapet">Calculatorul de tapet</Link>.</p>
                </>}

                {(service === "vitrine" || service === "stickere" || service === "altceva") && <>
                    <label className={form.field}>
                        Ce suprafață, aproximativ? <small>(opțional)</small>
                        <input name="suprafata" placeholder={service === "vitrine" ? "ex. 3 vitrine de 2 × 2,5 m" : "ex. 20 de stickere de 30 × 20 cm"} />
                    </label>
                    <p className={styles.question}>Ai deja designul grafic?</p>
                    <Pills name="design" type="radio" options={["Da", "Nu, vreau grafică"]} />
                </>}
            </div>
        </>
    )
}
