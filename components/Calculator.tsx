"use client"

import { useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import type { View3D } from "./Car3D"
import { CarBlueprint } from "./CarBlueprint"
import { Consent, SmartForm } from "./SmartForm"
import { autoPanels, bodyTypes, hasDrawing, panelLabel, panelsOf, sidePanels, type BodyId, type Mode, type View } from "@/data/calculator"
import { track } from "@/lib/analytics"
import { DURATIONS, estimate, JOB_TYPES, jobAvailable, pickMaterial, subtypesOf, type Graphics, type JobType, type PricingConfig } from "@/lib/pricing"
import form from "@/app/form.module.css"
import styles from "./Calculator.module.css"

const views: { id: View; label: string }[] = [
    { id: "stanga", label: "Stânga" },
    { id: "sus", label: "Sus" },
    { id: "dreapta", label: "Dreapta" },
]
// the 3D viewer (three.js) loads only in the browser and only when a body with a 3D model is shown
const Car3D = dynamic(() => import("./Car3D"), { ssr: false, loading: () => <p className={styles.loading3d}>Se încarcă mașina 3D…</p> })
const CC_BY: [string, string] = ["CC BY 4.0", "https://creativecommons.org/licenses/by/4.0/"]
const MODELS_3D = new Set<string>(["hatchback", "sedan", "break", "suv", "utilitara", "autocar", "camion"])
// hand-modelled cars from Sketchfab: CC BY 4.0 asks for the author, a link and a note of the changes
type Credit = { title: string; author: string; url: string; license: [string, string] }
const CREDITS_3D: Record<string, Credit[]> = {
    sedan: [{ title: "2014 Toyota Corolla E180 EU", author: "Armored Wave", url: "https://sketchfab.com/3d-models/2014-toyota-corolla-e180-eu-with-interior-36f95efb0585464cae43a25a3b3392e8", license: CC_BY }],
    hatchback: [{ title: "Skoda Fabia Mk.2", author: "barking_dogo", url: "https://sketchfab.com/3d-models/skoda-fabia-mk2-e2e0be2c52994e3bb6cae225f3e7482d", license: CC_BY }],
    break: [{ title: "Volvo V60 Polestar (2013)", author: "Myedsu", url: "https://sketchfab.com/3d-models/volvo-v60-polestar-2013-504ce39150fe49c7979f702d5f0f8580", license: CC_BY }],
    suv: [{ title: "2011 Range Rover Evoque", author: "Free Vehicle Archive", url: "https://sketchfab.com/3d-models/2011-range-rover-evoque-free-vehicle-archive-f7632f55ed4c49e29f44c409260416f1", license: CC_BY }],
    utilitara: [{ title: "2014 Fiat Ducato", author: "razor24", url: "https://sketchfab.com/3d-models/2014-fiat-ducato-8a651ad182414bb0a8b6c6d8d5bd7c01", license: CC_BY }],
    autocar: [{ title: "Indonesian bus Ecoline", author: "agungkuncoro13021986", url: "https://sketchfab.com/3d-models/indonesian-bus-ecoline-fda12812ab1147b79c1a6c7aa3adc5f8", license: CC_BY }],
    camion: [
        { title: "MAN TGX 2010 V8", author: "DevPoly3D", url: "https://sketchfab.com/3d-models/man-tgx-2010-v8-high-detail-semi-truck-34ce748d9a4b4de7b035cfe5cb97f5d1", license: CC_BY },
        { title: "Semi Trailer", author: "NoblecatSoft", url: "https://sketchfab.com/3d-models/semi-trailer-f507a422e9344e76934c5fbf06eb81d7", license: CC_BY },
    ],
}
const VIEWS_3D: { id: View3D; label: string }[] = [
    { id: "fata", label: "Față" },
    { id: "lateral", label: "Lateral" },
    { id: "spate", label: "Spate" },
    { id: "sus", label: "Sus" },
]
const eur = (n: number) => `${n.toLocaleString("ro-RO")} €`
const mp = (n: number) => `${n.toLocaleString("ro-RO", { maximumFractionDigits: 1 })} mp`

const GRAPHICS: { id: Graphics; label: string; hint?: string }[] = [
    { id: "am", label: "Am grafica gata (fișiere vectoriale)", hint: "Ne trimiți fișierele, noi le pregătim de print." },
    { id: "noi", label: "Nu am grafica, vreau să o faceți voi", hint: "Vă spun ce îmi doresc, iar voi creați grafica de la zero." },
    { id: "ai", label: "Am o simulare făcută cu AI (ChatGPT etc.) și vreau s-o reproduceți", hint: "Simulările generate cu AI nu sunt fișiere de print: le redesenăm de la zero, vectorial, ca să arate la fel pe mașină." },
]

// Wrap cost calculator: the car on the left, the blueprint in the middle (three views, pieces picked
// on the photo; their area gives the square metres), the questions on the right. Behind the questions
// the material is chosen from the price workbook (lib/pricing.ts); the estimate is shown as a range.
export function Calculator({ pricing }: { pricing: PricingConfig }) {
    const [body, setBody] = useState<BodyId>("sedan")
    const [view, setView] = useState<View>("stanga")
    const [selected, setSelected] = useState<string[]>([])
    const [hovered, setHovered] = useState<string | null>(null)
    const [years, setYears] = useState(5)
    const [job, setJob] = useState<JobType>("print")
    const [subtype, setSubtype] = useState("")
    const [graphics, setGraphics] = useState<Graphics>("am")   // "I have the graphics": nothing added until they ask us to design it
    const [info, setInfo] = useState(false)
    const [withVat, setWithVat] = useState(true)
    const [prefer2d, setPrefer2d] = useState(true)      // the drawing first; the 3D car is one tap away
    // the 3D viewer (three.js and the model) starts once the page has loaded and the browser is idle,
    // so it never holds up the first paint
    const [start3d, setStart3d] = useState(false)
    useEffect(() => {
        const go = () => setStart3d(true)
        const idle = () => (typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(go, { timeout: 2500 }) : setTimeout(go, 800))
        if (document.readyState === "complete") idle()
        else window.addEventListener("load", idle, { once: true })
        return () => window.removeEventListener("load", idle)
    }, [])
    const [view3d, setView3d] = useState<{ name: View3D; n: number } | null>(null)

    const all = panelsOf(body)
    const show3d = MODELS_3D.has(body) && (!prefer2d || !hasDrawing(body))   // the big vehicles exist only in 3D
    // a full wrap also covers the pillars and the sills: painted and priced on their own
    const pieces = useMemo(() => (job === "integrală" && selected.length ? [...selected, ...autoPanels(body)] : selected), [job, selected, body])
    const selection = useMemo(() => Object.fromEntries(pieces.map(id => [id, "colantare" as Mode])), [pieces])
    const partial = job === "integrală" && selected.length > 0 && selected.length < all.length

    const chooseBody = (id: BodyId) => {
        track("calculator_caroserie", { caroserie: id })
        setBody(id)
        setHovered(null)
        // pieces the new body has stay picked (side doors etc. differ between bodies); a full wrap stays full
        const allowed = panelsOf(id)
        setSelected(sel => (job === "integrală" && sel.length === all.length ? allowed : sel.filter(k => allowed.includes(k))))
    }
    const chooseJob = (id: JobType) => {
        setJob(id)
        setSubtype(subtypesOf(pricing, id)[0] ?? "")
        // a full wrap starts with every piece picked; taking pieces off makes it a partial wrap
        if (id === "integrală") setSelected(all)
    }
    const pick = (id: string) => setSelected(sel => (sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id]))
    const turn = (dir: 1 | -1) => setView(v => views[(views.findIndex(x => x.id === v) + dir + views.length) % views.length].id)

    // PPF is clear film: there is no graphics to design, so step 5 is switched off and costs nothing
    const noGraphics = job === "PPF"
    const result = estimate(pricing, body, pieces, { years, job, subtype, graphics: noGraphics ? "am" : graphics, withVat })
    // the duration tick follows the film actually chosen: when the cheapest film that lasts long enough
    // lasts longer than the duration ticked (e.g. the only full-wrap film lasts 7 years), the tick moves
    // to the longest duration that film covers
    useEffect(() => {
        const m = pickMaterial(pricing, job, years, subtype)?.material
        if (!m) return
        const match = [...DURATIONS].reverse().find(d => d.years <= m.years)?.years
        if (match && match > years) setYears(match)
    }, [pricing, job, years, subtype])
    // the printed-film job is named after what the chosen duration gets: laminated or not
    const printLaminated = Boolean(pickMaterial(pricing, "print", years)?.laminate)
    const jobLabel = (id: JobType) => (id === "print" ? (printLaminated ? "Branding cu folie printată și laminată" : "Branding cu folie printată") : JOB_TYPES.find(j => j.id === id)!.label)
    const jobName = partial ? "Colantare parțială cu folie premium" : jobLabel(job)
    const durationName = DURATIONS.find(d => d.years === years)!.label
    const graphicsName = noGraphics ? "Fără grafică (folie PPF transparentă)" : GRAPHICS.find(g => g.id === graphics)!.label
    // what the client reads: the material's description (brand and range), never the codes; the codes
    // go to B360 in the request
    const say = (m: { name: string; description?: string }) => m.description || m.name
    const materialName = result ? `${say(result.material)}${result.laminate ? ` + ${say(result.laminate)}` : ""}` : ""
    const materialCodes = result ? `${result.material.code} ${result.material.name}${result.laminate ? ` + laminare ${result.laminate.code}` : ""}${result.transfer ? ` + transfer ${result.transfer.code}` : ""}` : ""
    const vatName = withVat ? "cu TVA" : "fără TVA"
    const subtypes = subtypesOf(pricing, job)

    const totalText = result && selected.length ? `${eur(result.low)} – ${eur(result.high)}` : null

    return (
        <SmartForm kind="calculator" className={styles.calc} aria-label="Calculator cost colantare">
            {/* ---------- 1: the car ---------- */}
            <Step n={1} compact title="Ce mașină ai?" hint="Alege tipul de caroserie care seamănă cel mai bine cu mașina ta: calculul e același pentru mașini similare.">
                <div className={styles.carRow}>
                <div className={styles.bodyCards} role="radiogroup" aria-label="Tip caroserie">
                    {bodyTypes.map(b => (
                        <button type="button" role="radio" key={b.id} className={styles.bodyCard} aria-checked={body === b.id} onClick={() => chooseBody(b.id)}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={`/calculator/${b.id}-side.webp`} alt="" width={320} height={128} loading="lazy" />
                            <span>{b.label}</span>
                        </button>
                    ))}
                </div>
                </div>
            </Step>

            {/* ---------- 2: the pieces ---------- */}
            <Step n={2} compact title="Ce piese colantăm?" hint={show3d ? "Rotește mașina trăgând de ea (sau cu degetul) și apasă pe piesele pe care vrei să le colantăm." : "Apasă pe piese, direct pe mașină. Întoarce mașina cu săgețile ca să vezi și plafonul sau cealaltă parte."}>
                {show3d ? (
                    <div className={styles.canvas3d}>
                        {start3d ? <Car3D body={body} selected={selected} view={view3d} onPick={pick} onHover={setHovered} /> : <p className={styles.loading3d}>Se încarcă mașina 3D…</p>}
                        <p className={styles.hoverName} aria-live="polite">
                            {hovered ? <>{panelLabel(hovered)} · <em>{selected.includes(hovered) ? "apasă ca s-o scoți" : "apasă ca s-o adaugi"}</em></> : selected.length ? `${selected.length} ${selected.length === 1 ? "piesă aleasă" : "piese alese"}` : "Trage ca s-o rotești · apasă pe o piesă ca s-o alegi"}
                        </p>
                        {CREDITS_3D[body] && (
                            <p className={styles.credit}>
                                {"Model 3D: "}
                                {CREDITS_3D[body].map((c, i) => (
                                    <span key={c.url}>
                                        {i > 0 && " și "}
                                        <a href={c.url} target="_blank" rel="noopener noreferrer">{c.title}</a> de {c.author}
                                    </span>
                                ))}
                                {", "}
                                <a href={CREDITS_3D[body][0].license[1]} target="_blank" rel="noopener noreferrer">{CREDITS_3D[body][0].license[0]}</a>; modificat (împărțit pe piese, recolorat, comprimat{body === "camion" ? ", asamblat" : ""})
                            </p>
                        )}
                    </div>
                ) : (
                    <div className={styles.canvas}>
                        <button type="button" className={`${styles.turn} ${styles.turnLeft}`} onClick={() => turn(-1)} aria-label="Unghiul anterior">
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 4l-8 8 8 8" /></svg>
                        </button>
                        <div key={view} className={styles.flip}>
                            <CarBlueprint body={body} view={view} selection={selection} onPick={pick} onHover={setHovered} />
                        </div>
                        <button type="button" className={`${styles.turn} ${styles.turnRight}`} onClick={() => turn(1)} aria-label="Unghiul următor">
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4l8 8-8 8" /></svg>
                        </button>
                        <p className={styles.hoverName} aria-live="polite">
                            {hovered ? <>{panelLabel(hovered)} · <em>{selected.includes(hovered) ? "apasă ca s-o scoți" : "apasă ca s-o adaugi"}</em></> : selected.length ? `${selected.length} ${selected.length === 1 ? "piesă aleasă" : "piese alese"}` : "Apasă pe o piesă ca s-o alegi"}
                        </p>
                    </div>
                )}
                <div className={styles.viewBar}>
                    <div className={styles.viewGroup}>
                        {MODELS_3D.has(body) && hasDrawing(body) && (
                            <div className={styles.views} role="radiogroup" aria-label="Vedere">
                                <button type="button" role="radio" aria-checked={show3d} onClick={() => setPrefer2d(false)}>3D</button>
                                <button type="button" role="radio" aria-checked={!show3d} onClick={() => setPrefer2d(true)}>2D</button>
                            </div>
                        )}
                        {show3d ? (
                            <div className={styles.views} aria-label="Unghi">
                                {VIEWS_3D.map(v => (
                                    <button type="button" key={v.id} aria-pressed={view3d?.name === v.id} onClick={() => setView3d({ name: v.id, n: Date.now() })}>{v.label}</button>
                                ))}
                            </div>
                        ) : (
                            <div className={styles.views} role="tablist" aria-label="Unghi">
                                {views.map(v => (
                                    <button type="button" key={v.id} role="tab" aria-selected={view === v.id} onClick={() => setView(v.id)}>{v.label}</button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className={styles.quick}>
                        <button type="button" onClick={() => setSelected(all)}>
                            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4" /><path d="M7.5 12.5l3 3 6-6.5" /></svg>
                            Toată mașina
                        </button>
                        <button type="button" onClick={() => setSelected(sidePanels(body))}>
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12h18M7 8l-4 4 4 4M17 8l4 4-4 4" /></svg>
                            Doar laterale
                        </button>
                        <button type="button" className={styles.clear} onClick={() => setSelected([])} disabled={!selected.length}>
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
                            Șterge tot
                        </button>
                    </div>
                </div>
            </Step>

            {/* ---------- 3-5: three questions; the material is chosen behind them ---------- */}
            <Step n={3} title="Cât timp vei ține folia pe mașină?">
                <div className={`${styles.choices} ${styles.four}`} role="radiogroup" aria-label="Cât timp ții folia">
                    {DURATIONS.map(d => (
                        <Choice key={d.years} name="calc-years" checked={years === d.years} onChange={() => setYears(d.years)} title={d.label} />
                    ))}
                </div>
            </Step>

            <Step n={4} title="Ce fel de lucrare vrei?">
                <div className={styles.choices} role="radiogroup" aria-label="Ce fel de lucrare">
                    {JOB_TYPES.map(j => {
                        const available = jobAvailable(pricing, j.id)
                        return (
                            <Choice
                                key={j.id}
                                name="calc-job"
                                checked={job === j.id}
                                disabled={!available}
                                onChange={() => chooseJob(j.id)}
                                title={j.id === "integrală" && partial ? "Colantare parțială cu folie premium" : jobLabel(j.id)}
                                text={available ? j.hint : "în curând"}
                            />
                        )
                    })}
                </div>
                {partial && <p className={styles.notice}>Ai scos câteva piese: calculăm o colantare parțială cu folie premium. Apasă „Toată mașina” ca să revii la integrală.</p>}
                {subtypes.length > 1 && (
                    <label className={styles.subtype}>
                        Ce folie?
                        <select className={styles.select} value={subtype} onChange={e => setSubtype(e.target.value)}>
                            {subtypes.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </label>
                )}
            </Step>

            <Step n={5} title="Ai grafica sau o facem noi?" hint={noGraphics ? "Folia PPF e transparentă: nu are grafică, deci pasul ăsta nu se aplică." : undefined}>
                <div className={`${styles.choices} ${styles.three}`} role="radiogroup" aria-label="Grafica">
                    {GRAPHICS.map(g => (
                        <Choice
                            key={g.id}
                            name="calc-graphics"
                            checked={!noGraphics && graphics === g.id}
                            disabled={noGraphics}
                            onChange={() => setGraphics(g.id)}
                            title={g.label}
                            text={g.hint}
                            extra={g.id === "am" && !noGraphics && (
                                <button type="button" className={styles.infoBtn} aria-expanded={info || graphics === "am"} aria-controls="calc-graphics-info" onClick={e => { e.preventDefault(); setInfo(v => !v) }} aria-label="Ce înseamnă grafică gata de print">i</button>
                            )}
                        />
                    ))}
                </div>
                {!noGraphics && (info || graphics === "am") && (
                    <div id="calc-graphics-info" className={styles.infoBox}>
                        <strong>Grafica ta e considerată gata de print dacă:</strong>
                        <ul>
                            <li>textele și logo-urile sunt <b>vectoriale</b> (AI, EPS, PDF vectorial sau SVG), cu fonturile transformate în contururi;</li>
                            <li>fotografiile și imaginile au <b>150–300 dpi la dimensiunea reală</b> de print: pentru fiecare metru de lățime acoperită, minimum <b>~5.900 px</b> (o poză de telefon de 4.000 px acoperă bine ~70 cm);</li>
                            <li>fișierele sunt <b>la dimensiune reală sau la scară</b> (de exemplu 1:10), nu capturi de ecran și nici imagini salvate de pe internet sau din chat.</li>
                        </ul>
                        <p>Nu ești sigur? Trimite-ne fișierele și le verificăm gratuit. Dacă nu se pot folosi, îți spunem înainte de orice cost, iar refacerea se taxează ca grafică făcută de noi.</p>
                    </div>
                )}
            </Step>

            {/* ---------- 6 and 7 side by side on wide screens: the estimate and the request ---------- */}
            <div className={styles.finish}>
            <Step n={6} title="Estimarea ta" id="calc-estimare">
                <div className={styles.summary}>
                    <div className={styles.total}>
                        <span>Estimare orientativă</span>
                        <strong>{totalText ?? "Alege piesele"}</strong>
                        <div className={styles.vat} role="radiogroup" aria-label="TVA">
                            <label><input type="radio" name="calc-vat" checked={withVat} onChange={() => setWithVat(true)} /> cu TVA</label>
                            <label><input type="radio" name="calc-vat" checked={!withVat} onChange={() => setWithVat(false)} /> fără TVA</label>
                        </div>
                        {result && selected.length > 0 && <small>{bodyTypes.find(b => b.id === body)!.label} · {mp(result.mp)} · {materialName}</small>}
                        {result?.shortfall && <small className={styles.notice}>Pentru {durationName.toLowerCase()} recomandăm altă lucrare: folia aleasă ține până la {result.shortfall} ani.</small>}
                        <small className={styles.disclaimer}>Prețul final îl confirmăm după ce vedem mașina și grafica.</small>
                    </div>
                    <div className={styles.lines}>
                        {!selected.length || !result ? (
                            <p className={styles.empty}>{result || !selected.length ? "Alege piesele pe mașină (pasul 2): apoi vezi aici prețul pe fiecare piesă." : "Pentru lucrarea aleasă nu avem încă prețuri. Trimite-ne cererea și revenim cu o ofertă."}</p>
                        ) : (
                            <details className={styles.details}>
                                <summary>Vezi prețul pe fiecare piesă ({result.lines.length}{result.graphicsTotal > 0 ? " + grafică" : ""})</summary>
                                <ul>
                                    {result.lines.map(l => (
                                        <li key={l.id}>
                                            <i aria-hidden="true" />
                                            <span>{panelLabel(l.id)}<small>{mp(l.mp)}</small></span>
                                            <strong>{eur(l.total)}</strong>
                                            <button type="button" onClick={() => pick(l.id)} aria-label={`Scoate ${panelLabel(l.id)}`}>×</button>
                                        </li>
                                    ))}
                                    {result.graphicsTotal > 0 && <li className={styles.extra}><i aria-hidden="true" /><span>Grafică<small>{graphics === "ai" ? "reproducere după simulare AI" : "realizată de noi"}</small></span><strong>{eur(result.graphicsTotal)}</strong></li>}
                                </ul>
                            </details>
                        )}
                    </div>
                </div>
            </Step>

            {/* the configuration travels with the request */}
            <input type="hidden" name="caroserie" value={bodyTypes.find(b => b.id === body)!.label} />
            <input type="hidden" name="durata" value={durationName} />
            <input type="hidden" name="lucrare" value={jobName + (subtype && subtypes.length > 1 ? ` (${subtype})` : "")} />
            <input type="hidden" name="material" value={materialCodes} />
            <input type="hidden" name="grafica" value={graphicsName} />
            <input type="hidden" name="piese" value={result ? result.lines.map(l => `${panelLabel(l.id)}: ${mp(l.mp)} (${eur(l.total)})`).join("\n") : selected.map(panelLabel).join("\n")} />
            <input type="hidden" name="estimare" value={totalText ? `${totalText} ${vatName}` : ""} />

            {/* ---------- 7: send ---------- */}
            <Step n={7} title="Trimite-ne configurația" hint="Îți trimitem oferta finală după ce vedem detaliile.">
                <div className={styles.contact}>
                    <label className={form.field}>Nume și prenume *<input name="nume" autoComplete="name" required /></label>
                    <label className={form.field}>
                        Telefon *
                        <span className={form.phoneRow}><span>+40</span><input name="telefon" type="tel" autoComplete="tel-national" inputMode="tel" placeholder="722 12 34 56" pattern="[0-9 ]{9,12}" required /></span>
                    </label>
                    <label className={form.field}>Email *<input name="email" type="email" autoComplete="email" required /></label>
                    <label className={`${form.field} ${styles.details}`}>
                        Detalii suplimentare <small>(opțional)</small>
                        <textarea name="mesaj" rows={3} maxLength={2000} placeholder="ex. modelul exact al mașinii, câte mașini sunt, termenul dorit, ce vrei să apară pe grafică" />
                    </label>
                </div>
                <div className={styles.sendRow}>
                    <Consent />
                    <button type="submit" className="btn">Trimite cererea de ofertă</button>
                </div>
            </Step>
            </div>

            {/* the running total stays in view while the questions are answered */}
            <a href="#calc-estimare" className={styles.liveTotal} data-empty={!totalText || undefined}>
                <span>Estimare</span>
                <strong>{totalText ?? "alege piesele"}</strong>
                {totalText && <small>{vatName} · vezi detalii</small>}
            </a>
        </SmartForm>
    )
}

// one step of the calculator: a big number, the question as the title, then its content
// compact: steps 1 and 2, which share one screen (on phones their hints are hidden)
function Step({ n, title, hint, id, compact, children }: { n: number; title: string; hint?: string; id?: string; compact?: boolean; children: React.ReactNode }) {
    return (
        <section className={`${styles.step} ${compact ? styles.compact : ""}`} id={id} aria-labelledby={`calc-step-${n}`}>
            <header className={styles.stepHead}>
                <span className={styles.stepNo} aria-hidden="true">{n}</span>
                <div>
                    <h2 id={`calc-step-${n}`}>{title}</h2>
                    {hint && <p>{hint}</p>}
                </div>
            </header>
            {children}
        </section>
    )
}

// an answer as a big card: the whole card is the radio button; the chosen one gets a red border and a tick
function Choice({ name, checked, disabled, onChange, title, text, extra }: { name: string; checked: boolean; disabled?: boolean; onChange: () => void; title: string; text?: string; extra?: React.ReactNode }) {
    return (
        <label className={styles.choice} data-disabled={disabled || undefined}>
            <input type="radio" name={name} checked={checked} disabled={disabled} onChange={onChange} />
            <span className={styles.tick} aria-hidden="true" />
            <strong>{title}</strong>
            {text && <small>{text}</small>}
            {extra}
        </label>
    )
}
