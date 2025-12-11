import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // إضافة headers صريحة
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      method: req.method,
    });
  }

  try {
    // التحقق من وجود body
    if (!req.body) {
      return res.status(400).json({
        success: false,
        error: 'Request body is empty',
      });
    }

    const { carData, images } = req.body;

    // التحقق البسيط
    if (!carData) {
      return res.status(400).json({
        success: false,
        error: 'Car data is missing',
      });
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Images are missing',
      });
    }

    // محاكاة إنشاء الإعلان
    const mockListing = {
      id: 'listing_' + Date.now(),
      carData: carData,
      images: images,
      createdAt: new Date().toISOString(),
      status: 'created',
    };

    const response = {
      success: true,
      message: 'Listing created successfully',
      data: mockListing,
    };

    return res.status(201).json(response);
  } catch (error) {
    console.error('[فشل] Error in simple create:', error);

    const errorResponse = {
      success: false,
      error: 'Internal server error',
      details: error.message,
      stack: error.stack,
    };

    return res.status(500).json(errorResponse);
  }
}
