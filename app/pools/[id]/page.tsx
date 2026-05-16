"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

interface Pool {
    id: string
    name: string
    inviteCode: string
    isPrivate: boolean
    maxParticipants: number | null
    memberCount: number
    isOwner: boolean
    createdAt: string
}

export default function PoolDetailPage() {
    const { id } = useParams()
    const [pool, setPool] = useState<Pool | null>(null)
    const [error, setError] = useState("")
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        fetch(`/api/pools/${id}`)
            .then(async (res) => {
                console.log("respota toda = ", res)
                const text = await res.text()
                console.log(text)

                return JSON.parse(text)
            })
            .then(data => {
                if (data.error) setError(data.error)
                else setPool(data)
            })
            .catch(err => {
                console.error(err)
                setError("Failed to load pool")
            })
    }, [id])

    if (error) return <p style={{ color: "red", padding: 32 }}>{error}</p>
    if (!pool) return <p style={{ padding: 32 }}>Loading...</p>

    const inviteUrl = `${window.location.origin}/join/${pool.inviteCode}`

    function handleCopy() {
        navigator.clipboard.writeText(inviteUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Join my WC 2026 pool: ${inviteUrl}`)}`

    return (
        <div style={{ padding: 32, maxWidth: 600 }}>
        <h1>{pool.name}</h1>
        <p>Members: {pool.memberCount}{pool.maxParticipants ? ` / ${pool.maxParticipants}` : ""}</p>
        <p>Role: {pool.isOwner ? "Admin" : "Member"}</p>

        <hr style={{ margin: "24px 0" }} />

        <h2>Invite Link</h2>
        <p style={{ wordBreak: "break-all", background: "#f0f0f0", padding: 8 }}>
            {inviteUrl}
        </p>
        <button onClick={handleCopy} style={{ marginRight: 8 }}>
            {copied ? "Copied!" : "Copy Link"}
        </button>
        <a href={whatsappUrl} target="_blank" rel="noreferrer">
            <button>Share on WhatsApp</button>
        </a>

        <hr style={{ margin: "24px 0" }} />

        <div style={{ display: "flex", gap: 16 }}>
            <a href={`/pools/${id}/predictions`}>
            <button>Predictions</button>
            </a>
            <a href={`/pools/${id}/ranking`}>
            <button>Leaderboard</button>
            </a>
        </div>
        </div>
    )
}