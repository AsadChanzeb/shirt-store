import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2025-12-15.clover',
});

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get('Stripe-Signature') as string;

    let event: Stripe.Event;

    try {
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
        if (!webhookSecret) {
            throw new Error('STRIPE_WEBHOOK_SECRET is not set');
        }

        event = stripe.webhooks.constructEvent(
            body,
            signature,
            webhookSecret
        );
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === 'checkout.session.completed') {
        const orderId = session.metadata?.orderId;

        if (orderId) {
            try {
                // Update the order status to PAID
                await prisma.order.update({
                    where: { id: orderId },
                    data: { status: 'PAID' },
                });

                // Create or update the payment record
                await prisma.payment.upsert({
                    where: { orderId: orderId },
                    update: {
                        status: 'succeeded',
                        stripePaymentIntentId: (session.payment_intent as string) || session.id,
                    },
                    create: {
                        orderId: orderId,
                        status: 'succeeded',
                        stripePaymentIntentId: (session.payment_intent as string) || session.id,
                    },
                });
                console.log(`Order ${orderId} marked as PAID`);
            } catch (error) {
                console.error(`Error updating order ${orderId}:`, error);
                return new NextResponse('Error updating order', { status: 500 });
            }
        }
    }

    return new NextResponse('Webhook received', { status: 200 });
}
