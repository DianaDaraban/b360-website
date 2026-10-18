import { getStore } from "@netlify/blobs"

// temporary diagnostic: how long a Netlify Blobs read takes with each consistency mode
export const dynamic = "force-dynamic"
const timed = async (label: string, f: () => Promise<unknown>) => {
    const t = Date.now()
    try {
        const v = await Promise.race([f(), new Promise((_, r) => setTimeout(() => r(new Error("timeout 8s")), 8000))])
        return `${label}: ok ${Date.now() - t}ms ${JSON.stringify(v)?.slice(0, 60)}`
    } catch (e) {
        return `${label}: ${e instanceof Error ? e.message : e} ${Date.now() - t}ms`
    }
}
export async function GET() {
    const out = [
        `env NETLIFY=${process.env.NETLIFY} ctx=${Boolean(process.env.NETLIFY_BLOBS_CONTEXT)} global=${Boolean((globalThis as { netlifyBlobsContext?: unknown }).netlifyBlobsContext)}`,
        await timed("eventual get", () => getStore("content").get("projects", { type: "json" })),
        await timed("strong get", () => getStore({ name: "content", consistency: "strong" }).get("projects", { type: "json" })),
    ]
    return new Response(out.join("\n"))
}
