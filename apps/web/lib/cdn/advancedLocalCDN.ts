// Advanced Local CDN - Local File Serving System
import fs from 'fs/promises';
import path from 'path';
import logger from '../logger';

class AdvancedLocalCDN {
  private basePath: string;

  constructor(basePath: string = './public/cdn') {
    this.basePath = basePath;
  }

  /**
   * الحصول على رابط CDN
   */
  getCDNUrl(filePath: string): string {
    return `/cdn/${filePath}`;
  }

  /**
   * تقديم ملف من CDN
   */
  async serveCDNFile(filePath: string): Promise<Buffer | null> {
    try {
      const fullPath = path.join(this.basePath, filePath);
      
      // التحقق من الأمان - منع الوصول خارج المجلد
      const resolvedPath = path.resolve(fullPath);
      const resolvedBase = path.resolve(this.basePath);
      
      if (!resolvedPath.startsWith(resolvedBase)) {
        logger.warn(`Attempted path traversal attack: ${filePath}`, { filePath });
        return null;
      }

      // قراءة الملف
      const fileBuffer = await fs.readFile(resolvedPath);
      return fileBuffer;
    } catch (error) {
      logger.error('Error serving CDN file', {
        error: error instanceof Error ? error.message : error,
        filePath,
      });
      return null;
    }
  }

  /**
   * رفع ملف إلى CDN
   */
  async uploadFile(filePath: string, buffer: Buffer): Promise<boolean> {
    try {
      const fullPath = path.join(this.basePath, filePath);
      const directory = path.dirname(fullPath);
      
      // إنشاء المجلد إذا لم يكن موجوداً
      await fs.mkdir(directory, { recursive: true });
      
      // كتابة الملف
      await fs.writeFile(fullPath, buffer);
      
      logger.info(`File uploaded to CDN: ${filePath}`, { filePath });
      return true;
    } catch (error) {
      logger.error('Error uploading file to CDN', {
        error: error instanceof Error ? error.message : error,
        filePath,
      });
      return false;
    }
  }

  /**
   * حذف ملف من CDN
   */
  async deleteFile(filePath: string): Promise<boolean> {
    try {
      const fullPath = path.join(this.basePath, filePath);
      await fs.unlink(fullPath);
      
      logger.info(`File deleted from CDN: ${filePath}`, { filePath });
      return true;
    } catch (error) {
      logger.error('Error deleting file from CDN', {
        error: error instanceof Error ? error.message : error,
        filePath,
      });
      return false;
    }
  }
}

// إنشاء instance افتراضي
const cdnInstance = new AdvancedLocalCDN();

// Export الدوال المساعدة للتوافق
export const getCDNUrl = (path: string): string => cdnInstance.getCDNUrl(path);
export const serveCDNFile = async (path: string): Promise<Buffer | null> => 
  cdnInstance.serveCDNFile(path);

export { AdvancedLocalCDN };
export default AdvancedLocalCDN;
