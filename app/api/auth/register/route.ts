import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"

export async function POST(req: Request) {
    const { email, name, password } = await req.json()

    if (!email || !password || !name) {
        return NextResponse.json(
            { error: "All fields are required" },
            { status: 400 }
        )
    }

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
        return NextResponse.json(
            { error: "Email already in use" },
            { status: 400 }
        )
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await db.user.create({
        data: { email, name, passwordHash },
    })

    return NextResponse.json(
        { id: user.id, email: user.email },
        { status: 201 }
    )
}