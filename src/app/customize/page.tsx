'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
    Upload,
    Type,
    Palette,
    RotateCcw,
    X,
    ChevronDown,
} from 'lucide-react';
import ProductGallery from '@/components/ProductGallery';

type ShirtSide = 'front' | 'back';

interface SideDesign {
    logoPreview: string | null;
    logoFile: File | null;
    customText: string;
    fontFamily: string;
    textColor: string;
    textSize: number;
    logoPosition: { x: number; y: number };
    textPosition: { x: number; y: number };
    logoScale: number;
}

const SHIRT_COLORS = [
    { name: 'White', value: '#ffffff', frontImage: '/images/shirt-front.png', backImage: '/images/shirt-back.png' },
    { name: 'Black', value: '#1a1a1a', frontImage: '/images/black.png', backImage: '/images/black.png' },
    { name: 'Gray', value: '#6b7280', frontImage: '/images/gray.png', backImage: '/images/gray.png' },
    { name: 'Navy Blue', value: '#1e3a5f', frontImage: '/images/navyblue.png', backImage: '/images/navyblue.png' },
    { name: 'Red', value: '#dc2626', frontImage: '/images/red.png', backImage: '/images/red.png' },
    { name: 'Green', value: '#166534', frontImage: '/images/green.png', backImage: '/images/green.png' },
];

const FONT_OPTIONS = [
    { label: 'Arial', value: 'Arial' },
    { label: 'Impact', value: 'Impact' },
    { label: 'Georgia', value: 'Georgia' },
    { label: 'Courier New', value: 'Courier New' },
    { label: 'Comic Sans', value: 'Comic Sans MS' },
    { label: 'Times New Roman', value: 'Times New Roman' },
    { label: 'Verdana', value: 'Verdana' },
    { label: 'Trebuchet', value: 'Trebuchet MS' },
];

const TEXT_COLORS = [
    '#111827', '#ffffff', '#dc2626', '#2563eb',
    '#16a34a', '#d97706', '#9333ea', '#ec4899',
    '#06b6d4', '#f59e0b',
];

const MAX_TEXT_LENGTH = 60;

const defaultSideDesign = (): SideDesign => ({
    logoPreview: null,
    logoFile: null,
    customText: '',
    fontFamily: 'Arial',
    textColor: '#111827',
    textSize: 48,
    logoPosition: { x: 50, y: 40 },
    textPosition: { x: 50, y: 65 },
    logoScale: 100,
});

export default function CustomizePage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [activeSide, setActiveSide] = useState<ShirtSide>('front');
    const [designs, setDesigns] = useState<Record<ShirtSide, SideDesign>>({
        front: defaultSideDesign(),
        back: defaultSideDesign(),
    });
    const [selectedColor, setSelectedColor] = useState(SHIRT_COLORS[0]);
    const [selectedSize, setSelectedSize] = useState('M');
    const [activeTab, setActiveTab] = useState<'logo' | 'text'>('logo');
    const [fontDropdownOpen, setFontDropdownOpen] = useState(false);
    const fontDropdownRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const currentDesign = designs[activeSide];

    const textError =
        currentDesign.customText.length > MAX_TEXT_LENGTH
            ? `Text must be ${MAX_TEXT_LENGTH} characters or fewer`
            : '';

    // Close font dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (fontDropdownRef.current && !fontDropdownRef.current.contains(e.target as Node)) {
                setFontDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const updateDesign = useCallback(
        (field: keyof SideDesign, value: SideDesign[keyof SideDesign]) => {
            setDesigns((prev) => ({
                ...prev,
                [activeSide]: { ...prev[activeSide], [field]: value },
            }));
        },
        [activeSide]
    );

    const handleLogoPositionChange = useCallback((pos: { x: number; y: number }) => {
        updateDesign('logoPosition', pos);
    }, [updateDesign]);

    const handleTextPositionChange = useCallback((pos: { x: number; y: number }) => {
        updateDesign('textPosition', pos);
    }, [updateDesign]);

    const handleLogoUpload = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;

            if (!file.type.startsWith('image/')) {
                alert('Please upload an image file');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                alert('Image must be smaller than 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                setDesigns((prev) => ({
                    ...prev,
                    [activeSide]: {
                        ...prev[activeSide],
                        logoPreview: event.target?.result as string,
                        logoFile: file,
                    },
                }));
            };
            reader.readAsDataURL(file);

            // Reset input so re-uploading the same file works
            e.target.value = '';
        },
        [activeSide]
    );

    const removeLogo = useCallback(() => {
        updateDesign('logoPreview', null);
        updateDesign('logoFile', null);
    }, [updateDesign]);

    const resetCurrentSide = useCallback(() => {
        setDesigns((prev) => ({
            ...prev,
            [activeSide]: defaultSideDesign(),
        }));
    }, [activeSide]);

    const [isAddingToCart, setIsAddingToCart] = useState(false);

    const hasFrontDesign = !!(designs.front.logoPreview || designs.front.customText.trim());
    const hasBackDesign = !!(designs.back.logoPreview || designs.back.customText.trim());

    const handleAddToCart = async () => {
        if (!session) {
            router.push('/login');
            return;
        }

        setIsAddingToCart(true);
        try {
            // 1. Upload custom logo file if present for front
            let frontLogoUrl = designs.front.logoPreview;
            if (designs.front.logoFile) {
                const formData = new FormData();
                formData.append('file', designs.front.logoFile);
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });
                if (res.ok) {
                    const data = await res.json();
                    frontLogoUrl = data.url;
                }
            }

            // Upload custom logo file if present for back
            let backLogoUrl = designs.back.logoPreview;
            if (designs.back.logoFile) {
                const formData = new FormData();
                formData.append('file', designs.back.logoFile);
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });
                if (res.ok) {
                    const data = await res.json();
                    backLogoUrl = data.url;
                }
            }

            // 2. Render design previews to blobs
            const { renderDesignToBlob } = await import('@/lib/designRenderer');

            let frontBlob: Blob | null = null;
            let backBlob: Blob | null = null;

            let customPreviewFrontUrl = null;
            if (hasFrontDesign) {
                frontBlob = await renderDesignToBlob('/images/shirt-front.png', {
                    ...designs.front,
                    logoPreview: frontLogoUrl,
                });
                if (frontBlob) {
                    const formData = new FormData();
                    formData.append('file', new File([frontBlob], 'front-preview.png', { type: 'image/png' }));
                    const res = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData,
                    });
                    if (res.ok) {
                        const data = await res.json();
                        customPreviewFrontUrl = data.url;
                    }
                }
            }

            let customPreviewBackUrl = null;
            if (hasBackDesign) {
                backBlob = await renderDesignToBlob('/images/shirt-back.png', {
                    ...designs.back,
                    logoPreview: backLogoUrl,
                });
                if (backBlob) {
                    const formData = new FormData();
                    formData.append('file', new File([backBlob], 'back-preview.png', { type: 'image/png' }));
                    const res = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData,
                    });
                    if (res.ok) {
                        const data = await res.json();
                        customPreviewBackUrl = data.url;
                    }
                }
            }

            // Default custom text and logo to the front design, or back design if front is empty
            const mainDesign = hasFrontDesign ? designs.front : designs.back;
            const mainLogoUrl = hasFrontDesign ? frontLogoUrl : backLogoUrl;

            // Convert logo file to base64 if present
            let logoDataBase64: string | null = null;
            if (designs.front.logoFile) {
                // Read the file as base64
                const fileReader = new FileReader();
                const logoDataPromise = new Promise<string>((resolve, reject) => {
                    fileReader.onload = () => {
                        const result = fileReader.result as string;
                        // result is data URL like 'data:image/png;base64,...'
                        const base64 = result.split(',')[1];
                        resolve(base64);
                    };
                    fileReader.onerror = reject;
                });
                fileReader.readAsDataURL(designs.front.logoFile);
                logoDataBase64 = await logoDataPromise;
            }
            // Convert preview blobs to base64 strings
            const blobToBase64 = async (blob: Blob): Promise<string> => {
                const arrayBuffer = await blob.arrayBuffer();
                const uint8Array = new Uint8Array(arrayBuffer);
                // Convert to binary string then to base64
                let binary = '';
                for (let i = 0; i < uint8Array.byteLength; i++) {
                    binary += String.fromCharCode(uint8Array[i]);
                }
                return btoa(binary);
            };
            let previewFrontBase64: string | null = null;
            let previewBackBase64: string | null = null;
            if (hasFrontDesign && frontBlob) {
                previewFrontBase64 = await blobToBase64(frontBlob);
            }
            if (hasBackDesign && backBlob) {
                previewBackBase64 = await blobToBase64(backBlob);
            }
            // 3. Post to customize cart add API (include base64 data)
            const res = await fetch('/api/customize/add-to-cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    size: selectedSize,
                    color: selectedColor.name,
                    customText: mainDesign.customText,
                    customTextColor: mainDesign.textColor,
                    customTextSize: mainDesign.textSize,
                    customTextFont: mainDesign.fontFamily,
                    customTextX: mainDesign.textPosition.x,
                    customTextY: mainDesign.textPosition.y,
                    customLogoUrl: mainLogoUrl,
                    customLogoX: mainDesign.logoPosition.x,
                    customLogoY: mainDesign.logoPosition.y,
                    customLogoScale: mainDesign.logoScale,
                    customLogoData: logoDataBase64,
                    customPreviewFrontUrl,
                    customPreviewBackUrl,
                    customPreviewFrontData: previewFrontBase64,
                    customPreviewBackData: previewBackBase64,
                }),
            });

            if (res.ok) {
                alert('Custom shirt added to cart!');
                router.push('/cart');
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to add custom shirt to cart');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setIsAddingToCart(false);
        }
    };

    // Build gallery images for the active side
    const galleryImages = [
        {
            id: `${activeSide}-main`,
            imageUrl: activeSide === 'front' ? selectedColor.frontImage : selectedColor.backImage,
        },
    ];

    return (
        <div className="h-screen overflow-hidden bg-[#f5f5f0] flex flex-col pt-28">
            {/* Main Content */}
            <div className="mx-auto max-w-7xl w-full px-4 pb-8 sm:px-6 lg:px-8 flex-1 flex flex-col min-h-0">
                <div className="grid gap-8 lg:grid-cols-[1fr_420px] flex-1 min-h-0">
                    {/* ── Left: Preview Area ── */}
                    <div className="space-y-4 flex flex-col min-h-0">
                        {/* Front / Back Toggle */}
                        <div className="flex items-center justify-center gap-1 rounded-2xl bg-white p-1.5 shadow-sm sm:w-fit sm:mx-auto">
                            {(['front', 'back'] as ShirtSide[]).map((side) => {
                                const isActive = activeSide === side;
                                const hasDesign = side === 'front' ? hasFrontDesign : hasBackDesign;
                                return (
                                    <button
                                        key={side}
                                        type="button"
                                        onClick={() => setActiveSide(side)}
                                        className={`relative flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold capitalize transition-all duration-300 ${isActive
                                            ? 'bg-black text-white shadow-lg shadow-black/20'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                                            }`}
                                    >
                                        {side === 'front' ? 'Front Side' : 'Back Side'}
                                        {hasDesign && !isActive && (
                                            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-[#443DFF] ring-2 ring-white" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Gallery Preview */}
                        <div className="overflow-hidden rounded-[2rem] bg-white p-4 shadow-sm sm:p-6 flex-1 min-h-0 flex flex-col items-center justify-center w-full h-full">
                            <ProductGallery
                                images={galleryImages}
                                selectedImage={galleryImages[0].imageUrl}
                                logoPreview={currentDesign.logoPreview}
                                customText={currentDesign.customText}
                                fontFamily={currentDesign.fontFamily}
                                textColor={currentDesign.textColor}
                                textSize={currentDesign.textSize}
                                textError={textError}
                                logoPosition={currentDesign.logoPosition}
                                textPosition={currentDesign.textPosition}
                                onLogoPositionChange={handleLogoPositionChange}
                                onTextPositionChange={handleTextPositionChange}
                                logoScale={currentDesign.logoScale}
                                objectFit="contain"
                            />
                        </div>

                        {/* Side indicators below preview */}
                        <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
                            <div className="flex items-center gap-2">
                                <span className={`h-2 w-2 rounded-full ${hasFrontDesign ? 'bg-[#443DFF]' : 'bg-gray-300'}`} />
                                Front {hasFrontDesign ? '(designed)' : '(empty)'}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`h-2 w-2 rounded-full ${hasBackDesign ? 'bg-[#443DFF]' : 'bg-gray-300'}`} />
                                Back {hasBackDesign ? '(designed)' : '(empty)'}
                            </div>
                        </div>
                    </div>

                    {/* ── Right: Editing Controls ── */}
                    <div className="space-y-5 overflow-y-auto pr-2 pb-8 scrollbar-hide h-full">
                        {/* Active side label */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 capitalize">
                                    {activeSide} Side Design
                                </h2>
                                <p className="mt-0.5 text-sm text-gray-500">
                                    Add your logo and text to the {activeSide} of the shirt
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={resetCurrentSide}
                                className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                            >
                                <RotateCcw className="h-3 w-3" />
                                Reset
                            </button>
                        </div>

                        {/* Tab Selector */}
                        <div className="flex gap-1 rounded-2xl bg-gray-100 p-1">
                            {[
                                { key: 'logo' as const, icon: Upload, label: 'Upload Logo' },
                                { key: 'text' as const, icon: Type, label: 'Add Text' },
                            ].map(({ key, icon: Icon, label }) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setActiveTab(key)}
                                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all duration-200 ${activeTab === key
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* ── Logo Upload Panel ── */}
                        {activeTab === 'logo' && (
                            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
                                <h3 className="text-sm font-semibold text-gray-900">
                                    Logo / Image
                                </h3>

                                {currentDesign.logoPreview ? (
                                    <div className="relative rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-4">
                                        <div className="flex items-center gap-4">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={currentDesign.logoPreview}
                                                alt="Uploaded logo"
                                                className="h-20 w-20 rounded-lg object-contain"
                                            />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-700">
                                                    Logo uploaded
                                                </p>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    Displayed on the {activeSide} of your shirt
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={removeLogo}
                                            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-red-600 transition hover:bg-red-200"
                                            aria-label="Remove logo"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="group flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 py-10 transition hover:border-[#443DFF]/40 hover:bg-[#443DFF]/5"
                                    >
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#443DFF]/10 text-[#443DFF] transition group-hover:bg-[#443DFF]/20">
                                            <Upload className="h-5 w-5" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-semibold text-gray-700">
                                                Click to upload your logo
                                            </p>
                                            <p className="mt-1 text-xs text-gray-400">
                                                PNG, JPG, SVG — Max 5MB
                                            </p>
                                        </div>
                                    </button>
                                )}

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleLogoUpload}
                                />

                                {currentDesign.logoPreview && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full rounded-xl bg-gray-100 py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-200"
                                        >
                                            Replace Logo
                                        </button>

                                        {/* Logo Scale */}
                                        <div className="space-y-2 pt-4 border-t border-gray-100">
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm font-semibold text-gray-900">
                                                    Logo Scale
                                                </label>
                                                <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-mono text-gray-500">
                                                    {currentDesign.logoScale}%
                                                </span>
                                            </div>
                                            <input
                                                type="range"
                                                min="30"
                                                max="200"
                                                step="5"
                                                value={currentDesign.logoScale}
                                                onChange={(e) =>
                                                    updateDesign('logoScale', Number(e.target.value))
                                                }
                                                className="w-full accent-[#443DFF]"
                                            />
                                            <div className="flex justify-between text-[10px] text-gray-400">
                                                <span>Smaller</span>
                                                <span>Larger</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* ── Text Controls Panel ── */}
                        {activeTab === 'text' && (
                            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-5">
                                {/* Text Input */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label
                                            htmlFor="custom-text"
                                            className="text-sm font-semibold text-gray-900"
                                        >
                                            Your Text
                                        </label>
                                        <span
                                            className={`text-xs ${textError ? 'text-red-500' : 'text-gray-400'
                                                }`}
                                        >
                                            {currentDesign.customText.length}/{MAX_TEXT_LENGTH}
                                        </span>
                                    </div>
                                    <input
                                        id="custom-text"
                                        type="text"
                                        value={currentDesign.customText}
                                        onChange={(e) => updateDesign('customText', e.target.value)}
                                        placeholder={`Text for the ${activeSide}…`}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#443DFF] focus:ring-2 focus:ring-[#443DFF]/20"
                                    />
                                    {textError && (
                                        <p className="text-xs text-red-500">{textError}</p>
                                    )}
                                </div>

                                {/* Font Selector */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-900">
                                        Font Family
                                    </label>
                                    <div className="relative" ref={fontDropdownRef}>
                                        <button
                                            type="button"
                                            onClick={() => setFontDropdownOpen((v) => !v)}
                                            className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm transition hover:border-gray-300"
                                        >
                                            <span style={{ fontFamily: currentDesign.fontFamily }}>
                                                {currentDesign.fontFamily}
                                            </span>
                                            <ChevronDown
                                                className={`h-4 w-4 text-gray-400 transition-transform ${fontDropdownOpen ? 'rotate-180' : ''
                                                    }`}
                                            />
                                        </button>

                                        {fontDropdownOpen && (
                                            <div className="absolute z-30 mt-1 w-full max-h-52 overflow-y-auto rounded-xl border border-gray-100 bg-white py-1 shadow-xl">
                                                {FONT_OPTIONS.map((font) => (
                                                    <button
                                                        key={font.value}
                                                        type="button"
                                                        onClick={() => {
                                                            updateDesign('fontFamily', font.value);
                                                            setFontDropdownOpen(false);
                                                        }}
                                                        className={`flex w-full items-center px-4 py-2.5 text-sm transition hover:bg-gray-50 ${currentDesign.fontFamily === font.value
                                                            ? 'bg-[#443DFF]/5 text-[#443DFF] font-semibold'
                                                            : 'text-gray-700'
                                                            }`}
                                                        style={{ fontFamily: font.value }}
                                                    >
                                                        {font.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Text Color */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                                        <Palette className="h-4 w-4 text-gray-400" />
                                        Text Color
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {TEXT_COLORS.map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => updateDesign('textColor', color)}
                                                className={`h-8 w-8 rounded-full border-2 transition-all duration-200 hover:scale-110 ${currentDesign.textColor === color
                                                    ? 'border-[#443DFF] ring-2 ring-[#443DFF]/30 scale-110'
                                                    : 'border-gray-200'
                                                    }`}
                                                style={{ backgroundColor: color }}
                                                aria-label={`Color ${color}`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Text Size */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-semibold text-gray-900">
                                            Text Size
                                        </label>
                                        <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-mono text-gray-500">
                                            {currentDesign.textSize}px
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="16"
                                        max="96"
                                        step="2"
                                        value={currentDesign.textSize}
                                        onChange={(e) =>
                                            updateDesign('textSize', Number(e.target.value))
                                        }
                                        className="w-full accent-[#443DFF]"
                                    />
                                    <div className="flex justify-between text-[10px] text-gray-400">
                                        <span>Small</span>
                                        <span>Large</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Shirt Color */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-3">
                            <h3 className="text-sm font-semibold text-gray-900">Shirt Color</h3>
                            <div className="flex flex-wrap gap-2.5">
                                {SHIRT_COLORS.map((color) => (
                                    <button
                                        key={color.name}
                                        type="button"
                                        onClick={() => setSelectedColor(color)}
                                        className={`group relative h-9 w-9 rounded-full border-2 transition-all duration-200 hover:scale-110 ${selectedColor.name === color.name
                                            ? 'border-[#443DFF] ring-2 ring-[#443DFF]/30 scale-110'
                                            : 'border-gray-200'
                                            }`}
                                        style={{ backgroundColor: color.value }}
                                        title={color.name}
                                    >
                                        <span className="pointer-events-none absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-gray-400 opacity-0 transition group-hover:opacity-100">
                                            {color.name}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Shirt Size */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-3">
                            <h3 className="text-sm font-semibold text-gray-900">Shirt Size</h3>
                            <div className="flex flex-wrap gap-2.5">
                                {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                                    <button
                                        key={size}
                                        type="button"
                                        onClick={() => setSelectedSize(size)}
                                        className={`flex h-10 w-12 items-center justify-center rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${selectedSize === size
                                            ? 'border-[#443DFF] bg-[#443DFF]/5 text-[#443DFF] scale-105 font-bold'
                                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                            type="button"
                            onClick={handleAddToCart}
                            disabled={isAddingToCart}
                            className="w-full h-14 rounded-full text-base font-semibold bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 shadow-lg hover:shadow-xl shadow-black/10"
                        >
                            {isAddingToCart ? (
                                <>
                                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                                    Preparing Custom Design...
                                </>
                            ) : (
                                'Add Custom Shirt to Cart'
                            )}
                        </button>


                    </div>
                </div>
            </div>
        </div>
    );
}
