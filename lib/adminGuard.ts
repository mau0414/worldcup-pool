import { NextRequest, NextResponse } from 'next/server';

export function withAdminGuard(
    handler: (req: NextRequest, context: any) => Promise<NextResponse>
    ) {
        return async (req: NextRequest, context: any) => {
            const token = req.headers.get('authorization')?.replace('Bearer ', '');

            console.log("token", token);
            console.log("admin secret", process.env.ADMIN_SECRET);
            
            if (!token || token !== process.env.ADMIN_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }

            return handler(req, context);
        };
}