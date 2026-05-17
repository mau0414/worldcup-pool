"use client"

import { useEffect, useRef, useState } from "react"
import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/ui/logo"

// ── types ─────────────────────────────────────────────────────────────────────

type CurrentRound = {
    round:          number
    status:         string // "open" | "closed" | "future" | "finished"  
}

type Props = {
    currentOpenRound: CurrentRound | null
}

type Prediction = {
    matchId: string
    predictedA: number | ""
    predictedB: number | ""
    round: number
    userId: string
}

type Match = {
    id: string
    teamA: string
    teamB: string
    matchDate: string
    group: string
    round: number
    predictions?: Prediction[]
}

type ExistingPrediction = {
    matchId: string
    predictedA: number
    predictedB: number
    userId: string
    round: number
}

// ── helpers ───────────────────────────────────────────────────────────────────

function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, T[]> {
return arr.reduce((acc, item) => {
    const k = key(item)
    if (!acc[k]) acc[k] = []
    acc[k].push(item)
    return acc
}, {} as Record<string, T[]>)
}

// ── ScoreInput ────────────────────────────────────────────────────────────────

function ScoreInput({
value,
onChange,
disabled,
}: {
value: number | ""
onChange: (v: number | "") => void
disabled?: boolean
}) {
return (
    <input
    type="text"
    inputMode="numeric"
    pattern="[0-9]*"
    maxLength={2}
    value={value === "" ? "" : String(value)}
    disabled={disabled}
    placeholder="–"
    onChange={e => {
        const raw = e.target.value.replace(/[^0-9]/g, "")
        if (raw === "") { onChange(""); return }
        const n = parseInt(raw, 10)
        if (!isNaN(n) && n >= 0 && n <= 99) onChange(n)
    }}
    style={{
        width: 52,
        height: 44,
        textAlign: "center",
        fontSize: 20,
        fontWeight: 800,
        background: disabled ? "rgba(255,255,255,0.03)" : "rgba(132,204,22,0.07)",
        border: `1.5px solid ${disabled ? "var(--brand-border)" : "rgba(132,204,22,0.3)"}`,
        borderRadius: 8,
        color: disabled ? "var(--brand-subtle)" : "white",
        outline: "none",
        cursor: disabled ? "not-allowed" : "text",
        fontVariantNumeric: "tabular-nums",
        caretColor: "var(--brand-green)",
    } as React.CSSProperties}
    onFocus={e => {
        if (!disabled) e.currentTarget.style.borderColor = "var(--brand-green)"
    }}
    onBlur={e => {
        if (!disabled) e.currentTarget.style.borderColor = "rgba(132,204,22,0.3)"
    }}
    />
)
}

// ── MatchRow ──────────────────────────────────────────────────────────────────

function MatchRow({
match,
prediction,
existing,
onChange,
isChanged,
}: {
    match: Match
    prediction: Prediction
    existing?: ExistingPrediction
    onChange: (matchId: string, side: "scoreA" | "scoreB", value: number | "") => void
    isChanged: boolean
}) {
    
const dateObj = new Date(match.matchDate)
const kickoff = isNaN(dateObj.getTime())
    ? "—"
    : dateObj.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    })

const hasPred = prediction.predictedA !== "" && prediction.predictedB !== ""

return (
    <div
    style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 20px",
        background: isChanged
        ? "rgba(132,204,22,0.06)"
        : "rgba(255,255,255,0.02)",
        border: `1px solid ${isChanged ? "rgba(132,204,22,0.25)" : "var(--brand-border)"}`,
        borderRadius: 12,
        gap: 12,
        transition: "background 0.2s, border-color 0.2s",
    }}
    >
    {/* Kickoff time */}
    <span
        className="text-subtle"
        style={{ fontSize: 11, minWidth: 70, letterSpacing: 0.5 }}
    >
        {kickoff}h
    </span>

    {/* Teams + score inputs */}
    <div
        style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        flex: 1,
        justifyContent: "center",
        }}
    >
        <span
        style={{
            color: "white",
            fontWeight: 700,
            fontSize: 14,
            textAlign: "right",
            flex: 1,
        }}
        >
        {match.teamA}
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <ScoreInput
            value={prediction.predictedA}
            onChange={v => onChange(match.id, "scoreA", v)}
        />
        <span
            style={{
            color: "var(--brand-subtle)",
            fontSize: 13,
            fontWeight: 700,
            padding: "0 2px",
            }}
        >
            ×
        </span>
        <ScoreInput
            value={prediction.predictedB}
            onChange={v => onChange(match.id, "scoreB", v)}
        />
        </div>

        <span
        style={{
            color: "white",
            fontWeight: 700,
            fontSize: 14,
            textAlign: "left",
            flex: 1,
        }}
        >
        {match.teamB}
        </span>
    </div>

    {/* Status pill */}
    <div style={{ minWidth: 56, display: "flex", justifyContent: "flex-end" }}>
        {isChanged && existing ? (
        <span
            style={{
            fontSize: 10,
            fontWeight: 700,
            color: "var(--brand-green)",
            background: "rgba(132,204,22,0.1)",
            border: "1px solid rgba(132,204,22,0.2)",
            borderRadius: 20,
            padding: "3px 8px",
            letterSpacing: 0.5,
            textTransform: "uppercase",
            }}
        >
            editado
        </span>
        ) : hasPred ? (
        <span
            style={{
            fontSize: 16,
            color: "var(--brand-green)",
            opacity: 0.7,
            }}
        >
            ✓
        </span>
        ) : (
        <span style={{ fontSize: 16, color: "var(--brand-subtle)", opacity: 0.4 }}>
            ○
        </span>
        )}
    </div>
    </div>
)
}

// ── main component ────────────────────────────────────────────────────────────

export default function PredictionsPage({ currentOpenRound }: Props) {
const { data: session, status } = useSession()
const router = useRouter()
const menuRef = useRef<HTMLDivElement>(null)
const [menuOpen, setMenuOpen] = useState(false)

const [matches, setMatches] = useState<Match[]>([])
const [loadingMatches, setLoadingMatches] = useState(true)

const [predictions, setPredictions] = useState<Record<string, Prediction>>({})
const [existingPredictions, setExistingPredictions] = useState<
    Record<string, ExistingPrediction>
>({})
const [hasExisting, setHasExisting] = useState(false)

const [currentRound, setCurrentRound] = useState(currentOpenRound?.round ?? 1)
const [submitting, setSubmitting] = useState(false)
const [submitError, setSubmitError] = useState<string | null>(null)
const [submitSuccess, setSubmitSuccess] = useState(false)

const userName = session?.user?.name?.split(" ")[0] ?? "Craque"
const userInitial = userName[0]?.toUpperCase() ?? "?"

// close menu on outside click
useEffect(() => {
    function handler(e: MouseEvent) {
    if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
}, [])

// fetch matches
useEffect(() => {
    fetch("/api/matches")
    .then(r => r.json())
    .then((data: Match[]) => {
        setMatches(Array.isArray(data) ? data : [])
        // init empty predictions
        const initial: Record<string, Prediction> = {}
        data.forEach((m: Match) => {
            // find the prediction that belongs to the current user
            const userPrediction = m.predictions?.[0]

            initial[m.id] = {
                matchId: m.id,
                predictedA: userPrediction?.predictedA ?? "",
                predictedB: userPrediction?.predictedB ?? "",
                round: m.round,
                userId: session?.user?.id ?? "",
            }
        })
        setPredictions(initial)
        setLoadingMatches(false)
    })
    .catch(() => setLoadingMatches(false))
}, [])

// fetch existing predictions (if any)
// useEffect(() => {
//     fetch("/api/predictions")
//     .then(r => r.json())
//     .then((data: ExistingPrediction[]) => {
//         if (Array.isArray(data) && data.length > 0) {
//         const map: Record<string, ExistingPrediction> = {}
//         data.forEach(p => { map[p.matchId] = p })
//         setExistingPredictions(map)
//         setHasExisting(true)
//         // pre-fill inputs
//         setPredictions(prev => {
//             const next = { ...prev }
//             data.forEach(p => {
//                 next[p.matchId] = {
//                     matchId: p.matchId,
//                     predictedA: p.predictedA,
//                     predictedB: p.predictedB,
//                     round: p.round,
//                     userId: p.userId
//                 }
//             })
//             return next
//         })
//         }
//     })
//     .catch(() => {})
// }, [])

// derived
const rounds = Array.from(new Set(matches.map(m => m.round))).sort((a, b) => a - b)
const totalRounds = rounds.length
const roundMatches = matches.filter(m => m.round === currentRound)
const groupedMatches = groupBy(roundMatches, m => m.group)
const sortedGroups = Object.keys(groupedMatches).sort()

// which matches changed vs existing
const changedMatchIds = new Set<string>()
if (hasExisting) {
    Object.values(predictions).forEach(p => {
    const ex = existingPredictions[p.matchId]
    if (!ex) return
    if (p.predictedA !== ex.predictedA || p.predictedB !== ex.predictedB) {
        changedMatchIds.add(p.matchId)
    }
    })
}

const handleChange = (
    matchId: string,
    side: "scoreA" | "scoreB",
    value: number | ""
) => {
    setPredictions(prev => ({
        ...prev,
        [matchId]: {
            ...prev[matchId],
            // map scoreA → predictedA, scoreB → predictedB
            [side === "scoreA" ? "predictedA" : "predictedB"]: value,
        },
    }))
    setSubmitSuccess(false)
    setSubmitError(null)
}

// button is enabled as soon as any match has both scores filled
const anyFilled = Object.values(predictions).some(
    p => p.predictedA !== "" && p.predictedB !== ""
)

// submit all (creation mode)
const handleSubmitAll = async () => {
    const filledPredictions = Object.values(predictions).filter(
        p => p.predictedA !== "" && p.predictedB !== ""
    )

    const payload = { matches: filledPredictions }
    setSubmitting(true)
    setSubmitError(null)
    try {
    const res = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error("Erro ao salvar palpites.")
    setHasExisting(true)
    const saved: Record<string, ExistingPrediction> = {}
    payload.matches.forEach(p => {
        saved[p.matchId] = {
        matchId: p.matchId,
        predictedA: p.predictedA as number,
        predictedB: p.predictedB as number,
        userId: p.userId,
        round: p.round,
        }
    })
    setExistingPredictions(saved)
    setSubmitSuccess(true)
    } catch (e: any) {
    setSubmitError(e.message ?? "Erro desconhecido.")
    } finally {
    setSubmitting(false)
    }
}

// submit only changed (edit mode)
const handleSubmitChanges = async () => {
    const changed = Array.from(changedMatchIds).map(id => predictions[id])
    setSubmitting(true)
    setSubmitError(null)
    try {
    const res = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changed),
    })
    if (!res.ok) throw new Error("Erro ao salvar alterações.")
    // update local existing
    setExistingPredictions(prev => {
        const next = { ...prev }
        changed.forEach(p => {
        next[p.matchId] = {
            matchId: p.matchId,
            predictedA: p.predictedA as number,
            predictedB: p.predictedB as number,
            userId: p.userId,
            round: p.round,
        }
        })
        return next
    })
    setSubmitSuccess(true)
    } catch (e: any) {
    setSubmitError(e.message ?? "Erro desconhecido.")
    } finally {
    setSubmitting(false)
    }
}

if (status === "loading") {
    return (
    <div className="page" style={{ alignItems: "center", justifyContent: "center" }}>
        <p className="text-muted">A carregar...</p>
    </div>
    )
}

return (
    <div className="page" style={{ overflowY: "auto" }}>

    {/* ── Header ──────────────────────────────────────────────────────────── */}
    <header
        style={{
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
        }}
    >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        {/* Back button */}
        <button
            onClick={() => router.push("/dashboard")}
            style={{
            background: "transparent",
            border: "1px solid var(--brand-border)",
            color: "var(--brand-muted)",
            borderRadius: 8,
            width: 34,
            height: 34,
            fontSize: 16,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "border-color 0.15s, color 0.15s",
            flexShrink: 0,
            }}
            onMouseEnter={e => {
            e.currentTarget.style.borderColor = "rgba(132,204,22,0.4)"
            e.currentTarget.style.color = "var(--brand-green)"
            }}
            onMouseLeave={e => {
            e.currentTarget.style.borderColor = "var(--brand-border)"
            e.currentTarget.style.color = "var(--brand-muted)"
            }}
            title="Voltar ao dashboard"
        >
            ←
        </button>

        <Logo />
        <div style={{ width: 1, height: 20, background: "var(--brand-border)" }} />

        {/* Nav links */}
        {[
            { label: "Home", href: "/dashboard" },
            { label: "Meus bolões", href: "/pools" },
        ].map(link => (
            <button
            key={link.href}
            onClick={() => router.push(link.href)}
            style={{
                background: "transparent",
                border: "none",
                color: "var(--brand-muted)",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                padding: "4px 2px",
                transition: "color 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "white")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--brand-muted)")}
            >
            {link.label}
            </button>
        ))}
        </div>

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
            onMouseEnter={e =>
            (e.currentTarget.style.background = "rgba(132,204,22,0.08)")
            }
            onMouseLeave={e =>
            (e.currentTarget.style.background = "transparent")
            }
        >
            ⚡ Se torne Premium
        </button>

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
            <div
                style={{
                position: "absolute",
                right: 0,
                top: 46,
                background: "#0d1a0d",
                border: "1px solid var(--brand-border)",
                borderRadius: 10,
                minWidth: 160,
                overflow: "hidden",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                }}
            >
                {[
                { label: "Meu perfil", onClick: () => router.push("/profile") },
                {
                    label: "Configurações",
                    onClick: () => router.push("/settings"),
                },
                {
                    label: "Sair",
                    onClick: () => signOut({ callbackUrl: "/login" }),
                    danger: true,
                },
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
                    }}
                >
                    {item.label}
                </button>
                ))}
            </div>
            )}
        </div>
        </div>
    </header>

    {/* ── Page title ──────────────────────────────────────────────────────── */}
    <div
        style={{
        textAlign: "center",
        padding: "40px 40px 0",
        maxWidth: 1200,
        margin: "0 auto",
        width: "100%",
        }}
    >
        <p className="eyebrow" style={{ marginBottom: 10 }}>
        → Copa do Mundo 2026
        </p>
        <h1
        style={{
            color: "white",
            fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: -1,
            margin: "0 0 6px",
        }}
        >
        Seus <span className="text-green" style={{ fontStyle: "italic" }}>Palpites</span>
        </h1>
        <p className="text-subtle" style={{ fontSize: 14 }}>
        Preencha o placar esperado para cada jogo e confirme antes do apito inicial.
        </p>

        {/* ── Round navigation ──────────────────────────────────────────────── */}
        {!loadingMatches && totalRounds > 0 && (
        <div
            style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
            marginTop: 32,
            marginBottom: 8,
            }}
        >
            <button
            disabled={currentRound <= rounds[0]}
            onClick={() =>
                setCurrentRound(r => {
                const idx = rounds.indexOf(r)
                return rounds[idx - 1] ?? r
                })
            }
            style={{
                background: "transparent",
                border: "1px solid var(--brand-border)",
                color:
                currentRound <= rounds[0]
                    ? "var(--brand-subtle)"
                    : "var(--brand-green)",
                borderRadius: 8,
                width: 38,
                height: 38,
                fontSize: 18,
                cursor: currentRound <= rounds[0] ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "border-color 0.15s",
                opacity: currentRound <= rounds[0] ? 0.35 : 1,
            }}
            >
            ←
            </button>

            <div style={{ textAlign: "center", minWidth: 120 }}>
            <span
                style={{
                color: "white",
                fontSize: 18,
                fontWeight: 800,
                letterSpacing: -0.5,
                textTransform: "uppercase",
                }}
            >
                Rodada {currentRound}
            </span>
            <p
                className="text-subtle"
                style={{ fontSize: 11, marginTop: 2, letterSpacing: 1 }}
            >
                {currentRound} de {totalRounds}
            </p>
            </div>

            <button
            disabled={currentRound >= rounds[rounds.length - 1]}
            onClick={() =>
                setCurrentRound(r => {
                const idx = rounds.indexOf(r)
                return rounds[idx + 1] ?? r
                })
            }
            style={{
                background: "transparent",
                border: "1px solid var(--brand-border)",
                color:
                currentRound >= rounds[rounds.length - 1]
                    ? "var(--brand-subtle)"
                    : "var(--brand-green)",
                borderRadius: 8,
                width: 38,
                height: 38,
                fontSize: 18,
                cursor:
                currentRound >= rounds[rounds.length - 1]
                    ? "not-allowed"
                    : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "border-color 0.15s",
                opacity: currentRound >= rounds[rounds.length - 1] ? 0.35 : 1,
            }}
            >
            →
            </button>
        </div>
        )}
    </div>

    {/* ── Match groups ────────────────────────────────────────────────────── */}
    <div
        style={{
        maxWidth: 760,
        margin: "24px auto 0",
        padding: "0 40px",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 28,
        }}
    >
        {loadingMatches ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p className="text-muted" style={{ fontSize: 14 }}>
            A carregar jogos...
            </p>
        </div>
        ) : sortedGroups.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p className="text-subtle" style={{ fontSize: 14 }}>
            Nenhum jogo encontrado para esta rodada.
            </p>
        </div>
        ) : (
        sortedGroups.map(group => (
            <div key={group}>
            {/* Group header */}
            <div
                style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 12,
                }}
            >
                <div
                style={{
                    background: "rgba(132,204,22,0.1)",
                    border: "1px solid rgba(132,204,22,0.2)",
                    borderRadius: 6,
                    padding: "4px 10px",
                    fontSize: 11,
                    fontWeight: 800,
                    color: "var(--brand-green)",
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                }}
                >
                Grupo {group}
                </div>
                <div
                style={{
                    flex: 1,
                    height: 1,
                    background: "var(--brand-border)",
                }}
                />
            </div>

            {/* Matches */}
            <div
                style={{ display: "flex", flexDirection: "column", gap: 8 }}
            >
                {groupedMatches[group].map(match => (
                <MatchRow
                    key={match.id}
                    match={match}
                    prediction={
                    predictions[match.id] ?? {
                        matchId: match.id,
                        scoreA: "",
                        scoreB: "",
                    }
                    }
                    existing={existingPredictions[match.id]}
                    onChange={handleChange}
                    isChanged={changedMatchIds.has(match.id)}
                />
                ))}
            </div>
            </div>
        ))
        )}
    </div>

    {/* ── Footer actions ───────────────────────────────────────────────────── */}
    {!loadingMatches && matches.length > 0 && (
        <div
        style={{
            maxWidth: 760,
            margin: "32px auto 60px",
            padding: "0 40px",
            width: "100%",
        }}
        >
        {/* Feedback messages */}
        {submitError && (
            <p
            style={{
                color: "#f87171",
                fontSize: 13,
                textAlign: "center",
                marginBottom: 12,
            }}
            >
            {submitError}
            </p>
        )}
        {submitSuccess && (
            <p
            style={{
                color: "var(--brand-green)",
                fontSize: 13,
                textAlign: "center",
                marginBottom: 12,
                fontWeight: 600,
            }}
            >
            ✓ Palpites salvos com sucesso!
            </p>
        )}

        {/* ── Single button for both create and edit ── */}
        <div
            style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            }}
        >
            <button
            disabled={!anyFilled || submitting}
            onClick={handleSubmitAll}
            style={{
                width: "100%",
                padding: "15px 0",
                borderRadius: "var(--brand-radius)",
                fontSize: 14,
                fontWeight: 800,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                cursor: !anyFilled || submitting ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                border: "none",
                background: anyFilled ? "var(--brand-green)" : "rgba(255,255,255,0.05)",
                color: anyFilled ? "var(--brand-green-fg)" : "var(--brand-subtle)",
                opacity: submitting ? 0.6 : 1,
            }}
            >
            {submitting ? "A guardar..." : "Confirmar palpites"}
            </button>

            {!anyFilled && (
            <p className="text-subtle" style={{ fontSize: 12, textAlign: "center" }}>
                Preencha pelo menos um jogo para confirmar.
            </p>
            )}
        </div>
        </div>
    )}

    </div>
)
}