import "server-only"
import fs from "node:fs/promises"
import path from "node:path"
import { getStore } from "@netlify/blobs"

// Content edited from /admin (projects, photos, prices). On Netlify it lives in Netlify Blobs; elsewhere
// (next dev / next start on a laptop) in the .data folder, so the admin can be tried locally.
const LOCAL_DIR = path.join(process.cwd(), ".data")
const onNetlify = () => Boolean(process.env.NETLIFY || process.env.NETLIFY_BLOBS_CONTEXT || process.env.NETLIFY_SITE_ID)

const blobs = (name: "content" | "media") => getStore({ name, consistency: "strong" })
const localFile = (name: string, key: string) => path.join(LOCAL_DIR, name, key.replace(/[^a-z0-9._/-]/gi, "_"))

export async function readJSON<T>(key: string): Promise<T | null> {
    if (onNetlify()) return ((await blobs("content").get(key, { type: "json" })) as T | null) ?? null
    try {
        return JSON.parse(await fs.readFile(localFile("content", `${key}.json`), "utf8")) as T
    } catch {
        return null
    }
}

export async function writeJSON(key: string, value: unknown) {
    if (onNetlify()) return void (await blobs("content").setJSON(key, value))
    const file = localFile("content", `${key}.json`)
    await fs.mkdir(path.dirname(file), { recursive: true })
    await fs.writeFile(file, JSON.stringify(value, null, 1))
}

export async function readFile(key: string): Promise<{ data: ArrayBuffer; type: string } | null> {
    if (onNetlify()) {
        const res = await blobs("media").getWithMetadata(key, { type: "arrayBuffer" })
        return res ? { data: res.data, type: String(res.metadata.type ?? "application/octet-stream") } : null
    }
    try {
        const buf = await fs.readFile(localFile("media", key))
        return { data: buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer, type: key.endsWith(".webp") ? "image/webp" : "application/octet-stream" }
    } catch {
        return null
    }
}

export async function writeFile(key: string, data: Buffer, type: string) {
    if (onNetlify()) return void (await blobs("media").set(key, new Uint8Array(data).buffer as ArrayBuffer, { metadata: { type } }))
    const file = localFile("media", key)
    await fs.mkdir(path.dirname(file), { recursive: true })
    await fs.writeFile(file, data)
}

export async function deleteFile(key: string) {
    if (onNetlify()) return void (await blobs("media").delete(key))
    await fs.rm(localFile("media", key), { force: true })
}
