"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Icon } from "./Icon"
import { site } from "@/lib/site"
import styles from "./BottomBar.module.css"

// Mobile action bar from the Figma: quote request on the left, the peeled phone sticker in the middle,
// the calculator on the right, under the right thumb, since it is the most used (Nov 2026). Each side
// keeps its place and turns into "Acasă" on its own page.
export function BottomBar() {
    const pathname = usePathname()
    // on the wallpaper pages both actions are about wallpaper: the wallpaper calculator, the quote form
    // opened on wallpaper (visitors from the wallpaper ads landed on the car calculator before)
    const tapet = pathname.startsWith("/servicii/tapet-printat") || pathname.startsWith("/calculator-tapet")
    const onOferta = pathname.startsWith("/oferta")
    const onCalculator = pathname.startsWith("/calculator")

    const home = (side: string) => (
        <Link href="/" className={`${styles.side} ${side} ${styles.home}`}>
            <Icon name="home" size={30} />
            <span>Acasă</span>
        </Link>
    )

    return (
        <nav className={styles.bar} aria-label="Acțiuni rapide">
            {onOferta ? home("") : (
                <Link href={tapet ? "/oferta?serviciu=tapet" : "/oferta"} className={styles.side}>
                    <Icon name="at" size={36} className={styles.at} />
                    <span>{tapet ? "Cerere ofertă tapet" : "Cerere ofertă"}</span>
                </Link>
            )}

            {/* The drop shadow sits on the link so it follows the round sticker */}
            <a href={site.phoneHref} className={styles.phone} aria-label={`Sună-ne: ${site.phone}`}>
                <span className="peel">
                    <Icon name="phone" size={46} />
                </span>
            </a>

            {onCalculator ? home(styles.right) : (
                <Link href={tapet ? "/calculator-tapet" : "/calculator"} className={`${styles.side} ${styles.right}`}>
                    <span>{tapet ? "Calculator tapet" : "Calculator colantare"}</span>
                    <Icon name="calculator" size={40} />
                </Link>
            )}
        </nav>
    )
}
