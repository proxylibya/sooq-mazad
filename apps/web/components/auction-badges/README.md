# شارات المزاد الذكية - دليل الاستخدام

## نظرة عامة

تم تطوير مجموعة شاملة من شارات المزاد الذكية لتوفير المساحة في البطاقات مع
الحفاظ على وضوح المعلومات وجاذبية التصميم.

## المكونات المتاحة

### 1. UniversalAuctionBadge - المكون الشامل

المكون الرئيسي الذي يجمع كل خيارات العرض في مكان واحد.

```tsx
import UniversalAuctionBadge from './UniversalAuctionBadge';

<UniversalAuctionBadge
  auctionType="live"
  startTime="2024-01-15T10:00:00Z"
  endTime="2024-01-15T18:00:00Z"
  style="smart"
  variant="detailed"
/>;
```

### 2. QuickAuctionBadge - الاستخدام السريع

مكونات مُعدة مسبقاً للاستخدام السريع:

```tsx
import { QuickAuctionBadge } from './UniversalAuctionBadge';

// للبطاقات الصغيرة
<QuickAuctionBadge.Mini auctionType="live" endTime="..." />

// للبطاقات العادية
<QuickAuctionBadge.Smart auctionType="upcoming" startTime="..." />

// للعرض المتميز
<QuickAuctionBadge.Premium auctionType="live" endTime="..." />

// للساعة المدمجة
<QuickAuctionBadge.Clock auctionType="live" endTime="..." />

// للتصميم الأصلي
<QuickAuctionBadge.Original auctionType="ended" buyerName="أحمد" />
```

### 3. SmartAuctionBadge - الشارة الذكية

شارة متطورة مع تأثيرات بصرية وثلاث متغيرات:

```tsx
import SmartAuctionBadge from './SmartAuctionBadge';

<SmartAuctionBadge
  auctionType="live"
  endTime="2024-01-15T18:00:00Z"
  variant="premium" // minimal | detailed | premium
/>;
```

### 4. CompactAuctionClock - ساعة المزاد المدمجة

تصميم نظيف يركز على عرض الوقت:

```tsx
import CompactAuctionClock from './CompactAuctionClock';

<CompactAuctionClock
  auctionType="live"
  endTime="2024-01-15T18:00:00Z"
  size="medium" // small | medium
/>;
```

### 5. MiniAuctionStatus - الشارة المصغرة

أصغر حجم ممكن مع الحفاظ على الوضوح:

```tsx
import MiniAuctionStatus from './MiniAuctionStatus';

<MiniAuctionStatus auctionType="upcoming" startTime="2024-01-15T10:00:00Z" showTime={true} />;
```

### 6. AuctionStatusDisplay - الشارة الأصلية المحسنة

النسخة المحسنة من الشارة الأصلية مع خيار العرض المدمج:

```tsx
import AuctionStatusDisplay from './AuctionStatusDisplay';

<AuctionStatusDisplay auctionType="live" endTime="2024-01-15T18:00:00Z" compact={true} />;
```

## أنواع المزادات

- `upcoming`: مزاد قادم
- `live`: مزاد نشط
- `ended`: مزاد منتهي

## الخصائص المشتركة

```tsx
interface CommonProps {
  auctionType: 'upcoming' | 'live' | 'ended';
  startTime?: string; // ISO date string
  endTime?: string; // ISO date string
  buyerName?: string | null; // للمزادات المنتهية
  className?: string; // CSS classes إضافية
}
```

## التأثيرات التفاعلية

### التنبيهات البصرية

- **عاجل**: عندما يتبقى أقل من 5 دقائق (animate-pulse)
- **حرج**: عندما يتبقى أقل من دقيقة واحدة (animate-bounce + ring)

### التحديث التلقائي

- تحديث كل ثانية للمزادات النشطة
- تحديث كل دقيقة للشارة المصغرة (لتوفير الأداء)

## أمثلة الاستخدام

### في البطاقات الصغيرة

```tsx
<QuickAuctionBadge.Mini auctionType="live" endTime="2024-01-15T18:00:00Z" showTime={true} />
```

### في البطاقات العادية

```tsx
<QuickAuctionBadge.Smart auctionType="upcoming" startTime="2024-01-15T10:00:00Z" />
```

### في الصفحات الرئيسية

```tsx
<QuickAuctionBadge.Premium auctionType="live" endTime="2024-01-15T18:00:00Z" />
```

## نصائح الاستخدام

1. **للبطاقات الصغيرة**: استخدم `Mini` أو `Smart` مع `variant="minimal"`
2. **للبطاقات العادية**: استخدم `Smart` مع `variant="detailed"`
3. **للعرض المتميز**: استخدم `Premium` أو `Clock`
4. **للقوائم المضغوطة**: استخدم `Mini` مع `showTime={false}`

## التخصيص

يمكن تخصيص الألوان والتأثيرات عبر CSS classes:

```css
/* تخصيص ألوان المزاد النشط */
.custom-live-badge {
  @apply border-red-300 bg-gradient-to-r from-red-50 to-pink-50;
}
```

## الاختبار

لاختبار جميع المكونات، قم بزيارة:

```
/test-auction-badges
```

هذه الصفحة تعرض جميع المكونات مع بيانات تجريبية مختلفة.
