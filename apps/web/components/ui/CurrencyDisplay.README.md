# مكون عرض العملة الموحد - CurrencyDisplay

## التطبيق الموحد للشكل الخامس (نمط مع خلفية ملونة)

هذا المكون يطبق **الشكل الخامس: نمط مع خلفية ملونة** بشكل موحد عبر المشروع.

## كيفية الاستخدام:

### الاستخدام الأساسي:

```tsx
import CurrencyDisplay from '@/components/ui/CurrencyDisplay';

// استخدام بسيط
<CurrencyDisplay amount={21000} />

// مع الألوان والأحجام
<CurrencyDisplay amount={45000} size="lg" color="green" />
```

### الخيارات المتاحة:

#### **الأحجام (size):**

- `sm` - صغير (للبطاقات المضغوطة)
- `md` - متوسط (افتراضي)
- `lg` - كبير (للعناوين)
- `xl` - كبير جداً (للصفحات الرئيسية)

#### **الألوان (color):**

- `blue` - أزرق (افتراضي) - للمزادات النشطة
- `green` - أخضر - للمزادات المنتهية/المباعة
- `red` - أحمر - لأسعار السوق الفوري
- `gray` - رمادي - للأسعار الابتدائية
- `amber` - عنبري - للمزادات القادمة
- `orange` - برتقالي - للأسعار المطلوبة
- `white` - أبيض - للخلفيات الملونة

#### **الأشكال (variant):**

- `standard` - الشكل القياسي (افتراضي)
- `compact` - شكل مضغوط للمساحات الصغيرة

### أمثلة الاستخدام:

#### في البطاقات:

```tsx
{
  /* السعر الحالي */
}
<CurrencyDisplay amount={carData.currentBid} size="lg" color="blue" />;

{
  /* السعر النهائي */
}
<CurrencyDisplay amount={carData.finalBid} size="lg" color="green" />;

{
  /* سعر السوق الفوري */
}
<CurrencyDisplay amount={car.price} size="md" color="red" />;
```

#### في العداد:

```tsx
<CurrencyDisplay
  amount={animatedBid}
  size="lg"
  color={isEndedLike ? 'gray' : isUpcomingLike ? 'amber' : 'blue'}
  variant="compact"
/>
```

#### في المحفظة:

```tsx
<CurrencyDisplay amount={balance} size="xl" color="white" />
```

## التطبيق على الملفات الموجودة:

### 1. صفحة تفاصيل المزاد:

```tsx
// قبل:
<span className="text-3xl font-bold text-blue-700">{formatNumber(carData.currentBid)}</span>
<div className="bg-blue-100 px-3 py-1 rounded-lg text-sm font-medium text-blue-600">دينار ليبي</div>

// بعد:
<CurrencyDisplay amount={carData.currentBid} size="lg" color="blue" />
```

### 2. بطاقات الماركت بليس:

```tsx
// قبل:
<span className="text-xl font-bold text-red-600">{car.price.toLocaleString()}</span>
<div className="bg-red-100 px-2 py-0.5 rounded text-xs font-medium text-red-600">دينار</div>

// بعد:
<CurrencyDisplay amount={car.price} size="md" color="red" />
```

### 3. العداد:

```tsx
// قبل:
<span className="text-lg font-bold">{formatNumber(animatedBid)}</span>
<div className="bg-blue-100 px-2 py-0.5 rounded-lg">د.ل</div>

// بعد:
<CurrencyDisplay amount={animatedBid} size="md" color="blue" variant="compact" />
```

## المزايا:

✅ **توحيد الشكل**: نفس التصميم في كل المشروع
✅ **سهولة التطبيق**: استبدال بسيط
✅ **مرونة الألوان**: ألوان متناسقة حسب السياق
✅ **أحجام متنوعة**: تناسب جميع الاستخدامات
✅ **تنسيق تلقائي**: للأرقام مع الفاصلات
✅ **معالجة آمنة**: للقيم غير الصحيحة

## للتطبيق على المشروع:

يمكن تطبيق هذا المكون تدريجياً على جميع الملفات التي تعرض الأسعار دون كسر الكود الموجود.
