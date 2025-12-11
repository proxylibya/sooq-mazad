import { IncomingForm } from 'formidable';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import path from 'path';

// Sharp import - might need to install
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.warn('Sharp not available, falling back to basic upload');
  sharp = null;
}

const IMAGE_CONFIG = {
  // No file size limit - accepts any size
  PATHS: {
    temp: 'uploads/temp',
    ads: 'public/uploads/ads',
  },
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  DEFAULT_QUALITY: 82,
};

// ImageSystem implementation for admin
const ImageSystem = {
  async processAndSaveImage(buffer, originalName, options = {}) {
    try {
      const { category = 'ads', userId, optimize = true, generateSizes = false } = options;

      // Generate unique filename
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      const ext = path.extname(originalName).toLowerCase() || '.jpg';
      const baseName = `${category}_${timestamp}_${random}`;
      const fileName = `${baseName}${ext}`;

      // Output directory
      const outputDir = path.join(process.cwd(), IMAGE_CONFIG.PATHS.ads);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Get image metadata
      let width = 0,
        height = 0,
        format = ext.replace('.', '');

      if (sharp) {
        const metadata = await sharp(buffer).metadata();
        width = metadata.width || 0;
        height = metadata.height || 0;
        format = metadata.format || format;
      }

      // Save original or optimize with sharp
      let finalBuffer = buffer;
      let finalFileName = fileName;
      let finalExt = ext;

      if (sharp && optimize) {
        try {
          finalBuffer = await sharp(buffer)
            .rotate() // Auto-rotate based on EXIF
            .webp({ quality: IMAGE_CONFIG.DEFAULT_QUALITY })
            .toBuffer();
          finalFileName = `${baseName}.webp`;
          finalExt = '.webp';
          format = 'webp';

          // Get optimized metadata
          const optimizedMeta = await sharp(finalBuffer).metadata();
          width = optimizedMeta.width || width;
          height = optimizedMeta.height || height;
        } catch (sharpError) {
          console.warn('Sharp optimization failed, using original:', sharpError.message);
          finalBuffer = buffer;
        }
      }

      const outputPath = path.join(outputDir, finalFileName);
      fs.writeFileSync(outputPath, finalBuffer);

      // Generate URL path
      const url = `/uploads/ads/${finalFileName}`;
      const originalUrl = `/uploads/ads/${fileName}`;

      // Save original as well if optimized
      if (sharp && optimize && finalFileName !== fileName) {
        fs.writeFileSync(path.join(outputDir, fileName), buffer);
      }

      return {
        success: true,
        original: {
          url: optimize ? url : originalUrl,
          filename: finalFileName,
          size: finalBuffer.length,
          width,
          height,
          format,
        },
        optimized: optimize
          ? {
              url,
              filename: finalFileName,
              size: finalBuffer.length,
              width,
              height,
              format,
            }
          : undefined,
        savings: optimize
          ? {
              bytes: buffer.length - finalBuffer.length,
              percentage: Math.round(((buffer.length - finalBuffer.length) / buffer.length) * 100),
            }
          : undefined,
      };
    } catch (error) {
      console.error('ImageSystem.processAndSaveImage error:', error);
      return {
        success: false,
        error: error.message || 'Failed to process image',
      };
    }
  },
};

export const config = {
  api: {
    bodyParser: false,
    responseLimit: '15mb',
  },
};

const JWT_SECRET =
  process.env.ADMIN_JWT_SECRET ||
  process.env.JWT_SECRET ||
  'sooq-mazad-admin-secret-key-min-32-chars!';
const COOKIE_NAME = 'admin_session';

function verifyAuth(req) {
  const token = req.cookies[COOKIE_NAME] || req.cookies.admin_token;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type !== 'admin') return null;
    return { adminId: decoded.adminId, role: decoded.role };
  } catch {
    return null;
  }
}

async function parseForm(req) {
  return new Promise((resolve, reject) => {
    const uploadDir = `${process.cwd()}/${IMAGE_CONFIG.PATHS.temp}`;

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = new IncomingForm({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 500 * 1024 * 1024, // 500MB - essentially unlimited
      multiples: true,
      allowEmptyFiles: false,
      minFileSize: 1,
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error('Parse error:', err);
        reject(
          new Error(
            err.message.includes('maxFileSize')
              ? `File too large. Maximum 500 MB`
              : 'Error processing request',
          ),
        );
      } else {
        const parsedFields = {};
        for (const [key, value] of Object.entries(fields)) {
          parsedFields[key] = Array.isArray(value) ? value[0] : value;
        }
        resolve({ fields: parsedFields, files });
      }
    });
  });
}

function extractFile(files) {
  const keys = ['media', 'image', 'file', 'photo', 'upload', 'banner'];

  for (const key of keys) {
    if (files[key]) {
      const file = files[key];
      return Array.isArray(file) ? file[0] : file;
    }
  }

  const allFiles = Object.values(files).flat();
  return allFiles[0] || null;
}

function extractMultipleFiles(files) {
  const result = [];
  const keys = ['media', 'images', 'files', 'photos', 'uploads', 'banners'];

  for (const key of keys) {
    if (files[key]) {
      const file = files[key];
      if (Array.isArray(file)) {
        result.push(...file);
      } else {
        result.push(file);
      }
    }
  }

  if (result.length === 0) {
    return Object.values(files).flat();
  }

  return result;
}

function cleanupFile(filepath) {
  try {
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  } catch (e) {
    console.warn('Cleanup failed:', e);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = verifyAuth(req);
  if (!auth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  let tempFiles = [];

  try {
    const { fields, files } = await parseForm(req);

    const multiple = fields.multiple === 'true';
    const mediaType = fields.mediaType || 'IMAGE';
    const category = fields.category || 'ads';

    if (multiple) {
      const fileList = extractMultipleFiles(files);

      if (fileList.length === 0) {
        return res.status(400).json({ error: 'No files found' });
      }

      tempFiles = fileList.map((f) => f.filepath);
      const results = [];

      for (const file of fileList) {
        const buffer = fs.readFileSync(file.filepath);

        const options = {
          category,
          userId: auth.adminId,
          optimize: fields.optimize !== 'false',
          generateSizes: fields.generateSizes === 'true',
          quality: fields.quality ? parseInt(fields.quality) : undefined,
          maxWidth: fields.maxWidth ? parseInt(fields.maxWidth) : undefined,
          maxHeight: fields.maxHeight ? parseInt(fields.maxHeight) : undefined,
        };

        const result = await ImageSystem.processAndSaveImage(
          buffer,
          file.originalFilename || 'ad-media.jpg',
          options,
        );

        if (result.success) {
          results.push({
            url: result.optimized?.url || result.original.url,
            originalUrl: result.original.url,
            filename: result.original.filename,
            size: result.original.size,
            width: result.original.width,
            height: result.original.height,
            format: result.original.format,
            optimized: result.optimized,
          });
        }

        cleanupFile(file.filepath);
      }

      return res.status(200).json({
        success: true,
        mediaType,
        multiple: true,
        files: results,
      });
    } else {
      const file = extractFile(files);

      if (!file) {
        return res.status(400).json({ error: 'No file found' });
      }

      tempFiles.push(file.filepath);
      const buffer = fs.readFileSync(file.filepath);

      const options = {
        category,
        userId: auth.adminId,
        optimize: fields.optimize !== 'false',
        generateSizes: fields.generateSizes === 'true',
        quality: fields.quality ? parseInt(fields.quality) : undefined,
        maxWidth: fields.maxWidth ? parseInt(fields.maxWidth) : undefined,
        maxHeight: fields.maxHeight ? parseInt(fields.maxHeight) : undefined,
      };

      const result = await ImageSystem.processAndSaveImage(
        buffer,
        file.originalFilename || 'ad-media.jpg',
        options,
      );

      cleanupFile(file.filepath);

      if (!result.success) {
        return res.status(400).json({
          error: result.error || 'Processing failed',
        });
      }

      return res.status(200).json({
        success: true,
        mediaType,
        url: result.optimized?.url || result.original.url,
        originalUrl: result.original.url,
        filename: result.original.filename,
        size: result.original.size,
        width: result.original.width,
        height: result.original.height,
        format: result.original.format,
        optimized: result.optimized,
        savings: result.savings,
      });
    }
  } catch (error) {
    console.error('Upload error:', error);

    tempFiles.forEach(cleanupFile);

    return res.status(500).json({
      error: error.message || 'Internal server error',
    });
  }
}
