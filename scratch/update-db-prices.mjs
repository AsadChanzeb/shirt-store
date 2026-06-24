import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting currency migration in database (USD -> PKR)...');

    // 1. Update Products
    const products = await prisma.product.findMany();
    console.log(`Found ${products.length} products to check.`);
    for (const product of products) {
        const oldPrice = Number(product.price);
        if (oldPrice < 500) { // If price is small (indicating USD)
            const newPrice = Math.round(oldPrice * 100);
            console.log(`Scaling Product "${product.name}": ${oldPrice} -> ${newPrice} PKR`);
            await prisma.product.update({
                where: { id: product.id },
                data: {
                    price: newPrice,
                },
            });
        }
    }

    // 2. Update Order Items
    const orderItems = await prisma.orderItem.findMany();
    console.log(`Found ${orderItems.length} order items to check.`);
    for (const item of orderItems) {
        const oldPrice = Number(item.price);
        if (oldPrice < 500) {
            const newPrice = Math.round(oldPrice * 100);
            console.log(`Scaling OrderItem ID ${item.id}: ${oldPrice} -> ${newPrice} PKR`);
            await prisma.orderItem.update({
                where: { id: item.id },
                data: {
                    price: newPrice,
                },
            });
        }
    }

    // 3. Update Orders
    const orders = await prisma.order.findMany();
    console.log(`Found ${orders.length} orders to check.`);
    for (const order of orders) {
        const oldAmount = Number(order.totalAmount);
        if (oldAmount < 1000) {
            const newAmount = Math.round(oldAmount * 100);
            console.log(`Scaling Order ID ${order.id}: ${oldAmount} -> ${newAmount} PKR`);
            await prisma.order.update({
                where: { id: order.id },
                data: {
                    totalAmount: newAmount,
                },
            });
        }
    }

    console.log('Database currency migration completed successfully!');
}

main()
    .catch((e) => {
        console.error('Migration failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
