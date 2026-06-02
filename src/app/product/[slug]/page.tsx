import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AddToCartButton from '@/components/AddToCartButton';
import ProductGallery from '@/components/ProductGallery';
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
                <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
                    {/* Left Column: Images */}
                    <div className="lg:col-span-7">
                        <ProductGallery images={product.images} />
                    </div>

                    {/* Right Column: Info */}
                    <div className="lg:col-span-5 flex flex-col justify-start">
                        <div className="mb-8">
                            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 mb-4">
                                {product.name}
                            </h1>
                            <div className="flex items-center gap-4">
                                <span className="text-3xl font-medium text-black">
                                    ${finalPrice.toFixed(2)}
                                </span>
                                {Number(product.discount) > 0 && (
                                    <>
                                        <span className="text-xl text-gray-400 line-through">
                                            ${Number(product.price).toFixed(2)}
                                        </span>
                                        <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-sm font-bold">
                                            -{Number(product.discount)}% OFF
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="mb-12">
                            <AddToCartButton
                                productId={product.id}
                                variants={product.variants}
                                description={product.description}
                            />
                        </div>

                        {/* Product Details Accordion/Summary */}
                        <div className="space-y-4 border-t border-gray-100 pt-8">
                            <details className="group">
                                <summary className="flex justify-between items-center cursor-pointer list-none font-medium text-gray-900">
                                    Product Description
                                    <span className="transition group-open:rotate-180">
                                        <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                                    </span>
                                </summary>
                                <div className="text-gray-600 mt-4 text-sm leading-relaxed">
                                    {product.description}
                                </div>
                            </details>
                            <details className="group">
                                <summary className="flex justify-between items-center cursor-pointer list-none font-medium text-gray-900">
                                    Fabric & Care
                                    <span className="transition group-open:rotate-180">
                                        <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                                    </span>
                                </summary>
                                <div className="text-gray-600 mt-4 text-sm leading-relaxed">
                                    Premium cotton blend. Machine wash cold with like colors. Tumble dry low. Do not bleach.
                                </div>
                            </details>
                        </div>
                    </div>
                </div>
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
