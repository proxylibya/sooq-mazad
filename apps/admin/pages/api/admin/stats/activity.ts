import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined; };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        // Fetch recent users and auctions to simulate an activity feed
        const [recentUsers, recentAuctions] = await Promise.all([
            prisma.users.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: { id: true, name: true, createdAt: true }
            }),
            prisma.auctions.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: { id: true, title: true, status: true, createdAt: true }
            })
        ]);

        const activity = [
            ...recentUsers.map(u => ({
                id: u.id,
                type: 'USER_REGISTER',
                message: `New user registered: ${u.name}`,
                timestamp: u.createdAt
            })),
            ...recentAuctions.map(a => ({
                id: a.id,
                type: 'AUCTION_CREATE',
                message: `New auction created: ${a.title}`,
                timestamp: a.createdAt
            }))
        ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 10);

        return res.status(200).json({ success: true, data: activity });
    } catch (error) {
        console.error('Activity stats error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch activity' });
    }
}
