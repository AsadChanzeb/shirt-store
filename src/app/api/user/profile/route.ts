import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const user = await prisma.user.findUnique({
            where: { id: (session.user as any).id },
        });
        
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        
        return NextResponse.json({ hasPassword: !!user.password });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, currentPassword, newPassword } = await req.json();

        const user = await prisma.user.findUnique({
            where: { id: (session.user as any).id },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const updateData: any = { name };

        // Handle password update if provided
        if (newPassword) {
            if (user.password) {
                // If user already has a password, verify the current one
                if (!currentPassword) {
                    return NextResponse.json({ error: 'Current password is required to set a new password' }, { status: 400 });
                }
                const isValid = await bcrypt.compare(currentPassword, user.password);
                if (!isValid) {
                    return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
                }
            }
            
            // Hash the new password
            updateData.password = await bcrypt.hash(newPassword, 10);
        }

        await prisma.user.update({
            where: { id: user.id },
            data: updateData,
        });

        return NextResponse.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}
