import { auth } from "@/lib/auth"
// import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {  

    const session = await auth();

    if (!session?.user?.id) {
        return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const matches = await db.match.findMany({
        include: {
            predictions: {
                where: {
                    userId: session.user.id
                }
            }
        }
    })

        console.log(matches[0].matchDate);
    return Response.json(matches)
}