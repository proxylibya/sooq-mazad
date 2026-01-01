import React, { useMemo } from 'react';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import ShareIcon from '@heroicons/react/24/outline/ShareIcon';
import { useFavorites } from '../../hooks/useFavorites';

export type OverlayItemType = 'auction' | 'marketplace' | 'car' | 'showroom' | 'transport';

interface OverlayActionsProps {
  type: OverlayItemType;
  itemId: string;
  className?: string; // لتخصيص الستايل الخارجي للحاوية
  buttonClassName?: string; // لتخصيص الستايل للأزرار
  disabledFavorite?: boolean;
  disabledShare?: boolean;
  requireLogin?: (reason: string, cb: () => void) => void;
  onShare?: () => void; // إن تم تحديدها تُستخدم مباشرة
  shareTitle?: string;
  shareText?: string;
  shareUrl?: string; // إن لم تُحدد سنستخدم window.location.href
  onNotify?: (type: 'success' | 'error' | 'warning', message: string) => void; // إشعارات اختيارية من الصفحة
  stopPropagation?: boolean; // لمنع فتح الصومن عند ضغط الزر داخل المعرض
}

/**
 * مجموعة أزرار عائمة موحدة (مفضلة + مشاركة) للاستخدام فوق الصور.
 * تتكامل مع نظام المفضلة الموحد وتدعم مشاركة أصلية مع fallback نسخ الرابط.
 */
const OverlayActions: React.FC<OverlayActionsProps> = ({
  type,
  itemId,
  className = 'absolute right-4 top-4 flex gap-2',
  buttonClassName = 'rounded-full bg-white/90 p-2 shadow-lg backdrop-blur-sm transition-colors hover:bg-white',
  disabledFavorite = false,
  disabledShare = false,
  requireLogin,
  onShare,
  shareTitle,
  shareText,
  shareUrl,
  onNotify,
  stopPropagation = true,
}) => {
  const { isFavorite, toggleFavorite } = useFavorites();

  const favState = useMemo(() => {
    if (!itemId) return false;
    switch (type) {
      case 'auction':
        return isFavorite(undefined, itemId);
      case 'marketplace':
      case 'car':
        return isFavorite(itemId);
      case 'showroom':
        return isFavorite(undefined, undefined, itemId);
      case 'transport':
        return isFavorite(undefined, undefined, undefined, itemId);
      default:
        return false;
    }
  }, [isFavorite, itemId, type]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    if (stopPropagation) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (disabledFavorite || !itemId) return;

    const exec = async () => {
      let ok = false;
      switch (type) {
        case 'auction':
          ok = await toggleFavorite(undefined, itemId);
          break;
        case 'marketplace':
        case 'car':
          ok = await toggleFavorite(itemId);
          break;
        case 'showroom':
          ok = await toggleFavorite(undefined, undefined, itemId);
          break;
        case 'transport':
          ok = await toggleFavorite(undefined, undefined, undefined, itemId);
          break;
      }
      if (onNotify)
        onNotify(ok ? 'success' : 'error', ok ? 'تم تحديث المفضلة' : 'تعذر تحديث المفضلة');
    };

    if (requireLogin) requireLogin('لإضافة للمفضلة', exec);
    else await exec();
  };

  const handleShare = async (e: React.MouseEvent) => {
    if (stopPropagation) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (disabledShare) return;

    if (onShare) {
      onShare();
      return;
    }

    try {
      const url = shareUrl || (typeof window !== 'undefined' ? window.location.href : '');
      const data: ShareData = {
        title: shareTitle || 'مشاركة الإمنلان',
        text: shareText || 'شاهد هذا الإعلان على سوق مزاد',
        url,
      };

      if (typeof navigator !== 'undefined' && (navigator as any).share) {
        await (navigator as any).share(data);
        if (onNotify) onNotify('success', 'تمت المشاركة');
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        if (onNotify) onNotify('success', 'تم نسخ الرابط');
        else alert('تم نسخ الرابط');
      } else {
        // Fallback أخير
        if (onNotify) onNotify('warning', 'انسخ الرابط يدوياً: ' + url);
        else alert('انسخ الرابط يدوياً: ' + url);
      }
    } catch (err) {
      if (onNotify) onNotify('error', 'فشلت عملية المشاركة');
    }
  };

  return (
    <div className={className}>
      {/* زر المفضلة */}
      <button
        onClick={handleToggleFavorite}
        className={buttonClassName + (disabledFavorite ? ' cursor-not-allowed opacity-50' : '')}
        disabled={disabledFavorite}
        aria-label={favState ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
        title={favState ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
      >
        {favState ? (
          <HeartSolid className="h-5 w-5 text-red-500" />
        ) : (
          <HeartOutline className="h-5 w-5 text-gray-600" />
        )}
      </button>

      {/* زر المشاركة */}
      <button
        onClick={handleShare}
        className={buttonClassName + (disabledShare ? ' cursor-not-allowed opacity-50' : '')}
        disabled={disabledShare}
        aria-label="مشاركة"
        title="مشاركة"
      >
        <ShareIcon className="h-5 w-5 text-gray-600" />
      </button>
    </div>
  );
};

export default OverlayActions;
