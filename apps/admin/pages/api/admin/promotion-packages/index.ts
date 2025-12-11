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
    try {
        const auth = await verifyAuth(req);
        if (!auth) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        if (req.method === 'GET') {
            const packages = await prisma.promotion_packages.findMany({
                orderBy: { priority: 'desc' },
            });
            return res.status(200).json({ success: true, data: packages });
        }

        if (req.method === 'POST') {
            const { nameAr, nameEn, description, price, duration, targetType, features, badgeColor, priority } = req.body;

            if (!nameAr || !nameEn || price === undefined || !duration) {
                return res.status(400).json({ success: false, message: 'Missing required fields' });
            }

            const newPackage = await prisma.promotion_packages.create({
                data: {
                    nameAr,
                    nameEn,
                    description,
                    price: parseFloat(price),
                    duration: parseInt(duration),
                    targetType: targetType || 'ALL',
                    features: features || [],
                    badgeColor,
                    priority: priority ? parseInt(priority) : 0,
                },
            });

            return res.status(201).json({ success: true, data: newPackage });
        }

        return res.status(405).json({ success: false, message: 'Method not allowed' });
    } catch (error) {
        console.error('[Promotion Packages API] Error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}
