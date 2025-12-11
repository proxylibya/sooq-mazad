import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let filters = {};

  try {
    const {
      page = '1',
      pageSize = '20',
      sortBy = 'startDate',
      sortOrder = 'desc',
      search,
      status,
      minPrice,
      maxPrice,
      city,
      category,
      isLive,
      hasReserve,
      featured,
    } = req.query;

    filters = {
      yardId: null,
    };

    if (search && typeof search === 'string') {
      filters.OR = [
        {
          cars: {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { brand: { contains: search, mode: 'insensitive' } },
              { model: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    if (status && typeof status === 'string') {
      filters.status = status;
    }

    if (minPrice || maxPrice) {
      filters.currentPrice = {};
      if (minPrice) filters.currentPrice.gte = parseFloat(minPrice);
      if (maxPrice) filters.currentPrice.lte = parseFloat(maxPrice);
    }

    if (city && typeof city === 'string') {
      filters.cars = {
        ...filters.cars,
        location: city,
      };
    }

    if (category && typeof category === 'string') {
      filters.cars = {
        ...filters.cars,
        bodyType: category,
      };
    }

    if (isLive !== undefined) {
      const now = new Date();
      filters.startDate = { lte: now };
      filters.endDate = { gte: now };
      filters.status = 'ACTIVE';
    }

    if (featured === 'true') {
      filters.featured = true;
    }

    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const take = parseInt(pageSize);

    const orderBy = [
      { featured: 'desc' },
      { [sortBy]: sortOrder },
    ];

    const where = filters;

    const [data, total] = await Promise.all([
      prisma.auctions.findMany({
        skip,
        take,
        where,
        orderBy,
        include: {
          cars: {
            select: {
              id: true,
              title: true,
              brand: true,
              model: true,
              year: true,
              images: true,
              location: true,
              bodyType: true,
              condition: true,
              mileage: true,
            },
          },
          users: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
          _count: {
            select: {
              bids: true,
            },
          },
        },
      }),
      prisma.auctions.count({ where }),
    ]);

    const totalPages = Math.ceil(total / parseInt(pageSize));

    const result = {
      data,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      totalPages,
      hasNextPage: parseInt(page) < totalPages,
      hasPrevPage: parseInt(page) > 1,
    };

    res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching paginated auctions:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      filters: JSON.stringify(filters, null, 2),
    });
    return res.status(500).json({
      error: 'Failed to fetch auctions',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
