import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent } from '@/components/ui/Card';

export default async function OrdersPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect('/login');
    }

    const userId = (session.user as any).id;

    const orders = await prisma.order.findMany({
        where: { userId },
        include: {
            items: {
                include: {
                    variant: {
                        include: {
                            product: true,
                        },
                    },
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    if (orders.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                <h1 className="text-3xl font-bold mb-4">No Orders Yet</h1>
                <p className="text-gray-600 mb-8">Start shopping to see your orders here!</p>
                <Link href="/shop" className="text-black font-semibold hover:underline">
                    Browse Products →
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold mb-8">My Orders</h1>
            <div className="space-y-4">
                {orders.map((order) => (
                    <Link key={order.id} href={`/orders/${order.id}`}>
                        <Card className="hover:shadow-lg transition cursor-pointer">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Order #{order.id.slice(0, 8)}</p>
                                        <p className="text-sm text-gray-600">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-lg">${Number(order.totalAmount).toFixed(2)}</p>
                                        <p className="text-sm text-gray-600">{order.status}</p>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-700">
                                    {order.items.length} item(s)
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
