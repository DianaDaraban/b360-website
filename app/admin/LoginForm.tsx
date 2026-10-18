"use client"

import { useActionState } from "react"
import { loginAction } from "./actions"
import styles from "./admin.module.css"

export function LoginForm() {
    const [error, action, pending] = useActionState(loginAction, null)
    return (
        <form action={action} className={styles.login}>
            <label htmlFor="admin-password">Parola</label>
            <input id="admin-password" name="password" type="password" autoComplete="current-password" required autoFocus />
            {error && <p className={styles.error} role="alert">{error}</p>}
            <button className="btn" disabled={pending}>{pending ? "Se verifică…" : "Intră"}</button>
        </form>
    )
}
