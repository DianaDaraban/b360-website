// Calculator data: body types (with the drawing geometry), panels, prices and car models.
// Prices: one price per panel per body type; inscription and logo are separate rates.
// PROVISIONAL values until B360 sends the real price list (see PRICES_PROVISIONAL).

import { geometry } from "./calculator-geometry"

export type BodyId = "hatchback" | "sedan" | "break" | "suv" | "utilitara" | "autocar" | "camion"
export type Mode = "colantare" | "inscriptionare" | "logo"
export type View = "stanga" | "dreapta" | "sus"

export const PRICES_PROVISIONAL = true

export const modes: { id: Mode; label: string; hint: string }[] = [
    { id: "colantare", label: "Colantare integrală", hint: "toată piesa" },
    { id: "inscriptionare", label: "Inscripționare", hint: "partea de jos, până la geam" },
    { id: "logo", label: "Colantare + logo", hint: "piesa colantată, cu logo și grafică peste" },
]

// Panel kinds priced the same on both sides; side panels exist as "-st" (left) and "-dr" (right)
export type PanelKind =
    | "bara-fata" | "bara-spate" | "capota" | "plafon" | "portbagaj"
    | "aripa-fata" | "usa-fata" | "usa-spate" | "aripa-spate" | "oglinda"
    | "usa-culisanta" | "panou-lateral" | "usi-spate" | "panou-frontal"
    // only with a full wrap: added on their own (see AUTO_FULL)
    | "stalp" | "prag"
    // coach
    | "fata" | "spate" | "lateral-fata" | "lateral-mijloc" | "lateral-spate"
    // tractor unit with semi-trailer
    | "cabina-fata" | "cabina-usa" | "cabina-lateral" | "cabina-plafon"
    | "remorca-fata" | "remorca-spate" | "remorca-lateral-fata" | "remorca-lateral-spate" | "remorca-plafon"

export const panelNames: Record<PanelKind, string> = {
    "bara-fata": "Bară față",
    "bara-spate": "Bară spate",
    capota: "Capotă",
    plafon: "Plafon",
    portbagaj: "Portbagaj / hayon",
    "aripa-fata": "Aripă față",
    "usa-fata": "Ușă față",
    "usa-spate": "Ușă spate",
    "aripa-spate": "Aripă spate",
    oglinda: "Oglindă",
    "usa-culisanta": "Ușă culisantă",
    "panou-lateral": "Panou lateral",
    "usi-spate": "Uși spate",
    "panou-frontal": "Panou frontal",
    stalp: "Stâlpi",
    prag: "Prag",
    fata: "Față",
    spate: "Spate",
    "lateral-fata": "Lateral față",
    "lateral-mijloc": "Lateral mijloc",
    "lateral-spate": "Lateral spate",
    "cabina-fata": "Cabină față",
    "cabina-usa": "Ușă cabină",
    "cabina-lateral": "Lateral cabină",
    "cabina-plafon": "Plafon cabină și deflector",
    "remorca-fata": "Semiremorcă față",
    "remorca-spate": "Semiremorcă spate",
    "remorca-lateral-fata": "Lateral semiremorcă, jumătatea din față",
    "remorca-lateral-spate": "Lateral semiremorcă, jumătatea din spate",
    "remorca-plafon": "Plafon semiremorcă",
}

export const panelLabel = (id: string) => {
    const side = id.endsWith("-st") ? " stânga" : id.endsWith("-dr") ? " dreapta" : ""
    return panelNames[id.replace(/-(st|dr)$/, "") as PanelKind] + side
}
export const panelKind = (id: string) => id.replace(/-(st|dr)$/, "") as PanelKind

// ---------- photo geometry ----------
// Each body type has two photos (public/calculator/<id>-side.webp and <id>-top.webp, 1600 x 640,
// car facing left, transparent background) and a mask of its paintable body (<id>-<view>-paint.webp).
// The panel outlines are drawn in Illustrator over the photos (public/calculator/<id>-<view>.svg,
// read into data/calculator-geometry.ts by scripts/import_outlines.py); the right side is the left
// photo mirrored. Outlines carry full panel ids ("usa-fata-st"; the top view has both sides).
type Pt = [number, number]
export type SideGeometry = {
    panels: [string, string][]      // [panel id, SVG path of its outline on the left side photo]
    belt: Pt[]                      // window line, front to back: inscription covers what is below it
}
export type TopGeometry = { panels: [string, string][] }

// pieces wrapped only with a full wrap, and then always: the pillars between the windows and the
// sills under the doors. They are not picked; a full wrap adds them (painted and priced).
export const AUTO_FULL: PanelKind[] = ["stalp", "prag"]
export const isAuto = (id: string) => (AUTO_FULL as string[]).includes(panelKind(id))
export const autoPanels = (id: BodyId) => drawnPanels(id).filter(isAuto)
// the big vehicles have no photos: only the 3D model (side and top are null)
export type BodyType = { id: BodyId; label: string; side: SideGeometry | null; top: TopGeometry | null }

const labels: Record<BodyId, string> = {
    hatchback: "Hatchback", sedan: "Sedan", break: "Break", suv: "SUV", utilitara: "Utilitară",
    autocar: "Autocar", camion: "Cap tractor + semiremorcă",
}
const drawn = geometry as Partial<Record<BodyId, { side: unknown; top: unknown }>>
export const bodyTypes: BodyType[] = (Object.keys(labels) as BodyId[]).map(id => ({
    id,
    label: labels[id],
    side: (drawn[id]?.side ?? null) as SideGeometry | null,
    top: (drawn[id]?.top ?? null) as TopGeometry | null,
}))
export const hasDrawing = (id: BodyId) => bodyType(id).side !== null

// panels of the vehicles drawn only in 3D ("-st"/"-dr" added for the side ones)
const PANELS_3D: Partial<Record<BodyId, { shared: PanelKind[]; sides: PanelKind[] }>> = {
    autocar: { shared: ["fata", "spate", "plafon"], sides: ["lateral-fata", "lateral-mijloc", "lateral-spate"] },
    camion: {
        shared: ["cabina-fata", "cabina-plafon", "remorca-fata", "remorca-spate", "remorca-plafon"],
        sides: ["cabina-usa", "cabina-lateral", "remorca-lateral-fata", "remorca-lateral-spate"],
    },
}

export const bodyType = (id: BodyId) => bodyTypes.find(b => b.id === id)!

// every panel id of a body type, both sides
export function panelsOf(id: BodyId): string[] {
    const only3d = PANELS_3D[id]
    if (only3d) return [...only3d.shared, ...only3d.sides.flatMap(k => [`${k}-st`, `${k}-dr`])]
    return drawnPanels(id).filter(p => !isAuto(p))
}
// every panel drawn on the photos: the left side (and its mirror for the right) and the top view
function drawnPanels(id: BodyId): string[] {
    const b = bodyType(id)
    const ids = [...b.side!.panels.map(p => p[0]), ...b.top!.panels.map(p => p[0])]
    const both = ids.flatMap(p => p.endsWith("-st") ? [p, p.replace(/-st$/, "-dr")] : [p])
    return [...new Set(both)]
}
export const sidePanels = (id: BodyId) => panelsOf(id).filter(p => /-(st|dr)$/.test(p))

// ---------- prices (lei, PROVISIONAL) ----------
// colantare per panel and body type; inscription and logo as shares / add-ons of it
const base: Partial<Record<PanelKind, number>> = {
    "bara-fata": 350, "bara-spate": 350, capota: 450, plafon: 550, portbagaj: 400,
    "aripa-fata": 250, "usa-fata": 380, "usa-spate": 360, "aripa-spate": 300, oglinda: 90,
    "usa-culisanta": 520, "panou-lateral": 780,
}
const bodyFactor: Partial<Record<BodyId, number>> = { hatchback: 1, sedan: 1.1, break: 1.15, suv: 1.25, utilitara: 1.45 }
export const INSCRIPTION_SHARE = 0.55 // lower part only
export const LOGO_ADDON = 120          // per panel, on top of the full wrap

export function panelPrice(body: BodyId, panelId: string, mode: Mode) {
    const wrap = Math.round(((base[panelKind(panelId)] ?? 0) * (bodyFactor[body] ?? 1)) / 10) * 10
    if (mode === "inscriptionare") return Math.round((wrap * INSCRIPTION_SHARE) / 10) * 10
    if (mode === "logo") return wrap + LOGO_ADDON
    return wrap
}

export const films = [
    { id: "standard", label: "Standard (polimerică)", factor: 1 },
    { id: "premium", label: "Premium (turnată)", factor: 1.35 },
    { id: "speciala", label: "Specială (mat, satin, cameleon)", factor: 1.6 },
] as const
export const DESIGN_PRICE = 400        // custom graphic design, once
export const REMOVAL_PER_PANEL = 60    // removing old film, per selected panel

// ---------- car models: each maps to a body type ----------
export const models: { name: string; body: BodyId }[] = [
    { name: "Dacia Logan", body: "sedan" }, { name: "Dacia Sandero", body: "hatchback" }, { name: "Dacia Duster", body: "suv" },
    { name: "Dacia Jogger", body: "break" }, { name: "Dacia Spring", body: "hatchback" }, { name: "Dacia Bigster", body: "suv" },
    { name: "Renault Clio", body: "hatchback" }, { name: "Renault Megane", body: "hatchback" }, { name: "Renault Captur", body: "suv" },
    { name: "Renault Kangoo", body: "utilitara" }, { name: "Renault Trafic", body: "utilitara" }, { name: "Renault Master", body: "utilitara" },
    { name: "Skoda Fabia", body: "hatchback" }, { name: "Skoda Octavia", body: "sedan" }, { name: "Skoda Octavia Combi", body: "break" },
    { name: "Skoda Superb", body: "sedan" }, { name: "Skoda Karoq", body: "suv" }, { name: "Skoda Kodiaq", body: "suv" },
    { name: "Volkswagen Polo", body: "hatchback" }, { name: "Volkswagen Golf", body: "hatchback" }, { name: "Volkswagen Passat", body: "break" },
    { name: "Volkswagen Tiguan", body: "suv" }, { name: "Volkswagen Transporter", body: "utilitara" }, { name: "Volkswagen Crafter", body: "utilitara" },
    { name: "Ford Focus", body: "hatchback" }, { name: "Ford Kuga", body: "suv" }, { name: "Ford Transit Custom", body: "utilitara" },
    { name: "Ford Transit", body: "utilitara" }, { name: "Toyota Yaris", body: "hatchback" }, { name: "Toyota Corolla", body: "sedan" },
    { name: "Toyota C-HR", body: "suv" }, { name: "Toyota RAV4", body: "suv" }, { name: "Hyundai i30", body: "hatchback" },
    { name: "Hyundai Tucson", body: "suv" }, { name: "Kia Ceed", body: "hatchback" }, { name: "Kia Sportage", body: "suv" },
    { name: "Peugeot 208", body: "hatchback" }, { name: "Peugeot 3008", body: "suv" }, { name: "Opel Astra", body: "hatchback" },
    { name: "Mercedes-Benz Clasa C", body: "sedan" }, { name: "Mercedes-Benz Clasa E", body: "sedan" }, { name: "Mercedes-Benz Vito", body: "utilitara" },
    { name: "Mercedes-Benz Sprinter", body: "utilitara" }, { name: "BMW Seria 3", body: "sedan" }, { name: "BMW X5", body: "suv" },
    { name: "Audi A4", body: "sedan" }, { name: "Audi Q5", body: "suv" }, { name: "Fiat Ducato", body: "utilitara" },
    { name: "Tesla Model 3", body: "sedan" }, { name: "Tesla Model Y", body: "suv" },
    { name: "Mercedes-Benz Tourismo", body: "autocar" }, { name: "Setra ComfortClass", body: "autocar" }, { name: "MAN Lion's Coach", body: "autocar" },
    { name: "Iveco Evadys", body: "autocar" }, { name: "Mercedes-Benz Actros", body: "camion" }, { name: "MAN TGX", body: "camion" },
    { name: "Volvo FH", body: "camion" }, { name: "Scania R / S", body: "camion" }, { name: "DAF XF", body: "camion" },
    { name: "Renault Trucks T", body: "camion" }, { name: "Iveco S-Way", body: "camion" },
]
