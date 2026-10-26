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
            ...to("/servicii/colantare-auto", "/colantari-auto", "/colantari-integrale"),
            // the path shown in the Google Ads ads (b360.ro/inscripționări/colantări-auto), with and without diacritics
            ...to("/servicii/colantare-auto", "/inscriptionari/:path*", "/inscripționări/:path*", "/inscrip%C8%9Bion%C4%83ri/:path*"),
            // the vehicle pages that ranked on their own keep a page of their own
            ...to("/servicii/colantare-moto", "/colantari-moto"),
            ...to("/servicii/colantare-camioane", "/colantare-tir-uri"),
            ...to("/servicii/colantare-autocare", "/colantare-autocare", "/colantari-autocare"),
            ...to("/servicii/colantare-autoutilitare", "/colantare-utilitare"),
            ...to("/servicii/colantare-barci-avioane", "/colantare-barci", "/colantare-avioane"),
            ...to("/servicii/colantare-vitrine", "/folii-sablare-geam", "/folii-geam-window-graphics", "/2019/05/30/folie-electrostatica-pentru-suprafete-vitrate"),
            ...to("/servicii/autocolante-inscriptionari", "/stickere-asfalt-podea"),
            ...to("/servicii/tapet-printat", "/folia-autoadeziva-pentru-caramizi"),
            ...to("/servicii", "/grafica-si-design"),
            // the older WordPress menu, a level deeper (inscriptionari-auto/..., colantari-decorative/...), still linked from other sites
            ...to("/servicii/colantare-auto", "/inscriptionari-auto", "/inscriptionari-auto/inscriptionari-autoturisme", "/colantari-si-inscriptionari-auto-si-moto", "/colantari-si-inscriptionari-auto-si-moto/colantari-autoturisme"),
            ...to("/servicii/colantare-moto", "/inscriptionari-moto"),
            ...to("/servicii/colantare-camioane", "/inscriptionari-auto/inscriptionari-tiruri", "/colantari-si-inscriptionari-auto-si-moto/colantari-tiruri"),
            ...to("/servicii/colantare-autocare", "/inscriptionari-auto/inscriptionari-autocare"),
            ...to("/servicii/colantare-autoutilitare", "/inscriptionari-auto/inscriptionari-utilitare", "/colantari-si-inscriptionari-auto-si-moto/colantari-utilitare"),
            ...to("/servicii/colantare-barci-avioane", "/inscriptionari-barci", "/inscriptionari-auto/inscriptionari-avioane", "/colantari-si-inscriptionari-auto-si-moto/colantari-barci"),
            ...to("/servicii/colantare-vitrine", "/colantari-decorative/folii-translucide-colorate", "/colantari-decorative/folii-window-graphics", "/stickere-speciale/folie-electrostatica-pentru-suprafete-vitrate"),
            ...to("/servicii/tapet-printat", "/colantari-decorative", "/colantari-decorative/folia-autoadeziva-pentru-caramizi", "/colantari-decorative/stickere-perete", "/colantari-decorative/tablouri-printate-pe-canvas"),
            ...to("/servicii/autocolante-inscriptionari", "/colantari-decorative/stickere-de-pardoseala", "/stickere-speciale/:slug*", "/colantare-suprafete-flexibile", "/folii-autoadezive-pentru-suprafete-rigide"),
            // signage and promotional textiles are no longer offered on their own: the services overview
            ...to("/servicii", "/signalistica-indoor-si-outdoor/:slug*", "/personalizari-materiale-promotionale/:slug*"),
            ...to("/portofoliu", "/portofoliu/:slug+", "/partner/:slug*"),
            ...to("/contact", "/despre-noi/contact"),
            ...to("/oferta", "/formular-comanda-tir-uri", "/formular-comanda-signalistica", "/formular-comanda-stickere-speciale", "/formular-comanda-tapet-si-stickere-decorative", "/formular-comanda-personalizari-textile"),
            ...to("/portofoliu", "/portofoliu-clienti", "/portofoliu-lucrari", "/project/:slug*", "/category/:slug*", "/project_category/:slug*"),
            ...to("/oferta", "/solicita-oferta", "/formular-comanda-avioane-si-barci"),
            ...to("/calculator", "/formular-comanda-autoturisme"),
            ...to("/politica-de-confidentialitate", "/termeni-si-conditii", "/politica-de-cookies", "/acord-gdpr"),
            ...to("/", "/blog", "/multumim", "/feed", "/:year(\\d{4})/:month(\\d{2})/:day(\\d{2})/:slug*"),
        ]
    },
}

export default nextConfig
