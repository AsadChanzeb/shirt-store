import { prisma } from '@/lib/prisma';
import ProductCard from '@/components/ProductCard';

interface ShopPageProps {
    searchParams: { category?: string };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
    const { category } = await searchParams;
    const categoryFilter = category;

    const products = await prisma.product.findMany({
        where: categoryFilter
            ? {
                category: {
                    slug: categoryFilter,
                },
            }
            : undefined,
        include: {
            images: { take: 2 },
            category: true,
        },
        orderBy: { createdAt: 'desc' },
    });

    const categories = await prisma.category.findMany();

    return (
        <div className="min-h-screen bg-white pt-32">
            {/* Header */}
            <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-20">
                <h1 className="text-6xl md:text-7xl font-medium mb-6 leading-tight">
                    Discover our{' '}
                    <span className="font-serif-italic">collection</span>
                </h1>
                <p className="text-xl text-[#B1B1B1] max-w-2xl">
                    Explore our curated selection of premium shirts designed for style and comfort
                </p>
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-32">
                {/* Category Filter */}
                <div className="mb-16 flex flex-wrap gap-3">
                    <a
                        href="/shop"
                        className={`px-6 py-3 rounded-full border transition-all ${!categoryFilter
                            ? 'bg-[#443DFF] text-white border-[#443DFF]'
                            : 'border-gray-200 text-[#B1B1B1] hover:border-[#443DFF] hover:text-[#443DFF]'
                            }`}
                    >
                        All
                    </a>
                    {categories.map((category) => (
                        <a
                            key={category.id}
                            href={`/shop?category=${category.slug}`}
                            className={`px-6 py-3 rounded-full border transition-all ${categoryFilter === category.slug
                                ? 'bg-[#443DFF] text-white border-[#443DFF]'
                                : 'border-gray-200 text-[#B1B1B1] hover:border-[#443DFF] hover:text-[#443DFF]'
                                }`}
                        >
                            {category.name}
                        </a>
                    ))}
                </div>

                {/* Products Grid */}
                {products.length === 0 ? (
                    <div className="text-center py-32">
                        <p className="text-3xl text-[#B1B1B1] mb-6">No products found</p>
                        <a href="/shop" className="text-[#443DFF] hover:underline font-medium">
                            View all products
                        </a>
                    </div>
                ) : (
                    <>
                        <div className="mb-8 text-[#B1B1B1]">
                            Showing {products.length} {products.length === 1 ? 'product' : 'products'}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                            {products.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    id={product.id}
                                    name={product.name}
                                    price={Number(product.price)}
                                    discount={Number(product.discount)}
                                    images={product.images.map(img => img.imageUrl)}
                                    slug={product.id}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
