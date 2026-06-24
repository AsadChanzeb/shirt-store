import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Button from '@/components/ui/Button';
import RemoveFromCartButton from '@/components/RemoveFromCartButton';

export default async function CartPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect('/login');
    }

    const userId = (session.user as any).id;

    const cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
            items: {
                include: {
                    variant: {
                        include: {
                            product: {
                                include: {
                                    images: { take: 1 },
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    const cartItems = cart?.items || [];

    const subtotal = cartItems.reduce((sum, item) => {
        const price = Number(item.variant.product.price);
        const discount = Number(item.variant.product.discount);
        const finalPrice = discount > 0 ? price - (price * discount) / 100 : price;
        return sum + finalPrice * item.quantity;
    }, 0);

    if (cartItems.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
                <p className="text-gray-600 mb-8">Add some products to get started!</p>
                <Link href="/shop">
                    <Button>Continue Shopping</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-8">
            <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    {cartItems.map((item) => {
                        const product = item.variant.product;
                        const price = Number(product.price);
                        const discount = Number(product.discount);
                        const finalPrice = discount > 0 ? price - (price * discount) / 100 : price;

                        return (
                            <div key={item.id} className="flex gap-4 bg-white p-4 rounded-lg shadow">
                                <div className="relative w-24 h-24 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                    <Image
                                        src={product.images[0]?.imageUrl || '/placeholder.jpg'}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold">{product.name}</h3>
                                    <p className="text-sm text-gray-600">
                                        {item.variant.size} - {item.variant.color}
                                    </p>
                                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                    <p className="font-bold mt-2">Rs. {(finalPrice * item.quantity).toFixed(2)}</p>
                                </div>
                                <RemoveFromCartButton itemId={item.id} />
                            </div>
                        );
                    })}
                </div>

                {/* Order Summary */}
                <div className="bg-white p-6 rounded-lg shadow h-fit">
                    <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>Rs. {subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Shipping</span>
                            <span>Free</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>Rs. {subtotal.toFixed(2)}</span>
                        </div>
                    </div>
                    <Link href="/checkout">
                        <Button className="w-full" size="lg">
                            Proceed to Checkout
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
