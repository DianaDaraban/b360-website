"use client"

import { useEffect, useRef, useState } from "react"
import { Consent, SmartForm } from "./SmartForm"
import { Icon } from "./Icon"
import { Room3D, wallNames, type RoomWall } from "./Room3D"
import { InteriorDialog, InteriorPreview, Lens } from "./InteriorPreview"
import { estimateTapet, FINISHES, grossArea, IMAGE_SOURCES, materialArea, netArea, openingsArea, OPENINGS, PLACES, roomReady, ROOMS, stripsOf, TAPET, wallDpi, type Finish, type ImageSource, type OpeningKind, type Place, type Room } from "@/data/tapet"
import { CATALOG, CATALOG_STYLES, catalogImage, type CatalogStyle } from "@/data/tapet-catalog"
import { site } from "@/lib/site"
import form from "@/app/form.module.css"
import calc from "./Calculator.module.css"
import styles from "./TapetCalculator.module.css"

const MAX_WALLS = 4         // the 3D room goes round four walls
const MAX_OPENINGS = 4
const MAX_FILE = 4 * 1024 * 1024      // what the form can carry; bigger images come by e-mail or WhatsApp
const lei = (n: number) => `${n.toLocaleString("ro-RO")} lei`
const mp = (n: number) => `${n.toLocaleString("ro-RO", { maximumFractionDigits: 1 })} mp`
const num = (v: string, hi: number) => Math.min(hi, Math.max(0, Number(v) || 0))
const digits = (v: string) => v.replace(/\D/g, "").slice(0, 4)

// the same mix for the same seed (so the page renders alike on the server and in the browser)
function shuffled<T>(list: T[], seed: number) {
    const out = [...list]
    let a = seed >>> 0
    const rand = () => {
        a = (a + 0x6d2b79f5) >>> 0
        let t = a
        t = Math.imul(t ^ (t >>> 15), t | 1)
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]]
    }
    return out
}

// sizes are kept as typed (text), so a field can be emptied while typing
type OpeningState = { id: number; kind: OpeningKind; w: string; h: string; x: number; y: number }
type WallState = { id: number; w: string; h: string; openings: OpeningState[] }
type Img = { url: string; name: string; w: number; h: number; size: number }

// Printed wallpaper calculator, in the steps of the car calculator: the walls (sizes, doors and
// windows, in a 3D room with the client's images on them), the image, the room, the place, then the
// estimate and the request. Prices live in data/tapet.ts; until they are set the estimate says
// "în curând" and the request still carries everything.
export function TapetCalculator() {
    const ids = useRef(10)
    const next = () => ++ids.current
    const [walls, setWalls] = useState<WallState[]>([{ id: 1, w: "350", h: "260", openings: [] }])
    const [focus, setFocus] = useState<number | null>(null)
    const [source, setSource] = useState<ImageSource>("catalog")
    const [perWall, setPerWall] = useState(false)
    const [images, setImages] = useState<Record<string, Img | undefined>>({})
    // catalogue designs picked: one for all the walls ("shared") or one per wall (by wall id)
    const [picks, setPicks] = useState<Record<string, string | undefined>>({})
    const [catStyle, setCatStyle] = useState<CatalogStyle | "toate">("toate")
    const [target, setTarget] = useState(0)          // the wall a catalogue pick goes on, one per wall
    // the wall looked at in 3D and the wall chosen in the catalogue are kept the same
    const chooseWall = (i: number | null) => { setFocus(i); if (i != null) setTarget(i) }
    const [room, setRoom] = useState<Room>("casa")
    const [place, setPlace] = useState<Place>("local")
    const [finish, setFinish] = useState<Finish>("canvas")
    const [zoom, setZoom] = useState<number | null>(null)     // the catalogue design open big
    // the strip under the 3D room: one style or all of them, mixed (a new mix at each tap on "amestecă")
    const [stripStyle, setStripStyle] = useState<CatalogStyle | "toate">("toate")
    const [seed, setSeed] = useState(7)

    // the previews are local object URLs: let them go when the page closes
    const imagesRef = useRef(images)
    useEffect(() => { imagesRef.current = images }, [images])
    useEffect(() => () => Object.values(imagesRef.current).forEach(i => i && URL.revokeObjectURL(i.url)), [])

    const sized = walls.map(x => ({
        id: x.id,
        w: num(x.w, 3000),
        h: num(x.h, 800),
        openings: x.openings.map(o => ({ id: o.id, kind: o.kind, w: num(o.w, 3000), h: num(o.h, 800), x: o.x, y: o.y })).filter(o => o.w > 0 && o.h > 0),
    }))
    const valid = sized.filter(x => x.w >= 20 && x.h >= 20)
    const allValid = valid.length === walls.length
    const names = wallNames(walls.length)
    const split = perWall && walls.length > 1
    const designOf = (code?: string) => CATALOG.find(c => c.code === code)
    // what is on a wall: the client's own image or a catalogue design (with the name the request shows)
    const imageOf = (id: number): { url: string; name: string } | undefined => {
        if (source === "am") return split ? images[id] : images.shared
        if (source === "catalog") {
            const d = designOf(split ? picks[id] : picks.shared)
            return d && { url: catalogImage(d.code), name: `${d.code} ${d.title} (${d.artist})` }
        }
        return undefined
    }

    const gross = grossArea(valid), holes = openingsArea(valid), net = netArea(valid), material = materialArea(valid)
    const strips = valid.reduce((s, x) => s + stripsOf(x), 0)
    const result = valid.length ? estimateTapet(valid, room) : null
    const totalText = result ? `${lei(result.net)} + TVA` : null

    // ---------- walls ----------
    const editWall = (id: number, patch: Partial<WallState>) => setWalls(ws => ws.map(x => (x.id === id ? { ...x, ...patch } : x)))
    // when a wall gets smaller its doors and windows are pushed in and, if they still do not fit,
    // shrunk: first moved (left, down), then cut to the wall's width and height
    const fitOpenings = (wall: WallState): WallState => {
        const W = num(wall.w, 3000), H = num(wall.h, 800)
        if (W < 20 || H < 20) return wall
        return {
            ...wall,
            openings: wall.openings.map(o => {
                let w = num(o.w, 3000), h = num(o.h, 800), x = o.x, y = o.y
                if (x + w > W) x = Math.max(0, W - w)
                if (w > W) w = W
                if (y + h > H) y = Math.max(0, H - h)
                if (h > H) h = H
                return w === num(o.w, 3000) && h === num(o.h, 800) && x === o.x && y === o.y ? o : { ...o, w: String(w), h: String(h), x, y }
            }),
        }
    }
    const fitWall = (id: number) => setWalls(ws => ws.map(x => (x.id === id ? fitOpenings(x) : x)))
    const addWall = () => setWalls(ws => (ws.length < MAX_WALLS ? [...ws, { id: next(), w: "300", h: ws[ws.length - 1]?.h || "260", openings: [] }] : ws))
    const removeWall = (id: number) => { setFocus(null); setWalls(ws => (ws.length > 1 ? ws.filter(x => x.id !== id) : ws)) }
    const moveWall = (from: number, to: number) => {
        if (to < 0 || to >= walls.length || from === to) return
        setFocus(null)
        setWalls(ws => { const c = [...ws]; const [x] = c.splice(from, 1); c.splice(to, 0, x); return c })
    }
    const addOpening = (wi: number, kind: OpeningKind) => {
        const w = sized[wi], d = OPENINGS[kind]
        const x = Math.max(0, Math.round((w.w - d.w) / 2 + (w.openings.length % 2 ? 1 : -1) * Math.min(w.openings.length, 1) * w.w * 0.25))
        editWall(walls[wi].id, { openings: [...walls[wi].openings, { id: next(), kind, w: String(d.w), h: String(d.h), x, y: d.y }] })
        setFocus(wi)
    }
    const editOpening = (wi: number, oid: number, patch: Partial<OpeningState>) =>
        editWall(walls[wi].id, { openings: walls[wi].openings.map(o => (o.id === oid ? { ...o, ...patch } : o)) })
    const removeOpening = (wi: number, oid: number) => editWall(walls[wi].id, { openings: walls[wi].openings.filter(o => o.id !== oid) })

    // dragging a wall by its handle changes its place in the room (left, back, right, front)
    const items = useRef<(HTMLLIElement | null)[]>([])
    const [draggingWall, setDraggingWall] = useState<number | null>(null)
    const onHandleDown = (e: React.PointerEvent, index: number) => {
        e.preventDefault()
        let at = index
        setDraggingWall(walls[index].id)
        const move = (ev: PointerEvent) => {
            const rects = items.current.slice(0, walls.length).map(el => el?.getBoundingClientRect())
            let to = rects.findIndex(r => r && ev.clientY < r.top + r.height / 2)
            if (to < 0) to = walls.length - 1
            if (to !== at) { moveWall(at, to); at = to }
        }
        const up = () => {
            window.removeEventListener("pointermove", move)
            window.removeEventListener("pointerup", up)
            setDraggingWall(null)
        }
        window.addEventListener("pointermove", move)
        window.addEventListener("pointerup", up)
    }

    // ---------- images ----------
    const onFile = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        const old = images[key]
        if (old) URL.revokeObjectURL(old.url)
        if (!file) return setImages(m => ({ ...m, [key]: undefined }))
        const url = URL.createObjectURL(file)
        const img = new Image()
        img.onload = () => setImages(m => ({ ...m, [key]: { url, name: file.name, w: img.naturalWidth, h: img.naturalHeight, size: file.size } }))
        img.onerror = () => { URL.revokeObjectURL(url); setImages(m => ({ ...m, [key]: undefined })) }
        img.src = url
    }
    // sharpness on each wall; one shared image is judged on the biggest wall, where it shows first
    const level = (dpi: number) => (dpi >= 100 ? "bun" : dpi >= 60 ? "limita" : "mic")
    const verdicts = (() => {
        if (source !== "am") return []
        if (perWall && walls.length > 1) {
            return sized.flatMap((w, i) => {
                const img = images[w.id]
                return img && w.w >= 20 && w.h >= 20 ? [{ key: String(w.id), who: names[i], dpi: wallDpi(img, w), img }] : []
            })
        }
        const img = images.shared
        const big = valid.reduce<(typeof valid)[number] | null>((b, x) => (!b || x.w * x.h > b.w * b.h ? x : b), null)
        return img && big ? [{ key: "shared", who: walls.length > 1 ? "Peretele cel mai mare" : "", dpi: wallDpi(img, big), img }] : []
    })()
    const VERDICT = {
        bun: "rezoluție bună: va arăta clar și de aproape.",
        limita: "merge, dar e la limită: privită de la un metru sau mai mult arată bine. O verificăm noi înainte de print.",
        mic: "imaginea e prea mică pentru perete: de aproape s-ar vedea pixelii. Trimite-ne originalul sau te ajutăm să găsim una la rezoluție mai mare.",
    }
    const sendKeys = source !== "am" ? [] : perWall && walls.length > 1 ? walls.map(w => String(w.id)) : ["shared"]
    const tooBig = sendKeys.some(k => (images[k]?.size ?? 0) > MAX_FILE)

    // ---------- the request ----------
    const sourceName = IMAGE_SOURCES.find(x => x.id === source)!.label
    const roomName = ROOMS.find(x => x.id === room)!.label
    const placeName = PLACES.find(x => x.id === place)!.label
    const finishName = FINISHES.find(x => x.id === finish)!.label
    const wallsText = sized.map((x, i) => {
        const ops = x.openings.map(o => `${OPENINGS[o.kind].label.toLowerCase()} ${o.w} × ${o.h} cm la ${o.x} cm de la stânga${o.kind === "fereastra" ? `, ${o.y} cm de la podea` : ""}`)
        const img = imageOf(x.id)
        return `${names[i]}: ${x.w} × ${x.h} cm${ops.length ? ` (${ops.join("; ")})` : ""}${img ? ` · imagine ${img.name}` : ""}`
    }).join("\n")
    const imageText = sourceName + (source === "catalog" ? (split ? walls.map((w, i) => `
${names[i]}: ${imageOf(w.id)?.name ?? "nealeasă"}`).join("") : `: ${imageOf(walls[0].id)?.name ?? "nealeasă"}`) : "")
        + (verdicts.length ? `\n${verdicts.map(v => `${v.img.name}, ${v.img.w} × ${v.img.h} px, ~${Math.round(v.dpi)} dpi${v.who ? ` (${v.who.toLowerCase()})` : ""}`).join("\n")}` : "")
        + (tooBig ? "\nimagine peste 4 MB, neatașată" : "")
    const openingsCount = sized.reduce((n, x) => n + x.openings.length, 0)
    const whatsappHref = valid.length > 0 && `${site.whatsapp}?text=${encodeURIComponent(`Bună ziua! Am folosit calculatorul de tapet de pe ${site.url.replace(/^https?:\/\/(www\.)?/, "")}: ${valid.map(x => `${x.w} × ${x.h} cm`).join(", ")}${openingsCount ? ` cu ${openingsCount} ${openingsCount === 1 ? "ușă/fereastră" : "uși și ferestre"}` : ""} (${mp(net)} de tapet pe perete), ${roomName.toLowerCase()}, ${finishName.toLowerCase()}, ${placeName}${totalText ? `, estimare ${totalText}` : ""}. Aș dori o ofertă.`)}`

    const room3d: RoomWall[] = sized.map(x => ({ ...x, w: Math.max(x.w, 20), h: Math.max(x.h, 20), image: imageOf(x.id)?.url }))


    // a design picked for one wall from the 3D view: switch to the catalogue, one design per wall, and
    // keep what the other walls showed (the shared design, if there was one)
    const putOnWall = (wi: number, code: string) => {
        const id = walls[wi].id
        if (walls.length === 1) { setSource("catalog"); setPicks(m => ({ ...m, shared: code })); return }
        setPicks(m => {
            const next = { ...m }
            if (!split || source !== "catalog") walls.forEach(w => { if (next[w.id] === undefined) next[w.id] = source === "catalog" ? m.shared : undefined })
            next[id] = code
            return next
        })
        setSource("catalog")
        setPerWall(true)
        setTarget(wi)
    }

    return (
        // data-no-reveal: the site's scroll-in fade must not touch the calculator's own lists and fields
        <SmartForm kind="tapet" className={calc.calc} aria-label="Calculator tapet printat" data-no-reveal="">
            {/* ---------- 1: the walls ---------- */}
            <Step n={1} title="Cât de mari sunt pereții?" hint="Lățimea și înălțimea fiecărui perete, în centimetri. Adaugă ușile și ferestrele: le scădem din suprafață și le vezi pe perete.">
                <div className={styles.walls}>
                    <div className={styles.editor}>
                        <ol className={styles.list}>
                            {walls.map((x, i) => (
                                <li key={x.id} ref={el => { items.current[i] = el }} className={styles.wall} data-dragging={draggingWall === x.id || undefined} data-active={focus === i || undefined}>
                                    <div className={styles.wallHead}>
                                        {walls.length > 1 && (
                                            <button
                                                type="button"
                                                className={styles.handle}
                                                onPointerDown={e => onHandleDown(e, i)}
                                                onKeyDown={e => { if (e.key === "ArrowUp") { e.preventDefault(); moveWall(i, i - 1) } if (e.key === "ArrowDown") { e.preventDefault(); moveWall(i, i + 1) } }}
                                                aria-label={`Mută peretele ${names[i].toLowerCase()} (săgeți sus și jos)`}
                                                title="Trage ca să schimbi locul peretelui"
                                            >
                                                <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="6" r="1.4" /><circle cx="15" cy="6" r="1.4" /><circle cx="9" cy="12" r="1.4" /><circle cx="15" cy="12" r="1.4" /><circle cx="9" cy="18" r="1.4" /><circle cx="15" cy="18" r="1.4" /></svg>
                                            </button>
                                        )}
                                        <button type="button" className={styles.wallName} onClick={() => chooseWall(focus === i ? null : i)}>{names[i]}</button>
                                        <div className={styles.dims}>
                                            <Size label="lățime" value={x.w} onChange={v => editWall(x.id, { w: digits(v) })} onBlur={() => fitWall(x.id)} aria={`Lățimea peretelui ${names[i].toLowerCase()}`} />
                                            <span className={styles.times} aria-hidden="true">×</span>
                                            <Size label="înălțime" value={x.h} onChange={v => editWall(x.id, { h: digits(v) })} onBlur={() => fitWall(x.id)} aria={`Înălțimea peretelui ${names[i].toLowerCase()}`} />
                                        </div>
                                        <button type="button" className={styles.remove} onClick={() => removeWall(x.id)} disabled={walls.length === 1} aria-label={`Scoate peretele ${names[i].toLowerCase()}`}>×</button>
                                    </div>
                                    {x.openings.map(o => {
                                        // the distances to the wall's edges: typing one moves the opening
                                        const W = sized[i].w, H = sized[i].h, ow = num(o.w, 3000), oh = num(o.h, 800)
                                        const left = Math.min(o.x, Math.max(W - ow, 0)), bottom = Math.min(o.y, Math.max(H - oh, 0))
                                        const setX = (v: number) => editOpening(i, o.id, { x: Math.min(Math.max(v, 0), Math.max(W - ow, 0)) })
                                        const setY = (v: number) => editOpening(i, o.id, { y: Math.min(Math.max(v, 0), Math.max(H - oh, 0)) })
                                        const name = OPENINGS[o.kind].label.toLowerCase()
                                        return (
                                            <div key={o.id} className={styles.opening}>
                                                <div className={styles.openingRow}>
                                                    <span className={styles.kind} data-kind={o.kind}>{OPENINGS[o.kind].label}</span>
                                                    <div className={styles.dims}>
                                                        <Size label="lățime" value={o.w} onChange={v => editOpening(i, o.id, { w: digits(v) })} aria={`Lățimea: ${name}`} />
                                                        <span className={styles.times} aria-hidden="true">×</span>
                                                        <Size label="înălțime" value={o.h} onChange={v => editOpening(i, o.id, { h: digits(v) })} aria={`Înălțimea: ${name}`} />
                                                    </div>
                                                    <button type="button" className={styles.remove} onClick={() => removeOpening(i, o.id)} aria-label={`Scoate ${name}`}>×</button>
                                                </div>
                                                <div className={styles.distRow}>
                                                    <Size label="de la stânga" value={String(left)} onChange={v => setX(Number(digits(v)))} aria={`Distanța de la marginea stângă la ${name}`} />
                                                    <Size label="până la dreapta" value={String(Math.max(W - ow - left, 0))} onChange={v => setX(W - ow - Number(digits(v)))} aria={`Distanța de la ${name} la marginea dreaptă`} />
                                                    {o.kind === "fereastra" && <>
                                                        <Size label="de la podea" value={String(bottom)} onChange={v => setY(Number(digits(v)))} aria={`Distanța de la podea la ${name}`} />
                                                        <Size label="până la tavan" value={String(Math.max(H - oh - bottom, 0))} onChange={v => setY(H - oh - Number(digits(v)))} aria={`Distanța de la ${name} la tavan`} />
                                                    </>}
                                                </div>
                                            </div>
                                        )
                                    })}
                                    {x.openings.length < MAX_OPENINGS && (
                                        <div className={styles.addOpenings}>
                                            <button type="button" onClick={() => addOpening(i, "usa")}>+ Ușă</button>
                                            <button type="button" onClick={() => addOpening(i, "fereastra")}>+ Fereastră</button>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ol>
                        {walls.length < MAX_WALLS && (
                            <div className={calc.quick}>
                                <button type="button" onClick={addWall}>
                                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
                                    Adaugă un perete
                                </button>
                            </div>
                        )}
                        {/* every design now on the walls, to open in real interiors */}
                        <InteriorPreview designs={[...new Map(walls.map(w => imageOf(w.id)).filter((d): d is { url: string; name: string } => Boolean(d)).map(d => [d.url, d])).values()]} />
                    </div>
                    <div className={styles.view}>
                        <Room3D
                            walls={room3d}
                            focus={focus}
                            onFocus={chooseWall}
                            onMoveOpening={(wi, oid, x, y) => editOpening(wi, oid, { x, y })}
                            onResizeWall={(wi, w, h) => setWalls(ws => ws.map((x, j) => (
                                // a room has one ceiling: raising one wall raises them all; the length is per wall
                                fitOpenings(j === wi ? { ...x, w: String(w), h: String(h) } : { ...x, h: String(h) })
                            )))}
                        />
                        {walls.length > 1 && (
                            <div className={`${calc.views} ${styles.switch}`} role="radiogroup" aria-label="Vedere">
                                <button type="button" role="radio" aria-checked={focus == null} onClick={() => setFocus(null)}>Camera</button>
                                {names.map((n, i) => <button type="button" role="radio" key={walls[i].id} aria-checked={focus === i} onClick={() => chooseWall(i)}>{n}</button>)}
                            </div>
                        )}
                        {/* with a wall chosen in 3D, a design goes straight on that wall from this strip */}
                        {focus != null && focus < walls.length && (
                            <div className={styles.quickPick}>
                                <div className={styles.stripBar}>
                                    <p>Alege un model pentru <b>{walls.length === 1 ? "perete" : `peretele ${names[focus].toLowerCase()}`}</b>:</p>
                                    <select value={stripStyle} onChange={e => setStripStyle(e.target.value as CatalogStyle | "toate")} aria-label="Stilul modelelor">
                                        <option value="toate">Toate stilurile</option>
                                        {CATALOG_STYLES.map(st => <option key={st.id} value={st.id}>{st.label}</option>)}
                                    </select>
                                    <button type="button" className={styles.shuffle} onClick={() => setSeed(Math.floor(Math.random() * 1e9))}>
                                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h3.5c2 0 3.2 1 4.3 2.8l2.4 4.4C14.3 16 15.5 17 17.5 17H21M3 17h3.5c1.2 0 2.1-.4 2.9-1.2M14.6 8.2c.8-.8 1.7-1.2 2.9-1.2H21M18 4l3 3-3 3M18 14l3 3-3 3" /></svg>
                                        Amestecă
                                    </button>
                                </div>
                                <div className={styles.strip}>
                                    {shuffled(CATALOG.filter(d => stripStyle === "toate" || d.style === stripStyle), seed).map(d => {
                                        const on = imageOf(walls[focus].id)?.url === catalogImage(d.code)
                                        return (
                                            <button type="button" key={d.code} aria-pressed={on} title={d.title} onClick={() => putOnWall(focus, d.code)}>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={catalogImage(d.code, "s")} alt={d.title} loading="lazy" width={120} height={67} />
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Step>

            {/* ---------- 2: the image ---------- */}
            <Step n={2} title="Ce imagine punem pe perete?">
                <div className={`${calc.choices} ${calc.three}`} role="radiogroup" aria-label="Imaginea">
                    {IMAGE_SOURCES.map(x => <Choice key={x.id} name="tapet-imagine" checked={source === x.id} onChange={() => setSource(x.id)} title={x.label} text={x.hint} />)}
                </div>
                {source !== "noi" && walls.length > 1 && (
                    <div className={`${calc.views} ${styles.switch}`} role="radiogroup" aria-label="Imagini pe pereți">
                        <button type="button" role="radio" aria-checked={!perWall} onClick={() => setPerWall(false)}>Aceeași imagine pe toți pereții</button>
                        <button type="button" role="radio" aria-checked={perWall} onClick={() => setPerWall(true)}>Câte o imagine pe fiecare perete</button>
                    </div>
                )}
                {/* every upload field stays in the page, so a picked file is never lost when switching;
                    only the ones in use are named, and so sent */}
                <div className={styles.uploads} hidden={source !== "am"}>
                    <Upload hidden={perWall && walls.length > 1} name={sendKeys.includes("shared") && (images.shared?.size ?? 0) <= MAX_FILE} img={images.shared} label={walls.length > 1 ? "Imaginea pentru toți pereții" : ""} onChange={onFile("shared")} />
                    {walls.map((w, i) => (
                        <Upload key={w.id} hidden={!(perWall && walls.length > 1)} name={sendKeys.includes(String(w.id)) && (images[w.id]?.size ?? 0) <= MAX_FILE} img={images[w.id]} label={names[i]} onChange={onFile(String(w.id))} />
                    ))}
                </div>
                {verdicts.map(v => (
                    <p key={v.key} className={styles.verdict} data-level={level(v.dpi)}>{v.who ? <b>{v.who}: </b> : null}{VERDICT[level(v.dpi)]}</p>
                ))}
                {tooBig && <p className={calc.notice}>O imagine are peste 4 MB, deci nu o putem atașa la cerere. Trimite-ne-o pe WhatsApp sau la {site.email}.</p>}
                {source === "catalog" && (() => {
                    const key = split ? String(walls[Math.min(target, walls.length - 1)].id) : "shared"
                    const chosen = designOf(picks[key])
                    const order = (c: { style: CatalogStyle }) => CATALOG_STYLES.findIndex(st => st.id === c.style)
                    const shown = CATALOG.filter(c => catStyle === "toate" || c.style === catStyle).sort((a, b) => order(a) - order(b))
                    return (
                        <div className={styles.catalog}>
                            {split && (
                                <div className={styles.target}>
                                    <span>Alegi pentru peretele:</span>
                                    <div className={`${calc.views} ${styles.switch}`} role="radiogroup" aria-label="Peretele">
                                        {names.map((n, i) => <button type="button" role="radio" key={walls[i].id} aria-checked={Math.min(target, walls.length - 1) === i} onClick={() => chooseWall(i)}>{n}</button>)}
                                    </div>
                                </div>
                            )}
                            <div className={styles.chips} role="radiogroup" aria-label="Stilul">
                                {[{ id: "toate" as const, label: "Toate" }, ...CATALOG_STYLES].map(st => (
                                    <label key={st.id} className={styles.chip}>
                                        <input type="radio" name="tapet-stil" checked={catStyle === st.id} onChange={() => setCatStyle(st.id)} />
                                        {st.label}
                                    </label>
                                ))}
                            </div>
                            <div className={styles.designs}>
                                {shown.map((d, i) => (
                                    <div key={d.code} className={styles.designWrap}>
                                        <button type="button" className={styles.design} aria-pressed={picks[key] === d.code} onClick={() => setPicks(m => ({ ...m, [key]: d.code }))}>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={catalogImage(d.code, "s")} alt="" loading="lazy" width={240} height={Math.round(240 / d.ratio)} />
                                            <span><b>{d.title}</b><small>{d.artist} · {d.code}</small></span>
                                        </button>
                                        <button type="button" className={styles.zoom} onClick={() => setZoom(i)} aria-label={`Vezi ${d.title} mare și într-un interior`} title="Vezi mare și într-un interior"><Lens /></button>
                                    </div>
                                ))}
                            </div>
                            <InteriorDialog
                                full
                                designs={shown.map(d => ({ url: catalogImage(d.code), full: catalogImage(d.code, "full"), thumb: catalogImage(d.code, "s"), name: `${d.title} · ${d.ai ? "design B360" : d.artist}` }))}
                                index={zoom != null && zoom < shown.length ? zoom : null}
                                onIndex={setZoom}
                                action={{ label: split ? `Alege pentru ${names[Math.min(target, walls.length - 1)].toLowerCase()}` : "Alege acest model", run: i => setPicks(m => ({ ...m, [key]: shown[i].code })) }}
                            />
                            <p className={styles.chosen}>
                                {chosen ? <>Ales{split ? ` pentru ${names[Math.min(target, walls.length - 1)].toLowerCase()}` : ""}: <b>{chosen.title}</b>, {chosen.ai ? "design B360" : `${chosen.artist}, ${chosen.year}`} · <a href="#tapet-step-1">vezi pe pereții tăi</a></> : "Apasă pe un model: îl vezi imediat pe pereții tăi, la pasul 1."}
                                <br /><small>Modele create de B360 și lucrări clasice din colecțiile muzeelor. Nu găsești ce-ți place? Scrie-ne la detalii stilul dorit și îți facem noi unul.</small>
                            </p>
                        </div>
                    )
                })()}
            </Step>

            {/* ---------- 3 and 4: the room and the place ---------- */}
            <Step n={3} title="Unde se montează tapetul?">
                <div className={`${calc.choices} ${calc.three}`} role="radiogroup" aria-label="Încăperea">
                    {ROOMS.map(x => <Choice key={x.id} name="tapet-camera" checked={room === x.id} disabled={!roomReady(x.id)} onChange={() => setRoom(x.id)} title={x.label} text={roomReady(x.id) ? x.hint : `${x.hint}. În curând în calculator`} />)}
                </div>
                <p className={calc.label}>Ce aspect vrei să aibă tapetul?</p>
                <div className={calc.choices} role="radiogroup" aria-label="Aspectul tapetului">
                    {FINISHES.map(x => <Choice key={x.id} name="tapet-aspect" checked={finish === x.id} onChange={() => setFinish(x.id)} title={x.label} text={x.hint} />)}
                </div>
            </Step>

            <Step n={4} title="În ce oraș?" hint="Tapetul printat se aplică la fel ca folia, cu scule profesionale: montajul îl face mereu echipa noastră și e inclus în preț.">
                <div className={calc.choices} role="radiogroup" aria-label="Orașul">
                    {PLACES.map(x => <Choice key={x.id} name="tapet-oras" checked={place === x.id} onChange={() => setPlace(x.id)} title={x.label} text={x.hint} />)}
                </div>
            </Step>

            {/* ---------- 5 and 6 side by side on wide screens: the estimate and the request ---------- */}
            <div className={calc.finish}>
                <Step n={5} title="Estimarea ta" id="tapet-estimare">
                    <div className={calc.summary}>
                        <div className={calc.total}>
                            <span>Estimare orientativă</span>
                            {!allValid ? <strong>Completează pereții</strong> : totalText ? <strong>{totalText}</strong> : <p className={styles.soon}>Prețul apare aici în curând</p>}
                            {result ? <small>{lei(result.gross)} cu TVA · print, material și montaj incluse{place === "alt" ? " · plus transportul" : ""}{source === "noi" ? " · grafica o ofertăm separat" : ""}</small> : allValid && <small>Până atunci, trimite-ne pereții și îți spunem prețul exact, de obicei în aceeași zi.</small>}
                            <small className={calc.disclaimer}>Prețul final îl confirmăm după ce vedem imaginea și peretele.</small>
                            {whatsappHref && (
                                <div className={calc.reach}>
                                    <a href={site.phoneHref} className="btn"><Icon name="phone" size={30} uncut />Sună</a>
                                    <a href={whatsappHref} target="_blank" rel="noopener" className="btn-ghost" aria-label="Trimite pereții pe WhatsApp"><Icon name="whatsapp" size={30} uncut />WhatsApp</a>
                                </div>
                            )}
                        </div>
                        {valid.length > 0 && (
                            <ul className={styles.facts}>
                                <li><span>Suprafața pereților</span><strong>{mp(gross)}</strong></li>
                            </ul>
                        )}
                    </div>
                </Step>

                {/* the configuration travels with the request */}
                <input type="hidden" name="pereti" value={wallsText} />
                <input type="hidden" name="suprafata" value={valid.length ? `${mp(gross)} pereți${holes > 0 ? ` − ${mp(holes)} uși și ferestre` : ""} = ${mp(net)} tapet pe perete; material ${strips} fâșii × ${TAPET.rollCm} cm = ${mp(material)}` : ""} />
                <input type="hidden" name="imagine" value={imageText} />
                <input type="hidden" name="camera" value={`${roomName}, ${finishName.toLowerCase()}`} />
                <input type="hidden" name="montaj" value={`Montaj B360, ${placeName}`} />
                <input type="hidden" name="estimare" value={result ? `${lei(result.net)} + TVA (${lei(result.gross)} cu TVA)` : ""} />

                <Step n={6} title="Trimite-ne pereții" hint="Îți trimitem oferta finală după ce vedem imaginea.">
                    <div className={calc.contact}>
                        <label className={form.field}>Nume și prenume *<input name="nume" autoComplete="name" required /></label>
                        <label className={form.field}>
                            Telefon *
                            <span className={form.phoneRow}><span>+40</span><input name="telefon" type="tel" autoComplete="tel-national" inputMode="tel" placeholder="722 12 34 56" pattern="[0-9 ]{9,12}" required /></span>
                        </label>
                        <label className={form.field}>Email *<input name="email" type="email" autoComplete="email" required /></label>
                        <label className={`${form.field} ${calc.details}`}>
                            Detalii suplimentare <small>(opțional)</small>
                            <textarea name="mesaj" rows={3} maxLength={2000} placeholder={place === "alt" ? "ex. orașul, ce fel de imagine îți dorești, termenul dorit" : "ex. ce fel de imagine îți dorești, dacă peretele e proaspăt zugrăvit, termenul dorit"} />
                        </label>
                    </div>
                    <div className={calc.sendRow}>
                        <Consent />
                        <button type="submit" className="btn">Trimite cererea de ofertă</button>
                    </div>
                </Step>
            </div>

            {/* once there are prices, the running total stays in view, as in the car calculator */}
            {totalText && (
                <div className={calc.float}>
                    <a href="#tapet-estimare" className={calc.liveTotal}>
                        <span>Estimare</span>
                        <strong>{totalText}</strong>
                        <small>{result && lei(result.gross)} cu TVA · vezi detalii</small>
                    </a>
                    {whatsappHref && <a href={whatsappHref} target="_blank" rel="noopener" className={`${calc.floatIcon} peel`} aria-label="Trimite pereții pe WhatsApp"><Icon name="whatsapp" size={34} uncut /></a>}
                </div>
            )}
        </SmartForm>
    )
}

function Size({ label, value, onChange, onBlur, aria }: { label: string; value: string; onChange: (v: string) => void; onBlur?: () => void; aria: string }) {
    return (
        <label className={styles.size}>
            <small>{label}</small>
            <input inputMode="numeric" value={value} onChange={e => onChange(e.target.value)} onBlur={onBlur} aria-label={`${aria}, în centimetri`} />
            <i>cm</i>
        </label>
    )
}

function Upload({ hidden, name, img, label, onChange }: { hidden: boolean; name: boolean; img?: Img; label: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
    return (
        <label className={styles.upload} hidden={hidden}>
            <input type="file" name={name ? "fisiere" : undefined} accept="image/*" onChange={onChange} />
            {img ? <span className={styles.thumb} style={{ backgroundImage: `url(${img.url})` }} aria-hidden="true" /> : null}
            <span className={`btn-ghost ${styles.pick}`}>{img ? "Schimbă" : "Încarcă imaginea"}</span>
            <p>
                {label && <b className={styles.uploadLabel}>{label}</b>}
                {img ? <>{img.name} · {img.w} × {img.h} px</> : <>O vezi pe loc pe pereți. <b>Rămâne pe telefonul tău</b> până trimiți cererea.</>}
            </p>
        </label>
    )
}

function Step({ n, title, hint, id, children }: { n: number; title: string; hint?: string; id?: string; children: React.ReactNode }) {
    return (
        <section className={calc.step} id={id} aria-labelledby={`tapet-step-${n}`}>
            <header className={calc.stepHead}>
                <span className={calc.stepNo} aria-hidden="true">{n}</span>
                <div>
                    <h2 id={`tapet-step-${n}`}>{title}</h2>
                    {hint && <p>{hint}</p>}
                </div>
            </header>
            {children}
        </section>
    )
}

function Choice({ name, checked, disabled, onChange, title, text }: { name: string; checked: boolean; disabled?: boolean; onChange: () => void; title: string; text?: string }) {
    return (
        <label className={calc.choice} data-disabled={disabled || undefined}>
            <input type="radio" name={name} checked={checked} disabled={disabled} onChange={onChange} />
            <span className={calc.tick} aria-hidden="true" />
            <strong>{title}</strong>
            {text && <small>{text}</small>}
        </label>
    )
}
