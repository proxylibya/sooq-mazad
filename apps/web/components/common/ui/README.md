# مكونات UI المشتركة

## PageHeader - مكون هيدر الصفحة الموحد

مكون هيدر موحد يحتوي على شعار قابل للنقر وزر رجوع محسّن.

### الاستخدام الأساسي

```tsx
import { PageHeader, SimplePageHeader, LogoPageHeader } from '@/components/common/ui';

// استخدام كامل مع جميع الخيارات
<PageHeader
  title="عنوان الصفحة"
  description="وصف الصفحة"
  showBackButton={true}
  backHref="/previous-page"
  backText="رجوع"
  showLogo={true}
  logoHref="/"
  logoText="مزاد السيارات"
  logoSrc="/favicon.svg"
  variant="white"
/>

// استخدام بسيط مع عنوان فقط
<SimplePageHeader
  title="صفحة الملف الشخصي"
  showBackButton={true}
/>

// استخدام الشعار فقط
<LogoPageHeader
  showBackButton={false}
  logoHref="/"
/>
```

### الخصائص (Props)

| الخاصية          | النوع                                | الافتراضي         | الوصف                 |
| ---------------- | ------------------------------------ | ----------------- | --------------------- |
| `title`          | `string`                             | -                 | عنوان الصفحة          |
| `description`    | `string`                             | -                 | وصف الصفحة            |
| `showBackButton` | `boolean`                            | `false`           | عرض زر الرجوع         |
| `backHref`       | `string`                             | -                 | رابط الرجوع المخصص    |
| `backText`       | `string`                             | `"رجوع"`          | نص زر الرجوع          |
| `showLogo`       | `boolean`                            | `true`            | عرض الشعار            |
| `logoHref`       | `string`                             | `"/"`             | رابط الشعار           |
| `logoText`       | `string`                             | `"مزاد السيارات"` | نص الشعار             |
| `logoSrc`        | `string`                             | `"/favicon.svg"`  | مسار صورة الشعار      |
| `rightContent`   | `ReactNode`                          | -                 | محتوى إضافي في اليسار |
| `variant`        | `"white" \| "gray" \| "transparent"` | `"white"`         | لون الخلفية           |

---

## BackButton - مكون زر الرجوع المحسّن

زر رجوع موحد مع أيقونة واضحة وتصميم عصري.

### الاستخدام الأساسي

```tsx
import { BackButton, WalletBackButton, HomeBackButton, SimpleBackButton } from '@/components/common/ui';

// استخدام كامل
<BackButton
  href="/previous-page"
  text="العودة للصفحة السابقة"
  variant="default"
  size="md"
  iconOnly={false}
/>

// زر رجوع بسيط
<SimpleBackButton />

// زر العودة للمحفظة (مخصص)
<WalletBackButton />

// زر العودة للرئيسية (مخصص)
<HomeBackButton />
```

### الخصائص (Props)

| الخاصية    | النوع                                                  | الافتراضي   | الوصف                        |
| ---------- | ------------------------------------------------------ | ----------- | ---------------------------- |
| `href`     | `string`                                               | -           | الرابط للعودة إليه           |
| `text`     | `string`                                               | `"رجوع"`    | النص المعروض                 |
| `variant`  | `"default" \| "purple" \| "green" \| "blue" \| "gray"` | `"default"` | نمط الزر                     |
| `size`     | `"sm" \| "md" \| "lg"`                                 | `"md"`      | حجم الزر                     |
| `onClick`  | `() => void`                                           | -           | دالة مخصصة للنقر             |
| `iconOnly` | `boolean`                                              | `false`     | إخفاء النص وعرض الأيقونة فقط |
| `disabled` | `boolean`                                              | `false`     | تعطيل الزر                   |

---

## أمثلة التطبيق

### مثال 1: صفحة بسيطة مع هيدر وزر رجوع

```tsx
import { PageHeader } from '@/components/common/ui';

export default function MyPage() {
  return (
    <div>
      <PageHeader showBackButton={true} showLogo={true} logoHref="/" />
      <main>{/* محتوى الصفحة */}</main>
    </div>
  );
}
```

### مثال 2: صفحة مع عنوان وزر رجوع مخصص

```tsx
import { SimplePageHeader } from '@/components/common/ui';

export default function ProfilePage() {
  return (
    <div>
      <SimplePageHeader title="الملف الشخصي" showBackButton={true} backHref="/dashboard" />
      <main>{/* محتوى الصفحة */}</main>
    </div>
  );
}
```

### مثال 3: استخدام زر الرجوع بشكل مستقل

```tsx
import { BackButton } from '@/components/common/ui';

export default function MyComponent() {
  return (
    <div>
      <BackButton href="/listings" text="العودة للإعلانات" variant="blue" size="md" />
      {/* باقي المحتوى */}
    </div>
  );
}
```

---

## الميزات

✅ **تصميم موحد**: نفس التصميم في كل المشروع  
✅ **قابل للتخصيص**: خيارات متعددة للألوان والأحجام  
✅ **سهل الاستخدام**: واجهة برمجية بسيطة  
✅ **دعم RTL**: تصميم مناسب للعربية  
✅ **أيقونات واضحة**: من Heroicons  
✅ **تأثيرات انتقالية**: حركات سلسة  
✅ **إمكانية الوصول**: دعم ARIA labels

---

## ملاحظات مهمة

1. المكونات تستخدم Next.js Router للتنقل
2. الأيقونات من مكتبة Heroicons
3. التصميم يستخدم Tailwind CSS
4. الشعار يستخدم Next.js Image للأداء الأفضل
5. جميع المكونات تدعم RTL بشكل كامل
