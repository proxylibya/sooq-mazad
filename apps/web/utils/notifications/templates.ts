/*
 * قوالب البريد الإلكتروني والرسائل القصيرة بالعربية
 */

export type EmailTemplateName =
  | 'AUCTION_WON'
  | 'AUCTION_ENDING_SOON'
  | 'PAYMENT_REMINDER'
  | 'PAYMENT_OVERDUE'
  | 'LOGIN_ALERT'
  | 'DIRECT_OFFER';

export type SMSTemplateName = '2FA_CODE' | 'PAYMENT_REMINDER' | 'AUCTION_WON' | 'LOGIN_ALERT';

interface TemplateData {
  userName?: string;
  auctionTitle?: string;
  finalPrice?: string;
  hoursLeft?: number;
  code?: string;
  url?: string;
  extra?: Record<string, any>;
}

export function renderEmailTemplate(name: EmailTemplateName, data: TemplateData) {
  switch (name) {
    case 'AUCTION_WON': {
      const subject = `تم الفوز بالمزاد: ${data.auctionTitle || ''}`.trim();
      const html = `
        <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; color: #111827">
          <h2 style="margin:0 0 12px; color:#111827">تهانينا، لقد فزت بالمزاد</h2>
          <p style="margin:0 0 8px">مرحباً ${data.userName || 'عميلنا الكريم'},</p>
          <p style="margin:0 0 8px">لقد فزت بالمزاد: <strong>${data.auctionTitle || ''}</strong>.</p>
          <p style="margin:0 0 8px">السعر النهائي: <strong>${data.finalPrice || ''}</strong>.</p>
          ${data.url ? `<p style="margin:0 0 8px"><a href="${data.url}" style="color:#2563eb">عرض تفاصيل المزاد</a></p>` : ''}
          <hr style="margin:16px 0" />
          <p style="font-size:12px; color:#6b7280">سوق المزاد</p>
        </div>`;
      return { subject, html };
    }
    case 'AUCTION_ENDING_SOON': {
      const subject = `المزاد ينتهي قريباً: ${data.auctionTitle || ''}`.trim();
      const html = `
        <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; color: #111827">
          <h2 style="margin:0 0 12px; color:#b91c1c">المزاد ينتهي قريباً</h2>
          <p style="margin:0 0 8px">يتبقى ${data.hoursLeft ?? 0} ساعة على انتهاء المزاد <strong>${data.auctionTitle || ''}</strong>.</p>
          ${data.url ? `<p style="margin:0 0 8px"><a href="${data.url}" style="color:#2563eb">الانتقال إلى صفحة المزاد</a></p>` : ''}
          <hr style="margin:16px 0" />
          <p style="font-size:12px; color:#6b7280">سوق المزاد</p>
        </div>`;
      return { subject, html };
    }
    case 'PAYMENT_REMINDER': {
      const subject = `تذكير بالدفع لبند: ${data.auctionTitle || ''}`.trim();
      const html = `
        <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; color: #111827">
          <h2 style="margin:0 0 12px; color:#92400e">تذكير بالدفع</h2>
          <p style="margin:0 0 8px">هذا تذكير ودي لاستكمال عملية الدفع الخاصة بـ <strong>${data.auctionTitle || ''}</strong>.</p>
          ${data.url ? `<p style="margin:0 0 8px"><a href="${data.url}" style="color:#2563eb">إتمام الدفع الآن</a></p>` : ''}
          <hr style="margin:16px 0" />
          <p style="font-size:12px; color:#6b7280">سوق المزاد</p>
        </div>`;
      return { subject, html };
    }
    case 'PAYMENT_OVERDUE': {
      const subject = `انتهت مهلة الدفع: ${data.auctionTitle || ''}`.trim();
      const html = `
        <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; color: #111827">
          <h2 style="margin:0 0 12px; color:#991b1b">انتهت مهلة الدفع</h2>
          <p style="margin:0 0 8px">انتهت المهلة المحددة للدفع لـ <strong>${data.auctionTitle || ''}</strong>. يرجى المتابعة لاتخاذ الإجراء اللازم.</p>
          ${data.url ? `<p style="margin:0 0 8px"><a href="${data.url}" style="color:#2563eb">عرض التفاصيل</a></p>` : ''}
          <hr style="margin:16px 0" />
          <p style="font-size:12px; color:#6b7280">سوق المزاد</p>
        </div>`;
      return { subject, html };
    }
    case 'LOGIN_ALERT': {
      const subject = `تنبيه تسجيل دخول`;
      const html = `
        <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; color: #111827">
          <h2 style="margin:0 0 12px; color:#111827">تنبيه أمني</h2>
          <p style="margin:0 0 8px">تم رصد تسجيل دخول جديد إلى حسابك.</p>
          ${data.url ? `<p style="margin:0 0 8px"><a href="${data.url}" style="color:#2563eb">إدارة الجلسات</a></p>` : ''}
          <hr style="margin:16px 0" />
          <p style="font-size:12px; color:#6b7280">سوق المزاد</p>
        </div>`;
      return { subject, html };
    }
    case 'DIRECT_OFFER': {
      const subject = `عرض مباشر جديد: ${data.auctionTitle || ''}`.trim();
      const html = `
        <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; color: #111827">
          <h2 style="margin:0 0 12px; color:#111827">عرض مباشر جديد</h2>
          <p style="margin:0 0 8px">لديك عرض مباشر جديد متعلق بـ <strong>${data.auctionTitle || ''}</strong>.</p>
          ${data.url ? `<p style=\"margin:0 0 8px\"><a href=\"${data.url}\" style=\"color:#2563eb\">عرض العرض</a></p>` : ''}
          <hr style="margin:16px 0" />
          <p style="font-size:12px; color:#6b7280">سوق المزاد</p>
        </div>`;
      return { subject, html };
    }
  }
}

export function renderSMSTemplate(name: SMSTemplateName, data: TemplateData) {
  switch (name) {
    case '2FA_CODE':
      return `رمز التحقق الخاص بك هو: ${data.code || ''}. صالح لمدة 10 دقائق.`;
    case 'PAYMENT_REMINDER':
      return `تذكير بالدفع لـ ${data.auctionTitle || ''}. يرجى الإتمام في أقرب وقت.`;
    case 'AUCTION_WON':
      return `تم الفوز بالمزاد ${data.auctionTitle || ''}. السعر النهائي: ${data.finalPrice || ''}.`;
    case 'LOGIN_ALERT':
      return `تنبيه: تسجيل دخول جديد إلى حسابك.`;
  }
}
