'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';

interface DeleteProductButtonProps {
    productId: string;
    productName: string;
}

export default function DeleteProductButton({ productId, productName }: DeleteProductButtonProps) {
    const isMounted = useRef(true);
    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        const confirmDelete = window.confirm(
            `Are you sure you want to delete "${productName}"? This action cannot be undone.`
        );

        if (!confirmDelete) return;

        setLoading(true);

        try {
            const res = await fetch(`/api/admin/products/${productId}`, {
                method: 'DELETE',
            });

            const data = await res.json();

            if (res.ok) {
                router.refresh();
            } else {
                alert(data.error || 'Failed to delete product.');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={loading}
            className="hover:bg-red-50 hover:text-red-600 transition-colors duration-150 p-2 h-9 w-9"
            title="Delete Product"
        >
            <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" />
        </Button>
    );
}
