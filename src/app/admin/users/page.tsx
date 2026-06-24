'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { X } from 'lucide-react';

interface User {
    id: string;
    name: string | null;
    email: string;
    role: 'USER' | 'ADMIN';
    createdAt: string;
}

export default function UsersManagementPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [createFormData, setCreateFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'USER' as 'USER' | 'ADMIN',
    });
    const [createError, setCreateError] = useState('');

    // Redirect if not admin
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated' && (session?.user as any)?.role !== 'ADMIN') {
            router.push('/');
        }
    }, [status, session, router]);

    // Fetch all users
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch('/api/admin/users');
                if (!res.ok) throw new Error('Failed to fetch users');
                const data = await res.json();
                setUsers(data);
            } catch (error) {
                console.error(error);
                alert('Failed to load users');
            } finally {
                setLoading(false);
            }
        };

        if ((session?.user as any)?.role === 'ADMIN') {
            fetchUsers();
        }
    }, [session]);

    // Update user role
    const updateUserRole = async (userId: string, newRole: 'USER' | 'ADMIN') => {
        setUpdating(userId);
        try {
            const res = await fetch('/api/admin/users/update-role', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, role: newRole }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to update role');
            }

            setUsers(users.map(u =>
                u.id === userId ? { ...u, role: newRole } : u
            ));
        } catch (error) {
            alert(`Error: ${error instanceof Error ? error.message : 'Failed to update role'}`);
        } finally {
            setUpdating(null);
        }
    };

    // Create new user
    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateError('');

        if (!createFormData.name || !createFormData.email || !createFormData.password) {
            setCreateError('All fields are required');
            return;
        }

        if (createFormData.password !== createFormData.confirmPassword) {
            setCreateError('Passwords do not match');
            return;
        }

        if (createFormData.password.length < 6) {
            setCreateError('Password must be at least 6 characters');
            return;
        }

        setCreateLoading(true);

        try {
            const res = await fetch('/api/admin/users/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: createFormData.name,
                    email: createFormData.email,
                    password: createFormData.password,
                    role: createFormData.role,
                }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to create user');
            }

            const { user } = await res.json();
            setUsers([user, ...users]);
            setShowCreateModal(false);
            setCreateFormData({
                name: '',
                email: '',
                password: '',
                confirmPassword: '',
                role: 'USER',
            });
        } catch (error) {
            setCreateError(error instanceof Error ? error.message : 'Failed to create user');
        } finally {
            setCreateLoading(false);
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="flex items-center justify-center h-96">
                    <div className="text-gray-500">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">User Management</h1>
                        <p className="text-gray-600">Manage user roles and permissions</p>
                    </div>
                    <Button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded"
                    >
                        + Add User
                    </Button>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">Role</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">Joined</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                            No users found
                                        </td>
                                    </tr>
                                ) : (
                                    users.map(user => (
                                        <tr key={user.id} className="border-b hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium">{user.name || 'N/A'}</td>
                                            <td className="px-6 py-4">{user.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                                                    user.role === 'ADMIN'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600" suppressHydrationWarning>
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    {user.role === 'USER' ? (
                                                        <Button
                                                            onClick={() => updateUserRole(user.id, 'ADMIN')}
                                                            disabled={updating === user.id}
                                                            className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-3 py-1 text-sm rounded"
                                                        >
                                                            {updating === user.id ? 'Updating...' : 'Make Admin'}
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            onClick={() => updateUserRole(user.id, 'USER')}
                                                            disabled={updating === user.id}
                                                            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-3 py-1 text-sm rounded"
                                                        >
                                                            {updating === user.id ? 'Updating...' : 'Remove Admin'}
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                        <strong>Total Users:</strong> {users.length} | <strong>Admins:</strong> {users.filter(u => u.role === 'ADMIN').length}
                    </p>
                </div>
            </div>

            {/* Create User Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-xl font-bold">Add New User</h2>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                            {createError && (
                                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                    {createError}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium mb-1">Name *</label>
                                <Input
                                    type="text"
                                    value={createFormData.name}
                                    onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                                    placeholder="John Doe"
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Email *</label>
                                <Input
                                    type="email"
                                    value={createFormData.email}
                                    onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                                    placeholder="user@example.com"
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Password *</label>
                                <Input
                                    type="password"
                                    value={createFormData.password}
                                    onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Confirm Password *</label>
                                <Input
                                    type="password"
                                    value={createFormData.confirmPassword}
                                    onChange={(e) => setCreateFormData({ ...createFormData, confirmPassword: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Role</label>
                                <select
                                    value={createFormData.role}
                                    onChange={(e) => setCreateFormData({ ...createFormData, role: e.target.value as 'USER' | 'ADMIN' })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="USER">User</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded"
                                    disabled={createLoading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded"
                                    disabled={createLoading}
                                >
                                    {createLoading ? 'Creating...' : 'Create User'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
