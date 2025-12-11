import { prisma } from '@/lib/prisma';

/**
 * خدمة اقتراحات البحث الذكية
 * توفر اقتراحات حقيقية من قاعدة البيانات
 */

export interface SearchSuggestion {
  id: string;
  type: 'brand' | 'model' | 'location' | 'recent' | 'popular' | 'showroom';
  text: string;
  subtitle?: string;
  count?: number;
  icon?: string;
}

export class SearchSuggestionsService {
  /**
   * الحصول على اقتراحات بحث ذكية
   */
  static async getSuggestions(query: string, limit: number = 8): Promise<SearchSuggestion[]> {
    const queryLower = query.toLowerCase().trim();

    // إذا كان النص فارغ أو قصير جداً، نعيد الاقتراحات الشائعة
    if (!queryLower || queryLower.length < 2) {
      return await this.getPopularSuggestions(limit);
    }

    const suggestions: SearchSuggestion[] = [];

    try {
      // البحث المتوازي في جميع المصادر
      const [brands, models, locations, showrooms] = await Promise.all([
        this.getBrandSuggestions(queryLower, 3),
        this.getModelSuggestions(queryLower, 3),
        this.getLocationSuggestions(queryLower, 2),
        this.getShowroomSuggestions(queryLower, 2),
      ]);

      suggestions.push(...brands, ...models, ...locations, ...showrooms);

      // ترتيب حسب الأهمية والعدد
      suggestions.sort((a, b) => {
        // أولوية للمطابقة المباشرة
        const aExact = a.text.toLowerCase() === queryLower;
        const bExact = b.text.toLowerCase() === queryLower;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        // ثم حسب العدد
        return (b.count || 0) - (a.count || 0);
      });

      return suggestions.slice(0, limit);
    } catch (error) {
      console.error('خطأ في جلب الاقتراحات:', error);
      return await this.getPopularSuggestions(limit);
    }
  }

  /**
   * اقتراحات الماركات
   */
  private static async getBrandSuggestions(
    query: string,
    limit: number
  ): Promise<SearchSuggestion[]> {
    try {
      const brands = await prisma.cars.groupBy({
        by: ['brand'],
        where: {
          brand: { contains: query, mode: 'insensitive' },
          status: 'AVAILABLE',
        },
        _count: true,
        orderBy: { _count: { brand: 'desc' } },
        take: limit,
      });

      return brands.map((brand, index) => ({
        id: `brand-${index}`,
        type: 'brand' as const,
        text: brand.brand,
        subtitle: 'ماركة سيارة',
        count: brand._count,
        icon: '🚗',
      }));
    } catch (error) {
      console.error('خطأ في جلب اقتراحات الماركات:', error);
      return [];
    }
  }

  /**
   * اقتراحات الموديلات
   */
  private static async getModelSuggestions(
    query: string,
    limit: number
  ): Promise<SearchSuggestion[]> {
    try {
      const models = await prisma.cars.groupBy({
        by: ['model', 'brand'],
        where: {
          model: { contains: query, mode: 'insensitive' },
          status: 'AVAILABLE',
        },
        _count: true,
        orderBy: { _count: { model: 'desc' } },
        take: limit,
      });

      return models.map((model, index) => ({
        id: `model-${index}`,
        type: 'model' as const,
        text: model.model,
        subtitle: `${model.brand} - موديل`,
        count: model._count,
        icon: '🔧',
      }));
    } catch (error) {
      console.error('خطأ في جلب اقتراحات الموديلات:', error);
      return [];
    }
  }

  /**
   * اقتراحات المواقع
   */
  private static async getLocationSuggestions(
    query: string,
    limit: number
  ): Promise<SearchSuggestion[]> {
    try {
      const locations = await prisma.cars.groupBy({
        by: ['location'],
        where: {
          location: { contains: query, mode: 'insensitive' },
          status: 'AVAILABLE',
        },
        _count: true,
        orderBy: { _count: { location: 'desc' } },
        take: limit,
      });

      return locations.map((location, index) => ({
        id: `location-${index}`,
        type: 'location' as const,
        text: location.location,
        subtitle: 'مدينة',
        count: location._count,
        icon: '📍',
      }));
    } catch (error) {
      console.error('خطأ في جلب اقتراحات المواقع:', error);
      return [];
    }
  }

  /**
   * اقتراحات المعارض
   */
  private static async getShowroomSuggestions(
    query: string,
    limit: number
  ): Promise<SearchSuggestion[]> {
    try {
      const showrooms = await prisma.showrooms.findMany({
        where: {
          name: { contains: query, mode: 'insensitive' },
          status: 'APPROVED',
        },
        select: {
          id: true,
          name: true,
          city: true,
          _count: {
            select: { cars: true },
          },
        },
        orderBy: { rating: 'desc' },
        take: limit,
      });

      return showrooms.map((showroom) => ({
        id: `showroom-${showroom.id}`,
        type: 'showroom' as const,
        text: showroom.name,
        subtitle: `معرض - ${showroom.city || 'ليبيا'}`,
        count: showroom._count.cars,
        icon: '🏢',
      }));
    } catch (error) {
      console.error('خطأ في جلب اقتراحات المعارض:', error);
      return [];
    }
  }

  /**
   * الاقتراحات الشائعة (عند عدم وجود نص بحث)
   */
  private static async getPopularSuggestions(limit: number): Promise<SearchSuggestion[]> {
    try {
      // أشهر الماركات
      const topBrands = await prisma.cars.groupBy({
        by: ['brand'],
        where: { status: 'AVAILABLE' },
        _count: true,
        orderBy: { _count: { brand: 'desc' } },
        take: 5,
      });

      // أشهر المدن
      const topCities = await prisma.cars.groupBy({
        by: ['location'],
        where: { status: 'AVAILABLE' },
        _count: true,
        orderBy: { _count: { location: 'desc' } },
        take: 3,
      });

      const suggestions: SearchSuggestion[] = [];

      // إضافة الماركات الشائعة
      topBrands.forEach((brand, index) => {
        suggestions.push({
          id: `popular-brand-${index}`,
          type: 'popular',
          text: brand.brand,
          subtitle: 'ماركة شائعة',
          count: brand._count,
          icon: '⭐',
        });
      });

      // إضافة المدن الشائعة
      topCities.forEach((city, index) => {
        suggestions.push({
          id: `popular-city-${index}`,
          type: 'popular',
          text: city.location,
          subtitle: 'مدينة شائعة',
          count: city._count,
          icon: '📍',
        });
      });

      return suggestions.slice(0, limit);
    } catch (error) {
      console.error('خطأ في جلب الاقتراحات الشائعة:', error);
      return this.getFallbackSuggestions();
    }
  }

  /**
   * اقتراحات احتياطية في حالة فشل قاعدة البيانات
   */
  private static getFallbackSuggestions(): SearchSuggestion[] {
    return [
      { id: '1', type: 'popular', text: 'تويوتا', subtitle: 'ماركة شائعة', icon: '⭐' },
      { id: '2', type: 'popular', text: 'هوندا', subtitle: 'ماركة شائعة', icon: '⭐' },
      { id: '3', type: 'popular', text: 'نيسان', subtitle: 'ماركة شائعة', icon: '⭐' },
      { id: '4', type: 'popular', text: 'طرابلس', subtitle: 'مدينة شائعة', icon: '📍' },
      { id: '5', type: 'popular', text: 'بنغازي', subtitle: 'مدينة شائعة', icon: '📍' },
    ];
  }

  /**
   * حفظ استعلام بحث (لتحليلات مستقبلية)
   */
  static async saveSearchQuery(query: string, userId?: string, resultsCount?: number) {
    try {
      // يمكن إضافة جدول SearchHistory في المستقبل
      // await prisma.searchHistory.create({
      //   data: { query, userId, resultsCount, createdAt: new Date() }
      // });
      console.log(`بحث محفوظ: "${query}" - نتائج: ${resultsCount || 0}`);
    } catch (error) {
      console.error('خطأ في حفظ استعلام البحث:', error);
    }
  }
}
