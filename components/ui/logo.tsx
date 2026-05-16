export function Logo() {
return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <svg width="28" height="20" viewBox="0 0 28 20" fill="none">
        <path d="M7 2L14 10L7 18L0 10Z" fill="white"/>
        <path d="M21 2L28 10L21 18L14 10Z" fill="white"/>
    </svg>
    <span style={{ color: "white", fontWeight: 700, fontSize: 18, letterSpacing: 1 }}>
        GOLAÇO<span style={{ color: "#6b7280" }}>.POOL</span>
    </span>
    </div>
)
}