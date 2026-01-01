/**
 * خدمة تحسين الصور مع دعم WebP/AVIF
 *
 * @author سوق مزاد
 * @version 1.0.0
 */

import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

/**
 * أنواع الصور المدعومة
 */
export enum ImageFormat {
  WEBP = 'webp',
  AVIF = 'avif',
  JPEG = 'jpeg',
  PNG = 'png',
}

/**
 * أحجام الصور المختلفة
 */
export interface ImageSizes {
  thumbnail: { width: number; height: number };
  small: { width: number; height: number };
  medium: { width: number; height: number };
  large: { width: number; height: number };
  original: { width?: number; height?: number };
}

/**
 * الأحجام الافتراضية للصور
 */
export const DEFAULT_IMAGE_SIZES: ImageSizes = {
  thumbnail: { width: 150, height: 150 },
  small: { width: 320, height: 240 },
  medium: { width: 640, height: 480 },
  large: { width: 1280, height: 960 },
  original: {},
};

/**
 * إعدادات تحسين الصور
 */
export interface OptimizationOptions {
  quality?: number;
  formats?: ImageFormat[];
  sizes?: (keyof ImageSizes)[];
  generatePlaceholder?: boolean;
  placeholderSize?: number;
}

/**
 * نتيجة تحسين الصورة
 */
export interface OptimizedImageResult {
  original: string;
  optimized: {
    [key in ImageFormat]?: {
      [size: string]: {
        path: string;
        size: number;
        width: number;
        height: number;
      };
    };
  };
  placeholder?: string;
  metadata: {
    format: string;
    width: number;
    height: number;
    size: number;
  };
}

/**
 * خدمة تحسين الصور
 */
export class ImageOptimizationService {
  private outputDir: string;
  private cdnUrl: string | null;

  constructor(outputDir: string = 'public/optimized', cdnUrl: string | null = null) {
    this.outputDir = outputDir;
    this.cdnUrl = cdnUrl;
  }

  /**
   * تحسين صورة واحدة
   */
  async optimizeImage(
    inputPath: string,
    options: OptimizationOptions = {},
  ): Promise<OptimizedImageResult> {
    const {
      quality = 80,
      formats = [ImageFormat.WEBP, ImageFormat.AVIF, ImageFormat.JPEG],
      sizes = ['thumbnail', 'small', 'medium', 'large'],
      generatePlaceholder = true,
      placeholderSize = 20,
    } = options;

    try {
      // قراءة الصورة الأصلية
      const image = sharp(inputPath);
      const metadata = await image.metadata();

      const result: OptimizedImageResult = {
        original: inputPath,
        optimized: {},
        metadata: {
          format: metadata.format || 'unknown',
          width: metadata.width || 0,
          height: metadata.height || 0,
          size: 0,
        },
      };

      // إنشاء مجلد الإخراج
      await this.ensureDirectory(this.outputDir);

      const fileName = path.parse(inputPath).name;

      // توليد الصور بأحجام وصيغ مختلفة
      for (const format of formats) {
        result.optimized[format] = {};

        for (const sizeName of sizes) {
          const sizeConfig = DEFAULT_IMAGE_SIZES[sizeName as keyof ImageSizes];

          const outputFileName = `${fileName}_${sizeName}.${format}`;
          const outputPath = path.join(this.outputDir, outputFileName);

          // تغيير الحجم والتحسين
          let processedImage = image.clone();

          if (sizeConfig.width || sizeConfig.height) {
            processedImage = processedImage.resize(sizeConfig.width, sizeConfig.height, {
              fit: 'cover',
              position: 'center',
            });
          }

          // تطبيق التنسيق والجودة
          switch (format) {
            case ImageFormat.WEBP:
              processedImage = processedImage.webp({ quality });
              break;
            case ImageFormat.AVIF:
              processedImage = processedImage.avif({ quality });
              break;
            case ImageFormat.JPEG:
              processedImage = processedImage.jpeg({
                quality,
                progressive: true,
              });
              break;
            case ImageFormat.PNG:
              processedImage = processedImage.png({ quality });
              break;
          }

          await processedImage.toFile(outputPath);

          // الحصول على معلومات الملف المحسّن
          const stats = await fs.stat(outputPath);
          const optimizedMetadata = await sharp(outputPath).metadata();

          result.optimized[format]![sizeName] = {
            path: this.getCdnUrl(outputPath),
            size: stats.size,
            width: optimizedMetadata.width || 0,
            height: optimizedMetadata.height || 0,
          };
        }
      }

      // توليد placeholder صغير جداً
      if (generatePlaceholder) {
        const placeholderPath = path.join(this.outputDir, `${fileName}_placeholder.jpeg`);

        await image
          .clone()
          .resize(placeholderSize, placeholderSize, {
            fit: 'cover',
          })
          .jpeg({ quality: 30 })
          .blur(2)
          .toFile(placeholderPath);

        // تحويل إلى base64
        const placeholderBuffer = await fs.readFile(placeholderPath);
        result.placeholder = `data:image/jpeg;base64,${placeholderBuffer.toString('base64')}`;

        // حذف الملف المؤقت
        await fs.unlink(placeholderPath);
      }

      return result;
    } catch (error) {
      console.error('خطأ في تحسين الصورة:', error);
      throw error;
    }
  }

  /**
   * تحسين عدة صور دفعة واحدة
   */
  async optimizeBatch(
    inputPaths: string[],
    options: OptimizationOptions = {},
  ): Promise<OptimizedImageResult[]> {
    const results: OptimizedImageResult[] = [];

    for (const inputPath of inputPaths) {
      try {
        const result = await this.optimizeImage(inputPath, options);
        results.push(result);
      } catch (error) {
        console.error(`فشل تحسين الصورة ${inputPath}:`, error);
      }
    }

    return results;
  }

  /**
   * إنشاء responsive srcset
   */
  generateSrcSet(
    optimizedResult: OptimizedImageResult,
    format: ImageFormat = ImageFormat.WEBP,
  ): string {
    const formatData = optimizedResult.optimized[format];
    if (!formatData) return '';

    const srcSetParts: string[] = [];

    for (const [, data] of Object.entries(formatData)) {
      srcSetParts.push(`${data.path} ${data.width}w`);
    }

    return srcSetParts.join(', ');
  }

  /**
   * توليد HTML picture element
   */
  generatePictureElement(
    optimizedResult: OptimizedImageResult,
    alt: string,
    className?: string,
  ): string {
    const sources: string[] = [];

    // AVIF source
    if (optimizedResult.optimized[ImageFormat.AVIF]) {
      const srcSet = this.generateSrcSet(optimizedResult, ImageFormat.AVIF);
      sources.push(`<source type="image/avif" srcset="${srcSet}" />`);
    }

    // WebP source
    if (optimizedResult.optimized[ImageFormat.WEBP]) {
      const srcSet = this.generateSrcSet(optimizedResult, ImageFormat.WEBP);
      sources.push(`<source type="image/webp" srcset="${srcSet}" />`);
    }

    // JPEG fallback
    const jpegData = optimizedResult.optimized[ImageFormat.JPEG];
    const fallbackSrc = jpegData?.medium?.path || jpegData?.small?.path || optimizedResult.original;

    return `
      <picture>
        ${sources.join('\n        ')}
        <img 
          src="${fallbackSrc}" 
          alt="${alt}"
          ${className ? `class="${className}"` : ''}
          loading="lazy"
          decoding="async"
        />
      </picture>
    `;
  }

  /**
   * التأكد من وجود المجلد
   */
  private async ensureDirectory(dir: string): Promise<void> {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      // المجلد موجود بالفعل
    }
  }

  /**
   * الحصول على URL مع CDN إذا كان متاحاً
   */
  private getCdnUrl(localPath: string): string {
    if (this.cdnUrl) {
      const relativePath = localPath.replace(/^public\//, '');
      return `${this.cdnUrl}/${relativePath}`;
    }
    return localPath.replace(/^public/, '');
  }

  /**
   * حساب نسبة التوفير في الحجم
   */
  calculateSavings(
    originalSize: number,
    optimizedSize: number,
  ): { saved: number; percentage: number } {
    const saved = originalSize - optimizedSize;
    const percentage = (saved / originalSize) * 100;
    return { saved, percentage };
  }
}

// Singleton instance
export const imageOptimizer = new ImageOptimizationService(
  'public/optimized',
  process.env.CDN_URL || null,
);

export default imageOptimizer;
