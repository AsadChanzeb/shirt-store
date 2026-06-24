'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Plus, Trash2, ArrowLeft, Image as ImageIcon, Upload } from 'lucide-react';
import Link from 'next/link';

interface Variant {
    id?: string;
    size: string;
    color: string;
    stock: number;
}

interface ProductImage {
    id?: string;
    imageUrl: string;
}

interface Category {
    id: string;
    name: string;
}

interface ProductFormProps {
    categories: Category[];
    initialData?: {
        id: string;
        name: string;
        description: string;
        price: number;
        discount: number;
        categoryId: string;
        images: ProductImage[];
        variants: Variant[];
    };
}

export default function ProductForm({ categories, initialData }: ProductFormProps) {
    const router = useRouter();
    const isEdit = !!initialData;

    // Form states
    const [name, setName] = useState(initialData?.name || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [price, setPrice] = useState(initialData?.price ? String(initialData.price) : '');
    const [discount, setDiscount] = useState(initialData?.discount !== undefined ? String(initialData.discount) : '0');
    const [categoryId, setCategoryId] = useState(initialData?.categoryId || categories[0]?.id || '');
    const [imageUrls, setImageUrls] = useState<string[]>(
        initialData?.images && initialData.images.length > 0
            ? initialData.images.map(img => img.imageUrl)
            : ['']
    );
    const [variants, setVariants] = useState<Variant[]>(
        initialData?.variants && initialData.variants.length > 0
            ? initialData.variants.map(v => ({ id: v.id, size: v.size, color: v.color, stock: v.stock }))
            : [{ size: 'M', color: 'Black', stock: 10 }]
    );

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState<{ [key: number]: boolean }>({});

    // Handlers for dynamic images list
    const handleAddImage = () => {
        setImageUrls([...imageUrls, '']);
    };

    const handleFileUpload = async (index: number, file: File | undefined) => {
        if (!file) return;

        setUploading(prev => ({ ...prev, [index]: true }));
        setError('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to upload image');
            }

            const data = await res.json();
            const updated = [...imageUrls];
            updated[index] = data.url;
            setImageUrls(updated);
        } catch (err: any) {
            setError(err.message || 'An error occurred during upload');
        } finally {
            setUploading(prev => ({ ...prev, [index]: false }));
        }
    };

    const handleRemoveImage = (index: number) => {
        if (imageUrls.length === 1) {
            setImageUrls(['']);
        } else {
            setImageUrls(imageUrls.filter((_, i) => i !== index));
        }
    };

    // Handlers for dynamic variants list
    const handleAddVariant = () => {
        setVariants([...variants, { size: '', color: '', stock: 0 }]);
    };

    const handleVariantChange = (index: number, field: keyof Variant, value: any) => {
        const updated = [...variants];
        if (field === 'stock') {
            updated[index] = { ...updated[index], [field]: isNaN(Number(value)) ? 0 : Number(value) };
        } else {
            updated[index] = { ...updated[index], [field]: value };
        }
        setVariants(updated);
    };

    const handleRemoveVariant = (index: number) => {
        if (variants.length === 1) {
            alert('At least one variant is required.');
            return;
        }
        setVariants(variants.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Basic fields validation
        if (!name.trim()) return setError('Product Name is required');
        if (!description.trim()) return setError('Product Description is required');
        if (!price || isNaN(Number(price)) || Number(price) < 0) {
            return setError('Please enter a valid price (0 or greater)');
        }
        if (isNaN(Number(discount)) || Number(discount) < 0 || Number(discount) > 100) {
            return setError('Discount must be a number between 0 and 100');
        }
        if (!categoryId) return setError('Please select a category');

        // Filter and validate image URLs
        const validImages = imageUrls.map(url => url.trim()).filter(Boolean);
        if (validImages.length === 0) {
            return setError('Please add at least one Image URL');
        }

        // Validate variants
        const validVariants = variants.map(v => ({
            ...v,
            size: v.size.trim(),
            color: v.color.trim()
        }));

        for (const variant of validVariants) {
            if (!variant.size) return setError('Each variant must have a size (e.g. S, M, L)');
            if (!variant.color) return setError('Each variant must have a color');
            if (variant.stock === undefined || variant.stock < 0) {
                return setError('Variant stock must be a non-negative number');
            }
        }

        setLoading(true);

        try {
            const endpoint = isEdit ? `/api/admin/products/${initialData.id}` : '/api/admin/products';
            const method = isEdit ? 'PUT' : 'POST';

            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    description,
                    price: Number(price),
                    discount: Number(discount),
                    categoryId,
                    images: validImages,
                    variants: validVariants
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save product');
            }

            router.push('/admin/products');
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'An error occurred while saving the product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto pb-16">
            <div className="flex items-center justify-between border-b pb-5">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/products"
                        className="p-2 border rounded-full hover:bg-gray-100 transition duration-150"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            {isEdit ? 'Edit Product' : 'Add New Product'}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {isEdit ? `Modifying product: ${initialData.name}` : 'Create a new catalog product item with options'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/products">
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                    </Link>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
                    </Button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium animate-pulse">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Form Column */}
                <div className="md:col-span-2 space-y-6">
                    {/* Basic Info Card */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
                        <h2 className="text-lg font-semibold text-gray-950 pb-2 border-b">
                            Basic Details
                        </h2>

                        <Input
                            label="Product Name *"
                            placeholder="e.g. Classic Black T-Shirt"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Product Description *
                            </label>
                            <textarea
                                placeholder="Describe product details, fit, model size information..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={5}
                                required
                                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent min-h-[120px]"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="Price (PKR) *"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="29.99"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                required
                            />

                            <Input
                                label="Discount (%)"
                                type="number"
                                min="0"
                                max="100"
                                placeholder="10"
                                value={discount}
                                onChange={(e) => setDiscount(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category *
                            </label>
                            <select
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="flex h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                            >
                                <option value="">Select a Category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Variants Card */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b">
                            <h2 className="text-lg font-semibold text-gray-950">
                                Product Variants *
                            </h2>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleAddVariant}
                                className="text-xs"
                            >
                                <Plus className="w-3.5 h-3.5 mr-1" />
                                Add Variant
                            </Button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                    <tr className="border-b text-gray-400 font-medium">
                                        <th className="py-2 pr-2">Size *</th>
                                        <th className="py-2 px-2">Color *</th>
                                        <th className="py-2 px-2">Stock Qty *</th>
                                        <th className="py-2 pl-2 text-center w-12">Remove</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {variants.map((v, index) => (
                                        <tr key={index} className="border-b last:border-b-0">
                                            <td className="py-3 pr-2">
                                                <input
                                                    type="text"
                                                    placeholder="e.g. S, M, L, XL"
                                                    value={v.size}
                                                    onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                                                    className="w-full rounded border border-gray-300 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-black"
                                                    required
                                                />
                                            </td>
                                            <td className="py-3 px-2">
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Black, White"
                                                    value={v.color}
                                                    onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                                                    className="w-full rounded border border-gray-300 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-black"
                                                    required
                                                />
                                            </td>
                                            <td className="py-3 px-2">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    placeholder="100"
                                                    value={v.stock}
                                                    onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                                                    className="w-full rounded border border-gray-300 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-black"
                                                    required
                                                />
                                            </td>
                                            <td className="py-3 pl-2 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveVariant(index)}
                                                    className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition duration-150"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Form Column (Images) */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
                        <div className="flex justify-between items-center pb-2 border-b">
                            <h2 className="text-lg font-semibold text-gray-950 flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-gray-500" />
                                Product Images *
                            </h2>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleAddImage}
                                className="text-xs"
                            >
                                <Plus className="w-3.5 h-3.5 mr-1" />
                                Add
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {imageUrls.map((url, index) => {
                                const isUploading = uploading[index];

                                if (isUploading) {
                                    return (
                                        <div key={index} className="flex flex-col items-center justify-center border border-gray-200 rounded-lg p-4 min-h-[100px] bg-gray-50/50 animate-pulse">
                                            <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mb-2"></span>
                                            <span className="text-xs text-gray-500 font-medium">Uploading image...</span>
                                        </div>
                                    );
                                }

                                if (!url) {
                                    return (
                                        <div key={index} className="relative group animate-fade-in">
                                            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-black hover:bg-gray-50 transition duration-150 min-h-[100px]">
                                                <Upload className="w-5 h-5 text-gray-400 mb-1 group-hover:text-black transition" />
                                                <span className="text-xs text-gray-500 font-medium group-hover:text-black transition">Click to upload photo</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => handleFileUpload(index, e.target.files?.[0])}
                                                />
                                            </label>
                                            {imageUrls.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveImage(index)}
                                                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition duration-150"
                                                    title="Remove Slot"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    );
                                }

                                return (
                                    <div key={index} className="flex items-center gap-3 border border-gray-200 rounded-lg p-3 bg-white hover:shadow-sm transition animate-fade-in">
                                        <div className="relative w-14 h-14 border rounded overflow-hidden flex-shrink-0 bg-gray-50">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={url}
                                                alt="Uploaded product"
                                                className="object-cover w-full h-full"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-gray-700 font-medium truncate">
                                                {url.split('/').pop()}
                                            </p>
                                            <p className="text-[10px] text-gray-400 truncate">
                                                {url}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(index)}
                                            className="text-red-500 hover:text-red-700 p-2 border border-gray-200 rounded-md hover:bg-red-50 transition duration-150"
                                            title="Delete Image"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
