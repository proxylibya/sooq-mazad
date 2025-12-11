/**
 * 🌍 التصدير الموحد لنظام الصور
 * 
 * استخدم هذا الملف لاستيراد جميع وظائف نظام الصور
 */

// النظام الأساسي
export {
    // التكوين
    IMAGE_CONFIG,
    // الكائن الموحد
    ImageSystem, cleanupTempFiles,
    // الإدارة
    deleteImage,
    // الأدوات
    ensureDirectories,
    generateFileName, generateMultipleFormats, generateMultipleSizes, generatePictureElement, generatePlaceholder,
    // HTML
    generateSrcSet,
    // المعالجة
    getImageMetadata, getStoragePath,
    // الإحصائيات
    getStorageStats, optimizeImage, pathToUrl, processAndSaveImage, validateImageFile, type ImageCategory, type ImageFormat, type ImageMetadata, type ImageOptimizationResult,
    // الأنواع
    type ImageSize, type OptimizedImage, type UploadOptions
} from './index';

// إعادة تصدير default
export { default } from './index';
