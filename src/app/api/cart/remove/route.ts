import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const itemId = searchParams.get('itemId');

        if (!itemId) {
            return NextResponse.json({ error: 'Missing item ID' }, { status: 400 });
        }

        await prisma.cartItem.delete({
            where: { id: itemId },
        });

        return NextResponse.json({ message: 'Removed from cart' }, { status: 200 });
    } catch (error) {
        console.error('Remove from cart error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
