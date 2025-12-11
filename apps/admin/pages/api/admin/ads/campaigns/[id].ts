import { PrismaClient } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import type { NextApiRequest, NextApiResponse } from 'next';

// ============================================
// PRISMA CLIENT
// ============================================
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined; };
let prisma: PrismaClient;

try {
    prisma = globalForPrisma.prisma ?? new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
    if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
} catch (err) {
    console.error('[Ads API] Failed to initialize Prisma:', err);
    prisma = new PrismaClient();
}

// ============================================
// CONFIGURATION
// ============================================
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || 'sooq-mazad-admin-secret-key-min-32-chars!';
const COOKIE_NAME = 'admin_session';

// ============================================
// AUTHENTICATION
// ============================================
interface AuthResult {
    adminId: string;
    role: string;
    username?: string;
}

async function verifyAuth(req: NextApiRequest): Promise<AuthResult | null> {
    const token = req.cookies[COOKIE_NAME] || req.cookies.admin_token || req.cookies.admin_session;

    if (!token) return null;

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        if (decoded.type !== 'admin') return null;
        return {
            adminId: decoded.adminId,
            role: decoded.role,
            username: decoded.username
        };
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

        const { id } = req.query;

        if (!id || typeof id !== 'string') {
            return res.status(400).json({ success: false, message: 'Invalid ID' });
        }

        // GET - Fetch single campaign
        if (req.method === 'GET') {
            const campaign = await prisma.adCampaign.findUnique({
                where: { id },
                include: {
                    user: { select: { name: true, email: true } },
                    package: { select: { name: true } },
                    ads: true
                }
            });

            if (!campaign) {
                return res.status(404).json({ success: false, message: 'Campaign not found' });
            }

            return res.status(200).json({ success: true, data: campaign });
        }

        // PATCH - Update campaign (e.g. status)
        if (req.method === 'PATCH') {
            const { status, name, startDate, endDate } = req.body;

            const dataToUpdate: any = {};
            if (status) dataToUpdate.status = status;
            if (name) dataToUpdate.name = name;
            if (startDate) dataToUpdate.startDate = new Date(startDate);
            if (endDate) dataToUpdate.endDate = new Date(endDate);

            const campaign = await prisma.adCampaign.update({
                where: { id },
                data: dataToUpdate
            });

            return res.status(200).json({ success: true, data: campaign });
        }

        // DELETE - Delete campaign
        if (req.method === 'DELETE') {
            // First delete related ads (placement_ads) if necessary, or rely on cascade if configured
            // Assuming cascade or manual cleanup:
            await prisma.placement_ads.deleteMany({
                where: { campaignId: id }
            });

            await prisma.adCampaign.delete({
                where: { id }
            });

            return res.status(200).json({ success: true, message: 'Campaign deleted successfully' });
        }

        return res.status(405).json({ success: false, message: 'Method not allowed' });

    } catch (error) {
        console.error('[Ads API] Error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}
