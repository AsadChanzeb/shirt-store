import { prisma } from '@/lib/prisma';

async function main() {
  const product = await prisma.product.findFirst({
    select: { id: true },
  });
  if (product) {
    console.log(product.id);
  } else {
    console.error('No product found');
    process.exit(1);
  }
}

main();
