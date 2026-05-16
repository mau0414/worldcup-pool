"use client"

import { useEffect, useRef, useState } from "react"
import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/ui/logo"

// ── placeholder data ──────────────────────────────────────────────────────────

const PLACEHOLDER_MATCHES = [
{ id: 1, teamA: "Brasil",    teamB: "México",    time: "2026-06-15T18:00:00Z", group: "A" },
{ id: 2, teamA: "Argentina", teamB: "Canadá",    time: "2026-06-15T21:00:00Z", group: "B" },
{ id: 3, teamA: "Portugal",  teamB: "Marrocos",  time: "2026-06-16T00:00:00Z", group: "C" },
]

const PLACEHOLDER_PUBLIC_POOLS = [
{ id: "p1", name: "Bolão da Galera",      members: 38, admin: "Felipe M." },
{ id: "p2", name: "Copa do Escritório",   members: 22, admin: "Carla R." },
{ id: "p3", name: "Hexa ou Racha",        members: 61, admin: "Thiago S." },
{ id: "p4", name: "Os Cravadores",        members: 14, admin: "Ana P." },
]

// ── helpers ───────────────────────────────────────────────────────────────────

function useCountdown(targetISO: string) {
    const calc = () => {
    const diff = new Date(targetISO).getTime() - Date.now()
    if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 }
    const d = Math.floor(diff / 86400000)
    const h = Math.floor((diff % 86400000) / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    const s = Math.floor((diff % 60000) / 1000)
    return { d, h, m, s }
}
const [t, setT] = useState(calc)
    useEffect(() => {
        const id = setInterval(() => setT(calc()), 1000)
        return () => clearInterval(id)
    }, [targetISO])
    return t
}

function Countdown({ targetISO }: { targetISO: string }) {
const { d, h, m, s } = useCountdown(targetISO)
const pad = (n: number) => String(n).padStart(2, "0")

return (
<div style={{ display: "flex", gap: 8, marginTop: 8 }}>
    {[{ v: d, l: "d" }, { v: h, l: "h" }, { v: m, l: "m" }, { v: s, l: "s" }].map(({ v, l }) => (
    <div key={l} style={{
        background: "rgba(132,204,22,0.1)",
        border: "1px solid rgba(132,204,22,0.2)",
        borderRadius: 6,
        padding: "6px 10px",
        textAlign: "center",
        minWidth: 44,
    }}>
        <div style={{ color: "var(--brand-green)", fontSize: 18, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{pad(v)}</div>
        <div style={{ color: "var(--brand-subtle)", fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>{l}</div>
    </div>
    ))}
</div>
)
}

// ── main component ────────────────────────────────────────────────────────────

export default function DashboardPage() {
const { data: session, status } = useSession()
console.log("session:", session, "status:", status)
const router = useRouter()
const [pools, setPools] = useState<any[]>([])
const [loadingPools, setLoadingPools] = useState(true)
const [menuOpen, setMenuOpen] = useState(false)
const menuRef = useRef<HTMLDivElement>(null)

const userName = session?.user?.name?.split(" ")[0] ?? "Craque"
const userInitial = userName[0].toUpperCase()

// close menu on outside click
useEffect(() => {
    function handler(e: MouseEvent) {
        if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
}
document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
}, [])

useEffect(() => {
    console.log("fetching pools...")
    fetch("/api/pools")
        .then(r => r.json())
        .then(data => {
        console.log("pools response:", data)
        setPools(Array.isArray(data) ? data : [])
        setLoadingPools(false)
        })
        .catch(err => {
            console.log("pools fetch error:", err)
            setLoadingPools(false)
        })
}, [])

if (status === "loading") {
    return (
        <div className="page" style={{ alignItems: "center", justifyContent: "center" }}>
        <p className="text-muted">AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA...</p>
        </div>
    )
}

const hasPools = !loadingPools && pools.length > 0
const isLoadingPools = loadingPools

// deadline = first upcoming match kick-off
const deadlineISO = PLACEHOLDER_MATCHES[0].time

return (
<div className="page" style={{ overflowY: "auto" }}>

    {/* ── Header ─────────────────────────────────────────────────────────── */}
    <header style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px 40px",
    borderBottom: "1px solid var(--brand-border)",
    position: "sticky",
    top: 0,
    background: "rgba(5,14,5,0.92)",
    backdropFilter: "blur(12px)",
    zIndex: 50,
    }}>
    {/* Left: logo + name */}
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <Logo />
        <div style={{ width: 1, height: 20, background: "var(--brand-border)" }} />
        <span className="text-muted" style={{ fontSize: 14 }}>{session?.user?.name}</span>
    </div>

    {/* Right: become pro + avatar menu */}
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
        onClick={() => router.push("/premium")}
        style={{
            background: "transparent",
            border: "1px solid var(--brand-green)",
            color: "var(--brand-green)",
            borderRadius: "var(--brand-radius)",
            padding: "7px 16px",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 1,
            textTransform: "uppercase",
            cursor: "pointer",
            transition: "background 0.15s",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "rgba(132,204,22,0.08)")}
        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
        ⚡ Become Pro
        </button>

        {/* Avatar + dropdown */}
        <div ref={menuRef} style={{ position: "relative" }}>
        <button
            onClick={() => setMenuOpen(o => !o)}
            style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: "var(--brand-green)",
            color: "var(--brand-green-fg)",
            border: "none",
            fontWeight: 800,
            fontSize: 15,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            }}
        >
            {userInitial}
        </button>

        {menuOpen && (
            <div style={{
            position: "absolute",
            right: 0,
            top: 46,
            background: "#0d1a0d",
            border: "1px solid var(--brand-border)",
            borderRadius: 10,
            minWidth: 160,
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            }}>
            {[
                { label: "Meu perfil", onClick: () => router.push("/profile") },
                { label: "Configurações", onClick: () => router.push("/settings") },
                { label: "Sair", onClick: () => signOut({ callbackUrl: "/login" }), danger: true },
            ].map(item => (
                <button
                key={item.label}
                onClick={item.onClick}
                style={{
                    display: "block",
                    width: "100%",
                    padding: "11px 16px",
                    background: "transparent",
                    border: "none",
                    textAlign: "left",
                    color: item.danger ? "#f87171" : "var(--brand-muted)",
                    fontSize: 14,
                    cursor: "pointer",
                    transition: "background 0.1s, color 0.1s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; if (!item.danger) e.currentTarget.style.color = "white" }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = item.danger ? "#f87171" : "var(--brand-muted)" }}
                >
                {item.label}
                </button>
            ))}
            </div>
        )}
        </div>
    </div>
    </header>

    {/* ── Hero — no pool state ────────────────────────────────────────────── */}
    {!hasPools && !isLoadingPools && (
    <section style={{
        display: "flex",
        alignItems: "center",
        gap: 60,
        padding: "60px 40px 48px",
        maxWidth: 1200,
        margin: "0 auto",
        width: "100%",
    }}>
        {/* Copy */}
        <div style={{ flex: 1 }}>
        <p className="eyebrow" style={{ marginBottom: 16 }}>→ Copa do Mundo 2026</p>
        <h1 style={{
            color: "white",
            fontSize: "clamp(2rem, 4vw, 3rem)",
            fontWeight: 900,
            lineHeight: 1.08,
            textTransform: "uppercase",
            letterSpacing: -1,
            margin: "0 0 20px",
        }}>
            Olá, <span className="text-green" style={{ fontStyle: "italic" }}>{userName}!</span>
            <br />O hexa vem aí?
        </h1>
        <p className="text-muted" style={{ fontSize: 16, lineHeight: 1.7, maxWidth: 440 }}>
            Você ainda não participa de nenhum bolão.<br />
            Escolha como começar.
        </p>
        </div>

        {/* Cards */}
        <div style={{ display: "flex", gap: 20, flexShrink: 0 }}>
        {/* Join card */}
        <div className="card" style={{ width: 220, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: "rgba(132,204,22,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20,
            }}>🔗</div>
            <div>
            <h3 style={{ color: "white", fontSize: 16, fontWeight: 700, margin: "0 0 6px" }}>
                Entrar num bolão
            </h3>
            <p className="text-subtle" style={{ fontSize: 13, lineHeight: 1.5 }}>
                Tem um link de convite? Cole aqui e entre na disputa.
            </p>
            </div>
            <button
            className="btn-primary"
            style={{ marginTop: "auto" }}
            onClick={() => router.push("/join")}
            >
            Entrar →
            </button>
        </div>

        {/* Create card */}
        <div className="card" style={{
            width: 220, display: "flex", flexDirection: "column", gap: 16,
            border: "1px solid rgba(132,204,22,0.25)",
        }}>
            <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: "rgba(132,204,22,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20,
            }}>🏆</div>
            <div>
            <h3 style={{ color: "white", fontSize: 16, fontWeight: 700, margin: "0 0 6px" }}>
                Criar um bolão
            </h3>
            <p className="text-subtle" style={{ fontSize: 13, lineHeight: 1.5 }}>
                Monte o seu grupo, envie o link e seja o admin da copa.
            </p>
            </div>
            <button
            className="btn-primary"
            style={{ marginTop: "auto" }}
            onClick={() => router.push("/pools/new")}
            >
            Criar →
            </button>
        </div>
        </div>
    </section>
    )}

        {/* ── Pools loading ───────────────────────────────────────────────────── */}
        {isLoadingPools && (
            <div style={{ padding: "80px 40px", textAlign: "center" }}>
            <p className="text-muted" style={{ fontSize: 14 }}>A carregar os teus bolões...</p>
            </div>
        )}

    {/* ── Bottom sections ─────────────────────────────────────────────────── */}
    {!hasPools && !isLoadingPools && (
    <section style={{
        display: "flex",
        gap: 24,
        padding: "0 40px 60px",
        maxWidth: 1200,
        margin: "0 auto",
        width: "100%",
    }}>

        {/* Next matches + countdown */}
        <div className="card" style={{ flex: 1, padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
            <p className="eyebrow" style={{ marginBottom: 6 }}>Próximos jogos</p>
            <h3 style={{ color: "white", fontSize: 16, fontWeight: 700, margin: 0 }}>Rodada de abertura</h3>
            </div>
            <div style={{ textAlign: "right" }}>
            <p className="text-subtle" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
                Prazo para palpites
            </p>
            <Countdown targetISO={deadlineISO} />
            </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {PLACEHOLDER_MATCHES.map(m => (
            <div key={m.id} style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid var(--brand-border)",
                borderRadius: 10,
            }}>
                <span className="text-subtle" style={{ fontSize: 11, minWidth: 24 }}>G{m.group}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, justifyContent: "center" }}>
                <span style={{ color: "white", fontWeight: 600, fontSize: 14 }}>{m.teamA}</span>
                <span style={{
                    color: "var(--brand-green)", fontSize: 11, fontWeight: 700,
                    padding: "2px 8px", background: "rgba(132,204,22,0.1)",
                    borderRadius: 4, letterSpacing: 1,
                }}>vs</span>
                <span style={{ color: "white", fontWeight: 600, fontSize: 14 }}>{m.teamB}</span>
                </div>
                <span className="text-subtle" style={{ fontSize: 12 }}>
                {new Date(m.time).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}h
                </span>
            </div>
            ))}
        </div>

        <p className="text-subtle" style={{ fontSize: 12, marginTop: 16, textAlign: "center" }}>
            Entre em um bolão para poder palpitar ↑
        </p>
        </div>

        {/* Public pools */}
        <div className="card" style={{ width: 320, flexShrink: 0, padding: 28 }}>
        <p className="eyebrow" style={{ marginBottom: 6 }}>Bolões públicos</p>
        <h3 style={{ color: "white", fontSize: 16, fontWeight: 700, margin: "0 0 20px" }}>
            Entre sem convite
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {PLACEHOLDER_PUBLIC_POOLS.map(pool => (
            <div key={pool.id} style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 14px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid var(--brand-border)",
                borderRadius: 10,
                cursor: "pointer",
                transition: "border-color 0.15s, background 0.15s",
            }}
                onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(132,204,22,0.3)"
                ;(e.currentTarget as HTMLDivElement).style.background = "rgba(132,204,22,0.04)"
                }}
                onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--brand-border)"
                ;(e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)"
                }}
            >
                <div>
                <p style={{ color: "white", fontSize: 14, fontWeight: 600, margin: 0 }}>{pool.name}</p>
                <p className="text-subtle" style={{ fontSize: 12, margin: "2px 0 0" }}>por {pool.admin}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                <p style={{ color: "var(--brand-green)", fontSize: 13, fontWeight: 700, margin: 0 }}>{pool.members}</p>
                <p className="text-subtle" style={{ fontSize: 11, margin: "2px 0 0" }}>membros</p>
                </div>
            </div>
            ))}
        </div>

        <button className="btn-secondary" style={{ marginTop: 20 }}>
            Ver todos os bolões
        </button>
        </div>

    </section>
    )}

</div>
)
}