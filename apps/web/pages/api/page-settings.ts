// API بسيط لإعدادات الصفحات
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // إعدادات افتراضية للصفحات
    const defaultSettings = {
      homepage: {
        hero_banner: { visible: true, interactive: true },
        search_bar: { visible: true, interactive: true },
        main_categories: { visible: true, interactive: true },
        premium_cars_ads: { visible: true, interactive: true },
        featured_auctions: { visible: true, interactive: true },
        business_packages: { visible: true, interactive: true },
      },
      auctions: {
        auction_list: { visible: true, interactive: true },
        filters: { visible: true, interactive: true },
        search: { visible: true, interactive: true },
      },
      marketplace: {
        car_list: { visible: true, interactive: true },
        filters: { visible: true, interactive: true },
        search: { visible: true, interactive: true },
      },
    };

    return res.status(200).json({
      success: true,
      settings: defaultSettings,
    });
  } catch (error) {
    console.error('خطأ في جلب إعدادات الصفحات:', error);

    return res.status(500).json({
      success: false,
      error: 'فشل في جلب إعدادات الصفحات',
    });
  }
}
