import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Button from '@/components/ui/Button';
import { Plus, Pencil } from 'lucide-react';
import DeleteProductButton from '@/components/admin/DeleteProductButton';

export default async function AdminProductsPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== 'ADMIN') {
        redirect('/');
    }

    const products = await prisma.product.findMany({
        include: {
            category: true,
            variants: true,
        },
        orderBy: { createdAt: 'desc' },
    });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Manage Products</h1>
                <Link href="/admin/products/new">
                    <Button className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Add Product
                    </Button>
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Category
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Price
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Variants
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.map((product) => (
                            <tr key={product.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{product.category.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    Rs. {Number(product.price).toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">{product.variants.length}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium animate-fade-in">
                                    <div className="flex items-center gap-3">
                                        <Link
                                            href={`/product/${product.id}`}
                                            className="text-blue-600 hover:text-blue-900 transition-colors font-semibold"
                                        >
                                            View
                                        </Link>
                                        <Link
                                            href={`/admin/products/${product.id}/edit`}
                                            className="hover:bg-amber-50 text-amber-500 hover:text-amber-700 transition-colors duration-150 p-2 h-9 w-9 inline-flex items-center justify-center rounded-md"
                                            title="Edit Product"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Link>
                                        <DeleteProductButton
                                            productId={product.id}
                                            productName={product.name}
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
