import type { PricingConfig } from "@/lib/pricing"

// The prices the calculator uses until a workbook is uploaded in /admin: the materials from
// PRETURI_MATERIALE_B360.xlsx, the rest estimates to be checked (the yellow cells of the template).
const ml = (base: Record<string, number>, factor: number) => Object.fromEntries(Object.entries(base).map(([k, v]) => [k, Math.round(v * factor * 100) / 100]))
const base = {
    "bara-fata": 1.0, "bara-spate": 1.0, capota: 1.5, plafon: 2.0, portbagaj: 1.2, "aripa-fata": 0.9, "usa-fata": 1.2,
    "usa-spate": 1.1, "aripa-spate": 1.1, oglinda: 0.3, "usa-culisanta": 1.6, "panou-lateral": 2.4,
}
const { portbagaj: _p, "usa-spate": _u, "aripa-spate": _a, oglinda: _o, ...van } = base
const { "usa-culisanta": _c, "panou-lateral": _l, ...car } = base

export const defaultPricing: PricingConfig = {
    materials: [
        { code: "3651", name: "print standard", type: "print", subtype: "", years: 5, width: 1.52, eur: 16, laminate: "210", printed: true },
        { code: "3551", name: "print premium", type: "print", subtype: "", years: 5, width: 1.52, eur: 23, laminate: "215", printed: true },
        { code: "3751", name: "print premium cast (integrală)", type: "integrală", subtype: "", years: 7, width: 1.52, eur: 27, laminate: "215", printed: true },
        { code: "651", name: "folie decupată", type: "decupată", subtype: "", years: 3, width: 1.26, eur: 12, laminate: null, printed: false },
        { code: "751", name: "folie decupată", type: "decupată", subtype: "", years: 5, width: 1.26, eur: 16, laminate: null, printed: false },
        { code: "210", name: "laminare standard", type: "laminare", subtype: "", years: 5, width: 1.52, eur: 6, laminate: null, printed: false },
        { code: "215", name: "laminare premium", type: "laminare", subtype: "", years: 7, width: 1.52, eur: 8, laminate: null, printed: false },
    ],
    pieces: {
        hatchback: ml(car, 1), sedan: ml(car, 1.05), break: ml(car, 1.1), suv: ml(car, 1.15), utilitara: ml(van, 1.35),
        // the big vehicles: film 1.52 m wide, so metres of roll = area / 1.52 (12.2 m coach, 13.6 m trailer)
        autocar: { fata: 6, spate: 6, plafon: 20, "lateral-fata": 9.5, "lateral-mijloc": 9.5, "lateral-spate": 9.5 },
        camion: {
            "cabina-fata": 3.5, "cabina-usa": 1.3, "cabina-lateral": 1.5, "cabina-plafon": 2.5,
            "remorca-fata": 4.5, "remorca-spate": 4.5, "remorca-lateral": 24, "remorca-plafon": 22,
        },
    },
    graphics: [
        { from: 1, to: 2, eur: 75 },
        { from: 3, to: 4, eur: 150 },
        { from: 5, to: 8, eur: 220 },
        { from: 9, to: 99, eur: 300 },
    ],
    settings: { labour: 4, ink: 2.5, eurRate: 5, vat: 21, margin: 10, aiSurcharge: 50 },
}
