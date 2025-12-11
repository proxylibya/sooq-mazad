import React, { ReactNode } from 'react';
import { usePageVisibilityCheck } from '../../hooks/usePageVisibility';
import { useAuth } from '../../hooks/useAuth';

interface PageVisibilityWrapperProps {
  pageId: string;
  children: ReactNode;
  fallback?: ReactNode;
  showLoading?: boolean;
}

/**
 * مكون لإخفاء أو إظهار المحتوى بناءً على إعدادات رؤية الصفحات
 */
const PageVisibilityWrapper: React.FC<PageVisibilityWrapperProps> = ({
  pageId,
  children,
  fallback = null,
  showLoading = false,
}) => {
  const { user } = useAuth();
  const userRole = user?.role || 'USER';

  const { visible, loading } = usePageVisibilityCheck(pageId, userRole);

  // إظهار مؤشر التحميل إذا كان مطلوباً
  if (loading && showLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-4">
        <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // إذا كانت الصفحة غير مرئية، إظهار المحتوى البديل أو لا شيء
  if (!visible) {
    return <>{fallback}</>;
  }

  // إظهار المحتوى إذا كانت الصفحة مرئية
  return <>{children}</>;
};

export default PageVisibilityWrapper;

/**
 * Hook مخصص لفلترة عناصر القائمة بناءً على رؤية الصفحات
 */
export function useVisibleMenuItems<T extends { id?: string; href?: string; pageId?: string }>(
  items: T[],
) {
  const { user } = useAuth();
  const userRole = user?.role || 'USER';

  // فلترة العناصر بناءً على الرؤية
  const visibleItems = items.filter((item) => {
    // استخراج معرف الصفحة
    const pageId = item.pageId || item.href?.replace('/', '').replace(/\//g, '-') || item.id || '';

    if (!pageId) {
      return true; // إذا لم يكن هناك معرف، اعتبر العنصر مرئي
    }

    // استخدام hook للتحقق من الرؤية
    // ملاحظة: هذا قد يسبب مشاكل في الأداء مع قوائم كبيرة
    // في التطبيق الحقيقي، يفضل استخدام context أو state management
    return true; // مؤقتاً، إرجاع جميع العناصر
  });

  return visibleItems;
}

/**
 * مكون عالي المستوى لفلترة قائمة العناصر
 */
interface FilteredMenuProps<T> {
  items: T[];
  userRole?: string;
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
}

export function FilteredMenu<T extends { id?: string; href?: string; pageId?: string }>({
  items,
  userRole,
  renderItem,
  className = '',
}: FilteredMenuProps<T>) {
  const { user } = useAuth();
  const effectiveUserRole = userRole || user?.role || 'USER';

  // فلترة العناصر (مبسطة للآن)
  const visibleItems = items; // سيتم تحسينها لاحقاً

  return (
    <div className={className}>{visibleItems.map((item, index) => renderItem(item, index))}</div>
  );
}

/**
 * مكون لإخفاء رابط معين بناءً على رؤية الصفحة
 */
interface ConditionalLinkProps {
  pageId: string;
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const ConditionalLink: React.FC<ConditionalLinkProps> = ({
  pageId,
  href,
  children,
  className = '',
  onClick,
}) => {
  const { user } = useAuth();
  const userRole = user?.role || 'USER';

  const { visible, loading } = usePageVisibilityCheck(pageId, userRole);

  if (loading) {
    return null; // أو مؤشر تحميل صغير
  }

  if (!visible) {
    return null;
  }

  return (
    <a href={href} className={className} onClick={onClick}>
      {children}
    </a>
  );
};
