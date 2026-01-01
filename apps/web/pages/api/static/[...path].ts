import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream';
import { promisify } from 'util';

const pipelineAsync = promisify(pipeline);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { path: filePath } = req.query;

    if (!filePath || !Array.isArray(filePath)) {
      return res.status(400).json({ error: 'Invalid file path' });
    }

    // بناء المسار الكامل للملف
    const fullPath = path.join(process.cwd(), 'uploads', ...filePath);

    // التحقق من وجود الملف
    if (!fs.existsSync(fullPath)) {
      console.log('الملف غير موجود:', fullPath);
      return res.status(404).json({ error: 'File not found' });
    }

    // التحقق من أن المسار آمن (داخل مجلد uploads)
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const resolvedPath = path.resolve(fullPath);
    const resolvedUploadsDir = path.resolve(uploadsDir);

    if (!resolvedPath.startsWith(resolvedUploadsDir)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // الحصول على معلومات الملف
    const stats = fs.statSync(fullPath);

    if (!stats.isFile()) {
      return res.status(404).json({ error: 'Not a file' });
    }

    // تحديد نوع المحتوى بناءً على امتداد الملف
    const ext = path.extname(fullPath).toLowerCase();
    let contentType = 'application/octet-stream';

    switch (ext) {
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
      case '.webp':
        contentType = 'image/webp';
        break;
      case '.svg':
        contentType = 'image/svg+xml';
        break;
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.txt':
        contentType = 'text/plain';
        break;
      case '.json':
        contentType = 'application/json';
        break;
    }

    // تعيين headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    // إرسال الملف
    const readStream = fs.createReadStream(fullPath);
    await pipelineAsync(readStream, res);
  } catch (error) {
    console.error('خطأ في خدمة الملف:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
