'use client';

import { PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from 'react';
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

type DesignItem = 'logo' | 'text';

interface DesignPosition {
    x: number;
    y: number;
}

interface DragState {
    item: DesignItem;
    offsetX: number;
    offsetY: number;
}

interface ResizeState {
    startClientX: number;
    startClientY: number;
    startWidth: number;
    aspectRatio: number;
    corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
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
    const logoRef = useRef<HTMLDivElement | null>(null);
    const textRef = useRef<HTMLParagraphElement | null>(null);
    const thumbnailListRef = useRef<HTMLDivElement | null>(null);
    const [logoPosition, setLogoPosition] = useState<DesignPosition>({ x: 50, y: 66 });
    const [logoSize, setLogoSize] = useState(32);
    const [textPosition, setTextPosition] = useState<DesignPosition>({ x: 50, y: 76 });
    const [dragState, setDragState] = useState<DragState | null>(null);
    const [resizeState, setResizeState] = useState<ResizeState | null>(null);
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

    const clampPositionInsideImage = (
        clientX: number,
        clientY: number,
        item: DesignItem,
        offsetX: number,
        offsetY: number
    ) => {
        const container = mainImageRef.current;
        const itemElement = item === 'logo' ? logoRef.current : textRef.current;

        if (!container || !itemElement) {
            return null;
        }

        const containerRect = container.getBoundingClientRect();
        const itemRect = itemElement.getBoundingClientRect();
        const halfWidth = itemRect.width / 2;
        const halfHeight = itemRect.height / 2;
        const minX = halfWidth;
        const maxX = containerRect.width - halfWidth;
        const minY = halfHeight;
        const maxY = containerRect.height - halfHeight;
        const nextCenterX = clientX - containerRect.left - offsetX;
        const nextCenterY = clientY - containerRect.top - offsetY;
        const clampedX = Math.max(minX, Math.min(nextCenterX, maxX));
        const clampedY = Math.max(minY, Math.min(nextCenterY, maxY));

        return {
            x: (clampedX / containerRect.width) * 100,
            y: (clampedY / containerRect.height) * 100,
        };
    };

    const updateDesignPosition = (item: DesignItem, position: DesignPosition) => {
        if (item === 'logo') {
            setLogoPosition(position);
            return;
        }

        setTextPosition(position);
    };

    const startDesignDrag = (event: ReactPointerEvent<HTMLElement>, item: DesignItem) => {
        const itemElement = item === 'logo' ? logoRef.current : textRef.current;

        if (!itemElement) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        const itemRect = itemElement.getBoundingClientRect();
        setDragState({
            item,
            offsetX: event.clientX - (itemRect.left + itemRect.width / 2),
            offsetY: event.clientY - (itemRect.top + itemRect.height / 2),
        });
    };

    const startLogoResize = (
        event: ReactPointerEvent<HTMLButtonElement>,
        corner: ResizeState['corner']
    ) => {
        const logoElement = logoRef.current;

        if (!logoElement) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        const logoRect = logoElement.getBoundingClientRect();
        setResizeState({
            startClientX: event.clientX,
            startClientY: event.clientY,
            startWidth: logoRect.width,
            aspectRatio: logoRect.height / logoRect.width || 1,
            corner,
        });
    };

    const getResizeDelta = (event: PointerEvent, state: ResizeState) => {
        const horizontalDelta =
            state.corner.includes('right')
                ? event.clientX - state.startClientX
                : state.startClientX - event.clientX;
        const verticalDelta =
            state.corner.includes('bottom')
                ? event.clientY - state.startClientY
                : state.startClientY - event.clientY;

        return Math.abs(horizontalDelta) > Math.abs(verticalDelta)
            ? horizontalDelta
            : verticalDelta;
    };

    useEffect(() => {
        if (!dragState) {
            return;
        }

        const handlePointerMove = (event: PointerEvent) => {
            const nextPosition = clampPositionInsideImage(
                event.clientX,
                event.clientY,
                dragState.item,
                dragState.offsetX,
                dragState.offsetY
            );

            if (nextPosition) {
                updateDesignPosition(dragState.item, nextPosition);
            }
        };

        const handlePointerUp = () => {
            setDragState(null);
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [dragState]);

    useEffect(() => {
        if (!resizeState) {
            return;
        }

        const handlePointerMove = (event: PointerEvent) => {
            const container = mainImageRef.current;

            if (!container) {
                return;
            }

            const containerRect = container.getBoundingClientRect();
            const centerX = (logoPosition.x / 100) * containerRect.width;
            const centerY = (logoPosition.y / 100) * containerRect.height;
            const maxWidthByX = Math.max(48, Math.min(centerX, containerRect.width - centerX) * 2);
            const maxWidthByY = Math.max(48, (Math.min(centerY, containerRect.height - centerY) * 2) / resizeState.aspectRatio);
            const maxWidth = Math.min(maxWidthByX, maxWidthByY);
            const nextWidth = Math.max(48, Math.min(resizeState.startWidth + getResizeDelta(event, resizeState), maxWidth));

            setLogoSize((nextWidth / containerRect.width) * 100);
        };

        const handlePointerUp = () => {
            setResizeState(null);
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [logoPosition, resizeState]);

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
            const logoOverlayWidth = (logoSize / 100) * canvasSize;
            const textOverlayWidth = 208 * scale;
            const logoCenterX = (logoPosition.x / 100) * canvasSize;
            const logoCenterY = (logoPosition.y / 100) * canvasSize;
            const textCenterX = (textPosition.x / 100) * canvasSize;
            const textCenterY = (textPosition.y / 100) * canvasSize;
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
                logoHeight = logoOverlayWidth * (logoImage.naturalHeight / logoImage.naturalWidth);
            }

            if (customText.trim() && !textError) {
                textLines = getWrappedLines(context, customText.trim(), textOverlayWidth);
                textHeight = textLines.length * canvasTextSize * 1.2;
            }

            context.shadowColor = 'rgba(0, 0, 0, 0.28)';
            context.shadowBlur = 10 * scale;
            context.shadowOffsetY = 2 * scale;

            if (logoImage) {
                drawContainedImage(context, logoImage, logoCenterX, logoCenterY - logoHeight / 2, logoOverlayWidth);
            }

            if (textLines.length > 0) {
                context.fillStyle = textColor;
                context.font = `700 ${canvasTextSize}px "${fontFamily}", sans-serif`;
                textLines.forEach((line, index) => {
                    context.fillText(line, textCenterX, textCenterY - textHeight / 2 + index * canvasTextSize * 1.2, textOverlayWidth);
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

                {logoPreview && (
                    <div
                        ref={logoRef}
                        onPointerDown={(event) => startDesignDrag(event, 'logo')}
                        className="absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-move touch-none select-none rounded-md outline outline-0 transition hover:outline-2 hover:outline-black/30"
                        style={{ left: `${logoPosition.x}%`, top: `${logoPosition.y}%`, width: `${logoSize}%` }}
                        title="Drag logo"
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={logoPreview}
                            alt="Uploaded logo preview"  draggable={false}
                            className="w-full  max-w-full object-contain drop-shadow-md"
                        />
                        {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const).map((corner) => (
                            <button
                                key={corner}
                                type="button"
                                onPointerDown={(event) => startLogoResize(event, corner)}
                                className={cn(
                                    'absolute h-4 w-4 rounded-full border-2 border-white bg-black shadow-md',
                                    corner === 'top-left' && '-left-2 -top-2 cursor-nwse-resize',
                                    corner === 'top-right' && '-right-2 -top-2 cursor-nesw-resize',
                                    corner === 'bottom-left' && '-bottom-2 -left-2 cursor-nesw-resize',
                                    corner === 'bottom-right' && '-bottom-2 -right-2 cursor-nwse-resize'
                                )}
                                aria-label={`Resize logo from ${corner.replace('-', ' ')}`}
                            />
                        ))}
                    </div>
                )}

                {customText.trim() && !textError && (
                    <p
                        ref={textRef}
                        onPointerDown={(event) => startDesignDrag(event, 'text')}
                        className="absolute z-10 w-52 max-w-full -translate-x-1/2 -translate-y-1/2 cursor-move touch-none select-none break-words rounded-md text-center font-bold leading-tight drop-shadow-md outline outline-0 transition hover:outline-2 hover:outline-black/30"
                        style={{
                            color: textColor,
                            fontFamily,
                            fontSize: `${textSize}px`,
                            left: `${textPosition.x}%`,
                            top: `${textPosition.y}%`,
                        }}
                        title="Drag text"
                    >
                        {customText}
                    </p>
                )}
            </div>

        </div>
    );
}
