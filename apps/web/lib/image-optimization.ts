/**
 * نظام تحسين الصور المتقدم
 * يدعم: WebP, AVIF, Cloudflare, S3, التحجيم التلقائي
 */

import sharp from 'sharp';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';

/**
 * إعدادات تحسين الصور
 */
export interface ImageOptimizationConfig {
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  withoutEnlargement?: boolean;
  progressive?: boolean;
}

/**
 * إعدادات CDN
 */
export interface CDNConfig {
  provider: 'cloudflare' | 's3' | 'local';
  cloudflareAccountId?: string;
  cloudflareApiToken?: string;
  s3Bucket?: string;
  s3Region?: string;
  s3AccessKeyId?: string;
  s3SecretAccessKey?: string;
  cdnDomain?: string;
}

/**
 * نتيجة رفع الصورة
 */
export interface UploadResult {
  url: string;
  cdnUrl?: string;
  fileName: string;
  size: number;
  format: string;
  width: number;
  height: number;
}

/**
 * فئة تحسين الصور
 */
export class ImageOptimizer {
  private cdnConfig: CDNConfig;
  private s3Client?: S3Client;

  constructor(cdnConfig?: Partial<CDNConfig>) {
    this.cdnConfig = {
      provider: (cdnConfig?.provider || process.env.CDN_PROVIDER || 'local') as any,
      cloudflareAccountId: cdnConfig?.cloudflareAccountId || process.env.CLOUDFLARE_ACCOUNT_ID,
      cloudflareApiToken: cdnConfig?.cloudflareApiToken || process.env.CLOUDFLARE_API_TOKEN,
      s3Bucket: cdnConfig?.s3Bucket || process.env.AWS_S3_BUCKET,
      s3Region: cdnConfig?.s3Region || process.env.AWS_REGION || 'us-east-1',
      s3AccessKeyId: cdnConfig?.s3AccessKeyId || process.env.AWS_ACCESS_KEY_ID,
      s3SecretAccessKey: cdnConfig?.s3SecretAccessKey || process.env.AWS_SECRET_ACCESS_KEY,
      cdnDomain: cdnConfig?.cdnDomain || process.env.CDN_DOMAIN,
    };

    // تهيئة S3 إذا كان مُفعل
    if (this.cdnConfig.provider === 's3' && this.cdnConfig.s3AccessKeyId) {
      this.s3Client = new S3Client({
        region: this.cdnConfig.s3Region,
        credentials: {
          accessKeyId: this.cdnConfig.s3AccessKeyId,
          secretAccessKey: this.cdnConfig.s3SecretAccessKey!,
        },
      });
    }
  }

  /**
   * تحسين صورة من Buffer
   */
  async optimizeImage(
    input: Buffer | string,
    config: ImageOptimizationConfig = {},
  ): Promise<Buffer> {
    const {
      quality = 80,
      format = 'webp',
      width,
      height,
      fit = 'cover',
      withoutEnlargement = true,
      progressive = true,
    } = config;

    try {
      let pipeline = sharp(input);

      // تغيير الحجم إذا لزم الأمر
      if (width || height) {
        pipeline = pipeline.resize(width, height, {
          fit,
          withoutEnlargement,
        });
      }

      // تحويل الصيغة
      switch (format) {
        case 'webp':
          pipeline = pipeline.webp({ quality, effort: 6 });
          break;
        case 'avif':
          pipeline = pipeline.avif({ quality, effort: 6 });
          break;
        case 'jpeg':
          pipeline = pipeline.jpeg({ quality, progressive });
          break;
        case 'png':
          pipeline = pipeline.png({ quality, progressive });
          break;
      }

      return await pipeline.toBuffer();
    } catch (error) {
      console.error('خطأ في تحسين الصورة:', error);
      throw new Error('فشل تحسين الصورة');
    }
  }

  /**
   * إنشاء أحجام متعددة للصورة (responsive)
   */
  async generateResponsiveSizes(
    input: Buffer | string,
    sizes: number[] = [320, 640, 768, 1024, 1280, 1920],
    format: 'webp' | 'avif' = 'webp',
  ): Promise<{ size: number; buffer: Buffer }[]> {
    const results: { size: number; buffer: Buffer }[] = [];

    for (const size of sizes) {
      const buffer = await this.optimizeImage(input, {
        width: size,
        format,
        quality: 80,
      });
      results.push({ size, buffer });
    }

    return results;
  }

  /**
   * رفع صورة إلى CDN
   */
  async uploadToCDN(
    buffer: Buffer,
    fileName: string,
    mimeType: string = 'image/webp',
  ): Promise<UploadResult> {
    const metadata = await sharp(buffer).metadata();

    switch (this.cdnConfig.provider) {
      case 'cloudflare':
        return await this.uploadToCloudflare(buffer, fileName, mimeType, metadata);
      case 's3':
        return await this.uploadToS3(buffer, fileName, mimeType, metadata);
      case 'local':
      default:
        return await this.saveLocally(buffer, fileName, mimeType, metadata);
    }
  }

  /**
   * رفع إلى Cloudflare Images
   */
  private async uploadToCloudflare(
    buffer: Buffer,
    fileName: string,
    mimeType: string,
    metadata: any,
  ): Promise<UploadResult> {
    if (!this.cdnConfig.cloudflareAccountId || !this.cdnConfig.cloudflareApiToken) {
      throw new Error('إعدادات Cloudflare غير متوفرة');
    }

    try {
      const formData = new FormData();
      const blob = new Blob([buffer], { type: mimeType });
      formData.append('file', blob, fileName);

      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${this.cdnConfig.cloudflareAccountId}/images/v1`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.cdnConfig.cloudflareApiToken}`,
          },
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error(`Cloudflare API error: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        url: result.result.variants[0],
        cdnUrl: result.result.variants[0],
        fileName,
        size: buffer.length,
        format: metadata.format || 'webp',
        width: metadata.width || 0,
        height: metadata.height || 0,
      };
    } catch (error) {
      console.error('خطأ في رفع الصورة إلى Cloudflare:', error);
      // Fallback إلى التخزين المحلي
      return await this.saveLocally(buffer, fileName, mimeType, metadata);
    }
  }

  /**
   * رفع إلى AWS S3
   */
  private async uploadToS3(
    buffer: Buffer,
    fileName: string,
    mimeType: string,
    metadata: any,
  ): Promise<UploadResult> {
    if (!this.s3Client || !this.cdnConfig.s3Bucket) {
      throw new Error('إعدادات S3 غير متوفرة');
    }

    try {
      const key = `images/${Date.now()}-${fileName}`;

      const command = new PutObjectCommand({
        Bucket: this.cdnConfig.s3Bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        CacheControl: 'public, max-age=31536000, immutable',
      });

      await this.s3Client.send(command);

      const url = this.cdnConfig.cdnDomain
        ? `https://${this.cdnConfig.cdnDomain}/${key}`
        : `https://${this.cdnConfig.s3Bucket}.s3.${this.cdnConfig.s3Region}.amazonaws.com/${key}`;

      return {
        url,
        cdnUrl: url,
        fileName,
        size: buffer.length,
        format: metadata.format || 'webp',
        width: metadata.width || 0,
        height: metadata.height || 0,
      };
    } catch (error) {
      console.error('خطأ في رفع الصورة إلى S3:', error);
      // Fallback إلى التخزين المحلي
      return await this.saveLocally(buffer, fileName, mimeType, metadata);
    }
  }

  /**
   * حفظ محلياً
   */
  private async saveLocally(
    buffer: Buffer,
    fileName: string,
    mimeType: string,
    metadata: any,
  ): Promise<UploadResult> {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'optimized');

    // إنشاء المجلد إذا لم يكن موجوداً
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const finalFileName = `${timestamp}-${sanitizedFileName}`;
    const filePath = path.join(uploadDir, finalFileName);

    fs.writeFileSync(filePath, buffer);

    return {
      url: `/uploads/optimized/${finalFileName}`,
      fileName: finalFileName,
      size: buffer.length,
      format: metadata.format || 'webp',
      width: metadata.width || 0,
      height: metadata.height || 0,
    };
  }

  /**
   * معالجة صورة ورفعها (عملية كاملة)
   */
  async processAndUpload(
    input: Buffer | string,
    fileName: string,
    config: ImageOptimizationConfig = {},
  ): Promise<UploadResult> {
    // 1. تحسين الصورة
    const optimizedBuffer = await this.optimizeImage(input, config);

    // 2. رفع إلى CDN
    const ext = config.format || 'webp';
    const finalFileName = fileName.replace(/\.[^.]+$/, `.${ext}`);

    return await this.uploadToCDN(optimizedBuffer, finalFileName, `image/${ext}`);
  }

  /**
   * معالجة صورة مع إنشاء أحجام متعددة
   */
  async processWithMultipleSizes(
    input: Buffer | string,
    fileName: string,
    sizes: number[] = [320, 640, 768, 1024, 1280],
    format: 'webp' | 'avif' = 'webp',
  ): Promise<{
    original: UploadResult;
    sizes: { size: number; result: UploadResult }[];
  }> {
    // معالجة الصورة الأصلية
    const original = await this.processAndUpload(input, fileName, { format });

    // إنشاء أحجام متعددة
    const responsiveSizes = await this.generateResponsiveSizes(input, sizes, format);

    const sizeResults = await Promise.all(
      responsiveSizes.map(async ({ size, buffer }) => {
        const sizedFileName = fileName.replace(/(\.[^.]+)$/, `-${size}w$1`);
        const result = await this.uploadToCDN(buffer, sizedFileName, `image/${format}`);
        return { size, result };
      }),
    );

    return {
      original,
      sizes: sizeResults,
    };
  }

  /**
   * تحويل صورة إلى صيغ متعددة
   */
  async convertToMultipleFormats(
    input: Buffer | string,
    fileName: string,
    formats: Array<'webp' | 'avif' | 'jpeg'> = ['webp', 'avif'],
  ): Promise<Record<string, UploadResult>> {
    const results: Record<string, UploadResult> = {};

    for (const format of formats) {
      const result = await this.processAndUpload(input, fileName, { format });
      results[format] = result;
    }

    return results;
  }
}

/**
 * Instance افتراضي
 */
export const imageOptimizer = new ImageOptimizer();

/**
 * دوال مساعدة سريعة
 */

/**
 * تحسين صورة بسرعة
 */
export async function optimizeImage(
  input: Buffer | string,
  config?: ImageOptimizationConfig,
): Promise<Buffer> {
  return await imageOptimizer.optimizeImage(input, config);
}

/**
 * رفع صورة محسّنة
 */
export async function uploadOptimizedImage(
  input: Buffer | string,
  fileName: string,
  config?: ImageOptimizationConfig,
): Promise<UploadResult> {
  return await imageOptimizer.processAndUpload(input, fileName, config);
}

/**
 * إنشاء srcset للصور المستجيبة
 */
export function generateSrcSet(sizes: { size: number; result: UploadResult }[]): string {
  return sizes.map(({ size, result }) => `${result.url} ${size}w`).join(', ');
}

/**
 * توليد HTML picture element
 */
export function generatePictureElement(
  formats: Record<string, UploadResult>,
  alt: string,
  sizes: string = '100vw',
): string {
  const sources = Object.entries(formats)
    .filter(([format]) => format !== 'jpeg')
    .map(
      ([format, result]) =>
        `<source srcset="${result.url}" type="image/${format}" sizes="${sizes}">`,
    )
    .join('\n');

  const fallback = formats.jpeg || formats.webp;

  return `
<picture>
  ${sources}
  <img src="${fallback.url}" alt="${alt}" loading="lazy" decoding="async">
</picture>
  `.trim();
}

export default ImageOptimizer;
