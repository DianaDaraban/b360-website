import type { NextConfig } from "next"
import path from "node:path"

// The parent folder (D:\IT\B360) has its own package-lock.json, so pin the project root here
const root = path.resolve(import.meta.dirname)

const nextConfig: NextConfig = {
    turbopack: { root },
    outputFileTracingRoot: root,
    images: { formats: ["image/avif", "image/webp"] },
}

export default nextConfig
