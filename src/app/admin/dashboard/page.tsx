import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Package, ShoppingCart, Users, Coins } from 'lucide-react';

export default async function AdminDashboard() {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== 'ADMIN') {
        redirect('/');
    }

    const [productsCount, ordersCount, usersCount, totalRevenue] = await Promise.all([
        prisma.product.count(),
        prisma.order.count(),
        prisma.user.count(),
        prisma.order.aggregate({
            _sum: {
                totalAmount: true,
            },
            where: {
                status: 'PAID',
            },
        }),
    ]);

    const stats = [
        {
            title: 'Total Products',
            value: productsCount,
            icon: Package,
            href: '/admin/products',
        },
        {
            title: 'Total Orders',
            value: ordersCount,
            icon: ShoppingCart,
            href: '/admin/orders',
        },
        {
            title: 'Total Users',
            value: usersCount,
            icon: Users,
            href: '/admin/users',
        },
        {
            title: 'Revenue',
            value: `Rs. ${Number(totalRevenue._sum.totalAmount || 0).toFixed(2)}`,
            icon: Coins,
            href: '/admin/orders',
        },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat) => (
                    <Link key={stat.title} href={stat.href}>
                        <Card className="hover:shadow-lg transition cursor-pointer">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                                        <p className="text-2xl font-bold">{stat.value}</p>
                                    </div>
                                    <stat.icon className="w-8 h-8 text-gray-400" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <Link href="/admin/products">
                    <Card className="hover:shadow-lg transition cursor-pointer h-full">
                        <CardHeader>
                            <CardTitle>Manage Products</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600">Add, edit, or remove products from your store</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/admin/orders">
                    <Card className="hover:shadow-lg transition cursor-pointer h-full">
                        <CardHeader>
                            <CardTitle>Manage Orders</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600">View and update order statuses</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/admin/users">
                    <Card className="hover:shadow-lg transition cursor-pointer h-full">
                        <CardHeader>
                            <CardTitle>Manage Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600">View and manage user accounts</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    );
}
