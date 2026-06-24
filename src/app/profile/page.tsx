'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function ProfilePage() {
    const { data: session, status, update } = useSession();
    const router = useRouter();

    const [name, setName] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [hasPassword, setHasPassword] = useState(true);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (session?.user?.name) {
            setName(session.user.name);
            
            fetch('/api/user/profile')
                .then(res => res.json())
                .then(data => {
                    if (data.hasPassword !== undefined) {
                        setHasPassword(data.hasPassword);
                    }
                })
                .catch(console.error);
        }
    }, [status, session, router]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword && newPassword !== confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (newPassword && newPassword.length < 6) {
            setError('New password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    currentPassword,
                    newPassword,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to update profile');
            }

            setSuccess('Profile updated successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            
            // Force NextAuth session update to reflect new name in navbar
            await update({ name });
            
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen pt-32 pb-16 px-4 bg-gray-50 flex items-center justify-center">
                <div className="text-gray-500">Loading profile...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-16 px-4 bg-gray-50">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                            <p className="text-sm text-gray-500 mt-1">Manage your account settings and preferences.</p>
                        </div>
                        <Button
                            type="button"
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 text-sm font-medium rounded-lg transition-colors border border-red-100"
                        >
                            Sign Out
                        </Button>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="p-8 space-y-8">
                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="p-4 bg-green-50 text-green-600 rounded-xl text-sm border border-green-100">
                                {success}
                            </div>
                        )}

                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                Personal Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <Input
                                        type="email"
                                        value={session?.user?.email || ''}
                                        disabled
                                        className="w-full bg-gray-50 text-gray-500 cursor-not-allowed"
                                    />
                                    <p className="text-xs text-gray-400 mt-2">Email cannot be changed.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                                    <Input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Your name"
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100 space-y-6">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                Change Password
                            </h2>
                            <p className="text-sm text-gray-500 -mt-4">
                                Leave blank if you don't want to change your password.
                            </p>
                            
                            <div className="space-y-4 max-w-md">
                                {hasPassword && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                                        <Input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full"
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                    <Input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                                    <Input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100 flex justify-end">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="px-8 h-12 bg-[#443DFF] hover:bg-[#3730E3] text-white rounded-xl font-medium transition-all"
                            >
                                {loading ? 'Saving Changes...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
