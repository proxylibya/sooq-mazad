import { NextApiRequest, NextApiResponse } from 'next';
import { migrateImages } from '../../../utils/imageManager';
import fs from 'fs';
import path from 'path';

interface MigrateResponse {
  success: boolean;
  message: string;
  data?: {
    totalProcessed: number;
    successCount: number;
    failedCount: number;
    migratedImages: string[];
    errors: string[];
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<MigrateResponse>) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  try {
    const { sourcePath, category = 'listings', deleteSource = false } = req.body;

    if (!sourcePath) {
      return res.status(400).json({
        success: false,
        message: 'مسار المصدر مطلوب',
      });
    }

    // التحقق من وجود المجلد المصدر
    const fullSourcePath = path.resolve(sourcePath);
    if (!fs.existsSync(fullSourcePath)) {
      return res.status(404).json({
        success: false,
        message: 'المجلد المصدر غير موجود',
      });
    }

    // تنفيذ عملية النقل
    const migrationResult = await migrateImages(fullSourcePath, category);

    const migratedImages: string[] = [];
    const errors: string[] = [];

    migrationResult.results.forEach((result) => {
      if (result.success && result.fileUrl) {
        migratedImages.push(result.fileUrl);
      } else if (result.error) {
        errors.push(result.error);
      }
    });

    // حذف المجلد المصدر إذا كان مطلوباً وتمت العملية بنجاح
    if (deleteSource && migrationResult.success > 0 && migrationResult.failed === 0) {
      try {
        // حذف المجلد وجميع محتوياته
        fs.rmSync(fullSourcePath, { recursive: true, force: true });
      } catch (error) {
        console.error('خطأ في حذف المجلد المصدر:', error);
        errors.push(`فشل في حذف المجلد المصدر: ${error}`);
      }
    }

    return res.status(200).json({
      success: true,
      message: `تم نقل ${migrationResult.success} صورة بنجاح`,
      data: {
        totalProcessed: migrationResult.success + migrationResult.failed,
        successCount: migrationResult.success,
        failedCount: migrationResult.failed,
        migratedImages,
        errors,
      },
    });
  } catch (error) {
    console.error('خطأ في نقل الصور:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
    });
  }
}

// دالة مساعدة لنقل صور النقل من المجلد المؤقت
export async function migrateTransportImages(): Promise<MigrateResponse['data']> {
  const tempImagePath = 'C:\\cars-flutter222\\5555555555555\\imagers';

  try {
    if (!fs.existsSync(tempImagePath)) {
      return {
        totalProcessed: 0,
        successCount: 0,
        failedCount: 0,
        migratedImages: [],
        errors: ['المجلد المؤقت غير موجود'],
      };
    }

    const migrationResult = await migrateImages(tempImagePath, 'transport');

    const migratedImages: string[] = [];
    const errors: string[] = [];

    migrationResult.results.forEach((result) => {
      if (result.success && result.fileUrl) {
        migratedImages.push(result.fileUrl);
      } else if (result.error) {
        errors.push(result.error);
      }
    });

    return {
      totalProcessed: migrationResult.success + migrationResult.failed,
      successCount: migrationResult.success,
      failedCount: migrationResult.failed,
      migratedImages,
      errors,
    };
  } catch (error) {
    return {
      totalProcessed: 0,
      successCount: 0,
      failedCount: 1,
      migratedImages: [],
      errors: [`خطأ في نقل صور النقل: ${error}`],
    };
  }
}

// دالة لتنظيف وتنظيم جميع الصور في المشروع
export async function organizeAllImages(): Promise<{
  listings: MigrateResponse['data'];
  transport: MigrateResponse['data'];
  auctions: MigrateResponse['data'];
}> {
  const results = {
    listings: {
      totalProcessed: 0,
      successCount: 0,
      failedCount: 0,
      migratedImages: [],
      errors: [],
    } as MigrateResponse['data'],
    transport: await migrateTransportImages(),
    auctions: {
      totalProcessed: 0,
      successCount: 0,
      failedCount: 0,
      migratedImages: [],
      errors: [],
    } as MigrateResponse['data'],
  };

  // يمكن إضافة المزيد من عمليات التنظيم هنا

  return results;
}
