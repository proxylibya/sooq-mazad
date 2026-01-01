# CollapsibleSection Component

مكون قائمة قابلة للطي بنفس تصميم وتنسيق قائمة "إضافة المزيد من التفاصيل" من موقع
السيارة.

## الميزات

- تصميم احترافي مطابق للمثال المعطى
- تدرج لوني جميل (بنفسجي إلى نيلي)
- تأثيرات hover متقدمة
- دعم الشارات (badges) الملونة
- قابل للتخصيص بالكامل
- سهل الاستخدام

## الاستخدام الأساسي

```tsx
import CollapsibleSection from './ui/CollapsibleSection';

<CollapsibleSection
  title="إضافة المزيد من التفاصيل"
  subtitle="المواصفات التقنية • الألوان والمقاعد • الكماليات • معلومات إضافية"
>
  <div>محتوى القائمة هنا</div>
</CollapsibleSection>;
```

## الخصائص (Props)

| الخاصية            | النوع       | الافتراضي | الوصف                       |
| ------------------ | ----------- | --------- | --------------------------- |
| `title`            | `string`    | مطلوب     | عنوان القائمة               |
| `subtitle`         | `string`    | مطلوب     | النص التوضيحي               |
| `badges`           | `Badge[]`   | `[]`      | قائمة الشارات               |
| `children`         | `ReactNode` | مطلوب     | محتوى القائمة               |
| `defaultOpen`      | `boolean`   | `false`   | هل القائمة مفتوحة افتراضياً |
| `className`        | `string`    | `''`      | فئات CSS إضافية للحاوي      |
| `buttonClassName`  | `string`    | `''`      | فئات CSS إضافية للزر        |
| `contentClassName` | `string`    | `''`      | فئات CSS إضافية للمحتوى     |

## نوع Badge

```tsx
interface Badge {
  text: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'indigo' | 'gray';
}
```

## أمثلة الاستخدام

### مع الشارات

```tsx
<CollapsibleSection
  title="إضافة المزيد من التفاصيل"
  subtitle="المواصفات التقنية • الألوان والمقاعد • الكماليات • معلومات إضافية"
  badges={[
    { text: 'سيدان', color: 'blue' },
    { text: 'أبيض', color: 'green' },
    { text: '5 كماليات', color: 'purple' },
    { text: 'بنزين', color: 'orange' },
    { text: 'أوتوماتيك', color: 'indigo' },
    { text: 'معلومات تقنية', color: 'gray' },
  ]}
>
  <div>محتوى مفصل هنا</div>
</CollapsibleSection>
```

### مفتوحة افتراضياً

```tsx
<CollapsibleSection
  title="إعدادات متقدمة"
  subtitle="خيارات متقدمة للمستخدمين المحترفين"
  defaultOpen={true}
>
  <div>إعدادات متقدمة</div>
</CollapsibleSection>
```

### مع تخصيص الأنماط

```tsx
<CollapsibleSection
  title="قسم مخصص"
  subtitle="قسم بتصميم مخصص"
  className="mb-8"
  buttonClassName="hover:scale-105"
  contentClassName="bg-gray-50"
>
  <div>محتوى مخصص</div>
</CollapsibleSection>
```

## ألوان الشارات المتاحة

- `blue`: أزرق فاتح
- `green`: أخضر فاتح
- `purple`: بنفسجي فاتح
- `orange`: برتقالي فاتح
- `indigo`: نيلي فاتح
- `gray`: رمادي فاتح

## التصميم

المكون يستخدم نفس التصميم المطلوب:

- حدود بنفسجية (`border-purple-300`)
- تدرج لوني من البنفسجي إلى النيلي (`from-purple-50 to-indigo-50`)
- تأثيرات hover متقدمة (`hover:scale-[1.02]`)
- أيقونة chevron بنفسجية (`text-purple-600`)
- ظلال وانتقالات سلسة

## مثال كامل

راجع ملف `examples/collapsible-section-example.tsx` لمشاهدة أمثلة شاملة على
الاستخدام.
