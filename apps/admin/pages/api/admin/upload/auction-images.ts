/**
 * API رفع صور المزاد - لوحة التحكم
 * Upload Auction Images API - Admin Panel
 */

import { PrismaClient } from '@prisma/client';
import formidable from 'formidable';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';

// Prisma client singleton
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined; };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || 'sooq-mazad-admin-secret-key-min-32-chars!';
const COOKIE_NAME = 'admin_session';

// تعطيل body parser الافتراضي
export const config = {
    api: {
        bodyParser: false,
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
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        // التحقق من المصادقة
        const auth = await verifyAuth(req);
        if (!auth) {
            return res.status(401).json({ success: false, message: 'غير مصرح' });
        }

        // إنشاء مجلد الرفع في apps/web/public ليكون متاحاً للعرض في تطبيق web
        // هذا يضمن أن الصور المرفوعة من admin تظهر في web
        const webPublicDir = path.resolve(process.cwd(), '..', 'web', 'public', 'uploads', 'auctions');
        if (!fs.existsSync(webPublicDir)) {
            fs.mkdirSync(webPublicDir, { recursive: true });
        }
        const uploadDir = webPublicDir;

        // إعداد formidable
        const form = formidable({
            uploadDir,
            keepExtensions: true,
            maxFileSize: 5 * 1024 * 1024, // 5MB
            filter: (part) => {
                return part.mimetype?.startsWith('image/') || false;
            },
        });

        // معالجة الملف
        const [, files] = await form.parse(req);

        const imageFile = files.image?.[0];
        if (!imageFile) {
            return res.status(400).json({ success: false, message: 'لم يتم رفع صورة' });
        }

        // التحقق من نوع الملف
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!imageFile.mimetype || !allowedTypes.includes(imageFile.mimetype)) {
            // حذف الملف غير المسموح
            fs.unlinkSync(imageFile.filepath);
            return res.status(400).json({ success: false, message: 'نوع الملف غير مدعوم' });
        }

        // إعادة تسمية الملف
        const timestamp = Date.now();
        const ext = path.extname(imageFile.originalFilename || '.jpg');
        const newFileName = `auction_${timestamp}${ext}`;
        const newFilePath = path.join(uploadDir, newFileName);

        // نقل الملف
        fs.renameSync(imageFile.filepath, newFilePath);

        // إنشاء URL للصورة (يستخدم مسار uploads/auctions المتاح في web)
        const fileUrl = `/uploads/auctions/${newFileName}`;

        return res.status(200).json({
            success: true,
            message: 'تم رفع الصورة بنجاح',
            fileUrl,
            url: fileUrl,
        });
    } catch (error) {
        console.error('خطأ في رفع الصورة:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ في رفع الصورة',
        });
    }
}
