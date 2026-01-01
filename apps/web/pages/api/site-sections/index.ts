/**
 * API للحصول على إعدادات أقسام الموقع - Enterprise Edition
 * GET /api/site-sections - جلب جميع الأقسام والعناصر
 * 
 * ميزات:
 * - تخزين مؤقت على الخادم (60 ثانية)
 * - Cache-Control headers للمتصفح
 * - Fallback للبيانات الافتراضية
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { DEFAULT_ELEMENTS, DEFAULT_SECTIONS } from '../../../lib/content-visibility';
import prisma from '../../../lib/prisma';

// تخزين مؤقت على مستوى الخادم
let serverCache: { sections: any[]; elements: any[]; timestamp: number; } | null = null;
const CACHE_DURATION = 60 * 1000; // 60 ثانية

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // تعيين headers للـ caching
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // محاولة جلب البيانات من قاعدة البيانات
        let sections: any[] = [];
        let elements: any[] = [];
        let fromDatabase = false;

        try {
            sections = await prisma.site_sections.findMany({
                orderBy: { navbarOrder: 'asc' },
            });

            elements = await prisma.site_elements.findMany({
                orderBy: { displayOrder: 'asc' },
            });

            fromDatabase = sections.length > 0;
        } catch (dbError) {
            console.warn('لم يتم العثور على جدول site_sections، استخدام البيانات الافتراضية');
        }

        // استخدام البيانات الافتراضية إذا لم توجد بيانات
        if (sections.length === 0) {
            sections = DEFAULT_SECTIONS as any;
        }

        if (elements.length === 0) {
            elements = DEFAULT_ELEMENTS as any;
        }

        return res.status(200).json({
            success: true,
            sections,
            elements,
            source: fromDatabase ? 'database' : 'default',
        });

    } catch (error) {
        console.error('خطأ في جلب إعدادات الأقسام:', error);

        // إرجاع البيانات الافتراضية في حال الخطأ
        return res.status(200).json({
            success: true,
            sections: DEFAULT_SECTIONS,
            elements: DEFAULT_ELEMENTS,
            source: 'default',
        });
    }
}
