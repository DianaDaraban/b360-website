import type { Metadata } from "next"
import Image from "next/image"
import { Blobs } from "@/components/Blobs"
import { FileDrop } from "@/components/FormBits"
import { Icon } from "@/components/Icon"
import { OfertaProject } from "@/components/OfertaProject"
import { Consent, SmartForm } from "@/components/SmartForm"
import { site } from "@/lib/site"
import form from "../form.module.css"
import styles from "./oferta.module.css"

export const metadata: Metadata = {
    title: "Cerere ofertă colantare",
    description: "Completează formularul și îți trimitem rapid o ofertă personalizată pentru colantarea auto, branding de flotă, vitrine sau tapet printat.",
    alternates: { canonical: "/oferta" },
}

const pasi = [
    { title: "Completezi formularul", text: "Ne spui ce vrei și, dacă ai, atașezi grafica sau câteva poze." },
    { title: "Analizăm proiectul", text: "Vedem suprafețele, materialele potrivite și timpul de lucru." },
    { title: "Primești oferta", text: "Revenim cu prețul și propunerea, de obicei în aceeași zi lucrătoare." },
]

// Quote request (Figma "Cerere ofertă"): the steps and quick contacts on the left, the form card on
// the right; sent by SmartForm to /api/form
export default function OfertaPage() {
    return (
        <section className={`tinted ${form.page} ${styles.page}`}>
            <Image src="/img/letters.webp" alt="" fill priority sizes="100vw" className="tint-photo" />
            <Blobs variant="photo" />

            <div className={`container ${styles.grid}`}>
                <div className={styles.side}>
                    <p className="eyebrow start">Cerere ofertă</p>
                    <h1 className={styles.title}>Spune-ne ce vrei să colantăm</h1>
                    <p className={styles.lead}>Îți trimitem rapid o ofertă personalizată pentru mașina, flota, vitrina sau peretele tău.</p>

                    <ol className={styles.steps}>
                        {pasi.map((p, i) => (
                            <li key={p.title}>
                                <span className={styles.stepNo}>{i + 1}</span>
                                <span><strong>{p.title}</strong><small>{p.text}</small></span>
                            </li>
                        ))}
                    </ol>

                    <p className={styles.quickTitle}>Preferi să vorbim direct?</p>
                    <div className={styles.quick}>
                        <a href={site.phoneHref} className={styles.quickLink}><span className={`${styles.quickIcon} peel`}><Icon name="phone" size={22} /></span>{site.phone}</a>
                        <a href={`mailto:${site.email}`} className={styles.quickLink}><span className={`${styles.quickIcon} peel`}><Icon name="at" size={22} /></span>{site.email}</a>
                    </div>
                </div>

                <SmartForm kind="oferta" className={`${form.form} ${styles.card}`} aria-label="Cerere ofertă colantare">
                    <div className={styles.block}>
                        <h2 className={styles.blockTitle}><span>1</span>Datele tale</h2>
                        <div className={styles.fields} data-clarity-mask="true">
                            <label className={form.field}>Nume și prenume *<input name="nume" autoComplete="name" required /></label>
                            <label className={form.field}>Companie<input name="companie" autoComplete="organization" /></label>
                            <label className={form.field}>
                                Telefon *
                                <span className={form.phoneRow}><span>+40</span><input name="telefon" type="tel" autoComplete="tel-national" inputMode="tel" placeholder="722 12 34 56" required /></span>
                            </label>
                            <label className={form.field}>Email <small>(opțional)</small><input name="email" type="email" autoComplete="email" /></label>
                        </div>
                    </div>

                    <div className={styles.block}>
                        <h2 className={styles.blockTitle}><span>2</span>Proiectul</h2>
                        {/* the questions follow the service chosen (car, wallpaper, shop windows…) */}
                        <OfertaProject />
                    </div>

                    <div className={styles.block}>
                        <h2 className={styles.blockTitle}><span>3</span>Detalii și fișiere</h2>
                        <FileDrop name="fisiere" accept="image/*,.pdf,.ai,.eps,.svg,.cdr" maxMb={4} />
                        <label className={form.field} data-clarity-mask="true">
                            <span className="sr-only">Informații suplimentare</span>
                            <textarea name="mesaj" placeholder="Informații suplimentare: culori, termen, unde e lucrarea, orice ne ajută." />
                        </label>
                    </div>

                    {/* consent on the left, the send button on the right */}
                    <div className={styles.sendRow}>
                        <Consent />
                        <button type="submit" className="btn">Trimite cererea</button>
                    </div>
                </SmartForm>
            </div>
        </section>
    )
}
