/**
 * API لتحسين الصور On-Demand
 *
 * @route POST /api/media/optimize-image
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { imageOptimizer } from '@/lib/media/imageOptimization';
import fs from 'fs/promises';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // تحليل الملف المرفوع
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10 MB
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);

    const file = Array.isArray(files.image) ? files.image[0] : files.image;

    if (!file) {
      return res.status(400).json({ error: 'لم يتم رفع صورة' });
    }

    // التحقق من نوع الملف
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype || '')) {
      return res.status(400).json({
        error: 'نوع ملف غير مدعوم. يجب أن يكون JPEG أو PNG',
      });
    }

    // تحسين الصورة
    const quality = parseInt(
      (Array.isArray(fields.quality) ? fields.quality[0] : fields.quality) || '80',
    );
    const generatePlaceholder =
      (Array.isArray(fields.generatePlaceholder)
        ? fields.generatePlaceholder[0]
        : fields.generatePlaceholder) !== 'false';

    const result = await imageOptimizer.optimizeImage(file.filepath, {
      quality,
      formats: ['webp', 'avif', 'jpeg'],
      sizes: ['thumbnail', 'small', 'medium', 'large'],
      generatePlaceholder,
    });

    // حذف الملف المؤقت
    await fs.unlink(file.filepath);

    return res.status(200).json({
      success: true,
      data: {
        original: result.metadata,
        optimized: result.optimized,
        placeholder: result.placeholder,
        savings: {
          bytes:
            result.metadata.size -
            Object.values(result.optimized.webp || {}).reduce((acc, img) => acc + img.size, 0),
          percentage:
            ((result.metadata.size -
              Object.values(result.optimized.webp || {}).reduce((acc, img) => acc + img.size, 0)) /
              result.metadata.size) *
            100,
        },
      },
    });
  } catch (error: any) {
    console.error('خطأ في تحسين الصورة:', error);
    return res.status(500).json({
      error: 'فشل تحسين الصورة',
      message: error.message,
    });
  }
}
