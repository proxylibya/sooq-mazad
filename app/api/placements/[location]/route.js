import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function GET(request, { params }) {
  try {
    const { location } = params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 10;

    const placements = await prisma.ad_placements.findMany({
      where: {
        location: location.toUpperCase(),
        isActive: true,
        status: 'ACTIVE',
        OR: [
          { startDate: null },
          { startDate: { lte: new Date() } },
        ],
        AND: [
          {
            OR: [
              { endDate: null },
              { endDate: { gte: new Date() } },
            ],
          },
        ],
      },
      include: {
        ads: {
          where: {
            isActive: true,
            OR: [
              { startDate: null },
              { startDate: { lte: new Date() } },
            ],
            AND: [
              {
                OR: [
                  { endDate: null },
                  { endDate: { gte: new Date() } },
                ],
              },
            ],
          },
          orderBy: { priority: 'desc' },
          take: limit,
        },
      },
      orderBy: { displayOrder: 'asc' },
    });

    const result = placements.map((placement) => ({
      id: placement.id,
      name: placement.name,
      location: placement.location,
      type: placement.type,
      autoRotate: placement.autoRotate,
      rotateInterval: placement.rotateInterval,
      width: placement.width,
      height: placement.height,
      ads: placement.ads.map((ad) => ({
        id: ad.id,
        entityType: ad.entityType,
        entityId: ad.entityId,
        title: ad.title,
        description: ad.description,
        imageUrl: ad.imageUrl,
        priority: ad.priority,
      })),
    }));

    return NextResponse.json({ placements: result });
  } catch (error) {
    console.error('Placements API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
