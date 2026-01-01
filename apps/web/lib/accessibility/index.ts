// @ts-nocheck
/**
 * ============================================================
 * UNIFIED ACCESSIBILITY SYSTEM - نظام إمكانية الوصول الموحد
 * ============================================================
 * يدعم: ARIA, Keyboard Navigation, Screen Readers, Focus Management
 */

// ============================================================
// TYPES
// ============================================================

export interface AriaProps {
    role?: string;
    'aria-label'?: string;
    'aria-labelledby'?: string;
    'aria-describedby'?: string;
    'aria-expanded'?: boolean;
    'aria-selected'?: boolean;
    'aria-checked'?: boolean | 'mixed';
    'aria-disabled'?: boolean;
    'aria-hidden'?: boolean;
    'aria-live'?: 'off' | 'polite' | 'assertive';
    'aria-atomic'?: boolean;
    'aria-busy'?: boolean;
    'aria-controls'?: string;
    'aria-current'?: boolean | 'page' | 'step' | 'location' | 'date' | 'time';
    'aria-haspopup'?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
    'aria-pressed'?: boolean | 'mixed';
    'aria-valuemin'?: number;
    'aria-valuemax'?: number;
    'aria-valuenow'?: number;
    'aria-valuetext'?: string;
    tabIndex?: number;
}

export interface KeyboardConfig {
    onEnter?: () => void;
    onEscape?: () => void;
    onArrowUp?: () => void;
    onArrowDown?: () => void;
    onArrowLeft?: () => void;
    onArrowRight?: () => void;
    onTab?: (e: KeyboardEvent) => void;
    onSpace?: () => void;
    onHome?: () => void;
    onEnd?: () => void;
    preventDefault?: boolean;
}

export interface FocusTrapConfig {
    containerId: string;
    initialFocusId?: string;
    returnFocusOnClose?: boolean;
    escapeDeactivates?: boolean;
}

export interface AnnouncementConfig {
    message: string;
    priority?: 'polite' | 'assertive';
    clearAfter?: number;
}

// ============================================================
// ARIA HELPERS
// ============================================================

/**
 * Generate ARIA props for common patterns
 */
export const aria = {
    // Button with expanded state
    expandable: (expanded: boolean, controls?: string): AriaProps => ({
        'aria-expanded': expanded,
        'aria-controls': controls,
    }),

    // Checkbox state
    checkbox: (checked: boolean | 'mixed'): AriaProps => ({
        role: 'checkbox',
        'aria-checked': checked,
    }),

    // Tab panel
    tab: (selected: boolean, controls: string): AriaProps => ({
        role: 'tab',
        'aria-selected': selected,
        'aria-controls': controls,
        tabIndex: selected ? 0 : -1,
    }),

    // Tab panel content
    tabPanel: (labelledBy: string, hidden: boolean): AriaProps => ({
        role: 'tabpanel',
        'aria-labelledby': labelledBy,
        'aria-hidden': hidden,
        tabIndex: 0,
    }),

    // Menu button
    menuButton: (expanded: boolean, menuId: string): AriaProps => ({
        'aria-haspopup': 'menu',
        'aria-expanded': expanded,
        'aria-controls': menuId,
    }),

    // Menu item
    menuItem: (disabled?: boolean): AriaProps => ({
        role: 'menuitem',
        'aria-disabled': disabled,
        tabIndex: -1,
    }),

    // Dialog/Modal
    dialog: (labelId: string, descriptionId?: string): AriaProps => ({
        role: 'dialog',
        'aria-modal': true,
        'aria-labelledby': labelId,
        'aria-describedby': descriptionId,
    }),

    // Alert dialog
    alertDialog: (labelId: string, descriptionId?: string): AriaProps => ({
        role: 'alertdialog',
        'aria-modal': true,
        'aria-labelledby': labelId,
        'aria-describedby': descriptionId,
    }),

    // Progress bar
    progress: (value: number, max: number = 100, label?: string): AriaProps => ({
        role: 'progressbar',
        'aria-valuenow': value,
        'aria-valuemin': 0,
        'aria-valuemax': max,
        'aria-valuetext': label || `${Math.round((value / max) * 100)}%`,
    }),

    // Slider
    slider: (value: number, min: number, max: number, label?: string): AriaProps => ({
        role: 'slider',
        'aria-valuenow': value,
        'aria-valuemin': min,
        'aria-valuemax': max,
        'aria-valuetext': label,
    }),

    // Live region for announcements
    liveRegion: (priority: 'polite' | 'assertive' = 'polite'): AriaProps => ({
        'aria-live': priority,
        'aria-atomic': true,
    }),

    // Hidden from screen readers
    hidden: (): AriaProps => ({
        'aria-hidden': true,
    }),

    // Loading state
    loading: (isLoading: boolean): AriaProps => ({
        'aria-busy': isLoading,
    }),

    // Current page in navigation
    currentPage: (): AriaProps => ({
        'aria-current': 'page',
    }),

    // Required field
    required: (): AriaProps => ({
        'aria-required': true,
    }),

    // Invalid field
    invalid: (hasError: boolean, errorId?: string): AriaProps => ({
        'aria-invalid': hasError,
        'aria-describedby': hasError ? errorId : undefined,
    }),
};

// ============================================================
// KEYBOARD NAVIGATION
// ============================================================

/**
 * Create keyboard event handler
 */
export function createKeyboardHandler(config: KeyboardConfig) {
    return (event: KeyboardEvent) => {
        const { key } = event;

        switch (key) {
            case 'Enter':
                if (config.onEnter) {
                    if (config.preventDefault) event.preventDefault();
                    config.onEnter();
                }
                break;
            case 'Escape':
                if (config.onEscape) {
                    if (config.preventDefault) event.preventDefault();
                    config.onEscape();
                }
                break;
            case 'ArrowUp':
                if (config.onArrowUp) {
                    event.preventDefault();
                    config.onArrowUp();
                }
                break;
            case 'ArrowDown':
                if (config.onArrowDown) {
                    event.preventDefault();
                    config.onArrowDown();
                }
                break;
            case 'ArrowLeft':
                if (config.onArrowLeft) {
                    event.preventDefault();
                    config.onArrowLeft();
                }
                break;
            case 'ArrowRight':
                if (config.onArrowRight) {
                    event.preventDefault();
                    config.onArrowRight();
                }
                break;
            case ' ':
                if (config.onSpace) {
                    event.preventDefault();
                    config.onSpace();
                }
                break;
            case 'Tab':
                if (config.onTab) {
                    config.onTab(event);
                }
                break;
            case 'Home':
                if (config.onHome) {
                    event.preventDefault();
                    config.onHome();
                }
                break;
            case 'End':
                if (config.onEnd) {
                    event.preventDefault();
                    config.onEnd();
                }
                break;
        }
    };
}

/**
 * Hook for keyboard navigation in lists
 */
export function useListNavigation(
    items: HTMLElement[] | NodeListOf<Element>,
    options: { wrap?: boolean; vertical?: boolean; } = {}
) {
    const { wrap = true, vertical = true } = options;
    let currentIndex = 0;

    const focusItem = (index: number) => {
        const itemsArray = Array.from(items);
        if (index >= 0 && index < itemsArray.length) {
            currentIndex = index;
            (itemsArray[index] as HTMLElement).focus();
        }
    };

    const handleKeyDown = createKeyboardHandler({
        onArrowDown: vertical ? () => {
            const next = wrap
                ? (currentIndex + 1) % items.length
                : Math.min(currentIndex + 1, items.length - 1);
            focusItem(next);
        } : undefined,
        onArrowUp: vertical ? () => {
            const prev = wrap
                ? (currentIndex - 1 + items.length) % items.length
                : Math.max(currentIndex - 1, 0);
            focusItem(prev);
        } : undefined,
        onArrowRight: !vertical ? () => {
            const next = wrap
                ? (currentIndex + 1) % items.length
                : Math.min(currentIndex + 1, items.length - 1);
            focusItem(next);
        } : undefined,
        onArrowLeft: !vertical ? () => {
            const prev = wrap
                ? (currentIndex - 1 + items.length) % items.length
                : Math.max(currentIndex - 1, 0);
            focusItem(prev);
        } : undefined,
        onHome: () => focusItem(0),
        onEnd: () => focusItem(items.length - 1),
    });

    return { handleKeyDown, focusItem, getCurrentIndex: () => currentIndex };
}

// ============================================================
// FOCUS MANAGEMENT
// ============================================================

let focusTrapStack: FocusTrapConfig[] = [];
let previouslyFocused: HTMLElement | null = null;

/**
 * Activate focus trap
 */
export function activateFocusTrap(config: FocusTrapConfig) {
    previouslyFocused = document.activeElement as HTMLElement;
    focusTrapStack.push(config);

    const container = document.getElementById(config.containerId);
    if (!container) return;

    // Focus initial element or first focusable
    if (config.initialFocusId) {
        const initial = document.getElementById(config.initialFocusId);
        initial?.focus();
    } else {
        const focusable = getFocusableElements(container);
        if (focusable.length > 0) {
            focusable[0].focus();
        }
    }

    // Add escape handler
    if (config.escapeDeactivates) {
        const escHandler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                deactivateFocusTrap();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }

    // Add tab trap handler
    const tabHandler = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
            const focusable = getFocusableElements(container);
            const firstFocusable = focusable[0];
            const lastFocusable = focusable[focusable.length - 1];

            if (e.shiftKey && document.activeElement === firstFocusable) {
                e.preventDefault();
                lastFocusable.focus();
            } else if (!e.shiftKey && document.activeElement === lastFocusable) {
                e.preventDefault();
                firstFocusable.focus();
            }
        }
    };
    container.addEventListener('keydown', tabHandler);
}

/**
 * Deactivate current focus trap
 */
export function deactivateFocusTrap() {
    const config = focusTrapStack.pop();
    if (config?.returnFocusOnClose && previouslyFocused) {
        previouslyFocused.focus();
    }
}

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
        '[contenteditable="true"]',
    ];

    return Array.from(
        container.querySelectorAll(focusableSelectors.join(', '))
    ) as HTMLElement[];
}

// ============================================================
// SCREEN READER ANNOUNCEMENTS
// ============================================================

let liveRegion: HTMLElement | null = null;

/**
 * Initialize live region for announcements
 */
export function initLiveRegion() {
    if (typeof document === 'undefined') return;

    if (!liveRegion) {
        liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.setAttribute('role', 'status');
        liveRegion.style.cssText = `
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    `;
        document.body.appendChild(liveRegion);
    }
}

/**
 * Announce message to screen readers
 */
export function announce(config: AnnouncementConfig | string) {
    const { message, priority = 'polite', clearAfter = 5000 } =
        typeof config === 'string' ? { message: config } : config;

    initLiveRegion();

    if (!liveRegion) return;

    liveRegion.setAttribute('aria-live', priority);
    liveRegion.textContent = message;

    if (clearAfter > 0) {
        setTimeout(() => {
            if (liveRegion) liveRegion.textContent = '';
        }, clearAfter);
    }
}

// Arabic-specific announcements
export const announceAr = {
    loading: () => announce('جاري التحميل...'),
    loaded: () => announce('تم التحميل بنجاح'),
    error: (msg?: string) => announce(msg || 'حدث خطأ'),
    success: (msg?: string) => announce(msg || 'تمت العملية بنجاح'),
    pageChange: (title: string) => announce(`تم الانتقال إلى ${title}`),
    formError: (count: number) => announce(`يوجد ${count} خطأ في النموذج`),
    itemSelected: (name: string) => announce(`تم اختيار ${name}`),
    itemRemoved: (name: string) => announce(`تم إزالة ${name}`),
    menuOpened: () => announce('تم فتح القائمة'),
    menuClosed: () => announce('تم إغلاق القائمة'),
    dialogOpened: (title: string) => announce(`تم فتح نافذة ${title}`),
    dialogClosed: () => announce('تم إغلاق النافذة'),
    searchResults: (count: number) => announce(`تم العثور على ${count} نتيجة`),
    noResults: () => announce('لا توجد نتائج'),
    countdown: (seconds: number) => announce(`متبقي ${seconds} ثانية`),
    bidPlaced: (amount: number) => announce(`تم وضع مزايدة بقيمة ${amount} دينار`),
    outbid: () => announce({ message: 'تم تجاوز مزايدتك!', priority: 'assertive' }),
    auctionEnding: (minutes: number) => announce({
        message: `المزاد ينتهي خلال ${minutes} دقيقة!`,
        priority: 'assertive'
    }),
};

// ============================================================
// SKIP LINKS
// ============================================================

export interface SkipLink {
    id: string;
    label: string;
    target: string;
}

export const defaultSkipLinks: SkipLink[] = [
    { id: 'skip-main', label: 'انتقل إلى المحتوى الرئيسي', target: '#main-content' },
    { id: 'skip-nav', label: 'انتقل إلى التنقل', target: '#main-navigation' },
    { id: 'skip-search', label: 'انتقل إلى البحث', target: '#search-form' },
    { id: 'skip-footer', label: 'انتقل إلى التذييل', target: '#footer' },
];

// ============================================================
// HIGH CONTRAST MODE
// ============================================================

export function toggleHighContrast(enable?: boolean) {
    if (typeof document === 'undefined') return;

    const current = document.documentElement.classList.contains('high-contrast');
    const shouldEnable = enable ?? !current;

    if (shouldEnable) {
        document.documentElement.classList.add('high-contrast');
        localStorage.setItem('high-contrast', 'true');
        announce('تم تفعيل وضع التباين العالي');
    } else {
        document.documentElement.classList.remove('high-contrast');
        localStorage.setItem('high-contrast', 'false');
        announce('تم إلغاء وضع التباين العالي');
    }

    return shouldEnable;
}

export function initHighContrast() {
    if (typeof localStorage === 'undefined') return;

    const saved = localStorage.getItem('high-contrast');
    if (saved === 'true') {
        document.documentElement.classList.add('high-contrast');
    }
}

// ============================================================
// REDUCED MOTION
// ============================================================

export function prefersReducedMotion(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// ============================================================
// EXPORTS
// ============================================================

export default {
    aria,
    createKeyboardHandler,
    useListNavigation,
    activateFocusTrap,
    deactivateFocusTrap,
    getFocusableElements,
    announce,
    announceAr,
    initLiveRegion,
    toggleHighContrast,
    initHighContrast,
    prefersReducedMotion,
    defaultSkipLinks,
};
