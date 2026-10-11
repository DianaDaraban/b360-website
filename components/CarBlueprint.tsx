"use client"

import { useId } from "react"
import { bodyType, panelLabel, type BodyId, type Mode, type View } from "@/data/calculator"
import styles from "./CarBlueprint.module.css"

type Pt = [number, number]

// closed Catmull-Rom curve through the points, as cubic Béziers: a smooth car silhouette
function smooth(points: Pt[], tension = 0.32) {
    const n = points.length
    const p = (i: number) => points[(i + n) % n]
    let d = `M${p(0)[0]},${p(0)[1]}`
    for (let i = 0; i < n; i++) {
        const [p0, p1, p2, p3] = [p(i - 1), p(i), p(i + 1), p(i + 2)]
        const c1: Pt = [p1[0] + (p2[0] - p0[0]) * tension / 2, p1[1] + (p2[1] - p0[1]) * tension / 2]
        const c2: Pt = [p2[0] - (p3[0] - p1[0]) * tension / 2, p2[1] - (p3[1] - p1[1]) * tension / 2]
        d += ` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`
    }
    return d + "Z"
}
const poly = (points: Pt[]) => "M" + points.map(p => p.join(",")).join(" L") + "Z"

type Props = {
    body: BodyId
    view: View
    selection: Record<string, Mode>
    onPick: (panelId: string) => void
    onHover: (panelId: string | null) => void
}

// One blueprint view of the car. Every panel is a vertical strip of the body silhouette; its fill
// shows the chosen work: wrap = whole piece in orange-yellow with a thick yellow contour,
// inscription = only the part below the window line in blue, wrap + logo = wrap with a logo pattern.
export function CarBlueprint({ body, view, selection, onPick, onHover }: Props) {
    const uid = useId().replace(/:/g, "")
    const b = bodyType(body)
    const hover = (id: string | null) => () => onHover(id)

    // a panel's coloured layers, clipped to its strip; the outline follows the body edge and the seams
    const paint = (id: string, shape: string, x1: number, x2: number, belt: number | null) => {
        const mode = selection[id]
        if (!mode) return null
        const lower = mode === "inscriptionare" && belt !== null
        const y = lower ? belt! : 0
        const cls = mode === "inscriptionare" ? styles.ins : styles.wrap
        return (
            <g key={`p-${id}`} pointerEvents="none">
                <clipPath id={`${uid}-s-${id}`}><rect x={x1} y={y} width={x2 - x1} height={420 - y} /></clipPath>
                <g clipPath={`url(#${uid}-s-${id})`}>
                    <path d={shape} className={`${cls} ${styles.fill}`} />
                    {mode === "logo" && <path d={shape} fill={`url(#${uid}-logo)`} />}
                    <path d={shape} className={`${cls} ${styles.edge}`} />
                </g>
                <g clipPath={`url(#${uid}-body)`}>
                    <rect x={x1} y={y} width={x2 - x1} height={420 - y} className={`${cls} ${styles.edge}`} fill="none" />
                </g>
            </g>
        )
    }
    const hit = (id: string, x1: number, x2: number) => (
        <rect
            key={`h-${id}`}
            x={x1} y={0} width={x2 - x1} height={420}
            className={styles.hit}
            data-on={selection[id] || undefined}
            onClick={() => onPick(id)}
            onPointerEnter={hover(id)}
            onPointerLeave={hover(null)}
        >
            <title>{panelLabel(id)}</title>
        </rect>
    )

    const defs = (shape: string) => (
        <defs>
            <clipPath id={`${uid}-body`}><path d={shape} /></clipPath>
            {/* "logo" overlay: small red badges with a cream stripe, like applied brand graphics */}
            <pattern id={`${uid}-logo`} width="46" height="34" patternUnits="userSpaceOnUse" patternTransform="rotate(-12)">
                <rect x="6" y="8" width="26" height="14" rx="4" fill="#ee3338" />
                <rect x="10" y="13" width="16" height="3" rx="1.5" fill="#f3eae1" />
            </pattern>
        </defs>
    )

    if (view === "sus") {
        const L = b.top.length
        const shape = `M110,70 H${L - 50} Q${L},70 ${L},130 V290 Q${L},350 ${L - 50},350 H110 Q60,350 60,290 V130 Q60,70 110,70Z`
        const wheelXs = b.side.wheels.map(w => w.x)
        return (
            <svg viewBox="0 0 1000 420" className={styles.svg} role="img" aria-label="Mașina văzută de sus">
                {defs(shape)}
                <ellipse cx={L / 2 + 30} cy="372" rx={L / 2 - 20} ry="14" className={styles.shadow} />
                {wheelXs.flatMap(x => [<rect key={`wt${x}`} x={x - 46} y="54" width="92" height="22" rx="8" className={styles.tyre} />, <rect key={`wb${x}`} x={x - 46} y="344" width="92" height="22" rx="8" className={styles.tyre} />])}
                <path d={shape} className={styles.body} />
                {b.top.strips.map(([k, x1, x2]) => (k === "parbriz" || k === "luneta" ? null : paint(k, shape, x1, x2, null)))}
                {/* glass, seams, outline: on top, not clickable */}
                {b.top.strips.map(([k, x1, x2]) => (k === "parbriz" || k === "luneta" ? (
                    <path key={k} d={k === "parbriz" ? `M${x1 + 14},96 L${x2 - 4},110 V310 L${x1 + 14},324Z` : `M${x1 + 4},110 L${x2 - 14},98 V322 L${x1 + 4},310Z`} className={styles.glass} />
                ) : null))}
                <g clipPath={`url(#${uid}-body)`} pointerEvents="none">
                    {b.top.strips.slice(1).map(([, x1]) => <line key={x1} x1={x1} y1="0" x2={x1} y2="420" className={styles.seam} />)}
                </g>
                <path d={shape} className={styles.outline} />
                <path d={`M${b.top.strips.find(s => s[0] === "parbriz")![1] + 10},70 l-6,-22 h26 l4,22 M${b.top.strips.find(s => s[0] === "parbriz")![1] + 10},350 l-6,22 h26 l4,-22`} className={styles.mirror} />
                <g clipPath={`url(#${uid}-body)`}>
                    {b.top.strips.map(([k, x1, x2]) => (k === "parbriz" || k === "luneta" ? null : hit(k, x1, x2)))}
                </g>
            </svg>
        )
    }

    // side views: the left side is drawn as is (front to the left), the right side mirrored
    const s = b.side
    const suffix = view === "stanga" ? "st" : "dr"
    const shape = smooth(s.body)
    const id = (k: string) => (k === "bara-fata" || k === "bara-spate" ? k : `${k}-${suffix}`)
    const [mx, my, mw, mh] = s.mirror
    const mirrorPath = `M${mx},${my + mh} L${mx + 4},${my} H${mx + mw} V${my + mh}Z`
    const mirrorId = `oglinda-${suffix}`
    const mMode = selection[mirrorId]
    return (
        <svg viewBox="0 0 1000 420" className={styles.svg} role="img" aria-label={view === "stanga" ? "Partea stângă a mașinii" : "Partea dreaptă a mașinii"}>
            {defs(shape)}
            <g transform={view === "dreapta" ? "translate(1000 0) scale(-1 1)" : undefined}>
                <ellipse cx="500" cy="390" rx="440" ry="12" className={styles.shadow} />
                <path d={shape} className={styles.body} />
                {s.strips.map(([k, x1, x2]) => paint(id(k), shape, x1, x2, s.belt))}
                {s.windows.map((w, i) => <path key={i} d={poly(w)} className={styles.glass} />)}
                <g clipPath={`url(#${uid}-body)`} pointerEvents="none">
                    {s.strips.slice(1).map(([, x1]) => <line key={x1} x1={x1} y1="0" x2={x1} y2="420" className={styles.seam} />)}
                    <line x1="0" y1={s.belt} x2="1000" y2={s.belt} className={styles.belt} />
                </g>
                <path d={shape} className={styles.outline} />
                <g clipPath={`url(#${uid}-body)`}>
                    {s.strips.map(([k, x1, x2]) => hit(id(k), x1, x2))}
                </g>
                {/* wheel wells and wheels block clicks; they are not panels */}
                {s.wheels.map(w => (
                    <g key={w.x}>
                        <circle cx={w.x} cy={w.y} r={w.r + 9} className={styles.well} />
                        <circle cx={w.x} cy={w.y} r={w.r} className={styles.tyre} />
                        <circle cx={w.x} cy={w.y} r={w.r * 0.58} className={styles.rim} />
                        <circle cx={w.x} cy={w.y} r={w.r * 0.14} className={styles.hub} />
                    </g>
                ))}
                {/* the mirror is a panel of its own */}
                <path
                    d={mirrorPath}
                    className={`${styles.mirrorHit} ${mMode === "inscriptionare" ? styles.ins : mMode ? styles.wrap : ""}`}
                    data-on={mMode || undefined}
                    onClick={() => onPick(mirrorId)}
                    onPointerEnter={hover(mirrorId)}
                    onPointerLeave={hover(null)}
                >
                    <title>{panelLabel(mirrorId)}</title>
                </path>
            </g>
        </svg>
    )
}
