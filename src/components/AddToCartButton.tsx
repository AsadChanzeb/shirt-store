'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import Button from './ui/Button';

interface Variant {
    id: string;
    size: string;
    color: string;
    stock: number;
}

interface AddToCartButtonProps {
    productId: string;
    variants: Variant[];
    selectedColor?: string;
    description?: string;
}

function normalizeColor(color: string) {
    return color.trim().toLowerCase();
}

export default function AddToCartButton({
    variants,
    selectedColor = '',
    description,
}: AddToCartButtonProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const availableVariants = useMemo(() => {
        if (!selectedColor) {
            return variants;
        }

        return variants.filter((variant) => {
            return normalizeColor(variant.color) === normalizeColor(selectedColor);
        });
    }, [selectedColor, variants]);

    const availableSizes = useMemo(() => {
        return Array.from(new Set(availableVariants.map((variant) => variant.size)));
    }, [availableVariants]);

    const selectedVariant = useMemo(() => {
        return availableVariants.find((variant) => variant.size === selectedSize);
    }, [availableVariants, selectedSize]);

    useEffect(() => {
        if (!availableVariants.some((variant) => variant.size === selectedSize)) {
            setSelectedSize('');
        }
    }, [availableVariants, selectedSize]);

    const handleAddToCart = async () => {
        if (!session) {
            router.push('/login');
            return;
        }

        if (!selectedColor || !selectedSize || !selectedVariant) {
            alert('Please select a size and color');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/cart/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    variantId: selectedVariant.id,
                    quantity: 1,
                }),
            });

            if (res.ok) {
                alert('Added to cart!');
                router.refresh();
            } else {
                alert('Failed to add to cart');
            }
        } catch {
            alert('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-5">
            {description && (
                <div className="prose prose-sm text-gray-600 leading-relaxed">
                    <p>{description}</p>
                </div>
            )}

            <div>
                <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-medium uppercase tracking-wider text-gray-500">
                        Select Size
                    </label>
                    <button className="text-sm text-black underline underline-offset-4 font-medium">
                        Size Guide
                    </button>
                </div>
                {selectedColor ? (
                    <div className="flex flex-wrap gap-2">
                        {availableSizes.map((size) => {
                            const variant = availableVariants.find((item) => item.size === size);
                            const isSoldOut = !variant || variant.stock === 0;

                            return (
                                <button
                                    key={size}
                                    disabled={isSoldOut}
                                    onClick={() => setSelectedSize(size)}
                                    className={cn(
                                        "min-w-12 px-4 py-2 rounded-full border-2 transition-all duration-200 text-sm font-medium",
                                        selectedSize === size
                                            ? "border-black bg-black text-white"
                                            : "border-gray-200 text-gray-900 hover:border-gray-400",
                                        isSoldOut && "opacity-40 cursor-not-allowed line-through"
                                    )}
                                >
                                    {size}
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500">Select a color to see available sizes.</p>
                )}
            </div>

            <Button
                onClick={handleAddToCart}
                disabled={loading || !selectedVariant}
                className="w-full h-12 rounded-full text-lg font-semibold bg-black hover:bg-gray-800 transition-colors"
                size="lg"
            >
                {loading ? 'Adding...' : 'Add to Cart'}
            </Button>

            <div className="grid grid-cols-2 gap-4 pt-5 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Free Shipping
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Easy Returns
                </div>
            </div>
        </div>
    );
}
