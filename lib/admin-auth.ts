import "server-only"
import crypto from "node:crypto"
import { cookies } from "next/headers"

// One shared password for the admin (ADMIN_PASSWORD, set on the host, never in the code). After logging
// in the browser keeps a cookie holding a signature of that password, so changing the password logs
// everyone out.
const COOKIE = "b360_admin"
const DAYS = 30

const signature = (password: string) => crypto.createHmac("sha256", password).update("b360-admin").digest("hex")

export async function isAdmin() {
    const password = process.env.ADMIN_PASSWORD
    if (!password) return false
    const value = (await cookies()).get(COOKIE)?.value ?? ""
    const expected = signature(password)
    return value.length === expected.length && crypto.timingSafeEqual(Buffer.from(value), Buffer.from(expected))
}

export async function logIn(attempt: string) {
    const password = process.env.ADMIN_PASSWORD
    if (!password) return false
    const a = Buffer.from(attempt), b = Buffer.from(password)
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false
    ;(await cookies()).set(COOKIE, signature(password), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: DAYS * 24 * 3600,
    })
    return true
}

export async function logOut() {
    ;(await cookies()).delete(COOKIE)
}
