import Link from "next/link"
import { site } from "@/lib/site"

// Company identity, privacy policy and the ANPC SAL pictogram (required on Romanian commercial
// sites). Shown in the footer and, on phones where the footer is hidden, at the end of the menu.
export function LegalInfo({ className = "", onNavigate }: { className?: string; onNavigate?: () => void }) {
    const c = site.company
    return (
        <div className={`legal-info ${className}`}>
            <p>B360 este un brand {c.name} · CUI {c.cui} · {c.regCom}</p>
            <p className="legal-links">
                <Link href="/politica-de-confidentialitate" onClick={onNavigate}>Politica de confidențialitate</Link>
                <a href="https://anpc.ro/sal/" target="_blank" rel="noopener" className="legal-badge">
                    <img src="/legal/anpc-sal.png" alt="ANPC – Soluționarea alternativă a litigiilor" width={201} height={50} loading="lazy" />
                </a>
            </p>
        </div>
    )
}
