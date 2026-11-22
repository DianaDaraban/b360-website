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
    // on the wallpaper pages the estimate is the wallpaper calculator: visitors from the wallpaper ads
    // tapped "Calcul" and landed on the car calculator (Clarity, Nov 2026)
    const tapet = pathname.startsWith("/servicii/tapet-printat") || pathname.startsWith("/calculator-tapet")

    return (
        <nav className={styles.bar} aria-label="Acțiuni rapide">
            <Link href={tapet ? "/calculator-tapet" : "/calculator"} className={styles.side}>
                <Icon name="calculator" size={40} />
                <span>{tapet ? "Calcul estimativ tapet" : "Calcul estimativ colantare"}</span>
            </Link>

            {/* The drop shadow sits on the link so it follows the round sticker */}
            <a href={site.phoneHref} className={styles.phone} aria-label={`Sună-ne: ${site.phone}`}>
                <span className="peel">
                    <Icon name="phone" size={46} />
                </span>
            </a>

            {onForm ? (
                <Link href="/" className={`${styles.side} ${styles.right} ${styles.home}`}>
                    <Icon name="home" size={30} />
                    <span>Acasă</span>
                </Link>
            ) : (
                <Link href="/oferta" className={`${styles.side} ${styles.right}`}>
                    <span>{tapet ? "Cerere ofertă tapet" : "Cerere ofertă colantare"}</span>
                    <Icon name="at" size={36} className={styles.at} />
                </Link>
            )}
        </nav>
    )
}
