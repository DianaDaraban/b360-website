import "server-only"
import sharp, { type OverlayOptions } from "sharp"

// The gallery look, applied to every photo uploaded from /admin (the same edit as the existing photos):
// white balance, exposure, contrast, a little more colour and warmth; then, unless `plain`, a blur that
// grows gradually toward the edges of the frame; and a dark round gradient, clear in the middle and
// 80% toward the corners. The subject is assumed to be in the middle of the photo.
const MAX = 1600
const INK = "rgb(22,18,20)"

// the dark gradient: clear up to a third of the way out, then 80% at the corners (same curve as the scripts)
function gradientSvg(w: number, h: number) {
    const stops = [0, 0.2, 0.4, 0.6, 0.8, 1].map(t => {
        const d = 0.32 + t * 0.82                                   // distance in the scripts' units
        const o = Math.min(1, 0.877 * d)                            // the same point as an SVG gradient offset
        const a = Math.pow(Math.min(1, Math.max(0, (d - 0.32) / 0.8)), 1.3) * 0.8
        return `<stop offset="${o.toFixed(3)}" stop-color="${INK}" stop-opacity="${a.toFixed(3)}"/>`
    })
    return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><defs><radialGradient id="g" cx="0.5" cy="0.5" r="0.707">${stops.join("")}</radialGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>`)
}

// where the blurred copy shows: nothing in the middle, fully at the edges
function blurMaskSvg(w: number, h: number) {
    return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><defs><radialGradient id="m" cx="0.5" cy="0.5" r="0.707"><stop offset="0.32" stop-color="#fff" stop-opacity="0"/><stop offset="0.6" stop-color="#fff" stop-opacity="0.7"/><stop offset="0.85" stop-color="#fff" stop-opacity="1"/></radialGradient></defs><rect width="100%" height="100%" fill="url(#m)"/></svg>`)
}

export async function editPhoto(input: Buffer, plain = false): Promise<{ data: Buffer; width: number; height: number }> {
    const base = sharp(input).rotate().resize({ width: MAX, height: MAX, fit: "inside", withoutEnlargement: true })
    const { data: rgb, info } = await base.clone().removeAlpha().raw().toBuffer({ resolveWithObject: true })
    const { width: w, height: h } = info

    // white balance (35% toward grey), exposure (mean brightness gently toward the middle), contrast 1.08, warmth
    const stats = await sharp(rgb, { raw: info }).stats()
    const means = stats.channels.slice(0, 3).map(c => c.mean)
    const grey = (means[0] + means[1] + means[2]) / 3
    const lum = 0.299 * means[0] + 0.587 * means[1] + 0.114 * means[2]
    const exposure = Math.min(1.2, Math.max(0.88, Math.pow(118 / Math.max(lum, 1), 0.45)))
    const warmth = [1.015, 1, 0.985]
    const contrast = 1.08
    const mult = means.map((m, i) => (1 + 0.35 * (grey / Math.max(m, 1) - 1)) * exposure * warmth[i] * contrast)
    const add = mult.map(() => 128 * (1 - contrast))
    const graded = await sharp(rgb, { raw: info }).linear(mult, add).modulate({ saturation: 1.12 }).png().toBuffer()

    const layers: OverlayOptions[] = []
    if (!plain) {
        const blurred = await sharp(graded).blur(9).composite([{ input: blurMaskSvg(w, h), blend: "dest-in" }]).png().toBuffer()
        layers.push({ input: blurred })
    }
    layers.push({ input: gradientSvg(w, h) })
    const data = await sharp(graded).composite(layers).webp({ quality: 84 }).toBuffer()
    return { data, width: w, height: h }
}
