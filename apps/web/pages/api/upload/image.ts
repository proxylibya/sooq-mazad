/**
 * API Endpoint: رفع وتحسين الصور
 * POST /api/upload/image
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import { ImageOptimizer, UploadResult } from '@/lib/image-optimization';

export const config = {
  api: {
    bodyParser: false,
  },
};

interface UploadResponse {
  success: boolean;
  data?: {
    original: UploadResult;
    optimized?: UploadResult;
    sizes?: { size: number; result: UploadResult }[];
    formats?: Record<string, UploadResult>;
  };
  error?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<UploadResponse>) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'الطريقة غير مسموحة',
    });
  }

  try {
    // معالجة رفع الملف
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      keepExtensions: true,
      filter: (part) => {
        return part.mimetype?.startsWith('image/') || false;
      },
    });

    const [fields, files] = await form.parse(req);

    const fileArray = files.file;
    if (!fileArray || fileArray.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'لم يتم رفع صورة',
      });
    }

    const file = fileArray[0];
    const fileBuffer = fs.readFileSync(file.filepath);
    const fileName = file.originalFilename || 'image.jpg';

    // قراءة الإعدادات
    const optimize = fields.optimize?.[0] === 'true';
    const generateSizes = fields.generateSizes?.[0] === 'true';
    const multiFormat = fields.multiFormat?.[0] === 'true';
    const format = (fields.format?.[0] || 'webp') as 'webp' | 'avif';
    const quality = parseInt(fields.quality?.[0] || '80', 10);
    const width = fields.width?.[0] ? parseInt(fields.width[0], 10) : undefined;
    const height = fields.height?.[0] ? parseInt(fields.height[0], 10) : undefined;

    const imageOptimizer = new ImageOptimizer();

    // حفظ الصورة الأصلية
    const originalResult = await imageOptimizer.uploadToCDN(
      fileBuffer,
      fileName,
      file.mimetype || 'image/jpeg',
    );

    const responseData: UploadResponse['data'] = {
      original: originalResult,
    };

    // تحسين الصورة إذا مطلوب
    if (optimize) {
      const optimizedResult = await imageOptimizer.processAndUpload(fileBuffer, fileName, {
        format,
        quality,
        width,
        height,
      });
      responseData.optimized = optimizedResult;
    }

    // إنشاء أحجام متعددة إذا مطلوب
    if (generateSizes) {
      const sizes = [320, 640, 768, 1024, 1280];
      const multiSizeResult = await imageOptimizer.processWithMultipleSizes(
        fileBuffer,
        fileName,
        sizes,
        format,
      );
      responseData.sizes = multiSizeResult.sizes;
    }

    // تحويل إلى صيغ متعددة إذا مطلوب
    if (multiFormat) {
      const formats = await imageOptimizer.convertToMultipleFormats(fileBuffer, fileName, [
        'webp',
        'avif',
      ]);
      responseData.formats = formats;
    }

    // حذف الملف المؤقت
    fs.unlinkSync(file.filepath);

    return res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error('خطأ في رفع الصورة:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'فشل رفع الصورة',
    });
  }
}
