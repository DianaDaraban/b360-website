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

// ---------- photo geometry ----------
// Each body type has two photos (public/calculator/<id>-side.webp and <id>-top.webp), 1600 x 640,
// car facing left on a transparent background. Panels are outlined on the photo in those pixel
// coordinates; the colour is laid only over the car itself (the photo's alpha) in multiply mode,
// so the car's own light and shadow show through like a real film. The right side is the left
// photo mirrored.
type Pt = [number, number]
export type SideGeometry = {
    panels: [PanelKind, Pt[]][]   // each panel's outline on the side photo
    belt: Pt[]                    // window line, front to back: inscription covers what is below it
}
export type TopGeometry = {
    // vertical bands on the top photo: [panel kind, x from, x to]; glass between them is skipped
    panels: [PanelKind, number, number][]
}
export type BodyType = { id: BodyId; label: string; side: SideGeometry; top: TopGeometry }

export const bodyTypes: BodyType[] = [
    {
        id: "hatchback",
        label: "Hatchback",
        side: {
            panels: [
                ["bara-fata", [[95, 330], [200, 320], [240, 410], [240, 530], [95, 525]]],
                ["aripa-fata", [[130, 290], [440, 262], [505, 275], [500, 330], [512, 505], [480, 530], [240, 530], [240, 410], [200, 320]]],
                ["usa-fata", [[505, 275], [555, 240], [700, 125], [895, 115], [885, 500], [512, 505], [500, 330]]],
                ["usa-spate", [[895, 115], [1155, 125], [1245, 240], [1230, 330], [1180, 420], [1100, 495], [885, 500]]],
                ["aripa-spate", [[1155, 125], [1320, 125], [1440, 230], [1475, 270], [1495, 390], [1420, 400], [1300, 370], [1200, 420], [1100, 495], [1180, 420], [1230, 330], [1245, 240]]],
                ["bara-spate", [[1420, 400], [1495, 390], [1505, 460], [1490, 520], [1400, 525], [1395, 450]]],
                ["oglinda", [[555, 240], [590, 222], [615, 232], [605, 288], [560, 280]]],
            ],
            belt: [[0, 282], [510, 278], [890, 258], [1245, 245], [1600, 240]],
        },
        top: { panels: [["bara-fata", 173, 225], ["capota", 225, 464], ["plafon", 712, 1248], ["portbagaj", 1248, 1400], ["bara-spate", 1400, 1430]] },
    },
    {
        id: "sedan",
        label: "Sedan",
        side: {
            panels: [
                ["bara-fata", [[50, 330], [140, 330], [195, 420], [195, 530], [50, 530]]],
                ["aripa-fata", [[140, 270], [470, 255], [468, 330], [478, 470], [460, 530], [200, 530], [195, 420], [140, 330]]],
                ["usa-fata", [[470, 255], [520, 240], [650, 140], [860, 125], [850, 500], [500, 512], [480, 480], [468, 330]]],
                ["usa-spate", [[860, 125], [1110, 130], [1230, 250], [1220, 330], [1170, 400], [1110, 470], [1060, 500], [850, 500]]],
                ["aripa-spate", [[1110, 130], [1380, 225], [1515, 240], [1495, 370], [1340, 385], [1130, 505], [1060, 505], [1110, 470], [1170, 400], [1220, 330], [1232, 250]]],
                ["bara-spate", [[1340, 385], [1495, 370], [1550, 385], [1545, 520], [1360, 525]]],
                ["oglinda", [[500, 262], [525, 235], [580, 232], [580, 282], [505, 285]]],
            ],
            belt: [[0, 272], [500, 272], [860, 262], [1230, 255], [1600, 250]],
        },
        top: { panels: [["bara-fata", 124, 175], ["capota", 175, 464], ["plafon", 672, 1104], ["portbagaj", 1320, 1448], ["bara-spate", 1448, 1480]] },
    },
    {
        id: "break",
        label: "Break",
        side: {
            panels: [
                ["bara-fata", [[55, 350], [170, 345], [205, 430], [205, 540], [55, 525]]],
                ["aripa-fata", [[100, 330], [420, 285], [490, 290], [488, 350], [500, 520], [470, 545], [205, 540], [205, 430], [170, 345]]],
                ["usa-fata", [[490, 290], [540, 250], [690, 150], [870, 145], [850, 515], [500, 520], [488, 350]]],
                ["usa-spate", [[870, 145], [1155, 150], [1220, 255], [1210, 340], [1150, 420], [1105, 510], [850, 515]]],
                ["aripa-spate", [[1155, 150], [1345, 150], [1440, 225], [1500, 260], [1520, 330], [1525, 400], [1400, 410], [1300, 380], [1180, 450], [1105, 510], [1150, 420], [1210, 340], [1220, 255]]],
                ["bara-spate", [[1400, 410], [1525, 400], [1550, 430], [1545, 520], [1380, 530], [1370, 460]]],
                ["oglinda", [[540, 262], [560, 245], [595, 248], [590, 290], [545, 288]]],
            ],
            belt: [[0, 295], [495, 290], [865, 275], [1220, 265], [1600, 260]],
        },
        top: { panels: [["bara-fata", 133, 185], ["capota", 185, 416], ["plafon", 648, 1304], ["portbagaj", 1304, 1440], ["bara-spate", 1440, 1470]] },
    },
    {
        id: "suv",
        label: "SUV",
        side: {
            panels: [
                ["bara-fata", [[60, 330], [160, 310], [220, 370], [225, 500], [60, 500]]],
                ["aripa-fata", [[95, 285], [420, 215], [510, 220], [505, 300], [512, 450], [480, 480], [225, 480], [220, 370], [160, 310]]],
                ["usa-fata", [[510, 220], [560, 175], [700, 75], [905, 65], [895, 440], [512, 450], [505, 300]]],
                ["usa-spate", [[905, 65], [1185, 75], [1245, 180], [1250, 300], [1210, 330], [1140, 420], [890, 440]]],
                ["aripa-spate", [[1185, 75], [1300, 70], [1390, 90], [1460, 180], [1500, 240], [1520, 380], [1420, 390], [1320, 330], [1250, 300], [1245, 180]]],
                ["bara-spate", [[1420, 390], [1520, 380], [1540, 440], [1520, 500], [1400, 505]]],
                ["oglinda", [[560, 190], [600, 165], [630, 180], [625, 225], [565, 220]]],
            ],
            belt: [[0, 225], [510, 222], [900, 210], [1245, 200], [1600, 195]],
        },
        top: { panels: [["bara-fata", 171, 225], ["capota", 225, 464], ["plafon", 688, 1240], ["portbagaj", 1240, 1405], ["bara-spate", 1405, 1430]] },
    },
    {
        id: "utilitara",
        label: "Utilitară",
        side: {
            panels: [
                ["bara-fata", [[135, 400], [250, 395], [255, 470], [250, 545], [135, 540]]],
                ["aripa-fata", [[150, 370], [190, 330], [300, 300], [355, 345], [355, 440], [420, 500], [430, 545], [255, 545], [255, 470], [250, 395], [135, 400]]],
                ["usa-fata", [[300, 300], [460, 180], [600, 162], [595, 420], [575, 530], [430, 545], [420, 500], [355, 440], [355, 345]]],
                ["usa-culisanta", [[605, 40], [930, 35], [930, 540], [580, 540], [600, 420]]],
                ["panou-lateral", [[930, 35], [1385, 30], [1420, 45], [1450, 300], [1450, 425], [1305, 425], [1250, 470], [1190, 500], [1130, 540], [930, 540]]],
                ["bara-spate", [[1305, 425], [1460, 425], [1465, 535], [1320, 540], [1300, 470]]],
                ["oglinda", [[365, 265], [385, 262], [395, 330], [370, 340], [360, 300]]],
            ],
            belt: [[0, 340], [600, 335], [1600, 335]],
        },
        top: { panels: [["bara-fata", 91, 140], ["capota", 140, 240], ["plafon", 419, 1500]] },
    },
]

export const bodyType = (id: BodyId) => bodyTypes.find(b => b.id === id)!

// every panel id of a body type, both sides
export function panelsOf(id: BodyId) {
    const b = bodyType(id)
    const shared = ["bara-fata", "bara-spate", ...b.top.panels.map(p => p[0]).filter(k => k === "capota" || k === "plafon" || k === "portbagaj")]
    const sides = b.side.panels.map(p => p[0]).filter(k => k !== "bara-fata" && k !== "bara-spate")
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
