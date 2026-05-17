import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ round: string }> }
    ) {

    const session = await auth();
    
    if (!session?.user?.id) {
        return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { round } = await params;

    const limit = Number(request.nextUrl.searchParams.get("limit")) || 10;

    const matches = await db.match.findMany({
        where: {
            round: Number(round),
        },
        include: {
            predictions: {
                where: {
                    userId: session.user.id,
                },
                select: {
                    predictedA: true,
                    predictedB: true,
                },
            },
        },
        take: limit,
        orderBy: {
            matchDate: "asc",
        },
    });


    console.log("retorno", matches);
    return NextResponse.json(matches);
}