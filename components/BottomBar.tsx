"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Icon } from "./Icon"
import { site } from "@/lib/site"
import styles from "./BottomBar.module.css"

// Mobile action bar from the Figma: estimate on the left, the peeled phone sticker in the
// middle, quote request on the right (replaced by "Acasă" on the calculator and quote pages)
export function BottomBar() {
    const pathname = usePathname()
    const onForm = pathname.startsWith("/calculator") || pathname.startsWith("/oferta")

    return (
        <nav className={styles.bar} aria-label="Acțiuni rapide">
            <Link href="/calculator" className={styles.side}>
                <Icon name="calculator" size={40} />
                <span>Calcul estimativ colantare</span>
            </Link>

            {/* The drop shadow sits on the link so it follows the round sticker */}
            <a href={site.phoneHref} className={styles.phone} aria-label={`Sună-ne: ${site.phone}`}>
                <span className="peel">
                    <Icon name="phone" size={34} />
                </span>
            </a>

            {onForm ? (
                <Link href="/" className={`${styles.side} ${styles.right} ${styles.home}`}>
                    <Icon name="home" size={30} />
                    <span>Acasă</span>
                </Link>
            ) : (
                <Link href="/oferta" className={`${styles.side} ${styles.right}`}>
                    <span>Cerere ofertă colantare</span>
                    <span className={styles.at} aria-hidden="true">@</span>
                </Link>
            )}
        </nav>
    )
}
