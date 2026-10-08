import { Fragment } from "react"

// Heading revealed word by word like vinyl being applied: a red block sweeps over each word,
// then pulls away to the right leaving the word behind. Words listed in `red` are set in red.
// Styles in globals.css (.reveal-word); --d delays the whole heading.
export function RevealTitle({ text, red = [], className, delay = 0 }: { text: string; red?: string[]; className?: string; delay?: number }) {
    const words = text.split(" ")
    return (
        <h1 className={className} aria-label={text} style={{ "--d": `${delay}s` } as React.CSSProperties}>
            {words.map((w, i) => (
                <Fragment key={i}>
                    <span aria-hidden="true" className={`reveal-word${red.includes(w) ? " red" : ""}`} style={{ "--i": i } as React.CSSProperties}>
                        <span>{w}</span>
                    </span>{" "}
                </Fragment>
            ))}
        </h1>
    )
}
