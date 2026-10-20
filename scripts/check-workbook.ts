// usage: npx tsx scripts/check-workbook.ts <file.xlsx> [body] — reads a price workbook the way the
// admin does and prints the problems and a few sample estimates
import { readFileSync } from "node:fs"
import { parseWorkbook } from "../lib/pricing-import"
import { estimate, labourFor } from "../lib/pricing"
import { panelsOf, type BodyId } from "../data/calculator"

const [file, body = "sedan"] = process.argv.slice(2)
parseWorkbook(readFileSync(file)).then(({ config, errors }) => {
    console.log("errors:", errors.length ? errors : "none")
    if (!config) return
    console.log("materials:", config.materials.map(m => `${m.code} ${m.type}${m.subtype ? "/" + m.subtype : ""} ${m.years}y ${m.width}m ${m.eur}€ lam=${m.laminate} tr=${m.transfer}`))
    console.log("settings:", config.settings)
    const all = panelsOf(body as BodyId)
    const doors = all.filter(p => p.startsWith("usa-") || p === "portbagaj")
    for (const [label, pieces] of [["4 doors + boot", doors], ["whole car", all]] as const)
        for (const job of ["print", "decupată", "integrală", "PPF"] as const) {
            const r = estimate(config, body, [...pieces], { years: 5, job, subtype: "", graphics: "am", withVat: true }, 5)
            console.log(`${body} ${label} ${job}:`, r ? `${r.mp.toFixed(1)} mp ×${r.labour.toFixed(2)} ${r.material.code}${r.laminate ? "+" + r.laminate.code : ""}${r.transfer ? "+" + r.transfer.code : ""} → ${r.low}–${r.high} lei` : "no material")
        }
    console.log("labour at 10/30/80/135 mp:", [10, 30, 80, 135].map(m => labourFor(config, m).toFixed(2)))
})
