import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { paginateQuery, PaginationHelper } from '@/utils/pagination-helpers';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      page = '1',
      pageSize = '20',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      brand,
      model,
      minPrice,
      maxPrice,
      minYear,
      maxYear,
      city,
      status,
      fuelType,
      transmission,
      condition,
    } = req.query;

    // بناء filters
    const filters: Record<string, any> = {};

    if (search && typeof search === 'string') {
      filters.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (brand && typeof brand === 'string') {
      filters.brand = brand;
    }

    if (model && typeof model === 'string') {
      filters.model = model;
    }

    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.gte = parseFloat(minPrice as string);
      if (maxPrice) filters.price.lte = parseFloat(maxPrice as string);
    }

    if (minYear || maxYear) {
      filters.year = {};
      if (minYear) filters.year.gte = parseInt(minYear as string);
      if (maxYear) filters.year.lte = parseInt(maxYear as string);
    }

    if (city && typeof city === 'string') {
      filters.location = { contains: city, mode: 'insensitive' };
    }

    if (status && typeof status === 'string') {
      filters.status = status;
    }

    if (fuelType && typeof fuelType === 'string') {
      filters.fuelType = fuelType;
    }

    if (transmission && typeof transmission === 'string') {
      filters.transmission = transmission;
    }

    if (condition && typeof condition === 'string') {
      filters.condition = condition;
    }

    // استدعاء pagination
    const result = await paginateQuery(prisma.car, {
      page: parseInt(page as string),
      pageSize: parseInt(pageSize as string),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc',
      filters,
    });

    // إضافة cache headers
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching paginated cars:', error);
    return res.status(500).json({ error: 'Failed to fetch cars' });
  }
}
