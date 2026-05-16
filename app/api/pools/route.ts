import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { POOL_LIMITS } from "@/lib/config"


export async function POST(req: Request) {

    const session = await auth();
    const { name, isPrivate } = await req.json()

    if (!session?.user?.id) {
        return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const user   = await db.user.findUnique({ where: { id: userId } });

    if (!user) {
        return Response.json({ error: "User not found" }, { status: 404 })
    }

    const limits = POOL_LIMITS[user.plan as keyof typeof POOL_LIMITS]

    const membershipCount = await db.poolMember.count({
        where: { userId: session.user.id }
    })

    if (user.plan === "free" && membershipCount >= limits.maxPools) {
        return Response.json({ error: "Free plan allows you to be a member of only 1 pool" }, { status: 403 })
    }

    const pool = await db.pool.create({
        data: {
            name,
            ownerId: userId,
            members: {
                create: {
                    userId,
                    role: "admin",
                }
            },
            isPrivate,
            maxParticipants: limits.maxParticipantsPerPool
        },
        })

    console.log("vai responder!")    

    return NextResponse.json(
        { id: pool.id,  name: pool.name, isPrivate: pool.isPrivate, createdAt: pool.createdAt, inviteCode: pool.inviteCode, maxParticipants: pool.maxParticipants },
        { status: 201 }
    )
}

export async function GET() {  

    const session = await auth();

    console.log("session:", session)

    if (!session?.user?.id) {
        return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    const pools = await db.pool.findMany({
        where: {
            members: {
                some: { userId }
            }
        },
        include: {
            members: {
                select: { id: true }
            }
        }
    })

    const result = pools.map(pool => ({
        id: pool.id,
        name: pool.name,
        inviteCode: pool.inviteCode,
        isPrivate: pool.isPrivate,
        maxParticipants: pool.maxParticipants,
        memberCount: pool.members.length,
        isOwner: pool.ownerId === userId,
        createdAt: pool.createdAt,
    }))

    return Response.json(result)
}