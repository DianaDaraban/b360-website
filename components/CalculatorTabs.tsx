import Link from "next/link"
import { Icon } from "./Icon"
import styles from "./CalculatorTabs.module.css"

// The two calculators as tabs of one: each tab is its own page (its own address, so Google can show
// the wallpaper calculator on its own), switched like a tab
const TABS = [
    { href: "/calculator", label: "Colantare auto", icon: "car" },
    { href: "/calculator-tapet", label: "Tapet printat", icon: "gallery" },
] as const

export function CalculatorTabs({ active }: { active: "/calculator" | "/calculator-tapet" }) {
    return (
        <nav className={styles.tabs} aria-label="Calculatoare">
            {TABS.map(t => (
                <Link key={t.href} href={t.href} className={styles.tab} aria-current={t.href === active ? "page" : undefined} scroll={false}>
                    <Icon name={t.icon} size={30} uncut />
                    {t.label}
                </Link>
            ))}
        </nav>
    )
}
