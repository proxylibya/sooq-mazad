import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

const JWT_SECRET =
  process.env.ADMIN_JWT_SECRET ||
  process.env.JWT_SECRET ||
  'sooq-mazad-admin-secret-key-min-32-chars!';
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

export default async function handler(req, res) {
  const auth = await verifyAuth(req);

  if (!auth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (req.method === 'GET') {
      const { placementId, search } = req.query;

      const where = {};
      if (placementId) {
        where.placementId = placementId;
      }
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      const ads = await prisma.placement_ads.findMany({
        where,
        include: {
          placement: {
            select: {
              id: true,
              name: true,
              location: true,
              type: true,
            },
          },
        },
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      });

      return res.status(200).json({ ads });
    }

    if (req.method === 'POST') {
      const {
        placementId,
        entityType,
        entityId,
        title,
        description,
        imageUrl,
        linkUrl,
        mediaType,
        mediaUrls,
        dimensions,
        customData,
        priority,
        isActive,
        startDate,
        endDate,
      } = req.body;

      if (!placementId) {
        return res.status(400).json({ error: 'Placement ID is required' });
      }

      const ad = await prisma.placement_ads.create({
        data: {
          placementId,
          entityType: entityType || 'CUSTOM',
          entityId: entityId || null,
          title: title || null,
          description: description || null,
          imageUrl: imageUrl || null,
          linkUrl: linkUrl || null,
          mediaType: mediaType || 'IMAGE',
          mediaUrls: mediaUrls || null,
          dimensions: dimensions || null,
          customData: customData || null,
          priority: priority ? parseInt(priority) : 0,
          isActive: isActive !== false,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          videoUrl: req.body.videoUrl || null,
          videoThumbnail: req.body.videoThumbnail || null,
          videoDuration: req.body.videoDuration ? parseInt(req.body.videoDuration) : null,
          videoAutoplay: req.body.videoAutoplay || false,
          videoMuted: req.body.videoMuted !== false, // Default true
          videoLoop: req.body.videoLoop || false,
          aspectRatio: req.body.aspectRatio || null,
          bannerConfig: req.body.bannerConfig || null,
        },
        include: {
          placement: true,
        },
      });

      return res.status(201).json({ ad });
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      const updates = { ...req.body };

      delete updates.id;
      delete updates.placementId;
      delete updates.createdAt;
      delete updates.updatedAt;
      delete updates.placement; // Remove placement relation if present

      // Ensure numeric values are parsed
      if (updates.videoDuration) updates.videoDuration = parseInt(updates.videoDuration);

      if (updates.priority !== undefined) {
        updates.priority = parseInt(updates.priority);
      }

      if (updates.startDate) {
        updates.startDate = new Date(updates.startDate);
      }

      if (updates.endDate) {
        updates.endDate = new Date(updates.endDate);
      }

      const ad = await prisma.placement_ads.update({
        where: { id },
        data: updates,
        include: {
          placement: true,
        },
      });

      return res.status(200).json({ ad });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;

      await prisma.placement_ads.delete({
        where: { id },
      });

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Placement ads API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    });
  }
}
