// Client logos (white, from the WordPress theme). `match` picks the client's photos in the
// gallery by the name taken from the photo file names; logos without a match are shown but
// do not filter.
export type Client = { slug: string; name: string; logo: string; match?: RegExp }

export const clienti: Client[] = [
    { slug: "tiriac-auto", name: "Țiriac Auto", logo: "tiriac-auto", match: /^Tiriac Au/ },
    { slug: "hello-holidays", name: "Hello Holidays", logo: "hello-holidays", match: /^Hello Holidays/ },
    { slug: "flixbus", name: "FlixBus", logo: "flixbus", match: /^Flixbus/i },
    { slug: "city-grill", name: "City Grill", logo: "city-grill", match: /^City Grill/ },
    { slug: "ravitex", name: "Ravitex", logo: "ravitex", match: /^Ravitex/ },
    { slug: "draper", name: "Draper Tools", logo: "draper-tools", match: /^Drapper/ },
    { slug: "castrol", name: "Castrol", logo: "castrol", match: /^Castrol/ },
    { slug: "holcim", name: "Holcim", logo: "holcim", match: /^Holcim/ },
    { slug: "the-home", name: "The Home", logo: "the-home", match: /^The Home/ },
    { slug: "optimal-solutions", name: "Optimal Solutions", logo: "optimal-solutions", match: /^Optimal/ },
    { slug: "handbal-club-buzau", name: "Handbal Club Buzău", logo: "handbal-club-buzau", match: /^Handbal Club Buz/ },
    { slug: "transfero", name: "Transfero", logo: "transfero", match: /^Transfero/ },
    { slug: "top-smart", name: "Top Smart", logo: "top-smart", match: /^Top Smart/ },
    { slug: "netafim", name: "Netafim", logo: "netafim", match: /^Netafim/ },
    { slug: "julius-meinl", name: "Julius Meinl", logo: "julius-meinl", match: /^(Iulius|Julius) Meinl/ },
    { slug: "crucea-rosie", name: "Crucea Roșie Română", logo: "crucea-rosie", match: /^Crucea Ro/ },
    { slug: "wipro", name: "Wipro", logo: "wipro", match: /^Wipro/ },
    { slug: "stb", name: "STB", logo: "stb", match: /^STB$/ },
    { slug: "fc-u-craiova", name: "FC Universitatea Craiova", logo: "fc-u-craiova", match: /^FCU Craiova/ },
    { slug: "stadler", name: "Stadler Agro Solutions", logo: "stadler", match: /^Stadler/ },
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
