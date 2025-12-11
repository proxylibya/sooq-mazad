import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const authUser = await verifyToken(req);
    let { userId } = req.query as { userId?: string };
    const perConversation = (req.query.perConversation as string | undefined) || undefined;

    if (!userId) {
      userId = authUser?.id;
    }

    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId مطلوب' });
    }

    if (authUser?.id && String(authUser.id) !== String(userId)) {
      return res.status(403).json({ success: false, error: 'غير مسموح' });
    }

    // Per conversation grouping when requested
    if (perConversation === 'true') {
      const grouped = await prisma.messages.groupBy({
        by: ['conversationId'],
        where: {
          senderId: { not: userId },
          conversations: {
            conversation_participants: {
              some: { userId },
            },
          },
          message_reads: {
            none: { userId },
          },
        },
        _count: { _all: true },
      });

      type GroupRow = { conversationId: string; _count: { _all: number } };
      const unreadByConversation = (grouped as GroupRow[]).reduce<Record<string, number>>(
        (acc, g) => {
          acc[String(g.conversationId)] = g._count._all;
          return acc;
        },
        {},
      );

      return res.status(200).json({ success: true, unreadByConversation });
    }

    // Total unread count (default)
    const unreadCount = await prisma.messages.count({
      where: {
        senderId: { not: userId },
        conversations: {
          conversation_participants: {
            some: { userId },
          },
        },
        message_reads: {
          none: { userId },
        },
      },
    });

    return res.status(200).json({ success: true, unreadCount });
  } catch (error: unknown) {
    console.error('Unread count error:', error);
    const details = error instanceof Error ? error.message : 'unknown';
    return res.status(500).json({ success: false, error: 'Server error', details });
  }
}
