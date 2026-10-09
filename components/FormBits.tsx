"use client"

import { useRef, useState } from "react"
import styles from "./FormBits.module.css"

// Small interactive form parts for the quote form.

// Choice pills: checkboxes or radios drawn as pills; the chosen ones turn red with a tick.
export function Pills({ name, options, type = "checkbox", other }: { name: string; options: string[]; type?: "checkbox" | "radio"; other?: { label: string; name: string; placeholder: string } }) {
    const [otherOn, setOtherOn] = useState(false)
    return (
        <div className={styles.pills}>
            {options.map(o => (
                <label key={o} className={styles.pill}>
                    <input type={type} name={name} value={o} />
                    <span>{o}</span>
                </label>
            ))}
            {other && (
                <>
                    <label className={styles.pill}>
                        <input type={type} name={name} value={other.label} onChange={e => setOtherOn(e.currentTarget.checked)} />
                        <span>{other.label}</span>
                    </label>
                    {/* the free-text box opens only when "other" is ticked */}
                    <input className={styles.otherInput} data-open={otherOn || undefined} name={other.name} placeholder={other.placeholder} aria-label={other.placeholder} tabIndex={otherOn ? 0 : -1} />
                </>
            )}
        </div>
    )
}

// Number with − / + buttons
export function Stepper({ name, min = 1, max = 999, label }: { name: string; min?: number; max?: number; label: string }) {
    const [value, setValue] = useState(min)
    const set = (v: number) => setValue(Math.min(max, Math.max(min, v || min)))
    return (
        <div className={styles.stepper} role="group" aria-label={label}>
            <button type="button" onClick={() => set(value - 1)} disabled={value <= min} aria-label="Mai puține">−</button>
            <input name={name} type="number" inputMode="numeric" min={min} max={max} value={value} onChange={e => set(Number(e.target.value))} aria-label={label} />
            <button type="button" onClick={() => set(value + 1)} disabled={value >= max} aria-label="Mai multe">+</button>
        </div>
    )
}

// File drop zone: click or drag files onto it; lists the chosen files with their total size
export function FileDrop({ name, accept, maxMb }: { name: string; accept: string; maxMb: number }) {
    const input = useRef<HTMLInputElement>(null)
    const [files, setFiles] = useState<File[]>([])
    const [over, setOver] = useState(false)
    const total = files.reduce((n, f) => n + f.size, 0)
    const tooBig = total > maxMb * 1024 * 1024
    const size = (n: number) => (n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`)

    const take = (list: FileList | null) => setFiles(list ? [...list] : [])
    const onDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setOver(false)
        if (!input.current || !e.dataTransfer.files.length) return
        input.current.files = e.dataTransfer.files
        take(e.dataTransfer.files)
    }

    return (
        <label
            className={styles.drop}
            data-over={over || undefined}
            data-error={tooBig || undefined}
            onDragOver={e => { e.preventDefault(); setOver(true) }}
            onDragLeave={() => setOver(false)}
            onDrop={onDrop}
        >
            <input ref={input} type="file" name={name} multiple accept={accept} onChange={e => take(e.currentTarget.files)} />
            <span className={styles.dropIcon} aria-hidden="true" />
            {files.length === 0 ? (
                <span className={styles.dropText}>
                    <strong>Atașează schițe, logo sau poze</strong>
                    <small>Trage fișierele aici sau apasă pentru a alege · până la {maxMb} MB în total</small>
                </span>
            ) : (
                <span className={styles.dropText}>
                    <strong>{files.length === 1 ? files[0].name : `${files.length} fișiere alese`} · {size(total)}</strong>
                    <small>{tooBig ? `Depășește ${maxMb} MB. Fișierele mari ni le poți trimite pe email.` : "Apasă ca să alegi alte fișiere"}</small>
                </span>
            )}
        </label>
    )
}
