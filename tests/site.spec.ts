import { test, expect } from "@playwright/test"

const pages = [
    { path: "/", h1: /Colantări auto/ },
    { path: "/despre-noi", h1: /transformăm ideile/ },
    { path: "/servicii", h1: /Servicii/ },
    { path: "/portofoliu", h1: /Portofoliu/ },
    { path: "/oferta", h1: /Spune-ne ce vrei să colantăm/ },
    { path: "/calculator", h1: /Cât costă colantarea/ },
    { path: "/contact", h1: /Hai să vorbim/ },
]

for (const { path, h1 } of pages) {
    test(`${path} has one h1, a description and no horizontal scroll`, async ({ page }) => {
        const response = await page.goto(path, { waitUntil: "domcontentloaded" })
        expect(response?.status()).toBe(200)
        await expect(page.locator("h1")).toHaveCount(1)
        await expect(page.locator("h1")).toHaveText(h1)
        await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.{70,}/)
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
        expect(overflow).toBeLessThanOrEqual(0)
    })
}

// open a page; the clicks below are retried until React has taken over the page (hydration)
const open = (page: import("@playwright/test").Page, path: string) => page.goto(path, { waitUntil: "domcontentloaded" })
const until = (action: () => Promise<unknown>, check: () => Promise<unknown>) =>
    expect(async () => { await action(); await check() }).toPass({ timeout: 20_000, intervals: [500, 1000] })

// alt texts of the gallery tiles (not the client stickers above them); collage side photos are decorative
const tileAlts = (page: import("@playwright/test").Page) =>
    page.locator("main li button[aria-label^='Deschide'] img").evaluateAll(imgs => imgs.map(i => i.getAttribute("alt")).filter(Boolean))

test("every image has alt text", async ({ page }) => {
    for (const { path } of pages) {
        await page.goto(path, { waitUntil: "domcontentloaded" })
        const missing = await page.locator("img:not([alt])").count()
        expect(missing, path).toBe(0)
    }
})

test("home has LocalBusiness structured data with the phone number", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" })
    const json = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? "{}")
    expect(json["@type"]).toBe("LocalBusiness")
    expect(json.telephone).toBe("+40745094195")
})

test.describe("mobile", () => {
    test.skip(({ isMobile }) => !isMobile, "mobile layout only")

    test("menu opens and navigates to Servicii", async ({ page }) => {
        // without animations, so the menu items are not still sliding in when they are clicked
        await page.emulateMedia({ reducedMotion: "reduce" })
        await open(page, "/")
        const menu = page.getByRole("dialog", { name: "Meniu" })
        await until(() => page.getByRole("button", { name: "Meniu" }).click(), () => expect(menu).toBeVisible({ timeout: 3000 }))
        await menu.getByRole("link", { name: "Servicii" }).click()
        await expect(page).toHaveURL(/\/servicii$/, { timeout: 15_000 })
        await expect(menu).toBeHidden()
    })

    test("bottom bar has the call, estimate and quote actions", async ({ page }) => {
        await page.goto("/", { waitUntil: "domcontentloaded" })
        const bar = page.getByRole("navigation", { name: "Acțiuni rapide" })
        await expect(bar.getByRole("link", { name: /Sună-ne/ })).toHaveAttribute("href", "tel:+40745094195")
        await expect(bar.getByRole("link", { name: /Calcul estimativ/ })).toHaveAttribute("href", "/calculator")
        await expect(bar.getByRole("link", { name: /Cerere ofertă/ })).toHaveAttribute("href", "/oferta")
    })
})

test("portfolio filter shows one category and keeps it in the URL", async ({ page }) => {
    await open(page, "/portofoliu")
    await until(() => page.getByRole("button", { name: "Vitrine" }).click(), () => expect(page).toHaveURL(/categorie=vitrine/, { timeout: 3000 }))
    const alts = await tileAlts(page)
    expect(alts.length).toBeGreaterThan(0)
    for (const alt of alts) expect(alt).toMatch(/vitrină/)
})

test("portfolio lightbox opens a project, steps through its photos and closes", async ({ page }) => {
    await open(page, "/portofoliu")
    const lightbox = page.getByRole("dialog", { name: "Proiect mărit" })
    await until(() => page.getByRole("button", { name: /^Deschide/ }).first().click(), () => expect(lightbox).toBeVisible({ timeout: 3000 }))
    // a project with several photos: the arrow moves to its second photo
    await expect(lightbox.getByText(/^1 \/ \d+$/)).toBeVisible()
    await lightbox.getByRole("button", { name: "Fotografia următoare" }).click()
    await expect(lightbox.getByText(/^2 \/ \d+$/)).toBeVisible()
    await lightbox.getByRole("button", { name: "Închide" }).click()
    await expect(lightbox).toBeHidden()
})

test("each service page has its heading, FAQ and FAQ structured data", async ({ page }) => {
    for (const slug of ["colantare-auto", "autocolante-inscriptionari", "colantare-vitrine", "tapet-printat", "folie-ppf"]) {
        const response = await page.goto(`/servicii/${slug}`, { waitUntil: "domcontentloaded" })
        expect(response?.status(), slug).toBe(200)
        await expect(page.locator("h1")).toHaveCount(1)
        expect(await page.locator("details").count(), slug).toBeGreaterThan(1)
        const ld = await page.locator('script[type="application/ld+json"]').allTextContents()
        expect(ld.join(" "), slug).toContain("FAQPage")
    }
})

test("client sticker filters the gallery to that client", async ({ page }) => {
    await open(page, "/portofoliu")
    await until(() => page.getByRole("button", { name: "City Grill", exact: true }).click(), () => expect(page).toHaveURL(/client=city-grill/, { timeout: 3000 }))
    const alts = await tileAlts(page)
    expect(alts.length).toBeGreaterThan(0)
    for (const alt of alts) expect(alt).toMatch(/City Grill/)
})
