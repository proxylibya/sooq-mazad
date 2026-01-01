// @ts-nocheck
/**
 * Enterprise Image Optimization System
 * نظام تحسين الصور المتقدم
 */

// ============================================
// Types
// ============================================

export interface ImageOptimizationConfig {
    quality: number;
    maxWidth: number;
    maxHeight: number;
    format: 'webp' | 'avif' | 'jpeg' | 'png';
    lazy: boolean;
    placeholder: 'blur' | 'empty' | 'shimmer';
}

export interface OptimizedImage {
    src: string;
    srcSet: string;
    sizes: string;
    width: number;
    height: number;
    blurDataURL?: string;
}

// ============================================
// Default Configuration
// ============================================

export const defaultImageConfig: ImageOptimizationConfig = {
    quality: 80,
    maxWidth: 1920,
    maxHeight: 1080,
    format: 'webp',
    lazy: true,
    placeholder: 'blur',
};

// ============================================
// Image Optimization Utilities
// ============================================

export function generateSrcSet(
    baseUrl: string,
    widths: number[] = [320, 640, 960, 1280, 1920]
): string {
    return widths
        .map(w => `${baseUrl}?w=${w} ${w}w`)
        .join(', ');
}

export function generateSizes(breakpoints: Record<string, number> = {}): string {
    const defaultBreakpoints = {
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280,
        '2xl': 1536,
        ...breakpoints,
    };

    return Object.entries(defaultBreakpoints)
        .sort(([, a], [, b]) => b - a)
        .map(([, width]) => `(max-width: ${width}px) ${width}px`)
        .concat(['100vw'])
        .join(', ');
}

// ============================================
// Blur Data URL Generator
// ============================================

export function generateBlurPlaceholder(width: number = 10, height: number = 10): string {
    // Simple SVG placeholder
    const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#e5e7eb"/>
    </svg>
  `.trim();

    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

// ============================================
// Image Loader
// ============================================

export interface ImageLoaderProps {
    src: string;
    width: number;
    quality?: number;
}

export function customImageLoader({ src, width, quality = 80 }: ImageLoaderProps): string {
    // Check if it's an external URL
    if (src.startsWith('http')) {
        return src;
    }

    // Local image optimization
    return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
}

// ============================================
// Image Preload
// ============================================

export function preloadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = src;
    });
}

export async function preloadImages(srcs: string[]): Promise<void[]> {
    return Promise.all(srcs.map(preloadImage));
}

// ============================================
// Critical Images Detection
// ============================================

export function getCriticalImages(viewport: { width: number; height: number; }): string[] {
    // Logic to detect images above the fold
    const criticalImages: string[] = [];

    if (typeof document !== 'undefined') {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            const rect = img.getBoundingClientRect();
            if (rect.top < viewport.height && rect.bottom > 0) {
                criticalImages.push(img.src);
            }
        });
    }

    return criticalImages;
}

// ============================================
// Image Format Support Detection
// ============================================

export async function detectWebPSupport(): Promise<boolean> {
    if (typeof document === 'undefined') return true;

    return new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve(img.width > 0 && img.height > 0);
        img.onerror = () => resolve(false);
        img.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
    });
}

export async function detectAVIFSupport(): Promise<boolean> {
    if (typeof document === 'undefined') return false;

    return new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve(img.width > 0 && img.height > 0);
        img.onerror = () => resolve(false);
        img.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKBzgABc0YkAA=';
    });
}

// ============================================
// Export
// ============================================

export default {
    generateSrcSet,
    generateSizes,
    generateBlurPlaceholder,
    customImageLoader,
    preloadImage,
    preloadImages,
    getCriticalImages,
    detectWebPSupport,
    detectAVIFSupport,
};
