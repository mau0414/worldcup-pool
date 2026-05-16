import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { POOL_LIMITS } from "@/lib/config"


export async function POST(
    req: Request,
    { params }: { params: Promise<{ code: string }> }
) {

    // authenticate user
    const session = await auth();
    const userId = session?.user?.id
    const { code } = await params

    console.log("no post", req, code)

    if (!userId) {
        return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    // find the pool by invite code received
    const pool = await db.pool.findUnique({
        where: { inviteCode: code },
        include: {
            members: { select: { id: true } }
        }
    })

    if (!pool) {
        return Response.json({ error: "Pool not found" }, { status: 404 })
    }

    // verify if user is already a member of the pool
    const existingMembership = await db.poolMember.findUnique({
        where: {
        poolId_userId: {
            poolId: pool.id,
            userId,
        }
        }
    })

    if (existingMembership) {
        return Response.json({ error: "You are already a member of this pool" }, { status: 409 })
    }

    // check plan limits ( a user can't join more than 1 pool in free tier )
    const user = await db.user.findUnique({ where: { id: userId } })

    if (!user) {
        return Response.json({ error: "User not found" }, { status: 404 })
    }

    const membershipCount = await db.poolMember.count({
        where: { userId }
    })

    if (user.plan === "free" && membershipCount >= 1) {
        return Response.json({ error: "Free plan allows joining only 1 pool" }, { status: 403 })
    }

    // verify if pool is at max capacity (it was defined at the pool creation respecting the limit that the owner has in their plan)
    if (pool.maxParticipants && pool.members.length >= pool.maxParticipants) {
        return Response.json({ error: "Pool is full" }, { status: 403 })
    }

    // join the pool
    await db.poolMember.create({
        data: {
        poolId: pool.id,
        userId,
        role: "member",
        }
    })

    return NextResponse.json(
        { poolId: pool.id },
        { status: 201 }
    )
}

export async function GET(
    req: Request,
    { params }: { params: Promise<{ code: string }> }
    ) {

        const { code } = await params
        console.log("entrou no meu log!!!!", req)
        console.log("entrou no meu log 2!!!!", code)

    const session = await auth()

    if (!session?.user?.id) {
        return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const pool = await db.pool.findUnique({
        where: { id: code },
        include: {
            members: { select: { id: true, userId: true } }
        }
    })

    // console.log

    if (!pool) {
        return Response.json({ error: "Pool not found" }, { status: 404 })
    }

    const isMember = pool.members.some(m => m.userId === session.user.id)

    if (!isMember) {
        return Response.json({ error: "Forbidden" }, { status: 403 })
    }

    return Response.json({
        id: pool.id,
        name: pool.name,
        inviteCode: pool.inviteCode,
        isPrivate: pool.isPrivate,
        maxParticipants: pool.maxParticipants,
        memberCount: pool.members.length,
        isOwner: pool.ownerId === session.user.id,
        createdAt: pool.createdAt,
    })
}