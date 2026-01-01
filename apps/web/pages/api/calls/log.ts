/**
 * 📞 API لسجل المكالمات
 * تسجيل وجلب سجل المكالمات
 */

import { prisma } from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

interface CallLogData {
    callId: string;
    callerId: string;
    callerName?: string;
    callerPhone?: string;
    calleeId: string;
    calleeName?: string;
    calleePhone?: string;
    type: 'voice' | 'video';
    status: string;
    direction: 'incoming' | 'outgoing';
    duration?: number;
    conversationId?: string;
    quality?: string;
    endReason?: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        if (req.method === 'POST') {
            // تسجيل مكالمة جديدة أو تحديث مكالمة موجودة
            const data: CallLogData = req.body;

            if (!data.callId || !data.callerId || !data.calleeId) {
                return res.status(400).json({
                    success: false,
                    message: 'بيانات المكالمة غير مكتملة',
                });
            }

            // التحقق من وجود السجل
            const existing = await prisma.$queryRaw`
        SELECT id FROM call_logs WHERE "callId" = ${data.callId} LIMIT 1
      ` as { id: string; }[];

            if (existing.length > 0) {
                // تحديث السجل الموجود
                await prisma.$executeRaw`
          UPDATE call_logs 
          SET 
            status = ${data.status},
            duration = COALESCE(${data.duration}, duration),
            "endTime" = CASE WHEN ${data.status} IN ('ended', 'rejected', 'missed', 'failed') THEN NOW() ELSE "endTime" END,
            "answerTime" = CASE WHEN ${data.status} = 'connected' AND "answerTime" IS NULL THEN NOW() ELSE "answerTime" END,
            quality = COALESCE(${data.quality}, quality),
            "endReason" = COALESCE(${data.endReason}, "endReason"),
            "updatedAt" = NOW()
          WHERE "callId" = ${data.callId}
        `;

                return res.status(200).json({
                    success: true,
                    message: 'تم تحديث سجل المكالمة',
                });
            } else {
                // إنشاء سجل جديد
                const id = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

                await prisma.$executeRaw`
          INSERT INTO call_logs (
            id, "callId", "callerId", "callerName", "callerPhone",
            "calleeId", "calleeName", "calleePhone",
            type, status, direction, "conversationId"
          ) VALUES (
            ${id}, ${data.callId}, ${data.callerId}, ${data.callerName || null}, ${data.callerPhone || null},
            ${data.calleeId}, ${data.calleeName || null}, ${data.calleePhone || null},
            ${data.type}, ${data.status}, ${data.direction}, ${data.conversationId || null}
          )
        `;

                return res.status(201).json({
                    success: true,
                    message: 'تم تسجيل المكالمة',
                    callLogId: id,
                });
            }
        } else if (req.method === 'GET') {
            // جلب سجل المكالمات
            const { userId, page = '1', limit = '20', type, status } = req.query;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'معرف المستخدم مطلوب',
                });
            }

            const pageNum = parseInt(page as string, 10);
            const limitNum = parseInt(limit as string, 10);
            const offset = (pageNum - 1) * limitNum;

            // بناء الاستعلام
            let whereClause = `WHERE ("callerId" = $1 OR "calleeId" = $1)`;
            const params: (string | number)[] = [userId as string];
            let paramIndex = 2;

            if (type && type !== 'all') {
                whereClause += ` AND type = $${paramIndex}`;
                params.push(type as string);
                paramIndex++;
            }

            if (status && status !== 'all') {
                whereClause += ` AND status = $${paramIndex}`;
                params.push(status as string);
                paramIndex++;
            }

            params.push(limitNum, offset);

            const calls = await prisma.$queryRawUnsafe(`
        SELECT * FROM call_logs
        ${whereClause}
        ORDER BY "startTime" DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `, ...params);

            const countResult = await prisma.$queryRawUnsafe(`
        SELECT COUNT(*) as total FROM call_logs ${whereClause}
      `, ...params.slice(0, -2)) as { total: string; }[];

            const total = parseInt(countResult[0]?.total || '0', 10);

            return res.status(200).json({
                success: true,
                data: calls,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages: Math.ceil(total / limitNum),
                },
            });
        } else {
            res.setHeader('Allow', ['GET', 'POST']);
            return res.status(405).json({
                success: false,
                message: `Method ${req.method} not allowed`,
            });
        }
    } catch (error) {
        console.error('[API /calls/log] Error:', error);
        return res.status(500).json({
            success: false,
            message: 'خطأ في الخادم',
        });
    }
}
