import Link from "next/link"
import { nav, site } from "@/lib/site"
import styles from "./Footer.module.css"

export function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={`container ${styles.grid}`}>
                <div className={styles.brand}>
                    <img src="/logo-white.svg" alt="B360 Producție publicitară" width={150} height={76} loading="lazy" />
                    <p>Colantări și inscripționări profesionale din {site.founded}.</p>
                </div>
                <nav aria-label="Subsol">
                    <ul>
                        {nav.map(item => <li key={item.href}><Link href={item.href}>{item.label}</Link></li>)}
                    </ul>
                </nav>
                <address>
                    <a href={site.phoneHref}>{site.phone}</a>
                    <a href={`mailto:${site.email}`}>{site.email}</a>
                    <span>{site.address.street}, {site.address.locality}, {site.address.region}</span>
                </address>
            </div>
            <p className={`container ${styles.copy}`}>© {new Date().getFullYear()} B360 Producție publicitară</p>
        </footer>
    )
}
