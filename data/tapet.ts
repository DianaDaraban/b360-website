// Printed wallpaper calculator: the questions and the prices. Prices in lei without VAT, per square
// metre of printed material, fitting included. A room type whose price is null is shown as "în curând".

export type Room = "casa" | "umed" | "comercial"
export type ImageSource = "am" | "catalog" | "noi"
export type Place = "local" | "alt"
export type Finish = "canvas" | "zugravit"

export const ROOMS: { id: Room; label: string; hint: string }[] = [
    { id: "casa", label: "Cameră de locuit", hint: "Living, dormitor, camera copiilor, hol, birou acasă" },
    { id: "umed", label: "Bucătărie sau baie", hint: "Alegem un material care rezistă la abur și umezeală" },
    { id: "comercial", label: "Birou, restaurant sau magazin", hint: "Material rezistent la trafic și la curățare deasă" },
]

export const IMAGE_SOURCES: { id: ImageSource; label: string; hint: string }[] = [
    { id: "am", label: "Am imaginea mea", hint: "O fotografie sau o grafică: o verificăm gratuit înainte de print" },
    { id: "catalog", label: "Aleg din catalogul B360", hint: "Peste 200 de modele, de la colecția Designer și tropical la picturi clasice: le vezi pe loc pe pereții tăi" },
    { id: "noi", label: "Vreau o grafică făcută de voi", hint: "Ne spui ce îți dorești și o creăm de la zero" },
]

// the wallpaper is applied like vinyl, with professional tools: the fitting is always ours
export const PLACES: { id: Place; label: string; hint: string }[] = [
    { id: "local", label: "București sau Ilfov", hint: "Venim noi la montaj" },
    { id: "alt", label: "Alt oraș", hint: "Venim și în alte orașe: calculăm transportul în ofertă" },
]

// the two looks of the wallpaper for living rooms (same price)
export const FINISHES: { id: Finish; label: string; hint: string }[] = [
    { id: "canvas", label: "Aspect canvas", hint: "Cu împletitura pânzei în relief: imaginea arată ca un tablou pictat" },
    { id: "zugravit", label: "Aspect perete zugrăvit", hint: "Mat, cu ușoare denivelări ca de tencuială: imaginea pare pictată direct pe perete" },
]

export type OpeningKind = "usa" | "fereastra"
export const OPENINGS: Record<OpeningKind, { label: string; w: number; h: number; y: number }> = {
    usa: { label: "Ușă", w: 90, h: 210, y: 0 },
    fereastra: { label: "Fereastră", w: 120, h: 140, y: 90 },
}

export const TAPET = {
    rollCm: 137,            // the material is printed in strips this wide, laid side by side on the wall
    overlapCm: 3,           // neighbouring strips overlap by this much
    bleedCm: 5,             // printed beyond each edge of the wall and trimmed at fitting
    printLossM: 1,          // roll length lost at the printer, once per order
    // print, material and fitting, per square metre of material, lei without VAT; null = coming soon
    pricePerMp: { casa: 220, umed: null, comercial: null } as Record<Room, number | null>,
    vat: 0.21,
}
export const roomReady = (room: Room) => TAPET.pricePerMp[room] != null

// sizes in centimetres; an opening's x is from the wall's left edge, y from the floor
export type Opening = { kind: OpeningKind; w: number; h: number; x: number; y: number }
export type Wall = { w: number; h: number; openings: Opening[] }

// the part of an opening that is on the wall
const openingArea = (wall: Wall, o: Opening) => {
    const w = Math.max(0, Math.min(o.x + o.w, wall.w) - Math.max(o.x, 0))
    const h = Math.max(0, Math.min(o.y + o.h, wall.h) - Math.max(o.y, 0))
    return (w * h) / 10000
}
export const grossArea = (walls: Wall[]) => walls.reduce((s, x) => s + (x.w * x.h) / 10000, 0)
export const openingsArea = (walls: Wall[]) => walls.reduce((s, x) => s + x.openings.reduce((t, o) => t + openingArea(x, o), 0), 0)
export const netArea = (walls: Wall[]) => grossArea(walls) - openingsArea(walls)

// the material a wall takes: whole strips across its width plus the side margins, overlapping their
// neighbours, each as tall as the wall plus the margins (doors and windows are cut out at fitting,
// the strips are printed whole); the order adds the roll lost at the printer
export const stripsOf = (wall: Wall) =>
    Math.max(1, Math.ceil((wall.w + 2 * TAPET.bleedCm - TAPET.overlapCm) / (TAPET.rollCm - TAPET.overlapCm)))
export const materialArea = (walls: Wall[]) =>
    walls.length === 0 ? 0
        : walls.reduce((s, x) => s + (stripsOf(x) * TAPET.rollCm * (x.h + 2 * TAPET.bleedCm)) / 10000, 0) + (TAPET.printLossM * TAPET.rollCm) / 100

// the price without VAT, or null while the room type has no price yet
export function estimateTapet(walls: Wall[], room: Room) {
    const price = TAPET.pricePerMp[room]
    if (price == null) return null
    const net = Math.round(materialArea(walls) * price)
    return { net, gross: Math.round(net * (1 + TAPET.vat)) }
}

// how sharp the image will be on the wall (the image covers the wall, as in the preview), in dots
// per inch of wall; wallpaper is seen from a metre or more away, so ~100 dpi already looks sharp
export function wallDpi(img: { w: number; h: number }, wall: { w: number; h: number }) {
    return Math.min(img.w / (wall.w / 2.54), img.h / (wall.h / 2.54))
}
