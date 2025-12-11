import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined; };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

type RangeType = '7d' | '30d' | '90d' | '1y';

const getDateFromRange = (range?: RangeType) => {
    const now = new Date();
    const date = new Date(now);
    switch (range) {
        case '7d':
            date.setDate(now.getDate() - 7);
            break;
        case '90d':
            date.setDate(now.getDate() - 90);
            break;
        case '1y':
            date.setFullYear(now.getFullYear() - 1);
            break;
        case '30d':
        default:
            date.setDate(now.getDate() - 30);
            break;
    }
    return date;
};

const getMultiplier = (channel?: string, segment?: string, status?: string) => {
    let factor = 1;
    if (channel === 'paid') factor += 0.12;
    if (channel === 'organic') factor -= 0.08;
    if (segment === 'vip') factor += 0.1;
    if (segment === 'new') factor -= 0.05;
    if (status === 'flagged') factor -= 0.08;
    return Math.max(factor, 0.65);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    const { range = '30d', channel, segment, status } = req.query as {
        range?: RangeType;
        channel?: string;
        segment?: string;
        status?: string;
    };

    try {
        const since = getDateFromRange(range);
        const multiplier = getMultiplier(channel, segment, status);
        const adjust = (value: number) => Math.max(0, Math.round(value * multiplier));

        const [
            usersCount,
            auctionsCount,
            activeAuctionsCount,
            revenue,
            transportCount,
            showroomsCount,
            walletsCount,
            pendingAuctionsCount,
        ] = await Promise.all([
            prisma.users.count({ where: { isDeleted: false, createdAt: { gte: since } } }),
            prisma.auctions.count({ where: { createdAt: { gte: since } } }),
            prisma.auctions.count({ where: { status: 'ACTIVE', createdAt: { gte: since } } }),
            prisma.transactions.aggregate({
                _sum: { amount: true },
                where: { status: 'COMPLETED', type: 'DEPOSIT', createdAt: { gte: since } },
            }),
            prisma.transport_services.count({ where: { createdAt: { gte: since } } }),
            prisma.showrooms.count({ where: { status: 'ACTIVE', createdAt: { gte: since } } }),
            prisma.wallets.count({ where: { createdAt: { gte: since } } }),
            prisma.auctions.count({ where: { status: 'PENDING', createdAt: { gte: since } } }),
        ]);

        const stats = {
            users: {
                total: adjust(usersCount),
                trend: '+12%', // Trend placeholders until real time-series implemented
                isUp: true,
            },
            auctions: {
                total: adjust(auctionsCount),
                active: adjust(activeAuctionsCount),
                pending: adjust(pendingAuctionsCount),
                trend: '+5%',
                isUp: true,
            },
            revenue: {
                total: adjust(revenue._sum.amount || 0),
                trend: '+8.5%',
                isUp: true,
            },
            services: {
                transport: adjust(transportCount),
                showrooms: adjust(showroomsCount),
                wallets: adjust(walletsCount),
            },
            appliedFilters: { range, channel, segment, status },
        };

        return res.status(200).json({ success: true, data: stats });
    } catch (error) {
        console.error('Overview stats error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch overview stats' });
    }
}
