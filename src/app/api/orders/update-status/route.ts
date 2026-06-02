import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { orderId, status } = await req.json();

        await prisma.order.update({
            where: { id: orderId },
            data: { status },
        });

        return NextResponse.json({ message: 'Status updated' }, { status: 200 });
    } catch (error) {
        console.error('Update status error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
