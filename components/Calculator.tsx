"use client"

import { useMemo, useState } from "react"
import { CarBlueprint } from "./CarBlueprint"
import { Consent, SmartForm } from "./SmartForm"
import {
    bodyTypes, DESIGN_PRICE, films, models, modes, panelLabel, panelPrice, panelsOf, PRICES_PROVISIONAL,
    REMOVAL_PER_PANEL, sidePanels, type BodyId, type Mode, type View,
} from "@/data/calculator"
import form from "@/app/form.module.css"
import styles from "./Calculator.module.css"

const views: { id: View; label: string }[] = [
    { id: "stanga", label: "Stânga" },
    { id: "sus", label: "Sus" },
    { id: "dreapta", label: "Dreapta" },
]
const lei = (n: number) => `${n.toLocaleString("ro-RO")} lei`

// Wrap cost calculator: body type and model on the left, the car blueprint in the middle (three
// views, panels picked with the current tool), film and extras on the right, the itemised estimate
// underneath and the request form under it. The whole configuration is sent with the request.
export function Calculator() {
    const [body, setBody] = useState<BodyId>("sedan")
    const [model, setModel] = useState("")
    const [query, setQuery] = useState("")
    const [suggest, setSuggest] = useState(false)
    const [view, setView] = useState<View>("stanga")
    const [tool, setTool] = useState<Mode>("colantare")
    const [selection, setSelection] = useState<Record<string, Mode>>({})
    const [hovered, setHovered] = useState<string | null>(null)
    const [film, setFilm] = useState<(typeof films)[number]["id"]>("standard")
    const [design, setDesign] = useState(false)
    const [removal, setRemoval] = useState(false)

    const chooseBody = (id: BodyId) => {
        setBody(id)
        // panels that the new body has keep their work (side doors etc. differ between bodies)
        const allowed = new Set(panelsOf(id))
        setSelection(sel => Object.fromEntries(Object.entries(sel).filter(([k]) => allowed.has(k))))
    }
    const chooseModel = (name: string) => {
        const m = models.find(x => x.name === name)
        setModel(name)
        setQuery(name)
        setSuggest(false)
        if (m) chooseBody(m.body)
    }
    const pick = (id: string) => setSelection(sel => {
        const next = { ...sel }
        if (next[id] === tool) delete next[id]
        else next[id] = tool
        return next
    })
    const applyAll = (ids: string[]) => setSelection(sel => ({ ...sel, ...Object.fromEntries(ids.map(id => [id, tool])) }))
    const turn = (dir: 1 | -1) => setView(v => views[(views.findIndex(x => x.id === v) + dir + views.length) % views.length].id)

    const suggestions = useMemo(() => {
        const q = query.trim().toLowerCase()
        return models.filter(m => (!q || m.name.toLowerCase().includes(q))).slice(0, 8)
    }, [query])

    const filmFactor = films.find(f => f.id === film)!.factor
    const lines = Object.entries(selection).map(([id, mode]) => ({
        id, mode,
        label: panelLabel(id),
        price: Math.round((panelPrice(body, id, mode) * filmFactor) / 10) * 10,
    }))
    const panelsTotal = lines.reduce((n, l) => n + l.price, 0)
    const extras = (design ? DESIGN_PRICE : 0) + (removal ? REMOVAL_PER_PANEL * lines.length : 0)
    const total = panelsTotal + extras
    const modeName = (m: Mode) => modes.find(x => x.id === m)!.label

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
                    <div className={styles.tools} role="radiogroup" aria-label="Ce lucrare aplici">
                        {modes.map(m => (
                            <button type="button" key={m.id} role="radio" aria-checked={tool === m.id} className={styles.tool} data-mode={m.id} onClick={() => setTool(m.id)}>
                                <span className={styles.swatch} aria-hidden="true" />
                                <span><strong>{m.label}</strong><small>{m.hint}</small></span>
                            </button>
                        ))}
                    </div>

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
                            {hovered ? <>{panelLabel(hovered)} · <em>click pentru {modeName(tool).toLowerCase()}</em></> : "Apasă pe o piesă ca s-o selectezi"}
                        </p>
                    </div>

                    <div className={styles.viewBar}>
                        <div className={styles.views} role="tablist" aria-label="Unghi">
                            {views.map(v => (
                                <button type="button" key={v.id} role="tab" aria-selected={view === v.id} onClick={() => setView(v.id)}>{v.label}</button>
                            ))}
                        </div>
                        <div className={styles.quick}>
                            <button type="button" onClick={() => applyAll(panelsOf(body))}>Toată mașina</button>
                            <button type="button" onClick={() => applyAll(sidePanels(body))}>Doar laterale</button>
                            <button type="button" onClick={() => setSelection({})} disabled={!lines.length}>Șterge tot</button>
                        </div>
                    </div>
                </div>

                {/* ---------- right: material and extras ---------- */}
                <aside className={styles.panel} aria-label="Material și extra">
                    <p className={styles.panelTitle}>2 · Material</p>
                    <p className={styles.label}>Tip folie</p>
                    <div className={styles.options}>
                        {films.map(f => (
                            <label key={f.id} className={styles.option}>
                                <input type="radio" checked={film === f.id} onChange={() => setFilm(f.id)} />
                                <span>{f.label}</span>
                            </label>
                        ))}
                    </div>
                    <p className={styles.label}>Servicii suplimentare</p>
                    <div className={styles.options}>
                        <label className={styles.option}>
                            <input type="checkbox" checked={design} onChange={e => setDesign(e.target.checked)} />
                            <span>Design grafic personalizat <small>+{lei(DESIGN_PRICE)}</small></span>
                        </label>
                        <label className={styles.option}>
                            <input type="checkbox" checked={removal} onChange={e => setRemoval(e.target.checked)} />
                            <span>Demontare colant vechi <small>+{lei(REMOVAL_PER_PANEL)} / piesă</small></span>
                        </label>
                    </div>
                    <div className={styles.legend} aria-hidden="true">
                        {modes.map(m => <span key={m.id} data-mode={m.id}><i />{m.label}</span>)}
                    </div>
                </aside>
            </div>

            {/* ---------- the estimate ---------- */}
            <section className={styles.summary} aria-label="Estimare">
                <div className={styles.lines}>
                    <p className={styles.panelTitle}>3 · Estimare</p>
                    {lines.length === 0 ? (
                        <p className={styles.empty}>Alege piesele pe mașină: fiecare apare aici, cu prețul ei.</p>
                    ) : (
                        <ul>
                            {lines.map(l => (
                                <li key={l.id} data-mode={l.mode}>
                                    <i aria-hidden="true" />
                                    <span>{l.label}<small>{modeName(l.mode)}</small></span>
                                    <strong>{lei(l.price)}</strong>
                                    <button type="button" onClick={() => setSelection(sel => { const n = { ...sel }; delete n[l.id]; return n })} aria-label={`Scoate ${l.label}`}>×</button>
                                </li>
                            ))}
                            {design && <li className={styles.extra}><i aria-hidden="true" /><span>Design grafic personalizat</span><strong>{lei(DESIGN_PRICE)}</strong></li>}
                            {removal && <li className={styles.extra}><i aria-hidden="true" /><span>Demontare colant vechi ({lines.length} piese)</span><strong>{lei(REMOVAL_PER_PANEL * lines.length)}</strong></li>}
                        </ul>
                    )}
                </div>
                <div className={styles.total}>
                    <span>Estimare orientativă</span>
                    <strong>{lei(total)}</strong>
                    <small>{model || bodyTypes.find(b => b.id === body)!.label} · {films.find(f => f.id === film)!.label}</small>
                    <small className={styles.disclaimer}>
                        {PRICES_PROVISIONAL ? "Prețuri provizorii, în curs de actualizare. " : ""}Prețul final îl confirmăm după ce vedem mașina și grafica.
                    </small>
                </div>
            </section>

            {/* the configuration travels with the request */}
            <input type="hidden" name="caroserie" value={bodyTypes.find(b => b.id === body)!.label} />
            <input type="hidden" name="model" value={model || query} />
            <input type="hidden" name="folie" value={films.find(f => f.id === film)!.label} />
            <input type="hidden" name="piese" value={lines.map(l => `${l.label}: ${modeName(l.mode)} (${lei(l.price)})`).join("\n")} />
            {design && <input type="hidden" name="extra" value="Design grafic personalizat" />}
            {removal && <input type="hidden" name="extra" value="Demontare colant vechi" />}
            <input type="hidden" name="estimare" value={lei(total)} />

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
