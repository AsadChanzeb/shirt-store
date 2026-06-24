import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ProductForm from '@/components/admin/ProductForm';

interface EditProductPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
    const session = await getServerSession(authOptions);

    // Validate admin session
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
        redirect('/');
    }

    const { id } = await params;

    // Fetch product details along with relations
    const product = await prisma.product.findUnique({
        where: { id },
        include: {
            images: true,
            variants: true,
        },
    });

    if (!product) {
        notFound();
    }

    // Fetch all categories for selection
    const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' },
    });

    // Serialize Decimal types to regular numbers for Client Component compatibility
    const serializedProduct = {
        id: product.id,
        name: product.name,
        description: product.description,
        price: Number(product.price),
        discount: Number(product.discount),
        categoryId: product.categoryId,
        images: product.images.map(img => ({ id: img.id, imageUrl: img.imageUrl })),
        variants: product.variants.map(v => ({ id: v.id, size: v.size, color: v.color, stock: v.stock })),
    };

    return (
        <div className="min-h-screen bg-gray-50/50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <ProductForm categories={categories} initialData={serializedProduct} />
            </div>
        </div>
    );
}
