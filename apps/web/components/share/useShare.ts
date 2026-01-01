/**
 * useShare Hook - خطاف المشاركة الموحد
 * يوفر طريقة سهلة لاستخدام نظام المشاركة في أي مكون
 */

import { useCallback, useState } from 'react';
import type { ShareData } from './UnifiedShareModal';

interface UseShareOptions {
    onShareSuccess?: (platform: string) => void;
    onCopySuccess?: () => void;
    onError?: (error: Error) => void;
}

interface UseShareReturn {
    isOpen: boolean;
    openShare: (data: ShareData) => void;
    closeShare: () => void;
    shareData: ShareData | null;
    share: (data: ShareData) => Promise<boolean>;
    copyToClipboard: (text: string) => Promise<boolean>;
}

/**
 * Hook موحد للمشاركة
 * @param options - خيارات المشاركة
 * @returns دوال وحالات للتحكم في المشاركة
 */
export function useShare(options: UseShareOptions = {}): UseShareReturn {
    const { onShareSuccess, onCopySuccess, onError } = options;

    const [isOpen, setIsOpen] = useState(false);
    const [shareData, setShareData] = useState<ShareData | null>(null);

    /**
     * فتح نافذة المشاركة
     */
    const openShare = useCallback((data: ShareData) => {
        setShareData(data);
        setIsOpen(true);
    }, []);

    /**
     * إغلاق نافذة المشاركة
     */
    const closeShare = useCallback(() => {
        setIsOpen(false);
        // تأخير حذف البيانات للسماح للأنيميشن بالانتهاء
        setTimeout(() => setShareData(null), 300);
    }, []);

    /**
     * مشاركة مباشرة باستخدام Web Share API
     */
    const share = useCallback(async (data: ShareData): Promise<boolean> => {
        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share({
                    title: data.title,
                    text: data.description,
                    url: data.url,
                });
                onShareSuccess?.('native');
                return true;
            } catch (error) {
                if ((error as Error).name !== 'AbortError') {
                    console.error('فشل في المشاركة:', error);
                    onError?.(error as Error);
                }
                return false;
            }
        }

        // إذا كان Web Share API غير متاح، افتح النافذة
        openShare(data);
        return true;
    }, [onShareSuccess, onError, openShare]);

    /**
     * نسخ نص إلى الحافظة
     */
    const copyToClipboard = useCallback(async (text: string): Promise<boolean> => {
        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(text);
            } else {
                // Fallback للمتصفحات القديمة
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-9999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            }
            onCopySuccess?.();
            return true;
        } catch (error) {
            console.error('فشل في نسخ النص:', error);
            onError?.(error as Error);
            return false;
        }
    }, [onCopySuccess, onError]);

    return {
        isOpen,
        openShare,
        closeShare,
        shareData,
        share,
        copyToClipboard,
    };
}

/**
 * دالة مساعدة للمشاركة المباشرة
 */
export async function shareContent(data: ShareData): Promise<boolean> {
    if (typeof navigator !== 'undefined' && navigator.share) {
        try {
            await navigator.share({
                title: data.title,
                text: data.description,
                url: data.url,
            });
            return true;
        } catch (error) {
            if ((error as Error).name !== 'AbortError') {
                console.error('فشل في المشاركة:', error);
            }
            return false;
        }
    }
    return false;
}

/**
 * دالة مساعدة لنسخ الرابط
 */
export async function copyLink(url: string): Promise<boolean> {
    try {
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(url);
            return true;
        }
        // Fallback
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        return success;
    } catch {
        return false;
    }
}

export default useShare;
