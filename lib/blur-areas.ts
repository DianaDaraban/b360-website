import "server-only"
import sharp, { type OverlayOptions } from "sharp"

// Blurs the given areas of a photo (licence plates, faces), before the gallery edit. Areas are in
// fractions of the photo as the admin saw it upright. Each is grown a little, pixelated, softened
// and laid back with a soft edge, so nothing can be read and it still sits in the photo.
export type Area = { x: number; y: number; w: number; h: number }

export async function blurAreas(input: Buffer, areas: Area[]): Promise<Buffer> {
    if (!areas.length) return input
    const upright = await sharp(input).rotate().toBuffer()
    const { width: W = 0, height: H = 0 } = await sharp(upright).metadata()
    const layers: OverlayOptions[] = []
    for (const a of areas) {
        const grow = 0.18 * Math.max(a.w * W, a.h * H)
        const left = Math.max(0, Math.round(a.x * W - grow)), top = Math.max(0, Math.round(a.y * H - grow))
        const width = Math.min(W - left, Math.round(a.w * W + 2 * grow)), height = Math.min(H - top, Math.round(a.h * H + 2 * grow))
        if (width < 4 || height < 4) continue
        const cells = Math.max(2, Math.round(width / 10))
        const small = await sharp(upright).extract({ left, top, width, height }).resize(cells, Math.max(1, Math.round((cells * height) / width)), { fit: "fill" }).toBuffer()
        const g = Math.max(2, Math.round(Math.min(width, height) / 6))
        const patch = await sharp(small).resize(width, height, { fit: "fill", kernel: "cubic" }).blur(g).removeAlpha().toBuffer()
        // a soft-edged mask: full inside, fading over the grown border
        const e = Math.max(1, Math.round(grow / 2))
        const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><defs><filter id="f"><feGaussianBlur stdDeviation="${Math.max(1, e / 2)}"/></filter></defs><rect x="${e}" y="${e}" width="${Math.max(1, width - 2 * e)}" height="${Math.max(1, height - 2 * e)}" rx="${e}" fill="#fff" filter="url(#f)"/></svg>`)
        const alpha = await sharp(mask).resize(width, height).extractChannel("alpha").toBuffer()
        layers.push({ input: await sharp(patch).joinChannel(alpha).png().toBuffer(), left, top })
    }
    return sharp(upright).composite(layers).jpeg({ quality: 92 }).toBuffer()
}
