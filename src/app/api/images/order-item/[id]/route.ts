import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const url = new URL(request.url);
  const type = url.searchParams.get('type');

  // Fetch the order item with the required binary fields
  const item = await prisma.orderItem.findUnique({
    where: { id },
    select: {
      customLogoData: true,
      customPreviewFrontData: true,
      customPreviewBackData: true,
    },
  });

  if (!item) {
    return NextResponse.json({ error: 'Order item not found' }, { status: 404 });
  }

  let data: Buffer | null = null;
  switch (type) {
    case 'logo':
      data = item.customLogoData ? Buffer.from(item.customLogoData) : null;
      break;
    case 'front':
      data = item.customPreviewFrontData ? Buffer.from(item.customPreviewFrontData) : null;
      break;
    case 'back':
      data = item.customPreviewBackData ? Buffer.from(item.customPreviewBackData) : null;
      break;
    default:
      return NextResponse.json({ error: 'Invalid image type' }, { status: 400 });
  }

  if (!data) {
    return NextResponse.json({ error: 'Image data not available' }, { status: 404 });
  }

  const response = new NextResponse(data as unknown as BodyInit, {
    headers: {
      'Content-Type': 'image/png',
      // Prevent caching issues; you may adjust as needed
      'Cache-Control': 'no-store',
    },
    status: 200,
  });
  return response;
}
