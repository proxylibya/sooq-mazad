import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

const DEFAULT_BRANDING_SETTINGS = {
  logoType: 'text' as 'text' | 'image',
  logoImageUrl: '',
  siteName: 'سوق المزاد',
  siteDescription: 'منصة المزادات الأولى في ليبيا',
  showLogoInNavbar: true,
  showSiteNameInNavbar: true,
};

type BrandingSettings = typeof DEFAULT_BRANDING_SETTINGS;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const record = await prisma.system_settings.findFirst({
      where: { key: 'site_branding' },
    });

    if (!record || !record.value) {
      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
      return res.status(200).json({
        success: true,
        settings: DEFAULT_BRANDING_SETTINGS,
      });
    }

    const value =
      typeof record.value === 'string' ? JSON.parse(record.value) : (record.value as BrandingSettings);

    const settings: BrandingSettings = {
      ...DEFAULT_BRANDING_SETTINGS,
      ...value,
    };

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');

    return res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json({
      success: true,
      settings: DEFAULT_BRANDING_SETTINGS,
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined,
    });
  }
}

