'use client';

import { useRef } from 'react';
import { ChevronDown, ChevronUp, Download } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ProductImage {
    id: string;
    imageUrl: string;
}

interface ProductGalleryProps {
    images: ProductImage[];
    selectedImage?: string;
    onImageSelect?: (imageUrl: string) => void;
    logoPreview?: string | null;
    customText?: string;
    fontFamily?: string;
    textColor?: string;
    textSize?: number;
    textError?: string;
}

export default function ProductGallery({
    images,
    selectedImage,
    onImageSelect,
    logoPreview = null,
    customText = '',
    fontFamily = 'Arial',
    textColor = '#111827',
    textSize = 48,
    textError = '',
}: ProductGalleryProps) {
    const activeImage = selectedImage || images[0]?.imageUrl || '/placeholder.jpg';
    const mainImageRef = useRef<HTMLDivElement | null>(null);
    const thumbnailListRef = useRef<HTMLDivElement | null>(null);
    const showThumbnailSlider = images.length > 4;

    const scrollThumbnails = (direction: 'up' | 'down') => {
        thumbnailListRef.current?.scrollBy({
            top: direction === 'down' ? 112 : -112,
            behavior: 'smooth',
        });
    };

    const loadCanvasImage = async (src: string) => {
        const image = document.createElement('img');
        image.decoding = 'async';

        if (src.startsWith('blob:') || src.startsWith('data:')) {
            image.src = src;
        } else {
            try {
                const response = await fetch(src);
                const blob = await response.blob();
                image.src = URL.createObjectURL(blob);
            } catch {
                image.crossOrigin = 'anonymous';
                image.src = src;
            }
        }

        await new Promise<void>((resolve, reject) => {
            image.onload = () => resolve();
            image.onerror = () => reject(new Error('Image could not be loaded'));
        });

        return image;
    };

    const drawCoveredImage = (
        context: CanvasRenderingContext2D,
        image: HTMLImageElement,
        x: number,
        y: number,
        width: number,
        height: number
    ) => {
        const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
        const sourceWidth = width / scale;
        const sourceHeight = height / scale;
        const sourceX = (image.naturalWidth - sourceWidth) / 2;
        const sourceY = (image.naturalHeight - sourceHeight) / 2;

        context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
    };

    const drawContainedImage = (
        context: CanvasRenderingContext2D,
        image: HTMLImageElement,
        centerX: number,
        y: number,
        maxWidth: number
    ) => {
        const width = maxWidth;
        const height = width * (image.naturalHeight / image.naturalWidth);
        context.drawImage(image, centerX - width / 2, y, width, height);

        return height;
    };

    const getWrappedLines = (
        context: CanvasRenderingContext2D,
        text: string,
        maxWidth: number
    ) => {
        const lines: string[] = [];
        const words = text.split(/\s+/).filter(Boolean);
        let currentLine = '';

        words.forEach((word) => {
            const testLine = currentLine ? `${currentLine} ${word}` : word;

            if (context.measureText(testLine).width <= maxWidth) {
                currentLine = testLine;
                return;
            }

            if (currentLine) {
                lines.push(currentLine);
            }

            if (context.measureText(word).width <= maxWidth) {
                currentLine = word;
                return;
            }

            let chunk = '';
            Array.from(word).forEach((letter) => {
                const testChunk = `${chunk}${letter}`;

                if (context.measureText(testChunk).width <= maxWidth) {
                    chunk = testChunk;
                    return;
                }

                if (chunk) {
                    lines.push(chunk);
                }
                chunk = letter;
            });
            currentLine = chunk;
        });

        if (currentLine) {
            lines.push(currentLine);
        }

        return lines;
    };

    const handleDownloadDesign = async () => {
        try {
            const canvasSize = 1200;
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            if (!context) {
                return;
            }

            canvas.width = canvasSize;
            canvas.height = canvasSize;

            const productImage = await loadCanvasImage(activeImage);
            drawCoveredImage(context, productImage, 0, 0, canvasSize, canvasSize);

            const displayWidth = mainImageRef.current?.clientWidth || canvasSize;
            const scale = canvasSize / displayWidth;
            const overlayWidth = 208 * scale;
            const overlayCenterX = canvasSize / 2;
            const overlayCenterY = canvasSize * 0.7;
            const overlayGap = 8 * scale;
            const canvasTextSize = textSize * scale;
            let logoImage: HTMLImageElement | null = null;
            let logoHeight = 0;
            let textHeight = 0;
            let textLines: string[] = [];

            context.font = `700 ${canvasTextSize}px "${fontFamily}", sans-serif`;
            context.textAlign = 'center';
            context.textBaseline = 'top';

            if (logoPreview) {
                logoImage = await loadCanvasImage(logoPreview);
                logoHeight = overlayWidth * (logoImage.naturalHeight / logoImage.naturalWidth);
            }

            if (customText.trim() && !textError) {
                textLines = getWrappedLines(context, customText.trim(), overlayWidth);
                textHeight = textLines.length * canvasTextSize * 1.2;
            }

            const totalHeight =
                logoHeight +
                textHeight +
                (logoHeight > 0 && textHeight > 0 ? overlayGap : 0);
            let currentY = overlayCenterY - totalHeight / 2;

            context.shadowColor = 'rgba(0, 0, 0, 0.28)';
            context.shadowBlur = 10 * scale;
            context.shadowOffsetY = 2 * scale;

            if (logoImage) {
                drawContainedImage(context, logoImage, overlayCenterX, currentY, overlayWidth);
                currentY += logoHeight + (textHeight > 0 ? overlayGap : 0);
            }

            if (textLines.length > 0) {
                context.fillStyle = textColor;
                context.font = `700 ${canvasTextSize}px "${fontFamily}", sans-serif`;
                textLines.forEach((line, index) => {
                    context.fillText(line, overlayCenterX, currentY + index * canvasTextSize * 1.2, overlayWidth);
                });
            }

            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = 'shirt-design.png';
            link.click();
        } catch {
            alert('Unable to download this design. Please try another image.');
        }
    };

    if (!images || images.length === 0) {
        return (
            <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden">
                <Image
                    src="/placeholder.jpg"
                    alt="Product Placeholder"
                    fill
                    className="object-cover"
                />
            </div>
        );
    }

    return (
        <div className="flex items-start gap-4">
            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="flex w-20 flex-shrink-0 flex-col items-center gap-2 sm:w-24">
                    {showThumbnailSlider && (
                        <button
                            type="button"
                            onClick={() => scrollThumbnails('up')}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:border-gray-400 hover:text-black"
                            aria-label="Show previous product images"
                        >
                            <ChevronUp className="h-4 w-4" aria-hidden="true" />
                        </button>
                    )}

                    <div
                        ref={thumbnailListRef}
                        className="flex max-h-[22rem] flex-col gap-3 overflow-y-auto scroll-smooth pr-1 scrollbar-hide sm:max-h-[28rem] sm:gap-4"
                    >
                        {images.map((image) => (
                            <button
                                key={image.id}
                                type="button"
                                onClick={() => onImageSelect?.(image.imageUrl)}
                                className={cn(
                                    "relative h-20 w-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-200 sm:h-24 sm:w-24",
                                    activeImage === image.imageUrl
                                        ? "border-black scale-95"
                                        : "border-transparent opacity-70 hover:opacity-100"
                                )}
                            >
                                <Image
                                    src={image.imageUrl}
                                    alt="Thumbnail"
                                    fill
                                    className="object-cover"
                                />
                            </button>
                        ))}
                    </div>

                    {showThumbnailSlider && (
                        <button
                            type="button"
                            onClick={() => scrollThumbnails('down')}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:border-gray-400 hover:text-black"
                            aria-label="Show more product images"
                        >
                            <ChevronDown className="h-4 w-4" aria-hidden="true" />
                        </button>
                    )}
                </div>
            )}

            {/* Main Image */}
            <div ref={mainImageRef} className="relative aspect-square flex-1 bg-gray-100 rounded-3xl overflow-hidden group">
                <Image
                    src={activeImage}
                    draggable={false}
                    alt="Product Image"
                    fill
                    priority
                    className="object-cover transition-transform duration-500 "
                />

                <button
                    type="button"
                    onClick={handleDownloadDesign}
                    className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-md backdrop-blur transition hover:bg-white hover:scale-105"
                    aria-label="Download shirt design"
                    title="Download shirt design"
                >
                    <Download className="h-5 w-5" aria-hidden="true" />
                </button>

                <div className="absolute left-1/2 top-[70%] z-10 flex w-52 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2">
                    {logoPreview && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={logoPreview}
                            alt="Uploaded logo preview"  draggable={false}
                            className="w-full  max-w-full object-contain drop-shadow-md"
                        />
                    )}

                    {customText.trim() && !textError && (
                        <p
                            className="max-w-full break-words text-center font-bold leading-tight drop-shadow-md"
                            style={{ color: textColor, fontFamily, fontSize: `${textSize}px` }}
                        >
                            {customText}
                        </p>
                    )}
                </div>
            </div>

        </div>
    );
}
