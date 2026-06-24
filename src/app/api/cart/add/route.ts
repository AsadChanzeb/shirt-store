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

        const {
            variantId,
            quantity,
            customText,
            customTextColor,
            customTextSize,
            customTextFont,
            customTextX,
            customTextY,
            customLogoData,
            customLogoX,
            customLogoY,
            customLogoScale,
            customPreviewFrontData,
            customPreviewBackData,
        } = await req.json();

        if (!variantId || !quantity) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const userId = (session.user as any).id;

        // Get or create cart
        let cart = await prisma.cart.findUnique({
            where: { userId },
        });

        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId },
            });
        }

        // Check if item with identical customization is already in cart
        const existingItem = await prisma.cartItem.findFirst({
            where: {
                cartId: cart.id,
                productVariantId: variantId,
                customText: customText || null,
                customTextColor: customTextColor || null,
                customTextSize: customTextSize ? Number(customTextSize) : null,
                customTextFont: customTextFont || null,
                customTextX: customTextX ? Number(customTextX) : null,
                customTextY: customTextY ? Number(customTextY) : null,
                customLogoX: customLogoX ? Number(customLogoX) : null,
                customLogoY: customLogoY ? Number(customLogoY) : null,
                customLogoScale: customLogoScale ? Number(customLogoScale) : null,
            },
        });

        if (existingItem) {
            // Update quantity
            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + quantity },
            });
        } else {
            // Add new item
            await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productVariantId: variantId,
                    quantity,
                    customText: customText || null,
                    customTextColor: customTextColor || null,
                    customTextSize: customTextSize ? Number(customTextSize) : null,
                    customTextFont: customTextFont || null,
                    customTextX: customTextX ? Number(customTextX) : null,
                    customTextY: customTextY ? Number(customTextY) : null,
                    customLogoData: customLogoData ? Buffer.from(customLogoData, 'base64') : null,
                    customLogoX: customLogoX ? Number(customLogoX) : null,
                    customLogoY: customLogoY ? Number(customLogoY) : null,
                    customLogoScale: customLogoScale ? Number(customLogoScale) : null,
                    customPreviewFrontData: customPreviewFrontData ? Buffer.from(customPreviewFrontData, 'base64') : null,
                    customPreviewBackData: customPreviewBackData ? Buffer.from(customPreviewBackData, 'base64') : null,
                },
            });
        }

        return NextResponse.json({ message: 'Added to cart' }, { status: 200 });
    } catch (error) {
        console.error('Add to cart error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
