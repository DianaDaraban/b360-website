// Opens the main pages once before the tests: the first request to a page that has just been built is
// slow (it is rendered and cached then), and the first tests would otherwise race it.
export default async function warmUp() {
    const base = "http://localhost:3100"
    for (const path of ["/", "/portofoliu", "/servicii", "/calculator", "/contact", "/oferta", "/despre-noi"]) {
        await fetch(base + path).catch(() => null)
    }
}
