import Image from "next/image"
import Link from "next/link"
import { vehicule } from "@/data/servicii"
import styles from "./Specializate.module.css"

// "Colantări specializate": the pages for one kind of vehicle, grouped as one block instead of
// filling the services menu (on /servicii, the car wrap page and each of these pages)
export function Specializate({ current, title = "Colantări specializate" }: { current?: string; title?: string }) {
    const list = vehicule.filter(v => v.slug !== current)
    return (
        <div className={styles.wrap} id="specializate">
            <p className="eyebrow">Pe tipuri de vehicule</p>
            <h2 className={styles.title}>{title}</h2>
            <ul className={styles.grid}>
                {list.map(v => (
                    <li key={v.slug}>
                        <Link href={`/servicii/${v.slug}`} className={styles.item}>
                            <span className={`${styles.photo} peel peel-still`}>
                                <Image src={v.image} alt="" width={160} height={160} sizes="64px" />
                            </span>
                            <span className={styles.text}>
                                <strong>{v.short}</strong>
                                <small>{v.teaser}</small>
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}

// the same pages as one compact line of links (services menu, phone menu, home page)
export function SpecialChips({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
    return (
        <div className={`${styles.chips} ${className ?? ""}`}>
            <Link href="/servicii#specializate" onClick={onNavigate} className={styles.chipsLabel}>Colantări specializate</Link>
            <ul>
                {vehicule.map(v => {
                    const label = v.short.replace(/^Colantare /, "")
                    return <li key={v.slug}><Link href={`/servicii/${v.slug}`} onClick={onNavigate}>{label[0].toUpperCase() + label.slice(1)}</Link></li>
                })}
            </ul>
        </div>
    )
}
