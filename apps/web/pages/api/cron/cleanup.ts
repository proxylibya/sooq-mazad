import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface CleanupResponse {
  success: boolean;
  message: string;
  cleaned: {
    directories: string[];
    filesCount: number;
    totalSize: number;
  };
  error?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<CleanupResponse>) {
  // التحقق من المصادقة للـ Cron Job
  const authHeader = req.headers.authorization;
  const expectedToken = `Bearer ${process.env.CRON_SECRET || 'default-cron-secret'}`;

  if (authHeader !== expectedToken) {
    return res.status(401).json({
      success: false,
      message: 'غير مصرح لك بالوصول',
      cleaned: {
        directories: [],
        filesCount: 0,
        totalSize: 0,
      },
      error: 'Unauthorized access',
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'الطريقة غير مسموحة',
      cleaned: {
        directories: [],
        filesCount: 0,
        totalSize: 0,
      },
      error: 'Method not allowed',
    });
  }

  try {
    // المجلدات المؤقتة للتنظيف
    const tempDirectories = [
      'uploads/temp',
      'uploads/verification/temp',
      'public/temp',
      'uploads/messages/temp',
      'uploads/transport/temp',
    ];

    let totalFilesDeleted = 0;
    let totalSizeDeleted = 0;
    const cleanedDirectories: string[] = [];

    // فترة انتهاء الصلاحية (24 ساعة)
    const expirationTime = 24 * 60 * 60 * 1000;
    const cutoffTime = Date.now() - expirationTime;

    for (const dir of tempDirectories) {
      const fullPath = path.join(process.cwd(), dir);

      if (!fs.existsSync(fullPath)) {
        continue; // تخطي المجلدات غير الموجودة
      }

      try {
        const files = fs.readdirSync(fullPath);
        let dirFilesDeleted = 0;
        let dirSizeDeleted = 0;

        for (const file of files) {
          const filePath = path.join(fullPath, file);

          try {
            const stats = fs.statSync(filePath);

            // حذف الملفات الأقدم من 24 ساعة
            if (stats.mtime.getTime() < cutoffTime) {
              const fileSize = stats.size;
              fs.unlinkSync(filePath);

              dirFilesDeleted++;
              dirSizeDeleted += fileSize;
            }
          } catch (fileError) {
            console.error(`خطأ في معالجة الملف ${filePath}:`, fileError);
            // تخطي هذا الملف والمتابعة
          }
        }

        if (dirFilesDeleted > 0) {
          cleanedDirectories.push(dir);
          totalFilesDeleted += dirFilesDeleted;
          totalSizeDeleted += dirSizeDeleted;
        }
      } catch (dirError) {
        console.error(`خطأ في معالجة المجلد ${fullPath}:`, dirError);
        // تخطي هذا المجلد والمتابعة
      }
    }

    // تنظيف إضافي للملفات المؤقتة في نظام التشغيل
    try {
      const osTempDir = require('os').tmpdir();
      const appTempFiles = fs
        .readdirSync(osTempDir)
        .filter(
          (file) => file.startsWith('tmp-') || file.includes('auction') || file.includes('upload'),
        );

      for (const tempFile of appTempFiles) {
        const tempFilePath = path.join(osTempDir, tempFile);
        try {
          const stats = fs.statSync(tempFilePath);
          if (stats.mtime.getTime() < cutoffTime) {
            fs.unlinkSync(tempFilePath);
            totalFilesDeleted++;
            totalSizeDeleted += stats.size;
          }
        } catch (e) {
          // تجاهل أخطاء ملفات النظام
        }
      }
    } catch (osError) {}

    const response: CleanupResponse = {
      success: true,
      message: `تم تنظيف ${totalFilesDeleted} ملف مؤقت بحجم إجمالي ${Math.round(totalSizeDeleted / 1024)} كيلوبايت`,
      cleaned: {
        directories: cleanedDirectories,
        filesCount: totalFilesDeleted,
        totalSize: totalSizeDeleted,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('خطأ عام في عملية التنظيف:', error);

    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء عملية التنظيف',
      cleaned: {
        directories: [],
        filesCount: 0,
        totalSize: 0,
      },
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
