import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/middleware/auth';
import { CursorPaginationHelper } from '@/utils/pagination-helpers';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authUser = await verifyToken(req);
    const queryUserId = (req.query.userId as string | undefined) || undefined;
    const userId = authUser?.id || queryUserId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { cursor, pageSize = '50', conversationId, unreadOnly } = req.query;

    // بناء where clause حسب مشاركة المستخدم في المحادثات
    const baseWhere: any = {
      conversations: {
        conversation_participants: {
          some: { userId },
        },
      },
    };

    if (conversationId && typeof conversationId === 'string') {
      baseWhere.conversationId = conversationId;
    }

    if (unreadOnly === 'true') {
      baseWhere.senderId = { not: userId };
      baseWhere.message_reads = { none: { userId } };
    }

    // استخدام cursor-based pagination للرسائل
    const result = await CursorPaginationHelper.query(
      prisma.messages,
      cursor ? (cursor as string) : null,
      parseInt(pageSize as string),
      baseWhere,
      { createdAt: 'desc' },
    );

    // إثراء الرسائل بمعلومات المرسل والمستلم وحالة القراءة
    const messagesWithUsers = await Promise.all(
      result.data.map(async (message: any) => {
        const [sender, conv, readEntry] = await Promise.all([
          prisma.users.findUnique({
            where: { id: message.senderId },
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true,
              accountType: true,
            },
          }),
          prisma.conversations.findUnique({
            where: { id: message.conversationId },
            include: {
              conversation_participants: {
                include: {
                  users: { select: { id: true, name: true, profileImage: true, accountType: true } },
                },
              },
            },
          }),
          prisma.message_reads.findUnique({
            where: { messageId_userId: { messageId: message.id, userId } as any },
          }),
        ]);

        const participants = conv?.conversation_participants || [];
        const otherUser = participants
          .map((p) => p.users)
          .find((u) => u && u.id !== message.senderId) || null;

        return {
          ...message,
          receiverId: otherUser?.id || null,
          read: !!readEntry,
          sender: sender || null,
          receiver: otherUser || null,
        };
      }),
    );

    return res.status(200).json({
      data: messagesWithUsers,
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    });
  } catch (error) {
    console.error('Error fetching paginated messages:', error);
    return res.status(500).json({ error: 'Failed to fetch messages' });
  }
}
