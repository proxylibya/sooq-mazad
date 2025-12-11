# مكونات معلومات البائع - دليل الاستخدام

## نظرة عامة

تم تطوير مجموعة شاملة من مكونات معلومات البائع لتوفير تجربة موحدة ومحسنة لعرض
بيانات البائعين في جميع أنحاء التطبيق.

## المكونات المتاحة

### 1. SellerInfoCard - المكون الرئيسي

المكون الأساسي الذي يوفر جميع الميزات والتخصيصات.

```tsx
import SellerInfoCard from '../components/SellerInfoCard';

<SellerInfoCard
  seller={sellerData}
  variant="default" // compact | default | detailed
  showActions={true}
  showStats={true}
  onContact={() => console.log('اتصال')}
  onMessage={() => console.log('رسالة')}
  onViewProfile={() => console.log('عرض الملف')}
/>;
```

#### الخصائص (Props)

- `seller`: بيانات البائع (مطلوب)
- `variant`: نوع العرض - `compact` | `default` | `detailed`
- `showActions`: إظهار أزرار الإجراءات (افتراضي: true)
- `showStats`: إظهار الإحصائيات (افتراضي: true)
- `onContact`: معالج الاتصال المخصص
- `onMessage`: معالج الرسائل المخصص
- `onViewProfile`: معالج عرض الملف المخصص
- `className`: فئات CSS إضافية

### 2. SellerInfoSimple - المكون المبسط (محدث - قابل للنقر)

مكون مبسط للاستخدام السريع مع البيانات الأساسية مع ميزات تفاعلية محسنة.

```tsx
import SellerInfoSimple from '../components/SellerInfoSimple';

<SellerInfoSimple
  seller={{
    id: 'seller-123',
    name: 'أحمد محمد',
    phone: '+218912345678',
    verified: true,
    rating: 4.5,
    reviewsCount: 127,
    city: 'طرابلس',
    activeListings: 23,
  }}
  showActions={true}
  clickable={true}
  onContact={() => console.log('اتصال')}
  onMessage={() => console.log('رسالة')}
  onViewProfile={() => console.log('عرض الملف')}
  onPhoneClick={() => console.log('نقر على الهاتف')}
/>;
```

#### الميزات الجديدة:

- **البطاقة قابلة للنقر**: النقر على البطاقة يفتح الملف الشخصي
- **رقم الهاتف قابل للنقر**: النقر على الرقم يفتح تطبيق الهاتف
- **تأثيرات بصرية محسنة**: hover effects وألوان محسنة
- **معالجات أحداث مخصصة**: تحكم كامل في سلوك النقر

### 3. SellerInfoWrapper - المكون مع جلب البيانات

مكون يجلب البيانات تلقائياً من API باستخدام معرف البائع.

```tsx
import SellerInfoWrapper from '../components/SellerInfoWrapper';

<SellerInfoWrapper sellerId="seller-123" variant="detailed" showActions={true} showStats={true} />;
```

## أنواع العرض (Variants)

### Compact

- عرض مضغوط مناسب للقوائم والبطاقات الصغيرة
- يعرض الاسم والتقييم والأزرار الأساسية
- مثالي للاستخدام في قوائم السيارات

### Default

- العرض الافتراضي مع معلومات شاملة
- يتضمن معلومات التواصل والإحصائيات الأساسية
- مناسب لصفحات تفاصيل السيارة

### Detailed

- عرض مفصل مع جميع المعلومات والإحصائيات
- يتضمن تاريخ الانضمام ومعدل الاستجابة
- مثالي لصفحات البائع المخصصة

## Hook المساعد

### useSellerData

Hook لجلب بيانات البائع من API.

```tsx
import useSellerData from '../hooks/useSellerData';

const { seller, loading, error, refetch } = useSellerData('seller-123');
```

### useSellerActions

Hook للتعامل مع إجراءات البائع (اتصال، رسائل، إلخ).

```tsx
import useSellerActions from '../hooks/useSellerActions';

const { isLoading, handleContact, handleMessage, handleViewProfile, handleWhatsApp, handleReport } =
  useSellerActions({
    sellerId: 'seller-123',
    sellerName: 'أحمد محمد',
    sellerPhone: '+218912345678',
  });
```

## تنسيق البيانات

### SellerData Interface

```typescript
interface SellerData {
  id: string;
  name: string;
  phone: string;
  email?: string;
  profileImage?: string;
  verified: boolean;
  accountType?: string;
  rating?: number;
  reviewsCount?: number;
  city?: string;
  memberSince?: string;
  createdAt?: string;
  stats?: SellerStats;
  description?: string;
  isOnline?: boolean;
}

interface SellerStats {
  totalListings?: number;
  activeListings?: number;
  totalViews?: number;
  successfulDeals?: number;
  responseRate?: string;
  avgResponseTime?: string;
}
```

## الميزات

### تم بنجاح تصميم موحد

- يتبع نظام التصميم الموحد للمشروع
- استخدام الألوان والخطوط المعتمدة
- تصميم متجاوب لجميع الشاشات

### تم بنجاح أيقونات احترافية

- استخدام Heroicons بدلاً من الإيموجي
- أيقونات متسقة ومقروءة
- دعم الوضع المظلم

### تم بنجاح وظائف تفاعلية

- اتصال هاتفي مباشر
- إرسال رسائل WhatsApp
- توجيه لصفحة البائع
- نظام إشعارات مدمج

### تم بنجاح ربط قاعدة البيانات

- جلب البيانات من Prisma
- تحديث تلقائي للمعلومات
- معالجة الأخطاء والحالات الاستثنائية

### تم بنجاح إمكانية الوصول

- دعم قارئات الشاشة
- تنقل بلوحة المفاتيح
- تباين ألوان مناسب

## أمثلة الاستخدام

### في صفحة تفاصيل السيارة

```tsx
<SellerInfoSimple
  seller={{
    id: car.sellerId,
    name: car.seller.name,
    phone: car.seller.phone,
    verified: car.seller.verified,
    rating: car.seller.rating,
    reviewsCount: car.seller.reviewsCount,
    city: car.city,
    activeListings: car.seller.activeListings,
  }}
  onContact={() => window.open(`tel:${car.seller.phone}`, '_self')}
  onMessage={() => setShowContactModal(true)}
/>
```

### في صفحة البائع

```tsx
<SellerInfoWrapper sellerId={sellerId} variant="detailed" showActions={true} showStats={true} />
```

### في قائمة البائعين

```tsx
{
  sellers.map((seller) => (
    <SellerInfoCard
      key={seller.id}
      seller={seller}
      variant="compact"
      showActions={false}
      showStats={false}
    />
  ));
}
```

## التخصيص

### CSS Classes

```css
.seller-info-card {
  /* تأثيرات الحوم */
}

.seller-action-button {
  /* تأثيرات الأزرار */
}

.clip-path-half {
  /* للنجوم النصفية */
}
```

### متغيرات CSS

يستخدم المكون متغيرات CSS المعرفة في `globals.css` للألوان والمسافات.

## الاختبار

تم اختبار المكونات مع:

- تم بنجاح بيانات صحيحة
- تم بنجاح بيانات مفقودة
- تم بنجاح حالات الخطأ
- تم بنجاح حالات التحميل
- تم بنجاح أجهزة مختلفة
- تم بنجاح متصفحات مختلفة

## الأداء

- تحميل كسول للصور
- تحسين إعادة الرسم
- ذاكرة تخزين مؤقت للبيانات
- تقليل استدعاءات API

## الدعم

للمساعدة أو الإبلاغ عن مشاكل، يرجى فتح issue في المستودع.
