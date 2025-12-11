import { prisma } from '@sooq-mazad/database';
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

const createZoneSchema = z.object({
    name: z.string().min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل'),
    description: z.string().optional(),
    location: z.enum([
        'HOME_TOP',
        'HOME_MIDDLE',
        'HOME_BOTTOM',
        'MARKETPLACE_TOP',
        'MARKETPLACE_BOTTOM',
        'AUCTIONS_TOP',
        'AUCTIONS_BOTTOM',
        'TRANSPORT_TOP',
        'TRANSPORT_BOTTOM',
        'YARDS_TOP',
        'YARDS_BOTTOM',
        'SIDEBAR',
        'HEADER',
        'FOOTER',
    ]),
    type: z.enum([
        'STATIC',
        'SLIDER',
        'ROTATING',
        'GRID',
        'CAROUSEL',
        'POPUP',
        'STICKY',
        'EXPANDABLE',
        'INTERSTITIAL',
    ]),
    maxAds: z.number().min(1).default(1),
    width: z.string().optional(),
    height: z.string().optional(),
    autoRotate: z.boolean().default(false),
    rotateInterval: z.number().optional(),
    isPopup: z.boolean().default(false),
    popupDelay: z.number().optional(),
    popupFrequency: z.string().optional(),
    isActive: z.boolean().default(true),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const [zones, total] = await Promise.all([
                prisma.ad_placements.findMany({
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        _count: {
                            select: { ads: true },
                        },
                    },
                }),
                prisma.ad_placements.count(),
            ]);

            return res.status(200).json({
                zones,
                pagination: {
                    total,
                    pages: Math.ceil(total / limit),
                    page,
                    limit,
                },
            });
        } catch (error) {
            console.error('Error fetching zones:', error);
            return res.status(500).json({ message: 'حدث خطأ أثناء جلب المساحات' });
        }
    }

    if (req.method === 'POST') {
        try {
            const data = createZoneSchema.parse(req.body);

            const zone = await prisma.ad_placements.create({
                data: {
                    name: data.name,
                    description: data.description,
                    location: data.location,
                    type: data.type,
                    maxAds: data.maxAds,
                    width: data.width,
                    height: data.height,
                    autoRotate: data.autoRotate,
                    rotateInterval: data.rotateInterval,
                    isPopup: data.isPopup,
                    popupDelay: data.popupDelay,
                    popupFrequency: data.popupFrequency,
                    isActive: data.isActive,
                    displayOrder: 0,
                },
            });

            return res.status(201).json(zone);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ message: error.errors[0].message, errors: error.errors });
            }
            console.error('Error creating zone:', error);
            return res.status(500).json({ message: 'حدث خطأ أثناء إنشاء المساحة' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
