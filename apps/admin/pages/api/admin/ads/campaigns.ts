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

        if (req.method === 'POST') {
            const { name, client, package: packageName, startDate, endDate, creative, creativeType } = req.body;

            // 1. Validate Input
            if (!name || !startDate || !endDate || !creative) {
                return res.status(400).json({ success: false, message: 'Missing required fields' });
            }

            // 2. Find User (Client) - Optional, can be by email or phone or ID
            // For simplicity, we'll try to find a user if 'client' looks like an ID or email
            let userId = null;
            if (client) {
                const user = await prisma.users.findFirst({
                    where: {
                        OR: [
                            { id: client },
                            { email: client },
                            { phone: client }
                        ]
                    }
                });
                if (user) userId = user.id;
            }

            // 3. Find Package
            // In a real scenario, we would look up the package ID. 
            // For now, we might create a dummy package or look it up by name if it exists.
            // We'll skip strict package linking for this MVP step if package ID isn't provided directly,
            // or we can try to find it.
            let packageId = null;
            if (packageName) {
                const pkg = await prisma.adPackage.findFirst({
                    where: { name: { contains: packageName } }
                });
                if (pkg) packageId = pkg.id;
            }

            // 4. Create Campaign
            const campaign = await prisma.adCampaign.create({
                data: {
                    name,
                    userId: userId, // Can be null if not found
                    packageId: packageId, // Can be null
                    status: 'PENDING',
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                    totalPrice: 0, // Calculate based on package later
                }
            });

            // 5. Create Creative (Placement Ad)
            // We need a default placement ID. For now, we'll try to find one or use a placeholder.
            // Ideally, the user should select a Zone (Placement).
            // We'll fetch the first available active placement for now or create a default one if none exists.
            let placementId = '';
            const placement = await prisma.ad_placements.findFirst({ where: { status: 'ACTIVE' } });
            if (placement) {
                placementId = placement.id;
            } else {
                // Create a default placement if none exists (Safety fallback)
                const newPlacement = await prisma.ad_placements.create({
                    data: {
                        name: 'Default Placement',
                        location: 'HOME_TOP',
                        type: 'STATIC',
                        status: 'ACTIVE'
                    }
                });
                placementId = newPlacement.id;
            }

            const adData: any = {
                placementId: placementId,
                adCampaignId: campaign.id, // Changed from campaignId to adCampaignId (correct field name)
                entityType: 'CAMPAIGN',
                title: name,
                isActive: true,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                priority: 10,
            };

            if (creativeType === 'image') {
                adData.mediaType = 'IMAGE';
                // Handle different image data structures
                adData.imageUrl = creative.finalUrl || creative.url || creative.originalImage?.url;
                adData.dimensions = {
                    width: creative.width || creative.originalImage?.width || 0,
                    height: creative.height || creative.originalImage?.height || 0
                };
            } else {
                adData.mediaType = 'VIDEO';
                adData.videoUrl = creative.url;
                adData.videoDuration = creative.duration;
                adData.videoThumbnail = creative.thumbnailUrl;
            }

            await prisma.placement_ads.create({
                data: adData
            });

            return res.status(201).json({ success: true, campaignId: campaign.id });
        }

        if (req.method === 'GET') {
            const campaigns = await prisma.adCampaign.findMany({
                include: {
                    user: { select: { name: true, email: true } },
                    package: { select: { name: true } },
                    ads: true
                },
                orderBy: { createdAt: 'desc' }
            });
            return res.status(200).json({ success: true, data: campaigns });
        }

        return res.status(405).json({ success: false, message: 'Method not allowed' });

    } catch (error) {
        console.error('[Ads API] Error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}
