/**
 * نظام تحديد الموضع الذكي للقوائم المنسدلة
 * Smart Dropdown Positioning System
 */

import * as React from 'react';

export interface DropdownPosition {
  top: number;
  left: number;
  width: number;
  direction: 'down' | 'up';
  alignment: 'left' | 'right' | 'center';
}

export interface DropdownDimensions {
  width: number;
  height: number;
}

export interface ViewportInfo {
  width: number;
  height: number;
  scrollX: number;
  scrollY: number;
}

/**
 * حساب الموضع المثالي للقائمة المنسدلة
 */
export function calculateOptimalDropdownPosition(
  triggerElement: HTMLElement,
  dropdownDimensions: DropdownDimensions,
  options: {
    preferredDirection?: 'down' | 'up';
    preferredAlignment?: 'left' | 'right' | 'center';
    offset?: number;
    padding?: number;
  } = {},
): DropdownPosition {
  const {
    preferredDirection = 'down',
    preferredAlignment = 'right', // RTL default
    offset = 4,
    padding = 16,
  } = options;

  // الحصول على معلومات العنصر المحفز
  const triggerRect = triggerElement.getBoundingClientRect();

  // الحصول على معلومات الشاشة
  const viewport: ViewportInfo = {
    width: window.innerWidth,
    height: window.innerHeight,
    scrollX: window.scrollX,
    scrollY: window.scrollY,
  };

  // حساب المساحة المتاحة في كل اتجاه
  const spaceAbove = triggerRect.top;
  const spaceBelow = viewport.height - triggerRect.bottom;
  const spaceLeft = triggerRect.left;
  const spaceRight = viewport.width - triggerRect.right;

  // تحديد الاتجاه الأمثل (أعلى أم أسفل)
  let direction: 'down' | 'up' = preferredDirection;

  if (preferredDirection === 'down') {
    // إذا لا توجد مساحة كافية أسفل، اعكس إلى أعلى
    if (
      spaceBelow < dropdownDimensions.height + padding &&
      spaceAbove > dropdownDimensions.height + padding
    ) {
      direction = 'up';
    }
  } else {
    // إذا لا توجد مساحة كافية أعلى، اعكس إلى أسفل
    if (
      spaceAbove < dropdownDimensions.height + padding &&
      spaceBelow > dropdownDimensions.height + padding
    ) {
      direction = 'down';
    }
  }

  // تحديد المحاذاة الأمثل (يسار أم يمين أم وسط)
  let alignment: 'left' | 'right' | 'center' = preferredAlignment;

  // للغة العربية RTL، نبدأ من اليمين
  if (preferredAlignment === 'right') {
    // إذا لا توجد مساحة كافية على اليمين، اعكس إلى اليسار
    if (
      spaceRight < dropdownDimensions.width + padding &&
      spaceLeft > dropdownDimensions.width + padding
    ) {
      alignment = 'left';
    }
  } else if (preferredAlignment === 'left') {
    // إذا لا توجد مساحة كافية على اليسار، اعكس إلى اليمين
    if (
      spaceLeft < dropdownDimensions.width + padding &&
      spaceRight > dropdownDimensions.width + padding
    ) {
      alignment = 'right';
    }
  }

  // حساب الموضع النهائي
  let top: number;
  let left: number;
  const width: number = Math.min(dropdownDimensions.width, viewport.width - padding * 2);

  // حساب الموضع العمودي
  if (direction === 'down') {
    top = triggerRect.bottom + viewport.scrollY + offset;
  } else {
    top = triggerRect.top + viewport.scrollY - dropdownDimensions.height - offset;
  }

  // حساب الموضع الأفقي
  switch (alignment) {
    case 'right':
      left = triggerRect.right + viewport.scrollX - width;
      break;
    case 'left':
      left = triggerRect.left + viewport.scrollX;
      break;
    case 'center':
      left = triggerRect.left + viewport.scrollX + (triggerRect.width - width) / 2;
      break;
  }

  // التأكد من عدم تجاوز حدود الشاشة
  left = Math.max(padding, Math.min(left, viewport.width - width - padding));
  top = Math.max(padding, Math.min(top, viewport.height - dropdownDimensions.height - padding));

  return {
    top,
    left,
    width,
    direction,
    alignment,
  };
}

/**
 * تقدير أبعاد القائمة المنسدلة
 */
export function estimateDropdownDimensions(
  optionsCount: number,
  hasSearch: boolean = false,
  itemHeight: number = 40,
  maxHeight: number = 320,
): DropdownDimensions {
  const searchHeight = hasSearch ? 60 : 0;
  const itemsHeight = optionsCount * itemHeight;
  const totalHeight = Math.min(searchHeight + itemsHeight + 16, maxHeight);

  return {
    width: 280, // عرض افتراضي
    height: totalHeight,
  };
}

/**
 * مراقبة تغيير حجم النافذة وإعادة حساب الموضع
 */
export function createDropdownPositionWatcher(
  triggerElement: HTMLElement,
  dropdownElement: HTMLElement,
  dropdownDimensions: DropdownDimensions,
  onPositionUpdate: (position: DropdownPosition) => void,
) {
  const updatePosition = () => {
    const position = calculateOptimalDropdownPosition(triggerElement, dropdownDimensions);
    onPositionUpdate(position);
  };

  // تحديث الموضع عند تغيير حجم النافذة أو التمرير
  const handleResize = () => updatePosition();
  const handleScroll = () => updatePosition();

  window.addEventListener('resize', handleResize);
  window.addEventListener('scroll', handleScroll, true);

  // تحديث أولي
  updatePosition();

  // دالة التنظيف
  return () => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('scroll', handleScroll, true);
  };
}

/**
 * تطبيق الموضع على عنصر القائمة المنسدلة
 */
export function applyDropdownPosition(
  dropdownElement: HTMLElement | null,
  position: DropdownPosition,
) {
  // التحقق من وجود العنصر قبل التطبيق
  if (!dropdownElement) {
    console.warn('تحذير applyDropdownPosition: dropdownElement is null');
    return;
  }

  dropdownElement.style.position = 'fixed';
  dropdownElement.style.top = `${position.top}px`;
  dropdownElement.style.left = `${position.left}px`;
  dropdownElement.style.width = `${position.width}px`;
  dropdownElement.style.zIndex = '99999';

  // إضافة كلاسات CSS للاتجاه والمحاذاة
  dropdownElement.classList.remove(
    'dropdown-up',
    'dropdown-down',
    'dropdown-left',
    'dropdown-right',
    'dropdown-center',
  );
  dropdownElement.classList.add(`dropdown-${position.direction}`);
  dropdownElement.classList.add(`dropdown-${position.alignment}`);
}

/**
 * hook مخصص لاستخدام النظام مع React
 */
export function useSmartDropdownPosition(
  isOpen: boolean,
  triggerRef: { current: HTMLElement | null },
  dropdownRef: { current: HTMLElement | null },
  optionsCount: number,
  hasSearch: boolean = false,
) {
  const [position, setPosition] = React.useState<DropdownPosition | null>(null);

  React.useEffect(() => {
    if (!isOpen || !triggerRef.current || !dropdownRef.current) {
      return;
    }

    const dropdownDimensions = estimateDropdownDimensions(optionsCount, hasSearch);

    const cleanup = createDropdownPositionWatcher(
      triggerRef.current,
      dropdownRef.current,
      dropdownDimensions,
      (newPosition) => {
        setPosition(newPosition);
        applyDropdownPosition(dropdownRef.current, newPosition);
      },
    );

    return cleanup;
  }, [isOpen, optionsCount, hasSearch]);

  return position;
}

export default {
  calculateOptimalDropdownPosition,
  estimateDropdownDimensions,
  createDropdownPositionWatcher,
  applyDropdownPosition,
  useSmartDropdownPosition,
};
