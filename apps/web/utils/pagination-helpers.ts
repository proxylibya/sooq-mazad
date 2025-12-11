// تعريف الواجهات محلياً لتجنب مشاكل الاستيراد
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * معالج Pagination عام
 */
export class PaginationHelper {
  /**
   * حساب offset و limit من page و pageSize
   */
  static calculateOffset(page: number, pageSize: number): { skip: number; take: number; } {
    const skip = (page - 1) * pageSize;
    const take = pageSize;
    return { skip, take };
  }

  /**
   * بناء استجابة pagination
   */
  static buildResponse<T>(
    data: T[],
    total: number,
    page: number,
    pageSize: number,
  ): PaginatedResponse<T> {
    const totalPages = Math.ceil(total / pageSize);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      data,
      total,
      page,
      pageSize,
      totalPages,
      hasNextPage,
      hasPrevPage,
    };
  }

  /**
   * التحقق من صحة معاملات Pagination
   */
  static validateParams(params: PaginationParams): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (params.page < 1) {
      errors.push('رقم الصفحة يجب أن يكون 1 أو أكثر');
    }

    if (params.pageSize < 1) {
      errors.push('حجم الصفحة يجب أن يكون 1 أو أكثر');
    }

    if (params.pageSize > 100) {
      errors.push('حجم الصفحة لا يمكن أن يتجاوز 100');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * بناء query للترتيب في Prisma
   */
  static buildOrderBy(sortBy?: string, sortOrder?: 'asc' | 'desc'): any {
    if (!sortBy) return undefined;

    return {
      [sortBy]: sortOrder || 'desc',
    };
  }

  /**
   * بناء where clause من filters
   */
  static buildWhereClause(filters: Record<string, any>): any {
    const where: any = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return;
      }

      // معالجة أنواع مختلفة من الفلاتر
      if (typeof value === 'string') {
        // بحث نصي
        where[key] = {
          contains: value,
          mode: 'insensitive',
        };
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        // مطابقة دقيقة
        where[key] = value;
      } else if (Array.isArray(value)) {
        // in operator
        where[key] = {
          in: value,
        };
      } else if (typeof value === 'object') {
        // عمليات معقدة (gte, lte, etc)
        where[key] = value;
      }
    });

    return where;
  }

  /**
   * دمج pagination مع cache key
   */
  static generateCacheKey(prefix: string, params: PaginationParams): string {
    const { page, pageSize, sortBy, sortOrder, filters } = params;
    const filterString = JSON.stringify(filters || {});
    return `${prefix}:${page}:${pageSize}:${sortBy}:${sortOrder}:${filterString}`;
  }
}

/**
 * دالة مساعدة للـ Prisma pagination
 */
export async function paginateQuery<T>(
  model: any,
  params: PaginationParams,
  additionalWhere?: any,
): Promise<PaginatedResponse<T>> {
  // التحقق من صحة المعاملات
  const validation = PaginationHelper.validateParams(params);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '));
  }

  // حساب skip و take
  const { skip, take } = PaginationHelper.calculateOffset(params.page, params.pageSize);

  // بناء orderBy
  const orderBy = PaginationHelper.buildOrderBy(params.sortBy, params.sortOrder);

  // بناء where clause
  const filterWhere = PaginationHelper.buildWhereClause(params.filters || {});
  const where = additionalWhere ? { AND: [filterWhere, additionalWhere] } : filterWhere;

  // تنفيذ الاستعلام
  const [data, total] = await Promise.all([
    model.findMany({
      skip,
      take,
      where,
      orderBy,
    }),
    model.count({ where }),
  ]);

  return PaginationHelper.buildResponse<T>(data, total, params.page, params.pageSize);
}

/**
 * دالة مساعدة للـ streaming data
 */
export async function* streamData<T>(
  model: any,
  batchSize: number = 100,
  where?: any,
  orderBy?: any,
): AsyncGenerator<T[], void, unknown> {
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const skip = (page - 1) * batchSize;

    const batch = await model.findMany({
      skip,
      take: batchSize,
      where,
      orderBy,
    });

    if (batch.length > 0) {
      yield batch;
    }

    hasMore = batch.length === batchSize;
    page++;
  }
}

/**
 * معالج لـ cursor-based pagination
 */
export class CursorPaginationHelper {
  /**
   * بناء استجابة cursor pagination
   */
  static buildResponse<T extends { id: string | number; }>(
    data: T[],
    pageSize: number,
    hasMore: boolean,
  ): {
    data: T[];
    nextCursor: string | number | null;
    hasMore: boolean;
  } {
    return {
      data,
      nextCursor: data.length > 0 ? data[data.length - 1].id : null,
      hasMore,
    };
  }

  /**
   * استعلام cursor-based
   */
  static async query<T extends { id: string | number; }>(
    model: any,
    cursor: string | number | null,
    pageSize: number,
    where?: any,
    orderBy?: any,
  ) {
    const take = pageSize + 1; // أخذ عنصر إضافي للتحقق من hasMore

    const items = await model.findMany({
      take,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1, // تخطي cursor نفسه
      }),
      where,
      orderBy: orderBy || { id: 'desc' },
    });

    const hasMore = items.length > pageSize;
    const data = hasMore ? items.slice(0, -1) : items;

    return this.buildResponse<T>(data, pageSize, hasMore);
  }
}
