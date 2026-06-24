import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import AdminNavbar from '@/components/AdminNavbar';
import AuthProvider from '@/components/AuthProvider';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any)?.role !== 'ADMIN') {
        redirect('/');
    }

    return (
        <AuthProvider>
            <AdminNavbar />
            <main className="min-h-screen bg-gray-50">{children}</main>
        </AuthProvider>
    );
}
