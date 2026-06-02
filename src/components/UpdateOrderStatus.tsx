'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface UpdateOrderStatusProps {
    orderId: string;
    currentStatus: string;
}

export default function UpdateOrderStatus({ orderId, currentStatus }: UpdateOrderStatusProps) {
    const router = useRouter();
    const [status, setStatus] = useState(currentStatus);
    const [loading, setLoading] = useState(false);

    const handleUpdate = async (newStatus: string) => {
        setLoading(true);
        try {
            const res = await fetch('/api/orders/update-status', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, status: newStatus }),
            });

            if (res.ok) {
                setStatus(newStatus);
                router.refresh();
            } else {
                alert('Failed to update status');
            }
        } catch (error) {
            alert('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <select
            value={status}
            onChange={(e) => handleUpdate(e.target.value)}
            disabled={loading}
            className="border rounded px-2 py-1 text-sm"
        >
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
        </select>
    );
}
