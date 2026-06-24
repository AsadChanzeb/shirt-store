import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        // Check if user is logged in
        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const data = await req.formData();
        const file: File | null = data.get('file') as unknown as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate that file is indeed an image
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { error: 'File must be an image' },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Define path in public folder
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        
        // Ensure directory exists
        await fs.mkdir(uploadDir, { recursive: true });

        // Generate unique filename
        const uniqueId = crypto.randomUUID();
        const originalName = file.name || 'image.jpg';
        const fileExt = path.extname(originalName).toLowerCase() || '.jpg';
        const filename = `${uniqueId}${fileExt}`;
        const filePath = path.join(uploadDir, filename);

        // Write file
        await fs.writeFile(filePath, buffer);

        // Public URL reference
        const imageUrl = `/uploads/${filename}`;

        return NextResponse.json({ url: imageUrl });
    } catch (error) {
        console.error('Error during upload:', error);
        return NextResponse.json(
            { error: 'Upload failed' },
            { status: 500 }
        );
    }
}
