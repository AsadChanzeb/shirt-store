import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface OrderPageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ success?: string }>;
}

export default async function OrderPage({ params, searchParams }: OrderPageProps) {
    const { id } = await params;
    const { success } = await searchParams;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect('/login');
    }

    const order = await prisma.order.findUnique({
        where: { id },
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
    });

    if (!order) {
        notFound();
    }

    const isSuccess = success === 'true';

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {isSuccess && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                    <p className="font-bold">Order placed successfully!</p>
                    <p className="text-sm">Thank you for your purchase. Your order ID is {order.id}</p>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Order Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-600">Order ID</p>
                                <p className="font-semibold">{order.id}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Status</p>
                                <p className="font-semibold">{order.status}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Date</p>
                                <p className="font-semibold">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Total</p>
                                <p className="font-semibold">${Number(order.totalAmount).toFixed(2)}</p>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h3 className="font-semibold mb-3">Items</h3>
                            <div className="space-y-2">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                        <span>
                                            {item.variant.product.name} ({item.variant.size} - {item.variant.color}) x{' '}
                                            {item.quantity}
                                        </span>
                                        <span className="font-semibold">
                                            ${(Number(item.price) * item.quantity).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Link href="/shop" className="flex-1">
                                <Button variant="outline" className="w-full">
                                    Continue Shopping
                                </Button>
                            </Link>
                            <Link href="/orders" className="flex-1">
                                <Button className="w-full">View All Orders</Button>
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
