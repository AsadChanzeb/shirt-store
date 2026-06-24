'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from './ui/Button';
import Input from './ui/Input';
import { Card, CardContent } from './ui/Card';

interface CheckoutFormProps {
    cartItems: any[];
    total: number;
}

export default function CheckoutForm({ cartItems, total }: CheckoutFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'COD'>('ONLINE');
    const [formData, setFormData] = useState({
        address: '',
        city: '',
        zipCode: '',
        phone: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/orders/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    paymentMethod,
                    cartItems,
                    total,
                }),
            });

            if (res.ok) {
                const { url, orderId } = await res.json();
                if (url) {
                    window.location.href = url;
                } else {
                    router.push(`/orders/${orderId}?success=true`);
                }
            } else {
                alert('Failed to create order');
            }
        } catch (error) {
            alert('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
                <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-4">Shipping Information</h2>
                    <div className="space-y-4">
                        <Input
                            label="Address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            required
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="City"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                required
                            />
                            <Input
                                label="ZIP Code"
                                value={formData.zipCode}
                                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                                required
                            />
                        </div>
                        <Input
                            label="Phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                    <div className="space-y-2 mb-4">
                        {cartItems.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                                <span>
                                    {item.variant.product.name} ({item.variant.size}) x {item.quantity}
                                </span>
                                <span>
                                    Rs. {(
                                        (Number(item.variant.product.price) -
                                            (Number(item.variant.product.price) * Number(item.variant.product.discount)) / 100) *
                                        item.quantity
                                    ).toFixed(2)}
                                </span>
                            </div>
                        ))}
                        <div className="border-t pt-2 flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>Rs. {total.toFixed(2)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-4">Payment Method</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className={`relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none ${paymentMethod === 'ONLINE' ? 'border-black ring-1 ring-black' : 'border-gray-300'}`}>
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="ONLINE"
                                className="sr-only"
                                checked={paymentMethod === 'ONLINE'}
                                onChange={() => setPaymentMethod('ONLINE')}
                            />
                            <span className="flex flex-1">
                                <span className="flex flex-col">
                                    <span className="block text-sm font-medium text-gray-900">Credit Card / Online</span>
                                    <span className="mt-1 flex items-center text-sm text-gray-500">Pay securely via Stripe</span>
                                </span>
                            </span>
                            <svg className={`h-5 w-5 ${paymentMethod === 'ONLINE' ? 'text-black' : 'text-transparent'}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                            </svg>
                        </label>
                        <label className={`relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none ${paymentMethod === 'COD' ? 'border-black ring-1 ring-black' : 'border-gray-300'}`}>
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="COD"
                                className="sr-only"
                                checked={paymentMethod === 'COD'}
                                onChange={() => setPaymentMethod('COD')}
                            />
                            <span className="flex flex-1">
                                <span className="flex flex-col">
                                    <span className="block text-sm font-medium text-gray-900">Cash on Delivery</span>
                                    <span className="mt-1 flex items-center text-sm text-gray-500">Pay when your order arrives</span>
                                </span>
                            </span>
                            <svg className={`h-5 w-5 ${paymentMethod === 'COD' ? 'text-black' : 'text-transparent'}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                            </svg>
                        </label>
                    </div>
                </CardContent>
            </Card>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? 'Processing...' : paymentMethod === 'ONLINE' ? 'Continue to Payment' : 'Place Order'}
            </Button>
        </form>
    );
}
