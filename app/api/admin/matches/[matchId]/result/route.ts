import { NextRequest, NextResponse } from 'next/server';
import { withAdminGuard } from '@/lib/adminGuard';
import { db } from '@/lib/db';

function calculatePoints(prediction: { predictedA: number; predictedB: number }, result: { teamAScore: number; teamBScore: number }) {
    const predictedDiff = prediction.predictedA - prediction.predictedA;
    const actualDiff = result.teamAScore - result.teamBScore;
    const predictedOutcome = (predictedDiff > 0) ? 'A' : (predictedDiff < 0) ? 'B' : 'DRAW';
    const actualOutcome = (actualDiff > 0) ? 'A' : (actualDiff < 0) ? 'B' : 'DRAW';

    // exact score
    if (predictedDiff === actualDiff && prediction.predictedA === result.teamAScore) {
        return {points: 3, outcome: 'exact'}
    }

    // outcome only
    if (predictedOutcome === actualOutcome) {
        return {points: 1, outcome: 'outcome'}
    }

    // Incorrect
    return {points: 0, outcome: 'none'}; 
}   

async function postResult(req: NextRequest, { params }: { params: { matchId: string } }) {

    const { teamAScore, teamBScore } = await req.json();
    const { matchId } = params;

    // 1. Check game exists and isn't already scored
    const game = await db.match.findUnique({ where: { id: matchId } });
    if (!game) return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    if (game.status === 'FINISHED') return NextResponse.json({ error: 'Match already scored' }, { status: 409 });

    // 2. Score all predictions in a transaction
    const result = await db.$transaction(async (tx) => {
        // Save result on the game
        await tx.match.update({
            where: { id: matchId },
            data: { scoreA: teamAScore, scoreB: teamBScore, status: 'FINISHED' },
        });

        // Fetch all predictions for this game
        const predictions = await tx.prediction.findMany({ where: { matchId } });


        const pointEntries = predictions.map((prediction) => {
            const { points, outcome } = calculatePoints(prediction, { teamAScore, teamBScore });

            return {
                predictionId: prediction.id,
                userId: prediction.userId,
                matchId,
                points,
                type: outcome,
            };
        });

        await tx.pointEntry.createMany({ data: pointEntries });

        return { predictionsScored: predictions.length };
    });

    return NextResponse.json(result);
}

export const POST = withAdminGuard(postResult);