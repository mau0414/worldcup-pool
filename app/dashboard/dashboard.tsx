"use client"

import { useEffect, useRef, useState } from "react"
import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/ui/logo"

type CurrentRound = {
    round:          number
    status:         string // "open" | "closed" | "future" | "finished"  
}

type Props = {
    currentOpenRound: CurrentRound | null
}

// ── placeholder data ──────────────────────────────────────────────────────────

const PLACEHOLDER_MATCHES = [
{ id: 1, teamA: "Brasil",    teamB: "México",    time: "2026-06-15T18:00:00Z", group: "A" },
{ id: 2, teamA: "Argentina", teamB: "Canadá",    time: "2026-06-15T21:00:00Z", group: "B" },
{ id: 3, teamA: "Portugal",  teamB: "Marrocos",  time: "2026-06-16T00:00:00Z", group: "C" },
]

const PLACEHOLDER_PREDICTIONS = [
{ id: 1, teamA: "Brasil",    teamB: "México",    predA: 2, predB: 1 },
{ id: 2, teamA: "Argentina", teamB: "Canadá",    predA: 1, predB: 0 },
{ id: 3, teamA: "Portugal",  teamB: "Marrocos",  predA: null, predB: null },
]

const PLACEHOLDER_RESULTS = [
{ id: 1, teamA: "BRA", teamB: "MAR", scoreA: 2, scoreB: 1, predA: 1, predB: 1, pts: 1 },
{ id: 2, teamA: "ARG", teamB: "CAN", scoreA: 3, scoreB: 0, predA: 3, predB: 0, pts: 3 },
{ id: 3, teamA: "POR", teamB: "MEX", scoreA: 1, scoreB: 1, predA: 2, predB: 0, pts: 0 },
{ id: 4, teamA: "ESP", teamB: "USA", scoreA: 2, scoreB: 2, predA: 2, predB: 2, pts: 3 },
{ id: 5, teamA: "FRA", teamB: "ENG", scoreA: 1, scoreB: 0, predA: 1, predB: 1, pts: 1 },
]

const PLACEHOLDER_MY_POOLS = [
{ id: "p1", name: "Bolão da Galera",    rank: 1,  total: 25 },
{ id: "p2", name: "Copa do Escritório", rank: 3,  total: 18 },
{ id: "p3", name: "Hexa ou Racha",      rank: 7,  total: 12 },
]

const PLACEHOLDER_GLOBAL_RANKING = [
{ rank: 1,  name: "Mauricio",  pts: 300 },
{ rank: 2,  name: "Felipe M.", pts: 287 },
{ rank: 3,  name: "Carla R.",  pts: 275 },
{ rank: 4,  name: "Thiago S.", pts: 261 },
{ rank: 5,  name: "Ana P.",    pts: 248 },
]

const PLACEHOLDER_PUBLIC_POOLS = [
{ id: "p1", name: "Bolão da Galera",      members: 38, admin: "Felipe M." },
{ id: "p2", name: "Copa do Escritório",   members: 22, admin: "Carla R." },
{ id: "p3", name: "Hexa ou Racha",        members: 61, admin: "Thiago S." },
{ id: "p4", name: "Os Cravadores",        members: 14, admin: "Ana P." },
]

// ── helpers ───────────────────────────────────────────────────────────────────

const DEADLINE_ISO = "2026-06-15T18:00:00Z"

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
    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
    {[{ v: d, l: "dias" }, { v: h, l: "horas" }, { v: m, l: "min" }, { v: s, l: "seg" }].map(({ v, l }) => (
        <div key={l} style={{
        background: "rgba(132,204,22,0.1)",
        border: "1px solid rgba(132,204,22,0.25)",
        borderRadius: 8,
        padding: "10px 14px",
        textAlign: "center",
        minWidth: 54,
        }}>
        <div style={{ color: "var(--brand-green)", fontSize: 24, fontWeight: 900, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{pad(v)}</div>
        <div style={{ color: "var(--brand-subtle)", fontSize: 10, textTransform: "uppercase", letterSpacing: 1, marginTop: 4 }}>{l}</div>
        </div>
    ))}
    </div>
)
}

function PtsTag({ pts }: { pts: number }) {
const color = pts === 3 ? "#84cc16" : pts === 1 ? "#facc15" : "#6b7280"
const bg    = pts === 3 ? "rgba(132,204,22,0.12)" : pts === 1 ? "rgba(250,204,21,0.1)" : "rgba(107,114,128,0.1)"
const label = pts === 0 ? "0 pts" : `+${pts} pt${pts > 1 ? "s" : ""}`
return (
    <span style={{
    color, background: bg,
    border: `1px solid ${color}33`,
    borderRadius: 6, padding: "3px 8px",
    fontSize: 12, fontWeight: 700, whiteSpace: "nowrap",
    }}>{label}</span>
)
}

// ── shared sub-components ─────────────────────────────────────────────────────

function Header({
userName, userInitial, menuOpen, setMenuOpen, menuRef, router,
}: {
userName: string, userInitial: string,
menuOpen: boolean, setMenuOpen: (v: boolean | ((o: boolean) => boolean)) => void,
menuRef: React.RefObject<HTMLDivElement | null>, router: ReturnType<typeof useRouter>,
}) {
return (
    <header style={{
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "18px 40px",
    borderBottom: "1px solid var(--brand-border)",
    position: "sticky", top: 0,
    background: "rgba(5,14,5,0.92)",
    backdropFilter: "blur(12px)",
    zIndex: 50,
    }}>
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <Logo />
        <div style={{ width: 1, height: 20, background: "var(--brand-border)" }} />
        <span className="text-muted" style={{ fontSize: 14 }}>{userName}</span>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>

                {/* ADD THESE TWO: */}
        <button
            onClick={() => router.push("/predictions")}
            style={{
            background: "transparent", border: "none",
            color: "white", fontSize: 15,
            cursor: "pointer", padding: "7px 4px",
            transition: "color 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "white")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--brand-muted)")}
        >Meus palpites</button>

        <button
            onClick={() => router.push("/pools")}
            style={{
            background: "transparent", border: "none",
            color: "white", fontSize: 15,
            cursor: "pointer", padding: "7px 4px",
            transition: "color 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "white")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--brand-muted)")}
        >Meus bolões</button>

        <button
        onClick={() => router.push("/premium")}
        style={{
            background: "transparent", border: "1px solid var(--brand-green)",
            color: "var(--brand-green)", borderRadius: "var(--brand-radius)",
            padding: "7px 16px", fontSize: 13, fontWeight: 700,
            letterSpacing: 1, textTransform: "uppercase", cursor: "pointer",
            transition: "background 0.15s",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "rgba(132,204,22,0.08)")}
        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >⚡ Se torne Premium</button>

        <div ref={menuRef} style={{ position: "relative" }}>
        <button
            onClick={() => setMenuOpen(o => !o)}
            style={{
            width: 38, height: 38, borderRadius: "50%",
            background: "var(--brand-green)", color: "var(--brand-green-fg)",
            border: "none", fontWeight: 800, fontSize: 15, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            }}
        >{userInitial}</button>
        {menuOpen && (
            <div style={{
            position: "absolute", right: 0, top: 46,
            background: "#0d1a0d", border: "1px solid var(--brand-border)",
            borderRadius: 10, minWidth: 160, overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            }}>
            {[
                { label: "Meu perfil",     onClick: () => router.push("/profile") },
                { label: "Configurações",  onClick: () => router.push("/settings") },
                { label: "Sair",           onClick: () => signOut({ callbackUrl: "/login" }), danger: true },
            ].map(item => (
                <button key={item.label} onClick={item.onClick} style={{
                display: "block", width: "100%", padding: "11px 16px",
                background: "transparent", border: "none", textAlign: "left",
                color: item.danger ? "#f87171" : "var(--brand-muted)",
                fontSize: 14, cursor: "pointer", transition: "background 0.1s, color 0.1s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; if (!item.danger) e.currentTarget.style.color = "white" }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = item.danger ? "#f87171" : "var(--brand-muted)" }}
                >{item.label}</button>
            ))}
            </div>
        )}
        </div>
    </div>
    </header>
)
}

// ── main component ────────────────────────────────────────────────────────────

export default function DashboardPage({ currentOpenRound }: Props) {
const { data: session, status } = useSession()
const router = useRouter()
const [pools, setPools] = useState<any[]>([])
const [loadingPools, setLoadingPools] = useState(true)
const [roundGames, setRoundGames] = useState<any[]>([])
const [loadingRoundGames, setLoadingRoundGames] = useState(true)
const [menuOpen, setMenuOpen] = useState(false)
const menuRef = useRef<HTMLDivElement>(null)

const userName    = session?.user?.name?.split(" ")[0] ?? "Craque"
const userInitial = userName[0].toUpperCase()

useEffect(() => {
    function handler(e: MouseEvent) {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
}, [])

useEffect(() => {
    fetch("/api/pools")
    .then(r => r.json())
    .then(data => { setPools(Array.isArray(data) ? data : []); setLoadingPools(false) })
    .catch(() => setLoadingPools(false))
}, [])

useEffect(() => {
    fetch(`/api/matches/${currentOpenRound?.round ?? "1"}?limit=5`)
        .then(r => r.json())
        .then(data => { setRoundGames(Array.isArray(data) ? data : []); setLoadingRoundGames(false) })
        .catch(() => setLoadingRoundGames(false))
}, [])

if (status === "loading") {
    return (
    <div style={{ minHeight: "100vh", background: "var(--brand-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p className="text-muted">Carregando...</p>
    </div>
    )
}

if (status === "unauthenticated") { router.push("/login"); return null }

const hasPools      = !loadingPools && pools.length > 0
const isLoadingPools = loadingPools

const sharedHeaderProps = { userName, userInitial, menuOpen, setMenuOpen, menuRef, router }

// ── STATE: HAS POOLS ────────────────────────────────────────────────────────
if (hasPools) return (
    <div className="page" style={{ overflowY: "auto" }}>
    <Header {...sharedHeaderProps} />

    {/* Hero */}
    <section style={{
        display: "flex", alignItems: "center", gap: 48,
        padding: "52px 40px 40px", maxWidth: 1200, margin: "0 auto", width: "100%",
    }}>
        {/* Left: countdown */}
        <div style={{ flex: 1 }}>
        <p className="eyebrow" style={{ marginBottom: 14 }}>→ Rodada em andamento</p>
        <h1 style={{
            color: "white", fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
            fontWeight: 900, lineHeight: 1.1, textTransform: "uppercase",
            letterSpacing: -0.5, margin: "0 0 6px",
        }}>
            Faltam
        </h1>
        <Countdown targetISO={DEADLINE_ISO} />
        <p className="text-muted" style={{ fontSize: 14, marginTop: 14, lineHeight: 1.6 }}>
            para o fechamento da rodada.<br />
            <span className="text-subtle" style={{ fontSize: 13 }}>Garanta seus palpites antes do apito!</span>
        </p>
        </div>

        {/* Right: predictions card */}
        <div className="card" style={{ flex: 1, maxWidth: 480, padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
            <p className="eyebrow" style={{ marginBottom: 4 }}>Esta rodada</p>
            <h3 style={{ color: "white", fontSize: 16, fontWeight: 700, margin: 0 }}>Seus palpites</h3>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
            <button
                className="btn-secondary"
                style={{ width: "auto", padding: "7px 14px", fontSize: 12 }}
                onClick={() => router.push("/predictions")}
            >Ver todas</button>
            <button
                className="btn-primary"
                style={{ width: "auto", padding: "7px 14px", fontSize: 12 }}
                onClick={() => router.push("/predictions")}
            >Palpitar →</button>
            </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {roundGames.map(p => {
                
                const prediction = p.predictions?.[0]?.predictedA
                console.log("aqui", prediction)

                return (

            <div key={p.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 14px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid var(--brand-border)",
                borderRadius: 10,
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, justifyContent: "center" }}>
                <span style={{ color: "white", fontWeight: 600, fontSize: 13 }}>{p.teamA}</span>
                {p.predictions?.[0]?.predictedA != null ? (
                    <span style={{
                        color: "var(--brand-green)", fontSize: 13, fontWeight: 800,
                        padding: "2px 10px", background: "rgba(132,204,22,0.1)",
                        border: "1px solid rgba(132,204,22,0.2)", borderRadius: 6,
                    }}>{p.predictions?.[0]?.predictedA} x {p.predictions?.[0]?.predictedB}</span>
                ) : (
                    <span style={{
                    color: "var(--brand-subtle)", fontSize: 12,
                    padding: "2px 10px", background: "rgba(255,255,255,0.04)",
                    border: "1px solid var(--brand-border)", borderRadius: 6,
                    fontStyle: "italic",
                    }}>sem palpite</span>
                )}
                <span style={{ color: "white", fontWeight: 600, fontSize: 13 }}>{p.teamB}</span>
                </div>
            </div>
            )})}
        </div>

        <p className="text-subtle" style={{ fontSize: 12, marginTop: 14, textAlign: "center" }}>
            Mostrando {roundGames.length} de 24 jogos desta rodada
        </p>
        </div>
    </section>

    {/* Bottom three columns */}
    <section style={{
        display: "flex", gap: 20,
        padding: "0 40px 60px", maxWidth: 1200, margin: "0 auto", width: "100%",
    }}>

        {/* Last results */}
        <div className="card" style={{ flex: 1, padding: 24 }}>
        <p className="eyebrow" style={{ marginBottom: 6 }}>Últimos resultados</p>
        <h3 style={{ color: "white", fontSize: 15, fontWeight: 700, margin: "0 0 16px" }}>Como você foi</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {PLACEHOLDER_RESULTS.map(r => (
            <div key={r.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 12px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid var(--brand-border)",
                borderRadius: 10,
            }}>
                <div>
                <div style={{ color: "white", fontSize: 13, fontWeight: 600 }}>
                    {r.teamA} {r.scoreA} × {r.scoreB} {r.teamB}
                </div>
                <div className="text-subtle" style={{ fontSize: 11, marginTop: 2 }}>
                    seu palpite: {r.predA} × {r.predB}
                </div>
                </div>
                <PtsTag pts={r.pts} />
            </div>
            ))}
        </div>
        </div>

        {/* My pools */}
        <div className="card" style={{ flex: 1, padding: 24 }}>
        <p className="eyebrow" style={{ marginBottom: 6 }}>Participando</p>
        <h3 style={{ color: "white", fontSize: 15, fontWeight: 700, margin: "0 0 16px" }}>Seus bolões</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {PLACEHOLDER_MY_POOLS.map(pool => (
            <div
                key={pool.id}
                onClick={() => router.push(`/pools/${pool.id}`)}
                style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 14px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid var(--brand-border)",
                borderRadius: 10, cursor: "pointer",
                transition: "border-color 0.15s, background 0.15s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(132,204,22,0.3)"; (e.currentTarget as HTMLDivElement).style.background = "rgba(132,204,22,0.04)" }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--brand-border)"; (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)" }}
            >
                <span style={{ color: "white", fontSize: 13, fontWeight: 600 }}>{pool.name}</span>
                <div style={{ textAlign: "right" }}>
                <span style={{ color: "var(--brand-green)", fontSize: 13, fontWeight: 700 }}>
                    {pool.rank}°
                </span>
                <span className="text-subtle" style={{ fontSize: 12 }}> / {pool.total} pts</span>
                </div>
            </div>
            ))}
        </div>
        <button
            className="btn-secondary"
            style={{ marginTop: 16 }}
            onClick={() => router.push("/pools/new")}
        >+ Criar outro bolão</button>
        </div>

        {/* Global ranking */}
        <div className="card" style={{ flex: 1, padding: 24 }}>
        <p className="eyebrow" style={{ marginBottom: 6 }}>Competição geral</p>
        <h3 style={{ color: "white", fontSize: 15, fontWeight: 700, margin: "0 0 16px" }}>Ranking global</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {PLACEHOLDER_GLOBAL_RANKING.map(player => {
            const isMe = player.name === userName
            return (
                <div key={player.rank} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 14px",
                background: isMe ? "rgba(132,204,22,0.07)" : "rgba(255,255,255,0.03)",
                border: isMe ? "1px solid rgba(132,204,22,0.3)" : "1px solid var(--brand-border)",
                borderRadius: 10,
                }}>
                <span style={{
                    color: player.rank <= 3 ? "var(--brand-green)" : "var(--brand-subtle)",
                    fontSize: 13, fontWeight: 800, minWidth: 24,
                }}>{player.rank}°</span>
                <span style={{ color: isMe ? "var(--brand-green)" : "white", fontSize: 13, fontWeight: isMe ? 700 : 500, flex: 1 }}>
                    {player.name}{isMe && " (você)"}
                </span>
                <span style={{ color: "var(--brand-muted)", fontSize: 13, fontWeight: 600 }}>
                    {player.pts} pts
                </span>
                </div>
            )
            })}
        </div>
        <button
            className="btn-secondary"
            style={{ marginTop: 16 }}
            onClick={() => router.push("/ranking")}
        >Ver ranking completo</button>
        </div>

    </section>
    </div>
)

// ── STATE: NO POOLS ─────────────────────────────────────────────────────────
return (
    <div className="page" style={{ overflowY: "auto" }}>
    <Header {...sharedHeaderProps} />

    {isLoadingPools && loadingRoundGames && (
        <div style={{ padding: "80px 40px", textAlign: "center" }}>
        <p className="text-muted" style={{ fontSize: 14 }}>A carregar os teus bolões...</p>
        </div>
    )}

    {!isLoadingPools && loadingRoundGames && (
        <>
        {/* Hero */}
        <section style={{
            display: "flex", alignItems: "center", gap: 60,
            padding: "60px 40px 48px", maxWidth: 1200, margin: "0 auto", width: "100%",
        }}>
            <div style={{ flex: 1 }}>
            <p className="eyebrow" style={{ marginBottom: 16 }}>→ FIFA World Cup 2026</p>
            <h1 style={{
                color: "white", fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 900, lineHeight: 1.08, textTransform: "uppercase",
                letterSpacing: -1, margin: "0 0 20px",
            }}>
                Olá, <span className="text-green" style={{ fontStyle: "italic" }}>{userName}!</span>
                <br />O hexa vem aí?
            </h1>
            <p className="text-muted" style={{ fontSize: 16, lineHeight: 1.7, maxWidth: 440 }}>
                Você ainda não participa de nenhum bolão.<br />
                Escolha como começar.
            </p>
            </div>

            <div style={{ display: "flex", gap: 20, flexShrink: 0 }}>
            <div className="card" style={{ width: 220, display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(132,204,22,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🔗</div>
                <div>
                <h3 style={{ color: "white", fontSize: 16, fontWeight: 700, margin: "0 0 6px" }}>Entrar num bolão</h3>
                <p className="text-subtle" style={{ fontSize: 13, lineHeight: 1.5 }}>Tem um link de convite? Cole aqui e entre na disputa.</p>
                </div>
                <button className="btn-primary" style={{ marginTop: "auto" }} onClick={() => router.push("/join")}>Entrar →</button>
            </div>

            <div className="card" style={{ width: 220, display: "flex", flexDirection: "column", gap: 16, border: "1px solid rgba(132,204,22,0.25)" }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(132,204,22,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🏆</div>
                <div>
                <h3 style={{ color: "white", fontSize: 16, fontWeight: 700, margin: "0 0 6px" }}>Criar um bolão</h3>
                <p className="text-subtle" style={{ fontSize: 13, lineHeight: 1.5 }}>Monte o seu grupo, envie o link e seja o admin da copa.</p>
                </div>
                <button className="btn-primary" style={{ marginTop: "auto" }} onClick={() => router.push("/pools/new")}>Criar →</button>
            </div>
            </div>
        </section>

        {/* Bottom */}
        <section style={{
            display: "flex", gap: 24,
            padding: "0 40px 60px", maxWidth: 1200, margin: "0 auto", width: "100%",
        }}>
            {/* Next matches */}
            <div className="card" style={{ flex: 1, padding: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                <p className="eyebrow" style={{ marginBottom: 6 }}>Próximos jogos</p>
                <h3 style={{ color: "white", fontSize: 16, fontWeight: 700, margin: 0 }}>Rodada de abertura</h3>
                </div>
                <div style={{ textAlign: "right" }}>
                <p className="text-subtle" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Prazo para palpites</p>
                <Countdown targetISO={DEADLINE_ISO} />
                </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {PLACEHOLDER_MATCHES.map(m => (
                <div key={m.id} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 16px", background: "rgba(68, 41, 41, 0.03)",
                    border: "1px solid var(--brand-border)", borderRadius: 10,
                }}>
                    <span className="text-subtle" style={{ fontSize: 11, minWidth: 24 }}>G{m.group}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, justifyContent: "center" }}>
                    <span style={{ color: "white", fontWeight: 600, fontSize: 14 }}>{m.teamA}</span>
                    <span style={{ color: "var(--brand-green)", fontSize: 11, fontWeight: 700, padding: "2px 8px", background: "rgba(132,204,22,0.1)", borderRadius: 4, letterSpacing: 1 }}>vs</span>
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
            <h3 style={{ color: "white", fontSize: 16, fontWeight: 700, margin: "0 0 20px" }}>Entre sem convite</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {PLACEHOLDER_PUBLIC_POOLS.map(pool => (
                <div key={pool.id} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 14px", background: "rgba(255,255,255,0.03)",
                    border: "1px solid var(--brand-border)", borderRadius: 10,
                    cursor: "pointer", transition: "border-color 0.15s, background 0.15s",
                }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(132,204,22,0.3)"; (e.currentTarget as HTMLDivElement).style.background = "rgba(132,204,22,0.04)" }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--brand-border)"; (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)" }}
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
            <button className="btn-secondary" style={{ marginTop: 20 }}>Ver todos os bolões</button>
            </div>
        </section>
        </>
    )}
    </div>
)
}