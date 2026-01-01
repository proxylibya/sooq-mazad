# نظام Cache - دليل الاستخدام

## نظرة عامة

نظام Cache متقدم يدعم:

- **KeyDB** كخيار أساسي (باستخدام ioredis)
- **LocalKeyDB** كـ fallback تلقائي عند عدم توفر KeyDB
- **TypeScript** مع types كاملة
- **Smart Fallback** - تبديل تلقائي بين KeyDB و LocalCache

## المميزات

✅ **اتصال ذكي**: يتصل بـ KeyDB تلقائياً إذا كان متاح  
✅ **Fallback آمن**: يستخدم LocalCache عند فشل KeyDB  
✅ **TypeScript**: دعم كامل للـ types  
✅ **سهل الاستخدام**: API بسيط وواضح  
✅ **Performance**: تخزين مؤقت فعال

## التثبيت

المكتبات المطلوبة (موجودة بالفعل):

```json
{
  "dependencies": {
    "ioredis": "^5.7.0"
  }
}
```

## الإعداد

### 1. متغيرات البيئة

أضف في ملف `.env`:

```env
# KeyDB Connection (اختياري)
KEYDB_URL=redis://localhost:6379
# أو
REDIS_URL=redis://localhost:6379
```

**ملاحظة**: إذا لم تكن متغيرات البيئة موجودة، سيستخدم النظام LocalCache تلقائياً.

### 2. استيراد المكتبة

```typescript
import { getOrSetCache, invalidateCache, cacheExists } from '@/lib/cache';
```

## الاستخدام

### 1. getOrSetCache - جلب أو تعيين

الاستخدام الأساسي:

```typescript
const data = await getOrSetCache(
  'cache-key', // المفتاح
  60, // TTL بالثواني
  async () => {
    // fetcher function
    // منطق جلب البيانات
    return await fetchDataFromDB();
  },
);
```

#### أمثلة عملية:

**مثال 1: تخزين بيانات المستخدم**

```typescript
async function getUserById(userId: number) {
  return await getOrSetCache(
    `user:${userId}`,
    300, // 5 دقائق
    async () => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      return user;
    },
  );
}
```

**مثال 2: تخزين نتائج البحث**

```typescript
async function searchCars(query: string, page: number) {
  const cacheKey = `search:${query}:page:${page}`;

  return await getOrSetCache(
    cacheKey,
    120, // دقيقتين
    async () => {
      const results = await prisma.car.findMany({
        where: {
          OR: [{ make: { contains: query } }, { model: { contains: query } }],
        },
        skip: (page - 1) * 20,
        take: 20,
      });
      return results;
    },
  );
}
```

**مثال 3: تخزين الإحصائيات**

```typescript
async function getGlobalStats() {
  return await getOrSetCache(
    'stats:global',
    600, // 10 دقائق
    async () => {
      const [totalUsers, totalCars, activeBids] = await Promise.all([
        prisma.user.count(),
        prisma.car.count(),
        prisma.bid.count({ where: { status: 'ACTIVE' } }),
      ]);

      return {
        totalUsers,
        totalCars,
        activeBids,
        timestamp: new Date(),
      };
    },
  );
}
```

### 2. invalidateCache - حذف من الكاش

حذف مفاتيح محددة باستخدام pattern:

```typescript
// حذف جميع بيانات المستخدم
await invalidateCache('user:*');

// حذف نتائج بحث محددة
await invalidateCache('search:تويوتا:*');

// حذف جميع الإحصائيات
await invalidateCache('stats:*');
```

**مثال عملي: تحديث بيانات المستخدم**

```typescript
async function updateUser(userId: number, data: UpdateData) {
  // تحديث قاعدة البيانات
  const user = await prisma.user.update({
    where: { id: userId },
    data,
  });

  // حذف من الكاش
  await invalidateCache(`user:${userId}`);

  return user;
}
```

### 3. cacheExists - التحقق من الوجود

```typescript
const exists = await cacheExists('user:123');
if (exists) {
  console.log('البيانات موجودة في الكاش');
} else {
  console.log('البيانات غير موجودة في الكاش');
}
```

### 4. clearAllCache - مسح الكاش بالكامل

```typescript
await clearAllCache();
console.log('تم مسح جميع الكاش');
```

**استخدام في API Endpoint:**

```typescript
// pages/api/admin/cache/clear.ts
import { clearAllCache } from '@/lib/cache';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // التحقق من صلاحيات المشرف
  // ...

  const result = await clearAllCache();

  return res.json({
    success: result,
    message: 'تم مسح الكاش بنجاح',
  });
}
```

### 5. getCacheStatus - حالة النظام

```typescript
import { getCacheStatus } from '@/lib/cache';

const status = getCacheStatus();
console.log(status);
// Output:
// {
//   primary: "متصل" | "غير متصل",
//   fallback: "نشط",
//   active: "KeyDB" | "LocalCache"
// }
```

## استراتيجيات TTL الموصى بها

| نوع البيانات     | TTL المقترح | الوصف                  |
| ---------------- | ----------- | ---------------------- |
| بيانات ثابتة     | 3600s (1h)  | بيانات نادراً ما تتغير |
| بيانات متوسطة    | 300s (5m)   | بيانات تتغير بشكل دوري |
| بيانات ديناميكية | 60s (1m)    | بيانات تتغير باستمرار  |
| نتائج بحث        | 120s (2m)   | نتائج بحث المستخدمين   |
| إحصائيات         | 600s (10m)  | إحصائيات عامة          |
| جلسات            | 1800s (30m) | بيانات الجلسات         |

## نماذج استخدام متقدمة

### 1. Cache Warming (تسخين الكاش)

```typescript
async function warmupCache() {
  console.log('بدء تسخين الكاش...');

  // تحميل البيانات الأكثر استخداماً
  await getOrSetCache('popular-cars', 3600, async () => {
    return await prisma.car.findMany({
      where: { featured: true },
      take: 20,
    });
  });

  console.log('تم تسخين الكاش بنجاح');
}

// استدعاء عند بدء التطبيق
warmupCache();
```

### 2. Cache Aside Pattern

```typescript
async function getCarWithCache(carId: number) {
  // 1. محاولة جلب من الكاش
  const cacheKey = `car:${carId}`;
  const cached = await cacheExists(cacheKey);

  if (cached) {
    return await getOrSetCache(cacheKey, 300, async () => null);
  }

  // 2. جلب من قاعدة البيانات
  const car = await prisma.car.findUnique({
    where: { id: carId },
    include: { owner: true, bids: true },
  });

  // 3. حفظ في الكاش
  if (car) {
    await getOrSetCache(cacheKey, 300, async () => car);
  }

  return car;
}
```

### 3. Cache Invalidation عند التحديثات

```typescript
async function createBid(data: CreateBidData) {
  // إنشاء المزايدة
  const bid = await prisma.bid.create({
    data,
  });

  // حذف الكاش المرتبط
  await invalidateCache(`car:${data.carId}`);
  await invalidateCache(`bids:car:${data.carId}`);
  await invalidateCache('stats:*');

  return bid;
}
```

### 4. Multi-key Caching

```typescript
async function getCarsWithDetails(carIds: number[]) {
  const results = await Promise.all(
    carIds.map(async (id) => {
      return await getOrSetCache(`car:${id}:details`, 300, async () => {
        return await prisma.car.findUnique({
          where: { id },
          include: { owner: true, bids: true },
        });
      });
    }),
  );

  return results.filter(Boolean);
}
```

## استخدام في Next.js API Routes

```typescript
// pages/api/cars/[id].ts
import { getOrSetCache, invalidateCache } from '@/lib/cache';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    const car = await getOrSetCache(`car:${id}`, 300, async () => {
      return await prisma.car.findUnique({
        where: { id: Number(id) },
      });
    });

    return res.json(car);
  }

  if (req.method === 'PUT') {
    const updatedCar = await prisma.car.update({
      where: { id: Number(id) },
      data: req.body,
    });

    // حذف من الكاش
    await invalidateCache(`car:${id}`);

    return res.json(updatedCar);
  }
}
```

## Best Practices

### 1. تسمية المفاتيح

استخدم نمط واضح ومنظم:

```typescript
// ✅ جيد
'user:123';
'car:456:details';
'search:query:page:1';
'stats:global:daily';

// ❌ سيء
'u123';
'cardata456';
'searchresult';
```

### 2. معالجة الأخطاء

```typescript
async function safeGetCache<T>(
  key: string,
  ttl: number,
  fetcher: () => Promise<T>,
): Promise<T | null> {
  try {
    return await getOrSetCache(key, ttl, fetcher);
  } catch (error) {
    console.error('خطأ في الكاش:', error);
    // Fallback: جلب البيانات مباشرة
    return await fetcher();
  }
}
```

### 3. Monitoring

```typescript
import { getCacheStatus } from '@/lib/cache';

// في health check endpoint
export async function GET() {
  const cacheStatus = getCacheStatus();

  return Response.json({
    cache: cacheStatus,
    healthy: cacheStatus.active === 'KeyDB',
  });
}
```

## الفرق بين KeyDB و LocalCache

| الميزة      | KeyDB            | LocalCache        |
| ----------- | ---------------- | ----------------- |
| الأداء      | ⚡ عالي جداً     | ⚡ عالي           |
| التخزين     | 💾 Persistent    | 💾 In-Memory      |
| المشاركة    | 🔄 Multi-Process | ❌ Single Process |
| الحد الأقصى | 📊 حسب السيرفر   | 📊 100MB افتراضي  |
| التكلفة     | 💰 يحتاج سيرفر   | 💰 مجاني          |

## استكشاف الأخطاء

### 1. KeyDB غير متصل

```typescript
const status = getCacheStatus();
if (status.active !== 'KeyDB') {
  console.warn('⚠️ KeyDB غير متصل، يتم استخدام LocalCache');
}
```

### 2. البيانات لا تُحدث

تأكد من حذف الكاش بعد التحديثات:

```typescript
await invalidateCache(`resource:${id}`);
```

### 3. استهلاك ذاكرة عالي

قلل TTL أو استخدم KeyDB:

```typescript
// بدلاً من
await getOrSetCache(key, 3600, fetcher); // ساعة

// استخدم
await getOrSetCache(key, 300, fetcher); // 5 دقائق
```

## الخلاصة

نظام Cache احترافي يوفر:

- ✅ سهولة في الاستخدام
- ✅ أداء عالي
- ✅ Fallback آمن
- ✅ TypeScript support
- ✅ Production-ready

للمزيد من المعلومات، راجع:

- `lib/cache.ts` - التطبيق الرئيسي
- `lib/cache/localKeyDB.ts` - Local cache implementation
- `__tests__/cache/cache.test.ts` - الاختبارات
