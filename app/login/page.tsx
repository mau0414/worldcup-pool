"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/ui/logo"

export default function LoginPage() {
const router = useRouter()
const [error, setError] = useState("")
const [loading, setLoading] = useState(false)

async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = e.currentTarget

    const result = await signIn("credentials", {
        email: (form.elements.namedItem("email") as HTMLInputElement).value,
        password: (form.elements.namedItem("password") as HTMLInputElement).value,
        redirect: false,
    })

    setLoading(false)
    if (result?.ok) {
        router.push("/dashboard")
    } else {
        setError("Invalid email or password")
    }
}

return (
    <div className="page">
    {/* Circle decorations — mirrored to right side for variety */}
    <div className="circle-deco" style={{ width: 480, height: 480, top: "50%", left: "62%", transform: "translate(-50%,-50%)" }} />
    <div className="circle-deco" style={{ width: 280, height: 280, top: "50%", left: "62%", transform: "translate(-50%,-50%)" }} />

    <nav className="nav">
        <Logo />
        <p className="text-muted" style={{ fontSize: 14 }}>
        Ainda sem conta?{" "}
        <a href="/register" style={{ color: "white", textDecoration: "underline", fontWeight: 500 }}>
            Cadastro de graça
        </a>
        </p>
    </nav>

    <main className="main" style={{ gap: 60 }}>
        {/* Left — card */}
        <div className="card" style={{ width: 400, flexShrink: 0 }}>
        <p className="eyebrow" style={{ marginBottom: 10 }}>Bem vindo de volta</p>
        <h2 style={{
            color: "white", fontSize: 26, fontWeight: 800,
            textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 6px",
        }}>
            De volta ao campo!
        </h2>
        <p className="text-subtle" style={{ fontSize: 13, marginBottom: 28 }}>
            Seus palpites estão esperando.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
            <label className="label">Email</label>
            <input name="email" type="email" required placeholder="cruyff@email.com" className="input" />
            </div>
            <div>
            <label className="label">Senha</label>
            <input name="password" type="password" required placeholder="••••••••" className="input" />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <a href="/forgot-password" style={{ color: "var(--brand-muted)", fontSize: 12, textDecoration: "underline" }}>
                Esqueceu sua senha?
            </a>
            </div>

            {error && <p className="error-msg">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Entrando..." : "Login →"}
            </button>

            <div className="divider">or</div>

            <button type="button" className="btn-secondary">
            <GoogleIcon />
            Continuar com Google
            </button>
        </form>
        </div>

        {/* Right — copy */}
        <div style={{ flex: 1 }}>
        <p className="eyebrow" style={{ marginBottom: 24 }}>→ Copa do Mundo 2026</p>
        <h1 style={{
            color: "white", fontSize: "clamp(2.4rem, 5vw, 3.6rem)",
            fontWeight: 900, lineHeight: 1.05, textTransform: "uppercase",
            letterSpacing: -1, margin: "0 0 24px",
        }}>
            A{" "}
            <span className="text-green" style={{ fontStyle: "italic" }}>tabela</span>
            {" "}não mente.
        </h1>
        <p className="text-muted" style={{ fontSize: 15, lineHeight: 1.7, maxWidth: 420, marginBottom: 48 }}>
            Faça login para fazer seus palpites, acompanhar sua pontuação
            e ver onde você está no bolão.
        </p>
        <div style={{ display: "flex", gap: 40 }}>
            {[
            { value: "3pts", label: "Placar exato" },
            { value: "1pt", label: "Resultado correto" },
            { value: "104", label: "Jogos" },
            ].map(s => (
            <div key={s.label}>
                <div style={{ color: "white", fontSize: 28, fontWeight: 700 }}>{s.value}</div>
                <div className="text-subtle eyebrow" style={{ marginTop: 2 }}>{s.label}</div>
            </div>
            ))}
        </div>
        </div>
    </main>

    <footer className="footer">
        <span>© 2026 Golaço Pool</span>
        <span style={{ letterSpacing: 2 }}>JUNE · JULY · 2026</span>
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