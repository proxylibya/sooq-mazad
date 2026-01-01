/**
 * API Proxy للصور - يوجه طلبات الصور إلى تطبيق الويب
 * Image Proxy API - Forwards image requests to web app
 */

import fs from 'fs';
import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';

// مسارات البحث عن الصور (من الأكثر شيوعاً إلى الأقل)
const IMAGE_SEARCH_PATHS = [
    // مسار web app public - الموقع الرئيسي للصور
    path.resolve(process.cwd(), '..', 'web', 'public'),
    // مسار root public
    path.resolve(process.cwd(), '..', '..', 'public'),
    // مسار uploads في root
    path.resolve(process.cwd(), '..', '..', 'uploads'),
    // مسار admin public
    path.resolve(process.cwd(), 'public'),
];

// Log paths on startup for debugging
console.log('[Image Proxy] Initialized with search paths:', IMAGE_SEARCH_PATHS);

// تحويلات المسارات (من -> إلى)
const PATH_MAPPINGS: Record<string, string> = {
    'uploads/admin-auctions': 'uploads/auctions',
    'admin-auctions': 'uploads/auctions',
};

// أنواع الصور المدعومة
const MIME_TYPES: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
};

// دالة للبحث عن الصورة في المسارات
function findImage(cleanPath: string): string | null {
    for (const searchPath of IMAGE_SEARCH_PATHS) {
        const fullPath = path.join(searchPath, cleanPath);

        // التحقق من أن المسار لا يخرج عن المجلد المسموح
        if (!fullPath.startsWith(searchPath)) {
            continue;
        }

        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
            return fullPath;
        }
    }
    return null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // الحصول على مسار الصورة من query
        const { path: imagePath } = req.query;

        if (!imagePath || typeof imagePath !== 'string') {
            return res.status(400).json({ error: 'Missing image path' });
        }

        // تنظيف المسار لمنع directory traversal
        let cleanPath = imagePath.replace(/\.\./g, '').replace(/^\/+/, '');

        // البحث عن الصورة في المسار الأصلي
        let foundPath = findImage(cleanPath);

        // إذا لم يُوجد، جرب تحويلات المسارات
        if (!foundPath) {
            for (const [from, to] of Object.entries(PATH_MAPPINGS)) {
                if (cleanPath.includes(from)) {
                    const mappedPath = cleanPath.replace(from, to);
                    foundPath = findImage(mappedPath);
                    if (foundPath) {
                        console.log(`[Image Proxy] Path mapped: ${cleanPath} -> ${mappedPath}`);
                        break;
                    }
                }
            }
        }

        if (!foundPath) {
            // محاولة استخدام صورة placeholder بدلاً من 404
            const placeholderPaths = [
                path.resolve(process.cwd(), 'public', 'images', 'placeholder.svg'),
                path.resolve(process.cwd(), 'public', 'placeholder.svg'),
                path.resolve(process.cwd(), '..', 'web', 'public', 'images', 'cars', 'default-car.svg'),
            ];

            let placeholderPath: string | null = null;
            for (const pPath of placeholderPaths) {
                if (fs.existsSync(pPath)) {
                    placeholderPath = pPath;
                    break;
                }
            }

            if (placeholderPath) {
                console.log(`[Image Proxy] Image not found: ${cleanPath}, serving placeholder`);
                const ext = path.extname(placeholderPath).toLowerCase();
                const mimeType = MIME_TYPES[ext] || 'image/svg+xml';
                const imageBuffer = fs.readFileSync(placeholderPath);

                res.setHeader('Content-Type', mimeType);
                res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 ساعة للـ placeholder
                res.setHeader('Content-Length', imageBuffer.length);
                return res.send(imageBuffer);
            }

            // إذا لم يوجد placeholder، أرجع 404
            console.log(`[Image Proxy] Image not found: ${cleanPath}`);
            return res.status(404).json({ error: 'Image not found', path: cleanPath });
        }

        // الحصول على نوع الملف
        const ext = path.extname(foundPath).toLowerCase();
        const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

        // قراءة الملف وإرساله
        const imageBuffer = fs.readFileSync(foundPath);

        // إعداد headers للتخزين المؤقت
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 ساعة
        res.setHeader('Content-Length', imageBuffer.length);

        return res.send(imageBuffer);
    } catch (error) {
        console.error('[Image Proxy] Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
