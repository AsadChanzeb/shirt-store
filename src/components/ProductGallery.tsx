'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ProductImage {
    id: string;
    imageUrl: string;
}

interface ProductGalleryProps {
    images: ProductImage[];
}

export default function ProductGallery({ images }: ProductGalleryProps) {
    const [selectedImage, setSelectedImage] = useState(images[0]?.imageUrl || '/placeholder.jpg');

    if (!images || images.length === 0) {
        return (
            <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden">
                <Image
                    src="/placeholder.jpg"
                    alt="Product Placeholder"
                    fill
                    className="object-cover"
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-gray-100 rounded-3xl overflow-hidden group">
                <Image
                    src={selectedImage}
                    alt="Product Image"
                    fill
                    priority
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {images.map((image) => (
                        <button
                            key={image.id}
                            onClick={() => setSelectedImage(image.imageUrl)}
                            className={cn(
                                "relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-200",
                                selectedImage === image.imageUrl
                                    ? "border-black scale-95"
                                    : "border-transparent opacity-70 hover:opacity-100"
                            )}
                        >
                            <Image
                                src={image.imageUrl}
                                alt="Thumbnail"
                                fill
                                className="object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
