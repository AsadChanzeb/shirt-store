'use client';

import { useState, Fragment } from 'react';
import {
    Search,
    ChevronDown,
    ChevronUp,
    Calendar,
    ShoppingBag,
    User,
    DollarSign,
    ImageIcon,
    Type,
    Palette,
} from 'lucide-react';
import UpdateOrderStatus from './UpdateOrderStatus';

interface Variant {
    id: string;
    size: string;
    color: string;
    product: {
        id: string;
        name: string;
        price: number;
        discount: number;
        images: { id: string; imageUrl: string }[];
    };
}

interface OrderItem {
    id: string;
    quantity: number;
    price: number;
    variant: Variant;
    customText?: string | null;
    customTextColor?: string | null;
    customTextSize?: number | null;
    customTextFont?: string | null;
    customTextX?: number | null;
    customTextY?: number | null;
    customLogoX?: number | null;
    customLogoY?: number | null;
    customLogoScale?: number | null;
    hasLogoData?: boolean;
    hasFrontData?: boolean;
    hasBackData?: boolean;
}

interface Order {
    id: string;
    totalAmount: number;
    paymentMethod?: string;
    status: string;
    createdAt: string;
    user: {
        name: string | null;
        email: string;
    };
    items: OrderItem[];
}

interface AdminOrderListProps {
    initialOrders: Order[];
}

export default function AdminOrderList({ initialOrders }: AdminOrderListProps) {
    const [orders] = useState<Order[]>(initialOrders);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
    const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

    const toggleExpand = (orderId: string) => {
        setExpandedOrders((prev) => ({
            ...prev,
            [orderId]: !prev[orderId],
        }));
    };

    // Filter and search
    const filteredOrders = orders.filter((order) => {
        const matchesStatus = selectedStatus === 'ALL' || order.status === selectedStatus;
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            order.id.toLowerCase().includes(query) ||
            order.user.email.toLowerCase().includes(query) ||
            (order.user.name?.toLowerCase() || '').includes(query);
        return matchesStatus && matchesSearch;
    });

    const statusOptions = ['ALL', 'PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'bg-amber-50 text-amber-700 ring-amber-600/10';
            case 'PAID':
                return 'bg-emerald-50 text-emerald-700 ring-emerald-600/10';
            case 'SHIPPED':
                return 'bg-blue-50 text-blue-700 ring-blue-600/10';
            case 'DELIVERED':
                return 'bg-gray-50 text-gray-700 ring-gray-600/10';
            case 'CANCELLED':
                return 'bg-red-50 text-red-700 ring-red-600/10';
            default:
                return 'bg-gray-50 text-gray-700 ring-gray-600/10';
        }
    };

    const hasCustomDesign = (item: OrderItem) =>
        item.customText || item.hasLogoData || item.hasFrontData || item.hasBackData;

    return (
        <div className="space-y-6">
            {/* Filters Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by Order ID, Customer Email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none text-sm text-gray-900 transition focus:border-black focus:ring-1 focus:ring-black placeholder:text-gray-400"
                    />
                </div>

                {/* Status Tabs */}
                <div className="flex flex-wrap gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200/50">
                    {statusOptions.map((status) => (
                        <button
                            key={status}
                            onClick={() => setSelectedStatus(status)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                                selectedStatus === status
                                    ? 'bg-black text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-900'
                            }`}
                        >
                            {status.toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/70">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Order
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Total
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-400">
                                        No orders found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => {
                                    const isExpanded = !!expandedOrders[order.id];
                                    return (
                                        <Fragment key={order.id}>
                                            {/* Summary Row */}
                                            <tr
                                                className={`hover:bg-gray-50/60 transition-colors ${
                                                    isExpanded ? 'bg-gray-50/40' : ''
                                                }`}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="font-mono text-xs font-semibold bg-gray-100 text-gray-800 px-2.5 py-1 rounded-md">
                                                        #{order.id.slice(0, 8).toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                                        <span suppressHydrationWarning>
                                                            {new Date(order.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {order.user.name || 'Anonymous User'}
                                                    </div>
                                                    <div className="text-xs text-gray-400 mt-0.5">
                                                        {order.user.email}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-bold text-gray-900">
                                                        Rs. {Number(order.totalAmount).toFixed(2)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <UpdateOrderStatus
                                                        orderId={order.id}
                                                        currentStatus={order.status}
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                    <button
                                                        onClick={() => toggleExpand(order.id)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg hover:border-gray-900 transition text-xs font-semibold text-gray-700 hover:text-black"
                                                    >
                                                        {isExpanded ? 'Hide Details' : 'View Details'}
                                                        {isExpanded ? (
                                                            <ChevronUp className="h-3.5 w-3.5" />
                                                        ) : (
                                                            <ChevronDown className="h-3.5 w-3.5" />
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>

                                            {/* Details Expanded Row */}
                                            {isExpanded && (
                                                <tr className="bg-gray-50/20">
                                                    <td colSpan={6} className="px-6 py-5 border-l-2 border-l-[#443DFF]">
                                                        <div className="grid md:grid-cols-3 gap-6 text-sm">
                                                            {/* Customer Details Column */}
                                                            <div className="space-y-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                                                <h4 className="font-bold text-gray-900 border-b pb-2 flex items-center gap-1.5">
                                                                    <User className="h-4 w-4 text-gray-500" />
                                                                    Customer Info
                                                                </h4>
                                                                <div className="space-y-2 text-xs">
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-400">Name:</span>
                                                                        <span className="font-medium text-gray-700">
                                                                            {order.user.name || 'N/A'}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-400">Email:</span>
                                                                        <span className="font-medium text-gray-700">
                                                                            {order.user.email}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Payment Info */}
                                                            <div className="space-y-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                                                <h4 className="font-bold text-gray-900 border-b pb-2 flex items-center gap-1.5">
                                                                    <DollarSign className="h-4 w-4 text-gray-500" />
                                                                    Order Overview
                                                                </h4>
                                                                <div className="space-y-2 text-xs">
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-400">Order ID:</span>
                                                                        <span className="font-mono text-gray-700 truncate max-w-[140px]">
                                                                            {order.id}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-400">Placed:</span>
                                                                        <span className="font-medium text-gray-700" suppressHydrationWarning>
                                                                            {new Date(order.createdAt).toLocaleString()}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-400">Status:</span>
                                                                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${getStatusColor(order.status)}`}>
                                                                            {order.status}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-400">Payment:</span>
                                                                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${order.paymentMethod === 'COD' ? 'bg-purple-50 text-purple-700 ring-purple-600/20' : 'bg-blue-50 text-blue-700 ring-blue-600/20'}`}>
                                                                            {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Paid'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Products Summary Card */}
                                                            <div className="space-y-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm md:col-span-1">
                                                                <h4 className="font-bold text-gray-900 border-b pb-2 flex items-center gap-1.5">
                                                                    <ShoppingBag className="h-4 w-4 text-gray-500" />
                                                                    Totals Summary
                                                                </h4>
                                                                <div className="space-y-2 text-xs">
                                                                    <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-dashed">
                                                                        <span>Grand Total:</span>
                                                                        <span>Rs. {Number(order.totalAmount).toFixed(2)}</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Order Items Table */}
                                                            <div className="md:col-span-3 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mt-2">
                                                                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 font-bold text-gray-900 text-xs">
                                                                    Items List ({order.items.length})
                                                                </div>
                                                                <table className="min-w-full divide-y divide-gray-100">
                                                                    <thead>
                                                                        <tr className="bg-gray-50/35 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                                            <th className="px-4 py-2 text-left">Product</th>
                                                                            <th className="px-4 py-2 text-center">Size</th>
                                                                            <th className="px-4 py-2 text-center">Color</th>
                                                                            <th className="px-4 py-2 text-center">Qty</th>
                                                                            <th className="px-4 py-2 text-right">Price</th>
                                                                            <th className="px-4 py-2 text-right">Total</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="divide-y divide-gray-100 text-xs">
                                                                        {order.items.map((item) => {
                                                                            const prodImage = item.variant.product.images[0]?.imageUrl || '/placeholder.jpg';
                                                                            return (
                                                                                <tr key={item.id}>
                                                                                    <td className="px-4 py-3 text-left">
                                                                                        <div className="flex items-start gap-3">
                                                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                                            <img
                                                                                                src={prodImage}
                                                                                                alt={item.variant.product.name}
                                                                                                className="h-10 w-10 rounded-lg object-cover border bg-gray-50 mt-0.5"
                                                                                            />
                                                                                            <div>
                                                                                                <span className="font-semibold text-gray-900 block">
                                                                                                    {item.variant.product.name}
                                                                                                </span>
                                                                                                <span className="text-[10px] text-gray-400">
                                                                                                    ID: {item.variant.product.id}
                                                                                                </span>

                                                                                                {/* ─── Custom Design Specs ─── */}
                                                                                                {hasCustomDesign(item) && (
                                                                                                    <div className="mt-3 bg-gray-50/80 rounded-xl p-3 border border-gray-100/50 space-y-3 max-w-lg">
                                                                                                        <span className="inline-flex items-center rounded-md bg-[#443DFF]/5 px-2 py-0.5 text-[9px] font-bold text-[#443DFF] ring-1 ring-inset ring-[#443DFF]/10 uppercase tracking-wider">
                                                                                                            Custom Design Specs
                                                                                                        </span>

                                                                                                        {/* Text details */}
                                                                                                        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px] leading-relaxed">
                                                                                                            {item.customText && (
                                                                                                                <div className="col-span-2 border-b border-gray-150/50 pb-1 text-gray-700 flex items-center gap-1.5">
                                                                                                                    <Type className="h-3 w-3 text-gray-400" />
                                                                                                                    <span className="font-semibold text-gray-400">Text:</span>{" "}
                                                                                                                    <span className="font-bold text-gray-950">&quot;{item.customText}&quot;</span>
                                                                                                                </div>
                                                                                                            )}
                                                                                                            {item.customTextFont && (
                                                                                                                <div className="text-gray-500">
                                                                                                                    <span className="font-semibold text-gray-400">Font:</span> {item.customTextFont}
                                                                                                                </div>
                                                                                                            )}
                                                                                                            {item.customTextSize && (
                                                                                                                <div className="text-gray-500">
                                                                                                                    <span className="font-semibold text-gray-400">Size:</span> {item.customTextSize}px
                                                                                                                </div>
                                                                                                            )}
                                                                                                            {item.customTextColor && (
                                                                                                                <div className="flex items-center gap-1 text-gray-500">
                                                                                                                    <Palette className="h-3 w-3 text-gray-400" />
                                                                                                                    <span className="font-semibold text-gray-400">Color:</span>
                                                                                                                    <span className="inline-block w-2.5 h-2.5 rounded-full border border-gray-300" style={{ backgroundColor: item.customTextColor }} />
                                                                                                                    <span className="font-mono text-[9px]">{item.customTextColor}</span>
                                                                                                                </div>
                                                                                                            )}
                                                                                                            {item.customTextX !== null && item.customTextX !== undefined && item.customTextY !== null && item.customTextY !== undefined && (
                                                                                                                <div className="text-gray-500">
                                                                                                                    <span className="font-semibold text-gray-400">Text Pos:</span> X: {item.customTextX?.toFixed(0)}%, Y: {item.customTextY?.toFixed(0)}%
                                                                                                                </div>
                                                                                                            )}

                                                                                                            {/* Logo details */}
                                                                                                            {item.hasLogoData && (
                                                                                                                <div className="col-span-2 pt-1.5 border-t border-gray-150/50 flex items-center gap-2">
                                                                                                                    <div className="w-8 h-8 rounded border bg-white flex items-center justify-center p-0.5">
                                                                                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                                                                        <img src={`/api/images/order-item/${item.id}?type=logo`} alt="Logo" className="max-w-full max-h-full object-contain" />
                                                                                                                    </div>
                                                                                                                    <div className="text-[10px] text-gray-500">
                                                                                                                        <span className="font-semibold text-gray-400 block text-[9px]">Logo Details</span>
                                                                                                                        Scale: {item.customLogoScale}%, Position: X: {item.customLogoX?.toFixed(0)}%, Y: {item.customLogoY?.toFixed(0)}%
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            )}
                                                                                                        </div>

                                                                                                        {/* ─── Front & Back Preview Images ─── */}
                                                                                                        {(item.hasFrontData || item.hasBackData) && (
                                                                                                            <div className="pt-3 border-t border-gray-150/50">
                                                                                                                <div className="flex items-center gap-1.5 mb-2">
                                                                                                                    <ImageIcon className="h-3 w-3 text-[#443DFF]" />
                                                                                                                    <span className="font-semibold text-gray-600 text-[10px] uppercase tracking-wider">
                                                                                                                        Design Placement Reference
                                                                                                                    </span>
                                                                                                                </div>
                                                                                                                <div className="flex gap-3">
                                                                                                                    {item.hasFrontData && (
                                                                                                                        <a
                                                                                                                            href={`/api/images/order-item/${item.id}?type=front`}
                                                                                                                            target="_blank"
                                                                                                                            rel="noopener noreferrer"
                                                                                                                            className="relative w-28 h-28 border-2 border-gray-200 rounded-xl overflow-hidden bg-white hover:border-[#443DFF] transition-all duration-200 group/img flex-shrink-0 shadow-sm hover:shadow-md"
                                                                                                                            title="Click to view full size front design"
                                                                                                                        >
                                                                                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                                                                            <img
                                                                                                                                src={`/api/images/order-item/${item.id}?type=front`}
                                                                                                                                alt="Front Design Preview"
                                                                                                                                className="w-full h-full object-contain p-1 group-hover/img:scale-105 transition"
                                                                                                                            />
                                                                                                                            <span className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent text-[9px] text-white text-center py-1 uppercase tracking-wider font-bold">
                                                                                                                                Front
                                                                                                                            </span>
                                                                                                                        </a>
                                                                                                                    )}
                                                                                                                    {item.hasBackData && (
                                                                                                                        <a
                                                                                                                            href={`/api/images/order-item/${item.id}?type=back`}
                                                                                                                            target="_blank"
                                                                                                                            rel="noopener noreferrer"
                                                                                                                            className="relative w-28 h-28 border-2 border-gray-200 rounded-xl overflow-hidden bg-white hover:border-[#443DFF] transition-all duration-200 group/img flex-shrink-0 shadow-sm hover:shadow-md"
                                                                                                                            title="Click to view full size back design"
                                                                                                                        >
                                                                                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                                                                            <img
                                                                                                                                src={`/api/images/order-item/${item.id}?type=back`}
                                                                                                                                alt="Back Design Preview"
                                                                                                                                className="w-full h-full object-contain p-1 group-hover/img:scale-105 transition"
                                                                                                                            />
                                                                                                                            <span className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent text-[9px] text-white text-center py-1 uppercase tracking-wider font-bold">
                                                                                                                                Back
                                                                                                                            </span>
                                                                                                                        </a>
                                                                                                                    )}
                                                                                                                </div>
                                                                                                                <p className="text-[9px] text-gray-400 mt-1.5 italic">
                                                                                                                    Click to open full‑size image in a new tab
                                                                                                                </p>
                                                                                                            </div>
                                                                                                        )}
                                                                                                    </div>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td className="px-4 py-3 text-center font-medium">
                                                                                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px]">
                                                                                            {item.variant.size}
                                                                                        </span>
                                                                                    </td>
                                                                                    <td className="px-4 py-3 text-center text-gray-600">
                                                                                        {item.variant.color}
                                                                                    </td>
                                                                                    <td className="px-4 py-3 text-center text-gray-600">
                                                                                        {item.quantity}
                                                                                    </td>
                                                                                    <td className="px-4 py-3 text-right text-gray-600">
                                                                                        Rs. {Number(item.price).toFixed(2)}
                                                                                    </td>
                                                                                    <td className="px-4 py-3 text-right font-bold text-gray-900">
                                                                                        Rs. {(Number(item.price) * item.quantity).toFixed(2)}
                                                                                    </td>
                                                                                </tr>
                                                                            );
                                                                        })}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
