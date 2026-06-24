import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // Categories
    const category1 = await prisma.category.upsert({
        where: { slug: 't-shirts' },
        update: {},
        create: {
            name: 'T-Shirts',
            slug: 't-shirts',
        },
    });

    const category2 = await prisma.category.upsert({
        where: { slug: 'hoodies' },
        update: {},
        create: {
            name: 'Hoodies',
            slug: 'hoodies',
        },
    });

    console.log('Categories created.');

    // Product 1: Basic Cotton T-Shirt
    const product1 = await prisma.product.create({
        data: {
            name: 'Basic Cotton T-Shirt',
            description: 'A comfortable, breathable 100% cotton t-shirt perfect for everyday wear.',
            price: 1999.00,
            discount: 0,
            categoryId: category1.id,
            images: {
                create: [
                    { imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800', color: 'White' },
                    { imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800', color: 'Black' }
                ]
            },
            variants: {
                create: [
                    { size: 'S', color: 'White', stock: 50 },
                    { size: 'M', color: 'White', stock: 100 },
                    { size: 'L', color: 'White', stock: 75 },
                    { size: 'S', color: 'Black', stock: 40 },
                    { size: 'M', color: 'Black', stock: 60 },
                    { size: 'L', color: 'Black', stock: 50 },
                ]
            }
        }
    });

    // Product 2: Premium Graphic Hoodie
    const product2 = await prisma.product.create({
        data: {
            name: 'Premium Graphic Hoodie',
            description: 'Stay warm and stylish with our heavy-blend premium hoodie featuring an exclusive graphic print.',
            price: 5499.00,
            discount: 10,
            categoryId: category2.id,
            images: {
                create: [
                    { imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800', color: 'Gray' }
                ]
            },
            variants: {
                create: [
                    { size: 'M', color: 'Gray', stock: 30 },
                    { size: 'L', color: 'Gray', stock: 25 },
                    { size: 'XL', color: 'Gray', stock: 15 },
                ]
            }
        }
    });

    // Product 3: V-Neck Summer Tee
    const product3 = await prisma.product.create({
        data: {
            name: 'V-Neck Summer Tee',
            description: 'Lightweight V-neck t-shirt. Your perfect companion for sunny days.',
            price: 2499.00,
            discount: 0,
            categoryId: category1.id,
            images: {
                create: [
                    { imageUrl: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&q=80&w=800', color: 'Navy' }
                ]
            },
            variants: {
                create: [
                    { size: 'S', color: 'Navy', stock: 20 },
                    { size: 'M', color: 'Navy', stock: 45 },
                    { size: 'L', color: 'Navy', stock: 35 },
                ]
            }
        }
    });

    console.log('Products created.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
