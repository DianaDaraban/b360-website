"use client"

import { useEffect, useRef, useState } from "react"
import type { OpeningKind } from "@/data/tapet"
import styles from "./Room3D.module.css"

export type RoomOpening = { id: number; kind: OpeningKind; w: number; h: number; x: number; y: number }
export type RoomWall = { id: number; w: number; h: number; openings: RoomOpening[]; image?: string }

// Where each wall stands: the walls go round the room, each turned 90° from the one before, with the
// middle one at the back (1 wall: the back; 2: back and right; 3: left, back, right; 4: and the front)
export function wallAngles(n: number) {
    return Array.from({ length: n }, (_, i) => 90 * (i - Math.floor((n - 1) / 2)))
}
const SIDE: Record<number, string> = { [-90]: "Stânga", 0: "Spate", 90: "Dreapta", 180: "Față" }
export const wallNames = (n: number) => (n === 1 ? ["Peretele"] : wallAngles(n).map(a => SIDE[a]))

const MOVE = 5              // px a press may move and still count as a tap
const TURN = -24            // the angle the room is first seen from, a little from the left
const TILT = -16            // and from a little above, so the floor shows

// The walls as a small room in CSS 3D perspective, turned freely with the mouse or a finger: drag
// sideways to walk round it, up and down to look from higher or lower. The client's image is on
// each wall, with the doors and windows on top, dragged into place with their distances to the
// wall's edges shown. Tapping a wall (or its name) turns to face it; a tap beside it steps back.
export function Room3D({ walls, focus, onFocus, onMoveOpening, onResizeWall }: {
    walls: RoomWall[]
    focus: number | null
    onFocus: (i: number | null) => void
    onMoveOpening: (wall: number, opening: number, x: number, y: number) => void
    onResizeWall: (wall: number, w: number, h: number) => void
}) {
    const box = useRef<HTMLDivElement>(null)
    const [width, setWidth] = useState(600)
    const [drag, setDrag] = useState<number | null>(null)       // the opening being dragged
    const [turn, setTurn] = useState(TURN)
    const [tilt, setTilt] = useState(TILT)
    const [rotating, setRotating] = useState(false)
    const [lockedScale, setLockedScale] = useState<number | null>(null)   // while a wall edge is dragged the room keeps its scale
    // Chrome does not repaint a wall turned in 3D when its new picture arrives late, so a picture
    // goes on a wall only once it has loaded, and the wall is drawn afresh with it
    const [ready, setReady] = useState<string[]>([])
    const shown = (src?: string) => (src && ready.includes(src) ? src : undefined)
    useEffect(() => {
        for (const w of walls) {
            const src = w.image
            if (!src || ready.includes(src)) continue
            const img = new Image()
            img.onload = img.onerror = () => setReady(r => (r.includes(src) ? r : [...r, src]))
            img.src = src
        }
    }, [walls, ready])
    const faces = useRef<(HTMLDivElement | null)[]>([])

    useEffect(() => {
        const el = box.current
        if (!el) return
        const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width))
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    // the corners of the room, in centimetres on the floor (x to the right, z towards us)
    const angles = wallAngles(walls.length)
    const starts: [number, number][] = []
    let px = 0, pz = 0
    walls.forEach((w, i) => {
        starts.push([px, pz])
        const a = (angles[i] * Math.PI) / 180
        px += Math.cos(a) * w.w
        pz += Math.sin(a) * w.w
    })
    const xs = [...starts.map(p => p[0]), px], zs = [...starts.map(p => p[1]), pz]
    const minX = Math.min(...xs), maxX = Math.max(...xs), minZ = Math.min(...zs)
    const depth = Math.max(Math.max(...zs) - minZ, (maxX - minX) * 0.55)       // a floor even for one wall
    const maxH = Math.max(...walls.map(w => w.h))
    const height = width < 560 ? 300 : 380

    // centimetres to pixels: the whole room fits however it is turned
    const span = Math.hypot(maxX - minX, depth)
    const s = lockedScale ?? Math.min((width * 0.84) / span, (height * 0.62) / maxH)

    const f = focus != null && focus < walls.length ? focus : null
    const mid = (i: number) => {
        const a = (angles[i] * Math.PI) / 180
        return [starts[i][0] + (Math.cos(a) * walls[i].w) / 2, starts[i][1] + (Math.sin(a) * walls[i].w) / 2]
    }
    // the camera turns round the middle of the room, or looks straight at the chosen wall, zoomed in
    let view: { k: number; turn: number; tilt: number; x: number; z: number; y: number }
    if (f == null) {
        view = { k: 1, turn, tilt, x: (minX + maxX) / 2, z: minZ + depth / 2, y: height / 2 + (maxH * s) / 2 }
    } else {
        const w = walls[f], k = Math.min((width * 0.86) / (w.w * s), (height * 0.8) / (w.h * s))
        const [x, z] = mid(f)
        view = { k, turn: angles[f], tilt: 0, x, z, y: height / 2 + (w.h * s * k) / 2 }
    }
    const roomStyle = {
        transform: `translateY(${view.y}px) scale3d(${view.k}, ${view.k}, ${view.k}) rotateX(${view.tilt}deg) rotateY(${view.turn}deg) translate3d(${-view.x * s}px, 0px, ${-view.z * s}px)`,
    }
    const boardStyle = { height }

    // dragging turns the room (sideways) and looks from higher or lower (up and down); a tap on a
    // wall faces it, a tap beside the walls steps back into the room
    const onBoardDown = (e: React.PointerEvent) => {
        if (e.button !== 0) return
        const startX = e.clientX, startY = e.clientY
        const from = f == null ? { turn, tilt } : { turn: angles[f], tilt: 0 }
        const target = (e.target as HTMLElement).closest<HTMLElement>("[data-wall]")
        let moved = false
        const move = (ev: PointerEvent) => {
            if (!moved && Math.hypot(ev.clientX - startX, ev.clientY - startY) < MOVE) return
            if (!moved) {
                moved = true
                setRotating(true)
                if (f != null) onFocus(null)
            }
            setTurn(from.turn + (ev.clientX - startX) * 0.4)
            setTilt(Math.max(-40, Math.min(0, from.tilt - (ev.clientY - startY) * 0.25)))
        }
        const up = () => {
            window.removeEventListener("pointermove", move)
            window.removeEventListener("pointerup", up)
            setRotating(false)
            if (moved) return
            const i = target ? Number(target.dataset.wall) : null
            onFocus(i === f ? null : i)
        }
        window.addEventListener("pointermove", move)
        window.addEventListener("pointerup", up)
    }

    // a door or window follows the finger; on a wall seen at an angle the move is approximate, and
    // the distance fields in the list set it exactly
    // the handles on a wall's right edge and top edge stretch it wider or taller; the sizes go back to
    // the list above, in whole centimetres
    const onResizeDown = (e: React.PointerEvent, wi: number, axis: "w" | "h") => {
        e.stopPropagation()
        e.preventDefault()
        try { (e.currentTarget as Element).setPointerCapture(e.pointerId) } catch { /* the window listeners still follow */ }
        const face = faces.current[wi]
        if (!face) return
        const r = face.getBoundingClientRect()
        const wall = walls[wi]
        const dir = Math.cos(((view.turn - angles[wi]) * Math.PI) / 180) < 0 ? -1 : 1
        const perX = Math.max(r.width, 1) / wall.w, perY = Math.max(r.height, 1) / wall.h
        const startX = e.clientX, startY = e.clientY
        setLockedScale(s)
        const move = (ev: PointerEvent) => {
            const w = axis === "w" ? Math.round(Math.min(3000, Math.max(50, wall.w + (dir * (ev.clientX - startX)) / perX))) : wall.w
            const h = axis === "h" ? Math.round(Math.min(800, Math.max(50, wall.h - (ev.clientY - startY) / perY))) : wall.h
            onResizeWall(wi, w, h)
        }
        const up = () => {
            window.removeEventListener("pointermove", move)
            window.removeEventListener("pointerup", up)
            setLockedScale(null)
        }
        window.addEventListener("pointermove", move)
        window.addEventListener("pointerup", up)
    }

    const onOpeningDown = (e: React.PointerEvent, wi: number, o: RoomOpening) => {
        e.stopPropagation()
        e.preventDefault()
        try { (e.currentTarget as Element).setPointerCapture(e.pointerId) } catch { /* the window listeners still follow */ }
        const face = faces.current[wi]
        if (!face) return
        const r = face.getBoundingClientRect()
        const wall = walls[wi]
        // the wall's x runs right or left on screen depending on how the room is turned
        const dir = Math.cos(((view.turn - angles[wi]) * Math.PI) / 180) < 0 ? -1 : 1
        const perX = Math.max(r.width, 1) / wall.w, perY = Math.max(r.height, 1) / wall.h
        const startX = e.clientX, startY = e.clientY
        setDrag(o.id)
        const move = (ev: PointerEvent) => {
            const x = Math.round(Math.min(Math.max(o.x + (dir * (ev.clientX - startX)) / perX, 0), Math.max(wall.w - o.w, 0)))
            const y = o.kind === "usa" ? 0 : Math.round(Math.min(Math.max(o.y - (ev.clientY - startY) / perY, 0), Math.max(wall.h - o.h, 0)))
            onMoveOpening(wi, o.id, x, y)
        }
        const up = () => {
            window.removeEventListener("pointermove", move)
            window.removeEventListener("pointerup", up)
            setDrag(null)
        }
        window.addEventListener("pointermove", move)
        window.addEventListener("pointerup", up)
    }

    const names = wallNames(walls.length)
    return (
        <div className={styles.wrap}>
            <div ref={box} className={styles.board} style={boardStyle} onPointerDown={onBoardDown} data-focus={f != null || undefined} data-rotating={rotating || lockedScale != null || undefined}>
                <div className={styles.room} style={roomStyle}>
                    <div
                        className={styles.floor}
                        style={{ width: (maxX - minX) * s, height: depth * s, backgroundSize: `${150 * s}px`, transform: `translate3d(${minX * s}px, 0px, ${minZ * s}px) rotateX(90deg)` }}
                    />
                    {walls.map((w, i) => (
                        <div
                            key={w.id}
                            className={styles.wall}
                            data-wall={i}
                            data-side={walls.length === 1 ? 0 : angles[i]}
                        data-away={Math.cos(((view.turn - angles[i]) * Math.PI) / 180) < -0.02 || undefined}
                            style={{ width: w.w * s, height: w.h * s, transform: `translate3d(${starts[i][0] * s}px, ${-w.h * s}px, ${starts[i][1] * s}px) rotateY(${-angles[i]}deg)` }}
                        >
                            <div key={shown(w.image) ?? "gol"} ref={el => { faces.current[i] = el }} className={styles.face} style={shown(w.image) ? { backgroundImage: `url(${w.image})` } : undefined} data-active={f === i || undefined}>
                                {!w.image && <span className={styles.empty}>Imaginea ta aici</span>}
                                {w.openings.map(o => {
                                    const ow = Math.min(o.w, w.w), oh = Math.min(o.h, w.h)
                                    const x = Math.min(o.x, Math.max(w.w - ow, 0)), y = Math.min(o.y, Math.max(w.h - oh, 0))
                                                                        const pct = (v: number, of: number) => `${(v / of) * 100}%`
                                    return (
                                        <div key={o.id} className={styles.openingWrap}>
                                            <div
                                                className={styles.opening}
                                                data-kind={o.kind}
                                                data-dragging={drag === o.id || undefined}
                                                onPointerDown={e => onOpeningDown(e, i, o)}
                                                style={{ left: pct(x, w.w), bottom: pct(y, w.h), width: pct(ow, w.w), height: pct(oh, w.h) }}
                                            />
                                            {(
                                                <>
                                                    <Guide axis="x" from={0} to={pct(x, w.w)} at={pct(y + oh / 2, w.h)} label={x} />
                                                    <Guide axis="x" from={pct(x + ow, w.w)} to="100%" at={pct(y + oh / 2, w.h)} label={Math.round(w.w - x - ow)} />
                                                    {o.kind === "fereastra" && <Guide axis="y" from={0} to={pct(y, w.h)} at={pct(x + ow / 2, w.w)} label={y} />}
                                                    <Guide axis="y" from={pct(y + oh, w.h)} to="100%" at={pct(x + ow / 2, w.w)} label={Math.round(w.h - y - oh)} />
                                                </>
                                            )}
                                        </div>
                                    )
                                })}
                                <span className={styles.tag}>{names[i]} · {w.w} × {w.h}</span>
                                <span className={styles.grip} data-axis="w" onPointerDown={e => onResizeDown(e, i, "w")} title="Trage ca să lungești peretele" />
                                <span className={styles.grip} data-axis="h" onPointerDown={e => onResizeDown(e, i, "h")} title="Trage ca să înalți peretele" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <p className={styles.help}>{f == null ? "Trage ca să rotești camera · trage ușile și ferestrele · apasă pe un perete ca să-l vezi din față" : "Trage ușile și ferestrele · apasă lângă perete ca să revii în cameră"}</p>
        </div>
    )
}

// a dimension line from an opening to the wall's edge, with its length in centimetres
function Guide({ axis, from, to, at, label }: { axis: "x" | "y"; from: string | 0; to: string; at: string; label: number }) {
    if (label <= 0) return null
    const style = axis === "x"
        ? { left: from, right: `calc(100% - ${to})`, bottom: at }
        : { bottom: from, top: `calc(100% - ${to})`, left: at }
    return (
        <span className={styles.guide} data-axis={axis} style={style}>
            <b>{label}</b>
        </span>
    )
}
