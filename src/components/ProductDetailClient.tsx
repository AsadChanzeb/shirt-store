'use client';

import { ChangeEvent, MouseEvent as ReactMouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Type, Upload, X } from 'lucide-react';
import AddToCartButton from '@/components/AddToCartButton';
import ProductGallery from '@/components/ProductGallery';
import { cn } from '@/lib/utils';
import Input from './ui/Input';

interface ProductImage {
    id: string;
    imageUrl: string;
    color?: string | null;
}

interface ProductVariant {
    id: string;
    size: string;
    color: string;
    stock: number;
}

interface ProductDetailClientProps {
    productId: string;
    name: string;
    description: string;
    finalPrice: number;
    originalPrice: number;
    discount: number;
    images: ProductImage[];
    variants: ProductVariant[];
}

const colorMap: Record<string, string> = {
    black: '#111827',
    white: '#ffffff',
    blue: '#2563eb',
    navy: '#1e3a8a',
    'navy blue': '#1e3a8a',
    red: '#dc2626',
    green: '#16a34a',
    yellow: '#eab308',
    orange: '#f97316',
    purple: '#9333ea',
    pink: '#db2777',
    gray: '#6b7280',
    grey: '#6b7280',
    brown: '#92400e',
};

const allowedImageTypes = ['image/png', 'image/jpeg', 'image/webp'];
const maxImageSize = 2 * 1024 * 1024;
const maxTextLength = 40;
const safeTextRegex = /^[a-zA-Z0-9\s.,!?&'-]*$/;

const fontOptions = [
    'Arial',
    'Arial Black',
    'Abril Fatface',
    'Acme',
    'Aladin',
    'Amatic SC',
    'Anton',
    'Architects Daughter',
    'Arizonia',
    'Asset',
    'Astloch',
    'Atma',
    'Audiowide',
    'Baloo 2',
    'Bangers',
    'Barriecito',
    'Barrio',
    'Bebas Neue',
    'Berkshire Swash',
    'Big Shoulders Stencil Text',
    'Black Ops One',
    'Bonbon',
    'Boogaloo',
    'Brush Script MT',
    'Bubblegum Sans',
    'Bungee',
    'Bungee Inline',
    'Bungee Shade',
    'Butcherman',
    'Cabin Sketch',
    'Caesar Dressing',
    'Carter One',
    'Caveat',
    'Changa One',
    'Charm',
    'Chewy',
    'Cinzel Decorative',
    'Codystar',
    'Comic Neue',
    'Cookie',
    'Courier New',
    'Courgette',
    'Crafty Girls',
    'Creepster',
    'Dancing Script',
    'Eater',
    'Emilys Candy',
    'Erica One',
    'Fascinate Inline',
    'Faster One',
    'Finger Paint',
    'Fontdiner Swanky',
    'Fredericka the Great',
    'Frijole',
    'Georgia',
    'Gloria Hallelujah',
    'Gochi Hand',
    'Grand Hotel',
    'Great Vibes',
    'Griffy',
    'Hanalei',
    'Henny Penny',
    'Homemade Apple',
    'Impact',
    'Indie Flower',
    'Irish Grover',
    'Jolly Lodger',
    'Joti One',
    'Kalam',
    'Kavoon',
    'Kaushan Script',
    'Kirang Haerang',
    'Lacquer',
    'Lemon',
    'Limelight',
    'Lobster',
    'Londrina Outline',
    'Love Ya Like A Sister',
    'Luckiest Guy',
    'Macondo',
    'Metal Mania',
    'Modak',
    'Monoton',
    'Mountains of Christmas',
    'Mystery Quest',
    'Neonderthaw',
    'Nosifer',
    'Oleo Script',
    'Orbitron',
    'Over the Rainbow',
    'Pacifico',
    'Passion One',
    'Pattaya',
    'Permanent Marker',
    'Piedra',
    'Pirata One',
    'Playball',
    'Poiret One',
    'Press Start 2P',
    'Princess Sofia',
    'Rakkas',
    'Rampart One',
    'Ribeye Marrow',
    'Righteous',
    'Rock Salt',
    'Rubik Bubbles',
    'Rubik Dirt',
    'Rubik Doodle Shadow',
    'Rubik Gemstones',
    'Rubik Glitch',
    'Rubik Iso',
    'Rubik Marker Hatch',
    'Rubik Maze',
    'Rubik Moonrocks',
    'Rye',
    'Sacramento',
    'Sancreek',
    'Satisfy',
    'Sedgwick Ave Display',
    'Shadows Into Light',
    'Shojumaru',
    'Shrikhand',
    'Silkscreen',
    'Slackey',
    'Smokum',
    'Sofadi One',
    'Sofia',
    'Sonsie One',
    'Special Elite',
    'Spicy Rice',
    'Splash',
    'Staatliches',
    'Times New Roman',
    'Trade Winds',
    'Trebuchet MS',
    'Lucida Console',
    'Ultra',
    'UnifrakturCook',
    'UnifrakturMaguntia',
    'Vampiro One',
    'Vast Shadow',
    'Verdana',
    'Walter Turncoat',
    'Yesteryear',
    'Zen Tokyo Zoo',
    'Zeyada',
];

const textColors = [
    '#111827',
    '#ffffff',
    '#ef4444',
    '#2563eb',
    '#16a34a',
    '#f97316',
    '#eab308',
    '#a855f7',
    '#ec4899',
    '#14b8a6',
];

const standardTextSizes = [
    { label: 'Small', value: 32 },
    { label: 'Medium', value: 40 },
    { label: 'Standard', value: 48 },
    { label: 'Large', value: 56 },
    { label: 'Extra Large', value: 64 },
];

function normalizeColor(color: string) {
    return color.trim().toLowerCase();
}

function findImageForColor(color: string, images: ProductImage[], colorIndex: number) {
    const normalizedColor = normalizeColor(color);
    const colorWords = normalizedColor.split(/\s+/);
    const matchedColorImage = images.find((image) => {
        return image.color && normalizeColor(image.color) === normalizedColor;
    });

    if (matchedColorImage) {
        return matchedColorImage.imageUrl;
    }

    const matchedImage = images.find((image) => {
        const imageUrl = image.imageUrl.toLowerCase();

        return (
            imageUrl.includes(normalizedColor.replace(/\s+/g, '-')) ||
            imageUrl.includes(normalizedColor.replace(/\s+/g, '')) ||
            colorWords.some((word) => imageUrl.includes(word))
        );
    });

    return matchedImage?.imageUrl || images[colorIndex % images.length]?.imageUrl || '/placeholder.jpg';
}

export default function ProductDetailClient({
    productId,
    name,
    description,
    finalPrice,
    originalPrice,
    discount,
    images,
    variants,
}: ProductDetailClientProps) {
    const initialColor = variants[0]?.color || '';
    const initialImage = initialColor
        ? findImageForColor(initialColor, images, 0)
        : images[0]?.imageUrl || '/placeholder.jpg';
    const [selectedImage, setSelectedImage] = useState(initialImage);
    const [selectedColor, setSelectedColor] = useState(initialColor);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [customText, setCustomText] = useState('');
    const [fontFamily, setFontFamily] = useState(fontOptions[0]);
    const [fontSearch, setFontSearch] = useState('');
    const [textSizeMode, setTextSizeMode] = useState('48');
    const [customTextSize, setCustomTextSize] = useState('48');
    const [textColor, setTextColor] = useState(textColors[0]);
    const [uploadError, setUploadError] = useState('');
    const [isTextStyleOpen, setIsTextStyleOpen] = useState(false);
    const [isTextStyleDragging, setIsTextStyleDragging] = useState(false);
    const [textStylePosition, setTextStylePosition] = useState<{ x: number; y: number } | null>(null);
    const [logoFileName, setLogoFileName] = useState('');
    const logoInputRef = useRef<HTMLInputElement | null>(null);
    const textStylePanelRef = useRef<HTMLDivElement | null>(null);
    const textStyleDragOffsetRef = useRef({ x: 0, y: 0 });
    const allowLogoReplacementRef = useRef(false);

    const colorOptions = useMemo(() => {
        return Array.from(new Set(variants.map((variant) => variant.color).filter(Boolean)));
    }, [variants]);

    const textError = useMemo(() => {
        if (customText.length > maxTextLength) {
            return `Text must be ${maxTextLength} characters or less`;
        }

        if (!safeTextRegex.test(customText)) {
            return "Use letters, numbers, spaces, and basic punctuation only";
        }

        return '';
    }, [customText]);

    const filteredFontOptions = useMemo(() => {
        const normalizedSearch = fontSearch.trim().toLowerCase();

        if (!normalizedSearch) {
            return fontOptions;
        }

        return fontOptions.filter((font) => font.toLowerCase().includes(normalizedSearch));
    }, [fontSearch]);

    const textSize = useMemo(() => {
        const rawSize = textSizeMode === 'custom' ? customTextSize : textSizeMode;
        const numericSize = Number(rawSize);

        if (!Number.isFinite(numericSize)) {
            return 48;
        }

        return Math.max(16, Math.min(numericSize, 96));
    }, [customTextSize, textSizeMode]);

    useEffect(() => {
        return () => {
            if (logoPreview) {
                URL.revokeObjectURL(logoPreview);
            }
        };
    }, [logoPreview]);

    const removeLogo = () => {
        if (logoPreview) {
            URL.revokeObjectURL(logoPreview);
            setLogoPreview(null);
        }

        setLogoFileName('');
    };

    const handleLogoInputClick = (event: ReactMouseEvent<HTMLInputElement>) => {
        if (!logoPreview || allowLogoReplacementRef.current) {
            allowLogoReplacementRef.current = false;
            return;
        }

        event.preventDefault();

        const shouldReplace = window.confirm(
            'A logo is already added to this shirt. Do you want to remove it and upload a new one?'
        );

        if (!shouldReplace) {
            return;
        }

        removeLogo();
        setUploadError('');
        event.currentTarget.value = '';
        allowLogoReplacementRef.current = true;
        window.setTimeout(() => logoInputRef.current?.click(), 0);
    };

    const handleLogoUpload = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        setUploadError('');

        if (!file) {
            return;
        }

        if (!allowedImageTypes.includes(file.type)) {
            setUploadError('Only PNG, JPG, and WEBP images are allowed');
            event.target.value = '';
            return;
        }

        if (file.size > maxImageSize) {
            setUploadError('Logo image must be less than 2MB');
            event.target.value = '';
            return;
        }

        removeLogo();
        setLogoFileName(file.name);
        setLogoPreview(URL.createObjectURL(file));
    };

    useEffect(() => {
        if (!isTextStyleDragging) {
            return;
        }

        const handleDragMove = (event: MouseEvent) => {
            const panel = textStylePanelRef.current;
            const panelWidth = panel?.offsetWidth || 320;
            const panelHeight = panel?.offsetHeight || 260;
            const maxX = window.innerWidth - panelWidth - 12;
            const maxY = window.innerHeight - panelHeight - 12;

            setTextStylePosition({
                x: Math.max(12, Math.min(event.clientX - textStyleDragOffsetRef.current.x, maxX)),
                y: Math.max(12, Math.min(event.clientY - textStyleDragOffsetRef.current.y, maxY)),
            });
        };

        const handleDragEnd = () => {
            setIsTextStyleDragging(false);
        };

        window.addEventListener('mousemove', handleDragMove);
        window.addEventListener('mouseup', handleDragEnd);

        return () => {
            window.removeEventListener('mousemove', handleDragMove);
            window.removeEventListener('mouseup', handleDragEnd);
        };
    }, [isTextStyleDragging]);

    const startTextStyleDrag = (event: ReactMouseEvent<HTMLDivElement>) => {
        const panel = textStylePanelRef.current;

        if (!panel) {
            return;
        }

        const rect = panel.getBoundingClientRect();
        textStyleDragOffsetRef.current = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        };
        setTextStylePosition({ x: rect.left, y: rect.top });
        setIsTextStyleDragging(true);
    };

    return (
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14">
            <div className="relative lg:col-span-6">
                <ProductGallery
                    images={images}
                    selectedImage={selectedImage}
                    onImageSelect={setSelectedImage}
                    logoPreview={logoPreview}
                    customText={customText}
                    fontFamily={fontFamily}
                    textColor={textColor}
                    textSize={textSize}
                    textError={textError}
                />

                <div className="mt-4 border-t border-gray-100 pt-4">
                    <p className="mb-3 text-sm font-medium uppercase tracking-wider text-gray-500">
                        Add Design
                    </p>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                                <Upload className="h-4 w-4" aria-hidden="true" />
                                Logo or design image
                            </label>
                            <div className="flex min-w-0 overflow-hidden rounded-md border border-gray-300 bg-white focus-within:ring-2 focus-within:ring-black">
                                <button
                                    type="button"
                                    onClick={() => logoInputRef.current?.click()}
                                    className="inline-flex h-11 flex-shrink-0 items-center gap-2 bg-black px-4 text-sm font-semibold text-white transition hover:bg-gray-800"
                                >
                                    <Upload className="h-4 w-4" aria-hidden="true" />
                                    Upload
                                </button>
                                <span className="flex h-11 min-w-0 flex-1 items-center truncate px-3 text-sm text-gray-600">
                                    {logoFileName || 'No image selected'}
                                </span>
                                <input
                                    ref={logoInputRef}
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    onClick={handleLogoInputClick}
                                    onChange={handleLogoUpload}
                                    className="sr-only"
                                />
                            </div>

                            {logoPreview && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        removeLogo();
                                        setUploadError('');
                                    }}
                                    className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-black"
                                >
                                    <X className="h-4 w-4" aria-hidden="true" />
                                    Remove logo
                                </button>
                            )}

                            {uploadError && (
                                <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
                                    {uploadError}
                                </p>
                            )}
                        </div>

                        <Input
                            label="Custom text"
                            value={customText}
                            maxLength={maxTextLength}
                            onChange={(event) => setCustomText(event.target.value)}
                            onClick={() => setIsTextStyleOpen(true)}
                            onFocus={() => setIsTextStyleOpen(true)}
                            placeholder="Type your shirt text"
                            error={textError}
                        />
                    </div>

                    {isTextStyleOpen && (
                        <div
                            ref={textStylePanelRef}
                            className={cn(
                                'z-30 mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-xl lg:w-80',
                                textStylePosition
                                    ? 'fixed'
                                    : 'lg:absolute lg:left-[calc(100%+1rem)] lg:top-0 lg:mt-0'
                            )}
                            style={
                                textStylePosition
                                    ? { left: textStylePosition.x, top: textStylePosition.y }
                                    : undefined
                            }
                        >
                            <div
                                onMouseDown={startTextStyleDrag}
                                className="mb-4 flex cursor-move select-none items-center justify-between gap-3"
                            >
                                <p className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                                    <Type className="h-4 w-4" aria-hidden="true" />
                                    Text style
                                </p>
                                <button
                                    type="button"
                                    onMouseDown={(event) => event.stopPropagation()}
                                    onClick={() => setIsTextStyleOpen(false)}
                                    className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-black"
                                    aria-label="Close text style panel"
                                >
                                    <X className="h-4 w-4" aria-hidden="true" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Font style
                                    </label>
                                    <input
                                        type="search"
                                        value={fontSearch}
                                        onChange={(event) => setFontSearch(event.target.value)}
                                        placeholder="Search font style"
                                        className="mb-2 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
                                    />
                                    <div className="max-h-48 overflow-y-auto rounded-md border border-gray-200 bg-white">
                                        {filteredFontOptions.length > 0 ? (
                                            filteredFontOptions.map((font) => (
                                                <button
                                                    key={font}
                                                    type="button"
                                                    onClick={() => {
                                                        setFontFamily(font);
                                                        setFontSearch('');
                                                    }}
                                                    className={cn(
                                                        'flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition hover:bg-gray-50',
                                                        fontFamily === font && 'bg-black text-white hover:bg-black'
                                                    )}
                                                    style={{ fontFamily: font }}
                                                >
                                                    <span className="truncate">{font}</span>
                                                    {fontFamily === font && (
                                                        <span className="font-sans text-xs font-semibold">Selected</span>
                                                    )}
                                                </button>
                                            ))
                                        ) : (
                                            <p className="px-3 py-3 text-sm text-gray-500">
                                                No font found
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Font size
                                    </label>
                                    <div className="grid grid-cols-[1fr_auto] gap-2">
                                        <select
                                            value={textSizeMode}
                                            onChange={(event) => setTextSizeMode(event.target.value)}
                                            className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
                                        >
                                            {standardTextSizes.map((size) => (
                                                <option key={size.value} value={String(size.value)}>
                                                    {size.label} ({size.value}px)
                                                </option>
                                            ))}
                                            <option value="custom">Other</option>
                                        </select>
                                        <span className="flex h-10 min-w-14 items-center justify-center rounded-md bg-gray-100 px-3 text-sm font-medium text-gray-700">
                                            {textSize}px
                                        </span>
                                    </div>

                                    {textSizeMode === 'custom' && (
                                        <input
                                            type="number"
                                            min={16}
                                            max={96}
                                            value={customTextSize}
                                            onChange={(event) => setCustomTextSize(event.target.value)}
                                            placeholder="Enter size"
                                            className="mt-2 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
                                        />
                                    )}
                                </div>

                                <div>
                                    <div className="mb-2 flex items-center justify-between gap-3">
                                        <label className="text-sm font-medium text-gray-700">
                                            Text color
                                        </label>
                                        <input
                                            type="color"
                                            value={textColor}
                                            onChange={(event) => setTextColor(event.target.value)}
                                            className="h-9 w-12 cursor-pointer rounded-md border border-gray-200 bg-white p-1"
                                            aria-label="Choose text color"
                                        />
                                    </div>
                                    <div className="grid grid-cols-5 gap-2">
                                        {textColors.map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setTextColor(color)}
                                                className={cn(
                                                    'h-8 rounded-full border transition-all',
                                                    textColor === color
                                                        ? 'border-black ring-2 ring-black ring-offset-2'
                                                        : 'border-gray-200 hover:scale-105'
                                                )}
                                                style={{ backgroundColor: color }}
                                                aria-label={`Choose text color ${color}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="lg:col-span-5 gap-0 flex flex-col justify-start">
                <div className="mb-6">
                    <h1 className="text-4xl lg:text-4xl font-bold tracking-tight text-gray-900 mb-4">
                        {name}
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className="text-2xl font-medium text-black">
                            ${finalPrice.toFixed(2)}
                        </span>
                        {discount > 0 && (
                            <>
                                <span className="text-xl text-gray-400 line-through">
                                    ${originalPrice.toFixed(2)}
                                </span>
                                <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-sm font-bold">
                                    -{discount}% OFF
                                </span>
                            </>
                        )}
                    </div>
                </div>

                <div className="mb-6 space-y-2 border-y border-gray-100 py-5">
                    {colorOptions.length > 0 && (
                        <div>
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <label className="text-sm font-medium uppercase tracking-wider text-gray-500">
                                    Select Color
                                </label>
                                {selectedColor && (
                                    <span className="text-sm font-medium text-gray-900">{selectedColor}</span>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {colorOptions.map((color, index) => {
                                    const normalizedColor = normalizeColor(color);
                                    const swatchColor = colorMap[normalizedColor] || '#e5e7eb';
                                    const isWhite = normalizedColor === 'white';

                                    return (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => {
                                                setSelectedColor(color);
                                                setSelectedImage(findImageForColor(color, images, index));
                                            }}
                                            className={cn(
                                                'group flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition-all',
                                                selectedColor === color
                                                    ? 'border-black bg-black text-white shadow-sm'
                                                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                                            )}
                                            aria-label={`Show ${color} shirt`}
                                        >
                                            <span
                                                className={cn(
                                                    'h-5 w-5 rounded-full border',
                                                    isWhite ? 'border-gray-300' : 'border-transparent'
                                                )}
                                                style={{ backgroundColor: swatchColor }}
                                            />
                                            {color}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                </div>

                <div className="mb-8">
                    <AddToCartButton
                        productId={productId}
                        variants={variants}
                        description={description}
                    />
                </div>

                <div className="space-y-4 border-t border-gray-100 pt-8">
                    <details className="group">
                        <summary className="flex justify-between items-center cursor-pointer list-none font-medium text-gray-900">
                            Product Description
                            <span className="transition group-open:rotate-180">
                                <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                            </span>
                        </summary>
                        <div className="text-gray-600 mt-4 text-sm leading-relaxed">
                            {description}
                        </div>
                    </details>
                    <details className="group">
                        <summary className="flex justify-between items-center cursor-pointer list-none font-medium text-gray-900">
                            Fabric & Care
                            <span className="transition group-open:rotate-180">
                                <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                            </span>
                        </summary>
                        <div className="text-gray-600 mt-4 text-sm leading-relaxed">
                            Premium cotton blend. Machine wash cold with like colors. Tumble dry low. Do not bleach.
                        </div>
                    </details>
                </div>
            </div>
        </div>
    );
}
