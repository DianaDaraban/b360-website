"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRef } from "react"
import { Icon } from "./Icon"
import { nav, site } from "@/lib/site"
import styles from "./Header.module.css"

export function Header() {
    const pathname = usePathname()
    const menu = useRef<HTMLDialogElement>(null)
    const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href))

    return (
        <header className={styles.header}>
            <div className={styles.inner}>
                <Link href="/" className={styles.logo} aria-label="B360 – pagina principală">
                    <img src="/logo.svg" alt="B360 Producție publicitară" width={150} height={76} />
                </Link>

                <nav className={styles.desktopNav} aria-label="Principal">
                    {nav.slice(1).map(item => (
                        <Link key={item.href} href={item.href} aria-current={isActive(item.href) ? "page" : undefined}>
                            {item.label}
                        </Link>
                    ))}
                    <a href={site.phoneHref} className={styles.desktopPhone}>
                        <Icon name="phone" size={18} /> {site.phone}
                    </a>
                    <Link href="/oferta" className="btn peel">Cere ofertă</Link>
                </nav>

                <button className={styles.menuButton} onClick={() => menu.current?.showModal()} aria-haspopup="dialog">
                    <span className={styles.lines} aria-hidden="true" />
                    <span className={styles.word}>Meniu</span>
                </button>
            </div>

            <dialog ref={menu} className={styles.menu} aria-label="Meniu" onClick={e => e.target === menu.current && menu.current.close()}>
                <div className={styles.menuTop}>
                    <img src="/logo.svg" alt="" width={150} height={76} className={styles.menuLogo} />
                    <button className={styles.closeButton} onClick={() => menu.current?.close()}>
                        <span className={styles.cross} aria-hidden="true" />
                        <span className={styles.closeLabel}>Meniu</span>
                        <span className="sr-only">Închide</span>
                    </button>
                </div>
                <nav className={styles.menuPanel} aria-label="Meniu mobil">
                    <ul>
                        {nav.map(item => (
                            <li key={item.href}>
                                <Link href={item.href} onClick={() => menu.current?.close()} aria-current={isActive(item.href) ? "page" : undefined}>
                                    <Icon name={item.icon} size={34} />
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </dialog>
        </header>
    )
}
