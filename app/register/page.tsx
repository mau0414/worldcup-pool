"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/ui/logo"

export default function RegisterPage() {
const router = useRouter()
const [error, setError] = useState("")
const [agreed, setAgreed] = useState(false)
const [loading, setLoading] = useState(false)

async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!agreed) { setError("You must agree to the terms."); return }
    setLoading(true)
    const form = e.currentTarget
    const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        name: (form.elements.namedItem("name") as HTMLInputElement).value,
        email: (form.elements.namedItem("email") as HTMLInputElement).value,
        password: (form.elements.namedItem("password") as HTMLInputElement).value,
    }),
    })
    setLoading(false)
    if (res.ok) {
    router.push("/login")
    } else {
    const body = await res.json()
    setError(body.error)
    }
}

return (
    <div className="page">
    <div className="circle-deco" style={{ width: 520, height: 520, top: "50%", left: "35%", transform: "translate(-50%,-50%)" }} />
    <div className="circle-deco" style={{ width: 320, height: 320, top: "50%", left: "35%", transform: "translate(-50%,-50%)" }} />

    <nav className="nav">
        <Logo />
        <p className="text-muted" style={{ fontSize: 14 }}>
        Já tem login?{" "}
        <a href="/login" style={{ color: "white", textDecoration: "underline", fontWeight: 500 }}> Entrar</a>
        </p>
    </nav>

    <main className="main" style={{ gap: 60 }}>
        {/* Left */}
        <div style={{ flex: 1 }}>
        <p className="eyebrow" style={{ marginBottom: 24 }}>→ Copa do Mundo 2026</p>
        <h1 style={{
            color: "white", fontSize: "clamp(2.4rem, 5vw, 3.6rem)",
            fontWeight: 900, lineHeight: 1.05, textTransform: "uppercase",
            letterSpacing: -1, margin: "0 0 24px",
        }}>
            Palpite cada{" "}
            <span className="text-green" style={{ fontStyle: "italic" }}>jogo.</span>
            {" "}Vença seus amigos.
        </h1>
        <p className="text-muted" style={{ fontSize: 15, lineHeight: 1.7, maxWidth: 420, marginBottom: 48 }}>
            Entre em um bolão. Escolha os vencedores e os placares jogo a jogo.
            Escale um ranking com amigos, colegas e rivais.
        </p>
        <div style={{ display: "flex", gap: 40 }}>
            {[{ value: "48", label: "Seleções" }, { value: "104", label: "Jogos" }, { value: "∞", label: "Diversão" }].map(s => (
            <div key={s.label}>
                <div style={{ color: "white", fontSize: 28, fontWeight: 700 }}>{s.value}</div>
                <div className="text-subtle eyebrow" style={{ marginTop: 2 }}>{s.label}</div>
            </div>
            ))}
        </div>
        </div>

        {/* Right — card */}
        <div className="card" style={{ width: 400, flexShrink: 0 }}>
        <p className="eyebrow" style={{ marginBottom: 10 }}>Ponta-pé</p>
        <h2 style={{ color: "white", fontSize: 26, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 6px" }}>
            Cria sua conta
        </h2>
        <p className="text-subtle" style={{ fontSize: 13, marginBottom: 28 }}>Um minuto. Grátis.</p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div><label className="label">Nome</label><input name="name" required placeholder="Ronaldo Nazário" className="input" /></div>
            <div><label className="label">Email</label><input name="email" type="email" required placeholder="pele@gmail.com" className="input" /></div>
            <div><label className="label">Senha</label><input name="password" type="password" required placeholder="••••••••" className="input" /></div>

            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ accentColor: "var(--brand-green)", width: 15, height: 15 }} />
            <span className="text-muted" style={{ fontSize: 12 }}>
                I agree to the rules of the pool and the{" "}
                <a href="#" style={{ color: "var(--brand-muted)", textDecoration: "underline" }}>fair-play terms</a>.
            </span>
            </label>

            {error && <p className="error-msg">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Setting up..." : "Cadastrar →"}
            </button>

            <div className="divider">or</div>

            <button type="button" className="btn-secondary">
            <GoogleIcon />
            Continuar com Google
            </button>
        </form>
        </div>
    </main>

    <footer className="footer">
        <span>© 2026 Golaço Pool</span>
        <span style={{ letterSpacing: 2 }}>JUNHO · JULHO · 2026</span>
    </footer>
    </div>
)
}

function GoogleIcon() {
return (
    <svg width="18" height="18" viewBox="0 0 18 18">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.013 17.64 11.706 17.64 9.2z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
    <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
    </svg>
)
}