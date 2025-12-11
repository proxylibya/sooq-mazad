import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { imageOptimizer } from '../../../lib/imageOptimizer';
import { rateLimiter } from '../../../lib/rateLimiter';
import fs from 'fs/promises';
import path from 'path';

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
    // تطبيق Rate Limiting
    const rateLimitResult = await rateLimiter.checkLimit('image-optimization', req);
    if (!rateLimitResult.success) {
      return res.status(429).json({
        error: 'تم تجاوز الحد المسموح للطلبات',
        retryAfter: rateLimitResult.retryAfter,
      });
    }

    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB max
      keepExtensions: true,
    });

    const [_fields, files] = await form.parse(req);
    const file = Array.isArray(files.image) ? files.image[0] : files.image;

    if (!file) {
      return res.status(400).json({ error: 'لم يتم العثور على ملف صورة' });
    }

    // قراءة الملف
    const fileBuffer = await fs.readFile(file.filepath);

    // التحقق من صحة الصورة
    const validation = await imageOptimizer.validateImage(fileBuffer);
    if (!validation.isValid) {
      return res.status(400).json({ error: 'تنسيق الصورة غير مدعوم' });
    }

    // تحسين الصورة بأحجام متعددة
    const optimizedSizes = await imageOptimizer.optimizeMultipleSizes(
      fileBuffer,
      file.originalFilename || 'image',
    );

    // حفظ الصور المحسنة
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'optimized');
    await fs.mkdir(uploadsDir, { recursive: true });

    const savedFiles = await Promise.all([
      saveOptimizedImage(optimizedSizes.thumbnail, uploadsDir, 'thumbnail'),
      saveOptimizedImage(optimizedSizes.medium, uploadsDir, 'medium'),
      saveOptimizedImage(optimizedSizes.large, uploadsDir, 'large'),
      saveOptimizedImage(optimizedSizes.original, uploadsDir, 'original'),
    ]);

    // تنظيف الملف المؤقت
    await fs.unlink(file.filepath).catch(() => {});

    res.status(200).json({
      success: true,
      message: 'تم تحسين الصور بنجاح',
      data: {
        original: {
          size: validation.size,
          width: validation.width,
          height: validation.height,
          format: validation.format,
        },
        optimized: {
          thumbnail: {
            url: savedFiles[0],
            size: optimizedSizes.thumbnail.size,
          },
          medium: {
            url: savedFiles[1],
            size: optimizedSizes.medium.size,
          },
          large: {
            url: savedFiles[2],
            size: optimizedSizes.large.size,
          },
          original: {
            url: savedFiles[3],
            size: optimizedSizes.original.size,
          },
        },
        compressionRatio: Math.round((1 - optimizedSizes.medium.size / validation.size) * 100),
      },
    });
  } catch (error) {
    console.error('خطأ في تحسين الصورة:', error);
    res.status(500).json({
      error: 'حدث خطأ في تحسين الصورة',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

async function saveOptimizedImage(
  optimizedImage: { buffer: Buffer; filename: string; size: number },
  uploadsDir: string,
  sizeType: string,
): Promise<string> {
  const filename = `${sizeType}_${optimizedImage.filename}`;
  const filepath = path.join(uploadsDir, filename);

  await fs.writeFile(filepath, optimizedImage.buffer);

  return `/uploads/optimized/${filename}`;
}
