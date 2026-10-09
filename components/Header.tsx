"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRef, useState } from "react"
import { Icon } from "./Icon"
import { LegalInfo } from "./LegalInfo"
import { nav } from "@/lib/site"
import { servicii } from "@/data/servicii"
import styles from "./Header.module.css"

export function Header() {
    const pathname = usePathname()
    const menu = useRef<HTMLDialogElement>(null)
    const [closing, setClosing] = useState(false)
    const [subOpen, setSubOpen] = useState(false)
    // a click inside the Servicii dropdown navigates, so the panel must fold away even though the
    // pointer is still over it; it opens again on the next hover
    const [dropClosed, setDropClosed] = useState(false)
    const closeDrop = () => {
        setDropClosed(true)
        ;(document.activeElement as HTMLElement | null)?.blur()
    }
    const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href))

    const openMenu = () => {
        setSubOpen(pathname.startsWith("/servicii"))
        menu.current?.showModal()
    }
    // play the closing animation, then really close the dialog
    const closeMenu = () => {
        if (!menu.current?.open || closing) return
        setClosing(true)
        setTimeout(() => {
            menu.current?.close()
            setClosing(false)
        }, 320)
    }

    return (
        <header className={styles.header}>
            <div className={styles.inner}>
                <Link href="/" className={styles.logo} aria-label="B360 – pagina principală">
                    <img src="/logo.svg" alt="B360 Producție publicitară" width={150} height={76} />
                </Link>

                <nav className={styles.desktopNav} aria-label="Principal">
                    {pathname !== "/" && (
                        <Link href="/" className={`${styles.navLink} ${styles.homeLink}`}>
                            <Icon name="home" size={20} /> Acasă
                        </Link>
                    )}
                    <Link href="/despre-noi" className={styles.navLink} aria-current={isActive("/despre-noi") ? "page" : undefined}>Despre noi</Link>

                    <div className={styles.dropdown} data-closed={dropClosed || undefined} onMouseLeave={() => setDropClosed(false)}>
                        <Link href="/servicii" onClick={closeDrop} className={styles.navLink} aria-current={isActive("/servicii") ? "page" : undefined} aria-haspopup="true">
                            Servicii <span className={styles.chevron} aria-hidden="true" />
                        </Link>
                        <div className={styles.dropPanel}>
                            <ul>
                                {servicii.map(s => (
                                    <li key={s.slug}>
                                        <Link href={`/servicii/${s.slug}`} onClick={closeDrop} className={styles.dropItem}>
                                            <span className={`${styles.dropPhoto} peel`}><img src={s.image} alt="" width={56} height={56} /></span>
                                            <span>
                                                <strong>{s.short}</strong>
                                                <small>{s.teaser}</small>
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                            <Link href="/servicii" onClick={closeDrop} className={`${styles.dropAll} ulink`}>Toate serviciile →</Link>
                        </div>
                    </div>

                    <Link href="/portofoliu" className={styles.navLink} aria-current={isActive("/portofoliu") ? "page" : undefined}>Portofoliu</Link>
                    <Link href="/calculator" className={`${styles.navLink} ${styles.calcLink}`} aria-current={isActive("/calculator") ? "page" : undefined}>
                        <Icon name="calculator" size={20} uncut /> Calculator
                    </Link>
                    <Link href="/contact" className={styles.navLink} aria-current={isActive("/contact") ? "page" : undefined}>Contact</Link>
                    <Link href="/oferta" className="btn">Cere ofertă</Link>
                </nav>

                <button className={styles.menuButton} onClick={openMenu} aria-haspopup="dialog">
                    <span className={styles.lines} aria-hidden="true" />
                    <span className={styles.word}>Meniu</span>
                </button>
            </div>

            <dialog
                ref={menu}
                className={styles.menu}
                data-closing={closing || undefined}
                aria-label="Meniu"
                onCancel={e => { e.preventDefault(); closeMenu() }}
                onClick={e => e.target === menu.current && closeMenu()}
            >
                <div className={styles.menuTop}>
                    <img src="/logo.svg" alt="" width={150} height={76} className={styles.menuLogo} />
                    <button className={styles.closeButton} onClick={closeMenu}>
                        <span className={styles.cross} aria-hidden="true" />
                        <span className={styles.closeLabel}>Meniu</span>
                        <span className="sr-only">Închide</span>
                    </button>
                </div>
                <nav className={styles.menuPanel} aria-label="Meniu mobil">
                    <ul>
                        {nav.map((item, i) => (
                            <li key={item.href} style={{ "--i": i } as React.CSSProperties}>
                                <div className={styles.menuRow}>
                                    <Link href={item.href} onClick={closeMenu} aria-current={isActive(item.href) ? "page" : undefined} className={styles.menuLink}>
                                        <Icon name={item.icon} size={26} />
                                        <span>{item.label}</span>
                                    </Link>
                                    {item.href === "/servicii" && (
                                        <button className={styles.subToggle} aria-expanded={subOpen} aria-controls="menu-servicii" onClick={() => setSubOpen(o => !o)}>
                                            <span className="sr-only">Arată serviciile</span>
                                        </button>
                                    )}
                                </div>
                                {item.href === "/servicii" && (
                                    <ul id="menu-servicii" className={styles.subList} data-open={subOpen || undefined}>
                                        {servicii.map(s => (
                                            <li key={s.slug}>
                                                <Link href={`/servicii/${s.slug}`} onClick={closeMenu} className={styles.subItem}>
                                                    <span className={`${styles.subPhoto} peel`}><img src={s.image} alt="" width={44} height={44} /></span>
                                                    <span>{s.short}</span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ul>
                    <LegalInfo className={styles.menuLegal} onNavigate={closeMenu} />
                </nav>
            </dialog>
        </header>
    )
}
