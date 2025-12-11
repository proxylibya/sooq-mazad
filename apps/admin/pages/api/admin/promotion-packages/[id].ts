import { PrismaClient } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import type { NextApiRequest, NextApiResponse } from 'next';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined; };
let prisma: PrismaClient;

try {
    prisma = globalForPrisma.prisma ?? new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
    if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
} catch (err) {
    console.error('[Promotion Packages API] Failed to initialize Prisma:', err);
    prisma = new PrismaClient();
}

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || 'sooq-mazad-admin-secret-key-min-32-chars!';
const COOKIE_NAME = 'admin_session';

async function verifyAuth(req: NextApiRequest) {
    const token = req.cookies[COOKIE_NAME] || req.cookies.admin_token || req.cookies.admin_session;
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        if (decoded.type !== 'admin') return null;
        return decoded;
    } catch (err) {
        return null;
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    try {
        const auth = await verifyAuth(req);
        if (!auth) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        if (req.method === 'PUT') {
            const { nameAr, nameEn, description, price, duration, targetType, features, badgeColor, priority, isActive } = req.body;

            const updatedPackage = await prisma.promotion_packages.update({
                where: { id: String(id) },
                data: {
                    nameAr,
                    nameEn,
                    description,
                    price: price !== undefined ? parseFloat(price) : undefined,
                    duration: duration !== undefined ? parseInt(duration) : undefined,
                    targetType,
                    features,
                    badgeColor,
                    priority: priority !== undefined ? parseInt(priority) : undefined,
                    isActive: isActive !== undefined ? Boolean(isActive) : undefined,
                },
            });

            return res.status(200).json({ success: true, data: updatedPackage });
        }

        if (req.method === 'DELETE') {
            await prisma.promotion_packages.delete({
                where: { id: String(id) },
            });
            return res.status(200).json({ success: true, message: 'Package deleted' });
        }

        return res.status(405).json({ success: false, message: 'Method not allowed' });
    } catch (error) {
        console.error('[Promotion Packages API] Error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}
