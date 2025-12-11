import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

const DEFAULT_SETTINGS = {
  siteName: 'سوق المزاد',
  siteDescription: 'منصة المزادات الأولى في ليبيا',
  siteTitle: 'موقع مزاد السيارات',
  welcomeMessage: 'مرحباً بكم في موقع مزاد السيارات',
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      let settings = await prisma.site_settings.findFirst();

      if (!settings) {
        settings = await prisma.site_settings.create({
          data: DEFAULT_SETTINGS,
        });
      }

      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
      return res.status(200).json(settings);
    } catch (error) {
      console.error('Error fetching site settings:', error);
      return res.status(200).json(DEFAULT_SETTINGS);
    }
  } else if (req.method === 'PUT') {
    try {
      const { siteName, siteDescription, siteTitle, welcomeMessage } = req.body;

      let settings = await prisma.site_settings.findFirst();

      if (!settings) {
        settings = await prisma.site_settings.create({
          data: {
            siteName: siteName || DEFAULT_SETTINGS.siteName,
            siteDescription: siteDescription || DEFAULT_SETTINGS.siteDescription,
            siteTitle: siteTitle || DEFAULT_SETTINGS.siteTitle,
            welcomeMessage: welcomeMessage || DEFAULT_SETTINGS.welcomeMessage,
          },
        });
      } else {
        settings = await prisma.site_settings.update({
          where: { id: settings.id },
          data: {
            siteName,
            siteDescription,
            siteTitle,
            welcomeMessage,
          },
        });
      }

      return res.status(200).json(settings);
    } catch (error) {
      console.error('Error updating site settings:', error);
      return res.status(500).json({ error: 'Failed to update settings' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
