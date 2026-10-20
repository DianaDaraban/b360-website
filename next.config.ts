import type { NextConfig } from "next"
import path from "node:path"

// The parent folder (D:\IT\B360) has its own package-lock.json, so pin the project root here
const root = path.resolve(import.meta.dirname)

const nextConfig: NextConfig = {
    turbopack: { root },
    outputFileTracingRoot: root,
    images: { formats: ["image/avif", "image/webp"] },
    // the old WordPress site's addresses, already known to Google: each goes, permanently, to the
    // page that now covers it, so the ranking they earned carries over
    async redirects() {
        const to = (destination: string, ...sources: string[]) => sources.map(source => ({ source, destination, permanent: true }))
        return [
            // the hosting panels, reached as b360.ro/cpanel and b360.ro/webmail while the site was on that server
            { source: "/cpanel", destination: "https://cpanel.b360.ro", permanent: false },
            { source: "/webmail", destination: "https://webmail.b360.ro", permanent: false },
            ...to("/servicii/colantare-auto", "/colantari-auto", "/colantari-integrale", "/colantari-moto", "/colantare-utilitare",
                "/colantare-tir-uri", "/colantare-autocare", "/colantari-autocare", "/colantare-avioane", "/colantare-barci"),
            ...to("/servicii/colantare-vitrine", "/folii-sablare-geam", "/folii-geam-window-graphics", "/2019/05/30/folie-electrostatica-pentru-suprafete-vitrate"),
            ...to("/servicii/autocolante-inscriptionari", "/stickere-asfalt-podea"),
            ...to("/servicii/tapet-printat", "/folia-autoadeziva-pentru-caramizi"),
            ...to("/servicii", "/grafica-si-design"),
            ...to("/portofoliu", "/portofoliu-clienti", "/portofoliu-lucrari", "/project/:slug*", "/category/:slug*", "/project_category/:slug*"),
            ...to("/oferta", "/solicita-oferta", "/formular-comanda-avioane-si-barci"),
            ...to("/calculator", "/formular-comanda-autoturisme"),
            ...to("/politica-de-confidentialitate", "/termeni-si-conditii", "/politica-de-cookies", "/acord-gdpr"),
            ...to("/", "/blog", "/multumim", "/feed", "/:year(\\d{4})/:month(\\d{2})/:day(\\d{2})/:slug*"),
        ]
    },
}

export default nextConfig
