// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * 📧 API إرسال البريد الإلكتروني
 * POST /api/integrations/email/send
 */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { to, subject, template, variables, html, text } = req.body;

        if (!to) {
            return res.status(400).json({
                success: false,
                error: 'عنوان البريد الإلكتروني مطلوب'
            });
        }

        // محاكاة إرسال البريد
        const messageId = `EMAIL-${Date.now()}`;

        console.log(`[Email API] Sending to: ${to}`);
        console.log(`[Email API] Template: ${template || 'custom'}`);
        console.log(`[Email API] Subject: ${subject || '(from template)'}`);

        return res.status(200).json({
            success: true,
            messageId,
            message: 'تم إرسال البريد الإلكتروني بنجاح',
            data: {
                to,
                template: template || 'custom',
                sentAt: new Date().toISOString()
            }
        });

    } catch (error: any) {
        console.error('[Email API] Error:', error);
        return res.status(500).json({
            success: false,
            error: 'حدث خطأ في إرسال البريد الإلكتروني'
        });
    }
}
