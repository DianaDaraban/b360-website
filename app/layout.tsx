import type { Metadata, Viewport } from "next"
import { Archivo } from "next/font/google"
import { Header } from "@/components/Header"
import { BottomBar } from "@/components/BottomBar"
import { Footer } from "@/components/Footer"
import { site } from "@/lib/site"
import "./globals.css"

const archivo = Archivo({
    subsets: ["latin", "latin-ext"],
    axes: ["wdth"],
    variable: "--font-archivo",
    display: "swap",
})

export const metadata: Metadata = {
    metadataBase: new URL(site.url),
    title: {
        default: "Colantări auto și inscripționări publicitare | B360",
        template: "%s | B360",
    },
    description:
        "Colantări auto integrale și parțiale, branding de flote, inscripționări vitrine și stickere personalizate. Din 2012, în Corbeanca, Ilfov, pentru clienți din toată țara.",
    openGraph: { type: "website", locale: "ro_RO", siteName: "B360" },
    alternates: { canonical: "/" },
}

export const viewport: Viewport = {
    themeColor: "#ffffff",
    colorScheme: "light",
}

// LocalBusiness data so Google can show the address and phone next to the results
const localBusiness = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${site.url}/#business`,
    name: "B360 Producție publicitară",
    url: site.url,
    telephone: "+40745094195",
    email: site.email,
    foundingDate: String(site.founded),
    image: `${site.url}/img/hero-graffiti.webp`,
    logo: `${site.url}/logo.svg`,
    address: {
        "@type": "PostalAddress",
        streetAddress: site.address.street,
        addressLocality: site.address.locality,
        addressRegion: site.address.region,
        addressCountry: site.address.country,
    },
    areaServed: "RO",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="ro" className={archivo.variable}>
            <body>
                <Header />
                <main>{children}</main>
                <Footer />
                <BottomBar />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }} />
            </body>
        </html>
    )
}
