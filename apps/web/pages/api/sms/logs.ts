/**
 * 📱 API لجلب سجلات SMS
 * استرجاع وفلترة رسائل SMS
 */

import { prisma } from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({
            success: false,
            message: `Method ${req.method} not allowed`,
        });
    }

    try {
        const {
            page = '1',
            limit = '20',
            type,
            status,
            search,
        } = req.query;

        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const offset = (pageNum - 1) * limitNum;

        // بناء استعلام ديناميكي
        let whereClause = 'WHERE 1=1';
        const params: (string | number)[] = [];

        if (type && type !== 'all') {
            params.push(type as string);
            whereClause += ` AND type = $${params.length}`;
        }

        if (status && status !== 'all') {
            params.push(status as string);
            whereClause += ` AND status = $${params.length}`;
        }

        if (search) {
            params.push(`%${search}%`);
            whereClause += ` AND (phone ILIKE $${params.length} OR message ILIKE $${params.length})`;
        }

        // جلب البيانات
        const logsQuery = `
      SELECT 
        id, phone, message, type, status, cost,
        "userId", "userName", "providerId", "errorMessage",
        "createdAt", "sentAt", "deliveredAt", "updatedAt"
      FROM sms_logs
      ${whereClause}
      ORDER BY "createdAt" DESC
      LIMIT ${limitNum} OFFSET ${offset}
    `;

        // إحصائيات
        const statsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'delivered') as delivered,
        COUNT(*) FILTER (WHERE status = 'sent') as sent,
        COUNT(*) FILTER (WHERE status = 'failed') as failed,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COALESCE(SUM(cost), 0) as "totalCost"
      FROM sms_logs
    `;

        // جلب عدد السجلات الإجمالي
        const countQuery = `
      SELECT COUNT(*) as count
      FROM sms_logs
      ${whereClause}
    `;

        // تنفيذ الاستعلامات
        let logs: unknown[] = [];
        let stats: { total: number; delivered: number; sent: number; failed: number; pending: number; totalCost: number; } = {
            total: 0,
            delivered: 0,
            sent: 0,
            failed: 0,
            pending: 0,
            totalCost: 0,
        };
        let totalCount = 0;

        try {
            // جلب السجلات
            if (params.length === 0) {
                logs = await prisma.$queryRawUnsafe(logsQuery);
            } else {
                logs = await prisma.$queryRawUnsafe(logsQuery, ...params);
            }

            // جلب الإحصائيات
            const statsResult = await prisma.$queryRawUnsafe(statsQuery) as Array<{
                total: bigint;
                delivered: bigint;
                sent: bigint;
                failed: bigint;
                pending: bigint;
                totalCost: number;
            }>;

            if (statsResult.length > 0) {
                stats = {
                    total: Number(statsResult[0].total),
                    delivered: Number(statsResult[0].delivered),
                    sent: Number(statsResult[0].sent),
                    failed: Number(statsResult[0].failed),
                    pending: Number(statsResult[0].pending),
                    totalCost: Number(statsResult[0].totalCost) || 0,
                };
            }

            // جلب عدد السجلات
            let countResult: Array<{ count: bigint; }>;
            if (params.length === 0) {
                countResult = await prisma.$queryRawUnsafe(countQuery) as Array<{ count: bigint; }>;
            } else {
                countResult = await prisma.$queryRawUnsafe(countQuery, ...params) as Array<{ count: bigint; }>;
            }
            totalCount = Number(countResult[0]?.count || 0);
        } catch (dbError) {
            console.warn('[API /sms/logs] Database error, returning empty data:', dbError);
            // إرجاع بيانات فارغة في حالة الخطأ
        }

        return res.status(200).json({
            success: true,
            data: {
                logs,
                stats,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total: totalCount,
                    totalPages: Math.ceil(totalCount / limitNum),
                },
            },
        });
    } catch (error) {
        console.error('[API /sms/logs] Error:', error);
        return res.status(500).json({
            success: false,
            message: 'خطأ في جلب السجلات',
        });
    }
}
