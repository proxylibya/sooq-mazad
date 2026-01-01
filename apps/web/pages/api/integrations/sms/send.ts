// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * 📱 API إرسال الرسائل النصية
 * POST /api/integrations/sms/send
 */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { to, message, template, variables } = req.body;

        if (!to) {
            return res.status(400).json({
                success: false,
                error: 'رقم الهاتف مطلوب'
            });
        }

        // تنظيف رقم الهاتف
        let phone = to.replace(/\D/g, '');
        if (phone.startsWith('0')) {
            phone = '218' + phone.substring(1);
        }
        if (!phone.startsWith('218')) {
            phone = '218' + phone;
        }

        // محاكاة إرسال SMS
        const messageId = `SMS-${Date.now()}`;

        let finalMessage = message;
        if (template === 'otp' && variables?.code) {
            finalMessage = `رمز التحقق الخاص بك هو: ${variables.code}`;
        } else if (template === 'welcome' && variables?.name) {
            finalMessage = `مرحباً ${variables.name}! شكراً لانضمامك إلى سوق المزاد.`;
        }

        console.log(`[SMS API] Sending to: +${phone}`);
        console.log(`[SMS API] Message: ${finalMessage || '(empty)'}`);

        return res.status(200).json({
            success: true,
            messageId,
            message: 'تم إرسال الرسالة النصية بنجاح',
            data: {
                to: `+${phone}`,
                template: template || 'custom',
                sentAt: new Date().toISOString()
            }
        });

    } catch (error: any) {
        console.error('[SMS API] Error:', error);
        return res.status(500).json({
            success: false,
            error: 'حدث خطأ في إرسال الرسالة النصية'
        });
    }
}
