/**
 * API جلب إعلانات المستخدم مع حالة الترويج
 */

import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface JwtPayload {
    userId?: string;
    id?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // الحصول على token من الكوكيز أو الهيدر
        const token = req.cookies.token || req.cookies.user_token || req.cookies.auth_token;

        if (!token) {
            return res.status(401).json({ error: 'غير مصرح - يرجى تسجيل الدخول' });
        }

        // فك التوكن
        let userId: string;
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
            userId = decoded.userId || decoded.id || '';

            if (!userId) {
                return res.status(401).json({ error: 'توكن غير صالح' });
            }
        } catch {
            return res.status(401).json({ error: 'توكن منتهي الصلاحية' });
        }

        // جلب السيارات
        const cars = await prisma.cars.findMany({
            where: {
                sellerId: userId,
            },
            select: {
                id: true,
                title: true,
                price: true,
                status: true,
                featured: true,
                promotionPackage: true,
                promotionEndDate: true,
                createdAt: true,
                images: {
                    take: 1,
                    select: {
                        url: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // جلب المزادات
        const auctions = await prisma.auctions.findMany({
            where: {
                sellerId: userId,
            },
            select: {
                id: true,
                title: true,
                startingPrice: true,
                status: true,
                featured: true,
                promotionPackage: true,
                promotionEndDate: true,
                createdAt: true,
                car: {
                    select: {
                        images: {
                            take: 1,
                            select: {
                                url: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // تحويل البيانات للتنسيق الموحد
        const carListings = cars.map((car) => ({
            id: car.id,
            title: car.title || 'سيارة بدون عنوان',
            price: car.price || 0,
            image: car.images[0]?.url || null,
            type: 'car' as const,
            status: car.status || 'AVAILABLE',
            promotionPackage: car.promotionPackage,
            promotionEndDate: car.promotionEndDate?.toISOString() || null,
            createdAt: car.createdAt.toISOString(),
        }));

        const auctionListings = auctions.map((auction) => ({
            id: auction.id,
            title: auction.title || 'مزاد بدون عنوان',
            price: auction.startingPrice || 0,
            image: auction.car?.images[0]?.url || null,
            type: 'auction' as const,
            status: auction.status || 'ACTIVE',
            promotionPackage: auction.promotionPackage,
            promotionEndDate: auction.promotionEndDate?.toISOString() || null,
            createdAt: auction.createdAt.toISOString(),
        }));

        // دمج وترتيب
        const allListings = [...carListings, ...auctionListings].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        // فصل المروج وغير المروج
        const now = new Date();
        const promotedListings = allListings.filter(
            (listing) =>
                listing.promotionPackage &&
                listing.promotionPackage !== 'free' &&
                listing.promotionEndDate &&
                new Date(listing.promotionEndDate) > now
        );

        const regularListings = allListings.filter(
            (listing) =>
                !listing.promotionPackage ||
                listing.promotionPackage === 'free' ||
                !listing.promotionEndDate ||
                new Date(listing.promotionEndDate) <= now
        );

        return res.status(200).json({
            success: true,
            listings: allListings,
            promoted: promotedListings,
            regular: regularListings,
            stats: {
                total: allListings.length,
                promoted: promotedListings.length,
                regular: regularListings.length,
                cars: carListings.length,
                auctions: auctionListings.length,
            },
        });
    } catch (error) {
        console.error('خطأ في جلب الإعلانات:', error);
        return res.status(500).json({ error: 'خطأ في الخادم' });
    }
}
