import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { adId } = req.body;

  if (!adId) {
    return res.status(400).json({ error: 'Ad ID is required' });
  }

  try {
    await prisma.placement_ads.update({
      where: { id: adId },
      data: { clicks: { increment: 1 } },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Track ad click error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
