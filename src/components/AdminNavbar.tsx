'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Menu, X, LayoutDashboard, Users, Package, ShoppingCart, LogOut } from 'lucide-react';
import { useState } from 'react';

export default function AdminNavbar() {
    const { data: session } = useSession();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const adminLinks = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Products', href: '/admin/products', icon: Package },
        { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
        { name: 'Users', href: '/admin/users', icon: Users },
    ];

    return (
        <nav className="bg-gray-900 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/admin/dashboard" className="text-2xl font-bold text-white">
                        Admin Panel
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {adminLinks.map(link => {
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="flex items-center space-x-2 hover:text-blue-400 transition"
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="text-sm font-medium">{link.name}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right Side - User Info and Logout */}
                    <div className="flex items-center space-x-6">
                        <div className="hidden sm:block text-sm">
                            <p className="text-gray-300">Welcome,</p>
                            <p className="font-semibold">{session?.user?.name || session?.user?.email?.split('@')[0]}</p>
                        </div>

                        <button
                            onClick={() => signOut()}
                            className="flex items-center space-x-2 hover:text-red-400 transition"
                            title="Logout"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="text-sm font-medium hidden sm:inline">Logout</span>
                        </button>

                        {/* Mobile Menu Toggle */}
                        <button
                            className="md:hidden p-1 hover:bg-gray-800 rounded"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden pb-4 space-y-2">
                        {adminLinks.map(link => {
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-800 rounded transition"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="text-sm font-medium">{link.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </nav>
    );
}
