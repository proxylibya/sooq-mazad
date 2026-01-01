import formidable from 'formidable';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';

const JWT_SECRET =
  process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || 'sooq-mazad-admin-secret-key-min-32-chars!';
const COOKIE_NAME = 'admin_session';

export const config = {
  api: {
    bodyParser: false,
    responseLimit: '50mb',
  },
};

async function verifyAuth(req: NextApiRequest): Promise<{ adminId: string; role: string } | null> {
  const token = req.cookies[COOKIE_NAME] || req.cookies.admin_token;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      adminId: string;
      role: string;
      type: string;
    };
    if (decoded.type !== 'admin') return null;
    return { adminId: decoded.adminId, role: decoded.role };
  } catch {
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const auth = await verifyAuth(req);
    const isDevelopment = process.env.NODE_ENV === 'development';

    if (!auth && !isDevelopment) {
      return res.status(401).json({ success: false, message: 'غير مصرح - سجل الدخول' });
    }

    const rootDir = path.resolve(process.cwd(), '..', '..');

    const uploadDir = path.join(rootDir, 'public', 'uploads', 'branding');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const webUploadDir = path.join(rootDir, 'apps', 'web', 'public', 'uploads', 'branding');
    if (!fs.existsSync(webUploadDir)) {
      fs.mkdirSync(webUploadDir, { recursive: true });
    }

    const tempDir = path.join(rootDir, 'uploads', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const form = formidable({
      uploadDir: tempDir,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024,
      filter: (part) => {
        return part.mimetype?.startsWith('image/') || false;
      },
    });

    const [fields, files] = await form.parse(req);

    let imageFile = files.image?.[0];
    if (!imageFile) {
      const allFiles = Object.values(files).flat();
      imageFile = allFiles[0] as formidable.File | undefined;
    }

    if (!imageFile) {
      return res.status(400).json({ success: false, message: 'لم يتم رفع صورة' });
    }

    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/svg+xml',
    ];

    if (!imageFile.mimetype || !allowedTypes.includes(imageFile.mimetype)) {
      if (fs.existsSync(imageFile.filepath)) {
        fs.unlinkSync(imageFile.filepath);
      }
      return res.status(400).json({
        success: false,
        message: 'نوع الملف غير مدعوم. استخدم JPG, PNG, WebP أو SVG',
      });
    }

    const category = Array.isArray(fields.category) ? fields.category[0] : fields.category || 'branding';
    const userId = auth?.adminId || 'admin_user';

    const timestamp = Date.now();
    const ext = path.extname(imageFile.originalFilename || '.png');
    const newFileName = `branding_${category}_${timestamp}${ext}`;
    const newFilePath = path.join(uploadDir, newFileName);

    fs.renameSync(imageFile.filepath, newFilePath);

    if (!fs.existsSync(newFilePath)) {
      return res.status(500).json({ success: false, message: 'فشل في حفظ الصورة' });
    }

    const webFilePath = path.join(webUploadDir, newFileName);
    try {
      fs.copyFileSync(newFilePath, webFilePath);
    } catch {
      try {
        fs.renameSync(newFilePath, webFilePath);
      } catch {
      }
    }

    const fileUrl = `/uploads/branding/${newFileName}`;

    return res.status(200).json({
      success: true,
      message: 'تم رفع الشعار بنجاح',
      fileName: newFileName,
      fileUrl,
      url: fileUrl,
      fileSize: imageFile.size,
      category,
      uploadedBy: userId,
    });
  } catch (error) {
    let errorMessage = 'حدث خطأ في رفع الصورة';
    if (error instanceof Error) {
      if (error.message.includes('maxFileSize')) {
        errorMessage = 'حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت';
      } else if (error.message.includes('ENOSPC')) {
        errorMessage = 'مساحة التخزين ممتلئة';
      }
    }

    return res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined,
    });
  }
}

