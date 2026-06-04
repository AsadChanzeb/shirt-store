import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ProductDetailClient from '@/components/ProductDetailClient';
import Reviews from '@/components/Reviews';
import Features from '@/components/Features';
import Link from 'next/link';

interface ProductPageProps {
    params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { slug } = await params;
    const product = await prisma.product.findUnique({
        where: { id: slug },
        include: {
            images: true,
            variants: true,
            category: true,
        },
    });

    if (!product) {
        notFound();
    }

    const finalPrice =
        Number(product.discount) > 0
            ? Number(product.price) - (Number(product.price) * Number(product.discount)) / 100
            : Number(product.price);

    return (
        <div className="bg-white min-h-screen">
            {/* Breadcrumbs */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <nav className="flex text-sm text-gray-500 gap-2">
                    <Link href="/" className="hover:text-black transition-colors">Home</Link>
                    <span>/</span>
                    <Link href={`/shop?category=${product.category.name}`} className="hover:text-black transition-colors">{product.category.name}</Link>
                    <span>/</span>
                    <span className="text-black font-medium truncate">{product.name}</span>
                </nav>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
                <ProductDetailClient
                    productId={product.id}
                    name={product.name}
                    description={product.description}
                    finalPrice={finalPrice}
                    originalPrice={Number(product.price)}
                    discount={Number(product.discount)}
                    images={product.images}
                    variants={product.variants}
                />
            </main>

            {/* Features/Highlights Section */}
            <div className="bg-gray-50">
                <Features />
            </div>

            {/* Reviews Section */}
            <Reviews />
        </div>
    );
}
