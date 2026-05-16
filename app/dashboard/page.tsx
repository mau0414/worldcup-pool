"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface Pool {
    id: string
    name: string
    memberCount: number
    isOwner: boolean
    createdAt: string
}

export default function DashboardPage() {
const router = useRouter()
const [pools, setPools] = useState<Pool[]>([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState("")

useEffect(() => {
    fetch("/api/pools")
    .then(res => res.json())
    .then(data => {
        if (data.error) setError(data.error)
        else setPools(data)
        setLoading(false)
    })
}, [])

if (loading) return <p style={{ padding: 32 }}>Loading...</p>

return (
    <div style={{ padding: 32, maxWidth: 600 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>My Pools</h1>
        <button onClick={() => router.push("/pools/new")}>+ Create Pool</button>
    </div>

    {error && <p style={{ color: "red" }}>{error}</p>}

    {pools.length === 0 && (
        <p>You have no pools yet. Create one or join via an invite link.</p>
    )}

    {pools.map(pool => (
        <div
        key={pool.id}
        style={{
            border: "1px solid #ccc",
            borderRadius: 8,
            padding: 16,
            marginTop: 16,
        }}
        >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>{pool.name}</strong>
            <span>{pool.isOwner ? "Admin" : "Member"}</span>
        </div>
        <p style={{ margin: "4px 0" }}>Members: {pool.memberCount}</p>
        <p style={{ margin: "4px 0", fontSize: 12, color: "#666" }}>
            Created: {new Date(pool.createdAt).toLocaleDateString()}
        </p>
        <button
            onClick={() => router.push(`/pools/${pool.id}`)}
            style={{ marginTop: 8 }}
        >
            Open Pool
        </button>
        </div>
    ))}
    </div>
)
}