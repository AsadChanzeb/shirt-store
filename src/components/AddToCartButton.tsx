'use client';

import { useState } from 'react';
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
    description?: string;
}

export default function AddToCartButton({ variants, description }: AddToCartButtonProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [selectedVariantId, setSelectedVariantId] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const handleVariantSelect = (variantId: string) => {
        setSelectedVariantId(variantId);
        const variant = variants.find((v) => v.id === variantId);
        if (variant) {
            window.dispatchEvent(new CustomEvent('variant-selected', { detail: variant }));
        }
    };

    const handleAddToCart = async () => {
        if (!session) {
            router.push('/login');
            return;
        }

        if (!selectedVariantId) {
            alert('Please select a size and color');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/cart/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    variantId: selectedVariantId,
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
        <div className="space-y-8">
            {description && (
                <div className="prose prose-sm text-gray-600 leading-relaxed">
                    <p>{description}</p>
                </div>
            )}

            <div>
                <div className="flex justify-between items-center mb-4">
                    <label className="text-sm font-medium uppercase tracking-wider text-gray-500">
                        Select Variant
                    </label>
                    <button className="text-sm text-black underline underline-offset-4 font-medium">
                        Size Guide
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {variants.map((variant) => (
                        <button
                            key={variant.id}
                            disabled={variant.stock === 0}
                            onClick={() => handleVariantSelect(variant.id)}
                            className={cn(
                                "px-4 py-2 rounded-full border-2 transition-all duration-200 text-sm font-medium",
                                selectedVariantId === variant.id
                                    ? "border-black bg-black text-white"
                                    : "border-gray-200 text-gray-900 hover:border-gray-400",
                                variant.stock === 0 && "opacity-40 cursor-not-allowed line-through"
                            )}
                        >
                            {variant.size} - {variant.color}
                        </button>
                    ))}
                </div>
            </div>

            <Button
                onClick={handleAddToCart}
                disabled={loading || !selectedVariantId}
                className="w-full h-14 rounded-full text-lg font-semibold bg-black hover:bg-gray-800 transition-colors"
                size="lg"
            >
                {loading ? 'Adding...' : 'Add to Cart'}
            </Button>

            <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-gray-100">
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
