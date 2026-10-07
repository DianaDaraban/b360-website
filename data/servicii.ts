// Service texts from the Figma prototype (Servicii page). The PPF entry is new and its
// details (film brand, warranty, packages) are still to be confirmed with B360.
export type Serviciu = {
    slug: string
    title: string
    short: string
    image: string
    intro: string
    offerLabel?: string
    offers: { title: string; text?: string }[]
    portfolio: { label: string; category: string }
}

export const servicii: Serviciu[] = [
    {
        slug: "colantare-auto",
        title: "Colantări auto integrale și parțiale",
        short: "Colantări auto",
        image: "/img/wrap-hands.webp",
        intro: "Transformăm mașinile în instrumente de marketing vizibil.",
        offerLabel: "Oferim:",
        offers: [
            { title: "Colantări integrale", text: "Acoperirea completă a caroseriei, ideală pentru branding complet sau schimbare de culoare." },
            { title: "Colantări parțiale", text: "Stickere, elemente grafice sau zone personalizate, potrivite pentru campanii și promovare flexibilă." },
        ],
        portfolio: { label: "Vezi portofoliu colantări auto", category: "autoturisme" },
    },
    {
        slug: "autocolante-inscriptionari",
        title: "Inscripționări și stickere personalizate",
        short: "Stickere și inscripționări",
        image: "/img/racing-stripes.webp",
        intro: "Realizăm **stickere** și **inscripționări personalizate** pe orice suport: auto, pereți, geamuri, panouri sau alte suprafețe plane.",
        offers: [
            { title: "Potrivite pentru evenimente, campanii publicitare sau branding de produs." },
            { title: "Aplicare rapidă și impact vizual imediat." },
        ],
        portfolio: { label: "Vezi portofoliu stickere și inscripționări", category: "stickere" },
    },
    {
        slug: "colantare-vitrine",
        title: "Colantări și inscripționări vitrine",
        short: "Vitrine",
        image: "/img/storefront-stickers.webp",
        intro: "O vitrină bine colantată atrage atenția clienților chiar din stradă și oferă în același timp un plus de protecție.",
        offerLabel: "Oferim soluții variate:",
        offers: [
            { title: "Folii sablate sau transparente", text: "Pentru un aspect elegant și intim." },
            { title: "Folii colorate sau printate", text: "Ideale pentru campanii promoționale și branding vizibil." },
            { title: "Folii cu protecție UV și solară", text: "Reduc pătrunderea razelor ultraviolete și căldura excesivă, protejând interiorul și oferind confort clienților." },
            { title: "Branding permanent sau temporar", text: "Adaptat nevoilor business-ului tău." },
        ],
        portfolio: { label: "Vezi portofoliu colantări vitrine", category: "vitrine" },
    },
    {
        slug: "folie-ppf",
        title: "Folie PPF – protecție transparentă pentru vopsea",
        short: "Folie PPF",
        image: "/img/wrap-fan.webp",
        intro: "Folia PPF (Paint Protection Film) este o peliculă transparentă care protejează vopseaua de pietricele, zgârieturi fine și razele UV, fără să schimbe aspectul mașinii.",
        offerLabel: "Oferim:",
        offers: [
            { title: "Protecție integrală", text: "Toată caroseria, pentru mașini noi sau proaspăt polișate." },
            { title: "Protecție parțială", text: "Zonele cele mai expuse: bara față, capota, aripile și oglinzile." },
        ],
        portfolio: { label: "Vezi portofoliu colantări auto", category: "autoturisme" },
    },
]

export const getServiciu = (slug: string) => servicii.find(s => s.slug === slug)
