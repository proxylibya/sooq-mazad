/**
 * Hook موحد لبدء المحادثات
 * Unified Start Conversation Hook
 * 
 * يستخدم في جميع صفحات تفاصيل الإعلانات
 */

import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import useAuth from './useAuth';

interface StartConversationParams {
    // معرف المستخدم الآخر (البائع/مقدم الخدمة)
    otherUserId: string;
    // اسم المستخدم الآخر (للعرض)
    otherUserName?: string;
    // نوع الإعلان
    type: 'car' | 'auction' | 'transport' | 'direct';
    // معرف الإعلان (اختياري)
    itemId?: string;
    // رسالة أولية (اختياري)
    initialMessage?: string;
}

interface UseStartConversationResult {
    // بدء المحادثة
    startConversation: (params: StartConversationParams) => Promise<void>;
    // حالة التحميل
    loading: boolean;
    // رسالة الخطأ
    error: string | null;
    // مسح الخطأ
    clearError: () => void;
}

export function useStartConversation(): UseStartConversationResult {
    const router = useRouter();
    const { user, getToken } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const startConversation = useCallback(
        async (params: StartConversationParams) => {
            const { otherUserId, otherUserName, type, itemId, initialMessage } = params;

            // التحقق من تسجيل الدخول
            if (!user?.id) {
                // حفظ الصفحة الحالية للعودة إليها بعد تسجيل الدخول
                const currentPath = router.asPath;
                router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
                return;
            }

            // منع المستخدم من مراسلة نفسه
            if (otherUserId === user.id) {
                setError('لا يمكنك مراسلة نفسك');
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const token = getToken?.();

                const response = await fetch('/api/start-conversation', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    body: JSON.stringify({
                        otherUserId,
                        type,
                        itemId,
                        initialMessage,
                    }),
                });

                const data = await response.json();

                if (data.success && data.data?.conversationId) {
                    // التوجه إلى صفحة الرسائل مع المحادثة
                    router.push(`/messages?convId=${data.data.conversationId}`);
                } else if (response.status === 401) {
                    // غير مسجل دخول - توجيه لصفحة تسجيل الدخول
                    const currentPath = router.asPath;
                    router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
                } else {
                    // خطأ آخر - استخدام الطريقة البديلة
                    console.warn('[useStartConversation] فشل API، استخدام الطريقة البديلة:', data.error);

                    // الطريقة البديلة: التوجه مع query params
                    const queryParams = new URLSearchParams({
                        chat: otherUserId,
                        ...(otherUserName && { name: otherUserName }),
                        ...(type && { type }),
                        ...(itemId && { itemId }),
                    });

                    router.push(`/messages?${queryParams.toString()}`);
                }
            } catch (err) {
                console.error('[useStartConversation] خطأ:', err);

                // في حالة الخطأ، استخدام الطريقة البديلة
                const queryParams = new URLSearchParams({
                    chat: otherUserId,
                    ...(otherUserName && { name: otherUserName }),
                    ...(type && { type }),
                    ...(itemId && { itemId }),
                });

                router.push(`/messages?${queryParams.toString()}`);
            } finally {
                setLoading(false);
            }
        },
        [user?.id, router, getToken]
    );

    return {
        startConversation,
        loading,
        error,
        clearError,
    };
}

export default useStartConversation;
