// Imports the work photos, stock photos and client logos from the local WordPress install into
// public/, as resized WebP, and writes data/lucrari.json for the portfolio gallery.
// usage: node scripts/import-wp-images.mjs [uploadsDir]
import sharp from "sharp"
import fs from "node:fs"
import path from "node:path"

const UPLOADS = process.argv[2] ?? "C:/Users/didar/Local Sites/b360ro/app/public/wp-content/uploads/2025"
const ROOT = path.resolve(import.meta.dirname, "..")
const MAX_W = 1600

// Work photos are named <Type>_<subtype>_<Client>[_n].webp; the subtype gives the gallery category
const CATEGORIES = [
    [/^Inscriptionare_autoturism_/, "autoturisme"],
    [/^Inscriptionare_autotutilitare_/, "autoutilitare"],
    [/^Inscriptionare_autocar_/, "autocare"],
    [/^Inscriptionare_(camioane|cisterne)_/, "camioane"],
    [/^Inscriptionare_(motociclete|barca|avioane)/, "speciale"],
    [/^Folii_Vitrate_/, "vitrine"],
    [/^Signalistica_/, "signalistica"],
    [/^Stickere_/, "stickere"],
]

// Stock photos used for heroes and service cards (name in public/img → source file)
const STOCK = {
    "hero-graffiti": "11/colorful-graffiti-car.jpg",
    "hero-dragon": "11/black-sports-car-showcasing-vibrant-dragon-painted-design-its-sleek-body-exotic-sports-car-with-dragon-decal-ai-generated.jpg",
    "wrap-hands": "11/person-applying-car-wrap-vinyl-side-suv-closeup-their-hands-tools.jpg",
    "wrap-green": "11/car-atv-wrapping-specialists-wrapping-vehicle-with-green-vinyl-film-foil.jpg",
    "wrap-salon": "11/auto-service-salon-doign-car-wrapping.jpg",
    "wrap-fan": "11/car-wrapping-with-foil-drying-with-fan-car-service-1.jpg",
    "colorful-convertible": "11/colorful-abstract-design-black-convertible-car.jpg",
    "racing-stripes": "11/create-several-design-variants-hood-fender-featuring-classic-racing-stripes-paired-with.jpg",
    "storefront-stickers": "11/stickers-storefront-glass.jpg",
    "letters-3d": "11/close-up-view-lots-3d-blue-alphabet-letters.jpg",
    "rally-side": "11/side-view-rally-car-white-background.jpg",
}

const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
// "Inscriptionare_autoturism_Tiriac_Auto_12" → "Tiriac Auto"
const clientName = base => base
    .replace(/^(Inscriptionare_[a-z]+|Folii_Vitrate|Signalistica|Stickere)_?/, "")
    .replace(/_?\d+$/, "")
    .replace(/_/g, " ")
    .trim()

async function toWebp(src, dest, maxW = MAX_W) {
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    const info = await sharp(src).rotate().resize({ width: maxW, withoutEnlargement: true }).webp({ quality: 78 }).toFile(dest)
    return { w: info.width, h: info.height }
}

const dir = path.join(UPLOADS, "11")
// Skip WordPress' "-scaled" copies and size variants; keep the originals
const files = fs.readdirSync(dir).filter(f => !/-scaled\.|-\d+x\d+\./.test(f))

const lucrari = []
for (const f of files) {
    const base = f.replace(/\.[a-z]+$/, "")
    const cat = CATEGORIES.find(([re]) => re.test(base))?.[1]
    if (!cat) continue
    const out = `lucrari/${cat}/${slug(base.replace(/^(Inscriptionare_[a-z]+|Folii_Vitrate|Signalistica|Stickere)_?/, "") || base)}.webp`
    const { w, h } = await toWebp(path.join(dir, f), path.join(ROOT, "public", out))
    const client = clientName(base)
    lucrari.push({ src: `/${out}`, cat, client: client || null, w, h })
}
lucrari.sort((a, b) => a.cat.localeCompare(b.cat) || a.src.localeCompare(b.src, "ro", { numeric: true }))
fs.mkdirSync(path.join(ROOT, "data"), { recursive: true })
fs.writeFileSync(path.join(ROOT, "data/lucrari.json"), JSON.stringify(lucrari, null, 1) + "\n")

for (const [name, src] of Object.entries(STOCK)) await toWebp(path.join(UPLOADS, src), path.join(ROOT, "public/img", `${name}.webp`), 2000)

// Client logos (white on transparent, 300×139)
for (const f of files.filter(f => f.endsWith(".png") && !/LOGO_B360|logo-uncode|signature/.test(f)))
    await sharp(path.join(dir, f)).toFile(path.join(ROOT, "public/clienti", f.replace(".png", ".webp")).replace(/^/, () => (fs.mkdirSync(path.join(ROOT, "public/clienti"), { recursive: true }), "")))

fs.copyFileSync(path.join(dir, "LOGO_B360-01.svg"), path.join(ROOT, "public/logo.svg"))
fs.copyFileSync(path.join(dir, "LOGO_B360_white-01.svg"), path.join(ROOT, "public/logo-white.svg"))

const counts = lucrari.reduce((m, l) => ({ ...m, [l.cat]: (m[l.cat] ?? 0) + 1 }), {})
console.log(lucrari.length, "work photos", counts)
