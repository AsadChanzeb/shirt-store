'use client';

import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import Button from './ui/Button';

export default function RemoveFromCartButton({ itemId }: { itemId: string }) {
    const router = useRouter();

    const handleRemove = async () => {
        try {
            const res = await fetch(`/api/cart/remove?itemId=${itemId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                router.refresh();
            } else {
                alert('Failed to remove item');
            }
        } catch (error) {
            alert('Something went wrong');
        }
    };

    return (
        <Button variant="ghost" size="sm" onClick={handleRemove}>
            <Trash2 className="w-4 h-4 text-red-600" />
        </Button>
    );
}
