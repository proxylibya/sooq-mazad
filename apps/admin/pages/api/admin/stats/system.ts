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
        const start = Date.now();
        // Simple query to check DB connection
        await prisma.$queryRaw`SELECT 1`;
        const duration = Date.now() - start;

        const health = {
            status: 'healthy',
            database: {
                status: 'connected',
                latency: `${duration}ms`
            },
            server: {
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                timestamp: new Date().toISOString()
            }
        };

        return res.status(200).json({ success: true, data: health });
    } catch (error) {
        console.error('System health error:', error);
        return res.status(500).json({
            success: false,
            message: 'System unhealthy',
            error: String(error)
        });
    }
}
