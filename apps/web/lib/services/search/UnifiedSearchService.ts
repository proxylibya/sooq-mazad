import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * خدمة البحث الموحدة الشاملة
 * تدعم البحث في جميع أقسام المشروع
 */

export interface SearchOptions {
  query: string;
  type?: 'all' | 'cars' | 'auctions' | 'showrooms' | 'transport' | 'users';
  filters?: {
    brand?: string;
    model?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    yearFrom?: number;
    yearTo?: number;
    condition?: string;
    status?: string;
  };
  page?: number;
  limit?: number;
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
}

export interface SearchResult {
  type: 'car' | 'auction' | 'showroom' | 'transport' | 'user';
  id: string;
  title: string;
  description?: string;
  image?: string;
  price?: number;
  location?: string;
  url: string;
  relevance: number;
  highlights?: string[];
  metadata?: Record<string, any>;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  aggregations: {
    byType: Record<string, number>;
    byCity: Record<string, number>;
    byBrand: Record<string, number>;
  };
}

export class UnifiedSearchService {
  /**
   * البحث الموحد الشامل
   */
  static async search(options: SearchOptions): Promise<SearchResponse> {
    const {
      query,
      type = 'all',
      filters = {},
      page = 1,
      limit = 20,
      sort = { field: 'relevance', order: 'desc' },
    } = options;

    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery || cleanQuery.length < 2) {
      throw new Error('مصطلح البحث يجب أن يكون على الأقل حرفين');
    }

    const results: SearchResult[] = [];

    if (type === 'all' || type === 'cars') {
      const cars = await this.searchCars(cleanQuery, filters, { page, limit });
      results.push(...cars);
    }

    if (type === 'all' || type === 'auctions') {
      const auctions = await this.searchAuctions(cleanQuery, filters, { page, limit });
      results.push(...auctions);
    }

    if (type === 'all' || type === 'showrooms') {
      const showrooms = await this.searchShowrooms(cleanQuery, filters, { page, limit });
      results.push(...showrooms);
    }

    if (type === 'all' || type === 'transport') {
      const transport = await this.searchTransport(cleanQuery, filters, { page, limit });
      results.push(...transport);
    }

    if (type === 'all' || type === 'users') {
      const users = await this.searchUsers(cleanQuery, filters, { page, limit });
      results.push(...users);
    }

    results.sort((a, b) => {
      if (sort.field === 'relevance') {
        return sort.order === 'desc' ? b.relevance - a.relevance : a.relevance - b.relevance;
      }
      return 0;
    });

    const aggregations = this.calculateAggregations(results);
    const startIndex = (page - 1) * limit;
    const paginatedResults = results.slice(startIndex, startIndex + limit);

    return {
      results: paginatedResults,
      total: results.length,
      page,
      limit,
      totalPages: Math.ceil(results.length / limit),
      aggregations,
    };
  }

  private static async searchCars(
    query: string,
    filters: SearchOptions['filters'] = {},
    pagination: { page: number; limit: number; }
  ): Promise<SearchResult[]> {
    const where: Prisma.carsWhereInput = {
      status: 'AVAILABLE',
      isAuction: false,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { brand: { contains: query, mode: 'insensitive' } },
        { model: { contains: query, mode: 'insensitive' } },
      ],
    };

    if (filters?.brand) where.brand = { contains: filters.brand, mode: 'insensitive' };
    if (filters?.model) where.model = { contains: filters.model, mode: 'insensitive' };
    if (filters?.city) where.location = { contains: filters.city, mode: 'insensitive' };
    if (filters?.condition) where.condition = filters.condition as any;

    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
      if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
    }

    if (filters?.yearFrom !== undefined || filters?.yearTo !== undefined) {
      where.year = {};
      if (filters.yearFrom !== undefined) where.year.gte = filters.yearFrom;
      if (filters.yearTo !== undefined) where.year.lte = filters.yearTo;
    }

    const cars = await prisma.cars.findMany({
      where,
      take: pagination.limit,
      select: {
        id: true,
        title: true,
        description: true,
        brand: true,
        model: true,
        year: true,
        price: true,
        location: true,
        area: true,
        condition: true,
        images: true,
        car_images: {
          where: { isPrimary: true },
          take: 1,
          select: { fileUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return cars.map((car) => {
      const relevance = this.calculateRelevance(query, [car.title, car.description || '', car.brand, car.model]);
      const image = this.getCarImage(car.car_images, car.images);

      return {
        type: 'car' as const,
        id: car.id,
        title: car.title || `${car.brand} ${car.model} ${car.year}`,
        description: car.description || undefined,
        image,
        price: car.price,
        location: car.location + (car.area ? ` - ${car.area}` : ''),
        url: `/marketplace/${car.id}`,
        relevance,
        highlights: this.extractHighlights(query, car.title + ' ' + (car.description || '')),
        metadata: { brand: car.brand, model: car.model, year: car.year, condition: car.condition },
      };
    });
  }

  private static async searchAuctions(
    query: string,
    filters: SearchOptions['filters'] = {},
    pagination: { page: number; limit: number; }
  ): Promise<SearchResult[]> {
    const where: Prisma.auctionsWhereInput = {
      status: { in: ['UPCOMING', 'ACTIVE'] },
      yardId: null, // ✅ مزادات أونلاين فقط - استبعاد مزادات الساحات
      cars: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { brand: { contains: query, mode: 'insensitive' } },
          { model: { contains: query, mode: 'insensitive' } },
        ],
      },
    };

    if (filters?.brand) {
      where.cars = { ...where.cars, brand: { contains: filters.brand, mode: 'insensitive' } };
    }
    if (filters?.city) {
      where.cars = { ...where.cars, location: { contains: filters.city, mode: 'insensitive' } };
    }

    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      where.currentPrice = {};
      if (filters.minPrice !== undefined) where.currentPrice.gte = filters.minPrice;
      if (filters.maxPrice !== undefined) where.currentPrice.lte = filters.maxPrice;
    }

    const auctions = await prisma.auctions.findMany({
      where,
      take: pagination.limit,
      include: {
        cars: {
          select: {
            id: true,
            title: true,
            brand: true,
            model: true,
            year: true,
            location: true,
            area: true,
            images: true,
            car_images: {
              where: { isPrimary: true },
              take: 1,
              select: { fileUrl: true },
            },
          },
        },
      },
      orderBy: { startDate: 'asc' },
    });

    return auctions
      .filter((auction) => auction.cars)
      .map((auction) => {
        const car = auction.cars!;
        const relevance = this.calculateRelevance(query, [auction.title || car.title, auction.description || '', car.brand, car.model]);
        const image = this.getCarImage(car.car_images, car.images);

        return {
          type: 'auction' as const,
          id: auction.id,
          title: auction.title || `${car.brand} ${car.model} ${car.year}`,
          description: auction.description || undefined,
          image,
          price: auction.currentPrice,
          location: car.location + (car.area ? ` - ${car.area}` : ''),
          url: `/auction/${auction.id}`,
          relevance,
          highlights: this.extractHighlights(query, (auction.title || car.title) + ' ' + (auction.description || '')),
          metadata: { status: auction.status, startDate: auction.startDate, endDate: auction.endDate, totalBids: auction.totalBids },
        };
      });
  }

  private static async searchShowrooms(
    query: string,
    filters: SearchOptions['filters'] = {},
    pagination: { page: number; limit: number; }
  ): Promise<SearchResult[]> {
    const where: Prisma.showroomsWhereInput = {
      status: 'ACTIVE',
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { address: { contains: query, mode: 'insensitive' } },
      ],
    };

    if (filters?.city) where.city = { contains: filters.city, mode: 'insensitive' };

    const showrooms = await prisma.showrooms.findMany({
      where,
      take: pagination.limit,
      select: {
        id: true,
        name: true,
        description: true,
        city: true,
        address: true,
        images: true,
        verified: true,
        rating: true,
      },
      orderBy: { rating: 'desc' },
    });

    return showrooms.map((showroom) => {
      const relevance = this.calculateRelevance(query, [showroom.name, showroom.description || '', showroom.address || '']);
      let image = '/images/showroom-placeholder.svg';
      if (showroom.images) {
        try {
          const parsed = JSON.parse(showroom.images);
          if (Array.isArray(parsed) && parsed.length > 0) image = parsed[0];
        } catch {
          const firstImg = showroom.images.split(',')[0]?.trim();
          if (firstImg) image = firstImg;
        }
      }

      return {
        type: 'showroom' as const,
        id: showroom.id,
        title: showroom.name,
        description: showroom.description || undefined,
        image,
        location: showroom.city || undefined,
        url: `/showroom/${showroom.id}`,
        relevance,
        highlights: this.extractHighlights(query, showroom.name + ' ' + (showroom.description || '')),
        metadata: { verified: showroom.verified, rating: showroom.rating },
      };
    });
  }

  private static async searchTransport(
    query: string,
    filters: SearchOptions['filters'] = {},
    pagination: { page: number; limit: number; }
  ): Promise<SearchResult[]> {
    const where: Prisma.transport_servicesWhereInput = {
      status: 'ACTIVE',
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    };

    const services = await prisma.transport_services.findMany({
      where,
      take: pagination.limit,
      select: {
        id: true,
        title: true,
        description: true,
        truckType: true,
        pricePerKm: true,
        serviceArea: true,
        images: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return services.map((service) => {
      const relevance = this.calculateRelevance(query, [service.title, service.description || '']);
      let image = '/images/transport-placeholder.svg';
      if (service.images) {
        try {
          const parsed = JSON.parse(service.images);
          if (Array.isArray(parsed) && parsed.length > 0) image = parsed[0];
        } catch {
          const firstImg = service.images.split(',')[0]?.trim();
          if (firstImg) image = firstImg;
        }
      }

      return {
        type: 'transport' as const,
        id: service.id,
        title: service.title,
        description: service.description || undefined,
        image,
        price: service.pricePerKm || undefined,
        location: service.serviceArea || undefined,
        url: `/transport/service/${service.id}`,
        relevance,
        highlights: this.extractHighlights(query, service.title + ' ' + (service.description || '')),
        metadata: { truckType: service.truckType, serviceArea: service.serviceArea, pricePerKm: service.pricePerKm },
      };
    });
  }

  private static async searchUsers(
    query: string,
    filters: SearchOptions['filters'] = {},
    pagination: { page: number; limit: number; }
  ): Promise<SearchResult[]> {
    const where: Prisma.usersWhereInput = {
      status: 'ACTIVE',
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query, mode: 'insensitive' } },
      ],
    };

    const users = await prisma.users.findMany({
      where,
      take: Math.min(pagination.limit, 10),
      select: {
        id: true,
        name: true,
        profileImage: true,
        verified: true,
        accountType: true,
        rating: true,
      },
      orderBy: { rating: 'desc' },
    });

    return users.map((user) => {
      const relevance = this.calculateRelevance(query, [user.name]);

      return {
        type: 'user' as const,
        id: user.id,
        title: user.name,
        image: user.profileImage || '/images/avatars/default-avatar.svg',
        url: `/profile/${user.id}`,
        relevance,
        highlights: [],
        metadata: { verified: user.verified, accountType: user.accountType, rating: user.rating },
      };
    });
  }

  private static calculateRelevance(query: string, fields: string[]): number {
    const queryLower = query.toLowerCase();
    let score = 0;

    fields.forEach((field, index) => {
      if (!field) return;
      const fieldLower = field.toLowerCase();

      if (fieldLower === queryLower) {
        score += 100 - index * 10;
      } else if (fieldLower.startsWith(queryLower)) {
        score += 70 - index * 10;
      } else if (fieldLower.includes(queryLower)) {
        score += 40 - index * 5;
      } else {
        const words = queryLower.split(' ').filter((w) => w.length > 1);
        const matchingWords = words.filter((word) => fieldLower.includes(word)).length;
        if (words.length > 0) {
          score += (matchingWords / words.length) * 20;
        }
      }
    });

    return Math.min(100, Math.round(score));
  }

  private static extractHighlights(query: string, text: string): string[] {
    if (!text) return [];

    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();
    const index = textLower.indexOf(queryLower);

    if (index === -1) return [];

    const start = Math.max(0, index - 50);
    const end = Math.min(text.length, index + queryLower.length + 50);
    let snippet = text.slice(start, end);

    if (start > 0) snippet = '...' + snippet;
    if (end < text.length) snippet = snippet + '...';

    return [snippet];
  }

  private static calculateAggregations(results: SearchResult[]) {
    const byType: Record<string, number> = {};
    const byCity: Record<string, number> = {};
    const byBrand: Record<string, number> = {};

    results.forEach((result) => {
      byType[result.type] = (byType[result.type] || 0) + 1;

      if (result.location) {
        const city = result.location.split(' - ')[0];
        byCity[city] = (byCity[city] || 0) + 1;
      }

      if (result.metadata?.brand) {
        byBrand[result.metadata.brand] = (byBrand[result.metadata.brand] || 0) + 1;
      }
    });

    return { byType, byCity, byBrand };
  }

  private static getCarImage(carImages: { fileUrl: string; }[], imagesString: string): string {
    if (carImages && carImages.length > 0) {
      return carImages[0].fileUrl;
    }

    if (typeof imagesString === 'string' && imagesString.trim()) {
      try {
        if (imagesString.startsWith('[')) {
          const parsed = JSON.parse(imagesString);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed[0];
          }
        }
        const firstImage = imagesString.split(',')[0]?.trim();
        if (firstImage) return firstImage;
      } catch {
        const firstImage = imagesString.split(',')[0]?.trim();
        if (firstImage) return firstImage;
      }
    }

    return '/images/cars/default-car.svg';
  }
}
