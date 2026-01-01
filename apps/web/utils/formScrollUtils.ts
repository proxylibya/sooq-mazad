/**
 * Form Scroll Utilities
 * أدوات التوجه التلقائي للحقول الفارغة في النماذج
 *
 * الميزات:
 * - التوجه المباشر لأول حقل فارغ عند الضغط على Submit
 * - إظهار الحقل أمام المستخدم (smooth scroll)
 * - Focus تلقائي على الحقل
 * - تسليط الضوء على الحقل بتأثير بصري
 */

export interface ScrollToFieldOptions {
  /** المسافة من أعلى الصفحة (pixels) */
  offset?: number;
  /** نوع الحركة */
  behavior?: ScrollBehavior;
  /** تفعيل focus تلقائي */
  focus?: boolean;
  /** تفعيل التأثير البصري (highlight) */
  highlight?: boolean;
  /** مدة التأثير البصري (ms) */
  highlightDuration?: number;
}

/**
 * التوجه لحقل معين بناءً على اسمه
 */
export const scrollToField = (fieldName: string, options: ScrollToFieldOptions = {}): boolean => {
  const {
    offset = 100,
    behavior = 'smooth',
    focus = true,
    highlight = true,
    highlightDuration = 2000,
  } = options;

  try {
    // البحث عن الحقل بطرق متعددة
    let element: HTMLElement | null = null;

    // 1. البحث بـ name attribute
    element = document.querySelector(`[name="${fieldName}"]`) as HTMLElement;

    // 2. البحث بـ id
    if (!element) {
      element = document.getElementById(fieldName);
    }

    // 3. البحث بـ data-field attribute
    if (!element) {
      element = document.querySelector(`[data-field="${fieldName}"]`) as HTMLElement;
    }

    // 4. البحث في label والانتقال للحقل المرتبط
    if (!element) {
      const label = Array.from(document.querySelectorAll('label')).find(
        (l) => l.textContent?.includes(fieldName) || l.getAttribute('for') === fieldName,
      );
      if (label) {
        const forAttr = label.getAttribute('for');
        if (forAttr) {
          element = document.getElementById(forAttr);
        }
      }
    }

    if (!element) {
      return false;
    }

    // الحصول على موقع العنصر
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    // التوجه للعنصر
    window.scrollTo({
      top: offsetPosition,
      behavior,
    });

    // Focus على الحقل
    if (focus) {
      setTimeout(() => {
        element?.focus({ preventScroll: true });
      }, 100);
    }

    // إضافة تأثير بصري
    if (highlight) {
      highlightField(element, highlightDuration);
    }

    return true;
  } catch (error) {
    console.error('[formScrollUtils] خطأ في التوجه للحقل:', error);
    return false;
  }
};

/**
 * التوجه لأول حقل خطأ في النموذج
 */
export const scrollToFirstError = (
  errors: Record<string, string>,
  options: ScrollToFieldOptions = {},
): boolean => {
  // الحصول على أول حقل يحتوي على خطأ
  const firstErrorField = Object.keys(errors).find((key) => errors[key]);

  if (!firstErrorField) {
    return false;
  }

  return scrollToField(firstErrorField, options);
};

/**
 * تسليط الضوء على حقل معين بتأثير بصري
 */
export const highlightField = (element: HTMLElement, duration: number = 2000): void => {
  try {
    // البحث عن الـ input/select/textarea الفعلي
    let targetElement = element;
    if (!['INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName)) {
      const input = element.querySelector('input, select, textarea') as HTMLElement;
      if (input) {
        targetElement = input;
      }
    }

    // حفظ الـ styles الأصلية
    const originalTransition = targetElement.style.transition;
    const originalBoxShadow = targetElement.style.boxShadow;
    const originalBorder = targetElement.style.border;

    // إضافة التأثير
    targetElement.style.transition = 'all 0.3s ease';
    targetElement.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.4)';
    targetElement.style.border = '2px solid rgb(239, 68, 68)';

    // إزالة التأثير بعد المدة المحددة
    setTimeout(() => {
      targetElement.style.transition = originalTransition;
      targetElement.style.boxShadow = originalBoxShadow;
      targetElement.style.border = originalBorder;
    }, duration);
  } catch (error) {
    console.error('[formScrollUtils] خطأ في تسليط الضوء على الحقل:', error);
  }
};

/**
 * إضافة data-field attributes لجميع حقول النموذج تلقائياً
 * يساعد في تسهيل البحث عن الحقول
 */
export const addFieldAttributes = (formRef: HTMLFormElement): void => {
  try {
    const inputs = formRef.querySelectorAll('input, select, textarea');
    inputs.forEach((input) => {
      const name = input.getAttribute('name');
      if (name && !input.getAttribute('data-field')) {
        input.setAttribute('data-field', name);
      }
    });
  } catch (error) {
    console.error('[formScrollUtils] خطأ في إضافة attributes:', error);
  }
};

/**
 * التحقق من ظهور الحقل في viewport
 */
export const isFieldInViewport = (fieldName: string): boolean => {
  try {
    const element = document.querySelector(
      `[name="${fieldName}"], #${fieldName}, [data-field="${fieldName}"]`,
    );
    if (!element) return false;

    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  } catch {
    return false;
  }
};

/**
 * التوجه لقسم معين في النموذج (Collapsible sections)
 */
export const scrollToSection = (sectionId: string, options: ScrollToFieldOptions = {}): boolean => {
  const { offset = 80, behavior = 'smooth' } = options;

  try {
    const section = document.getElementById(sectionId);
    if (!section) return false;

    const sectionPosition = section.getBoundingClientRect().top;
    const offsetPosition = sectionPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior,
    });

    return true;
  } catch (error) {
    console.error('[formScrollUtils] خطأ في التوجه للقسم:', error);
    return false;
  }
};

/**
 * فتح القسم القابل للطي وإظهار الحقل
 */
export const expandAndScrollToField = (
  fieldName: string,
  sectionId?: string,
  options: ScrollToFieldOptions = {},
): boolean => {
  try {
    // فتح القسم إذا كان موجوداً
    if (sectionId) {
      const section = document.getElementById(sectionId);
      if (section) {
        // البحث عن زر التوسيع
        const expandButton = section.querySelector('[data-expand-toggle]');
        if (expandButton) {
          (expandButton as HTMLElement).click();
        }
      }
    }

    // الانتظار قليلاً حتى يكتمل التوسيع ثم التوجه للحقل
    setTimeout(() => {
      scrollToField(fieldName, options);
    }, 300);

    return true;
  } catch (error) {
    console.error('[formScrollUtils] خطأ في فتح القسم والتوجه:', error);
    return false;
  }
};
