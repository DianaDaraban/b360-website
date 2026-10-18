import crypto from "node:crypto"
import { isAdmin } from "@/lib/admin-auth"
import { editPhoto } from "@/lib/edit-photo"
import { writeFile } from "@/lib/store"

// One photo from the admin: given the gallery look and stored. The browser shrinks photos before
// sending them, so a request stays well under the hosting limit.
export async function POST(req: Request) {
    if (!(await isAdmin())) return Response.json({ error: "Nu ești autentificat." }, { status: 401 })
    const form = await req.formData()
    const file = form.get("photo")
    if (!(file instanceof File) || !file.type.startsWith("image/")) return Response.json({ error: "Fișierul nu e o imagine." }, { status: 400 })
    if (file.size > 8 * 1024 * 1024) return Response.json({ error: "Imaginea e prea mare (maximum 8 MB)." }, { status: 400 })
    try {
        const { data, width, height } = await editPhoto(Buffer.from(await file.arrayBuffer()), form.get("plain") === "1")
        const key = `proiecte/${new Date().toISOString().slice(0, 10)}-${crypto.randomBytes(6).toString("hex")}.webp`
        await writeFile(key, data, "image/webp")
        return Response.json({ src: `/media/${key}`, w: width, h: height })
    } catch {
        return Response.json({ error: "Imaginea nu a putut fi procesată." }, { status: 500 })
    }
}
