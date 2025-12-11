/**
 * API رفع صور السيارات - لوحة التحكم
 * Upload Car Images API - Admin Panel
 */

import formidable from 'formidable';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || 'sooq-mazad-admin-secret-key-min-32-chars!';
const COOKIE_NAME = 'admin_session';

// تعطيل body parser الافتراضي
export const config = {
    api: {
        bodyParser: false,
        responseLimit: '50mb',
    },
};

// Verify admin authentication
async function verifyAuth(req: NextApiRequest): Promise<{ adminId: string; role: string; } | null> {
    const token = req.cookies[COOKIE_NAME] || req.cookies.admin_token;
    if (!token) return null;

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { adminId: string; role: string; type: string; };
        if (decoded.type !== 'admin') return null;
        return { adminId: decoded.adminId, role: decoded.role };
    } catch {
        return null;
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // إعداد CORS headers
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
        // التحقق من المصادقة - مرن في وضع التطوير
        const auth = await verifyAuth(req);
        const isDevelopment = process.env.NODE_ENV === 'development';

        if (!auth && !isDevelopment) {
            return res.status(401).json({ success: false, message: 'غير مصرح - سجل الدخول' });
        }

        if (!auth && isDevelopment) {
            console.warn('⚠️ [تحذير] رفع صورة بدون مصادقة في وضع التطوير');
        }

        // تحديد مسار المشروع الرئيسي (الجذر)
        // process.cwd() في admin app = apps/admin
        // نريد الحفظ في المجلد المشترك: public/uploads/marketplace
        const rootDir = path.resolve(process.cwd(), '..', '..');

        // إنشاء مجلد الرفع في المسار المشترك
        const uploadDir = path.join(rootDir, 'public', 'uploads', 'marketplace');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // أيضاً إنشاء نسخة في مجلد web للتأكد من الوصول
        const webUploadDir = path.join(rootDir, 'apps', 'web', 'public', 'uploads', 'marketplace');
        if (!fs.existsSync(webUploadDir)) {
            fs.mkdirSync(webUploadDir, { recursive: true });
        }

        // إنشاء مجلد temp إذا لم يكن موجوداً
        const tempDir = path.join(rootDir, 'uploads', 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        console.log('[Upload] مسارات الرفع:', { rootDir, uploadDir, webUploadDir, tempDir });

        // إعداد formidable
        const form = formidable({
            uploadDir: tempDir,
            keepExtensions: true,
            maxFileSize: 5 * 1024 * 1024, // 5MB
            filter: (part) => {
                return part.mimetype?.startsWith('image/') || false;
            },
        });

        // معالجة الملف
        const [fields, files] = await form.parse(req);

        // البحث عن الملف - قد يكون باسم 'image' أو غيره
        let imageFile = files.image?.[0];
        if (!imageFile) {
            // البحث عن أي ملف صورة
            const allFiles = Object.values(files).flat();
            imageFile = allFiles[0] as formidable.File | undefined;
        }

        if (!imageFile) {
            return res.status(400).json({ success: false, message: 'لم يتم رفع صورة' });
        }

        // التحقق من نوع الملف
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!imageFile.mimetype || !allowedTypes.includes(imageFile.mimetype)) {
            // حذف الملف غير المسموح
            if (fs.existsSync(imageFile.filepath)) {
                fs.unlinkSync(imageFile.filepath);
            }
            return res.status(400).json({ success: false, message: 'نوع الملف غير مدعوم. استخدم JPG, PNG, أو WebP' });
        }

        // الحصول على معلومات إضافية
        const category = Array.isArray(fields.category) ? fields.category[0] : fields.category || 'listings';
        const userId = auth?.adminId || 'admin_user';

        // إعادة تسمية الملف
        const timestamp = Date.now();
        const ext = path.extname(imageFile.originalFilename || '.jpg');
        const newFileName = `marketplace_${category}_${timestamp}${ext}`;
        const newFilePath = path.join(uploadDir, newFileName);

        // نقل الملف إلى المجلد الرئيسي
        fs.renameSync(imageFile.filepath, newFilePath);

        // التحقق من نجاح النقل
        if (!fs.existsSync(newFilePath)) {
            return res.status(500).json({ success: false, message: 'فشل في حفظ الصورة' });
        }

        // نسخ الملف إلى مجلد web - هذا المجلد الأساسي للعرض
        const webFilePath = path.join(webUploadDir, newFileName);
        try {
            fs.copyFileSync(newFilePath, webFilePath);
            console.log('[Upload] تم نسخ الصورة إلى مجلد web:', webFilePath);

            // التحقق من نجاح النسخ
            if (!fs.existsSync(webFilePath)) {
                console.error('[Upload] فشل التحقق من وجود الملف في web');
            }
        } catch (copyError) {
            console.error('[Upload] خطأ في نسخ الصورة إلى web:', copyError);
            // محاولة النقل بدلاً من النسخ
            try {
                fs.renameSync(newFilePath, webFilePath);
                console.log('[Upload] تم نقل الصورة إلى مجلد web بنجاح');
            } catch (moveError) {
                console.error('[Upload] فشل نقل الصورة أيضاً:', moveError);
            }
        }

        // إنشاء URL للصورة
        const fileUrl = `/uploads/marketplace/${newFileName}`;

        console.log('✅ تم رفع الصورة بنجاح:', {
            fileName: newFileName,
            fileUrl,
            size: imageFile.size,
            category,
            uploadedBy: userId,
        });

        return res.status(200).json({
            success: true,
            message: 'تم رفع الصورة بنجاح',
            fileName: newFileName,
            fileUrl,
            url: fileUrl,
            fileSize: imageFile.size,
            category,
        });
    } catch (error) {
        console.error('❌ خطأ في رفع الصورة:', error);

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
