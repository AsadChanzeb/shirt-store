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
        const {
            size,
            color,
            customText,
            customTextColor,
            customTextSize,
            customTextFont,
            customTextX,
            customTextY,
            // customLogoUrl removed - using binary data
            customLogoX,
            customLogoY,
            customLogoScale,
            // customPreviewFrontUrl and customPreviewBackUrl removed - using binary data
            customLogoData,
            customPreviewFrontData,
            customPreviewBackData,
        } = await req.json();

        // 1. Find or create a Customizable Product
        let product = await prisma.product.findFirst({
            where: { name: 'Customizable T-Shirt' },
        });

        if (!product) {
            // Find a category or create one
            let category = await prisma.category.findFirst();
            if (!category) {
                category = await prisma.category.create({
                    data: { name: 'Customizable', slug: 'customizable' },
                });
            }

            product = await prisma.product.create({
                data: {
                    name: 'Customizable T-Shirt',
                    description: 'Your own custom designed premium t-shirt with print placement options.',
                    price: 34.99,
                    discount: 0,
                    categoryId: category.id,
                },
            });
        }

        // 2. Find or create the ProductVariant matching the selected size and color
        let variant = await prisma.productVariant.findFirst({
            where: {
                productId: product.id,
                size,
                color,
            },
        });

        if (!variant) {
            variant = await prisma.productVariant.create({
                data: {
                    productId: product.id,
                    size,
                    color,
                    stock: 999, // default stock for custom print orders
                },
            });
        }

        // 3. Find or create the Cart
        let cart = await prisma.cart.findUnique({
            where: { userId },
        });

        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId },
            });
        }

        // 4. Create the CartItem
        // Check if there is already a CartItem with the exact same custom options and variant
        const existingItem = await prisma.cartItem.findFirst({
            where: {
                cartId: cart.id,
                productVariantId: variant.id,
                customText: customText || null,
                customTextColor: customTextColor || null,
                customTextSize: customTextSize ? Number(customTextSize) : null,
                customTextFont: customTextFont || null,
                customTextX: customTextX ? Number(customTextX) : null,
                customTextY: customTextY ? Number(customTextY) : null,
                // Store binary data directly
                customLogoData: customLogoData ? Buffer.from(customLogoData, 'base64') : null,
                customLogoX: customLogoX ? Number(customLogoX) : null,
                customLogoY: customLogoY ? Number(customLogoY) : null,
                customLogoScale: customLogoScale ? Number(customLogoScale) : null,
                customPreviewFrontData: customPreviewFrontData ? Buffer.from(customPreviewFrontData, 'base64') : null,
                customPreviewBackData: customPreviewBackData ? Buffer.from(customPreviewBackData, 'base64') : null,
            },
        });

        if (existingItem) {
            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + 1 },
            });
        } else {
            await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productVariantId: variant.id,
                    quantity: 1,
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

        return NextResponse.json({ success: true, message: 'Added to cart' }, { status: 200 });
    } catch (error) {
        console.error('Error adding custom design to cart:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
