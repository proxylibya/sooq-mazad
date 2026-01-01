# فصل المزادات عن السوق الفوري

## المشكلة الأصلية

كان هناك تداخل بين:

- **المزادات** (`/admin/auctions` و `/auctions`)
- **السوق الفوري** (`/admin/marketplace` و `/marketplace`)

حيث كانت المنشورات تظهر في كلا القسمين.

## الحل المطبق

### 1. تحديث API السوق الفوري الإداري

**الملف:** `apps/admin/pages/api/admin/marketplace.ts`

```typescript
// Build where clause - فقط السيارات غير المزادية
const where: any = {
  isAuction: false, // ⚠️ مهم: استبعاد سيارات المزاد
};
```

### 2. هيكل البيانات

#### جدول `cars`:

| الحقل       | النوع   | الوصف                             |
| ----------- | ------- | --------------------------------- |
| `isAuction` | Boolean | `true` = مزاد، `false` = سوق فوري |

#### جدول `auctions`:

| الحقل   | النوع  | الوصف                 |
| ------- | ------ | --------------------- |
| `carId` | String | معرف السيارة المرتبطة |

### 3. قواعد الفصل

#### عند إنشاء إعلان عادي (سوق فوري):

```typescript
// في /api/cars/create.ts
isAuction: false;
```

#### عند إنشاء مزاد:

```typescript
// في /api/admin/auctions/create.ts
// 1. إنشاء سيارة مع isAuction: true
isAuction: true;

// 2. إنشاء مزاد مرتبط بالسيارة
cars: {
  connect: {
    id: car.id;
  }
}
```

## APIs والفلاتر

### لوحة التحكم (Admin):

| API                      | الفلتر             | الوصف                   |
| ------------------------ | ------------------ | ----------------------- |
| `/api/admin/marketplace` | `isAuction: false` | سيارات السوق الفوري فقط |
| `/api/admin/auctions`    | من جدول `auctions` | المزادات فقط            |

### الموقع العام (Web):

| API                | الفلتر             | الوصف               |
| ------------------ | ------------------ | ------------------- |
| `/api/marketplace` | `isAuction: false` | سيارات السوق الفوري |
| `/api/auctions`    | من جدول `auctions` | المزادات            |

## سكريبت الإصلاح

```bash
node scripts/fix-auction-marketplace-separation.js
```

يقوم بـ:

1. فحص السيارات التي لها مزادات وتحديث `isAuction = true`
2. فحص السيارات بدون مزادات وتحديث `isAuction = false`
3. كشف المزادات اليتيمة (بدون سيارة)

## التحقق من الفصل

### الإحصائيات الحالية:

- سيارات المزاد: 2
- سيارات السوق الفوري: 0
- مزادات: 2

### للتحقق يدوياً:

```sql
-- عدد سيارات المزاد
SELECT COUNT(*) FROM cars WHERE "isAuction" = true;

-- عدد سيارات السوق الفوري
SELECT COUNT(*) FROM cars WHERE "isAuction" = false;

-- التحقق من الارتباط
SELECT c.id, c.title, c."isAuction", a.id as auction_id
FROM cars c
LEFT JOIN auctions a ON a."carId" = c.id;
```

## الملفات المُحدثة

1. `apps/admin/pages/api/admin/marketplace.ts` - إضافة فلتر `isAuction: false`
2. `scripts/fix-auction-marketplace-separation.js` - سكريبت التنظيف

## التاريخ

- **التاريخ:** 2025-11-29
- **المؤلف:** Cascade AI
