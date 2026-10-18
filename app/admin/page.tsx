import type { Metadata } from "next"
import { isAdmin } from "@/lib/admin-auth"
import { readAdminContent } from "@/lib/projects"
import { categorii, proiecte } from "@/data/lucrari"
import { clienti } from "@/data/clienti"
import { AdminPanel, type AdminProject } from "./AdminPanel"
import { LoginForm } from "./LoginForm"
import { PricingTab } from "./PricingTab"
import { getPricing, getSourceLink, getStatus } from "@/lib/pricing-store"
import styles from "./admin.module.css"

export const metadata: Metadata = { title: "Administrare", robots: { index: false, follow: false } }
export const dynamic = "force-dynamic"

export default async function AdminPage() {
    if (!(await isAdmin())) {
        return (
            <section className={`section ${styles.page}`}>
                <div className={`narrow ${styles.loginBox}`}>
                    <h1 className={styles.title}>Administrare</h1>
                    <LoginForm />
                </div>
            </section>
        )
    }

    // every project, hidden ones included, with the texts as currently shown on the site
    const { added, edits, hidden } = await readAdminContent()
    const projects: AdminProject[] = [
        ...added.map(p => ({ ...p, ...edits[p.slug], origin: "admin" as const })),
        ...proiecte.map(p => ({
            slug: p.slug,
            title: edits[p.slug]?.title ?? p.title,
            client: edits[p.slug]?.client !== undefined ? edits[p.slug]!.client! : p.clientName,
            cat: edits[p.slug]?.cat ?? p.cat,
            description: edits[p.slug]?.description ?? p.description ?? "",
            photos: p.photos.map(({ src, w, h }) => ({ src, w, h })),
            origin: "code" as const,
        })),
    ].map(p => ({ ...p, client: p.client ?? "", description: p.description ?? "", hidden: hidden.includes(p.slug) }))

    // prices first: reading them may check the workbook again and update the status
    const pricing = await getPricing()
    const [link, status] = await Promise.all([getSourceLink(), getStatus()])
    const clientNames = [...new Set([...clienti.map(c => c.name), ...projects.map(p => p.client).filter(Boolean)])].sort((a, b) => a.localeCompare(b, "ro"))

    return (
        <section className={`section ${styles.page}`}>
            <div className="container">
                <AdminPanel
                    projects={projects}
                    categories={categorii.map(({ slug, label }) => ({ slug, label }))}
                    clients={clientNames}
                    pricingTab={<PricingTab link={link ?? ""} status={status} pricing={pricing} usingDefaults={!pricing.updatedAt} />}
                />
            </div>
        </section>
    )
}
