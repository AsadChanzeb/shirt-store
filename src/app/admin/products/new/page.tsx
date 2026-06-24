import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ProductForm from '@/components/admin/ProductForm';

export default async function NewProductPage() {
    const session = await getServerSession(authOptions);

    // Validate admin session
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
        redirect('/');
    }

    // Fetch all categories for the dropdown selector
    const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' },
    });

    return (
        <div className="min-h-screen bg-gray-50/50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <ProductForm categories={categories} />
            </div>
        </div>
    );
}
