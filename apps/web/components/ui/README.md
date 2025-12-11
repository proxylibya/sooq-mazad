# مكونات واجهة المستخدم

## SimpleSpinner

مكون علامة انتظار بسيط عبارة عن دائرة تدور فقط.

### الخصائص:

- `size`: حجم العنصر (`sm`, `md`, `lg`)
- `color`: لون العنصر (`blue`, `white`, `gray`)
- `className`: فئات CSS إضافية

### مثال الاستخدام:

```tsx
import SimpleSpinner from '../components/ui/SimpleSpinner';

// استخدام بسيط
<SimpleSpinner />

// استخدام مع خصائص مخصصة
<SimpleSpinner size="lg" color="blue" className="mx-auto" />
```

### الأحجام المتاحة:

- `sm`: 16x16 بكسل
- `md`: 24x24 بكسل (افتراضي)
- `lg`: 32x32 بكسل

### الألوان المتاحة:

- `blue`: أزرق (افتراضي)
- `white`: أبيض
- `gray`: رمادي

### الاستخدام في المشروع:

```tsx
// في الأزرار
<SimpleSpinner size="sm" color="white" />

// في شاشات التحميل
<SimpleSpinner size="lg" color="blue" className="mx-auto mb-4" />

// في الجداول
<SimpleSpinner size="sm" color="blue" />
```

## المميزات:

- ✅ **بسيط**: دائرة تدور فقط
- ✅ **خفيف**: لا تأثيرات معقدة
- ✅ **سريع**: أداء محسن
- ✅ **مرن**: أحجام وألوان متعددة
- ✅ **موحد**: نفس المظهر في جميع أنحاء المشروع
