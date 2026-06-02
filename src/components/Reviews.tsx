'use client';

import { Star } from 'lucide-react';

const reviews = [
    {
        id: 1,
        name: 'Dani.',
        rating: 5,
        text: 'Best fit I have ever found. The fabric quality is exceptional!',
    },
    {
        id: 2,
        name: 'Ahmed',
        rating: 5,
        text: 'Super fast delivery and the packaging was premium. Highly recommend!',
    },
    {
        id: 3,
        name: 'Raja Hammad',
        rating: 4,
        text: 'Love the minimalist design. It goes perfectly with everything.',
    },
    {
        id: 4,
        name: 'Ahsan Iqbal',
        rating: 5,
        text: 'The size guide was spot on. Fits like it was tailor-made for me.',
    },
    {
        id: 5,
        name: 'Sameer',
        rating: 5,
        text: 'Breathable material and very comfortable for all-day wear.',
    },
];

const Reviews = () => {
    return (
        <section className="py-24 bg-gray-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-16 text-center">
                <h2 className="text-4xl md:text-5xl font-medium mb-4">
                    Trusted by <span className="font-serif-italic">thousands</span>
                </h2>
                <p className="text-[#B1B1B1] text-lg">See what our community has to say about us.</p>
            </div>

            <div className="relative flex">
                {/* Marquee effect using duplicated content for seamless loop */}
                <div className="flex animate-marquee whitespace-nowrap">
                    {[...reviews, ...reviews].map((review, index) => (
                        <div
                            key={`${review.id}-${index}`}
                            className="mx-4 w-[350px] flex-shrink-0 glass p-8 rounded-3xl border border-gray-200/50 shadow-sm"
                        >
                            <div className="flex gap-1 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                            }`}
                                    />
                                ))}
                            </div>
                            <p className="text-gray-700 mb-6 whitespace-normal italic leading-relaxed">
                                "{review.text}"
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#443DFF] to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                                    {review.name.charAt(0)}
                                </div>
                                <span className="font-medium text-[#1B1D1E]">{review.name}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Reviews;
