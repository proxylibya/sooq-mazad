# نظام التأثيرات الموحد - Unified Animation System

نظام شامل واحترافي لتأثيرات الحركة في لوحة التحكم.

## الميزات الرئيسية

- **تأثيرات CSS محسّنة**: animations و transitions سلسة وطبيعية
- **مكونات قابلة لإعادة الاستخدام**: HOC وcomponents جاهزة
- **Custom Hooks**: hooks متقدمة لإدارة التأثيرات
- **أداء عالي**: مع دعم will-change وoptimizations
- **Accessibility**: دعم prefers-reduced-motion

## الاستخدام

### 1. CSS Classes

```jsx
// تأثيرات الظهور
<div className="animate-fade-in">محتوى</div>
<div className="animate-fade-in-up">محتوى</div>
<div className="animate-slide-down">محتوى</div>

// تأثيرات Hover
<div className="hover-lift">بطاقة</div>
<div className="hover-glow">زر</div>
<div className="hover-scale">عنصر</div>

// القوائم المنسدلة
<div className="sidebar-dropdown expanded">قائمة</div>
<div className="dropdown-menu">خيارات</div>

// البطاقات والجداول
<div className="card-entrance">بطاقة</div>
<tr className="table-row-entrance">صف</tr>
```

### 2. AnimatedWrapper Component

```jsx
import AnimatedWrapper, { AnimatedCard, AnimatedButton } from '@/components/animations/AnimatedWrapper';

// مثال بسيط
<AnimatedWrapper animation="fade-in-up" delay={100}>
  <div>محتوى</div>
</AnimatedWrapper>

// بطاقة متحركة
<AnimatedCard delay={200}>
  <h3>عنوان البطاقة</h3>
  <p>محتوى البطاقة</p>
</AnimatedCard>

// زر متحرك
<AnimatedButton onClick={handleClick}>
  اضغط هنا
</AnimatedButton>
```

### 3. Custom Hooks

```jsx
import {
  useIntersectionAnimation,
  useStaggeredAnimation,
  useDropdownAnimation
} from '@/lib/animations/useAnimations';

// تأثير عند الظهور في viewport
const [ref, isVisible] = useIntersectionAnimation({ once: true });

// تأثير متسلسل للعناصر
const visibleItems = useStaggeredAnimation(items.length, 0, 50);

// إدارة القوائم المنسدلة
const { isOpen, toggle } = useDropdownAnimation();
```

## التأثيرات المتاحة

### Entrance Animations
- `fade-in`: ظهور تدريجي
- `fade-in-up`: ظهور مع حركة للأعلى
- `slide-down`: انزلاق للأسفل
- `slide-up`: انزلاق للأعلى
- `slide-in-right`: انزلاق من اليمين
- `slide-in-left`: انزلاق من اليسار
- `scale-in`: تكبير تدريجي

### Hover Effects
- `hover-lift`: رفع العنصر عند التمرير
- `hover-glow`: توهج عند التمرير
- `hover-scale`: تكبير عند التمرير
- `hover-scale-down`: تصغير عند الضغط

### Special Effects
- `loading-shimmer`: تأثير تحميل shimmer
- `loading-pulse`: تأثير نبض للتحميل
- `notification-badge`: تأثير للإشعارات

## متغيرات التوقيت

```css
--transition-fast: 150ms
--transition-base: 250ms
--transition-slow: 350ms
--transition-slower: 500ms
```

## متغيرات Easing

```css
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1)
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55)
--ease-elastic: cubic-bezier(0.175, 0.885, 0.32, 1.275)
--ease-in-out: cubic-bezier(0.645, 0.045, 0.355, 1)
```

## أمثلة متقدمة

### بطاقات إحصائيات متحركة

```jsx
<div className="grid grid-cols-3 gap-6">
  {stats.map((stat, index) => (
    <AnimatedCard key={stat.id} delay={index * 50}>
      <div className="hover-lift">
        <h3>{stat.title}</h3>
        <p>{stat.value}</p>
      </div>
    </AnimatedCard>
  ))}
</div>
```

### جدول مع صفوف متحركة

```jsx
<table className="admin-table">
  <tbody>
    {data.map((row, index) => (
      <AnimatedTableRow key={row.id} index={index}>
        <td>{row.name}</td>
        <td>{row.value}</td>
      </AnimatedTableRow>
    ))}
  </tbody>
</table>
```

### قائمة منسدلة متحركة

```jsx
const { isOpen, toggle } = useDropdownAnimation();

<button onClick={toggle}>خيارات</button>
{isOpen && (
  <AnimatedDropdown isOpen={isOpen}>
    <button>خيار 1</button>
    <button>خيار 2</button>
  </AnimatedDropdown>
)}
```

## Best Practices

1. **استخدم التأثيرات بحكمة**: لا تبالغ في التأثيرات
2. **اختر التوقيت المناسب**: استخدم متغيرات التوقيت المعرّفة
3. **احترم prefers-reduced-motion**: النظام يدعم هذا تلقائياً
4. **استخدم will-change**: للعناصر التي تتحرك كثيراً
5. **اختبر الأداء**: خاصة على الأجهزة الضعيفة

## Performance Tips

- استخدم `will-change` للعناصر التي تتحرك
- استخدم `transform` و `opacity` بدلاً من `left`, `top`, etc.
- تجنب تأثيرات متعددة في نفس الوقت
- استخدم `once: true` في useIntersectionAnimation عندما يكون مناسباً
