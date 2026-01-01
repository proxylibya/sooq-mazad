/**
 * API تشخيصي لفحص خدمات النقل
 * يجب حذفه بعد حل المشكلة
 */

import jwt, { JwtPayload } from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        // استخراج التوكن من الهيدر
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, error: 'رمز المصادقة مطلوب' });
        }

        const token = authHeader.substring(7);
        let decoded: JwtPayload & { userId?: string; id?: string; };

        try {
            const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
            decoded = jwt.verify(token, secret) as JwtPayload & { userId?: string; id?: string; };
        } catch {
            return res.status(401).json({ success: false, error: 'رمز المصادقة غير صحيح' });
        }

        const tokenUserId = decoded.userId || decoded.id;

        // جلب بيانات المستخدم
        const user = await prisma.users.findUnique({
            where: { id: tokenUserId },
            select: { id: true, name: true, phone: true, accountType: true },
        });

        // جلب جميع الخدمات
        const allServices = await prisma.transport_services.findMany({
            select: {
                id: true,
                userId: true,
                title: true,
                status: true,
                createdAt: true,
                contactPhone: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 10, // آخر 10 خدمات فقط
        });

        // جلب خدمات هذا المستخدم
        const userServices = await prisma.transport_services.findMany({
            where: { userId: tokenUserId },
            select: {
                id: true,
                title: true,
                status: true,
                createdAt: true,
            },
        });

        // فحص التطابق
        const matchingServices = allServices.filter(s => s.userId === tokenUserId);

        return res.status(200).json({
            success: true,
            debug: {
                tokenInfo: {
                    userId: tokenUserId,
                    decodedFields: Object.keys(decoded),
                },
                user: user || 'لم يتم العثور على المستخدم',
                statistics: {
                    totalServicesInDB: allServices.length,
                    servicesMatchingUserId: matchingServices.length,
                    userServicesCount: userServices.length,
                },
                lastServices: allServices.map(s => ({
                    id: s.id,
                    title: s.title?.substring(0, 30),
                    userId: s.userId,
                    matchesCurrentUser: s.userId === tokenUserId,
                    status: s.status,
                    createdAt: s.createdAt,
                })),
                userServices: userServices,
            },
        });
    } catch (error) {
        console.error('خطأ في التشخيص:', error);
        return res.status(500).json({
            success: false,
            error: 'خطأ في الخادم',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
