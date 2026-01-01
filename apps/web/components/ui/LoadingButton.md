# LoadingButton Component

## نظرة عامة

مكون `LoadingButton` هو حل موحد لمشكلة السبينر الملتصق بالنص في الأزرار عند حالة التحميل. يوفر تجربة مستخدم محسنة مع تباعد مناسب وتصميم متجاوب.

## الميزات الرئيسية

- ✅ **تباعد محسن**: السبينر والنص منفصلان بـ `gap-2`
- ✅ **سبينر موحد**: تصميم ثابت لجميع الأزرار
- ✅ **منع النقرات المتعددة**: تلقائياً عند التحميل
- ✅ **دعم جميع المتغيرات**: يستخدم نفس أنواع Button الموجودة
- ✅ **تخصيص نص التحميل**: يمكن تخصيص الرسالة لكل زر
- ✅ **متوافق مع RTL**: يعمل بشكل صحيح مع النصوص العربية

## الاستخدام الأساسي

```tsx
import { LoadingButton } from "../components/ui";

// زر بسيط
<LoadingButton
  isLoading={isSubmitting}
  loadingText="جاري الحفظ..."
>
  حفظ البيانات
</LoadingButton>

// زر مع أيقونة
<LoadingButton
  isLoading={isLoading}
  loadingText="جاري التسجيل..."
  className="bg-emerald-600 hover:bg-emerald-700"
>
  <CheckCircleIcon className="h-4 w-4 ml-2" />
  إنشاء الحساب
</LoadingButton>
```

## الخصائص (Props)

| الخاصية            | النوع                    | الافتراضي           | الوصف                   |
| ------------------ | ------------------------ | ------------------- | ----------------------- |
| `isLoading`        | `boolean`                | `false`             | حالة التحميل            |
| `loadingText`      | `string`                 | `"جاري التحميل..."` | نص يظهر أثناء التحميل   |
| `children`         | `ReactNode`              | -                   | محتوى الزر العادي       |
| `spinnerClassName` | `string`                 | -                   | فئات CSS إضافية للسبينر |
| `disabled`         | `boolean`                | -                   | تعطيل الزر              |
| `variant`          | `ButtonProps['variant']` | `"default"`         | نوع الزر                |
| `size`             | `ButtonProps['size']`    | `"default"`         | حجم الزر                |

## أمثلة متقدمة

### زر إرسال نموذج

```tsx
<LoadingButton
  type="submit"
  isLoading={isSubmitting}
  loadingText="جاري الإرسال..."
  disabled={!isValid}
  className="w-full bg-blue-600 hover:bg-blue-700"
>
  <PaperAirplaneIcon className="ml-2 h-5 w-5" />
  إرسال الطلب
</LoadingButton>
```

### زر مع متغير مخصص

```tsx
<LoadingButton isLoading={isDeleting} loadingText="جاري الحذف..." variant="destructive" size="sm">
  حذف العنصر
</LoadingButton>
```

## المقارنة - قبل وبعد

### قبل الإصلاح ❌

```tsx
<button disabled={submitting}>
  {submitting ? (
    <>
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
      جاري الحفظ...
    </>
  ) : (
    'حفظ البيانات'
  )}
</button>
```

**المشاكل:**

- السبينر ملتصق بالنص
- كود مكرر في كل زر
- لا يوجد تباعد مناسب

### بعد الإصلاح ✅

```tsx
<LoadingButton isLoading={submitting} loadingText="جاري الحفظ...">
  حفظ البيانات
</LoadingButton>
```

**الحلول:**

- تباعد تلقائي بين السبينر والنص
- كود موحد وقابل للإعادة الاستخدام
- تصميم متسق

## الملفات المحدثة

تم تطبيق `LoadingButton` في الملفات التالية:

- ✅ `pages/company/create.tsx`
- ✅ `pages/login-password.tsx`
- ✅ `pages/contact.tsx`
- ✅ `components/auction/BiddingPanel.tsx`

## التوصيات للمطورين

1. **استخدم LoadingButton دائماً** بدلاً من تطبيق منطق السبينر يدوياً
2. **خصص نص التحميل** ليكون وصفياً للعملية الجارية
3. **استخدم الأيقونات** مع النص لتحسين تجربة المستخدم
4. **اختبر مع RTL** للتأكد من الاتجاه الصحيح

## ملاحظات فنية

- يستخدم `gap-2` للتباعد المناسب (8px)
- السبينر بحجم `h-4 w-4` موحد
- يحافظ على جميع خصائص Button الأساسية
- متوافق مع نظام التصميم الحالي
