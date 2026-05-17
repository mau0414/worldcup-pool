import { db } from "@/lib/db"

export async function GET() {  

    const currentRound = await db.currentRound.findFirst()

    return Response.json(currentRound)
}