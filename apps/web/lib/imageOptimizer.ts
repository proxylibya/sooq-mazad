/**
 * @deprecated استخدم @/lib/image-system بدلاً من هذا الملف
 * هذا الملف wrapper للتوافق مع الكود القديم
 */

import { ImageSystem, getImageMetadata, validateImageFile } from './image-system';

export const optimizeImage = async (
  buffer: Buffer,
  options?: { quality?: number; width?: number; height?: number; },
): Promise<Buffer> => {
  const result = await ImageSystem.optimizeImage(buffer, {
    quality: options?.quality,
    width: options?.width,
    height: options?.height,
  });
  return result.buffer;
};

export async function validateImage(buffer: Buffer) {
  const validation = validateImageFile(buffer);
  if (!validation.valid) {
    return { isValid: false, format: 'unknown', width: 0, height: 0, size: buffer.length };
  }
  const metadata = await getImageMetadata(buffer);
  return {
    isValid: true,
    format: metadata.format,
    width: metadata.width,
    height: metadata.height,
    size: metadata.size,
  };
}

export async function optimizeMultipleSizes(buffer: Buffer, originalFilename: string) {
  const baseName = originalFilename.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const result = await ImageSystem.optimizeImage(buffer, { format: 'webp', quality: 82 });
  return {
    thumbnail: { buffer: result.buffer, filename: `thumb_${baseName}`, size: result.buffer.length },
    medium: { buffer: result.buffer, filename: `med_${baseName}`, size: result.buffer.length },
    large: { buffer: result.buffer, filename: `lg_${baseName}`, size: result.buffer.length },
    original: { buffer, filename: baseName, size: buffer.length },
  };
}

export const imageOptimizer = { optimizeImage, validateImage, optimizeMultipleSizes };
export default imageOptimizer;
