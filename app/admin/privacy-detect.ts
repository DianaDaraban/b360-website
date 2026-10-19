// Finds licence plates and faces in a photo, in the browser (admin only), so they can be blurred
// before the photo goes up. Two small open models (public/models): a YOLOv9 plate detector
// (open-image-models, MIT) and YuNet for faces (OpenCV zoo). onnxruntime-web is loaded from a CDN
// the first time, so it never weighs on the public pages.
// A box is in fractions of the photo (0..1), so it does not depend on the size it is shown at.

export type Box = { x: number; y: number; w: number; h: number; kind: "plate" | "face" | "manual"; on: boolean; score: number }

type Ort = {
    env: { wasm: { wasmPaths: string } }
    InferenceSession: { create(url: string, o?: object): Promise<Session> }
    Tensor: new (type: "float32", data: Float32Array, dims: number[]) => unknown
}
type Session = { inputNames: string[]; run(feeds: Record<string, unknown>): Promise<Record<string, { data: Float32Array; dims: number[] }>> }

const ORT = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.20.1/dist/"
let ready: Promise<{ ort: Ort; plates: Session; faces: Session }> | null = null

function load() {
    ready ??= (async () => {
        const w = window as unknown as { ort?: Ort }
        if (!w.ort) {
            await new Promise<void>((resolve, reject) => {
                const s = document.createElement("script")
                s.src = ORT + "ort.min.js"
                s.onload = () => resolve()
                s.onerror = () => reject(new Error("detector"))
                document.head.appendChild(s)
            })
        }
        const ort = w.ort!
        ort.env.wasm.wasmPaths = ORT
        const [plates, faces] = await Promise.all([
            ort.InferenceSession.create("/models/plates.onnx"),
            ort.InferenceSession.create("/models/faces.onnx"),
        ])
        return { ort, plates, faces }
    })()
    return ready
}

// the photo letterboxed into a size x size square (top-left for YuNet, centred for the plate model)
function square(img: ImageBitmap, size: number, centre: boolean) {
    const r = Math.min(size / img.width, size / img.height)
    const w = Math.round(img.width * r), h = Math.round(img.height * r)
    const dx = centre ? (size - w) / 2 : 0, dy = centre ? (size - h) / 2 : 0
    const c = document.createElement("canvas")
    c.width = c.height = size
    const g = c.getContext("2d")!
    g.fillStyle = "rgb(114,114,114)"
    g.fillRect(0, 0, size, size)
    g.drawImage(img, dx, dy, w, h)
    return { px: g.getImageData(0, 0, size, size).data, r, dx, dy }
}

function iou(a: Box, b: Box) {
    const x = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x))
    const y = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y))
    return (x * y) / (a.w * a.h + b.w * b.h - x * y)
}

export async function detect(img: ImageBitmap): Promise<Box[]> {
    const { ort, plates, faces } = await load()
    const W = img.width, H = img.height
    const out: Box[] = []

    // plates: RGB 0..1, centred letterbox, rows [batch, x1, y1, x2, y2, class, score]
    {
        const S = 640, { px, r, dx, dy } = square(img, S, true)
        const t = new Float32Array(3 * S * S)
        for (let i = 0; i < S * S; i++) { t[i] = px[i * 4] / 255; t[S * S + i] = px[i * 4 + 1] / 255; t[2 * S * S + i] = px[i * 4 + 2] / 255 }
        const res = await plates.run({ [plates.inputNames[0]]: new ort.Tensor("float32", t, [1, 3, S, S]) })
        const o = Object.values(res)[0]
        for (let k = 0; k < o.dims[0]; k++) {
            const row = o.data.subarray(k * 7, k * 7 + 7)
            if (row[6] < 0.4) continue
            const x1 = (row[1] - dx) / r, y1 = (row[2] - dy) / r, x2 = (row[3] - dx) / r, y2 = (row[4] - dy) / r
            out.push({ x: x1 / W, y: y1 / H, w: (x2 - x1) / W, h: (y2 - y1) / H, kind: "plate", on: true, score: row[6] })
        }
    }

    // faces: BGR 0..255, top-left letterbox, YuNet heads at strides 8/16/32
    {
        const S = 640, { px, r } = square(img, S, false)
        const t = new Float32Array(3 * S * S)
        for (let i = 0; i < S * S; i++) { t[i] = px[i * 4 + 2]; t[S * S + i] = px[i * 4 + 1]; t[2 * S * S + i] = px[i * 4] }
        const res = await faces.run({ input: new ort.Tensor("float32", t, [1, 3, S, S]) })
        const found: Box[] = []
        for (const s of [8, 16, 32]) {
            const n = S / s, cls = res[`cls_${s}`].data, obj = res[`obj_${s}`].data, bb = res[`bbox_${s}`].data
            for (let i = 0; i < n * n; i++) {
                const score = Math.sqrt(Math.min(1, Math.max(0, cls[i])) * Math.min(1, Math.max(0, obj[i])))
                if (score < 0.7) continue
                const cx = ((i % n) + bb[i * 4]) * s, cy = (Math.floor(i / n) + bb[i * 4 + 1]) * s
                const bw = Math.exp(bb[i * 4 + 2]) * s, bh = Math.exp(bb[i * 4 + 3]) * s
                // the detector also likes wheel hubs: those are proposed, not ticked
                found.push({ x: (cx - bw / 2) / r / W, y: (cy - bh / 2) / r / H, w: bw / r / W, h: bh / r / H, kind: "face", on: score >= 0.85, score })
            }
        }
        found.sort((a, b) => b.score - a.score)
        for (const f of found) if (!out.some(o => o.kind === "face" && iou(o, f) > 0.3)) out.push(f)
    }
    return out.map(b => ({ ...b, x: Math.max(0, b.x), y: Math.max(0, b.y), w: Math.min(b.w, 1 - Math.max(0, b.x)), h: Math.min(b.h, 1 - Math.max(0, b.y)) }))
}
