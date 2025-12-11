/**
 * Hydration Error Handler - للتوافقية
 */

/**
 * Safe API Call - يدعم نمطين:
 * 1. safeApiCall(url, options) - لطلبات fetch مباشرة
 * 2. safeApiCall(fn, fallback) - لتغليف أي promise
 */
export function safeApiCall<T>(
    urlOrFn: string | (() => Promise<T>),
    optionsOrFallback?: RequestInit | T
): Promise<T> {
    // إذا كان المعامل الأول string، فهو URL
    if (typeof urlOrFn === 'string') {
        const url = urlOrFn;
        const options = optionsOrFallback as RequestInit | undefined;

        return fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(options?.headers || {}),
            },
            credentials: 'same-origin', // إرسال cookies مع الطلب
        })
            .then(async (response) => {
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || data.message || 'حدث خطأ في الخادم');
                }
                return data as T;
            })
            .catch((error) => {
                console.error('[API Error]', error);
                throw error;
            });
    }

    // إذا كان function، استخدم النمط القديم
    const fn = urlOrFn;
    const fallback = optionsOrFallback as T | undefined;

    return fn().catch((error) => {
        console.error('[API Error]', error);
        if (fallback !== undefined) {
            return fallback;
        }
        throw error;
    });
}

export function suppressHydrationWarning(): void {
    if (typeof window !== 'undefined') {
        const originalError = console.error;
        console.error = (...args) => {
            if (args[0]?.includes?.('Hydration') || args[0]?.includes?.('hydration')) {
                return;
            }
            originalError.apply(console, args);
        };
    }
}

export default { safeApiCall, suppressHydrationWarning };
