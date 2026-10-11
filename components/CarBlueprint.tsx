"use client"

import { useId } from "react"
import { bodyType, panelLabel, type BodyId, type Mode, type View } from "@/data/calculator"
import styles from "./CarBlueprint.module.css"

const W = 1600
const H = 640

type Props = {
    body: BodyId
    view: View
    selection: Record<string, Mode>
    onPick: (panelId: string) => void
    onHover: (panelId: string | null) => void
}

// A photo of the car with clickable panels. The chosen work is painted over the car only (masked
// by the photo's alpha) in multiply mode, so the paint keeps the car's real light and shadow:
// wrap = the whole piece in orange-yellow with a thick yellow contour, inscription = the part
// below the window line in blue, wrap + logo = wrap with a pattern of logo badges.
export function CarBlueprint({ body, view, selection, onPick, onHover }: Props) {
    const uid = useId().replace(/:/g, "")
    const b = bodyType(body)
    const top = view === "sus"
    const image = `/calculator/${body}-${top ? "top" : "side"}.webp`
    const suffix = view === "dreapta" ? "dr" : "st"

    // every clickable panel of this view as [id, outline path]
    const panels: [string, string][] = (top ? b.top.panels : b.side.panels).map(([k, d]) => [
        top || k === "bara-fata" || k === "bara-spate" ? k : `${k}-${suffix}`,
        d,
    ])
    const below = top ? null : `M0,${H} L${b.side.belt.map(p => p.join(",")).join(" L")} L${W},${H}Z`

    const hover = (id: string | null) => () => onHover(id)

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className={styles.svg} role="img" aria-label={top ? "Mașina văzută de sus" : view === "stanga" ? "Partea stângă a mașinii" : "Partea dreaptă a mașinii"}>
            <defs>
                {/* the car itself (the photo's alpha) for hover, and the paintable body only (a prepared
                    mask without glass, tyres, black trim and lamps) for the paint */}
                <mask id={`${uid}-car`} style={{ maskType: "alpha" }}>
                    <image href={image} width={W} height={H} />
                </mask>
                <mask id={`${uid}-paint`} style={{ maskType: "alpha" }}>
                    <image href={image.replace(".webp", "-paint.webp")} width={W} height={H} />
                </mask>
                {below && <clipPath id={`${uid}-below`}><path d={below} /></clipPath>}
                {panels.map(([id, d]) => <clipPath key={id} id={`${uid}-c-${id}`}><path d={d} /></clipPath>)}
                <pattern id={`${uid}-logo`} width="70" height="52" patternUnits="userSpaceOnUse" patternTransform="rotate(-12)">
                    <rect x="8" y="12" width="40" height="22" rx="6" fill="#ee3338" />
                    <rect x="14" y="20" width="26" height="5" rx="2.5" fill="#f3eae1" />
                </pattern>
            </defs>

            <g transform={view === "dreapta" ? `translate(${W} 0) scale(-1 1)` : undefined}>
                <ellipse cx={W / 2} cy={top ? H - 18 : 612} rx={W * 0.42} ry={top ? 14 : 16} className={styles.shadow} />
                <image href={image} width={W} height={H} />

                {/* paint, laid over the car only */}
                <g mask={`url(#${uid}-paint)`} className={styles.paint}>
                    {panels.map(([id, d]) => {
                        const mode = selection[id]
                        if (!mode) return null
                        const ins = mode === "inscriptionare"
                        const area = <rect width={W} height={H} className={ins ? styles.insFill : styles.wrapFill} />
                        return (
                            <g key={id} clipPath={`url(#${uid}-c-${id})`}>
                                {ins && below ? <g clipPath={`url(#${uid}-below)`}>{area}</g> : area}
                                {mode === "logo" && <rect width={W} height={H} fill={`url(#${uid}-logo)`} className={styles.logo} />}
                            </g>
                        )
                    })}
                </g>
                {/* contours, over the body only */}
                <g mask={`url(#${uid}-paint)`} pointerEvents="none">
                    {panels.map(([id, d]) => {
                        const mode = selection[id]
                        if (!mode) return null
                        const ins = mode === "inscriptionare"
                        return (
                            <g key={id} clipPath={`url(#${uid}-c-${id})`}>
                                <path d={d} className={ins ? styles.insEdge : styles.wrapEdge} clipPath={ins && below ? `url(#${uid}-below)` : undefined} />
                            </g>
                        )
                    })}
                </g>

                {/* click areas: the hover tint is masked to the car, the hit area is the outline */}
                <g mask={`url(#${uid}-car)`}>
                    {panels.map(([id, d]) => (
                        <path
                            key={id}
                            d={d}
                            className={styles.hit}
                            data-on={selection[id] || undefined}
                            onClick={() => onPick(id)}
                            onPointerEnter={hover(id)}
                            onPointerLeave={hover(null)}
                        >
                            <title>{panelLabel(id)}</title>
                        </path>
                    ))}
                </g>
            </g>
        </svg>
    )
}
