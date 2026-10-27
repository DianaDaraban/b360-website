// Client logos in their own colours, from the vector files in ../logo-uri: each SVG becomes
// public/clienti/<logo>.webp (trimmed, transparent, at most 600×300) and its aspect ratio goes to
// data/clienti-logos.json, which sizes it on the round sticker.
// usage: node scripts/import-client-logos.mjs [svgDir] [outDir]
import sharp from "sharp"
import fs from "node:fs"
import path from "node:path"

const ROOT = path.resolve(import.meta.dirname, "..")
const SRC = process.argv[2] ?? path.resolve(ROOT, "../logo-uri")
const OUT = process.argv[3] ?? path.join(ROOT, "public/clienti")

// vector file → logo name in data/clienti.ts
const FILES = {
    "Crucea Rosie Romania Logo Vector-01.svg": "crucea-rosie",
    "HANDBAL_CLUB_BUZAU-01.svg": "handbal-club-buzau",
    "Hello_Holidays-01.svg": "hello-holidays",
    "Iveco-Logo.wine.svg": "iveco",
    "Julius_Meinl-Logo.wine.svg": "julius-meinl",
    "Mercedes-Benz-01.svg": "mercedes-benz",
    "OPTIMAL_SOLUTIONS-01.svg": "optimal-solutions",
    "STB-01.svg": "stb",
    "TIRIAC_AUTO-01.svg": "tiriac-auto",
    "TRANSFERO-01.svg": "transfero",
    "TheHome-01.svg": "the-home",
    "castrol-seeklogo-01.svg": "castrol",
    "city_grill-01.svg": "city-grill",
    "draper-tools-uganda-seeklogo-01.svg": "draper-tools",
    "fc-universitatea-craiova--2008--vector-logo-01.svg": "fc-u-craiova",
    "flixbus-seeklogo.svg": "flixbus",
    "holcim-seeklogo.svg": "holcim",
    "man-seeklogo-01.svg": "man",
    "netafim-vector-logo.svg": "netafim",
    "ravitex-01.svg": "ravitex",
    "stadler-01.svg": "stadler",
    "top_smart-01.svg": "top-smart",
    "wipro-new-seeklogo-01.svg": "wipro",
}

const aspectsFile = path.join(ROOT, "data/clienti-logos.json")
const aspects = JSON.parse(fs.readFileSync(aspectsFile, "utf8"))
fs.mkdirSync(OUT, { recursive: true })

// logos drawn on a white box of their own: the white is made transparent, so the beige disc shows through
const WHITE_BOX = new Set(["castrol"])

// rendered large, then trimmed to the drawing, so the artboard margins do not shrink the logo;
// a vector drawn small is rendered again at a higher density until it fills 600×300
async function render(file, density = 300) {
    const png = await sharp(path.join(SRC, file), { density }).trim().png().toBuffer()
    const { width, height } = await sharp(png).metadata()
    const short = Math.min(600 / width, 300 / height)
    return short > 1.05 && density < 2400 ? render(file, Math.min(2400, Math.ceil(density * short))) : png
}

async function knockOutWhite(png) {
    const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
    for (let i = 0; i < data.length; i += 4) {
        // the lighter the pixel, the more transparent: keeps the antialiased edges smooth
        const light = Math.min(data[i], data[i + 1], data[i + 2])
        if (light > 200) data[i + 3] = Math.round(data[i + 3] * Math.max(0, (255 - light) / 55))
    }
    return sharp(data, { raw: info }).trim().png().toBuffer()
}

for (const [file, logo] of Object.entries(FILES)) {
    let png = await render(file)
    if (WHITE_BOX.has(logo)) png = await knockOutWhite(png)
    const { data, info } = await sharp(png).resize(600, 300, { fit: "inside", withoutEnlargement: true }).webp({ quality: 90, alphaQuality: 100 }).toBuffer({ resolveWithObject: true })
    fs.writeFileSync(path.join(OUT, `${logo}.webp`), data)
    aspects[logo] = Math.round((info.width / info.height) * 1000) / 1000
    console.log(logo.padEnd(22), `${info.width}×${info.height}`)
}

if (OUT === path.join(ROOT, "public/clienti"))
    // same layout as the file already has: one "name": ratio per line, sorted
    fs.writeFileSync(aspectsFile, `{\n${Object.entries(aspects).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `"${k}": ${Number.isInteger(v) ? v.toFixed(1) : v}`).join(",\n")}\n}\n`)
