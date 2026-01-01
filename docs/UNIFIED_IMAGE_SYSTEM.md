# 🌍 نظام الصور الموحد العالمي

## نظرة عامة

نظام متكامل لإدارة وتحسين الصور بمعايير الشركات الكبرى، يوفر:

- ✅ ضغط متقدم بجودة عالية (WebP/AVIF)
- ✅ توليد أحجام متعددة تلقائياً
- ✅ API موحد لجميع عمليات الرفع
- ✅ مكون عرض موحد مع Lazy Loading
- ✅ دعم CDN (Cloudflare, AWS S3)

## الملفات الرئيسية

```
apps/web/
├── lib/image-system/
│   ├── index.ts          # النظام الرئيسي
│   └── config.ts         # الإعدادات
├── pages/api/upload/
│   └── unified.ts        # API الموحد
└── components/ui/
    └── UnifiedImage.tsx  # مكون العرض
```

## الاستخدام

### 1. رفع الصور (API)

```typescript
// رفع صورة مع تحسين تلقائي
const formData = new FormData();
formData.append('file', file);

const response = await fetch('/api/upload/unified?category=cars&sizes=true', {
  method: 'POST',
  body: formData,
  credentials: 'include',
});

const result = await response.json();
// {
//   success: true,
//   url: '/uploads/cars/car_123_abc.webp',
//   urls: {
//     original: '/uploads/cars/car_123_abc_original.jpg',
//     optimized: '/uploads/cars/car_123_abc.webp',
//     thumb: '/uploads/cars/car_123_abc_thumb.webp',
//     small: '/uploads/cars/car_123_abc_small.webp',
//   },
//   metadata: {
//     width: 1024,
//     height: 768,
//     savings: 45 // نسبة التوفير
//   }
// }
```

### 2. عرض الصور (Component)

```tsx
import { UnifiedImage } from '@/components/ui/UnifiedImage';

// عرض بسيط
<UnifiedImage src="/uploads/cars/car1.webp" alt="سيارة" />

// عرض متقدم
<UnifiedImage
  src="/uploads/cars/car1.webp"
  alt="سيارة تويوتا"
  width={800}
  height={600}
  priority={true}
  placeholder="shimmer"
  showZoom={true}
  objectFit="cover"
/>
```

### 3. معالجة الصور في Backend

```typescript
import ImageSystem from '@/lib/image-system';

// تحسين صورة
const { buffer, metadata } = await ImageSystem.optimizeImage(inputBuffer, {
  format: 'webp',
  quality: 82,
  width: 1024,
});

// توليد أحجام متعددة
const sizes = await ImageSystem.generateMultipleSizes(buffer, outputDir, 'car_123', [
  'thumbnail',
  'small',
  'medium',
]);

// حذف صورة ومشتقاتها
await ImageSystem.deleteImage('/uploads/cars/car_123.webp');
```

## الإعدادات

### إعدادات الرفع

```typescript
UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  TIMEOUT: 30000,
};
```

### أحجام الصور

```typescript
SIZES = {
  thumbnail: { width: 150, height: 150 },
  small: { width: 320, height: 240 },
  medium: { width: 640, height: 480 },
  large: { width: 1024, height: 768 },
  xlarge: { width: 1920, height: 1440 },
};
```

### إعدادات CDN

```env
# Cloudflare Images
CLOUDFLARE_IMAGES_URL=https://imagedelivery.net/xxx
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token

# AWS S3
AWS_S3_BUCKET=your-bucket
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
```

## الفئات المدعومة

| الفئة     | المسار             | الوصف           |
| --------- | ------------------ | --------------- |
| cars      | /uploads/cars      | صور السيارات    |
| profiles  | /uploads/profiles  | صور المستخدمين  |
| transport | /uploads/transport | صور خدمات النقل |
| messages  | /uploads/messages  | مرفقات الرسائل  |
| showrooms | /uploads/showrooms | صور المعارض     |
| auctions  | /uploads/auctions  | صور المزادات    |

## الأداء

### قبل النظام الموحد

- 6+ ملفات متكررة للتحسين
- 4+ APIs للرفع
- 3+ مكونات للعرض
- عدم توحيد الإعدادات

### بعد النظام الموحد

- ملف واحد للتحسين
- API واحد موحد
- مكون واحد للعرض
- إعدادات مركزية
- توفير ~60% في حجم الصور

## الملفات المحذوفة (المكررة)

تم توحيد الملفات التالية في النظام الجديد:

- `utils/imageOptimizer.ts` → مدمج في `lib/image-system/`
- `lib/media/imageOptimization.ts` → مدمج
- `lib/performance/image-optimizer.ts` → مدمج
- `components/OptimizedImage.tsx` → `UnifiedImage.tsx`
- `components/common/OptimizedImage.tsx` → محذوف
- `pages/api/upload/image.ts` → `unified.ts`

## المزايا

1. **أداء أفضل**
   - ضغط WebP/AVIF (توفير 40-60%)
   - Lazy Loading متقدم
   - أحجام متجاوبة

2. **سهولة الاستخدام**
   - API واحد لكل شيء
   - مكون واحد موحد
   - إعدادات مركزية

3. **قابلية الصيانة**
   - كود أقل
   - توثيق شامل
   - TypeScript كامل

4. **أمان**
   - تحقق من نوع الملف
   - حد أقصى للحجم
   - مصادقة مطلوبة

## الخلاصة

النظام الموحد يوفر حلاً شاملاً لإدارة الصور بمعايير عالمية، مع تقليل التكرار وتحسين الأداء والصيانة.
