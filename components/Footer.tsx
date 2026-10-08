import Link from "next/link"
import { nav, site } from "@/lib/site"
import { Icon } from "./Icon"
import styles from "./Footer.module.css"

// Three compact rows: brand + contact, the page links, copyright
export function Footer() {
    return (
        <footer className={`site-footer ${styles.footer}`}>
            <div className={`container ${styles.top}`}>
                <Link href="/" aria-label="B360 – pagina principală">
                    <img src="/logo-white.svg" alt="B360 Producție publicitară" width={150} height={76} loading="lazy" className={styles.logo} />
                </Link>
                <address className={styles.contact}>
                    <a href={site.phoneHref} className="ulink"><Icon name="phone" size={22} /> {site.phone}</a>
                    <a href={`mailto:${site.email}`} className="ulink"><Icon name="at" size={22} /> {site.email}</a>
                    <a href={site.wazeUrl} target="_blank" rel="noopener" className="ulink"><Icon name="home" size={22} /> {site.address.street}, {site.address.locality}, {site.address.region}</a>
                </address>
            </div>
            <nav aria-label="Subsol" className="container">
                <ul className={styles.links}>
                    {nav.map(item => <li key={item.href}><Link href={item.href} className="ulink">{item.label}</Link></li>)}
                    <li><Link href="/calculator" className="ulink">Calculator</Link></li>
                    <li><Link href="/oferta" className="ulink">Cerere ofertă</Link></li>
                </ul>
            </nav>
            <p className={`container ${styles.copy}`}>© {new Date().getFullYear()} B360 Producție publicitară · Colantări și inscripționări din {site.founded}</p>
        </footer>
    )
}
