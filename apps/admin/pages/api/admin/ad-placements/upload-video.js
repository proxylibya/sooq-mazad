import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';
import sharp from 'sharp';
import jwt from 'jsonwebtoken';

export const config = {
  api: {
    bodyParser: false,
  },
};

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || 'sooq-mazad-admin-secret-key-min-32-chars!';
const COOKIE_NAME = 'admin_session';

async function verifyAuth(req) {
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

async function generateVideoThumbnail(videoPath) {
  try {
    const thumbnailName = `thumb_${nanoid()}.jpg`;
    const thumbnailPath = path.join(process.cwd(), 'public', 'uploads', 'ads', 'thumbnails', thumbnailName);
    
    await fs.mkdir(path.dirname(thumbnailPath), { recursive: true });
    
    return `/uploads/ads/thumbnails/${thumbnailName}`;
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = await verifyAuth(req);
  if (!auth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const form = new IncomingForm({
    uploadDir: path.join(process.cwd(), 'public', 'uploads', 'ads', 'videos'),
    keepExtensions: true,
    maxFileSize: 100 * 1024 * 1024,
    filename: (name, ext, part) => {
      return `video_${nanoid()}${ext}`;
    },
  });

  try {
    await fs.mkdir(form.uploadDir, { recursive: true });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing form:', err);
        return res.status(500).json({ error: 'Error uploading video' });
      }

      const video = files.video;
      if (!video) {
        return res.status(400).json({ error: 'No video file provided' });
      }

      const videoFile = Array.isArray(video) ? video[0] : video;
      
      const stats = await fs.stat(videoFile.filepath);
      const filename = path.basename(videoFile.filepath);
      const url = `/uploads/ads/videos/${filename}`;

      let thumbnailUrl = null;
      if (fields.generateThumbnail) {
        thumbnailUrl = await generateVideoThumbnail(videoFile.filepath);
      }

      const response = {
        url,
        thumbnailUrl,
        filename,
        size: stats.size,
        format: videoFile.mimetype,
        duration: 0,
        width: 1920,
        height: 1080,
      };

      return res.status(200).json(response);
    });
  } catch (error) {
    console.error('Video upload error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
