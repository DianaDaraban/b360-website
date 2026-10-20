import type { Metadata } from "next"
import Link from "next/link"
import { site } from "@/lib/site"
import styles from "./legal.module.css"

export const metadata: Metadata = {
    title: "Politica de confidențialitate",
    description: "Cum prelucrează B360 (Red Division SRL) datele personale trimise prin formularele site-ului și ce drepturi ai.",
    alternates: { canonical: "/politica-de-confidentialitate" },
}

const UPDATED = "9 octombrie 2026"

// GDPR notice for the contact, quote and calculator forms, and for Google Analytics (only after consent)
export default function PrivacyPage() {
    const c = site.company
    return (
        <section className={`section ${styles.page}`}>
            <article className={`narrow ${styles.doc}`}>
                <p className="eyebrow">Informații legale</p>
                <h1>Politica de confidențialitate</h1>
                <p className={styles.updated}>Ultima actualizare: {UPDATED}</p>

                <h2>1. Cine suntem</h2>
                <p>
                    Site-ul <strong>{site.url.replace(/^https?:\/\//, "")}</strong> aparține brandului <strong>B360 Producție publicitară</strong>,
                    operat de <strong>{c.name}</strong>, CUI {c.cui}, nr. Registrul Comerțului {c.regCom}, cu sediul în {c.seat}.
                    Pentru datele trimise prin site, {c.name} este operatorul datelor cu caracter personal.
                </p>
                <p>
                    Ne poți scrie oricând despre datele tale la <a href={`mailto:${site.email}`}>{site.email}</a> sau ne poți suna la{" "}
                    <a href={site.phoneHref}>{site.phone}</a>.
                </p>

                <h2>2. Ce date colectăm</h2>
                <p>Colectăm doar datele pe care ni le trimiți singur prin formularele de pe site:</p>
                <ul>
                    <li><strong>Cerere ofertă:</strong> nume și prenume, companie (opțional), telefon, email, detaliile proiectului și fișierele atașate.</li>
                    <li><strong>Calculator:</strong> opțiunile alese, nume, telefon și email.</li>
                    <li><strong>Mesaj de contact:</strong> nume, email, subiectul și mesajul.</li>
                </ul>
                <p>
                    Furnizorul de găzduire poate înregistra automat, pentru securitate, date tehnice despre vizită (adresa IP, tipul browserului,
                    ora accesării). Nu folosim aceste date pentru a te identifica.
                </p>

                <h2>3. De ce le folosim și pe ce bază legală</h2>
                <ul>
                    <li>
                        <strong>Ca să-ți răspundem și să-ți trimitem oferta.</strong> Baza legală: demersurile făcute la cererea ta înainte de
                        încheierea unui contract (art. 6 alin. 1 lit. b GDPR).
                    </li>
                    <li>
                        <strong>Ca să răspundem la mesaje, păreri sau propuneri.</strong> Baza legală: consimțământul tău (art. 6 alin. 1 lit. a),
                        pe care îl dai bifând căsuța din formular și pe care îl poți retrage oricând.
                    </li>
                    <li>
                        <strong>Pentru securitatea site-ului.</strong> Baza legală: interesul nostru legitim de a proteja site-ul (art. 6 alin. 1 lit. f).
                    </li>
                </ul>
                <p>Nu folosim datele pentru marketing nesolicitat, nu le vindem și nu luăm decizii automate pe baza lor.</p>

                <h2>4. Cui le transmitem</h2>
                <p>Datele ajung doar la echipa B360 și la furnizorii care ne ajută tehnic să le primim, în limita a ce le este necesar:</p>
                <ul>
                    <li>furnizorul de găzduire a site-ului;</li>
                    <li>serviciul de email prin care ne sunt livrate mesajele din formulare;</li>
                    <li>furnizorul căsuței noastre de email.</li>
                </ul>
                <p>
                    Unii dintre acești furnizori pot prelucra date în afara Spațiului Economic European (de exemplu în SUA). În aceste cazuri,
                    transferul se face pe baza garanțiilor prevăzute de GDPR, cum ar fi clauzele contractuale standard aprobate de Comisia Europeană.
                </p>

                <h2>5. Cât timp le păstrăm</h2>
                <p>
                    Păstrăm cererile și mesajele primite <strong>cel mult 2 ani</strong> de la ultima comunicare cu tine, dacă nu devin un contract.
                    Dacă lucrăm împreună, documentele legate de comandă se păstrează atât cât cere legislația financiar-contabilă.
                </p>

                <h2>6. Drepturile tale</h2>
                <p>Ai dreptul să ceri:</p>
                <ul>
                    <li>acces la datele tale și o copie a lor;</li>
                    <li>corectarea datelor greșite;</li>
                    <li>ștergerea datelor;</li>
                    <li>restricționarea prelucrării;</li>
                    <li>portabilitatea datelor;</li>
                    <li>să te opui prelucrării bazate pe interesul nostru legitim;</li>
                    <li>retragerea consimțământului, oricând, fără să afecteze ce s-a făcut înainte.</li>
                </ul>
                <p>
                    Pentru oricare dintre ele scrie-ne la <a href={`mailto:${site.email}`}>{site.email}</a>. Răspundem în cel mult o lună.
                </p>
                <p>
                    Dacă crezi că datele tale nu au fost prelucrate corect, poți depune o plângere la Autoritatea Națională de Supraveghere a
                    Prelucrării Datelor cu Caracter Personal (ANSPDCP),{" "}
                    <a href="https://www.dataprotection.ro" target="_blank" rel="noopener">www.dataprotection.ro</a>.
                </p>

                <h2 id="cookie">7. Cookie-uri și statistici</h2>
                <p>
                    Folosim Google Analytics (Google Ireland Ltd.) ca să aflăm câți vizitatori avem, ce pagini citesc și dacă folosesc
                    calculatorul sau formularele. Datele sunt agregate și nu le folosim pentru reclame. Analytics pornește și pune
                    cookie-urile _ga numai după ce apeși „Accept” în bannerul de cookie-uri; dacă refuzi, nu se încarcă deloc.
                </p>
                <p>
                    Alegerea ta rămâne salvată în browser și o poți schimba oricând din linkul „Setări cookie-uri” din subsolul site-ului.
                    Cookie-urile Google Analytics expiră după cel mult 14 luni.
                </p>

                <h2>8. Securitate</h2>
                <p>
                    Site-ul folosește conexiune criptată (HTTPS), iar accesul la mesajele primite îl au doar persoanele din echipa B360 care se
                    ocupă de cereri.
                </p>

                <h2>9. Modificări</h2>
                <p>
                    Putem actualiza această politică atunci când se schimbă modul în care lucrăm cu datele. Versiunea în vigoare e întotdeauna cea de
                    pe această pagină, cu data ultimei actualizări de mai sus.
                </p>

                <p className={styles.back}><Link href="/contact" className="btn-ghost on-light">Înapoi la contact</Link></p>
            </article>
        </section>
    )
}
