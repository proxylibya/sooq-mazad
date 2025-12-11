import type { NextApiRequest, NextApiResponse } from 'next';
import { sendEmail } from '../../../utils/notifications/providers';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: 'طريقة غير مدعومة' });
  }

  try {
    const { to, subject, text, html, provider, from } = req.body || {};

    if (!to || !subject || (!text && !html)) {
      return res.status(400).json({
        success: false,
        error: 'البيانات المطلوبة غير مكتملة',
        required: ['to', 'subject', 'text | html'],
      });
    }

    const result = await sendEmail({ to, subject, text, html, provider, from });

    if (!result.ok) {
      return res.status(500).json({ success: false, error: result.error || 'فشل إرسال البريد' });
    }

    return res.status(200).json({ success: true, message: 'تم إرسال البريد الإلكتروني بنجاح' });
  } catch (error: any) {
    console.error('خطأ في API البريد:', error);
    return res.status(500).json({ success: false, error: 'خطأ داخلي في الخادم' });
  }
}
