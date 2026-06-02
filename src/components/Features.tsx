'use client';
import { Truck, RotateCcw, ShieldCheck } from 'lucide-react';

const Features = () => {
    const features = [
        {
            icon: <Truck className="w-6 h-6 text-[#443DFF]" />,
            title: 'Free Shipping',
            description: 'Get a free shipping on all order above Rs.1999',
        },
        {
            icon: <RotateCcw className="w-6 h-6 text-[#443DFF]" />,
            title: 'Free Returns',
            description: 'You can return any product within 14 days without any charges',
        },
        {
            icon: <ShieldCheck className="w-6 h-6 text-[#443DFF]" />,
            title: 'Money Back Guarantee',
            description: 'Incase you are not fully satisfied with your product',
        },
    ];

    return (
        <section className="py-16 border-t border-gray-100 bg-white">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="flex flex-col items-center text-center group"
                        >
                            <div className="mb-8 p-6 rounded-3xl bg-gray-50 group-hover:bg-gray-100 transition-colors duration-300">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-gray-900">
                                {feature.title}
                            </h3>
                            <p className="text-gray-500 text-sm leading-relaxed max-w-[240px]">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Features;
