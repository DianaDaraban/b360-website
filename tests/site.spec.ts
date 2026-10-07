import { test, expect } from "@playwright/test"

const pages = [
    { path: "/", h1: /Colantări auto/ },
    { path: "/despre-noi", h1: /transformăm ideile/ },
    { path: "/servicii", h1: /Servicii/ },
    { path: "/portofoliu", h1: /Portofoliu/ },
    { path: "/oferta", h1: /Cerere ofertă/ },
    { path: "/calculator", h1: /Calculează/ },
    { path: "/contact", h1: /Contact/ },
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
        await page.goto("/", { waitUntil: "domcontentloaded" })
        await page.getByRole("button", { name: "Meniu" }).click()
        const menu = page.getByRole("dialog", { name: "Meniu" })
        await expect(menu).toBeVisible()
        await menu.getByRole("link", { name: "Servicii" }).click()
        await expect(page).toHaveURL(/\/servicii$/)
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
    await page.goto("/portofoliu", { waitUntil: "domcontentloaded" })
    await page.getByRole("button", { name: "Vitrine" }).click()
    await expect(page).toHaveURL(/categorie=vitrine/)
    const alts = await page.locator("main ul li img").evaluateAll(imgs => imgs.map(i => i.getAttribute("alt")))
    expect(alts.length).toBeGreaterThan(0)
    for (const alt of alts) expect(alt).toMatch(/vitrină/)
})

test("portfolio lightbox opens and closes", async ({ page }) => {
    await page.goto("/portofoliu", { waitUntil: "domcontentloaded" })
    await page.getByRole("button", { name: /Mărește/ }).first().click()
    const lightbox = page.getByRole("dialog", { name: "Lucrare mărită" })
    await expect(lightbox).toBeVisible()
    await lightbox.getByRole("button", { name: "Închide" }).click()
    await expect(lightbox).toBeHidden()
})

test("each service page has its heading, FAQ and FAQ structured data", async ({ page }) => {
    for (const slug of ["colantare-auto", "autocolante-inscriptionari", "colantare-vitrine", "folie-ppf"]) {
        const response = await page.goto(`/servicii/${slug}`, { waitUntil: "domcontentloaded" })
        expect(response?.status(), slug).toBe(200)
        await expect(page.locator("h1")).toHaveCount(1)
        expect(await page.locator("details").count(), slug).toBeGreaterThan(1)
        const ld = await page.locator('script[type="application/ld+json"]').allTextContents()
        expect(ld.join(" "), slug).toContain("FAQPage")
    }
})

test("client sticker filters the gallery to that client", async ({ page }) => {
    await page.goto("/portofoliu", { waitUntil: "domcontentloaded" })
    await page.getByRole("button", { name: "City Grill" }).click()
    await expect(page).toHaveURL(/client=city-grill/)
    const alts = await page.locator("main ul li img").evaluateAll(imgs => imgs.map(i => i.getAttribute("alt")))
    expect(alts.length).toBeGreaterThan(0)
    for (const alt of alts) expect(alt).toMatch(/City Grill/)
})
