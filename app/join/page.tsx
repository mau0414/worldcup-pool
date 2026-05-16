"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function JoinPage() {
    const router = useRouter()
    const [code, setCode] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleJoin() {
    if (!code.trim()) return
    setError("")
    setLoading(true)

    const res = await fetch(`/api/pools/${code.trim()}`, { method: "POST" })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
        setError(data.error || "Something went wrong")
        return
    }

    router.push(`/pools/${data.poolId}`)
    }

    return (
    <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-background-tertiary)",
    }}>
        <div style={{
        background: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: "var(--border-radius-lg)",
        padding: "2rem",
        width: "100%",
        maxWidth: 400,
        }}>
        <h1 style={{ fontSize: 22, fontWeight: 500, margin: "0 0 0.25rem" }}>
            Join a pool
        </h1>
        <p style={{ fontSize: 14, color: "var(--color-text-secondary)", margin: "0 0 1.5rem" }}>
            Enter the invite code shared with you.
        </p>

        <div style={{ marginBottom: "1.25rem" }}>
            <label style={{
            display: "block",
            fontSize: 13,
            fontWeight: 500,
            color: "var(--color-text-secondary)",
            marginBottom: 6,
            }}>
            Invite code
            </label>
            <input
            value={code}
            onChange={e => setCode(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleJoin()}
            placeholder="e.g. abc123xyz"
            style={{ width: "100%", boxSizing: "border-box" }}
            />
        </div>

        {error && (
            <p style={{
            fontSize: 13,
            color: "var(--color-text-danger)",
            background: "var(--color-background-danger)",
            border: "0.5px solid var(--color-border-danger)",
            borderRadius: "var(--border-radius-md)",
            padding: "8px 12px",
            margin: "0 0 1rem",
            }}>
            {error}
            </p>
        )}

        <button
            onClick={handleJoin}
            disabled={loading || !code.trim()}
            style={{ width: "100%" }}
        >
            {loading ? "Joining..." : "Enter"}
        </button>
        </div>
    </div>
    )
}