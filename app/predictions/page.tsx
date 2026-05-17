// app/dashboard/page.tsx  ← no "use client", so it's a server component
import { db } from "@/lib/db"
import PredictionsPage from "./predictions" // your actual UI

export default async function Page() {
    const currentRound = await db.currentRound.findFirst({
    where: { status: "open" },
})

return <PredictionsPage currentOpenRound={currentRound} />
}