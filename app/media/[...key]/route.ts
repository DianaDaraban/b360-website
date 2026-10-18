import { readFile } from "@/lib/store"

// Photos uploaded from /admin, served from the media store. Every upload gets a new name, so they can be
// cached for good.
export async function GET(_req: Request, { params }: { params: Promise<{ key: string[] }> }) {
    const key = (await params).key.join("/")
    const file = await readFile(key)
    if (!file) return new Response("Not found", { status: 404 })
    return new Response(file.data, {
        headers: { "Content-Type": file.type, "Cache-Control": "public, max-age=31536000, immutable" },
    })
}
