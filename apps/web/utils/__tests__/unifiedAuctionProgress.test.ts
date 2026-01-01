/**
 * اختبارات شاملة للنظام الموحد الجديد لحساب التقدم في المزادات
 * للتأكد من صحة الحسابات في جميع الحالات
 */

import { calculateUnifiedProgress, UnifiedProgressParams } from '../unifiedAuctionProgress';

describe('نظام حساب التقدم الموحد', () => {
  const now = new Date('2024-01-15T12:00:00Z').getTime();
  
  // محاكاة الوقت الحالي
  beforeAll(() => {
    jest.spyOn(Date, 'now').mockImplementation(() => now);
    jest.spyOn(global.Date.prototype, 'getTime').mockImplementation(() => now);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('المزادات المنتهية', () => {
    test('يجب أن يعطي 100% للمزادات المنتهية', () => {
      const params: UnifiedProgressParams = {
        auctionStatus: 'ended',
        endTime: new Date('2024-01-15T10:00:00Z'), // انتهى قبل ساعتين
        currentPrice: 5000,
        startingPrice: 1000,
        reservePrice: 4000,
      };

      const result = calculateUnifiedProgress(params);

      expect(result.displayProgress).toBe(100);
      expect(result.progressType).toBe('completed');
      expect(result.timeProgress).toBe(100);
      expect(result.priceProgress).toBe(100);
    });
  });

  describe('المزادات القادمة', () => {
    test('يجب حساب التقدم بناءً على الوقت المتبقي - آخر ساعة', () => {
      const params: UnifiedProgressParams = {
        auctionStatus: 'upcoming',
        startTime: new Date('2024-01-15T12:30:00Z'), // يبدأ خلال 30 دقيقة
        endTime: new Date('2024-01-15T15:00:00Z'),
      };

      const result = calculateUnifiedProgress(params);

      expect(result.progressType).toBe('time-based');
      expect(result.displayProgress).toBeGreaterThan(70); // آخر ساعة
      expect(result.displayProgress).toBeLessThan(95);
      expect(result.timeLeft.minutes).toBe(30);
    });

    test('يجب حساب التقدم بناءً على الوقت المتبقي - آخر 6 ساعات', () => {
      const params: UnifiedProgressParams = {
        auctionStatus: 'upcoming',
        startTime: new Date('2024-01-15T15:00:00Z'), // يبدأ خلال 3 ساعات
        endTime: new Date('2024-01-15T18:00:00Z'),
      };

      const result = calculateUnifiedProgress(params);

      expect(result.progressType).toBe('time-based');
      expect(result.displayProgress).toBeGreaterThan(40);
      expect(result.displayProgress).toBeLessThan(70);
      expect(result.timeLeft.hours).toBe(3);
    });
  });

  describe('المزادات المباشرة مع سعر مطلوب', () => {
    test('يجب حساب التقدم بناءً على السعر - وصل للسعر المطلوب', () => {
      const params: UnifiedProgressParams = {
        auctionStatus: 'live',
        startTime: new Date('2024-01-15T10:00:00Z'),
        endTime: new Date('2024-01-15T16:00:00Z'),
        currentPrice: 5000,
        startingPrice: 1000,
        reservePrice: 4500, // تم تجاوز السعر المطلوب
      };

      const result = calculateUnifiedProgress(params);

      expect(result.progressType).toBe('price-based');
      expect(result.priceProgress).toBe(100);
      expect(result.displayProgress).toBe(95); // نترك 5% للوقت
    });

    test('يجب حساب التقدم بناءً على السعر - في المسار الصحيح', () => {
      const params: UnifiedProgressParams = {
        auctionStatus: 'live',
        startTime: new Date('2024-01-15T10:00:00Z'),
        endTime: new Date('2024-01-15T16:00:00Z'),
        currentPrice: 3000,
        startingPrice: 1000,
        reservePrice: 5000, // 50% من الطريق للسعر المطلوب
      };

      const result = calculateUnifiedProgress(params);

      expect(result.progressType).toBe('price-based');
      expect(result.priceProgress).toBe(50); // (3000-1000)/(5000-1000) = 50%
      expect(result.displayProgress).toBeGreaterThan(50);
      expect(result.displayProgress).toBeLessThan(70);
    });

    test('يجب حساب التقدم بناءً على السعر - لم تبدأ المزايدة', () => {
      const params: UnifiedProgressParams = {
        auctionStatus: 'live',
        startTime: new Date('2024-01-15T10:00:00Z'),
        endTime: new Date('2024-01-15T16:00:00Z'),
        currentPrice: 1000, // نفس سعر البداية
        startingPrice: 1000,
        reservePrice: 5000,
      };

      const result = calculateUnifiedProgress(params);

      expect(result.progressType).toBe('price-based');
      expect(result.priceProgress).toBe(0);
      expect(result.displayProgress).toBe(30); // القيمة الأساسية
    });
  });

  describe('المزادات المباشرة بدون سعر مطلوب', () => {
    test('يجب حساب التقدم بناءً على الوقت المنقضي', () => {
      const params: UnifiedProgressParams = {
        auctionStatus: 'live',
        startTime: new Date('2024-01-15T10:00:00Z'), // بدأ قبل ساعتين
        endTime: new Date('2024-01-15T16:00:00Z'), // ينتهي خلال 4 ساعات
        currentPrice: 3000,
        startingPrice: 1000,
        // لا يوجد reservePrice
      };

      const result = calculateUnifiedProgress(params);

      expect(result.progressType).toBe('time-based');
      // 2 ساعات من أصل 6 = 33.33%
      expect(result.timeProgress).toBeCloseTo(33.33, 0);
      expect(result.displayProgress).toBeGreaterThan(30);
    });
  });

  describe('حالات الطوارئ والأوقات العاجلة', () => {
    test('يجب تحديد الأوقات العاجلة - آخر 5 دقائق', () => {
      const params: UnifiedProgressParams = {
        auctionStatus: 'live',
        startTime: new Date('2024-01-15T10:00:00Z'),
        endTime: new Date('2024-01-15T12:03:00Z'), // 3 دقائق متبقية
        currentPrice: 3000,
        startingPrice: 1000,
      };

      const result = calculateUnifiedProgress(params);

      expect(result.isUrgent).toBe(true);
      expect(result.timeLeft.totalSeconds).toBe(180); // 3 دقائق = 180 ثانية
    });

    test('يجب عدم تحديد الأوقات العاجلة - أكثر من 5 دقائق', () => {
      const params: UnifiedProgressParams = {
        auctionStatus: 'live',
        startTime: new Date('2024-01-15T10:00:00Z'),
        endTime: new Date('2024-01-15T12:10:00Z'), // 10 دقائق متبقية
        currentPrice: 3000,
        startingPrice: 1000,
      };

      const result = calculateUnifiedProgress(params);

      expect(result.isUrgent).toBe(false);
      expect(result.timeLeft.totalSeconds).toBe(600); // 10 دقائق = 600 ثانية
    });
  });

  describe('حساب الوقت المتبقي', () => {
    test('يجب حساب الوقت المتبقي بشكل صحيح', () => {
      const params: UnifiedProgressParams = {
        auctionStatus: 'live',
        endTime: new Date('2024-01-15T15:35:45Z'), // 3 ساعات و 35 دقيقة و 45 ثانية
      };

      const result = calculateUnifiedProgress(params);

      expect(result.timeLeft.hours).toBe(3);
      expect(result.timeLeft.minutes).toBe(35);
      expect(result.timeLeft.seconds).toBe(45);
      expect(result.timeLeft.totalSeconds).toBe(3 * 3600 + 35 * 60 + 45);
    });
  });

  describe('حدود النسب المئوية', () => {
    test('يجب أن تكون النسب في المدى الصحيح', () => {
      const params: UnifiedProgressParams = {
        auctionStatus: 'live',
        endTime: new Date('2024-01-15T16:00:00Z'),
        currentPrice: 1000000, // سعر عالي جداً
        startingPrice: 1000,
        reservePrice: 5000,
      };

      const result = calculateUnifiedProgress(params);

      expect(result.timeProgress).toBeGreaterThanOrEqual(0);
      expect(result.timeProgress).toBeLessThanOrEqual(100);
      expect(result.priceProgress).toBeGreaterThanOrEqual(0);
      expect(result.priceProgress).toBeLessThanOrEqual(100);
      expect(result.displayProgress).toBeGreaterThanOrEqual(15);
      expect(result.displayProgress).toBeLessThanOrEqual(95);
    });
  });
});

describe('دالة التوافق مع النظام القديم', () => {
  test('يجب أن ترجع نفس النتائج بتنسيق النظام القديم', () => {
    const params: UnifiedProgressParams = {
      auctionStatus: 'live',
      endTime: new Date('2024-01-15T16:00:00Z'),
      currentPrice: 3000,
      startingPrice: 1000,
      reservePrice: 5000,
    };

    const { getCompatibleProgress } = require('../unifiedAuctionProgress');
    const compatResult = getCompatibleProgress(params);
    const newResult = calculateUnifiedProgress(params);

    expect(compatResult.progress).toBe(newResult.displayProgress);
    expect(compatResult.timeLeft).toEqual(newResult.timeLeft);
    expect(compatResult.isActive).toBe(true);
  });
});
