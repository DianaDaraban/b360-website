import type { Metadata, Viewport } from "next"
import { Funnel_Display, Funnel_Sans } from "next/font/google"
import { Header } from "@/components/Header"
import { BottomBar } from "@/components/BottomBar"
import { Footer } from "@/components/Footer"
import { Blobs } from "@/components/Blobs"
import { Reveal } from "@/components/Reveal"
import { site } from "@/lib/site"
import "./globals.css"

// Funnel Display: the font of the B360 sticker buttons; Funnel Sans for running text
const display = Funnel_Display({ subsets: ["latin", "latin-ext"], variable: "--font-display", display: "swap" })
const sans = Funnel_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-sans", display: "swap" })

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
    themeColor: "#f3eae1",
    // "only light" stops forced dark modes (Chrome auto dark, Samsung Internet) from recolouring the site
    colorScheme: "only light",
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
        <html lang="ro" className={`${display.variable} ${sans.variable}`}>
            <body>
                <Blobs variant="page" />
                <Header />
                <main>{children}</main>
                <Footer />
                <BottomBar />
                <Reveal />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }} />
            </body>
        </html>
    )
}
