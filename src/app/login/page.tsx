'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('Invalid email or password');
            } else {
                router.push('/');
                router.refresh();
            }
        } catch (error) {
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-white">
            <div className="w-full max-w-md">
                <div className="mb-12">
                    <h1 className="text-5xl font-bold mb-4">Welcome back</h1>
                    <p className="text-gray-600">Sign in to your account to continue</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2 tracking-wide">EMAIL</label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="your@email.com"
                            className="w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 tracking-wide">PASSWORD</label>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            className="w-full"
                        />
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <Button type="submit" className="w-full h-12" disabled={loading}>
                        {loading ? 'SIGNING IN...' : 'SIGN IN'}
                    </Button>
                </form>

                <div className="mt-8 pt-8 border-t border-gray-200">
                    <p className="text-center text-gray-600">
                        Don't have an account?{' '}
                        <Link href="/register" className="font-medium underline underline-offset-4">
                            Create one
                        </Link>
                    </p>
                </div>

                <div className="mt-8 p-4 bg-gray-50 border border-gray-200">
                    <p className="text-xs font-medium mb-2 tracking-wide">DEMO ACCOUNT</p>
                    <p className="text-sm text-gray-600">admin@example.com / admin123</p>
                </div>
            </div>
        </div>
    );
}
