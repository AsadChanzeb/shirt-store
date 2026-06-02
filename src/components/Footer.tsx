'use client';

import Link from 'next/link';
import { Facebook, Twitter, Instagram, Youtube, Mail, ArrowRight } from 'lucide-react';
import Button from './ui/Button';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        shop: [
            { name: 'T-Shirts', href: '/shop?category=t-shirts' },
            { name: 'Hoodies', href: '/shop?category=hoodies' },
            { name: 'Accessories', href: '/shop?category=accessories' },
            { name: 'New Arrivals', href: '/shop?sort=newest' },
        ],
        company: [
            { name: 'About Us', href: '/about' },
            { name: 'Contact Us', href: '/contact' },
            { name: 'Privacy Policy', href: '/privacy' },
            { name: 'Terms of Service', href: '/terms' },
        ],
        social: [
            { name: 'Facebook', icon: <Facebook className="w-5 h-5" />, href: '#' },
            { name: 'Twitter', icon: <Twitter className="w-5 h-5" />, href: '#' },
            { name: 'Instagram', icon: <Instagram className="w-5 h-5" />, href: '#' },
            { name: 'Youtube', icon: <Youtube className="w-5 h-5" />, href: '#' },
        ]
    };

    return (
        <footer className="relative mt-1 pb-10 overflow-hidden">
            {/* Mesh Gradient Background */}
            <div className="absolute inset-0 mesh-gradient opacity-30 -z-10" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="glass rounded-3xl border border-gray-200/50 shadow-xl p-8 md:p-12 mb-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                        {/* Brand Section */}
                        <div className="space-y-6">
                            <Link href="/" className="text-2xl font-bold tracking-tight">
                                ShirtStore
                            </Link>
                            <p className="text-gray-600 leading-relaxed max-w-xs">
                                Premium quality shirts designed for comfort and style. Elevate your wardrobe with our curated collection.
                            </p>
                            <div className="flex space-x-4">
                                {footerLinks.social.map((item) => (
                                    <a
                                        key={item.name}
                                        href={item.href}
                                        className="p-2 rounded-full bg-white/50 border border-gray-200 text-gray-600 hover:text-[#443DFF] hover:scale-110 hover:shadow-md transition-all duration-300"
                                        aria-label={item.name}
                                    >
                                        {item.icon}
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Shop Links */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900">Shop</h3>
                            <ul className="space-y-4">
                                {footerLinks.shop.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            className="text-gray-600 hover:text-[#443DFF] transition-colors relative group"
                                        >
                                            {link.name}
                                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#443DFF] transition-all duration-300 group-hover:w-full" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Company Links */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900">Company</h3>
                            <ul className="space-y-4">
                                {footerLinks.company.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            className="text-gray-600 hover:text-[#443DFF] transition-colors relative group"
                                        >
                                            {link.name}
                                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#443DFF] transition-all duration-300 group-hover:w-full" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Newsletter Section */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900">Newsletter</h3>
                            <p className="text-gray-600">Subscribe to get special offers and first look at new arrivals.</p>
                            <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                                <div className="relative group">
                                    <input
                                        type="email"
                                        placeholder="your@email.com"
                                        className="w-full pl-4 pr-12 py-3 rounded-2xl bg-white/50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#443DFF]/20 focus:border-[#443DFF] transition-all"
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-[#443DFF] text-white hover:bg-[#3730E3] transition-colors group-hover:shadow-lg"
                                    >
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500">By subscribing, you agree to our Privacy Policy.</p>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-sm text-gray-500 glass rounded-full px-8 py-4 border border-gray-200/50">
                    <p>© {currentYear} ShirtStore. All rights reserved.</p>
                    <div className="flex space-x-8">
                        <Link href="/privacy" className="hover:text-gray-900 transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-gray-900 transition-colors">Terms</Link>
                        <Link href="/cookies" className="hover:text-gray-900 transition-colors">Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
