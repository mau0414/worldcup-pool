"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function NewPoolPage() {
const router = useRouter()
const [name, setName] = useState("")
const [isPrivate, setIsPrivate] = useState(true)
const [error, setError] = useState("")
const [loading, setLoading] = useState(false)

async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const res = await fetch("/api/pools", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, isPrivate }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
    setError(data.error || "Something went wrong")
    return
    }

    router.push(`/pools/${data.id}`)
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
        maxWidth: 440,
    }}>
        <h1 style={{ fontSize: 22, fontWeight: 500, margin: "0 0 0.25rem" }}>
        Create pool
        </h1>
        <p style={{ fontSize: 14, color: "var(--color-text-secondary)", margin: "0 0 1.5rem" }}>
        Share the invite link with your friends after creating.
        </p>

        <form onSubmit={handleSubmit}>

        <div style={{ marginBottom: "1.25rem" }}>
            <label style={{
            display: "block",
            fontSize: 13,
            fontWeight: 500,
            color: "var(--color-text-secondary)",
            marginBottom: 6,
            }}>
            Pool name
            </label>
            <input
            value={name}
            onChange={e => setName(e.target.value)}
            required
            placeholder="e.g. Office World Cup Pool"
            style={{ width: "100%", boxSizing: "border-box" }}
            />
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
            <label style={{
            display: "block",
            fontSize: 13,
            fontWeight: 500,
            color: "var(--color-text-secondary)",
            marginBottom: 8,
            }}>
            Visibility
            </label>
            <div style={{ display: "flex", gap: 8 }}>
            {[
                { value: true, label: "Private", description: "Only people with the invite link can join" },
                { value: false, label: "Public", description: "Anyone can find and join this pool" },
            ].map(option => (
                <button
                key={String(option.value)}
                type="button"
                onClick={() => setIsPrivate(option.value)}
                style={{
                    flex: 1,
                    padding: "10px 12px",
                    border: isPrivate === option.value
                    ? "2px solid var(--color-border-info)"
                    : "0.5px solid var(--color-border-tertiary)",
                    borderRadius: "var(--border-radius-md)",
                    background: "var(--color-background-primary)",
                    cursor: "pointer",
                    textAlign: "left",
                }}
                >
                <div style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 2 }}>
                    {option.label}
                </div>
                <div style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.4 }}>
                    {option.description}
                </div>
                </button>
            ))}
            </div>
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
            type="submit"
            disabled={loading}
            style={{ width: "100%" }}
        >
            {loading ? "Creating..." : "Create pool"}
        </button>

        </form>
    </div>
    </div>
)
}