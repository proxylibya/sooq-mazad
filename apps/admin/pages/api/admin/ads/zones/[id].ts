import { prisma } from '@sooq-mazad/database';
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

const updateZoneSchema = z.object({
    name: z.string().min(3).optional(),
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
    ]).optional(),
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
    ]).optional(),
    maxAds: z.number().min(1).optional(),
    width: z.string().optional(),
    height: z.string().optional(),
    autoRotate: z.boolean().optional(),
    rotateInterval: z.number().optional(),
    isPopup: z.boolean().optional(),
    popupDelay: z.number().optional(),
    popupFrequency: z.string().optional(),
    isActive: z.boolean().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'Invalid ID' });
    }

    if (req.method === 'GET') {
        try {
            const zone = await prisma.ad_placements.findUnique({
                where: { id },
                include: {
                    _count: {
                        select: { ads: true },
                    },
                },
            });

            if (!zone) {
                return res.status(404).json({ message: 'المساحة غير موجودة' });
            }

            return res.status(200).json(zone);
        } catch (error) {
            console.error('Error fetching zone:', error);
            return res.status(500).json({ message: 'حدث خطأ أثناء جلب تفاصيل المساحة' });
        }
    }

    if (req.method === 'PUT') {
        try {
            const data = updateZoneSchema.parse(req.body);

            const zone = await prisma.ad_placements.update({
                where: { id },
                data,
            });

            return res.status(200).json(zone);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ message: error.errors[0].message, errors: error.errors });
            }
            console.error('Error updating zone:', error);
            return res.status(500).json({ message: 'حدث خطأ أثناء تحديث المساحة' });
        }
    }

    if (req.method === 'DELETE') {
        try {
            // Check if there are active ads in this zone
            const activeAdsCount = await prisma.placement_ads.count({
                where: {
                    placementId: id,
                    isActive: true,
                },
            });

            if (activeAdsCount > 0) {
                return res.status(400).json({
                    message: 'لا يمكن حذف المساحة لوجود إعلانات نشطة مرتبطة بها. قم بتعطيل الإعلانات أولاً.'
                });
            }

            await prisma.ad_placements.delete({
                where: { id },
            });

            return res.status(200).json({ message: 'تم حذف المساحة بنجاح' });
        } catch (error) {
            console.error('Error deleting zone:', error);
            return res.status(500).json({ message: 'حدث خطأ أثناء حذف المساحة' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
