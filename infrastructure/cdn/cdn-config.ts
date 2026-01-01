/**
 * 🌐 CDN Configuration
 * إعدادات شبكة توزيع المحتوى
 */

// =====================================
// Types & Interfaces
// =====================================

export interface CDNConfig {
    enabled: boolean;
    provider: 'cloudflare' | 'cloudfront' | 'bunny' | 'custom';
    baseUrl: string;
    imageOptimization: {
        enabled: boolean;
        formats: string[];
        quality: number;
        sizes: number[];
    };
    caching: {
        staticAssets: number;    // seconds
        images: number;          // seconds
        api: number;             // seconds
        html: number;            // seconds
    };
    purgeEndpoint?: string;
    apiKey?: string;
}

export interface ImageOptimizationOptions {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpeg' | 'png';
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

// =====================================
// Default Configuration
// =====================================

export const defaultCDNConfig: CDNConfig = {
    enabled: process.env.CDN_ENABLED === 'true',
    provider: (process.env.CDN_PROVIDER as CDNConfig['provider']) || 'cloudflare',
    baseUrl: process.env.CDN_BASE_URL || '',
    imageOptimization: {
        enabled: true,
        formats: ['avif', 'webp', 'jpeg'],
        quality: 80,
        sizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    },
    caching: {
        staticAssets: 31536000,  // 1 year
        images: 2592000,         // 30 days
        api: 0,                  // no cache
        html: 3600,              // 1 hour
    },
    purgeEndpoint: process.env.CDN_PURGE_ENDPOINT,
    apiKey: process.env.CDN_API_KEY,
};

// =====================================
// CDN URL Builder
// =====================================

export function buildCDNUrl(
    path: string,
    options?: ImageOptimizationOptions
): string {
    const config = defaultCDNConfig;

    if (!config.enabled || !config.baseUrl) {
        return path;
    }

    let url = `${config.baseUrl}${path}`;

    // Add image optimization parameters for Cloudflare
    if (options && config.provider === 'cloudflare') {
        const params = new URLSearchParams();

        if (options.width) params.set('width', options.width.toString());
        if (options.height) params.set('height', options.height.toString());
        if (options.quality) params.set('quality', options.quality.toString());
        if (options.format) params.set('format', options.format);
        if (options.fit) params.set('fit', options.fit);

        if (params.toString()) {
            url = `${config.baseUrl}/cdn-cgi/image/${params.toString()}${path}`;
        }
    }

    return url;
}

// =====================================
// Cache Purge Functions
// =====================================

export async function purgeCDNCache(paths: string[]): Promise<boolean> {
    const config = defaultCDNConfig;

    if (!config.enabled || !config.purgeEndpoint || !config.apiKey) {
        console.warn('CDN purge not configured');
        return false;
    }

    try {
        const response = await fetch(config.purgeEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`,
            },
            body: JSON.stringify({
                files: paths.map(p => `${config.baseUrl}${p}`),
            }),
        });

        if (!response.ok) {
            throw new Error(`CDN purge failed: ${response.statusText}`);
        }

        console.log(`✅ CDN cache purged for ${paths.length} files`);
        return true;
    } catch (error) {
        console.error('CDN purge error:', error);
        return false;
    }
}

export async function purgeAllCDNCache(): Promise<boolean> {
    const config = defaultCDNConfig;

    if (!config.enabled || !config.purgeEndpoint || !config.apiKey) {
        console.warn('CDN purge not configured');
        return false;
    }

    try {
        const response = await fetch(config.purgeEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`,
            },
            body: JSON.stringify({
                purge_everything: true,
            }),
        });

        if (!response.ok) {
            throw new Error(`CDN purge all failed: ${response.statusText}`);
        }

        console.log('✅ All CDN cache purged');
        return true;
    } catch (error) {
        console.error('CDN purge all error:', error);
        return false;
    }
}

// =====================================
// Next.js Image Loader for CDN
// =====================================

export function cdnImageLoader({
    src,
    width,
    quality,
}: {
    src: string;
    width: number;
    quality?: number;
}): string {
    const config = defaultCDNConfig;

    if (!config.enabled || !config.baseUrl) {
        return src;
    }

    return buildCDNUrl(src, {
        width,
        quality: quality || config.imageOptimization.quality,
        format: 'webp',
    });
}

// =====================================
// Exports for next.config.js
// =====================================

export const nextImageConfig = {
    loader: defaultCDNConfig.enabled ? 'custom' : 'default',
    loaderFile: defaultCDNConfig.enabled ? './lib/cdn-loader.js' : undefined,
    domains: [
        'sooqmazad.ly',
        'cdn.sooqmazad.ly',
        'images.sooqmazad.ly',
        'localhost',
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
};

export default {
    config: defaultCDNConfig,
    buildUrl: buildCDNUrl,
    purgeCache: purgeCDNCache,
    purgeAll: purgeAllCDNCache,
    imageLoader: cdnImageLoader,
    nextImageConfig,
};
