/**
 * API جلب تفاصيل ساحة محددة مع المزادات
 * Single Yard Details API with Auctions
 */

import { prisma } from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

// Helper to safely parse JSON
function safeJsonParse<T>(str: unknown, fallback: T): T {
    if (!str) return fallback;
    if (typeof str !== 'string') return str as T;
    try {
        return JSON.parse(str);
    } catch {
        return fallback;
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const { slug } = req.query;

    if (!slug || typeof slug !== 'string') {
        return res.status(400).json({ success: false, error: 'معرف الساحة مطلوب' });
    }

    // Decode URL-encoded slug (handles Arabic characters)
    let decodedSlug: string;
    try {
        decodedSlug = decodeURIComponent(slug);
    } catch {
        decodedSlug = slug;
    }

    console.log('[Yard API] Looking for yard:', { slug, decodedSlug });

    try {
        // جلب الساحة - بحث مرن
        const yard = await prisma.yards.findFirst({
            where: {
                OR: [
                    { slug: decodedSlug },
                    { id: decodedSlug },
                    { slug: slug },
                    { slug: { contains: decodedSlug.split('-').pop() || '' } }, // Search by last part of slug
                ],
            },
        });

        console.log('[Yard API] Found yard:', yard?.id, yard?.name, yard?.status);

        if (!yard) {
            console.log('[Yard API] Yard not found for slug:', decodedSlug);
            return res.status(404).json({
                success: false,
                error: 'الساحة غير موجودة',
                searchedSlug: decodedSlug
            });
        }

        // Check if yard is active (but still show data)
        if (yard.status !== 'ACTIVE') {
            console.log('[Yard API] Yard is not active:', yard.status);
        }

        // جلب المزادات المرتبطة بالساحة
        const auctions = await prisma.auctions.findMany({
            where: {
                yardId: yard.id,
                status: { in: ['ACTIVE', 'PENDING', 'UPCOMING'] },
            },
            include: {
                cars: {
                    select: {
                        brand: true,
                        model: true,
                        year: true,
                        mileage: true,
                        condition: true,
                        images: true,
                    },
                },
            },
            orderBy: { startDate: 'asc' },
            take: 20,
        });

        // تحويل بيانات الساحة
        const transformedYard = {
            id: yard.id,
            slug: yard.slug,
            name: yard.name,
            description: yard.description,
            image: yard.image || '/placeholder.svg',
            images: yard.images || [],
            city: yard.city,
            area: yard.area,
            address: yard.address,
            phone: yard.phone,
            phones: yard.phones || [],
            email: yard.email,
            auctionDays: yard.auctionDays || [],
            auctionTimeFrom: yard.auctionTimeFrom,
            auctionTimeTo: yard.auctionTimeTo,
            capacity: yard.capacity,
            verified: yard.verified,
            featured: yard.featured,
            rating: yard.rating,
            reviewsCount: yard.reviewsCount,
            activeAuctions: auctions.length,
            services: yard.services || [],
            vehicleTypes: yard.vehicleTypes || [],
            managerName: yard.managerName,
            managerPhone: yard.managerPhone,
        };

        // تحويل بيانات المزادات
        const transformedAuctions = auctions.map(auction => {
            // Parse car images
            let carImages: string[] = [];
            if (auction.cars?.images) {
                try {
                    if (typeof auction.cars.images === 'string') {
                        carImages = JSON.parse(auction.cars.images);
                    } else if (Array.isArray(auction.cars.images)) {
                        carImages = auction.cars.images as string[];
                    }
                } catch {
                    carImages = [];
                }
            }

            return {
                id: auction.id,
                title: auction.title || `${auction.cars?.brand || ''} ${auction.cars?.model || ''}`.trim() || 'مزاد',
                currentPrice: auction.currentPrice || auction.startPrice || 0,
                startPrice: auction.startPrice || 0,
                endDate: auction.endDate?.toISOString() || '',
                startDate: auction.startDate?.toISOString() || '',
                status: auction.status,
                images: carImages.length > 0 ? carImages : ['/placeholder.svg'],
                car: auction.cars ? {
                    brand: auction.cars.brand,
                    model: auction.cars.model,
                    year: auction.cars.year,
                    mileage: auction.cars.mileage,
                    condition: auction.cars.condition,
                } : undefined,
            };
        });

        return res.status(200).json({
            success: true,
            yard: transformedYard,
            auctions: transformedAuctions,
        });
    } catch (error) {
        console.error('[Yard Details API Error]:', error);
        console.error('[Yard Details API] Slug:', slug);
        console.error('[Yard Details API] Decoded Slug:', decodeURIComponent(slug));

        const errorMessage = error instanceof Error ? error.message : String(error);

        return res.status(500).json({
            success: false,
            error: 'حدث خطأ في جلب البيانات',
            details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        });
    }
}
