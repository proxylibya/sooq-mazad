import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

function endpointKey(endpoint: string) {
  try {
    const h = crypto.createHash('sha1').update(endpoint).digest('hex');
    return `web_push:${h}`;
  } catch {
    // fallback بسيط إذا لم يتوفر crypto لأي سبب
    return `web_push:${endpoint.slice(-24)}`;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: 'طريقة غير مدعومة' });
  }

  try {
    const { userId, subscription } = req.body || {};
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ success: false, error: 'اشتراك Push غير صالح' });
    }

    const key = endpointKey(subscription.endpoint);
    const ua = req.headers['user-agent'] || null;

    // حفظ الاشتراك في system_settings
    await prisma.system_settings.upsert({
      where: { key },
      create: {
        key,
        value: {
          userId: userId || null,
          subscription,
          ua,
          createdAt: new Date().toISOString(),
          lastSeenAt: new Date().toISOString(),
        },
      },
      update: {
        value: {
          userId: userId || null,
          subscription,
          ua,
          updatedAt: new Date().toISOString(),
          lastSeenAt: new Date().toISOString(),
        },
      },
    });

    // فهرس لكل مستخدم (اختياري)
    if (userId) {
      const userKey = `web_push_user:${userId}`;
      const existing = await prisma.system_settings.findUnique({
        where: { key: userKey },
      });
      const list: string[] = Array.isArray(existing?.value?.endpoints)
        ? (existing!.value!.endpoints as string[])
        : [];
      if (!list.includes(key)) list.push(key);

      if (existing) {
        await prisma.system_settings.update({
          where: { key: userKey },
          data: {
            value: { endpoints: list, updatedAt: new Date().toISOString() },
          },
        });
      } else {
        await prisma.system_settings.create({
          data: {
            key: userKey,
            value: { endpoints: list, createdAt: new Date().toISOString() },
          },
        });
      }
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('خطأ في API الاشتراك في Push:', error);
    return res.status(500).json({ success: false, error: 'خطأ داخلي في الخادم' });
  }
}
