/**
 * API تفاصيل مزاد الساحة
 * Yard Auction Details API
 * يُرجع بيانات المزاد مع معلومات الساحة للعرض على أرض الواقع
 */

import { prisma } from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const { slug, id } = req.query;

    if (!slug || typeof slug !== 'string' || !id || typeof id !== 'string') {
        return res.status(400).json({ success: false, error: 'معرف الساحة والمزاد مطلوبان' });
    }

    // Decode URL-encoded slug
    let decodedSlug: string;
    try {
        decodedSlug = decodeURIComponent(slug);
    } catch {
        decodedSlug = slug;
    }

    console.log('[Yard Auction API] Request:', { slug: decodedSlug, auctionId: id });

    try {
        // جلب الساحة أولاً
        const yard = await prisma.yards.findFirst({
            where: {
                OR: [
                    { slug: decodedSlug },
                    { id: decodedSlug },
                    { slug: slug },
                ],
            },
            select: {
                id: true,
                slug: true,
                name: true,
                city: true,
                area: true,
                address: true,
                phone: true,
                phones: true,
                email: true,
                auctionDays: true,
                auctionTimeFrom: true,
                auctionTimeTo: true,
                workingHours: true,
                latitude: true,
                longitude: true,
                image: true,
                images: true,
                services: true,
                verified: true,
                rating: true,
                reviewsCount: true,
            },
        });

        if (!yard) {
            return res.status(404).json({ success: false, error: 'الساحة غير موجودة' });
        }

        // جلب المزاد مع التحقق من أنه ينتمي لهذه الساحة
        const auction = await prisma.auctions.findFirst({
            where: {
                id: id,
                yardId: yard.id, // التأكد من أن المزاد ينتمي لهذه الساحة
            },
            include: {
                cars: {
                    include: {
                        car_images: {
                            orderBy: { isPrimary: 'desc' },
                        },
                    },
                },
                users: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        verified: true,
                    },
                },
                bids: {
                    select: {
                        id: true,
                        amount: true,
                        createdAt: true,
                        users: {
                            select: {
                                name: true,
                            },
                        },
                    },
                    orderBy: { amount: 'desc' },
                    take: 10,
                },
                _count: {
                    select: { bids: true },
                },
            },
        });

        if (!auction) {
            return res.status(404).json({ success: false, error: 'المزاد غير موجود في هذه الساحة' });
        }

        const now = new Date();
        const startDate = auction.startDate ? new Date(auction.startDate) : null;
        const endDate = auction.endDate ? new Date(auction.endDate) : null;

        let displayStatus: 'live' | 'upcoming' | 'sold' | 'ended' = 'upcoming';
        const auctionStatus = auction.status as string;
        if (auctionStatus === 'SOLD' || auctionStatus === 'COMPLETED') {
            displayStatus = 'sold';
        } else if (auctionStatus === 'ENDED' || auctionStatus === 'CANCELLED') {
            displayStatus = 'ended';
        } else if (endDate && endDate < now) {
            displayStatus = 'ended';
        } else if (startDate && startDate <= now && auctionStatus === 'ACTIVE') {
            displayStatus = 'live';
        }

        let images: string[] = [];
        const carData = auction.cars as any;
        if (carData?.car_images && carData.car_images.length > 0) {
            images = carData.car_images
                .filter((img: any) => img.fileUrl)
                .map((img: any) => img.fileUrl);
        } else if (carData?.images) {
            try {
                const parsed = typeof carData.images === 'string'
                    ? JSON.parse(carData.images)
                    : carData.images;
                if (Array.isArray(parsed)) {
                    images = parsed;
                }
            } catch {
                if (typeof carData.images === 'string') {
                    images = [carData.images];
                }
            }
        }

        // بناء الاستجابة
        const response = {
            success: true,
            data: {
                auction: {
                    id: auction.id,
                    title: auction.title,
                    description: auction.description,
                    startPrice: auction.startPrice,
                    currentPrice: auction.currentPrice,
                    minimumBid: auction.minimumBid,
                    startDate: auction.startDate,
                    endDate: auction.endDate,
                    status: auction.status,
                    displayStatus,
                    featured: auction.featured,
                    views: auction.views,
                    totalBids: auction._count.bids,
                    location: auction.location,
                    isYardAuction: true, // علامة أنه مزاد ساحة
                },
                car: auction.cars ? {
                    id: carData.id,
                    title: carData.title,
                    brand: carData.brand,
                    model: carData.model,
                    year: carData.year,
                    mileage: carData.mileage,
                    condition: carData.condition,
                    fuelType: carData.fuelType,
                    transmission: carData.transmission,
                    color: carData.color,
                    interiorColor: carData.interiorColor,
                    bodyType: carData.bodyType,
                    engineSize: carData.engineSize,
                    chassisNumber: carData.chassisNumber,
                    features: carData.features,
                    description: carData.description,
                    images,
                } : null,
                seller: auction.users,
                yard: {
                    id: yard.id,
                    slug: yard.slug,
                    name: yard.name,
                    city: yard.city,
                    area: yard.area,
                    address: yard.address,
                    phone: yard.phone,
                    phones: yard.phones,
                    email: yard.email,
                    auctionDays: yard.auctionDays,
                    auctionTimeFrom: yard.auctionTimeFrom,
                    auctionTimeTo: yard.auctionTimeTo,
                    workingHours: yard.workingHours,
                    latitude: yard.latitude,
                    longitude: yard.longitude,
                    image: yard.image,
                    services: yard.services,
                    verified: yard.verified,
                    rating: yard.rating,
                    reviewsCount: yard.reviewsCount,
                },
                recentBids: auction.bids.map((bid: any) => ({
                    id: bid.id,
                    amount: bid.amount,
                    bidderName: bid.users?.name || 'مزايد',
                    time: bid.createdAt,
                })),
            },
        };

        // تحديث عداد المشاهدات
        await prisma.auctions.update({
            where: { id: auction.id },
            data: { views: { increment: 1 } },
        }).catch(() => { }); // تجاهل أي خطأ في تحديث المشاهدات

        console.log('[Yard Auction API] Success:', { auctionId: auction.id, yardId: yard.id });
        return res.status(200).json(response);

    } catch (error) {
        console.error('[Yard Auction API] Error:', error);
        return res.status(500).json({
            success: false,
            error: 'حدث خطأ في جلب بيانات المزاد',
            details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        });
    }
}
