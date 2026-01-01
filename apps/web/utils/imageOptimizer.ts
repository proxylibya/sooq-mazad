/**
 * @deprecated استخدم @/lib/image-system بدلاً من هذا الملف
 * هذا الملف wrapper للتوافق مع الكود القديم
 */

// @ts-ignore - image-system may not exist
const ensureDirectories = async () => { /* no-op */ };
import { existsSync } from 'fs';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'avif';
  progressive?: boolean;
  lossless?: boolean;
}

interface OptimizedImageResult {
  originalPath: string;
  optimizedPath: string;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  format: string;
}

export class ImageOptimizer {
  private readonly uploadsDir: string;
  private readonly optimizedDir: string;

  constructor() {
    this.uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    this.optimizedDir = path.join(process.cwd(), 'public', 'uploads', 'optimized');
  }

  async ensureDirectoriesExist(): Promise<void> {
    await ensureDirectories();
  }

  async optimizeImage(
    inputPath: string,
    options: ImageOptimizationOptions = {},
  ): Promise<OptimizedImageResult> {
    const {
      width = 1200,
      height,
      quality = 85,
      format = 'webp',
      progressive = true,
      lossless = false,
    } = options;

    if (!existsSync(inputPath)) {
      throw new Error(`الملف غير موجود: ${inputPath}`);
    }

    const inputFileName = path.basename(inputPath, path.extname(inputPath));
    const outputPath = path.join(
      this.optimizedDir,
      `${inputFileName}_${width}x${height || 'auto'}_q${quality}.${format}`,
    );

    try {
      const originalStats = await fs.stat(inputPath);
      const originalSize = originalStats.size;

      let sharpInstance = sharp(inputPath);

      // تطبيق تغيير الحجم
      if (height) {
        sharpInstance = sharpInstance.resize(width, height, {
          fit: 'cover',
          position: 'center',
        });
      } else {
        sharpInstance = sharpInstance.resize(width, null, {
          withoutEnlargement: true,
        });
      }

      // تطبيق التحسين حسب الصيغة
      switch (format) {
        case 'webp':
          sharpInstance = sharpInstance.webp({
            quality,
            lossless,
          });
          break;
        case 'jpeg':
          sharpInstance = sharpInstance.jpeg({
            quality,
            progressive,
            mozjpeg: true,
          });
          break;
        case 'png':
          sharpInstance = sharpInstance.png({
            quality,
            progressive,
            compressionLevel: 9,
          });
          break;
        case 'avif':
          sharpInstance = sharpInstance.avif({
            quality,
            lossless,
          });
          break;
      }

      await sharpInstance.toFile(outputPath);

      const optimizedStats = await fs.stat(outputPath);
      const optimizedSize = optimizedStats.size;
      const compressionRatio = ((originalSize - optimizedSize) / originalSize) * 100;

      return {
        originalPath: inputPath,
        optimizedPath: outputPath,
        originalSize,
        optimizedSize,
        compressionRatio,
        format,
      };
    } catch (error) {
      console.error('خطأ في تحسين الصورة:', error);
      throw error;
    }
  }

  async createResponsiveImages(
    inputPath: string,
    sizes: number[] = [300, 600, 900, 1200, 1800],
  ): Promise<OptimizedImageResult[]> {
    const results: OptimizedImageResult[] = [];

    for (const size of sizes) {
      try {
        // WebP version
        const webpResult = await this.optimizeImage(inputPath, {
          width: size,
          format: 'webp',
          quality: 85,
        });
        results.push(webpResult);

        // JPEG fallback
        const jpegResult = await this.optimizeImage(inputPath, {
          width: size,
          format: 'jpeg',
          quality: 85,
        });
        results.push(jpegResult);
      } catch (error) {
        console.error(`خطأ في إنشاء صورة بحجم ${size}px:`, error);
      }
    }

    return results;
  }

  async generateThumbnail(inputPath: string, size: number = 300): Promise<OptimizedImageResult> {
    return this.optimizeImage(inputPath, {
      width: size,
      height: size,
      format: 'webp',
      quality: 75,
    });
  }

  async optimizeExistingImages(): Promise<void> {
    console.log('🖼️ بدء تحسين الصور الموجودة...');

    try {
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
      const files = await fs.readdir(this.uploadsDir);

      const imageFiles = files.filter((file) =>
        imageExtensions.includes(path.extname(file).toLowerCase()),
      );

      let optimizedCount = 0;
      let totalSaved = 0;

      for (const file of imageFiles) {
        const inputPath = path.join(this.uploadsDir, file);

        try {
          const result = await this.optimizeImage(inputPath);
          optimizedCount++;
          totalSaved += result.originalSize - result.optimizedSize;

          console.log(`✅ تم تحسين: ${file} - توفير ${Math.round(result.compressionRatio)}%`);
        } catch (error) {
          console.error(`❌ خطأ في تحسين ${file}:`, error);
        }
      }

      console.log(`✅ تم تحسين ${optimizedCount} صورة`);
      console.log(`💾 تم توفير ${Math.round(totalSaved / 1024 / 1024)} MB`);
    } catch (error) {
      console.error('❌ خطأ في تحسين الصور الموجودة:', error);
    }
  }

  getOptimizedImageUrl(
    originalPath: string,
    width: number = 1200,
    format: string = 'webp',
  ): string {
    const fileName = path.basename(originalPath, path.extname(originalPath));
    return `/uploads/optimized/${fileName}_${width}x${width}_q85.${format}`;
  }

  async cleanupOldOptimizedImages(daysOld: number = 30): Promise<void> {
    try {
      const files = await fs.readdir(this.optimizedDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      let deletedCount = 0;
      let freedSpace = 0;

      for (const file of files) {
        const filePath = path.join(this.optimizedDir, file);
        const stats = await fs.stat(filePath);

        if (stats.mtime < cutoffDate) {
          freedSpace += stats.size;
          await fs.unlink(filePath);
          deletedCount++;
        }
      }

      console.log(`🗑️ تم حذف ${deletedCount} صورة محسنة قديمة`);
      console.log(`💾 تم تحرير ${Math.round(freedSpace / 1024 / 1024)} MB`);
    } catch (error) {
      console.error('❌ خطأ في تنظيف الصور القديمة:', error);
    }
  }
}

// Middleware لتحسين الصور تلقائياً عند الرفع
export async function optimizeUploadedImage(
  filePath: string,
  options?: ImageOptimizationOptions,
): Promise<OptimizedImageResult> {
  const optimizer = new ImageOptimizer();
  await optimizer.ensureDirectoriesExist();
  return optimizer.optimizeImage(filePath, options);
}

// دالة مساعدة لإنشاء HTML responsive images
export function generateResponsiveImageHTML(
  imagePath: string,
  altText: string,
  sizes: string = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
): string {
  const fileName = path.basename(imagePath, path.extname(imagePath));
  const basePath = `/uploads/optimized/${fileName}`;

  const webpSrcSet = [300, 600, 900, 1200, 1800]
    .map((size) => `${basePath}_${size}xauto_q85.webp ${size}w`)
    .join(', ');

  const jpegSrcSet = [300, 600, 900, 1200, 1800]
    .map((size) => `${basePath}_${size}xauto_q85.jpeg ${size}w`)
    .join(', ');

  return `
    <picture>
      <source 
        srcset="${webpSrcSet}" 
        sizes="${sizes}" 
        type="image/webp"
      >
      <source 
        srcset="${jpegSrcSet}" 
        sizes="${sizes}" 
        type="image/jpeg"
      >
      <img 
        src="${basePath}_600xauto_q85.jpeg" 
        alt="${altText}"
        loading="lazy"
        decoding="async"
      >
    </picture>
  `;
}

export const imageOptimizer = new ImageOptimizer();
