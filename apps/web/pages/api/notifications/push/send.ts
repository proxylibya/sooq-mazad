import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ success: false, error: "طريقة غير مدعومة" });
  }

  // تحميل web-push بطريقة آمنة زمن التشغيل فقط لتجنّب فشل Webpack عند عدم تثبيت الحزمة
  let webpush: any = null;
  try {
    const req = eval("require") as NodeRequire;
    const mod = req("web-push");
    webpush = (mod as any)?.default || mod;
  } catch (e) {
    return res.status(501).json({
      success: false,
      error:
        "إرسال Web Push غير مُفعل على الخادم (حزمة web-push غير مثبّتة)".trim(),
      hint: "ثبّت web-push وأضف مفاتيح VAPID إلى متغيرات البيئة لتفعيل الإرسال",
    });
  }

  const { userId, title, body, url, tag, icon, data } = (req.body || {}) as {
    userId?: string;
    title: string;
    body: string;
    url?: string;
    tag?: string;
    icon?: string;
    data?: any;
  };

  if (!title || !body) {
    return res
      .status(400)
      .json({ success: false, error: "العنوان والمحتوى مطلوبان" });
  }

  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const contact = process.env.WEB_PUSH_CONTACT || "mailto:noreply@example.com";

  if (!publicKey || !privateKey) {
    return res
      .status(500)
      .json({ success: false, error: "مفاتيح VAPID غير مضبوطة في البيئة" });
  }

  try {
    webpush.setVapidDetails(contact, publicKey, privateKey);
  } catch (e) {
    return res.status(500).json({ success: false, error: "فشل ضبط VAPID" });
  }

  try {
    // جلب كل الاشتراكات المسجلة
    const rows = await prisma.system_settings.findMany({
      where: { key: { startsWith: "web_push:" } },
    });

    // تصفية حسب المستخدم إذا تم تمرير userId
    const targets = rows.filter((r: any) => {
      if (!r?.value?.subscription) return false;
      if (userId && r?.value?.userId !== userId) return false;
      return true;
    });

    if (targets.length === 0) {
      return res
        .status(200)
        .json({ success: true, sent: 0, message: "لا توجد اشتراكات مطابقة" });
    }

    const payload = JSON.stringify({ title, body, url, tag, icon, data });

    let sent = 0;
    const toDelete: string[] = [];

    await Promise.all(
      targets.map(async (t: any) => {
        try {
          await webpush.sendNotification(t.value.subscription, payload, {
            TTL: 60,
          });
          sent += 1;
        } catch (err: any) {
          const status = err?.statusCode || err?.status || 0;
          // إزالة الاشتراكات غير الصالحة
          if (status === 404 || status === 410) {
            toDelete.push(t.key);
          }
        }
      }),
    );

    // تنظيف الاشتراكات المنتهية
    if (toDelete.length > 0) {
      await Promise.all(
        toDelete.map((k) =>
          prisma.system_settings
            .delete({ where: { key: k } })
            .catch(() => null),
        ),
      );
    }

    return res
      .status(200)
      .json({ success: true, sent, cleaned: toDelete.length });
  } catch (error: any) {
    console.error("خطأ في إرسال Web Push:", error);
    return res
      .status(500)
      .json({ success: false, error: "خطأ داخلي في الخادم أثناء الإرسال" });
  }
}
