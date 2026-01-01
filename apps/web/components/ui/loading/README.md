# نظام التحميل العالمي الموحد 🚀

# Unified Loading System - سوق مزاد

## نظرة عامة

نظام تحميل متكامل وموحد يوفر تجربة مستخدم احترافية أثناء تحميل البيانات والصفحات.

## الهيكل

```
📁 components/ui/loading/
├── 📄 index.ts                    # تصدير جميع المكونات
├── 📄 loading.css                 # أنماط CSS للتأثيرات
├── 📄 LoadingProvider.tsx         # Context عالمي للتحميل
├── 📄 README.md                   # التوثيق
├── 📁 skeletons/
│   ├── 📄 SkeletonBase.tsx       # المكون الأساسي
│   ├── 📄 CardSkeleton.tsx       # بطاقات (مزاد، سيارة، مستخدم، معرض)
│   ├── 📄 GridSkeleton.tsx       # شبكات وقوائم
│   └── 📄 PageSkeleton.tsx       # صفحات كاملة
├── 📁 spinners/
│   └── 📄 Spinner.tsx            # أنواع مختلفة من الدوران
└── 📁 overlays/
    └── 📄 LoadingOverlay.tsx     # طبقات التحميل
```

## الاستخدام السريع

### 1. Skeleton للبطاقات

```tsx
import { AuctionCardSkeleton, CarCardSkeleton } from '@/components/ui/loading';

// بطاقة مزاد
<AuctionCardSkeleton />

// بطاقة سيارة
<CarCardSkeleton variant="shimmer" />
```

### 2. شبكة بطاقات

```tsx
import { AuctionsGridSkeleton, CarsGridSkeleton } from '@/components/ui/loading';

// شبكة مزادات (6 عناصر، 3 أعمدة)
<AuctionsGridSkeleton count={6} columns={3} />

// شبكة سيارات (8 عناصر، 4 أعمدة)
<CarsGridSkeleton count={8} columns={4} />
```

### 3. صفحة كاملة

```tsx
import { AuctionDetailsSkeleton, MarketplacePageSkeleton } from '@/components/ui/loading';

// صفحة تفاصيل مزاد
<AuctionDetailsSkeleton />

// صفحة السوق
<MarketplacePageSkeleton />
```

### 4. Spinners

```tsx
import { Spinner, DotsSpinner, PulseSpinner, RingSpinner } from '@/components/ui/loading';

// دائرة دوارة
<Spinner size="lg" color="blue" />

// نقاط متحركة
<DotsSpinner size="md" color="gray" />

// نبض
<PulseSpinner size="xl" color="green" />
```

### 5. Overlays

```tsx
import { LoadingOverlay, FullPageLoader, SectionLoader } from '@/components/ui/loading';

// طبقة تحميل على قسم
<div className="relative">
  <LoadingOverlay visible={isLoading} message="جاري التحميل..." />
  {/* المحتوى */}
</div>;

// تحميل صفحة كاملة
{
  isPageLoading && <FullPageLoader message="جاري تحميل الصفحة..." />;
}

// تحميل قسم
<SectionLoader message="جاري تحميل البيانات..." minHeight={300} />;
```

### 6. استخدام Hooks

```tsx
import { useLoading, useLoadingState, useLoadingAction } from '@/components/ui/loading';

// Hook أساسي
const { startLoading, stopLoading, isLoading } = useLoading();

// Hook لحالة تحميل معينة
const { isLoading, start, stop, setProgress } = useLoadingState('my-data');

// Hook لإجراء مع تحميل تلقائي
const { execute, isLoading, error } = useLoadingAction('fetch-data', async () => {
  const response = await fetch('/api/data');
  return response.json();
});
```

## المكونات المتاحة

### Skeletons الأساسية

| المكون           | الوصف                         |
| ---------------- | ----------------------------- |
| `SkeletonBase`   | المكون الأساسي القابل للتخصيص |
| `SkeletonText`   | أسطر نصية                     |
| `SkeletonImage`  | صورة                          |
| `SkeletonAvatar` | صورة دائرية                   |
| `SkeletonButton` | زر                            |
| `SkeletonBadge`  | شارة                          |
| `SkeletonTitle`  | عنوان                         |

### Skeletons البطاقات

| المكون                     | الوصف          |
| -------------------------- | -------------- |
| `AuctionCardSkeleton`      | بطاقة مزاد     |
| `CarCardSkeleton`          | بطاقة سيارة    |
| `UserCardSkeleton`         | بطاقة مستخدم   |
| `ShowroomCardSkeleton`     | بطاقة معرض     |
| `MessageCardSkeleton`      | بطاقة رسالة    |
| `NotificationCardSkeleton` | بطاقة إشعار    |
| `TransportCardSkeleton`    | بطاقة خدمة نقل |

### Skeletons الشبكات والقوائم

| المكون                      | الوصف          |
| --------------------------- | -------------- |
| `AuctionsGridSkeleton`      | شبكة مزادات    |
| `CarsGridSkeleton`          | شبكة سيارات    |
| `ShowroomsGridSkeleton`     | شبكة معارض     |
| `MessagesListSkeleton`      | قائمة رسائل    |
| `NotificationsListSkeleton` | قائمة إشعارات  |
| `UsersListSkeleton`         | قائمة مستخدمين |
| `TransportGridSkeleton`     | شبكة خدمات نقل |

### Skeletons الصفحات

| المكون                     | الوصف               |
| -------------------------- | ------------------- |
| `AuctionDetailsSkeleton`   | صفحة تفاصيل مزاد    |
| `AuctionsListPageSkeleton` | صفحة قائمة المزادات |
| `MarketplacePageSkeleton`  | صفحة السوق          |
| `ProfilePageSkeleton`      | صفحة الملف الشخصي   |
| `MessagesPageSkeleton`     | صفحة الرسائل        |
| `WalletPageSkeleton`       | صفحة المحفظة        |

### Spinners

| المكون         | الوصف                |
| -------------- | -------------------- |
| `Spinner`      | دائرة دوارة كلاسيكية |
| `DotsSpinner`  | نقاط متحركة          |
| `PulseSpinner` | نبض                  |
| `RingSpinner`  | حلقة                 |
| `BarsSpinner`  | أشرطة                |

### Overlays

| المكون                   | الوصف                      |
| ------------------------ | -------------------------- |
| `LoadingOverlay`         | طبقة تحميل قابلة للتخصيص   |
| `FullPageLoader`         | تحميل صفحة كاملة           |
| `SectionLoader`          | تحميل قسم                  |
| `ButtonLoader`           | تحميل داخل زر              |
| `InlineLoader`           | تحميل في السطر             |
| `NavigationLoader`       | شريط تحميل علوي            |
| `GlobalNavigationLoader` | شريط تحميل متصل بـ Context |

## الخصائص المشتركة

### SkeletonVariant

```ts
type SkeletonVariant = 'shimmer' | 'pulse' | 'wave';
```

- `shimmer`: تأثير لمعان متحرك (افتراضي)
- `pulse`: تأثير نبض
- `wave`: تأثير موجة

### SpinnerSize

```ts
type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
```

### SpinnerColor

```ts
type SpinnerColor = 'blue' | 'white' | 'gray' | 'green' | 'red' | 'amber' | 'primary';
```

## التكامل مع \_app.tsx

النظام متكامل تلقائياً مع `_app.tsx`:

```tsx
import { LoadingProvider, GlobalNavigationLoader } from '@/components/ui/loading';

function App({ Component, pageProps }) {
  return (
    <LoadingProvider trackNavigation={true}>
      <GlobalNavigationLoader />
      <Component {...pageProps} />
    </LoadingProvider>
  );
}
```

## دعم RTL

جميع المكونات تدعم اللغة العربية (RTL) تلقائياً.

## إمكانية الوصول

- دعم `prefers-reduced-motion` للمستخدمين الذين يفضلون تقليل الحركة
- سمات `role` و `aria-label` للقارئات الصوتية

## PageContentWrapper - غلاف المحتوى الموحد

مكون جديد يوفر حالات التحميل والخطأ والفراغ بشكل موحد:

```tsx
import { PageContentWrapper } from '@/components/ui/loading';

<PageContentWrapper
  isLoading={loading}
  isError={isError}
  errorMessage="حدث خطأ أثناء تحميل البيانات"
  isEmpty={data.length === 0}
  emptyMessage="لا توجد بيانات"
  contentType="cars" // أو 'auctions', 'showrooms', 'transport', 'messages', ...
  skeletonCount={8}
  columns={4}
  onRetry={handleRetry}
>
  {/* المحتوى الفعلي */}
  <div className="grid grid-cols-4 gap-4">
    {data.map((item) => (
      <Card key={item.id} {...item} />
    ))}
  </div>
</PageContentWrapper>;
```

### أنواع المحتوى المدعومة

| النوع           | الوصف        |
| --------------- | ------------ |
| `auctions`      | مزادات       |
| `cars`          | سيارات       |
| `marketplace`   | السوق الفوري |
| `showrooms`     | معارض        |
| `transport`     | خدمات النقل  |
| `messages`      | الرسائل      |
| `notifications` | الإشعارات    |
| `users`         | المستخدمين   |
| `favorites`     | المفضلة      |
| `yards`         | الساحات      |
| `companies`     | الشركات      |
| `custom`        | مخصص         |

## usePageContentLoading Hook

Hook موحد لإدارة حالة التحميل في الصفحات:

```tsx
import { usePageContentLoading } from '@/hooks/usePageContentLoading';

const {
  data,
  isInitialLoading,
  isRefreshing,
  isError,
  error,
  isEmpty,
  isLoaded,
  refresh,
  setData,
  skeletonCount,
  contentType,
} = usePageContentLoading({
  contentType: 'cars',
  initialData: initialCars,
  fetchFn: async () => {
    const response = await fetch('/api/cars');
    return response.json();
  },
  autoRefresh: true,
  refreshInterval: 30000,
});
```

## الإصدار

**v2.1.0** - إضافة PageContentWrapper و usePageContentLoading
