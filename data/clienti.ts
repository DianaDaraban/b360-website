// Client logos (white, from the WordPress theme). `match` picks the client's photos in the
// gallery by the name taken from the photo file names; logos without a match are shown but
// do not filter.
export type Client = { slug: string; name: string; logo: string; match?: RegExp }

export const clienti: Client[] = [
    { slug: "tiriac-auto", name: "Țiriac Auto", logo: "tiriac-auto", match: /^Tiriac Au/ },
    { slug: "city-grill", name: "City Grill", logo: "city-grill", match: /^City Grill/ },
    { slug: "ravitex", name: "Ravitex", logo: "ravitex", match: /^Ravitex/ },
    { slug: "draper", name: "Draper Tools", logo: "draper-tools", match: /^Drapper/ },
    { slug: "polach", name: "Polach", logo: "polach", match: /^Polach/ },
    { slug: "mercedes-benz", name: "Mercedes-Benz", logo: "mercedes-benz", match: /^Mercedes/ },
    { slug: "amgen", name: "Amgen", logo: "amgen", match: /^Amgen/ },
    { slug: "astra-giurgiu", name: "Astra Giurgiu", logo: "astra-giurgiu", match: /^Astra/ },
    { slug: "basilica-travel", name: "Basilica Travel", logo: "basilica-travel", match: /^Basilica/ },
    { slug: "rca-asigurat", name: "RCA Asigurat", logo: "RCA-Asigurat", match: /^RCA/ },
    { slug: "carrefour", name: "Carrefour", logo: "carrefour" },
    { slug: "continental", name: "Continental", logo: "continental" },
    { slug: "jaguar", name: "Jaguar", logo: "jaguar" },
    { slug: "contitech", name: "ContiTech", logo: "contitech" },
    { slug: "elit", name: "Elit", logo: "elit" },
    { slug: "swoboda", name: "Swoboda", logo: "swoboda" },
]

export const clientCuLucrari = (c: Client) => Boolean(c.match)

// Each client sticker is turned by its own angle, so the peeled corners point every which way (Figma)
export const tilts = [-20, 35, -65, 10, 80, -40, 55, -5, 115, -95, 25, -50, 70, -15, 140, -80, 5, 45, -30, 95]
