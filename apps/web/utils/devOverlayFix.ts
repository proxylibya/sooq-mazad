/**
 * إصلاح overlay التطوير
 */

/**
 * إخفاء overlay الخطأ في وضع التطوير
 */
export function hideDevOverlay(): void {
    if (typeof window === 'undefined') return;
    if (process.env.NODE_ENV !== 'development') return;

    // إخفاء Next.js error overlay
    const style = document.createElement('style');
    style.innerHTML = `
    nextjs-portal { display: none !important; }
    #__next-build-watcher { display: none !important; }
  `;
    document.head.appendChild(style);
}

/**
 * تخصيص overlay الخطأ
 */
export function customizeDevOverlay(): void {
    if (typeof window === 'undefined') return;
    if (process.env.NODE_ENV !== 'development') return;

    // تخصيص المظهر
    const style = document.createElement('style');
    style.innerHTML = `
    nextjs-portal {
      --color-background: rgba(0, 0, 0, 0.9) !important;
      --color-text: #fff !important;
    }
  `;
    document.head.appendChild(style);
}

/**
 * منع ظهور overlay لأخطاء معينة
 */
export function suppressOverlayForErrors(patterns: (string | RegExp)[]): void {
    if (typeof window === 'undefined') return;
    if (process.env.NODE_ENV !== 'development') return;

    const originalError = console.error;
    console.error = (...args: unknown[]) => {
        const message = args.map(String).join(' ');
        const shouldSuppress = patterns.some((pattern) => {
            if (typeof pattern === 'string') {
                return message.includes(pattern);
            }
            return pattern.test(message);
        });

        if (!shouldSuppress) {
            originalError.apply(console, args);
        }
    };
}

/**
 * تهيئة إصلاحات overlay التطوير
 */
export function initDevOverlayFix(): void {
    if (process.env.NODE_ENV !== 'development') return;

    // منع أخطاء HMR الشائعة
    suppressOverlayForErrors([
        'Fast refresh',
        'websocket',
        'WebSocket',
        'chunk',
        'ChunkLoadError',
    ]);
}

/**
 * إصلاحات البوابات
 */
export function initPortalFixes(): void {
    if (typeof window === 'undefined') return;
    if (process.env.NODE_ENV !== 'development') return;

    // إصلاح مشاكل Portal الشائعة
    const style = document.createElement('style');
    style.innerHTML = `
    [data-radix-portal] { z-index: 9999 !important; }
    .portal-container { position: relative; z-index: 9999; }
  `;
    document.head.appendChild(style);
}

export default {
    hideDevOverlay,
    customizeDevOverlay,
    suppressOverlayForErrors,
    initDevOverlayFix,
    initPortalFixes,
};
