/**
 * 📱 API لإرسال رسائل SMS
 * إرسال رسائل نصية للمستخدمين
 */

import { prisma } from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

interface SendSMSData {
    phone: string;
    message: string;
    type?: 'otp' | 'notification' | 'marketing' | 'reminder';
    userId?: string;
    userName?: string;
    templateId?: string;
    variables?: Record<string, string>;
}

// دالة لمعالجة القالب
function processTemplate(template: string, variables: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
        result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return result;
}

// دالة لإرسال SMS (محلية للاختبار)
async function sendSMSLocal(phone: string, message: string): Promise<{ success: boolean; providerId?: string; error?: string; }> {
    // محاكاة إرسال SMS
    console.log(`[SMS Local] Sending to ${phone}: ${message}`);

    // محاكاة تأخير الشبكة
    await new Promise(resolve => setTimeout(resolve, 500));

    // محاكاة نجاح 95%
    if (Math.random() > 0.05) {
        return {
            success: true,
            providerId: `local_${Date.now()}`,
        };
    } else {
        return {
            success: false,
            error: 'فشل محاكاة الإرسال',
        };
    }
}

// TODO: إضافة دوال للمزودين الآخرين (Twilio, Nexmo, etc.)

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({
            success: false,
            message: `Method ${req.method} not allowed`,
        });
    }

    try {
        const data: SendSMSData = req.body;

        if (!data.phone || (!data.message && !data.templateId)) {
            return res.status(400).json({
                success: false,
                message: 'رقم الهاتف والرسالة مطلوبان',
            });
        }

        // تنظيف رقم الهاتف
        let phone = data.phone.replace(/\s+/g, '');
        if (!phone.startsWith('+')) {
            if (phone.startsWith('00')) {
                phone = '+' + phone.substring(2);
            } else if (phone.startsWith('0')) {
                phone = '+218' + phone.substring(1);
            }
        }

        // جلب الرسالة من القالب إذا تم تحديده
        let message = data.message;
        if (data.templateId && !message) {
            const template = await prisma.$queryRaw`
        SELECT content FROM sms_templates WHERE id = ${data.templateId} AND "isActive" = true LIMIT 1
      ` as { content: string; }[];

            if (template.length > 0) {
                message = processTemplate(template[0].content, data.variables || {});
            }
        }

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'الرسالة فارغة',
            });
        }

        // إنشاء سجل SMS
        const id = `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const type = data.type || 'notification';

        await prisma.$executeRaw`
      INSERT INTO sms_logs (id, phone, message, type, status, "userId", "userName")
      VALUES (${id}, ${phone}, ${message}, ${type}, 'pending', ${data.userId || null}, ${data.userName || null})
    `;

        // إرسال SMS
        const result = await sendSMSLocal(phone, message);

        // تحديث حالة السجل
        if (result.success) {
            await prisma.$executeRaw`
        UPDATE sms_logs 
        SET status = 'sent', "sentAt" = NOW(), "providerId" = ${result.providerId}, "updatedAt" = NOW()
        WHERE id = ${id}
      `;

            return res.status(200).json({
                success: true,
                message: 'تم إرسال الرسالة بنجاح',
                smsId: id,
                providerId: result.providerId,
            });
        } else {
            await prisma.$executeRaw`
        UPDATE sms_logs 
        SET status = 'failed', "errorMessage" = ${result.error}, "updatedAt" = NOW()
        WHERE id = ${id}
      `;

            return res.status(500).json({
                success: false,
                message: result.error || 'فشل إرسال الرسالة',
                smsId: id,
            });
        }
    } catch (error) {
        console.error('[API /sms/send] Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
        return res.status(500).json({
            success: false,
            message: 'خطأ في الخادم',
            error: errorMessage,
        });
    }
}
