const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

/**
 * Returns a minimal valid 1×1 transparent PNG as a Buffer.
 * (No external deps needed — just the raw bytes.)
 */
function minimalPng() {
  return Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    'base64',
  );
}

async function main() {
  // Clear existing data (to allow clean re-seeding)
  console.log('Cleaning database...');
  await prisma.payment.deleteMany().catch(() => {});
  await prisma.orderItem.deleteMany().catch(() => {});
  await prisma.order.deleteMany().catch(() => {});
  await prisma.cartItem.deleteMany().catch(() => {});
  await prisma.cart.deleteMany().catch(() => {});
  await prisma.productImage.deleteMany().catch(() => {});
  await prisma.productVariant.deleteMany().catch(() => {});
  await prisma.product.deleteMany().catch(() => {});
  await prisma.category.deleteMany().catch(() => {});

  // ── Admin User ────────────────────────────────────────────────────────────
  const hashedAdmin = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedAdmin,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user:', admin.email);

  // ── Test Customer ─────────────────────────────────────────────────────────
  const hashedTest = await bcrypt.hash('test123', 10);
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test Customer',
      password: hashedTest,
      role: 'USER',
    },
  });
  console.log('✅ Test user:', testUser.email);

  // ── Categories ────────────────────────────────────────────────────────────
  const catDefs = [
    { name: 'Men', slug: 'men' },
    { name: 'Women', slug: 'women' },
    { name: 'Oversized', slug: 'oversized' },
    { name: 'Printed', slug: 'printed' },
    { name: 'Plain', slug: 'plain' },
  ];
  for (const c of catDefs) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
  }
  const menCat   = await prisma.category.findUnique({ where: { slug: 'men' } });
  const plainCat = await prisma.category.findUnique({ where: { slug: 'plain' } });
  console.log('✅ Categories created');

  // ── Products ──────────────────────────────────────────────────────────────
  const existingCount = await prisma.product.count();
  let firstVariantId;

  if (existingCount === 0) {
    const p1 = await prisma.product.create({
      data: {
        name: 'Classic Cotton T-Shirt',
        description: 'Premium quality cotton t-shirt available in multiple colors.',
        price: 2999.00,
        discount: 0,
        categoryId: menCat.id,
        images: {
          create: [
            { imageUrl: '/images/black-tshirt-1.jpg', color: 'Black' },
            { imageUrl: '/images/white-tshirt-1.png', color: 'White' },
            { imageUrl: '/images/red-tshirt-1.png', color: 'Red' },
          ],
        },
        variants: {
          create: [
            { size: 'S',   color: 'Black', stock: 50 },
            { size: 'M',   color: 'Black', stock: 100 },
            { size: 'L',   color: 'Black', stock: 75 },
            { size: 'XL',  color: 'Black', stock: 50 },
            { size: 'XXL', color: 'Black', stock: 25 },
            { size: 'S',   color: 'White', stock: 50 },
            { size: 'M',   color: 'White', stock: 100 },
            { size: 'L',   color: 'White', stock: 75 },
            { size: 'S',   color: 'Red',   stock: 50 },
            { size: 'M',   color: 'Red',   stock: 100 },
            { size: 'L',   color: 'Red',   stock: 75 },
          ],
        },
      },
      include: { variants: true },
    });
    firstVariantId = p1.variants[0].id;

    await prisma.product.create({
      data: {
        name: 'Premium Cotton Polo',
        description: 'Elegant polo shirt with modern slim fit, available in multiple colors.',
        price: 4999.00,
        discount: 10,
        categoryId: plainCat.id,
        images: {
          create: [
            { imageUrl: '/images/white-polo-1.jpg', color: 'White' },
            { imageUrl: '/images/black-polo-1.png', color: 'Black' },
            { imageUrl: '/images/navy-polo-1.png', color: 'Navy Blue' },
          ],
        },
        variants: {
          create: [
            { size: 'S',  color: 'White', stock: 30 },
            { size: 'M',  color: 'White', stock: 60 },
            { size: 'L',  color: 'White', stock: 40 },
            { size: 'XL', color: 'White', stock: 20 },
            { size: 'S',  color: 'Black', stock: 30 },
            { size: 'M',  color: 'Black', stock: 60 },
            { size: 'L',  color: 'Black', stock: 40 },
            { size: 'S',  color: 'Navy Blue', stock: 30 },
            { size: 'M',  color: 'Navy Blue', stock: 60 },
            { size: 'L',  color: 'Navy Blue', stock: 40 },
          ],
        },
      },
    });

    await prisma.product.create({
      data: {
        name: 'Comfortable Oversized Hoodie',
        description: 'Comfortable oversized hoodie perfect for casual wear, available in multiple colors.',
        price: 6999.00,
        discount: 15,
        categoryId: menCat.id,
        images: {
          create: [
            { imageUrl: '/images/navy-hoodie-1.jpg', color: 'Navy Blue' },
            { imageUrl: '/images/black-hoodie-1.png', color: 'Black' },
            { imageUrl: '/images/grey-hoodie-1.png', color: 'Grey' },
          ],
        },
        variants: {
          create: [
            { size: 'M',   color: 'Navy Blue', stock: 40 },
            { size: 'L',   color: 'Navy Blue', stock: 50 },
            { size: 'XL',  color: 'Navy Blue', stock: 30 },
            { size: 'XXL', color: 'Navy Blue', stock: 20 },
            { size: 'S',   color: 'Black', stock: 30 },
            { size: 'M',   color: 'Black', stock: 60 },
            { size: 'L',   color: 'Black', stock: 40 },
            { size: 'S',   color: 'Grey', stock: 30 },
            { size: 'M',   color: 'Grey', stock: 60 },
            { size: 'L',   color: 'Grey', stock: 40 },
          ],
        },
      },
    });

    const imgPool  = ['/images/black-tshirt-1.jpg', '/images/white-polo-1.jpg', '/images/navy-hoodie-1.jpg'];
    const colors   = ['Black', 'White', 'Navy Blue', 'Red', 'Grey'];
    for (let i = 1; i <= 9; i++) {
      const cat = i % 2 === 0 ? menCat : plainCat;
      await prisma.product.create({
        data: {
          name: `Sample Shirt ${i}`,
          description: `Premium sample shirt #${i}. Great fit and quality material.`,
          price: (20 + i * 5) * 100,
          discount: i % 3 === 0 ? 10 : 0,
          categoryId: cat.id,
          images: { create: [{ imageUrl: imgPool[i % 3] }] },
          variants: {
            create: [
              { size: 'S', color: colors[i % 5], stock: 15 },
              { size: 'M', color: colors[i % 5], stock: 20 },
              { size: 'L', color: colors[i % 5], stock: 10 },
            ],
          },
        },
      });
    }
    console.log('✅ 12 products created');
  } else {
    const v = await prisma.productVariant.findFirst();
    firstVariantId = v?.id;
    console.log(`ℹ️  ${existingCount} products already exist — skipping product creation`);
  }

  // ── Sample Order with Custom Design (binary images) ───────────────────────
  if (firstVariantId) {
    const existingOrder = await prisma.order.findFirst({ where: { userId: testUser.id } });
    if (!existingOrder) {
      const png = minimalPng();

      await prisma.order.create({
        data: {
          userId: testUser.id,
          totalAmount: 2999.00,
          status: 'PENDING',
          items: {
            create: [
              {
                productVariantId: firstVariantId,
                quantity: 1,
                price: 2999.00,
                // Custom text
                customText: 'Hello World',
                customTextColor: '#ffffff',
                customTextSize: 24,
                customTextFont: 'Arial',
                customTextX: 50,
                customTextY: 40,
                // Custom logo (stored as binary)
                customLogoData: png,
                customLogoX: 50,
                customLogoY: 60,
                customLogoScale: 80,
                // Preview images (stored as binary)
                customPreviewFrontData: png,
                customPreviewBackData: png,
              },
            ],
          },
        },
      });
      console.log('✅ Sample order with custom design created for test@example.com');
    } else {
      console.log('ℹ️  Order already exists for test user — skipping');
    }
  }

  console.log('\n🎉 Seed complete!');
  console.log('  Admin → admin@example.com / admin123');
  console.log('  User  → test@example.com  / test123\n');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
