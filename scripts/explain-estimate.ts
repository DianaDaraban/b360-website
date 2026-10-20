// usage: NODE_OPTIONS=--conditions=react-server npx tsx scripts/explain-estimate.ts <file.xlsx> <body> <job> <years> <piece,piece,...|all|doors>
// Shows, step by step, how the calculator reaches its estimate (the same functions the site uses).
import { readFileSync } from "node:fs"
import { parseWorkbook } from "../lib/pricing-import"
import { estimate, labourFor, pickMaterial, type JobType } from "../lib/pricing"
import { panelLabel, panelsOf, type BodyId } from "../data/calculator"

const [file, body = "sedan", job = "print", yearsArg = "5", pick = "doors"] = process.argv.slice(2)
const years = Number(yearsArg)
parseWorkbook(readFileSync(file)).then(({ config: cfg, errors }) => {
    if (!cfg) return console.log(errors)
    const all = panelsOf(body as BodyId)
    const pieces = pick === "all" ? all : pick === "doors" ? all.filter(p => p.startsWith("usa-")) : pick.split(",")
    const picked = pickMaterial(cfg, job as JobType, years)!
    const { material: m, laminate: l, transfer: t } = picked
    const ink = m.printed ? cfg.settings.ink : 0
    const perMp = m.eur + (l?.eur ?? 0) + (t?.eur ?? 0) + ink
    console.log(`\n${body}, ${job}, ${years} ani, ${pieces.length} piese`)
    console.log(`1. Material ales: ${m.code} ${m.name} (${m.years} ani, rolă ${m.width} m)${picked.shortfall ? `  ! nu există unul care să țină ${years} ani` : ""}`)
    console.log(`2. Preț pe mp: material ${m.eur} € + laminare ${l ? `${l.code} ${l.eur}` : 0} € + transfer ${t ? `${t.code} ${t.eur}` : 0} € + cerneală ${ink} € = ${perMp.toFixed(2)} €/mp`)
    console.log(`3. Suprafața (ml din foaia Piese × ${m.width} m):`)
    let mp = 0
    for (const id of pieces) {
        const ml = cfg.pieces[body]?.[id.replace(/-(st|dr)$/, "")] ?? 0
        mp += ml * m.width
        console.log(`     ${panelLabel(id).padEnd(24)} ${ml} ml × ${m.width} = ${(ml * m.width).toFixed(2)} mp`)
    }
    const labour = labourFor(cfg, mp)
    const eur = mp * perMp * labour
    const vat = 1 + cfg.settings.vat / 100
    const r = estimate(cfg, body, pieces, { years, job: job as JobType, subtype: "", graphics: "am", withVat: true }, 5)!
    console.log(`   total ${mp.toFixed(2)} mp`)
    console.log(`4. Coeficient manoperă: ${labour.toFixed(2)}`)
    console.log(`5. ${mp.toFixed(2)} mp × ${perMp.toFixed(2)} €/mp × ${labour.toFixed(2)} = ${eur.toFixed(2)} € (fără grafică)`)
    console.log(`6. × curs 5 lei × TVA ${vat} = ${(eur * 5 * vat).toFixed(0)} lei → afișat ${r.low}–${r.high} lei (±${cfg.settings.margin}%)`)
})
