"use client"

import { useMemo, useState } from "react"
import { CarBlueprint } from "./CarBlueprint"
import { Consent, SmartForm } from "./SmartForm"
import { bodyTypes, models, panelLabel, panelsOf, sidePanels, type BodyId, type Mode, type View } from "@/data/calculator"
import { DURATIONS, estimate, JOB_TYPES, jobAvailable, subtypesOf, type Graphics, type JobType, type PricingConfig } from "@/lib/pricing"
import form from "@/app/form.module.css"
import styles from "./Calculator.module.css"

const views: { id: View; label: string }[] = [
    { id: "stanga", label: "Stânga" },
    { id: "sus", label: "Sus" },
    { id: "dreapta", label: "Dreapta" },
]
const lei = (n: number) => `${n.toLocaleString("ro-RO")} lei`
const mp = (n: number) => `${n.toLocaleString("ro-RO", { maximumFractionDigits: 1 })} mp`

const GRAPHICS: { id: Graphics; label: string; hint?: string }[] = [
    { id: "am", label: "Am grafica gata (fișiere vectoriale)" },
    { id: "noi", label: "Vreau să o facem noi" },
    { id: "ai", label: "Am o simulare făcută cu AI (ChatGPT etc.) și vreau s-o reproduceți", hint: "Simulările generate cu AI nu sunt fișiere de print: le redesenăm de la zero, vectorial, ca să arate la fel pe mașină." },
]

// Wrap cost calculator: the car on the left, the blueprint in the middle (three views, pieces picked
// on the photo; their area gives the square metres), the questions on the right. Behind the questions
// the material is chosen from the price workbook (lib/pricing.ts); the estimate is shown as a range.
export function Calculator({ pricing, rate }: { pricing: PricingConfig; rate: number }) {
    const [body, setBody] = useState<BodyId>("sedan")
    const [model, setModel] = useState("")
    const [query, setQuery] = useState("")
    const [suggest, setSuggest] = useState(false)
    const [view, setView] = useState<View>("stanga")
    const [selected, setSelected] = useState<string[]>([])
    const [hovered, setHovered] = useState<string | null>(null)
    const [years, setYears] = useState(5)
    const [job, setJob] = useState<JobType>("print")
    const [subtype, setSubtype] = useState("")
    const [graphics, setGraphics] = useState<Graphics>("noi")
    const [info, setInfo] = useState(false)
    const [withVat, setWithVat] = useState(true)

    const all = panelsOf(body)
    const selection = useMemo(() => Object.fromEntries(selected.map(id => [id, "colantare" as Mode])), [selected])
    const partial = job === "integrală" && selected.length > 0 && selected.length < all.length

    const chooseBody = (id: BodyId) => {
        setBody(id)
        // pieces the new body has stay picked (side doors etc. differ between bodies); a full wrap stays full
        const allowed = panelsOf(id)
        setSelected(sel => (job === "integrală" && sel.length === all.length ? allowed : sel.filter(k => allowed.includes(k))))
    }
    const chooseModel = (name: string) => {
        const m = models.find(x => x.name === name)
        setModel(name)
        setQuery(name)
        setSuggest(false)
        if (m) chooseBody(m.body)
    }
    const chooseJob = (id: JobType) => {
        setJob(id)
        setSubtype(subtypesOf(pricing, id)[0] ?? "")
        // a full wrap starts with every piece picked; taking pieces off makes it a partial wrap
        if (id === "integrală") setSelected(all)
    }
    const pick = (id: string) => setSelected(sel => (sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id]))
    const turn = (dir: 1 | -1) => setView(v => views[(views.findIndex(x => x.id === v) + dir + views.length) % views.length].id)

    const suggestions = useMemo(() => {
        const q = query.trim().toLowerCase()
        return models.filter(m => (!q || m.name.toLowerCase().includes(q))).slice(0, 8)
    }, [query])

    const result = estimate(pricing, body, selected, { years, job, subtype, graphics, withVat }, rate)
    const jobName = partial ? "Colantare parțială cu folie premium" : JOB_TYPES.find(j => j.id === job)!.label
    const durationName = DURATIONS.find(d => d.years === years)!.label
    const graphicsName = GRAPHICS.find(g => g.id === graphics)!.label
    const materialName = result ? `${result.material.code} ${result.material.name}${result.laminate ? ` + laminare ${result.laminate.code}` : ""}` : ""
    const vatName = withVat ? "cu TVA" : "fără TVA"
    const subtypes = subtypesOf(pricing, job)

    return (
        <SmartForm kind="calculator" className={styles.calc} aria-label="Calculator cost colantare">
            <div className={styles.workspace}>
                {/* ---------- left: the car ---------- */}
                <aside className={styles.panel} aria-label="Mașina">
                    <p className={styles.panelTitle}>1 · Mașina</p>
                    <p className={styles.label}>Tip caroserie</p>
                    <div className={styles.bodies}>
                        {bodyTypes.map(b => (
                            <button type="button" key={b.id} className={styles.bodyBtn} aria-pressed={body === b.id} onClick={() => { chooseBody(b.id); setModel(""); setQuery("") }}>
                                {b.label}
                            </button>
                        ))}
                    </div>
                    <label className={styles.label} htmlFor="calc-model">Modelul (opțional)</label>
                    <div className={styles.combo}>
                        <input
                            id="calc-model"
                            value={query}
                            placeholder="ex. Dacia Duster"
                            autoComplete="off"
                            onChange={e => { setQuery(e.target.value); setModel(""); setSuggest(true) }}
                            onFocus={() => setSuggest(true)}
                            onBlur={() => setTimeout(() => setSuggest(false), 150)}
                            role="combobox"
                            aria-expanded={suggest && suggestions.length > 0}
                            aria-controls="calc-models"
                        />
                        {suggest && suggestions.length > 0 && (
                            <ul id="calc-models" role="listbox" className={styles.suggest}>
                                {suggestions.map(m => (
                                    <li key={m.name} role="option" aria-selected={m.name === model} onMouseDown={e => { e.preventDefault(); chooseModel(m.name) }}>
                                        {m.name}<small>{bodyTypes.find(b => b.id === m.body)!.label}</small>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <p className={styles.note}>Nu e în listă? Alege doar tipul de caroserie: calculul e același pentru mașini similare.</p>
                </aside>

                {/* ---------- middle: the blueprint ---------- */}
                <div className={styles.stage}>
                    <p className={styles.stageHint}>Apasă pe piesele pe care vrei să le colantăm. Din ele calculăm suprafața.</p>
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
                            {hovered ? <>{panelLabel(hovered)} · <em>{selected.includes(hovered) ? "click ca s-o scoți" : "click ca s-o adaugi"}</em></> : `${selected.length} ${selected.length === 1 ? "piesă aleasă" : "piese alese"}`}
                        </p>
                    </div>

                    <div className={styles.viewBar}>
                        <div className={styles.views} role="tablist" aria-label="Unghi">
                            {views.map(v => (
                                <button type="button" key={v.id} role="tab" aria-selected={view === v.id} onClick={() => setView(v.id)}>{v.label}</button>
                            ))}
                        </div>
                        <div className={styles.quick}>
                            <button type="button" onClick={() => setSelected(all)}>Toată mașina</button>
                            <button type="button" onClick={() => setSelected(sidePanels(body))}>Doar laterale</button>
                            <button type="button" onClick={() => setSelected([])} disabled={!selected.length}>Șterge tot</button>
                        </div>
                    </div>
                </div>

                {/* ---------- right: three simple questions; the material is chosen behind them ---------- */}
                <aside className={styles.panel} aria-label="Lucrarea">
                    <p className={styles.panelTitle}>2 · Lucrarea</p>

                    <fieldset className={styles.question}>
                        <legend className={styles.label}>Cât timp vei ține folia pe mașină?</legend>
                        <div className={styles.options}>
                            {DURATIONS.map(d => (
                                <label key={d.years} className={styles.option}>
                                    <input type="radio" name="calc-years" checked={years === d.years} onChange={() => setYears(d.years)} />
                                    <span>{d.label}</span>
                                </label>
                            ))}
                        </div>
                    </fieldset>

                    <fieldset className={styles.question}>
                        <legend className={styles.label}>Ce fel de lucrare vrei?</legend>
                        <div className={styles.options}>
                            {JOB_TYPES.map(j => {
                                const available = jobAvailable(pricing, j.id)
                                return (
                                    <label key={j.id} className={styles.option} data-disabled={!available || undefined}>
                                        <input type="radio" name="calc-job" checked={job === j.id} disabled={!available} onChange={() => chooseJob(j.id)} />
                                        <span>
                                            {j.id === "integrală" && partial ? "Colantare parțială cu folie premium" : j.label}
                                            <small>{available ? j.hint : "în curând"}</small>
                                        </span>
                                    </label>
                                )
                            })}
                        </div>
                        {partial && <p className={styles.notice}>Ai scos câteva piese: calculăm o colantare parțială cu folie premium. Selectează toată mașina ca să revii la integrală.</p>}
                        {subtypes.length > 1 && (
                            <label className={styles.label}>
                                Ce folie?
                                <select className={styles.select} value={subtype} onChange={e => setSubtype(e.target.value)}>
                                    {subtypes.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </label>
                        )}
                    </fieldset>

                    <fieldset className={styles.question}>
                        <legend className={styles.label}>Ai grafica sau o facem noi?</legend>
                        <div className={styles.options}>
                            {GRAPHICS.map(g => (
                                <div key={g.id} className={styles.optionRow}>
                                    <label className={styles.option}>
                                        <input type="radio" name="calc-graphics" checked={graphics === g.id} onChange={() => setGraphics(g.id)} />
                                        <span>{g.label}{g.hint && graphics === g.id && <small>{g.hint}</small>}</span>
                                    </label>
                                    {g.id === "am" && (
                                        <button type="button" className={styles.infoBtn} aria-expanded={info || graphics === "am"} aria-controls="calc-graphics-info" onClick={() => setInfo(v => !v)} aria-label="Ce înseamnă grafică gata de print">i</button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {(info || graphics === "am") && (
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
                    </fieldset>
                </aside>
            </div>

            {/* ---------- the estimate ---------- */}
            <section className={styles.summary} aria-label="Estimare">
                <div className={styles.lines}>
                    <p className={styles.panelTitle}>3 · Estimare</p>
                    {!selected.length || !result ? (
                        <p className={styles.empty}>{result || !selected.length ? "Alege piesele pe mașină: fiecare apare aici, cu suprafața și prețul ei." : "Pentru lucrarea aleasă nu avem încă prețuri. Trimite-ne cererea și revenim cu o ofertă."}</p>
                    ) : (
                        <ul>
                            {result.lines.map(l => (
                                <li key={l.id}>
                                    <i aria-hidden="true" />
                                    <span>{panelLabel(l.id)}<small>{mp(l.mp)}</small></span>
                                    <strong>{lei(l.lei)}</strong>
                                    <button type="button" onClick={() => pick(l.id)} aria-label={`Scoate ${panelLabel(l.id)}`}>×</button>
                                </li>
                            ))}
                            {result.graphicsLei > 0 && <li className={styles.extra}><i aria-hidden="true" /><span>Grafică<small>{graphics === "ai" ? "reproducere după simulare AI" : "realizată de noi"}</small></span><strong>{lei(result.graphicsLei)}</strong></li>}
                        </ul>
                    )}
                </div>
                <div className={styles.total}>
                    <span>Estimare orientativă</span>
                    <strong>{result && selected.length ? `${lei(result.low)} – ${lei(result.high)}` : "–"}</strong>
                    <div className={styles.vat} role="radiogroup" aria-label="TVA">
                        <label><input type="radio" name="calc-vat" checked={withVat} onChange={() => setWithVat(true)} /> cu TVA</label>
                        <label><input type="radio" name="calc-vat" checked={!withVat} onChange={() => setWithVat(false)} /> fără TVA</label>
                    </div>
                    {result && selected.length > 0 && (
                        <small>{model || bodyTypes.find(b => b.id === body)!.label} · {mp(result.mp)} · {materialName}</small>
                    )}
                    {result?.shortfall && <small className={styles.notice}>Pentru {durationName.toLowerCase()} recomandăm altă lucrare: folia aleasă ține până la {result.shortfall} ani.</small>}
                    <small className={styles.disclaimer}>Prețul final îl confirmăm după ce vedem mașina și grafica.</small>
                </div>
            </section>

            {/* the configuration travels with the request */}
            <input type="hidden" name="caroserie" value={bodyTypes.find(b => b.id === body)!.label} />
            <input type="hidden" name="model" value={model || query} />
            <input type="hidden" name="durata" value={durationName} />
            <input type="hidden" name="lucrare" value={jobName + (subtype && subtypes.length > 1 ? ` (${subtype})` : "")} />
            <input type="hidden" name="material" value={materialName} />
            <input type="hidden" name="grafica" value={graphicsName} />
            <input type="hidden" name="piese" value={result ? result.lines.map(l => `${panelLabel(l.id)}: ${mp(l.mp)} (${lei(l.lei)})`).join("\n") : selected.map(panelLabel).join("\n")} />
            <input type="hidden" name="estimare" value={result && selected.length ? `${lei(result.low)} – ${lei(result.high)} ${vatName}` : ""} />

            <section className={styles.request} aria-label="Trimite cererea">
                <p className={styles.panelTitle}>4 · Trimite configurația</p>
                <div className={styles.contact}>
                    <label className={form.field}>Nume și prenume *<input name="nume" autoComplete="name" required /></label>
                    <label className={form.field}>
                        Telefon *
                        <span className={form.phoneRow}><span>+40</span><input name="telefon" type="tel" autoComplete="tel-national" inputMode="tel" placeholder="722 12 34 56" pattern="[0-9 ]{9,12}" required /></span>
                    </label>
                    <label className={form.field}>Email *<input name="email" type="email" autoComplete="email" required /></label>
                </div>
                <div className={styles.sendRow}>
                    <Consent />
                    <button type="submit" className="btn">Trimite cererea de ofertă</button>
                </div>
            </section>
        </SmartForm>
    )
}
