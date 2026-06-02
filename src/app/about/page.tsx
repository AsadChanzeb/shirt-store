import Image from 'next/image';
import { Target, Users, History, Award } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="pt-24 min-h-screen">
            {/* Hero Section */}
            <section className="relative h-[60vh] md:h-[70vh] w-[95%] max-w-7xl mx-auto rounded-3xl overflow-hidden mb-16">
                <Image
                    src="/images/about-hero.png"
                    alt="About ShirtStore"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center">
                    <div className="text-center text-white px-4">
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">Our Story</h1>
                        <p className="text-lg md:text-xl max-w-2xl mx-auto font-medium text-white/90">
                            Redefining style through premium craftsmanship and timeless design since 2003.
                        </p>
                    </div>
                </div>
            </section>

            {/* Brand Story Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div className="inline-block px-4 py-2 rounded-full bg-[#443DFF]/10 text-[#443DFF] text-sm font-bold tracking-wider uppercase">
                            Since 2003
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1B1D1E]">
                            Established in 2003, <span className="text-[#443DFF]">ShirtStore</span> is a fashion brand created for the spirited youth.
                        </h2>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            ShirtStore has always been able to provide the best in fashion through a unique and flexible model that is open to adapting to the constant changes that occur during a season.
                            At the same time, we are able to respond to key trends and develop them into wearable fashion in the shortest possible time.
                        </p>
                        <div className="grid grid-cols-2 gap-8 pt-4">
                            <div>
                                <h4 className="text-3xl font-bold text-[#1B1D1E]">20+</h4>
                                <p className="text-gray-500 uppercase text-xs font-bold tracking-widest mt-1">Cities</p>
                            </div>
                            <div>
                                <h4 className="text-3xl font-bold text-[#1B1D1E]">100+</h4>
                                <p className="text-gray-500 uppercase text-xs font-bold tracking-widest mt-1">Stores</p>
                            </div>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="glass rounded-[3rem] border border-gray-200/50 shadow-2xl p-4 overflow-hidden">
                            <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden">
                                <Image
                                    src="/images/about-hero.png"
                                    alt="Brand Aesthetic"
                                    fill
                                    className="object-cover scale-110 hover:scale-100 transition-transform duration-700"
                                />
                            </div>
                        </div>
                        {/* Interactive Elements */}
                        <div className="absolute -bottom-8 -right-8 glass p-6 rounded-3xl border border-white/50 shadow-xl hidden md:block max-w-[200px]">
                            <History className="w-8 h-8 text-[#443DFF] mb-3" />
                            <p className="text-sm font-semibold text-gray-900">20 Years of Crafting Excellence</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values Section */}
            <section className="relative py-24 bg-white/50">
                <div className="absolute inset-0 mesh-gradient opacity-20" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-[#1B1D1E] mb-4">Our Core Values</h2>
                        <div className="w-24 h-1 bg-[#443DFF] mx-auto rounded-full" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Target className="w-10 h-10" />,
                                title: "Our Mission",
                                description: "To inspire self-expression through high-quality on-trend western wear."
                            },
                            {
                                icon: <Users className="w-10 h-10" />,
                                title: "Customer Centric",
                                description: "Carefully merchandised to cater to our customers, allowing them to build a wardrobe that expresses them."
                            },
                            {
                                icon: <Award className="w-10 h-10" />,
                                title: "Quality First",
                                description: "From fiber to final stitch, we ensure every piece meets our premium standards of comfort and durability."
                            }
                        ].map((value, idx) => (
                            <div key={idx} className="glass p-10 rounded-3xl border border-gray-200/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
                                <div className="p-4 bg-[#443DFF]/10 rounded-2xl inline-block text-[#443DFF] mb-6 group-hover:scale-110 transition-transform">
                                    {value.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Quote Section */}
            <section className="max-w-4xl mx-auto px-4 py-24 text-center">
                <p className="text-2xl md:text-4xl font-serif-italic text-gray-800 leading-snug">
                    "We believe fashion is not just about clothes, but a way to express who you truly are. Our goal is to make every person feel confident and vibrant."
                </p>
                <div className="mt-8 font-bold text-[#443DFF] uppercase tracking-widest text-sm">— ShirtStore Lifestyle</div>
            </section>
        </div>
    );
}
