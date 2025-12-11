import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, type, id } = req.query;

    if (id) {
      const result = await searchById(id, type);
      return res.status(200).json(result);
    }

    if (query) {
      const result = await searchByQuery(query, type);
      return res.status(200).json(result);
    }

    return res.status(400).json({ error: 'Missing query or id parameter' });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function searchById(id, type) {
  const results = [];

  // البحث في المزادات
  if (!type || type === 'AUCTION') {
    try {
      const auction = await prisma.auctions.findUnique({
        where: { id },
        select: {
          id: true,
          title: true,
          description: true,
          currentPrice: true,
          startPrice: true,
          endDate: true,
          status: true,
          featured: true,
          cars: {
            select: {
              id: true,
              title: true,
              brand: true,
              model: true,
              year: true,
              images: true,
            },
          },
        },
      });

      if (auction) {
        const images = auction.cars?.images ? JSON.parse(auction.cars.images) : [];
        results.push({
          id: auction.id,
          type: 'AUCTION',
          title: auction.title,
          description: auction.description,
          imageUrl: images[0] || null,
          price: auction.currentPrice,
          metadata: {
            startPrice: auction.startPrice,
            endDate: auction.endDate,
            status: auction.status,
            featured: auction.featured,
            car: auction.cars
              ? {
                  brand: auction.cars.brand,
                  model: auction.cars.model,
                  year: auction.cars.year,
                }
              : null,
          },
        });
      }
    } catch (e) {
      console.log('Auction search by ID failed:', e.message);
    }
  }

  // البحث في السيارات (سوق الفوري)
  if (!type || type === 'CAR') {
    try {
      const car = await prisma.cars.findUnique({
        where: { id },
        select: {
          id: true,
          title: true,
          description: true,
          brand: true,
          model: true,
          year: true,
          price: true,
          images: true,
          status: true,
          condition: true,
          location: true,
          mileage: true,
        },
      });

      if (car) {
        const images = car.images ? JSON.parse(car.images) : [];
        results.push({
          id: car.id,
          type: 'CAR',
          title: car.title,
          description: car.description,
          imageUrl: images[0] || null,
          price: car.price,
          metadata: {
            brand: car.brand,
            model: car.model,
            year: car.year,
            status: car.status,
            condition: car.condition,
            location: car.location,
            mileage: car.mileage,
          },
        });
      }
    } catch (e) {
      console.log('Car search by ID failed:', e.message);
    }
  }

  // البحث في المعارض
  if (!type || type === 'SHOWROOM') {
    try {
      const showroom = await prisma.showrooms.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          description: true,
          logo: true,
          city: true,
          area: true,
          verified: true,
          featured: true,
          rating: true,
        },
      });

      if (showroom) {
        results.push({
          id: showroom.id,
          type: 'SHOWROOM',
          title: showroom.name,
          description: showroom.description,
          imageUrl: showroom.logo,
          metadata: {
            city: showroom.city,
            area: showroom.area,
            verified: showroom.verified,
            featured: showroom.featured,
            rating: showroom.rating,
          },
        });
      }
    } catch (e) {
      console.log('Showroom search by ID failed:', e.message);
    }
  }

  // البحث في خدمات النقل
  if (!type || type === 'TRANSPORT') {
    try {
      const transport = await prisma.transport_services.findUnique({
        where: { id },
        select: {
          id: true,
          title: true,
          description: true,
          truckType: true,
          capacity: true,
          serviceArea: true,
          pricePerKm: true,
          contactPhone: true,
          images: true,
          status: true,
          featured: true,
          users: {
            select: {
              name: true,
            },
          },
        },
      });

      if (transport) {
        const images = transport.images ? JSON.parse(transport.images) : [];
        results.push({
          id: transport.id,
          type: 'TRANSPORT',
          title: transport.title,
          description: transport.description,
          imageUrl: images[0] || null,
          price: transport.pricePerKm,
          metadata: {
            truckType: transport.truckType,
            capacity: transport.capacity,
            serviceArea: transport.serviceArea,
            status: transport.status,
            featured: transport.featured,
            ownerName: transport.users?.name,
          },
        });
      }
    } catch (e) {
      console.log('Transport search by ID failed:', e.message);
    }
  }

  // البحث في الساحات
  if (!type || type === 'YARD') {
    try {
      const yard = await prisma.yards.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          description: true,
          image: true,
          city: true,
          area: true,
          phone: true,
          status: true,
          verified: true,
          featured: true,
          rating: true,
          capacity: true,
        },
      });

      if (yard) {
        results.push({
          id: yard.id,
          type: 'YARD',
          title: yard.name,
          description: yard.description,
          imageUrl: yard.image,
          metadata: {
            city: yard.city,
            area: yard.area,
            phone: yard.phone,
            status: yard.status,
            verified: yard.verified,
            featured: yard.featured,
            rating: yard.rating,
            capacity: yard.capacity,
          },
        });
      }
    } catch (e) {
      console.log('Yard search by ID failed:', e.message);
    }
  }

  // البحث في الشركات
  if (!type || type === 'COMPANY') {
    try {
      const company = await prisma.companies.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          description: true,
          logo: true,
          city: true,
          area: true,
          phone: true,
          email: true,
          website: true,
          verified: true,
          featured: true,
          status: true,
          rating: true,
          businessType: true,
        },
      });

      if (company) {
        results.push({
          id: company.id,
          type: 'COMPANY',
          title: company.name,
          description: company.description,
          imageUrl: company.logo,
          metadata: {
            city: company.city,
            area: company.area,
            phone: company.phone,
            email: company.email,
            website: company.website,
            verified: company.verified,
            featured: company.featured,
            status: company.status,
            rating: company.rating,
            businessType: company.businessType,
          },
        });
      }
    } catch (e) {
      console.log('Company search by ID failed:', e.message);
    }
  }

  return { results, total: results.length };
}

async function searchByQuery(query, type) {
  const results = [];

  // البحث في المزادات
  if (!type || type === 'AUCTION') {
    try {
      const auctions = await prisma.auctions.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { id: { contains: query } },
          ],
          status: { in: ['ACTIVE', 'PENDING'] },
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          description: true,
          currentPrice: true,
          startPrice: true,
          endDate: true,
          status: true,
          featured: true,
          cars: {
            select: {
              id: true,
              title: true,
              brand: true,
              model: true,
              year: true,
              images: true,
            },
          },
        },
      });

      auctions.forEach((auction) => {
        const images = auction.cars?.images ? JSON.parse(auction.cars.images) : [];
        results.push({
          id: auction.id,
          type: 'AUCTION',
          title: auction.title,
          description: auction.description,
          imageUrl: images[0] || null,
          price: auction.currentPrice,
          metadata: {
            startPrice: auction.startPrice,
            endDate: auction.endDate,
            status: auction.status,
            featured: auction.featured,
            car: auction.cars
              ? {
                  brand: auction.cars.brand,
                  model: auction.cars.model,
                  year: auction.cars.year,
                }
              : null,
          },
        });
      });
    } catch (e) {
      console.log('Auction search failed:', e.message);
    }
  }

  // البحث في السيارات (سوق الفوري)
  if (!type || type === 'CAR') {
    try {
      const cars = await prisma.cars.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { brand: { contains: query, mode: 'insensitive' } },
            { model: { contains: query, mode: 'insensitive' } },
            { id: { contains: query } },
          ],
          status: 'AVAILABLE',
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          description: true,
          brand: true,
          model: true,
          year: true,
          price: true,
          images: true,
          status: true,
          condition: true,
          location: true,
          mileage: true,
        },
      });

      cars.forEach((car) => {
        const images = car.images ? JSON.parse(car.images) : [];
        results.push({
          id: car.id,
          type: 'CAR',
          title: car.title,
          description: car.description,
          imageUrl: images[0] || null,
          price: car.price,
          metadata: {
            brand: car.brand,
            model: car.model,
            year: car.year,
            status: car.status,
            condition: car.condition,
            location: car.location,
            mileage: car.mileage,
          },
        });
      });
    } catch (e) {
      console.log('Car search failed:', e.message);
    }
  }

  // البحث في المعارض
  if (!type || type === 'SHOWROOM') {
    try {
      const showrooms = await prisma.showrooms.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { id: { contains: query } },
          ],
          status: 'ACTIVE',
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          description: true,
          logo: true,
          city: true,
          area: true,
          verified: true,
          featured: true,
          rating: true,
        },
      });

      showrooms.forEach((showroom) => {
        results.push({
          id: showroom.id,
          type: 'SHOWROOM',
          title: showroom.name,
          description: showroom.description,
          imageUrl: showroom.logo,
          metadata: {
            city: showroom.city,
            area: showroom.area,
            verified: showroom.verified,
            featured: showroom.featured,
            rating: showroom.rating,
          },
        });
      });
    } catch (e) {
      console.log('Showroom search failed:', e.message);
    }
  }

  // البحث في خدمات النقل
  if (!type || type === 'TRANSPORT') {
    try {
      const transports = await prisma.transport_services.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { truckType: { contains: query, mode: 'insensitive' } },
            { serviceArea: { contains: query, mode: 'insensitive' } },
            { id: { contains: query } },
          ],
          status: 'ACTIVE',
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          description: true,
          truckType: true,
          capacity: true,
          serviceArea: true,
          pricePerKm: true,
          contactPhone: true,
          images: true,
          status: true,
          featured: true,
          users: {
            select: {
              name: true,
            },
          },
        },
      });

      transports.forEach((transport) => {
        const images = transport.images ? JSON.parse(transport.images) : [];
        results.push({
          id: transport.id,
          type: 'TRANSPORT',
          title: transport.title,
          description: transport.description,
          imageUrl: images[0] || null,
          price: transport.pricePerKm,
          metadata: {
            truckType: transport.truckType,
            capacity: transport.capacity,
            serviceArea: transport.serviceArea,
            status: transport.status,
            featured: transport.featured,
            ownerName: transport.users?.name,
          },
        });
      });
    } catch (e) {
      console.log('Transport search failed:', e.message);
    }
  }

  // البحث في الساحات
  if (!type || type === 'YARD') {
    try {
      const yards = await prisma.yards.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { city: { contains: query, mode: 'insensitive' } },
            { id: { contains: query } },
          ],
          status: 'ACTIVE',
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          description: true,
          image: true,
          city: true,
          area: true,
          phone: true,
          status: true,
          verified: true,
          featured: true,
          rating: true,
          capacity: true,
        },
      });

      yards.forEach((yard) => {
        results.push({
          id: yard.id,
          type: 'YARD',
          title: yard.name,
          description: yard.description,
          imageUrl: yard.image,
          metadata: {
            city: yard.city,
            area: yard.area,
            phone: yard.phone,
            status: yard.status,
            verified: yard.verified,
            featured: yard.featured,
            rating: yard.rating,
            capacity: yard.capacity,
          },
        });
      });
    } catch (e) {
      console.log('Yard search failed:', e.message);
    }
  }

  // البحث في الشركات
  if (!type || type === 'COMPANY') {
    try {
      const companies = await prisma.companies.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { city: { contains: query, mode: 'insensitive' } },
            { id: { contains: query } },
          ],
          status: 'ACTIVE',
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          description: true,
          logo: true,
          city: true,
          area: true,
          phone: true,
          email: true,
          website: true,
          verified: true,
          featured: true,
          status: true,
          rating: true,
          businessType: true,
        },
      });

      companies.forEach((company) => {
        results.push({
          id: company.id,
          type: 'COMPANY',
          title: company.name,
          description: company.description,
          imageUrl: company.logo,
          metadata: {
            city: company.city,
            area: company.area,
            phone: company.phone,
            email: company.email,
            website: company.website,
            verified: company.verified,
            featured: company.featured,
            status: company.status,
            rating: company.rating,
            businessType: company.businessType,
          },
        });
      });
    } catch (e) {
      console.log('Company search failed:', e.message);
    }
  }

  return { results, total: results.length };
}
