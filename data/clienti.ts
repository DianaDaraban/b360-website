// Client logos in their own colours (scripts/import-client-logos.mjs), shown on beige stickers in
// the home and portfolio carousels. `match` picks the client's photos in the
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
    { slug: "iveco", name: "Iveco", logo: "iveco" },
    { slug: "man", name: "MAN", logo: "man" },
    { slug: "carrefour", name: "Carrefour", logo: "carrefour" },
    { slug: "continental", name: "Continental", logo: "continental" },
    { slug: "jaguar", name: "Jaguar", logo: "jaguar" },
    { slug: "contitech", name: "ContiTech", logo: "contitech" },
    { slug: "elit", name: "Elit", logo: "elit" },
    { slug: "swoboda", name: "Swoboda", logo: "swoboda" },
]

import type React from "react"
// a logo's box on its round sticker: as large as fits inside a circle just inside the disc
// (corners included, so wide logos never touch the edge), centred; sized from its aspect ratio.
// room: that circle's diameter in % of the disc (the flap may cover a bit of the logo)
import aspects from "./clienti-logos.json"
export function logoBox(logo: string, room = 94): React.CSSProperties {
    const a = (aspects as Record<string, number>)[logo] ?? 2
    const w = Math.min(room + 2, room / Math.sqrt(1 + 1 / (a * a)))
    const h = Math.min(room * 0.77, w / a)
    return { width: `${(h * a).toFixed(1)}%`, height: `${h.toFixed(1)}%` }
}

export const clientCuLucrari = (c: Client) => Boolean(c.match)

// Each client sticker is turned by its own angle, so the peeled corners point every which way (Figma)
export const tilts = [-20, 35, -65, 10, 80, -40, 55, -5, 115, -95, 25, -50, 70, -15, 140, -80, 5, 45, -30, 95]
