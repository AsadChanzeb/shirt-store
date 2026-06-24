import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AdminOrderList from '@/components/AdminOrderList';

export default async function AdminOrdersPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== 'ADMIN') {
        redirect('/');
    }

    const rawOrders = await prisma.order.findMany({
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                },
            },
            items: {
                include: {
                    variant: {
                        include: {
                            product: {
                                include: {
                                    images: true,
                                },
                            },
                        },
                    },
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    // Separately query which order items have binary image data
    // (binary Bytes cannot be serialised and passed to Client Components)
    const itemImageFlags = await prisma.orderItem.findMany({
        select: {
            id: true,
            customLogoData: false,
            customPreviewFrontData: false,
            customPreviewBackData: false,
        },
    });

    // Build a flag map: itemId → { hasLogo, hasFront, hasBack }
    const itemFlagsRaw = await prisma.$queryRaw<
        { id: string; has_logo: boolean; has_front: boolean; has_back: boolean }[]
    >`
        SELECT
            id,
            "customLogoData" IS NOT NULL        AS has_logo,
            "customPreviewFrontData" IS NOT NULL AS has_front,
            "customPreviewBackData"  IS NOT NULL AS has_back
        FROM "OrderItem"
    `;
    const flagMap = new Map(
        itemFlagsRaw.map((r) => [r.id, { hasLogo: r.has_logo, hasFront: r.has_front, hasBack: r.has_back }])
    );

    // Serialise to plain objects (convert Decimal → number/string, Date → string, drop Bytes)
    const orders = rawOrders.map((order) => ({
        id: order.id,
        totalAmount: Number(order.totalAmount),
        status: order.status,
        createdAt: order.createdAt.toISOString(),
        user: order.user,
        items: order.items.map((item) => {
            const flags = flagMap.get(item.id) ?? { hasLogo: false, hasFront: false, hasBack: false };
            return {
                id: item.id,
                quantity: item.quantity,
                price: Number(item.price),
                customText: item.customText,
                customTextColor: item.customTextColor,
                customTextSize: item.customTextSize,
                customTextFont: item.customTextFont,
                customTextX: item.customTextX,
                customTextY: item.customTextY,
                customLogoX: item.customLogoX,
                customLogoY: item.customLogoY,
                customLogoScale: item.customLogoScale,
                // Presence flags (no binary data sent to client)
                hasLogoData: flags.hasLogo,
                hasFrontData: flags.hasFront,
                hasBackData: flags.hasBack,
                variant: {
                    id: item.variant.id,
                    size: item.variant.size,
                    color: item.variant.color,
                    product: {
                        id: item.variant.product.id,
                        name: item.variant.product.name,
                        price: Number(item.variant.product.price),
                        discount: Number(item.variant.product.discount),
                        images: item.variant.product.images.map((img) => ({
                            id: img.id,
                            imageUrl: img.imageUrl,
                        })),
                    },
                },
            };
        }),
    }));

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Manage Orders</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        View, search, filter status, and inspect product details for customer orders.
                    </p>
                </div>
            </div>

            <AdminOrderList initialOrders={orders} />
        </div>
    );
}
