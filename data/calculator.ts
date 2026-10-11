// Calculator data: body types (with the drawing geometry), panels, prices and car models.
// Prices: one price per panel per body type; inscription and logo are separate rates.
// PROVISIONAL values until B360 sends the real price list (see PRICES_PROVISIONAL).

export type BodyId = "hatchback" | "sedan" | "break" | "suv" | "utilitara"
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
    | "usa-culisanta" | "panou-lateral"

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
}

export const panelLabel = (id: string) => {
    const side = id.endsWith("-st") ? " stânga" : id.endsWith("-dr") ? " dreapta" : ""
    return panelNames[id.replace(/-(st|dr)$/, "") as PanelKind] + side
}
export const panelKind = (id: string) => id.replace(/-(st|dr)$/, "") as PanelKind

// ---------- drawing geometry (viewBox 0 0 1000 420, car facing left, ground at y 388) ----------
type Pt = [number, number]
export type SideGeometry = {
    body: Pt[]                              // closed silhouette, smoothed when drawn
    windows: Pt[][]                         // side windows (not clickable)
    belt: number                            // window line: inscription stops here
    wheels: { x: number; y: number; r: number }[]
    // vertical strips, front to back: [panel kind, x from, x to]
    strips: [PanelKind, number, number][]
    mirror: [number, number, number, number] // x, y, w, h
}
export type TopGeometry = {
    length: number                          // x of the rear end
    strips: [PanelKind | "parbriz" | "luneta", number, number][]
}
export type BodyType = { id: BodyId; label: string; side: SideGeometry; top: TopGeometry }

export const bodyTypes: BodyType[] = [
    {
        id: "hatchback",
        label: "Hatchback",
        side: {
            body: [[62, 322], [80, 272], [280, 240], [400, 152], [660, 142], [800, 178], [858, 204], [878, 272], [880, 334], [860, 352], [100, 352]],
            windows: [
                [[300, 236], [404, 160], [536, 155], [536, 236]],
                [[548, 236], [548, 155], [690, 151], [790, 186], [800, 236]],
            ],
            belt: 236,
            wheels: [{ x: 212, y: 330, r: 56 }, { x: 735, y: 330, r: 56 }],
            strips: [["bara-fata", 40, 118], ["aripa-fata", 118, 296], ["usa-fata", 296, 542], ["usa-spate", 542, 742], ["aripa-spate", 742, 832], ["bara-spate", 832, 900]],
            mirror: [276, 218, 30, 18],
        },
        top: { length: 880, strips: [["bara-fata", 60, 108], ["capota", 108, 280], ["parbriz", 280, 400], ["plafon", 400, 800], ["portbagaj", 800, 862], ["bara-spate", 862, 880]] },
    },
    {
        id: "sedan",
        label: "Sedan",
        side: {
            body: [[62, 322], [78, 268], [300, 236], [420, 150], [630, 146], [770, 212], [920, 226], [944, 268], [946, 330], [920, 352], [100, 352]],
            windows: [
                [[318, 232], [424, 158], [540, 155], [540, 232]],
                [[552, 232], [552, 155], [626, 154], [748, 214], [748, 232]],
            ],
            belt: 232,
            wheels: [{ x: 225, y: 330, r: 58 }, { x: 780, y: 330, r: 58 }],
            strips: [["bara-fata", 40, 120], ["aripa-fata", 120, 312], ["usa-fata", 312, 548], ["usa-spate", 548, 742], ["aripa-spate", 742, 880], ["bara-spate", 880, 960]],
            mirror: [292, 214, 30, 18],
        },
        top: { length: 946, strips: [["bara-fata", 60, 110], ["capota", 110, 300], ["parbriz", 300, 420], ["plafon", 420, 630], ["luneta", 630, 770], ["portbagaj", 770, 900], ["bara-spate", 900, 946]] },
    },
    {
        id: "break",
        label: "Break",
        side: {
            body: [[62, 322], [78, 268], [300, 236], [420, 150], [820, 144], [918, 172], [940, 230], [944, 330], [920, 352], [100, 352]],
            windows: [
                [[318, 232], [424, 158], [540, 155], [540, 232]],
                [[552, 232], [552, 155], [700, 153], [700, 232]],
                [[712, 232], [712, 153], [818, 152], [900, 180], [906, 232]],
            ],
            belt: 232,
            wheels: [{ x: 225, y: 330, r: 58 }, { x: 785, y: 330, r: 58 }],
            strips: [["bara-fata", 40, 120], ["aripa-fata", 120, 312], ["usa-fata", 312, 548], ["usa-spate", 548, 706], ["aripa-spate", 706, 890], ["bara-spate", 890, 960]],
            mirror: [292, 214, 30, 18],
        },
        top: { length: 944, strips: [["bara-fata", 60, 110], ["capota", 110, 300], ["parbriz", 300, 420], ["plafon", 420, 880], ["portbagaj", 880, 922], ["bara-spate", 922, 944]] },
    },
    {
        id: "suv",
        label: "SUV",
        side: {
            body: [[60, 300], [72, 240], [300, 206], [410, 122], [800, 114], [900, 142], [930, 210], [934, 318], [910, 340], [90, 340]],
            windows: [
                [[318, 206], [414, 130], [545, 126], [545, 206]],
                [[558, 206], [558, 126], [720, 124], [720, 206]],
                [[732, 206], [732, 124], [800, 122], [886, 152], [896, 206]],
            ],
            belt: 206,
            wheels: [{ x: 220, y: 322, r: 66 }, { x: 775, y: 322, r: 66 }],
            strips: [["bara-fata", 40, 115], ["aripa-fata", 115, 312], ["usa-fata", 312, 552], ["usa-spate", 552, 726], ["aripa-spate", 726, 880], ["bara-spate", 880, 950]],
            mirror: [290, 188, 32, 20],
        },
        top: { length: 934, strips: [["bara-fata", 60, 110], ["capota", 110, 300], ["parbriz", 300, 410], ["plafon", 410, 860], ["portbagaj", 860, 912], ["bara-spate", 912, 934]] },
    },
    {
        id: "utilitara",
        label: "Utilitară",
        side: {
            body: [[60, 300], [70, 222], [190, 188], [300, 82], [950, 76], [960, 98], [962, 330], [940, 348], [90, 348]],
            windows: [[[205, 192], [305, 96], [390, 94], [390, 192]]],
            belt: 200,
            wheels: [{ x: 210, y: 328, r: 60 }, { x: 790, y: 328, r: 60 }],
            strips: [["bara-fata", 40, 110], ["aripa-fata", 110, 205], ["usa-fata", 205, 400], ["usa-culisanta", 400, 620], ["panou-lateral", 620, 905], ["bara-spate", 905, 980]],
            mirror: [180, 176, 30, 22],
        },
        top: { length: 962, strips: [["bara-fata", 60, 100], ["capota", 100, 190], ["parbriz", 190, 300], ["plafon", 300, 900], ["portbagaj", 900, 948], ["bara-spate", 948, 962]] },
    },
]

export const bodyType = (id: BodyId) => bodyTypes.find(b => b.id === id)!

// every panel id of a body type, both sides
export function panelsOf(id: BodyId) {
    const b = bodyType(id)
    const shared = ["bara-fata", "bara-spate", ...b.top.strips.map(s => s[0]).filter(k => k === "capota" || k === "plafon" || k === "portbagaj")]
    const sides = [...b.side.strips.map(s => s[0]).filter(k => k !== "bara-fata" && k !== "bara-spate"), "oglinda"]
    return [...new Set(shared), ...sides.flatMap(k => [`${k}-st`, `${k}-dr`])]
}
export const sidePanels = (id: BodyId) => panelsOf(id).filter(p => /-(st|dr)$/.test(p))

// ---------- prices (lei, PROVISIONAL) ----------
// colantare per panel and body type; inscription and logo as shares / add-ons of it
const base: Record<PanelKind, number> = {
    "bara-fata": 350, "bara-spate": 350, capota: 450, plafon: 550, portbagaj: 400,
    "aripa-fata": 250, "usa-fata": 380, "usa-spate": 360, "aripa-spate": 300, oglinda: 90,
    "usa-culisanta": 520, "panou-lateral": 780,
}
const bodyFactor: Record<BodyId, number> = { hatchback: 1, sedan: 1.1, break: 1.15, suv: 1.25, utilitara: 1.45 }
export const INSCRIPTION_SHARE = 0.55 // lower part only
export const LOGO_ADDON = 120          // per panel, on top of the full wrap

export function panelPrice(body: BodyId, panelId: string, mode: Mode) {
    const wrap = Math.round((base[panelKind(panelId)] * bodyFactor[body]) / 10) * 10
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
]
