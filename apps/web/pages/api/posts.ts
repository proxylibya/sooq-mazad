import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';
import { withApiRateLimit, RateLimitConfigs } from '../../utils/rateLimiter';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET': {
        const posts = await prisma.post.findMany({
          orderBy: { createdAt: 'desc' },
        });
        return res.status(200).json(posts);
      }
      case 'POST': {
        const { title, content, authorId } = req.body || {};
        if (!title || !content) {
          return res.status(400).json({ error: 'title and content are required' });
        }
        const post = await prisma.post.create({
          data: { title, content, authorId: authorId || null },
        });
        return res.status(201).json(post);
      }
      default: {
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: 'Method not allowed' });
      }
    }
  } catch (error: any) {
    console.error('Posts API error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  } finally {
    // Prisma Singleton: لا تقم بقطع الاتصال هنا
  }
}

export default withApiRateLimit(handler, RateLimitConfigs.API_GENERAL);
