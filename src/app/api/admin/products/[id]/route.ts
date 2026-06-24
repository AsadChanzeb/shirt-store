import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
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

        // Check if product exists
        const existingProduct = await prisma.product.findUnique({
            where: { id },
            include: { variants: true }
        });

        if (!existingProduct) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        // Perform transaction for updates
        const updatedProduct = await prisma.$transaction(async (tx) => {
            // 1. Update basic product details
            const prod = await tx.product.update({
                where: { id },
                data: {
                    name,
                    description,
                    price: Number(price),
                    discount: Number(discount || 0),
                    categoryId,
                }
            });

            // 2. Reconcile images (delete existing and recreate)
            await tx.productImage.deleteMany({
                where: { productId: id }
            });
            if (images && images.length > 0) {
                await tx.productImage.createMany({
                    data: images.map((url: string) => ({
                        productId: id,
                        imageUrl: url,
                    }))
                });
            }

            // 3. Reconcile variants (Keep existing ones matching by ID, create new, delete omitted)
            const inputVariantIds = variants.map(v => v.id).filter(Boolean);
            const currentVariantIds = existingProduct.variants.map(v => v.id);
            const variantsToDelete = currentVariantIds.filter(cid => !inputVariantIds.includes(cid));

            // Delete variants that were removed
            if (variantsToDelete.length > 0) {
                // First check if they are in orders or carts. If they are in orders, it may throw referential error.
                // We'll let database handle referential block, but we want to fail early or handle it.
                await tx.productVariant.deleteMany({
                    where: {
                        id: { in: variantsToDelete }
                    }
                });
            }

            // Update existing variants
            for (const v of variants) {
                if (v.id) {
                    await tx.productVariant.update({
                        where: { id: v.id },
                        data: {
                            size: v.size,
                            color: v.color,
                            stock: parseInt(v.stock, 10),
                        }
                    });
                }
            }

            // Create new variants
            const newVariants = variants.filter(v => !v.id);
            if (newVariants.length > 0) {
                await tx.productVariant.createMany({
                    data: newVariants.map((v: any) => ({
                        productId: id,
                        size: v.size,
                        color: v.color,
                        stock: parseInt(v.stock, 10),
                    }))
                });
            }

            return prod;
        });

        // Get final fully updated product to return
        const finalProduct = await prisma.product.findUnique({
            where: { id: updatedProduct.id },
            include: {
                images: true,
                variants: true,
            }
        });

        return NextResponse.json(finalProduct);
    } catch (error: any) {
        console.error('Error updating product:', error);
        
        // Handle database referential constraints during variant deletion
        if (error.code === 'P2003') {
            return NextResponse.json(
                { error: 'Cannot delete some of the removed variants because they are associated with existing cart items or orders. Modify their details instead of deleting them.' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);

        // Check if user is admin
        if (!session || (session.user as any)?.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // First, fetch the product with its variants to get variant IDs
        const product = await prisma.product.findUnique({
            where: { id },
            include: { variants: true },
        });
        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }
        const variantIds = product.variants.map((v) => v.id);

        // Delete related cart items and order items for these variants to avoid FK violations
        if (variantIds.length > 0) {
            await prisma.cartItem.deleteMany({
                where: { productVariantId: { in: variantIds } },
            });
            await prisma.orderItem.deleteMany({
                where: { productVariantId: { in: variantIds } },
            });
        }

        // Now delete the product (cascade will delete variants and images)
        await prisma.product.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting product:', error);

        // Specific handling for foreign key constraint errors
        if (error.code === 'P2003') {
            return NextResponse.json(
                { error: 'Cannot delete this product because it is linked to existing cart items or orders. Consider removing those references first.' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
