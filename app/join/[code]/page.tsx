"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

interface PoolInfo {
    name: string
    memberCount: number
}

export default function JoinPoolPage() {
    const { code } = useParams()
    const router = useRouter()
    const [pool, setPool] = useState<PoolInfo | null>(null)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)

    // preview the pool before joining
    useEffect(() => {
        fetch(`/api/pools/preview/${code}`)
        .then(res => res.json())
        .then(data => {
            if (data.error) setError(data.error)
            else setPool(data)
            setFetching(false)
        })
    }, [code])

    async function handleJoin() {
        setLoading(true)
        setError("")

        const res = await fetch(`/api/pools/join/${code}`, { method: "POST" })
        const data = await res.json()
        setLoading(false)

        if (!res.ok) {
        setError(data.error || "Something went wrong")
        return
        }

        router.push(`/pools/${data.poolId}`)
    }

    if (fetching) return <p style={{ padding: 32 }}>Loading...</p>

    return (
        <div style={{ padding: 32, maxWidth: 480 }}>
        <h1>Join Pool</h1>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {pool && (
            <>
            <p><strong>{pool.name}</strong></p>
            <p>Members: {pool.memberCount}</p>
            <button onClick={handleJoin} disabled={loading}>
                {loading ? "Joining..." : "Join Pool"}
            </button>
            </>
        )}

        {!pool && !error && <p>Pool not found.</p>}

        <p style={{ marginTop: 16 }}>
            <a href="/login">Not logged in? Sign in first</a>
        </p>
        </div>
    )
}