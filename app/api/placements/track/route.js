import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function POST(request) {
  try {
    const { adId, action } = await request.json();

    if (!adId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const ad = await prisma.placement_ads.findUnique({
      where: { id: adId },
    });

    if (!ad) {
      return NextResponse.json(
        { error: 'Ad not found' },
        { status: 404 }
      );
    }

    if (action === 'click') {
      await prisma.placement_ads.update({
        where: { id: adId },
        data: {
          clicks: {
            increment: 1,
          },
        },
      });
    } else if (action === 'impression') {
      await prisma.placement_ads.update({
        where: { id: adId },
        data: {
          impressions: {
            increment: 1,
          },
        },
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Tracking API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
