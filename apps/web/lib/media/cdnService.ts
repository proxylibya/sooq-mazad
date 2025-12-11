/**
 * خدمة CDN لتحسين توزيع المحتوى
 */

/**
 * إعدادات CDN
 */
interface CDNConfig {
  enabled: boolean;
  baseUrl: string;
  regions?: string[];
  cacheTTL?: number;
}

/**
 * أنواع المحتوى
 */
export enum ContentType {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
  STATIC = 'static',
}

/**
 * خدمة CDN
 */
export class CDNService {
  private config: CDNConfig;

  constructor(config?: Partial<CDNConfig>) {
    this.config = {
      enabled: process.env.CDN_ENABLED === 'true',
      baseUrl: process.env.CDN_URL || '',
      regions: process.env.CDN_REGIONS?.split(',') || ['global'],
      cacheTTL: parseInt(process.env.CDN_CACHE_TTL || '86400'),
      ...config,
    };
  }

  /**
   * الحصول على URL من CDN
   */
  getUrl(path: string, contentType: ContentType = ContentType.IMAGE): string {
    if (!this.config.enabled || !this.config.baseUrl) {
      return path;
    }

    // إزالة البادئة إذا كانت موجودة
    const cleanPath = path.replace(/^\//, '');

    // إضافة بادئة حسب نوع المحتوى
    const prefix = this.getContentPrefix(contentType);

    return `${this.config.baseUrl}/${prefix}/${cleanPath}`;
  }

  /**
   * الحصول على URLs متعددة للصيغ المختلفة
   */
  getMultiFormatUrls(
    basePath: string,
    formats: string[] = ['webp', 'avif', 'jpg'],
  ): Record<string, string> {
    const urls: Record<string, string> = {};
    const pathWithoutExt = basePath.replace(/\.[^/.]+$/, '');

    for (const format of formats) {
      const path = `${pathWithoutExt}.${format}`;
      urls[format] = this.getUrl(path, ContentType.IMAGE);
    }

    return urls;
  }

  /**
   * إنشاء srcset للصور Responsive
   */
  generateSrcSet(basePath: string, sizes: number[] = [320, 640, 1280, 1920]): string {
    if (!this.config.enabled) {
      return '';
    }

    const pathWithoutExt = basePath.replace(/\.[^/.]+$/, '');
    const ext = basePath.split('.').pop();

    const srcSetParts = sizes.map((size) => {
      const path = `${pathWithoutExt}_${size}w.${ext}`;
      const url = this.getUrl(path, ContentType.IMAGE);
      return `${url} ${size}w`;
    });

    return srcSetParts.join(', ');
  }

  /**
   * تنقية الكاش لملف معين
   */
  async purgeCache(path: string): Promise<boolean> {
    if (!this.config.enabled) {
      return false;
    }

    try {
      // هنا يمكن إضافة API call لـ CDN provider
      // مثال: Cloudflare, AWS CloudFront, etc.

      console.log(`تنقية الكاش لـ: ${path}`);
      return true;
    } catch (error) {
      console.error('فشل تنقية الكاش:', error);
      return false;
    }
  }

  /**
   * تنقية الكاش لعدة ملفات
   */
  async purgeCacheBatch(paths: string[]): Promise<boolean> {
    if (!this.config.enabled) {
      return false;
    }

    try {
      for (const path of paths) {
        await this.purgeCache(path);
      }
      return true;
    } catch (error) {
      console.error('فشل تنقية الكاش الجماعية:', error);
      return false;
    }
  }

  /**
   * الحصول على بادئة المحتوى
   */
  private getContentPrefix(contentType: ContentType): string {
    switch (contentType) {
      case ContentType.IMAGE:
        return 'images';
      case ContentType.VIDEO:
        return 'videos';
      case ContentType.DOCUMENT:
        return 'documents';
      case ContentType.STATIC:
        return 'static';
      default:
        return 'assets';
    }
  }

  /**
   * التحقق من حالة CDN
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * الحصول على URL للصورة المحسنة
   */
  getOptimizedImageUrl(
    originalPath: string,
    options: {
      width?: number;
      height?: number;
      format?: 'webp' | 'avif' | 'jpg' | 'png';
      quality?: number;
    } = {},
  ): string {
    if (!this.config.enabled) {
      return originalPath;
    }

    const { width, height, format = 'webp', quality = 80 } = options;

    const pathWithoutExt = originalPath.replace(/\.[^/.]+$/, '');

    let optimizedPath = pathWithoutExt;

    if (width || height) {
      optimizedPath += `_${width || 'auto'}x${height || 'auto'}`;
    }

    optimizedPath += `_q${quality}.${format}`;

    return this.getUrl(optimizedPath, ContentType.IMAGE);
  }

  /**
   * الحصول على معلومات الإحصائيات
   */
  getStats(): {
    enabled: boolean;
    baseUrl: string;
    regions: string[];
    cacheTTL: number;
  } {
    return {
      enabled: this.config.enabled,
      baseUrl: this.config.baseUrl,
      regions: this.config.regions || [],
      cacheTTL: this.config.cacheTTL || 0,
    };
  }
}

// Singleton instance
export const cdnService = new CDNService();

export default cdnService;
