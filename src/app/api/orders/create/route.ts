import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const { cartItems, total } = await req.json();

        // Create order
        const order = await prisma.order.create({
            data: {
                userId,
                totalAmount: total,
                status: 'PENDING',
                items: {
                    create: cartItems.map((item: any) => ({
                        productVariantId: item.variant.id,
                        quantity: item.quantity,
                        price:
                            Number(item.variant.product.price) -
                            (Number(item.variant.product.price) * Number(item.variant.product.discount)) / 100,
                    })),
                },
            },
        });

        // Clear cart
        await prisma.cartItem.deleteMany({
            where: {
                cart: {
                    userId,
                },
            },
        });

        // Update stock
        for (const item of cartItems) {
            await prisma.productVariant.update({
                where: { id: item.variant.id },
                data: {
                    stock: {
                        decrement: item.quantity,
                    },
                },
            });
        }

        return NextResponse.json({ orderId: order.id }, { status: 201 });
    } catch (error) {
        console.error('Create order error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
