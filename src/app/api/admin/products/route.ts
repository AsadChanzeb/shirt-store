import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        // Check if user is admin
        if (!session || (session.user as any)?.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { name, description, price, discount, categoryId, images, variants } = body;

        // Basic validation
        if (!name || !description || !price || !categoryId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (isNaN(Number(price)) || Number(price) < 0) {
            return NextResponse.json(
                { error: 'Price must be a positive number' },
                { status: 400 }
            );
        }

        if (discount && (isNaN(Number(discount)) || Number(discount) < 0 || Number(discount) > 100)) {
            return NextResponse.json(
                { error: 'Discount must be a number between 0 and 100' },
                { status: 400 }
            );
        }

        if (!variants || !Array.isArray(variants) || variants.length === 0) {
            return NextResponse.json(
                { error: 'At least one product variant is required' },
                { status: 400 }
            );
        }

        // Validate variants
        for (const variant of variants) {
            if (!variant.size || !variant.color || variant.stock === undefined || isNaN(Number(variant.stock)) || Number(variant.stock) < 0) {
                return NextResponse.json(
                    { error: 'Each variant must have a valid size, color, and positive stock quantity' },
                    { status: 400 }
                );
            }
        }

        // Create product with relation records nested
        const product = await prisma.product.create({
            data: {
                name,
                description,
                price: Number(price),
                discount: Number(discount || 0),
                categoryId,
                images: {
                    create: (images || []).map((url: string) => ({
                        imageUrl: url,
                    })),
                },
                variants: {
                    create: variants.map((v: any) => ({
                        size: v.size,
                        color: v.color,
                        stock: parseInt(v.stock, 10),
                    })),
                },
            },
            include: {
                images: true,
                variants: true,
            },
        });

        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
