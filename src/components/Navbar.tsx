'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useState } from 'react';
import Button from './ui/Button';

export default function Navbar() {
    const { data: session } = useSession();
    const isAdmin = (session?.user as any)?.role === 'ADMIN';
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl">
            <div className="glass rounded-full border border-gray-200/50 shadow-lg px-6 py-4 relative">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link href="/" className="text-xl font-semibold">
                        ShirtStore
                    </Link>

                    {/* Center Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/shop" className="text-sm font-medium text-[#1B1D1E] hover:text-[#443DFF] transition">
                            Shop
                        </Link>
                        <Link href="/shop?sort=newest" className="text-sm font-medium text-[#1B1D1E] hover:text-[#443DFF] transition">
                            New Arrivals
                        </Link>
                        <Link href="/brands" className="text-sm font-medium text-[#1B1D1E] hover:text-[#443DFF] transition">
                            Brands
                        </Link>
                        <Link href="/about" className="text-sm font-medium text-[#1B1D1E] hover:text-[#443DFF] transition">
                            About
                        </Link>
                        <Link href="/contact" className="text-sm font-medium text-[#1B1D1E] hover:text-[#443DFF] transition">
                            Contact
                        </Link>
                        {isAdmin && (
                            <Link href="/admin/dashboard" className="text-sm font-medium text-[#1B1D1E] hover:text-[#443DFF] transition">
                                Admin
                            </Link>
                        )}
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center space-x-4">
                        <Link href="/cart" className="hover:text-[#443DFF] transition">
                            <ShoppingCart className="w-5 h-5" />
                        </Link>

                        {session ? (
                            <div className="hidden sm:flex items-center space-x-3">
                                <span className="text-sm font-medium hidden sm:block">
                                    {session.user?.name || session.user?.email?.split('@')[0]}
                                </span>
                                <button
                                    onClick={() => signOut()}
                                    className="text-sm font-medium hover:text-[#443DFF] transition"
                                >
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <div className="hidden sm:flex items-center space-x-2">
                                <Link href="/login">
                                    <button className="text-sm font-medium hover:text-[#443DFF] transition px-4 py-2">
                                        Sign In
                                    </button>
                                </Link>
                                <Link href="/register">
                                    <Button
                                        size="sm"
                                        className="bg-[#443DFF] hover:bg-[#3730E3] text-white rounded-full h-10 px-6"
                                    >
                                        Sign Up
                                    </Button>
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            className="md:hidden p-1 text-gray-600 hover:text-black"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-gray-200 shadow-xl md:hidden flex flex-col space-y-4 text-center">
                        <Link href="/shop" className="text-sm font-medium py-2 hover:text-[#443DFF]" onClick={() => setIsMobileMenuOpen(false)}>Shop</Link>
                        <Link href="/shop?sort=newest" className="text-sm font-medium py-2 hover:text-[#443DFF]" onClick={() => setIsMobileMenuOpen(false)}>New Arrivals</Link>
                        <Link href="/brands" className="text-sm font-medium py-2 hover:text-[#443DFF]" onClick={() => setIsMobileMenuOpen(false)}>Brands</Link>
                        <Link href="/about" className="text-sm font-medium py-2 hover:text-[#443DFF]" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
                        <Link href="/contact" className="text-sm font-medium py-2 hover:text-[#443DFF]" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
                        {isAdmin && (
                            <Link href="/admin/dashboard" className="text-sm font-medium py-2 hover:text-[#443DFF]" onClick={() => setIsMobileMenuOpen(false)}>Admin</Link>
                        )}
                        <div className="pt-2 border-t border-gray-100 flex flex-col gap-3">
                            {session ? (
                                <>
                                    <span className="text-sm text-gray-500">{session.user?.name || session.user?.email}</span>
                                    <button onClick={() => signOut()} className="text-sm font-medium text-red-500">Sign Out</button>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium">Sign In</Link>
                                    <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-[#443DFF]">Sign Up</Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
