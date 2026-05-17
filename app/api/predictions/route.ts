import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { POOL_LIMITS } from "@/lib/config"


export async function POST(req: Request) {

    const session = await auth();
    const { matches } = await req.json()

    console.log("Input = ", matches)

    if (!session?.user?.id) {
        return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const user = await db.user.findUnique({ where: { id: userId } });

    if (!user) {
        return Response.json({ error: "User not found" }, { status: 404 })
    }

    const predictions = matches.map((match: any) => ({
        userId,
        matchId: match.matchId,
        predictedA: match.predictedA,
        predictedB: match.predictedB,
        round: match.round,
    }))

    const persistedPredictions = await db.$transaction(
        predictions.map((prediction: any) =>
            db.prediction.upsert({
                where: {
                    userId_matchId: {        // <- your @@unique constraint
                        userId: prediction.userId,
                        matchId: prediction.matchId,
                    },
                },
                update: {
                    predictedA: prediction.predictedA,
                    predictedB: prediction.predictedB,
                    round: prediction.round,
                },
                create: prediction,
            })
        )
    )

    return NextResponse.json(
        { predictions: persistedPredictions },
        { status: 201 }
    )
}

// export async function GET() {  

//     const session = await auth();

//     console.log("session:", session)

//     if (!session?.user?.id) {
//         return Response.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const userId = session.user.id

//     const pools = await db.pool.findMany({
//         where: {
//             members: {
//                 some: { userId }
//             }
//         },
//         include: {
//             members: {
//                 select: { id: true }
//             }
//         }
//     })

//     const result = pools.map(pool => ({
//         id: pool.id,
//         name: pool.name,
//         inviteCode: pool.inviteCode,
//         isPrivate: pool.isPrivate,
//         maxParticipants: pool.maxParticipants,
//         memberCount: pool.members.length,
//         isOwner: pool.ownerId === userId,
//         createdAt: pool.createdAt,
//     }))

//     return Response.json(result)
// }