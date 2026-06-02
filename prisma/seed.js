const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Create Admin User
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Created admin user:', admin.email);

  // Create Categories
  const categories = [
    { name: 'Men', slug: 'men' },
    { name: 'Women', slug: 'women' },
    { name: 'Oversized', slug: 'oversized' },
    { name: 'Printed', slug: 'printed' },
    { name: 'Plain', slug: 'plain' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  console.log('✅ Created categories');

  // Create Products
  const menCategory = await prisma.category.findUnique({ where: { slug: 'men' } });
  const plainCategory = await prisma.category.findUnique({ where: { slug: 'plain' } });

  const product1 = await prisma.product.create({
    data: {
      name: 'Classic Black T-Shirt',
      description: 'Premium quality cotton t-shirt in classic black color',
      price: 29.99,
      discount: 0,
      categoryId: menCategory.id,
      images: {
        create: [
          { imageUrl: '/images/black-tshirt-1.jpg' },
          { imageUrl: '/images/black-tshirt-2.jpg' },
        ],
      },
      variants: {
        create: [
          { size: 'S', color: 'Black', stock: 50 },
          { size: 'M', color: 'Black', stock: 100 },
          { size: 'L', color: 'Black', stock: 75 },
          { size: 'XL', color: 'Black', stock: 50 },
          { size: 'XXL', color: 'Black', stock: 25 },
        ],
      },
    },
  });

  const product2 = await prisma.product.create({
    data: {
      name: 'White Premium Polo',
      description: 'Elegant white polo shirt with modern slim fit',
      price: 49.99,
      discount: 10,
      categoryId: plainCategory.id,
      images: {
        create: [
          { imageUrl: '/images/white-polo-1.jpg' },
        ],
      },
      variants: {
        create: [
          { size: 'S', color: 'White', stock: 30 },
          { size: 'M', color: 'White', stock: 60 },
          { size: 'L', color: 'White', stock: 40 },
          { size: 'XL', color: 'White', stock: 20 },
        ],
      },
    },
  });

  const product3 = await prisma.product.create({
    data: {
      name: 'Navy Blue Hoodie',
      description: 'Comfortable oversized hoodie perfect for casual wear',
      price: 69.99,
      discount: 15,
      categoryId: menCategory.id,
      images: {
        create: [
          { imageUrl: '/images/navy-hoodie-1.jpg' },
          { imageUrl: '/images/navy-hoodie-2.jpg' },
        ],
      },
      variants: {
        create: [
          { size: 'M', color: 'Navy Blue', stock: 40 },
          { size: 'L', color: 'Navy Blue', stock: 50 },
          { size: 'XL', color: 'Navy Blue', stock: 30 },
          { size: 'XXL', color: 'Navy Blue', stock: 20 },
        ],
      },
    },
  });

  console.log('✅ Created initial 3 products');

  // Generate 9 more dummy products to have a total of 12
  const images = [
    '/images/black-tshirt-1.jpg',
    '/images/white-polo-1.jpg',
    '/images/navy-hoodie-1.jpg'
  ];

  for (let i = 1; i <= 9; i++) {
    const randomCategory = [menCategory, plainCategory][Math.floor(Math.random() * 2)];
    const img1 = images[Math.floor(Math.random() * images.length)];
    const img2 = images[Math.floor(Math.random() * images.length)];

    await prisma.product.create({
      data: {
        name: `Sample Product ${i}`,
        description: `This is a sample description for product ${i}. Premium quality and great fit.`,
        price: 20 + Math.floor(Math.random() * 80),
        discount: Math.floor(Math.random() * 20),
        categoryId: randomCategory.id,
        images: {
          create: [
            { imageUrl: img1 },
            { imageUrl: img2 },
          ],
        },
        variants: {
          create: [
            { size: 'S', color: 'Black', stock: 10 },
            { size: 'M', color: 'White', stock: 10 },
            { size: 'L', color: 'Blue', stock: 10 },
          ],
        },
      },
    });
  }

  console.log('✅ Created 9 additional dummy products');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
