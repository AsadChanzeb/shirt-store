import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import CheckoutForm from "@/components/CheckoutForm"

export default async function CheckoutPage() {
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
                            product: true,
                        },
                    },
                },
            },
        },
    });

    const cartItems = (cart?.items || []).map(item => ({
        ...item,
        variant: {
            ...item.variant,
            product: {
                ...item.variant.product,
                price: Number(item.variant.product.price),
                discount: Number(item.variant.product.discount),
            }
        }
    }));

    if (cartItems.length === 0) {
        redirect('/cart');
    }

    const total = cartItems.reduce((sum, item) => {
        const price = item.variant.product.price;
        const discount = item.variant.product.discount;
        const finalPrice = discount > 0 ? price - (price * discount) / 100 : price;
        return sum + finalPrice * item.quantity;
    }, 0);

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>
            <CheckoutForm cartItems={cartItems} total={total} />
        </div>
    );
}
