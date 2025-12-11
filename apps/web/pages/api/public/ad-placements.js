import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { location } = req.query;

  if (!location) {
    return res.status(400).json({ error: 'Location is required' });
  }

  try {
    const now = new Date();

    const placements = await prisma.ad_placements.findMany({
      where: {
        location,
        isActive: true,
        status: 'ACTIVE',
        OR: [{ startDate: null }, { startDate: { lte: now } }],
        AND: [{ OR: [{ endDate: null }, { endDate: { gte: now } }] }],
      },
      include: {
        ads: {
          where: {
            isActive: true,
            OR: [{ startDate: null }, { startDate: { lte: now } }],
            AND: [{ OR: [{ endDate: null }, { endDate: { gte: now } }] }],
          },
          orderBy: { priority: 'desc' },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });

    for (const placement of placements) {
      for (const ad of placement.ads) {
        await prisma.placement_ads.update({
          where: { id: ad.id },
          data: { impressions: { increment: 1 } },
        });

        let entity = null;

        // Only query entity if entityId exists
        if (ad.entityId) {
          switch (ad.entityType) {
            case 'AUCTION':
            case 'auction':
              entity = await prisma.auctions.findUnique({
                where: { id: ad.entityId },
                select: {
                  id: true,
                  title: true,
                  currentPrice: true,
                  endDate: true,
                  status: true,
                  cars: {
                    select: {
                      id: true,
                      images: true,
                      brand: true,
                      model: true,
                      year: true,
                    },
                  },
                },
              });
              break;

            case 'CAR':
            case 'car':
              entity = await prisma.cars.findUnique({
                where: { id: ad.entityId },
                select: {
                  id: true,
                  title: true,
                  price: true,
                  images: true,
                  brand: true,
                  model: true,
                  year: true,
                  location: true,
                  status: true,
                },
              });
              break;

            case 'TRANSPORT':
            case 'transport': {
              // transport_services لا تحتوي على companyName/serviceType مباشرة
              // نستخدم الحقول الموجودة ثم نعيد تشكيل الكائن ليتوافق مع ما تتوقعه الواجهة
              const transport = await prisma.transport_services.findUnique({
                where: { id: ad.entityId },
                select: {
                  id: true,
                  title: true,
                  truckType: true,
                  pricePerKm: true,
                  status: true,
                },
              });

              if (transport) {
                entity = {
                  id: transport.id,
                  // يعرض في البطاقة كاسم الشركة/مقدم الخدمة
                  companyName: transport.title,
                  // يعرض في البطاقة كسطر الوصف تحت الاسم
                  serviceType: transport.truckType,
                  pricePerKm: transport.pricePerKm,
                  status: transport.status,
                };
              } else {
                entity = null;
              }
              break;
            }

            case 'YARD':
            case 'yard': {
              // نموذج yards لا يحتوي على حقل location واحد، بل city و area
              const yard = await prisma.yards.findUnique({
                where: { id: ad.entityId },
                select: {
                  id: true,
                  name: true,
                  city: true,
                  area: true,
                  capacity: true,
                  status: true,
                },
              });

              if (yard) {
                entity = {
                  id: yard.id,
                  name: yard.name,
                  // AdPlacement.jsx يتوقع field باسم location لعرضه تحت الاسم
                  location: yard.area ? `${yard.city} - ${yard.area}` : yard.city,
                  capacity: yard.capacity,
                  status: yard.status,
                };
              } else {
                entity = null;
              }
              break;
            }

            case 'SHOWROOM':
            case 'showroom': {
              // showrooms لا تحتوي على حقل location واحد في schema، بل city و area
              const showroom = await prisma.showrooms.findUnique({
                where: { id: ad.entityId },
                select: {
                  id: true,
                  name: true,
                  city: true,
                  area: true,
                  description: true,
                  logo: true,
                  rating: true,
                  status: true,
                },
              });

              if (showroom) {
                entity = {
                  id: showroom.id,
                  name: showroom.name,
                  logo: showroom.logo,
                  description: showroom.description,
                  rating: showroom.rating,
                  status: showroom.status,
                  // AdPlacement.jsx يستخدم entity.location (إن وُجد) في النص أسفل الاسم
                  location: showroom.area ? `${showroom.city} - ${showroom.area}` : showroom.city,
                };
              } else {
                entity = null;
              }
              break;
            }

            case 'COMPANY':
            case 'company':
              entity = await prisma.companies.findUnique({
                where: { id: ad.entityId },
                select: {
                  id: true,
                  name: true,
                  logo: true,
                  description: true,
                  status: true,
                },
              });
              break;
          }
        }

        ad.entity = entity;
      }
    }

    return res.status(200).json({ placements });
  } catch (error) {
    console.error('Public ad placements error:', error.message);
    console.error('Stack trace:', error.stack);
    return res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV !== 'production' ? error.message : undefined,
    });
  }
}
