/**
 * ShareModal - مكون المشاركة
 * @deprecated استخدم UnifiedShareModal من '@/components/share' بدلاً من هذا المكون
 * هذا الملف موجود للتوافق مع الكود القديم
 */

import React from 'react';
import UnifiedShareModal from './share/UnifiedShareModal';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
}

/**
 * ShareModal - Wrapper للتوافق مع الكود القديم
 * يستخدم UnifiedShareModal داخلياً
 */
const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  url,
  imageUrl,
}) => {
  return (
    <UnifiedShareModal
      isOpen={isOpen}
      onClose={onClose}
      shareData={{
        title,
        description,
        url,
        imageUrl,
      }}
    />
  );
};

export default ShareModal;
