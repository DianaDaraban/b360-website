import type { MetadataRoute } from "next"
import { site } from "@/lib/site"

// served at /robots.txt: everything open except the admin and the internal routes
export default function robots(): MetadataRoute.Robots {
    return {
        rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/media/proiecte/"] }],
        sitemap: `${site.url}/sitemap.xml`,
        host: site.url,
    }
}
