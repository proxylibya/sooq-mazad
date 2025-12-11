# مكونات Footer المتقدمة - سوق مزاد

## نظرة عامة

تم إنشاء مجموعة كاملة من مكونات Footer متدرجة الصعوبة لتلبية جميع احتياجات المشروع، من البسيط إلى المتقدم والكامل.

## المكونات المتوفرة

### 1. AdvancedFooter - المكون الرئيسي الجديد ⭐

**الأحدث والأكثر تطوراً** - مكون footer كامل ومتقدم مع جميع الميزات:

```tsx
import { AdvancedFooter } from '@/components/common';

<AdvancedFooter />;
```

**المميزات:**

- معلومات الشركة الكاملة
- معلومات التواصل (هاتف، إيميل، عنوان)
- روابط سريعة مع أيقونات Heroicons
- قسم الدعم والمساعدة
- أزرار تحميل التطبيق (App Store & Google Play)
- وسائل التواصل الاجتماعي (فيسبوك، واتساب، تليجرام، إنستجرام)
- تصميم responsive كامل
- ألوان متدرجة وحديثة
- أيقونات احترافية من Heroicons فقط
- معلومات النسخة والتحديث

### 2. AppFooter - مكون بسيط محسن

```tsx
import { AppFooter } from '@/components/common';

<AppFooter className="custom-class" />;
```

### 3. FooterTemplate - مكون قابل للتخصيص

```tsx
import { FooterTemplate } from '@/components/common';

// استخدام افتراضي
<FooterTemplate />

// استخدام مخصص
<FooterTemplate
  showCountryInfo={true}
  showCopyright={true}
  customCountryText="ليبيا"
  customStatusText="قريباً على الإنترنت"
  className="custom-footer"
/>

// إخفاء معلومات الدولة
<FooterTemplate showCountryInfo={false} />

// إخفاء حقوق النشر
<FooterTemplate showCopyright={false} />
```

## التحسينات المطبقة

1. **إزالة النص المتكرر**: إزالة تكرار كلمة "ليبيا"
2. **تحسين النصوص**: تغيير "سيتم تحديثه" إلى "قريباً على الإنترنت"
3. **تحسين حقوق النشر**: تبسيط النص ليصبح "سوق مزاد" بدلاً من "موقع مزاد السيارات"
4. **إضافة أيقونة الموقع**: استخدام MapPinIcon من Heroicons
5. **تحسين الألوان**: استخدام ألوان متسقة مع التصميم
6. **قابلية التخصيص**: إمكانية تخصيص جميع النصوص والخيارات

## الاستخدام الموصى به

للمواقع الجديدة أو عند رفع الموقع على الاستضافة، استخدم:

```tsx
<AppFooter />
```

أو للتحكم الكامل:

```tsx
<FooterTemplate customStatusText="متاح الآن على الإنترنت" customCountryText="ليبيا - طرابلس" />
```
