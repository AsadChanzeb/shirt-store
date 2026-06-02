'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

interface ProductCardProps {
    id: string;
    name: string;
    price: number;
    discount: number;
    images: string[];
    slug: string;
}

export default function ProductCard({ id, name, price, discount, images, slug }: ProductCardProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const finalPrice = discount > 0 ? price - (price * discount) / 100 : price;

    // Use placeholder if no images
    const displayImages = images.length > 0 ? images : ['/placeholder.jpg'];
    // Ensure we have at least 2 dots if there are at least 2 images
    const dotsCount = Math.max(displayImages.length, 1);

    return (
        <div
            className="bg-white rounded-[1.5rem] p-4 shadow-sm group border border-gray-50 flex flex-col h-full transition-all duration-300"
            onMouseEnter={() => images.length > 1 && setCurrentIndex(1)}
            onMouseLeave={() => setCurrentIndex(0)}
        >
            {/* Image Container */}
            <div className="relative aspect-square bg-[#F2F2F2] rounded-[1.5rem] overflow-hidden mb-6 flex items-center justify-center">
                <div className="relative w-full h-full transition-transform duration-700 ease-out group-hover:scale-110">
                    <Image
                        src={displayImages[currentIndex]}
                        alt={name}
                        fill
                        className="object-cover transition-opacity duration-300"
                        priority
                    />
                </div>

                {/* Pagination Dots Indicator */}
                {displayImages.length > 1 && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                        {displayImages.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setCurrentIndex(idx);
                                }}
                                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${currentIndex === idx ? 'bg-[#308B6B] scale-125' : 'bg-[#D1DFD9] hover:bg-[#308B6B]/50'
                                    }`}
                                aria-label={`View image ${idx + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="px-2 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <span className="bg-[#EBFAF5] text-[#308B6B] px-4 py-1.5 rounded-full text-sm font-medium">
                        Best Seller
                    </span>
                </div>

                <Link href={`/product/${slug}`} className="block mt-4 mb-2">
                    <h3 className="text-lg font-bold text-[#1A1A1A] line-clamp-2 leading-tight h-[3rem]">
                        {name}
                    </h3>
                </Link>

                <div className="mt-auto flex items-center justify-between gap-4 pt-4">
                    <div className="flex flex-col">
                        <span className="text-gray-400 text-sm font-medium">Price</span>
                        <span className="text-lg font-bold text-[#308B6B]">
                            ${finalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>

                    <Link
                        href={`/product/${slug}`}
                        className="flex-1 bg-[#222222] text-md text-white text-center py-3 px-1 rounded-full font-bold hover:bg-black transition-colors"
                    >
                        Buy Now
                    </Link>
                </div>
            </div>
        </div>
    );
}
