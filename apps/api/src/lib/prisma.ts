import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
        datasources: {
            db: {
                url: process.env.DATABASE_URL + '&options=-c%20client_encoding=UTF8',
            },
        },
    });

// ضبط client_encoding عند الاتصال
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(prisma as any).$executeRawUnsafe("SET client_encoding = 'UTF8'").catch(() => {
    // تجاهل الخطأ إذا فشل
});

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

// Helper methods from the original app can be added here if needed, 
// for now exposing prisma directly.
export const dbHelpers = {
    prisma,
    // Helper to mark messages as read
    async markMessagesAsRead(conversationId: string, readerId: string) {
        try {
            await prisma.messages.updateMany({
                where: {
                    conversationId: conversationId,
                    NOT: {
                        senderId: readerId
                    },
                    status: {
                        not: 'read'
                    }
                },
                data: {
                    status: 'read',
                    readAt: new Date()
                }
            });
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    },

    // Helper to mark message as delivered
    async markMessageDelivered(messageId: string, userId: string) {
        // NOTE: Simplified logic as per original file
        // In a real app we might want to track who delivered specifically if group chat
        try {
            await prisma.messages.updateMany({
                where: {
                    id: messageId,
                    NOT: {
                        senderId: userId
                    },
                    status: 'sent'
                },
                data: {
                    status: 'delivered'
                }
            });
        } catch (error) {
            console.error('Error marking message as delivered:', error);
        }
    },

    // Check if user is in conversation
    async isUserInConversation(conversationId: string, userId: string): Promise<boolean> {
        const count = await prisma.conversation_participants.count({
            where: {
                conversationId: conversationId,
                userId: userId
            }
        });
        return count > 0;
    }
};
