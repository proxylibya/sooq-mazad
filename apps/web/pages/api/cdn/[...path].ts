/**
 * API لخدمة CDN المحلي المتقدم
 * يوفر الملفات المحسنة مع headers التخزين المؤقت المناسبة
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { AdvancedLocalCDN } from '../../../lib/cdn/advancedLocalCDN';
import path from 'path';

const localCDN = new AdvancedLocalCDN();

// تهيئة CDN عند بدء التشغيل
let cdnInitialized = false;

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const startTime = Date.now();

  try {
    // تهيئة CDN إذا لم يتم تهيئته
    if (!cdnInitialized) {
      await localCDN.initialize();
      cdnInitialized = true;
    }

    const { method, query } = req;
    const assetPath = Array.isArray(query.path) ? query.path.join('/') : query.path || '';

    if (method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // التحقق من صحة مسار الملف
    if (!assetPath || assetPath.includes('..') || assetPath.startsWith('/')) {
      return res.status(400).json({ error: 'مسار ملف غير صحيح' });
    }

    // معالجة الصور المتجاوبة
    let finalAssetPath = assetPath;
    if (assetPath.includes('responsive/')) {
      finalAssetPath = handleResponsiveImage(assetPath, req);
    }

    // الحصول على الملف من CDN
    const result = await localCDN.getAsset(finalAssetPath);

    if (!result) {
      // محاولة الحصول على النسخة الأصلية إذا لم توجد النسخة المتجاوبة
      if (finalAssetPath !== assetPath) {
        const fallbackResult = await localCDN.getAsset(assetPath);
        if (fallbackResult) {
          setOptimalHeaders(res, fallbackResult.asset, req, startTime);
          return res.send(fallbackResult.buffer);
        }
      }

      return res.status(404).json({ error: 'الملف غير موجود' });
    }

    const { buffer, asset } = result;

    // تعيين headers التخزين المؤقت والضغط
    setOptimalHeaders(res, asset, req, startTime);

    // التحقق من If-None-Match (ETag)
    const ifNoneMatch = req.headers['if-none-match'];
    if (ifNoneMatch === `"${asset.etag}"`) {
      return res.status(304).end();
    }

    // التحقق من If-Modified-Since
    const ifModifiedSince = req.headers['if-modified-since'];
    if (ifModifiedSince) {
      const modifiedSince = new Date(ifModifiedSince);
      const lastModified = new Date(asset.lastModified);

      if (lastModified <= modifiedSince) {
        return res.status(304).end();
      }
    }

    // إرسال الملف
    res.send(buffer);
  } catch (error) {
    console.error('خطأ في خدمة CDN:', error);

    if (!res.headersSent) {
      res.status(500).json({
        error: 'خطأ داخلي في الخادم',
        details: error instanceof Error ? error.message : 'خطأ غير معروف',
      });
    }
  }
}

/**
 * تعيين headers الأمثل للملف
 */
function setOptimalHeaders(
  res: NextApiResponse,
  asset: any,
  req: NextApiRequest,
  startTime: number,
): void {
  // Content-Type
  res.setHeader('Content-Type', asset.contentType);

  // Cache Control
  res.setHeader('Cache-Control', asset.cacheControl);

  // ETag للتحقق من التغييرات
  res.setHeader('ETag', `"${asset.etag}"`);

  // Last-Modified
  res.setHeader('Last-Modified', asset.lastModified.toUTCString());

  // Content-Encoding للملفات المضغوطة
  if (asset.compressionType === 'brotli') {
    res.setHeader('Content-Encoding', 'br');
  } else if (asset.compressionType === 'gzip') {
    res.setHeader('Content-Encoding', 'gzip');
  }

  // Vary header لدعم الضغط المتعدد
  res.setHeader('Vary', 'Accept-Encoding');

  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // CORS headers للصور
  if (asset.contentType.startsWith('image/')) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }

  // Content-Length
  res.setHeader('Content-Length', asset.compressedSize);

  // Performance headers
  const processingTime = Date.now() - startTime;
  res.setHeader('X-Processing-Time', `${processingTime}ms`);
  res.setHeader('X-Served-By', 'Advanced-Local-CDN');
  res.setHeader('X-Cache', 'HIT');
  res.setHeader(
    'X-Compression-Ratio',
    (((asset.originalSize - asset.compressedSize) / asset.originalSize) * 100).toFixed(2) + '%',
  );
  res.setHeader('X-Compression-Type', asset.compressionType);
  res.setHeader('Server-Timing', `cdn;dur=${processingTime}`);

  // Service Worker caching hints
  res.setHeader('X-Cache-Strategy', 'cache-first');

  // Preload hints للصور المهمة
  if (asset.contentType.startsWith('image/')) {
    res.setHeader('Link', `<${req.url}>; rel=preload; as=image`);
  }
}

/**
 * معالجة طلبات الصور المتجاوبة
 */
function handleResponsiveImage(assetPath: string, req: NextApiRequest): string {
  const userAgent = req.headers['user-agent'] || '';
  const viewport = req.headers['viewport-width'];

  // تحديد الحجم المناسب حسب viewport
  let targetWidth = 1920; // افتراضي

  if (viewport) {
    const viewportWidth = parseInt(viewport as string);
    if (viewportWidth <= 480) {
      targetWidth = 480;
    } else if (viewportWidth <= 768) {
      targetWidth = 768;
    } else if (viewportWidth <= 1024) {
      targetWidth = 1024;
    } else if (viewportWidth <= 1366) {
      targetWidth = 1366;
    }
  } else {
    // تخمين حسب User Agent
    if (userAgent.includes('Mobile')) {
      targetWidth = 480;
    } else if (userAgent.includes('Tablet')) {
      targetWidth = 768;
    }
  }

  // تعديل مسار الملف ليشمل العرض المطلوب
  const ext = path.extname(assetPath);
  const baseName = path.basename(assetPath, ext);
  const dirName = path.dirname(assetPath);

  return path.join(dirName, `${baseName}_${targetWidth}w${ext}`);
}

/**
 * تحديد أفضل تنسيق للصورة حسب دعم المتصفح
 */
function getBestImageFormat(acceptHeader: string = ''): string {
  const accept = acceptHeader.toLowerCase();

  if (accept.includes('image/avif')) {
    return 'avif';
  } else if (accept.includes('image/webp')) {
    return 'webp';
  } else {
    return 'jpeg';
  }
}

/**
 * تحديد أفضل ضغط حسب دعم المتصفح
 */
function getBestCompression(acceptEncodingHeader: string = ''): string {
  const acceptEncoding = acceptEncodingHeader.toLowerCase();

  if (acceptEncoding.includes('br')) {
    return 'brotli';
  } else if (acceptEncoding.includes('gzip')) {
    return 'gzip';
  } else {
    return 'none';
  }
}

// تصدير الدالة الرئيسية
export default handler;

// تصدير التكوين
export const config = {
  api: {
    responseLimit: '50mb', // حد أقصى للاستجابة
    bodyParser: false, // تعطيل body parser للملفات الثابتة
  },
};
