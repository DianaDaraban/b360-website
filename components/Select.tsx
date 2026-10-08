"use client"

import { useEffect, useId, useRef, useState } from "react"
import styles from "./Select.module.css"

// Styled stand-in for a <select> (the native option list can't be styled): a button showing the
// choice and a listbox under it. Arrow keys, Enter/Space and Escape work; the value is sent with
// the form through a hidden input.
export function Select({ name, options, defaultValue, labelledBy }: { name: string; options: string[]; defaultValue?: string; labelledBy?: string }) {
    const [value, setValue] = useState(defaultValue ?? options[0])
    const [open, setOpen] = useState(false)
    const [active, setActive] = useState(options.indexOf(value))
    const root = useRef<HTMLDivElement>(null)
    const id = useId()

    useEffect(() => {
        if (!open) return
        const close = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false) }
        document.addEventListener("pointerdown", close)
        return () => document.removeEventListener("pointerdown", close)
    }, [open])

    const choose = (i: number) => {
        setValue(options[i])
        setActive(i)
        setOpen(false)
    }

    const onKey = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault()
            const next = (active + (e.key === "ArrowDown" ? 1 : -1) + options.length) % options.length
            if (open) setActive(next)
            else { setOpen(true) }
        } else if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            if (open) choose(active)
            else setOpen(true)
        } else if (e.key === "Escape") {
            setOpen(false)
        }
    }

    return (
        <div ref={root} className={styles.select} data-open={open || undefined}>
            <input type="hidden" name={name} value={value} />
            <button
                type="button"
                className={styles.button}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={`${id}-list`}
                aria-labelledby={labelledBy ? `${labelledBy} ${id}-value` : undefined}
                onClick={() => setOpen(o => !o)}
                onKeyDown={onKey}
            >
                <span id={`${id}-value`}>{value}</span>
                <span className={styles.chevron} aria-hidden="true" />
            </button>
            <ul id={`${id}-list`} role="listbox" aria-labelledby={labelledBy} className={styles.list} aria-activedescendant={open ? `${id}-${active}` : undefined}>
                {options.map((o, i) => (
                    <li
                        key={o}
                        id={`${id}-${i}`}
                        role="option"
                        aria-selected={o === value}
                        data-active={i === active || undefined}
                        onPointerEnter={() => setActive(i)}
                        onClick={() => choose(i)}
                    >
                        {o}
                    </li>
                ))}
            </ul>
        </div>
    )
}
