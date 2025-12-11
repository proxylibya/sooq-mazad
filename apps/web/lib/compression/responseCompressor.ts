/**
 * Advanced Response Compression System
 * نظام ضغط متقدم للاستجابات لتقليل حجم البيانات المنقولة
 */

import { NextApiResponse } from 'next';
import { promisify } from 'util';
import zlib from 'zlib';

const gzip = promisify(zlib.gzip);
const brotliCompress = promisify(zlib.brotliCompress);

interface CompressionOptions {
  threshold?: number; // الحد الأدنى للحجم للضغط (بايت)
  level?: number; // مستوى الضغط 1-9
  prefer?: 'gzip' | 'brotli' | 'auto';
}

/**
 * ضغط البيانات بناءً على Accept-Encoding
 */
export async function compressResponse(
  data: any,
  acceptEncoding: string = '',
  options: CompressionOptions = {},
): Promise<{ data: Buffer | string; encoding: string }> {
  const {
    threshold = 1024, // 1KB
    level = 6, // مستوى متوازن
    prefer = 'auto',
  } = options;

  // تحويل البيانات إلى string إذا كانت object
  const stringData = typeof data === 'string' ? data : JSON.stringify(data);
  const dataBuffer = Buffer.from(stringData, 'utf8');

  // إذا كان الحجم أقل من threshold، لا نضغط
  if (dataBuffer.length < threshold) {
    return { data: stringData, encoding: 'identity' };
  }

  // تحديد نوع الضغط
  const supportsBrotli = acceptEncoding.includes('br');
  const supportsGzip = acceptEncoding.includes('gzip');
  const supportsDeflate = acceptEncoding.includes('deflate');

  try {
    // Brotli - أفضل ضغط (Chrome, Firefox, Edge الحديثة)
    if (supportsBrotli && (prefer === 'brotli' || prefer === 'auto')) {
      const compressed = await brotliCompress(dataBuffer, {
        params: {
          [zlib.constants.BROTLI_PARAM_QUALITY]: level,
          [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
        },
      });
      return { data: compressed, encoding: 'br' };
    }

    // Gzip - دعم واسع
    if (supportsGzip) {
      const compressed = await gzip(dataBuffer, { level });
      return { data: compressed, encoding: 'gzip' };
    }

    // Deflate - fallback
    if (supportsDeflate) {
      const compressed = await promisify(zlib.deflate)(dataBuffer, {
        level,
      });
      return { data: compressed, encoding: 'deflate' };
    }
  } catch (error) {
    console.error('Compression error:', error);
  }

  // إذا فشل الضغط أو غير مدعوم
  return { data: stringData, encoding: 'identity' };
}

/**
 * Middleware لضغط الاستجابات تلقائياً
 */
export function withCompression(handler: Function, options: CompressionOptions = {}) {
  return async (req: any, res: NextApiResponse) => {
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);

    // Override res.json
    res.json = async function (data: any) {
      const acceptEncoding = req.headers['accept-encoding'] || '';

      try {
        const { data: compressed, encoding } = await compressResponse(
          data,
          acceptEncoding,
          options,
        );

        if (encoding !== 'identity') {
          res.setHeader('Content-Encoding', encoding);
          res.setHeader('Vary', 'Accept-Encoding');

          // حساب نسبة الضغط
          const originalSize = Buffer.byteLength(JSON.stringify(data));
          const compressedSize = Buffer.byteLength(compressed);
          const ratio = (((originalSize - compressedSize) / originalSize) * 100).toFixed(1);

          res.setHeader('X-Compression-Ratio', `${ratio}%`);
          res.setHeader('X-Original-Size', originalSize.toString());
          res.setHeader('X-Compressed-Size', compressedSize.toString());
        }

        return originalSend(compressed);
      } catch (error) {
        console.error('Compression middleware error:', error);
        return originalJson(data);
      }
    };

    // Override res.send
    res.send = async function (data: any) {
      if (typeof data === 'object') {
        return res.json(data);
      }
      return originalSend(data);
    };

    await handler(req, res);
  };
}

/**
 * حساب توفير الـ bandwidth
 */
export function calculateBandwidthSavings(
  originalSize: number,
  compressedSize: number,
): {
  saved: number;
  ratio: string;
  percentage: string;
} {
  const saved = originalSize - compressedSize;
  const ratio = (compressedSize / originalSize).toFixed(2);
  const percentage = ((saved / originalSize) * 100).toFixed(1);

  return {
    saved,
    ratio,
    percentage: percentage + '%',
  };
}

/**
 * تحديد أفضل طريقة ضغط
 */
export function getBestCompressionMethod(
  acceptEncoding: string,
): 'br' | 'gzip' | 'deflate' | 'identity' {
  if (acceptEncoding.includes('br')) return 'br';
  if (acceptEncoding.includes('gzip')) return 'gzip';
  if (acceptEncoding.includes('deflate')) return 'deflate';
  return 'identity';
}
