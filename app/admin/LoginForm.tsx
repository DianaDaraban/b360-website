"use client"

import { useActionState, useState } from "react"
import { loginAction } from "./actions"
import styles from "./admin.module.css"

export function LoginForm() {
    const [error, action, pending] = useActionState(loginAction, null)
    const [visible, setVisible] = useState(false)
    return (
        <form action={action} className={styles.login}>
            <label htmlFor="admin-password">Parola</label>
            {/* the eye shows what is typed, to check the password before logging in */}
            <div className={styles.passwordField}>
                <input id="admin-password" name="password" type={visible ? "text" : "password"} autoComplete="current-password" autoCapitalize="none" spellCheck={false} required autoFocus />
                <button type="button" className={styles.eye} onClick={() => setVisible(v => !v)} aria-pressed={visible} aria-label={visible ? "Ascunde parola" : "Arată parola"} title={visible ? "Ascunde parola" : "Arată parola"}>
                    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
                        <circle cx="12" cy="12" r="3" />
                        {visible && <path d="M4 4l16 16" />}
                    </svg>
                </button>
            </div>
            {error && <p className={styles.error} role="alert">{error}</p>}
            <button className="btn" disabled={pending}>{pending ? "Se verifică…" : "Intră"}</button>
        </form>
    )
}
