import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined; };
let prisma: PrismaClient;

try {
    prisma = globalForPrisma.prisma ?? new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
    if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
} catch (err) {
    console.error('[Public Promotion Packages API] Failed to initialize Prisma:', err);
    prisma = new PrismaClient();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        const { type } = req.query;

        const whereClause: any = { isActive: true };
        if (type) {
            whereClause.targetType = { in: ['ALL', String(type).toUpperCase()] };
        }

        // Check if the table exists before querying
        try {
            const packages = await prisma.promotion_packages.findMany({
                where: whereClause,
                orderBy: { priority: 'desc' },
            });

            return res.status(200).json({ success: true, data: packages });
        } catch (dbError: any) {
            // If table doesn't exist or other DB error, return empty array
            if (dbError.code === 'P2021' || dbError.message?.includes('does not exist')) {
                console.warn('[Public Promotion Packages API] Table not found, returning empty data');
                return res.status(200).json({ success: true, data: [] });
            }
            throw dbError;
        }
    } catch (error) {
        console.error('[Public Promotion Packages API] Error:', error);
        // Return empty data instead of 500 error for better UX
        return res.status(200).json({ success: true, data: [], message: 'No packages available' });
    }
}
