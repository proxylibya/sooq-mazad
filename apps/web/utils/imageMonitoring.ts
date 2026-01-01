/**
 * نظام مراقبة الصور المفقودة والتعامل معها
 */

interface MissingImageReport {
  path: string;
  timestamp: Date;
  referrer?: string;
  userAgent?: string;
  fallbackUsed: string;
}

class ImageMonitoringService {
  private missingImages: Map<string, MissingImageReport[]> = new Map();
  private reportingEnabled: boolean = process.env.NODE_ENV === 'development';

  /**
   * تسجيل صورة مفقودة
   */
  reportMissingImage(
    imagePath: string,
    fallbackUsed: string,
    referrer?: string,
    userAgent?: string,
  ): void {
    if (!this.reportingEnabled) return;

    const report: MissingImageReport = {
      path: imagePath,
      timestamp: new Date(),
      referrer,
      userAgent,
      fallbackUsed,
    };

    if (!this.missingImages.has(imagePath)) {
      this.missingImages.set(imagePath, []);
    }

    const reports = this.missingImages.get(imagePath)!;
    reports.push(report);

    // الاحتفاظ بآخر 10 تقارير فقط لكل صورة
    if (reports.length > 10) {
      reports.shift();
    }

    // تسجيل في الكونسول (مع تجنب التكرار المفرط)
    if (reports.length === 1 || reports.length % 10 === 0) {
      console.warn(`🖼️ صورة مفقودة (${reports.length}x): ${imagePath}`, {
        fallback: fallbackUsed,
        lastSeen: report.timestamp.toISOString(),
      });
    }
  }

  /**
   * الحصول على تقرير الصور المفقودة
   */
  getMissingImagesReport(): Record<string, { count: number; lastSeen: Date; fallback: string }> {
    const report: Record<string, { count: number; lastSeen: Date; fallback: string }> = {};

    for (const [path, reports] of this.missingImages.entries()) {
      const lastReport = reports[reports.length - 1];
      report[path] = {
        count: reports.length,
        lastSeen: lastReport.timestamp,
        fallback: lastReport.fallbackUsed,
      };
    }

    return report;
  }

  /**
   * مسح تقارير الصور المفقودة
   */
  clearReports(): void {
    this.missingImages.clear();
    console.log('🧹 تم مسح تقارير الصور المفقودة');
  }

  /**
   * تفعيل/إلغاء تفعيل التقارير
   */
  setReportingEnabled(enabled: boolean): void {
    this.reportingEnabled = enabled;
    console.log(`📊 تقارير الصور المفقودة: ${enabled ? 'مفعل' : 'معطل'}`);
  }

  /**
   * طباعة ملخص الصور المفقودة
   */
  printSummary(): void {
    if (!this.reportingEnabled || this.missingImages.size === 0) {
      console.log('📊 لا توجد صور مفقودة مسجلة');
      return;
    }

    console.group('📊 ملخص الصور المفقودة');

    const report = this.getMissingImagesReport();
    const sortedPaths = Object.keys(report).sort((a, b) => report[b].count - report[a].count);

    for (const path of sortedPaths) {
      const { count, lastSeen, fallback } = report[path];
      console.log(`${count}x ${path} → ${fallback}`);
    }

    console.groupEnd();
  }
}

// إنشاء مثيل واحد للخدمة
export const imageMonitoring = new ImageMonitoringService();

/**
 * دالة مساعدة لتسجيل صورة مفقودة
 */
export function reportMissingImage(
  imagePath: string,
  fallbackUsed: string,
  referrer?: string,
): void {
  imageMonitoring.reportMissingImage(
    imagePath,
    fallbackUsed,
    referrer,
    typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
  );
}

/**
 * دالة للحصول على الصورة البديلة المناسبة
 */
export function getFallbackImagePath(originalPath: string): string {
  // صور السيارات
  if (originalPath.includes('/cars/') || originalPath.includes('/uploads/cars/')) {
    return '/images/cars/default-car.svg';
  }

  // صور الملفات الشخصية
  if (originalPath.includes('/profiles/')) {
    return '/images/default-avatar.svg';
  }

  // صور النقل
  if (originalPath.includes('/transport/')) {
    return '/images/transport/default-transport.svg';
  }

  // صور المزادات
  if (originalPath.includes('/auctions/')) {
    return '/images/cars/default-car.svg';
  }

  // الصورة الافتراضية العامة
  return '/images/placeholder-car.svg';
}

/**
 * مكون React Hook لمراقبة الصور
 */
export function useImageMonitoring() {
  const handleImageError = (imagePath: string, fallbackPath?: string) => {
    const fallback = fallbackPath || getFallbackImagePath(imagePath);
    reportMissingImage(imagePath, fallback, window.location.href);
    return fallback;
  };

  const getReport = () => imageMonitoring.getMissingImagesReport();

  const clearReports = () => imageMonitoring.clearReports();

  return {
    handleImageError,
    getReport,
    clearReports,
    printSummary: () => imageMonitoring.printSummary(),
  };
}

// تصدير الخدمة للاستخدام المباشر
export default imageMonitoring;
