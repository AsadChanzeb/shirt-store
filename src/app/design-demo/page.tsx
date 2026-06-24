import Image from 'next/image';
import Link from 'next/link';
import {
    ArrowUpRight,
    ChevronDown,
    Heart,
    Mail,
    Menu,
    Search,
    ShoppingBag,
    Star,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';

type DemoProduct = {
    id: string;
    name: string;
    description: string;
    price: number;
    discount: number;
    image: string;
    category: string;
};

type DemoCategory = {
    name: string;
    slug: string;
    image: string;
};

const fallbackProducts: DemoProduct[] = [
    {
        id: 'classic-black-t-shirt',
        name: 'Classic Black T-Shirt',
        description: 'Premium cotton tee with a clean everyday fit.',
        price: 29.99,
        discount: 0,
        image: '/images/black-tshirt-1.jpg',
        category: 'T-Shirts',
    },
    {
        id: 'white-premium-polo',
        name: 'White Premium Polo',
        description: 'Soft white polo shirt with a polished slim profile.',
        price: 49.99,
        discount: 10,
        image: '/images/white-polo-1.jpg',
        category: 'Polos',
    },
    {
        id: 'navy-blue-hoodie',
        name: 'Navy Blue Hoodie',
        description: 'Relaxed hoodie made for cool evenings and casual wear.',
        price: 69.99,
        discount: 15,
        image: '/images/navy-hoodie-1.jpg',
        category: 'Hoodies',
    },
];

const fallbackCategories: DemoCategory[] = [
    { name: 'Men', slug: 'men', image: '/images/black-tshirt-1.jpg' },
    { name: 'Plain', slug: 'plain', image: '/images/white-polo-1.jpg' },
    { name: 'Oversized', slug: 'oversized', image: '/images/navy-hoodie-1.jpg' },
    { name: 'Printed', slug: 'printed', image: '/images/black-tshirt-2.jpg' },
];

const categoryImages = [
    '/images/black-tshirt-1.jpg',
    '/images/white-polo-1.jpg',
    '/images/navy-hoodie-1.jpg',
    '/images/black-tshirt-2.jpg',
    '/images/white-polo-2.jpg',
];

async function getStoreData() {
    try {
        const [products, categories] = await Promise.all([
            prisma.product.findMany({
                take: 8,
                include: {
                    images: { take: 2 },
                    category: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.category.findMany({
                take: 5,
                orderBy: { name: 'asc' },
            }),
        ]);

        const mappedProducts = products.map((product) => ({
            id: product.id,
            name: product.name,
            description: product.description,
            price: Number(product.price),
            discount: Number(product.discount),
            image: product.images[0]?.imageUrl ?? '/images/black-tshirt-1.jpg',
            category: product.category.name,
        }));

        const mappedCategories = categories.map((category, index) => ({
            name: category.name,
            slug: category.slug,
            image: categoryImages[index % categoryImages.length],
        }));

        return {
            products: mappedProducts.length > 0 ? mappedProducts : fallbackProducts,
            categories: mappedCategories.length > 0 ? mappedCategories : fallbackCategories,
        };
    } catch {
        return {
            products: fallbackProducts,
            categories: fallbackCategories,
        };
    }
}

function priceAfterDiscount(product: DemoProduct) {
    return product.discount > 0
        ? product.price - (product.price * product.discount) / 100
        : product.price;
}

function formatPrice(value: number) {
    return `Rs. ${value.toFixed(2)}`;
}

function Rating({ score = '4.8/5' }: { score?: string }) {
    return (
        <div className="flex items-center gap-1 text-[11px] text-black">
            {[1, 2, 3, 4, 5].map((item) => (
                <Star key={item} className="h-3 w-3 fill-[#f7be38] text-[#f7be38]" />
            ))}
            <span className="ml-1 text-neutral-500">{score}</span>
        </div>
    );
}

function ProductTile({
    product,
    featured = false,
}: {
    product: DemoProduct;
    featured?: boolean;
}) {
    const finalPrice = priceAfterDiscount(product);

    return (
        <article className={featured ? 'md:col-span-2' : undefined}>
            <Link href={`/product/${product.id}`} className="group block">
                <div className="relative mb-3 aspect-[1.05] overflow-hidden rounded-[26px] bg-[#f1f1ee]">
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes={featured ? '(min-width: 768px) 520px, 100vw' : '(min-width: 768px) 260px, 100vw'}
                        className="object-cover transition duration-500 group-hover:scale-105"
                    />
                    <button
                        className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/80 text-neutral-500 shadow-sm backdrop-blur transition group-hover:text-[#ef4f5f]"
                        aria-label={`Save ${product.name}`}
                    >
                        <Heart className="h-4 w-4" />
                    </button>
                    {featured && (
                        <div className="absolute bottom-3 right-4 h-12 w-12 rounded-full bg-black/10 backdrop-blur-sm" />
                    )}
                </div>
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h3 className="text-sm font-semibold leading-snug text-black">{product.name}</h3>
                        <p className="mt-1 text-xs text-neutral-500">{product.category}</p>
                    </div>
                    <p className="text-sm font-semibold text-black">{formatPrice(finalPrice)}</p>
                </div>
            </Link>
        </article>
    );
}

function RecommendationCard({ product }: { product: DemoProduct }) {
    const finalPrice = priceAfterDiscount(product);

    return (
        <Link href={`/product/${product.id}`} className="group block">
            <div className="relative mb-3 aspect-[0.86] overflow-hidden rounded-[18px] bg-[#f1f1ee]">
                <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(min-width: 768px) 220px, 50vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                />
            </div>
            <h3 className="text-sm font-semibold leading-snug text-black">{product.name}</h3>
            <Rating />
            <div className="mt-2 flex items-center gap-2 text-xs">
                <span className="font-semibold text-black">{formatPrice(finalPrice)}</span>
                {product.discount > 0 && (
                    <span className="rounded-full bg-[#ffe8e8] px-2 py-0.5 text-[#e35151]">
                        -{product.discount}%
                    </span>
                )}
            </div>
        </Link>
    );
}

export default async function DesignDemoPage() {
    const { products, categories } = await getStoreData();
    const displayProducts = Array.from({ length: 8 }, (_, index) => products[index % products.length]);
    const recommendationProducts = Array.from({ length: 4 }, (_, index) => products[index % products.length]);

    return (
        <div className="design-demo-page min-h-screen bg-[#dedede] px-4 py-8 text-black sm:px-6 lg:py-12">
            <style>
                {`
                    body:has(.design-demo-page) > nav,
                    body:has(.design-demo-page) > footer {
                        display: none !important;
                    }

                    body:has(.design-demo-page) > main {
                        background: #dedede !important;
                    }
                `}
            </style>

            <div className="mx-auto max-w-6xl overflow-hidden bg-[#fbfbf9] shadow-[0_24px_80px_rgba(0,0,0,0.08)]">
                <header className="px-5 pt-5 sm:px-8 lg:px-11">
                    <div className="flex items-center justify-between">
                        <button
                            className="grid h-9 w-9 place-items-center rounded-full hover:bg-black/5"
                            aria-label="Open menu"
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        <Link href="/" className="flex items-center gap-2 text-sm font-semibold">
                            <span className="grid h-7 w-7 place-items-center rounded-full bg-black text-xs text-white">
                                S
                            </span>
                            ShirtStore
                        </Link>

                        <div className="flex items-center gap-4 text-xs">
                            <Link href="/about" className="hidden hover:text-neutral-500 sm:inline">
                                About
                            </Link>
                            <Link href="/contact" className="hidden hover:text-neutral-500 sm:inline">
                                Contact
                            </Link>
                            <Link
                                href="/cart"
                                className="grid h-9 w-9 place-items-center rounded-full border border-neutral-200 bg-white hover:border-black"
                                aria-label="Cart"
                            >
                                <ShoppingBag className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>

                    <div className="mt-5 grid gap-3 lg:grid-cols-[220px_220px_1fr_auto]">
                        <button className="flex h-10 items-center justify-between rounded-full border border-neutral-200 bg-white px-4 text-xs text-neutral-500">
                            Categories
                            <ChevronDown className="h-4 w-4 text-black" />
                        </button>
                        <button className="flex h-10 items-center justify-between rounded-full border border-neutral-200 bg-white px-4 text-xs text-neutral-500">
                            New Product
                            <ChevronDown className="h-4 w-4 text-black" />
                        </button>
                        <label className="flex h-10 items-center gap-3 rounded-full border border-neutral-200 bg-white px-4 text-xs text-neutral-500">
                            <span className="sr-only">Search products</span>
                            <input
                                className="w-full bg-transparent outline-none placeholder:text-neutral-400"
                                placeholder="Search"
                            />
                            <Search className="h-4 w-4 text-black" />
                        </label>
                        <div className="flex flex-wrap items-center gap-2">
                            {['Men', 'Women', 'Children', 'Brands'].map((item) => (
                                <Link
                                    key={item}
                                    href={item === 'Brands' ? '/shop' : `/shop?category=${item.toLowerCase()}`}
                                    className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs transition hover:border-black"
                                >
                                    {item}
                                </Link>
                            ))}
                        </div>
                    </div>
                </header>

                <main className="px-5 pb-10 pt-5 sm:px-8 lg:px-11">
                    <section className="relative overflow-hidden rounded-[32px] bg-neutral-200">
                        <div className="relative h-[390px] sm:h-[440px]">
                            <Image
                                src="/hero-main.png"
                                alt="Models wearing ShirtStore summer shirts"
                                fill
                                priority
                                sizes="(min-width: 1024px) 1040px, 100vw"
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/20" />
                            <div className="absolute inset-x-5 top-1/2 mx-auto max-w-3xl -translate-y-1/2 text-center text-white">
                                <p className="mb-3 text-xs uppercase">Summer Drop 2026</p>
                                <h1 className="text-4xl font-medium leading-tight sm:text-6xl lg:text-7xl">
                                    Summer Arrival of Shirts
                                </h1>
                                <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/90">
                                    Discover breathable cotton shirts, clean polos, and relaxed hoodies made for easy everyday style.
                                </p>
                                <Link
                                    href="/shop"
                                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-semibold text-black transition hover:bg-black hover:text-white"
                                >
                                    Explore Products
                                    <ArrowUpRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </section>

                    <section className="mt-4 grid gap-4 md:grid-cols-2">
                        <div className="relative min-h-[160px] overflow-hidden rounded-[26px] bg-[#ead6b6] p-7">
                            <Image
                                src="/images/white-polo-2.jpg"
                                alt="White premium polo"
                                fill
                                sizes="(min-width: 768px) 520px, 100vw"
                                className="object-cover object-right opacity-70"
                            />
                            <div className="relative z-10 max-w-[240px]">
                                <h2 className="text-2xl font-medium leading-tight">Fresh fits for every day</h2>
                                <Link
                                    href="/shop?category=plain"
                                    className="mt-8 inline-flex rounded-full bg-white px-5 py-2 text-xs font-semibold"
                                >
                                    Shop Now
                                </Link>
                            </div>
                        </div>
                        <div className="relative min-h-[160px] overflow-hidden rounded-[26px] bg-[#e4d6d3] p-7">
                            <Image
                                src="/images/black-tshirt-2.jpg"
                                alt="Classic black t-shirt"
                                fill
                                sizes="(min-width: 768px) 520px, 100vw"
                                className="object-cover object-right opacity-65"
                            />
                            <div className="relative z-10 max-w-[240px]">
                                <h2 className="text-2xl font-medium leading-tight">Premium cotton with a clean look</h2>
                                <Link
                                    href="/shop"
                                    className="mt-8 inline-flex rounded-full bg-white px-5 py-2 text-xs font-semibold"
                                >
                                    Shop Now
                                </Link>
                            </div>
                        </div>
                    </section>

                    <section className="mt-14">
                        <div className="mb-6 flex items-center justify-between gap-4">
                            <h2 className="text-2xl font-medium">Browse by categories</h2>
                            <div className="hidden items-center gap-2 sm:flex">
                                {['All', 'Men', 'Women'].map((item, index) => (
                                    <Link
                                        key={item}
                                        href={index === 0 ? '/shop' : `/shop?category=${item.toLowerCase()}`}
                                        className={`rounded-full border px-5 py-2 text-[11px] uppercase ${
                                            index === 0
                                                ? 'border-black bg-black text-white'
                                                : 'border-neutral-200 bg-white text-black'
                                        }`}
                                    >
                                        {item}
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {categories.slice(0, 4).map((category) => (
                                <Link
                                    key={category.slug}
                                    href={`/shop?category=${category.slug}`}
                                    className="group relative h-40 overflow-hidden rounded-[18px] bg-[#efefeb]"
                                >
                                    <Image
                                        src={category.image}
                                        alt={`${category.name} category`}
                                        fill
                                        sizes="(min-width: 1024px) 250px, 50vw"
                                        className="object-cover transition duration-500 group-hover:scale-105"
                                    />
                                    <span className="absolute bottom-3 left-3 rounded-full bg-white px-4 py-2 text-[11px] font-semibold uppercase">
                                        {category.name}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </section>

                    <section className="mt-14">
                        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <h2 className="text-2xl font-medium">Popular products</h2>
                            <div className="flex flex-wrap items-center gap-2">
                                {['All', 'T-Shirts', 'Polos', 'Hoodies', 'Plain'].map((item, index) => (
                                    <Link
                                        key={item}
                                        href={index === 0 ? '/shop' : '/shop'}
                                        className={`rounded-full border px-5 py-2 text-[11px] uppercase ${
                                            index === 0
                                                ? 'border-black bg-black text-white'
                                                : 'border-neutral-200 bg-white text-black'
                                        }`}
                                    >
                                        {item}
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <div className="grid gap-x-4 gap-y-8 md:grid-cols-4">
                            {displayProducts.slice(0, 7).map((product, index) => (
                                <ProductTile
                                    key={`${product.id}-${index}`}
                                    product={product}
                                    featured={index === 1}
                                />
                            ))}
                        </div>
                    </section>

                    <section className="mt-16 border-t border-neutral-100 pt-12">
                        <div className="rounded-[24px] bg-[#ddbabc] px-5 py-12 text-center">
                            <span className="rounded-full border border-black/20 px-4 py-1 text-xs">Limited Offer</span>
                            <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-medium uppercase leading-tight sm:text-4xl">
                                Exclusive fashion offers await for your wardrobe
                            </h2>
                            <Link
                                href="/shop"
                                className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-semibold text-black"
                            >
                                Check it Now
                                <ArrowUpRight className="h-4 w-4 rounded-full bg-black p-0.5 text-white" />
                            </Link>
                        </div>
                    </section>

                    <section className="mt-20 text-center">
                        <h2 className="mx-auto max-w-xl text-4xl font-medium leading-tight sm:text-5xl">
                            Over 350+ customer reviews from our clients
                        </h2>
                        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-2 items-center gap-4 sm:grid-cols-5">
                            {[
                                '/images/black-tshirt-1.jpg',
                                '/images/white-polo-1.jpg',
                                '/hero-main.png',
                                '/images/navy-hoodie-1.jpg',
                                '/images/white-polo-2.jpg',
                            ].map((src, index) => (
                                <div
                                    key={src}
                                    className={`relative mx-auto overflow-hidden rounded-full bg-neutral-200 ${
                                        index === 1 || index === 2
                                            ? 'h-48 w-48 sm:h-64 sm:w-64'
                                            : 'h-32 w-32 sm:h-36 sm:w-36'
                                    }`}
                                >
                                    <Image
                                        src={src}
                                        alt="Customer wearing ShirtStore products"
                                        fill
                                        sizes="260px"
                                        className="object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="mt-20">
                        <h2 className="mb-8 text-center text-4xl font-medium sm:text-5xl">You might also like</h2>
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {recommendationProducts.map((product, index) => (
                                <RecommendationCard key={`${product.id}-recommendation-${index}`} product={product} />
                            ))}
                        </div>
                    </section>

                    <section className="mt-16 rounded-[20px] bg-[#95a579] px-6 py-10 text-white sm:px-12">
                        <div className="grid gap-8 md:grid-cols-[1fr_320px] md:items-center">
                            <h2 className="text-2xl font-medium uppercase leading-tight sm:text-3xl">
                                Stay up to date about our latest offers
                            </h2>
                            <form className="space-y-3">
                                <label className="flex h-11 items-center gap-2 rounded-full bg-white px-5 text-xs text-neutral-500">
                                    <Mail className="h-4 w-4 text-black" />
                                    <span className="sr-only">Email address</span>
                                    <input
                                        type="email"
                                        placeholder="Enter your email here"
                                        className="w-full bg-transparent text-black outline-none placeholder:text-neutral-500"
                                    />
                                </label>
                                <button className="h-11 w-full rounded-full bg-white text-xs font-semibold text-black">
                                    Subscribe to Newsletter
                                </button>
                            </form>
                        </div>
                    </section>
                </main>

                <footer className="bg-[#f0f0ef] px-5 py-10 sm:px-8 lg:px-11">
                    <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(4,1fr)]">
                        <div>
                            <Link href="/" className="flex items-center gap-2 text-sm font-semibold">
                                <span className="grid h-7 w-7 place-items-center rounded-full bg-black text-xs text-white">
                                    S
                                </span>
                                ShirtStore
                            </Link>
                            <p className="mt-5 max-w-xs text-xs leading-6 text-neutral-500">
                                Premium shirts, polos, and hoodies made for comfort, clean styling, and everyday confidence.
                            </p>
                            <div className="mt-5 flex gap-2">
                                {['f', 'x', 'ig', 'yt'].map((item) => (
                                    <span
                                        key={item}
                                        className="grid h-7 w-7 place-items-center rounded-full bg-white text-[10px] font-semibold"
                                    >
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                        {[
                            ['Company', 'About', 'Contact', 'Reviews', 'Careers'],
                            ['Help', 'Customer Support', 'Delivery Details', 'Terms', 'Privacy'],
                            ['FAQ', 'Account', 'Orders', 'Payment', 'Returns'],
                            ['Resources', 'Size Guide', 'Style Journal', 'How to Buy', 'Care Guide'],
                        ].map(([title, ...links]) => (
                            <div key={title}>
                                <h3 className="mb-5 text-[11px] font-semibold uppercase">{title}</h3>
                                <ul className="space-y-3 text-xs text-neutral-500">
                                    {links.map((item) => (
                                        <li key={item}>
                                            <Link href="/shop" className="hover:text-black">
                                                {item}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                    <div className="mt-10 flex flex-col gap-4 border-t border-neutral-200 pt-6 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
                        <p>ShirtStore &copy; 2026. All rights reserved.</p>
                        <div className="flex gap-2">
                            {['Visa', 'MC', 'PayPal', 'Apple', 'GPay'].map((item) => (
                                <span key={item} className="rounded bg-white px-2 py-1 text-[10px] text-black">
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
