# مكونات بطاقة مقدم الخدمة - دليل الاستخدام

## نظرة عامة

تم تطوير مجموعة شاملة من مكونات بطاقة مقدم الخدمة لتوفير تجربة موحدة ومحسنة لعرض
معلومات مقدمي الخدمات في جميع أنحاء التطبيق.

## المكونات المتاحة

### 1. ServiceProviderCard - المكون الرئيسي

المكون الأساسي الذي يوفر جميع الميزات والتخصيصات.

```tsx
import ServiceProviderCard from '../components/ServiceProviderCard';

<ServiceProviderCard
  provider={{
    id: '1',
    name: 'أحمد محمد الطرابلسي',
    phone: '+218912345678',
    verified: true,
    profileImage: '/images/profiles/profile.jpg',
    accountType: 'TRANSPORT_PROVIDER',
    rating: 4.8,
    reviewsCount: 127,
    memberSince: '2023-04-15',
    serviceType: 'مقدم خدمة نقل',
    location: 'طرابلس، ليبيا',
    isOnline: true,
  }}
  onContactClick={() => console.log('اتصال')}
  onMessageClick={() => console.log('رسالة')}
  onViewProfile={() => console.log('عرض الملف')}
  showActions={true}
  compact={false}
/>;
```

#### الخصائص (Props)

- `provider`: بيانات مقدم الخدمة
- `onContactClick`: دالة معالجة النقر على زر الاتصال
- `onMessageClick`: دالة معالجة النقر على زر المراسلة
- `onViewProfile`: دالة معالجة النقر على البطاقة لعرض الملف الشخصي
- `showActions`: إظهار أزرار التواصل (افتراضي: true)
- `compact`: عرض البطاقة في وضع مدمج (افتراضي: false)

### 2. SimpleServiceProviderCard - البطاقة البسيطة

نسخة مبسطة من البطاقة مع خصائص أساسية.

```tsx
import SimpleServiceProviderCard from '../components/SimpleServiceProviderCard';

<SimpleServiceProviderCard
  name="بيلبيل لبيلبيل"
  profileImage="/images/profiles/profile.jpg"
  verified={true}
  serviceType="مقدم خدمة نقل"
  rating={4.8}
  reviewsCount={127}
  location="طرابلس، ليبيا"
  memberSince="2023-04-15"
  phone="+218912345678"
  onContactClick={() => console.log('اتصال')}
  onMessageClick={() => console.log('رسالة')}
/>;
```

### 3. EnhancedServiceProviderHTML - النسخة المحسنة من HTML

مكون يحاكي HTML الأصلي مع تحسينات إضافية.

```tsx
import EnhancedServiceProviderHTML from '../components/EnhancedServiceProviderHTML';

<EnhancedServiceProviderHTML
  provider={{
    name: 'بيلبيل لبيلبيل',
    profileImage: '/images/profiles/profile.jpg',
    verified: true,
    serviceType: 'مقدم خدمة نقل',
    rating: 4.8,
    reviewsCount: 127,
    location: 'طرابلس، ليبيا',
    memberSince: '2023-04-15',
    phone: '+218912345678',
  }}
/>;
```

## الميزات الجديدة

### 1. نظام التقييم بالنجوم

- عرض التقييم بالنجوم الملونة
- عرض عدد التقييمات
- استخدام الأرقام الإنجليزية فقط

### 2. معلومات العضوية

- عرض تاريخ التسجيل بصيغة "مسجل منذ X"
- تحويل التواريخ إلى فترات زمنية مفهومة

### 3. حالة الاتصال

- نقطة خضراء تشير إلى حالة الاتصال (أونلاين/أوفلاين)
- دعم عرض حالة المستخدم

### 4. شارة التوثيق

- أيقونة التوثيق للمستخدمين الموثقين
- ألوان مميزة للمستخدمين الموثقين

### 5. أزرار التواصل المحسنة

- زر المراسلة باللون الأزرق
- زر الاتصال باللون الأخضر
- عرض رقم الهاتف عند النقر على زر الاتصال

### 6. دعم الصور الافتراضية

- استخدام مكون UserAvatar
- دعم الصور الافتراضية عند عدم وجود صورة
- معالجة أخطاء تحميل الصور

## أنواع الحسابات المدعومة

- `REGULAR_USER`: مستخدم عادي
- `TRANSPORT_PROVIDER`: مقدم خدمة نقل
- `DEALER`: تاجر معتمد
- `SHOWROOM`: معرض سيارات

## التصميم والألوان

### الألوان المستخدمة

- **الأزرق**: للأزرار الأساسية والروابط
- **الأخضر**: لأزرار الاتصال وحالة الاتصال
- **الأصفر**: لنجوم التقييم
- **الرمادي**: للنصوص الثانوية

### التأثيرات البصرية

- تأثيرات hover على البطاقات
- انتقالات سلسة للألوان
- ظلال ناعمة للبطاقات

## الاستخدام في المشروع

### في صفحات النقل

```tsx
// في صفحة خدمات النقل
<ServiceProviderCard provider={transportProvider} showActions={true} compact={false} />
```

### في القوائم المدمجة

```tsx
// في قائمة جانبية أو نافذة منبثقة
<ServiceProviderCard provider={provider} showActions={true} compact={true} />
```

### في صفحات التفاصيل

```tsx
// في صفحة تفاصيل الخدمة
<SimpleServiceProviderCard
  name={provider.name}
  profileImage={provider.profileImage}
  verified={provider.verified}
  // ... باقي الخصائص
/>
```

## اختبار المكونات

يمكن اختبار جميع المكونات من خلال زيارة:

```
/test-service-provider-card
```

هذه الصفحة تحتوي على:

- أمثلة مختلفة للبطاقات
- بيانات تجريبية متنوعة
- عرض للميزات المختلفة
- ملاحظات التطوير

## ملاحظات التطوير

1. **الأرقام الإنجليزية**: جميع الأرقام يتم تحويلها إلى إنجليزية فقط
2. **الأيقونات الاحترافية**: استخدام Heroicons بدلاً من الإيموجي
3. **التوافق مع النظام**: استخدام مكونات النظام الموجودة مثل UserAvatar
4. **الاستجابة**: جميع المكونات متجاوبة مع الشاشات المختلفة
5. **إمكانية الوصول**: دعم قارئات الشاشة والتنقل بلوحة المفاتيح
