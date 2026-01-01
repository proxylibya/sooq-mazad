// نظام إدارة الصور المحسن للمشروع
import fs from 'fs';
import path from 'path';

export interface ImageUploadResult {
  success: boolean;
  fileName?: string;
  fileUrl?: string;
  fileSize?: number;
  error?: string;
}

export interface ImageManagerConfig {
  maxFileSize: number; // بالبايت
  allowedFormats: string[];
  compressionQuality: number;
  permanentStoragePath: string;
  tempStoragePath: string;
}

// الإعدادات الافتراضية
export const defaultImageConfig: ImageManagerConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
  compressionQuality: 0.8,
  permanentStoragePath: 'public/images/cars',
  tempStoragePath: 'uploads/temp',
};

export class ImageManager {
  private config: ImageManagerConfig;

  constructor(config: Partial<ImageManagerConfig> = {}) {
    this.config = { ...defaultImageConfig, ...config };
    this.ensureDirectoriesExist();
  }

  // إنشاء المجلدات المطلوبة
  private ensureDirectoriesExist(): void {
    const directories = [
      this.config.permanentStoragePath,
      this.config.tempStoragePath,
      path.join(this.config.permanentStoragePath, 'listings'),
      path.join(this.config.permanentStoragePath, 'brands'),
      path.join(this.config.permanentStoragePath, 'transport'),
      path.join(this.config.permanentStoragePath, 'auctions'),
    ];

    directories.forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  // التحقق من صحة الصورة
  validateImage(file: File | any): { isValid: boolean; error?: string } {
    // التحقق من الحجم
    if (file.size > this.config.maxFileSize) {
      return {
        isValid: false,
        error: `حجم الصورة كبير جداً. الحد الأقصى ${this.config.maxFileSize / (1024 * 1024)}MB`,
      };
    }

    // التحقق من النوع - دعم كل من File و FormidableFile
    const fileName = file.originalFilename || file.name;
    if (!fileName) {
      return {
        isValid: false,
        error: 'اسم الملف غير صحيح',
      };
    }

    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    if (!fileExtension || !this.config.allowedFormats.includes(fileExtension)) {
      return {
        isValid: false,
        error: `نوع الملف غير مدعوم. الأنواع المدعومة: ${this.config.allowedFormats.join(', ')}`,
      };
    }

    // التحقق من نوع MIME إذا كان متوفراً
    if (file.mimetype) {
      const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

      if (!allowedMimeTypes.includes(file.mimetype)) {
        return {
          isValid: false,
          error: `نوع الملف غير مدعوم. الأنواع المدعومة: JPG, PNG, WebP`,
        };
      }
    }

    return { isValid: true };
  }

  // إنشاء اسم ملف فريد
  generateUniqueFileName(originalName: string, category: string = 'general'): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(originalName || '');
    // التأكد من وجود امتداد صحيح
    const finalExtension = extension || '.jpg';
    return `${category}_${timestamp}_${randomString}${finalExtension}`;
  }

  // نقل الصورة من المجلد المؤقت إلى المجلد الدائم
  async moveImageToPermanentStorage(
    tempFilePath: string,
    category: string,
    originalName: string,
  ): Promise<ImageUploadResult> {
    try {
      // إنشاء اسم ملف جديد
      const newFileName = this.generateUniqueFileName(originalName, category);
      const permanentPath = path.join(this.config.permanentStoragePath, category, newFileName);

      // نسخ الملف
      fs.copyFileSync(tempFilePath, permanentPath);

      // حذف الملف المؤقت
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }

      // إنشاء URL للصورة
      const fileUrl = `/images/cars/${category}/${newFileName}`;

      // الحصول على حجم الملف
      const stats = fs.statSync(permanentPath);

      return {
        success: true,
        fileName: newFileName,
        fileUrl,
        fileSize: stats.size,
      };
    } catch (error) {
      return {
        success: false,
        error: `فشل في نقل الصورة: ${error}`,
      };
    }
  }

  // حفظ صورة جديدة
  async saveImage(file: File | any, category: string = 'listings'): Promise<ImageUploadResult> {
    // التحقق من صحة الصورة
    const validation = this.validateImage(file);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    try {
      // الحصول على اسم الملف الأصلي
      const originalName = file.originalFilename || file.name || 'image.jpg';

      // إنشاء اسم ملف فريد
      const fileName = this.generateUniqueFileName(originalName, category);
      const filePath = path.join(this.config.permanentStoragePath, category, fileName);

      // التأكد من وجود المجلد
      const categoryDir = path.join(this.config.permanentStoragePath, category);
      if (!fs.existsSync(categoryDir)) {
        fs.mkdirSync(categoryDir, { recursive: true });
      }

      // حفظ الملف (هذا يعتمد على نوع الملف المرسل)
      // في حالة استخدام FormData أو Buffer
      if (file.buffer) {
        fs.writeFileSync(filePath, file.buffer);
      } else if (file.filepath) {
        // في حالة استخدام formidable
        fs.copyFileSync(file.filepath, filePath);
        // حذف الملف المؤقت
        if (fs.existsSync(file.filepath)) {
          fs.unlinkSync(file.filepath);
        }
      } else {
        throw new Error('نوع الملف غير مدعوم');
      }

      // إنشاء URL للصورة
      const fileUrl = `/images/cars/${category}/${fileName}`;

      // الحصول على حجم الملف
      const stats = fs.statSync(filePath);

      return {
        success: true,
        fileName,
        fileUrl,
        fileSize: stats.size,
      };
    } catch (error) {
      return {
        success: false,
        error: `فشل في حفظ الصورة: ${error instanceof Error ? error.message : error}`,
      };
    }
  }

  // حذف صورة
  async deleteImage(fileName: string, category: string = 'listings'): Promise<boolean> {
    try {
      const filePath = path.join(this.config.permanentStoragePath, category, fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('خطأ في حذف الصورة:', error);
      return false;
    }
  }

  // الحصول على معلومات الصورة
  getImageInfo(fileName: string, category: string = 'listings'): any {
    try {
      const filePath = path.join(this.config.permanentStoragePath, category, fileName);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        return {
          exists: true,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          url: `/images/cars/${category}/${fileName}`,
        };
      }
      return { exists: false };
    } catch (error) {
      return { exists: false, error };
    }
  }

  // تنظيف الملفات المؤقتة القديمة
  cleanupTempFiles(olderThanHours: number = 24): void {
    try {
      const tempDir = this.config.tempStoragePath;
      if (!fs.existsSync(tempDir)) return;

      const files = fs.readdirSync(tempDir);
      const cutoffTime = Date.now() - olderThanHours * 60 * 60 * 1000;

      files.forEach((file) => {
        const filePath = path.join(tempDir, file);
        const stats = fs.statSync(filePath);

        if (stats.mtime.getTime() < cutoffTime) {
          fs.unlinkSync(filePath);
          console.log(`تم حذف الملف المؤقت القديم: ${file}`);
        }
      });
    } catch (error) {
      console.error('خطأ في تنظيف الملفات المؤقتة:', error);
    }
  }

  // نسخ الصور من مجلد مؤقت إلى مجلد دائم
  async migrateImagesFromTempFolder(
    sourcePath: string,
    category: string = 'listings',
  ): Promise<{
    success: number;
    failed: number;
    results: ImageUploadResult[];
  }> {
    const results: ImageUploadResult[] = [];
    let success = 0;
    let failed = 0;

    try {
      if (!fs.existsSync(sourcePath)) {
        return { success: 0, failed: 0, results: [] };
      }

      const files = fs.readdirSync(sourcePath);

      for (const file of files) {
        const sourceFilePath = path.join(sourcePath, file);
        const result = await this.moveImageToPermanentStorage(sourceFilePath, category, file);

        results.push(result);
        if (result.success) {
          success++;
        } else {
          failed++;
        }
      }
    } catch (error) {
      results.push({
        success: false,
        error: `خطأ في نقل الصور: ${error}`,
      });
      failed++;
    }

    return { success, failed, results };
  }
}

// إنشاء مثيل افتراضي
export const imageManager = new ImageManager();

// دوال مساعدة
export const validateImageFile = (file: any) => imageManager.validateImage(file);
export const saveImageFile = (file: any, category?: string) =>
  imageManager.saveImage(file, category);
export const deleteImageFile = (fileName: string, category?: string) =>
  imageManager.deleteImage(fileName, category);
export const getImageFileInfo = (fileName: string, category?: string) =>
  imageManager.getImageInfo(fileName, category);
export const cleanupOldTempFiles = (hours?: number) => imageManager.cleanupTempFiles(hours);
export const migrateImages = (sourcePath: string, category?: string) =>
  imageManager.migrateImagesFromTempFolder(sourcePath, category);
