import { ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { formatPublicId, copyPublicIdToClipboard } from '../utils/advancedPublicIdHelpers';

interface PublicIdBadgeProps {
  publicId: number | null | undefined;
  variant?: 'default' | 'compact' | 'large';
  showCopyButton?: boolean;
  className?: string;
}

/**
 * 🆔 مكون عرض المعرف العام للمستخدم
 * 
 * يعرض publicId بشكل احترافي مع إمكانية النسخ
 */
export default function PublicIdBadge({ 
  publicId, 
  variant = 'default',
  showCopyButton = true,
  className = ''
}: PublicIdBadgeProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!publicId) return;
    
    const success = await copyPublicIdToClipboard(publicId);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!publicId) {
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-400 ${className}`}>
        <span className="font-mono">ID: ------</span>
      </div>
    );
  }

  // أحجام مختلفة
  const sizes = {
    compact: 'text-xs px-2 py-1',
    default: 'text-sm px-3 py-1.5',
    large: 'text-base px-4 py-2'
  };

  return (
    <div 
      className={`inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 ${sizes[variant]} ${className}`}
      title="المعرف العام للمستخدم"
    >
      {/* الأيقونة */}
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
        <span className="text-xs font-bold">#</span>
      </div>

      {/* الرقم */}
      <span className="font-mono font-bold text-blue-900 select-all text-lg tracking-wide">
        {formatPublicId(publicId)}
      </span>

      {/* زر النسخ */}
      {showCopyButton && (
        <button
          onClick={handleCopy}
          className="rounded p-1 transition-all hover:bg-blue-200 active:scale-95"
          title="نسخ المعرف"
          type="button"
        >
          {copied ? (
            <CheckIcon className="h-4 w-4 text-green-600" />
          ) : (
            <ClipboardDocumentIcon className="h-4 w-4 text-blue-600" />
          )}
        </button>
      )}

      {/* رسالة تم النسخ */}
      {copied && (
        <span className="animate-fade-in text-xs font-medium text-green-600">
          تم النسخ!
        </span>
      )}
    </div>
  );
}
