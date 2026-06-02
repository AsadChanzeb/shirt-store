'use client';

import Image from 'next/image';
import { Mail, Phone, MapPin, MessageSquare, Send, Clock } from 'lucide-react';

export default function ContactPage() {
    return (
        <div className="pt-24 min-h-screen">
            {/* Hero Section */}
            <section className="relative py-20 mb-12 overflow-hidden">
                <div className="absolute inset-0 mesh-gradient opacity-30 -z-10" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl md:text-7xl font-bold text-[#1B1D1E] mb-6 tracking-tight">Get in Touch</h1>
                    <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                        Have a question or feedback? We'd love to hear from you. Our team is here to help!
                    </p>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                    {/* Contact Info Cards - 5 Columns */}
                    <div className="lg:col-span-5 space-y-8">
                        <div className="glass p-8 rounded-[2rem] border border-gray-200/50 shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#443DFF]/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-[#443DFF]/20 transition-all duration-500" />

                            <h2 className="text-3xl font-bold text-[#1B1D1E] mb-8"> Contact Information</h2>

                            <div className="space-y-8">
                                <div className="flex items-start space-x-5 group/item">
                                    <div className="p-4 bg-[#443DFF]/10 rounded-2xl text-[#443DFF] group-hover/item:scale-110 group-hover/item:bg-[#443DFF] group-hover/item:text-white transition-all duration-300">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Email Us</h4>
                                        <p className="text-lg font-semibold text-[#1B1D1E]" > contact@shirtstore.com</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-5 group/item">
                                    <div className="p-4 bg-[#443DFF]/10 rounded-2xl text-[#443DFF] group-hover/item:scale-110 group-hover/item:bg-[#443DFF] group-hover/item:text-white transition-all duration-300">
                                        <Phone className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Call Us</h4>
                                        <p className="text-lg font-semibold text-[#1B1D1E]">+92-111-SHIRTS (744787)</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-5 group/item">
                                    <div className="p-4 bg-[#443DFF]/10 rounded-2xl text-[#443DFF] group-hover/item:scale-110 group-hover/item:bg-[#443DFF] group-hover/item:text-white transition-all duration-300">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Visit Us</h4>
                                        <p className="text-lg font-semibold text-[#1B1D1E]">Plot 14, Main Boulevard, Gulberg III, Lahore, Pakistan</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-5 group/item">
                                    <div className="p-4 bg-[#443DFF]/10 rounded-2xl text-[#443DFF] group-hover/item:scale-110 group-hover/item:bg-[#443DFF] group-hover/item:text-white transition-all duration-300">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Working Hours</h4>
                                        <p className="text-lg font-semibold text-[#1B1D1E]">Mon - Sat: 9:00 AM - 9:00 PM</p>
                                        <p className="text-sm text-gray-500">Sunday: Closed (Online only)</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Image decoration */}
                        <div className="relative rounded-[2rem] overflow-hidden aspect-video shadow-2xl">
                            <Image
                                src="/images/contact-hero.png"
                                alt="Contact Workspace"
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                                <p className="text-white font-medium italic">"Always here to provide the best service."</p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form - 7 Columns */}
                    <div className="lg:col-span-7">
                        <div className="glass p-8 md:p-12 rounded-[2rem] border border-gray-200/50 shadow-xl">
                            <h3 className="text-3xl font-bold text-[#1B1D1E] mb-8 flex items-center gap-3">
                                <MessageSquare className="w-8 h-8 text-[#443DFF]" />
                                Send Message
                            </h3>

                            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1 uppercase tracking-tight">First Name</label>
                                        <input
                                            type="text"
                                            className="w-full px-5 py-4 rounded-2xl bg-gray-50/50 border border-gray-200 focus:outline-none focus:ring-4 focus:ring-[#443DFF]/10 focus:border-[#443DFF] transition-all"
                                            placeholder="John"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1 uppercase tracking-tight">Last Name</label>
                                        <input
                                            type="text"
                                            className="w-full px-5 py-4 rounded-2xl bg-gray-50/50 border border-gray-200 focus:outline-none focus:ring-4 focus:ring-[#443DFF]/10 focus:border-[#443DFF] transition-all"
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1 uppercase tracking-tight">Email Address</label>
                                    <input
                                        type="email"
                                        className="w-full px-5 py-4 rounded-2xl bg-gray-50/50 border border-gray-200 focus:outline-none focus:ring-4 focus:ring-[#443DFF]/10 focus:border-[#443DFF] transition-all"
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1 uppercase tracking-tight">Subject</label>
                                    <select className="w-full px-5 py-4 rounded-2xl bg-gray-50/50 border border-gray-200 focus:outline-none focus:ring-4 focus:ring-[#443DFF]/10 focus:border-[#443DFF] transition-all appearance-none">
                                        <option>Customer Support</option>
                                        <option>Order Status</option>
                                        <option>Wholesale Inquiries</option>
                                        <option>Returns & Exchanges</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1 uppercase tracking-tight">Your Message</label>
                                    <textarea
                                        rows={5}
                                        className="w-full px-5 py-4 rounded-2xl bg-gray-50/50 border border-gray-200 focus:outline-none focus:ring-4 focus:ring-[#443DFF]/10 focus:border-[#443DFF] transition-all resize-none"
                                        placeholder="How can we help you?"
                                    />
                                </div>

                                <button className="w-full py-5 rounded-2xl bg-[#443DFF] text-white font-bold text-lg hover:bg-[#3730E3] transition-all duration-300 shadow-lg hover:shadow-2xl flex items-center justify-center gap-3 active:scale-95 group">
                                    <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
