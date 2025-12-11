/**
 * Smart Message Cache - يستخدم النظام الموحد
 */
import { cache } from '../core/unified-cache';

const NAMESPACE = 'messages';

interface Message {
    id: string;
    senderId: string;
    content: string;
    type: string;
    createdAt: string;
    status?: string;
    [key: string]: unknown;
}

interface Conversation {
    id: string;
    [key: string]: unknown;
}

interface CacheStats {
    hits: number;
    misses: number;
    size: number;
    hitRate: number;
}

// In-memory stats tracking
let stats: CacheStats = { hits: 0, misses: 0, size: 0, hitRate: 0 };

export const smartMessageCache = {
    async get<T>(key: string): Promise<T | null> {
        const result = await cache.get<T>(key, NAMESPACE);
        if (result) {
            stats.hits++;
        } else {
            stats.misses++;
        }
        stats.hitRate = stats.hits / (stats.hits + stats.misses) || 0;
        return result;
    },

    async set<T>(key: string, data: T, ttl = 300): Promise<boolean> {
        stats.size++;
        return cache.set(key, data, { ttl, namespace: NAMESPACE });
    },

    async invalidate(pattern: string): Promise<number> {
        return cache.invalidate(`${NAMESPACE}:${pattern}`);
    },

    async invalidateByPrefix(prefix: string): Promise<number> {
        return cache.invalidate(`${NAMESPACE}:${prefix}*`);
    },

    async clear(): Promise<boolean> {
        stats = { hits: 0, misses: 0, size: 0, hitRate: 0 };
        return (await cache.invalidate(`${NAMESPACE}:*`)) > 0;
    },

    async size(): Promise<number> {
        const keys = await cache.keys(`${NAMESPACE}:*`);
        stats.size = keys.length;
        return keys.length;
    },

    // === Extended methods for useEnterpriseMessages ===

    getStats(): CacheStats {
        return { ...stats };
    },

    async addMessage(conversationId: string, message: Message): Promise<void> {
        const key = `conv:${conversationId}:messages`;
        const existing = (await cache.get<Message[]>(key, NAMESPACE)) || [];
        // Avoid duplicates
        if (!existing.some(m => m.id === message.id)) {
            existing.push(message);
            await this.set(key, existing);
        }
    },

    async addMessages(conversationId: string, messages: Message[]): Promise<void> {
        const key = `conv:${conversationId}:messages`;
        const existing = (await cache.get<Message[]>(key, NAMESPACE)) || [];
        const existingIds = new Set(existing.map(m => m.id));
        const newMessages = messages.filter(m => !existingIds.has(m.id));
        if (newMessages.length > 0) {
            await this.set(key, [...existing, ...newMessages]);
        }
    },

    async getMessages(conversationId: string): Promise<Message[]> {
        const key = `conv:${conversationId}:messages`;
        return (await cache.get<Message[]>(key, NAMESPACE)) || [];
    },

    async updateMessageStatus(messageId: string, status: string): Promise<void> {
        // This is a no-op in simple cache; full implementation would iterate conversations
        // For now, we just track it was called
        await this.set(`msg:${messageId}:status`, status);
    },

    async addConversation(conversation: Conversation): Promise<void> {
        const key = `conversation:${conversation.id}`;
        await this.set(key, conversation);
    },
};

export default smartMessageCache;
