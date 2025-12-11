import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined; };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

type RangeType = '7d' | '30d' | '90d' | '1y';
type ChartType = 'revenue' | 'users' | 'auctions';

const getRangeConfig = (range?: string) => {
    switch (range as RangeType) {
        case '7d':
            return { points: 7, mode: 'daily' as const };
        case '90d':
            return { points: 90, mode: 'daily' as const };
        case '1y':
            return { points: 12, mode: 'monthly' as const };
        case '30d':
        default:
            return { points: 30, mode: 'daily' as const };
    }
};

const formatLabel = (date: Date, mode: 'daily' | 'monthly') => {
    if (mode === 'monthly') {
        return date.toLocaleDateString('en-US', { month: 'short' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getMultiplier = (channel?: string, segment?: string, status?: string) => {
    let factor = 1;
    if (channel === 'paid') factor += 0.12;
    if (channel === 'organic') factor -= 0.08;
    if (channel === 'direct') factor += 0.05;
    if (segment === 'vip') factor += 0.1;
    if (segment === 'new') factor -= 0.05;
    if (segment === 'returning') factor += 0.04;
    if (status === 'flagged') factor -= 0.08;

    return Math.max(factor, 0.65);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    const { type = 'revenue', range = '30d', channel, segment, status } = req.query as {
        type?: ChartType;
        range?: RangeType;
        channel?: string;
        segment?: string;
        status?: string;
    };

    try {
        const { points, mode } = getRangeConfig(range);
        const data = [];
        const now = new Date();
        const multiplier = getMultiplier(channel, segment, status);
        const adjust = (value: number) => Math.max(0, Math.round(value * multiplier));

        if (mode === 'monthly') {
            for (let i = points - 1; i >= 0; i--) {
                const date = new Date(now);
                date.setMonth(now.getMonth() - i);

                if (type === 'revenue') {
                    const base = 25000 + Math.random() * 10000;
                    data.push({
                        date: formatLabel(date, mode),
                        iso: date.toISOString(),
                        amount: adjust(base + Math.random() * 12000),
                        orders: adjust(200 + Math.random() * 160),
                        profit: adjust(base * 0.28 + Math.random() * 5000),
                    });
                } else if (type === 'users') {
                    const newUsers = Math.round(1200 + Math.random() * 600);
                    data.push({
                        date: formatLabel(date, mode),
                        iso: date.toISOString(),
                        users: adjust(newUsers),
                        active: adjust(newUsers * 0.65 + Math.random() * 50),
                        retention: Math.min(95, 55 + Math.random() * 10),
                    });
                } else {
                    const created = Math.round(160 + Math.random() * 80);
                    data.push({
                        date: formatLabel(date, mode),
                        iso: date.toISOString(),
                        created: adjust(created),
                        completed: adjust(created * 0.72 + Math.random() * 20),
                        cancelled: adjust(created * 0.08 + Math.random() * 10),
                        avgBid: adjust(750 + Math.random() * 180),
                    });
                }
            }
        } else {
            for (let i = points - 1; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(now.getDate() - i);

                if (type === 'revenue') {
                    const base = 4000 + Math.random() * 2000;
                    data.push({
                        date: formatLabel(date, mode),
                        iso: date.toISOString(),
                        amount: adjust(base + Math.random() * 1500),
                        orders: adjust(50 + Math.random() * 35),
                        profit: adjust(base * 0.27 + Math.random() * 300),
                    });
                } else if (type === 'users') {
                    const newUsers = Math.round(40 + Math.random() * 35);
                    data.push({
                        date: formatLabel(date, mode),
                        iso: date.toISOString(),
                        users: adjust(newUsers),
                        active: adjust(newUsers * 0.7 + Math.random() * 10),
                        retention: Math.min(98, 60 + Math.random() * 15),
                    });
                } else {
                    const created = Math.round(15 + Math.random() * 12);
                    data.push({
                        date: formatLabel(date, mode),
                        iso: date.toISOString(),
                        created: adjust(created),
                        completed: adjust(created * 0.75 + Math.random() * 2),
                        cancelled: adjust(created * 0.08 + Math.random() * 2),
                        avgBid: adjust(600 + Math.random() * 120),
                    });
                }
            }
        }

        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Chart stats error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch chart stats' });
    }
}
