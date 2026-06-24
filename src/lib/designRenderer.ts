interface DesignData {
    logoPreview: string | null;
    logoScale: number;
    logoPosition: { x: number; y: number };
    customText: string;
    fontFamily: string;
    textColor: string;
    textSize: number;
    textPosition: { x: number; y: number };
    shirtColor?: string;
}

const loadCanvasImage = async (src: string): Promise<HTMLImageElement> => {
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

export async function renderDesignToBlob(
    shirtTemplateUrl: string,
    design: DesignData
): Promise<Blob | null> {
    try {
        const canvasSize = 1200;
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) {
            return null;
        }

        canvas.width = canvasSize;
        canvas.height = canvasSize;

        // Draw background shirt template
        const shirtImage = await loadCanvasImage(shirtTemplateUrl);
        const isCustomTemplate = shirtTemplateUrl.includes('shirt-front') || shirtTemplateUrl.includes('shirt-back');
        
        if (isCustomTemplate && design.shirtColor) {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvasSize;
            tempCanvas.height = canvasSize;
            const tempCtx = tempCanvas.getContext('2d');
            if (tempCtx) {
                drawCoveredImage(tempCtx, shirtImage, 0, 0, canvasSize, canvasSize);
                tempCtx.globalCompositeOperation = 'source-in';
                tempCtx.fillStyle = design.shirtColor;
                tempCtx.fillRect(0, 0, canvasSize, canvasSize);
                tempCtx.globalCompositeOperation = 'multiply';
                drawCoveredImage(tempCtx, shirtImage, 0, 0, canvasSize, canvasSize);
                context.drawImage(tempCanvas, 0, 0);
            } else {
                drawCoveredImage(context, shirtImage, 0, 0, canvasSize, canvasSize);
            }
        } else {
            drawCoveredImage(context, shirtImage, 0, 0, canvasSize, canvasSize);
        }

        // Base display values for calculation
        const baseDisplayWidth = 500; // Reference display width
        const scale = canvasSize / baseDisplayWidth;
        const baseOverlayWidth = 208; // Base width from UI (w-52)
        const overlayWidth = baseOverlayWidth * scale;
        const canvasTextSize = design.textSize * scale * 0.7; // Tweak scale relative to display size

        let logoImage: HTMLImageElement | null = null;
        let logoHeight = 0;
        let textHeight = 0;
        let textLines: string[] = [];

        context.font = `700 ${canvasTextSize}px "${design.fontFamily}", sans-serif`;
        context.textAlign = 'center';
        context.textBaseline = 'top';

        // Apply shadow/effects
        context.shadowColor = 'rgba(0, 0, 0, 0.28)';
        context.shadowBlur = 10 * scale;
        context.shadowOffsetY = 2 * scale;

        const logoOverlayWidth = overlayWidth * (design.logoScale / 100);

        if (design.logoPreview) {
            logoImage = await loadCanvasImage(design.logoPreview);
            logoHeight = logoOverlayWidth * (logoImage.naturalHeight / logoImage.naturalWidth);
        }

        if (design.customText.trim()) {
            textLines = getWrappedLines(context, design.customText.trim(), overlayWidth);
            textHeight = textLines.length * canvasTextSize * 1.2;
        }

        if (logoImage) {
            const logoCenterX = canvasSize * (design.logoPosition.x / 100);
            const logoCenterY = canvasSize * (design.logoPosition.y / 100);
            drawContainedImage(context, logoImage, logoCenterX, logoCenterY - logoHeight / 2, logoOverlayWidth);
        }

        if (textLines.length > 0) {
            context.fillStyle = design.textColor;
            context.font = `700 ${canvasTextSize}px "${design.fontFamily}", sans-serif`;
            
            const textCenterX = canvasSize * (design.textPosition.x / 100);
            const textCenterY = canvasSize * (design.textPosition.y / 100);
            const startY = textCenterY - textHeight / 2;

            textLines.forEach((line, index) => {
                context.fillText(
                    line,
                    textCenterX,
                    startY + index * canvasTextSize * 1.2,
                    overlayWidth
                );
            });
        }

        return new Promise<Blob | null>((resolve) => {
            canvas.toBlob((blob) => resolve(blob), 'image/png');
        });
    } catch (error) {
        console.error('Error rendering design to blob:', error);
        return null;
    }
}
