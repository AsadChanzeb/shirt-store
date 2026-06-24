import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

function getStripe() {
    return new Stripe(process.env.STRIPE_SECRET_KEY as string, {
        apiVersion: '2025-12-15.clover',
    });
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        // Ignore cartItems and total from the client for security
        const { paymentMethod = 'ONLINE' } = await req.json();

        // Fetch cart securely from DB
        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        variant: {
                            include: {
                                product: true,
                            },
                        },
                    },
                },
            },
        });

        if (!cart || cart.items.length === 0) {
            return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
        }

        // Calculate total securely on backend
        const total = cart.items.reduce((sum, item) => {
            const price = Number(item.variant.product.price);
            const discount = Number(item.variant.product.discount);
            const finalPrice = discount > 0 ? price - (price * discount) / 100 : price;
            return sum + finalPrice * item.quantity;
        }, 0);

        // Create order
        const order = await prisma.order.create({
            data: {
                userId,
                totalAmount: total,
                paymentMethod: paymentMethod,
                status: 'PENDING',
                items: {
                    create: cart.items.map((item) => ({
                        productVariantId: item.variant.id,
                        quantity: item.quantity,
                        price:
                            Number(item.variant.product.price) -
                            (Number(item.variant.product.price) * Number(item.variant.product.discount)) / 100,
                        customText: item.customText || null,
                        customTextColor: item.customTextColor || null,
                        customTextSize: item.customTextSize ? Number(item.customTextSize) : null,
                        customTextFont: item.customTextFont || null,
                        customTextX: item.customTextX ? Number(item.customTextX) : null,
                        customTextY: item.customTextY ? Number(item.customTextY) : null,
                        customLogoData: item.customLogoData || null,
                        customLogoX: item.customLogoX ? Number(item.customLogoX) : null,
                        customLogoY: item.customLogoY ? Number(item.customLogoY) : null,
                        customLogoScale: item.customLogoScale ? Number(item.customLogoScale) : null,
                        customPreviewFrontData: item.customPreviewFrontData || null,
                        customPreviewBackData: item.customPreviewBackData || null,
                    })),
                },
            },
        });

        // Clear cart
        await prisma.cartItem.deleteMany({
            where: {
                cartId: cart.id,
            },
        });

        // Update stock
        for (const item of cart.items) {
            await prisma.productVariant.update({
                where: { id: item.variant.id },
                data: {
                    stock: {
                        decrement: item.quantity,
                    },
                },
            });
        }

        if (paymentMethod === 'COD') {
            // For Cash on Delivery, bypass Stripe and return the orderId
            return NextResponse.json({ url: null, orderId: order.id }, { status: 201 });
        }

        // Create Stripe checkout session
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        
        const lineItems = cart.items.map((item) => {
            const price = Number(item.variant.product.price);
            const discount = Number(item.variant.product.discount);
            const finalPrice = discount > 0 ? price - (price * discount) / 100 : price;
            
            return {
                price_data: {
                    currency: 'pkr',
                    product_data: {
                        name: `${item.variant.product.name} - Size: ${item.variant.size}`,
                    },
                    unit_amount: Math.round(finalPrice * 100), // Stripe expects amounts in cents
                },
                quantity: item.quantity,
            };
        });

        const sessionStripe = await getStripe().checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${baseUrl}/orders/${order.id}?success=true`,
            cancel_url: `${baseUrl}/cart`,
            metadata: {
                orderId: order.id,
            },
        });

        return NextResponse.json({ url: sessionStripe.url }, { status: 201 });
    } catch (error) {
        console.error('Create order error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
