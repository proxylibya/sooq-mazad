# مكونات النماذج الموحدة

## مكون Checkbox

مكون موحد لـ checkbox يحل مشاكل المحاذاة بين الأيقونات والنصوص في المشروع.

### المشكلة التي يحلها

في الكود السابق، كانت الأيقونات والنصوص في labels تظهر فوق بعضها البعض بسبب:

- استخدام `block` class على label
- عدم وجود محاذاة صحيحة بين الأيقونة والنص
- تكرار نفس الكود في عدة أماكن

### الحل

المكون الموحد يستخدم:

- `inline-flex items-center` على label للمحاذاة الأفقية
- wrapper لـ icon مع `flex items-center` للمحاذاة العمودية
- props موحدة لسهولة الاستخدام

### الاستخدام

```tsx
import { Checkbox } from '@/components/common/ui/form';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

// استخدام بسيط
<Checkbox
  id="verified"
  checked={isVerified}
  onChange={setIsVerified}
  label="حساب محقق"
/>

// مع أيقونة
<Checkbox
  id="verified"
  checked={isVerified}
  onChange={setIsVerified}
  label="حساب محقق"
  icon={<ShieldCheckIcon className="h-4 w-4" />}
/>

// مع تعطيل
<Checkbox
  id="terms"
  checked={acceptedTerms}
  onChange={setAcceptedTerms}
  label="أوافق على الشروط والأحكام"
  disabled={loading}
/>
```

### Props

| Prop             | Type                         | Required | Default | Description              |
| ---------------- | ---------------------------- | -------- | ------- | ------------------------ |
| `id`             | `string`                     | ✅       | -       | معرف فريد للـ checkbox   |
| `checked`        | `boolean`                    | ✅       | -       | حالة الـ checkbox        |
| `onChange`       | `(checked: boolean) => void` | ✅       | -       | دالة تُستدعى عند التغيير |
| `label`          | `string`                     | ✅       | -       | نص الـ label             |
| `name`           | `string`                     | ❌       | `id`    | اسم الحقل في النموذج     |
| `icon`           | `React.ReactNode`            | ❌       | -       | أيقونة اختيارية          |
| `disabled`       | `boolean`                    | ❌       | `false` | تعطيل الـ checkbox       |
| `className`      | `string`                     | ❌       | `''`    | classes إضافية للحاوية   |
| `labelClassName` | `string`                     | ❌       | `''`    | classes إضافية للـ label |

### التكامل مع react-hook-form

```tsx
import { useForm } from 'react-hook-form';
import { Checkbox } from '@/components/common/ui/form';

function MyForm() {
  const { register, watch } = useForm();
  const isVerified = watch('verified');

  return (
    <Checkbox
      id="verified"
      checked={isVerified}
      onChange={(checked) => {
        const event = { target: { name: 'verified', checked } };
        register('verified').onChange(event);
      }}
      label="حساب محقق"
    />
  );
}
```

### الملفات التي تم تحديثها

✅ تم تطبيق المكون في:

- `pages/admin/admins/add.tsx`
- `pages/admin/admins/[id]/edit.tsx`
- `components/admin/user/UserForm.tsx`

### الأماكن التي تحتاج تحديث (اختياري)

يمكن تطبيق نفس المكون في:

- `pages/admin/users/add.tsx`
- `pages/transport/dashboard.tsx`
- `components/admin/EnhancedTable.tsx`
- `components/admin/UnifiedAdminTable.tsx`
- `components/features/transport/forms/TransportRequestForm.tsx`
- وأماكن أخرى تحتوي على checkboxes مع أيقونات

### ملاحظات

- المكون يدعم RTL تلقائياً
- الألوان متوافقة مع تصميم المشروع (indigo/blue)
- يمكن تخصيص الـ styles عبر `className` و `labelClassName`
