import type { MetadataRoute } from "next"
import { site } from "@/lib/site"
import { servicii } from "@/data/servicii"

// every public page, for Google (served at /sitemap.xml)
export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date()
    const page = (path: string, priority: number, changeFrequency: "weekly" | "monthly" | "yearly" = "monthly") =>
        ({ url: `${site.url}${path}`, lastModified: now, changeFrequency, priority })
    return [
        page("", 1, "weekly"),
        page("/servicii", 0.9),
        ...servicii.map(s => page(`/servicii/${s.slug}`, 0.9)),
        page("/portofoliu", 0.8, "weekly"),
        page("/calculator", 0.8),
        page("/despre-noi", 0.6),
        page("/contact", 0.7),
        page("/oferta", 0.7),
        page("/politica-de-confidentialitate", 0.2, "yearly"),
    ]
}
