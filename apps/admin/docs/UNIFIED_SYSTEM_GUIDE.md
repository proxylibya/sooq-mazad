# 🎯 دليل النظام الموحد للوحة التحكم

# Unified Admin Dashboard System Guide

## 📋 المحتويات

1. [نظرة عامة](#نظرة-عامة)
2. [المكونات المتاحة](#المكونات-المتاحة)
3. [كيفية الاستخدام](#كيفية-الاستخدام)
4. [أمثلة عملية](#أمثلة-عملية)
5. [أفضل الممارسات](#أفضل-الممارسات)

---

## 🔷 نظرة عامة

النظام الموحد يوفر مكونات جاهزة للاستخدام تضمن:

- ✅ تجربة مستخدم موحدة
- ✅ عرض صور تلقائي مع fallback
- ✅ جداول متقدمة مع فرز وبحث
- ✅ إحصائيات جاهزة
- ✅ إشعارات موحدة
- ✅ تنسيق بيانات تلقائي

---

## 🧩 المكونات المتاحة

### 1. UnifiedImage - مكون الصور

```tsx
import { UnifiedImage, UserAvatar, ProductImage, ImageGallery } from '@/components/unified';

// صورة بسيطة
<UnifiedImage
  src="/uploads/auctions/image.jpg"
  alt="صورة المزاد"
  config={{ size: 'md', rounded: 'lg', fallbackIcon: 'car' }}
/>

// صورة مستخدم
<UserAvatar
  user={{ name: 'أحمد', profileImage: '/avatars/user.jpg' }}
  size="sm"
  showName={true}
  showVerified={true}
  verified={true}
/>

// صورة منتج
<ProductImage
  product={{ title: 'سيارة BMW', images: ['/img1.jpg', '/img2.jpg'] }}
  size="md"
  showTitle={true}
/>

// معرض صور
<ImageGallery
  images={['/img1.jpg', '/img2.jpg', '/img3.jpg']}
  maxDisplay={3}
/>
```

### 2. UnifiedTable - مكون الجدول

```tsx
import { UnifiedTable, ColumnPresets } from '@/components/unified';

const columns = [
  ColumnPresets.userWithImage('المستخدم'),
  ColumnPresets.productWithImage('المنتج'),
  ColumnPresets.status('الحالة'),
  ColumnPresets.price('currentPrice', 'السعر'),
  ColumnPresets.date('createdAt', 'التاريخ'),
  ColumnPresets.phone('phone', 'الهاتف'),
];

<UnifiedTable
  columns={columns}
  data={auctions}
  loading={loading}
  emptyMessage="لا توجد مزادات"
  sortable={true}
  selectable={true}
  onRowClick={(row) => router.push(`/admin/auctions/${row.id}`)}
/>;
```

### 3. UnifiedStats - مكون الإحصائيات

```tsx
import { UnifiedStats, StatsPresets } from '@/components/unified';

// إحصائيات جاهزة
<UnifiedStats
  stats={StatsPresets.auctions({ total: 100, active: 50, ended: 30, pending: 20 })}
  columns={4}
/>

// إحصائيات مخصصة
<UnifiedStats
  stats={[
    { id: 'revenue', label: 'الإيرادات', value: 50000, icon: 'revenue', color: 'emerald' },
    { id: 'orders', label: 'الطلبات', value: 120, icon: 'orders', color: 'blue' },
  ]}
/>
```

### 4. UnifiedSearch - مكون البحث والفلترة

```tsx
import { UnifiedSearch, useSearchFilter, CommonFilters } from '@/components/unified';

const { searchValue, setSearchValue, filters, setFilter, filteredData } = useSearchFilter({
  data: auctions,
  searchFields: ['title', 'seller'],
  initialFilters: { status: 'all' },
});

<UnifiedSearch
  searchValue={searchValue}
  onSearchChange={setSearchValue}
  searchPlaceholder="ابحث بالعنوان أو البائع..."
  filters={[
    {
      id: 'status',
      label: 'الحالة',
      value: filters.status || 'all',
      onChange: (v) => setFilter('status', v),
      options: CommonFilters.auctionStatus,
    },
  ]}
  onRefresh={fetchData}
/>;
```

### 5. Toast - نظام الإشعارات

```tsx
import { ToastProvider, useToast, SimpleToast } from '@/components/unified';

// في _app.tsx
<ToastProvider position="top-left">
  <Component {...pageProps} />
</ToastProvider>;

// في أي مكون
const { showSuccess, showError, showWarning, showInfo } = useToast();

showSuccess('تم الحفظ بنجاح');
showError('حدث خطأ');

// أو استخدام SimpleToast مباشرة
<SimpleToast message={message} type="success" onClose={() => setMessage(null)} />;
```

---

## 💡 كيفية الاستخدام

### Import المكونات

```tsx
// كل المكونات
import {
  UnifiedImage,
  UnifiedTable,
  UnifiedStats,
  UnifiedSearch,
  useToast,
  useSearchFilter,
  formatPrice,
  formatDate,
  formatPhoneNumber,
  getStatusClasses,
  ColumnPresets,
  StatsPresets,
  CommonFilters,
} from '@/components/unified';

// أو المكونات الفردية
import { UnifiedImage } from '@/components/unified/UnifiedImage';
```

### Import الأدوات المساعدة

```tsx
import {
  parseImages,
  getEntityImage,
  getImageUrl,
  formatPrice,
  formatDate,
  formatPhoneNumber,
  formatNumber,
  getStatusConfig,
  getStatusClasses,
  ROLE_LABELS,
  SERVICE_TYPE_LABELS,
} from '@/lib/unified-admin-system';
```

---

## 📝 أمثلة عملية

### صفحة إدارة كاملة

```tsx
import { useEffect, useState, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';
import {
  UnifiedTable,
  UnifiedStats,
  UnifiedSearch,
  useSearchFilter,
  StatsPresets,
  ColumnPresets,
  CommonFilters,
  SimpleToast,
} from '@/components/unified';

interface Auction {
  id: string;
  title: string;
  images: string[];
  status: string;
  currentPrice: number;
  createdAt: string;
}

export default function AuctionsPage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const { searchValue, setSearchValue, filters, setFilter, filteredData } = useSearchFilter({
    data: auctions,
    searchFields: ['title'],
    initialFilters: { status: 'all' },
  });

  const fetchAuctions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/auctions');
      const data = await res.json();
      setAuctions(data.auctions || []);
    } catch (err) {
      setMessage({ text: 'فشل تحميل البيانات', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  const columns = [
    ColumnPresets.productWithImage<Auction>('المزاد'),
    ColumnPresets.status<Auction>('الحالة'),
    ColumnPresets.price<Auction>('currentPrice', 'السعر الحالي'),
    ColumnPresets.date<Auction>('createdAt', 'تاريخ الإنشاء'),
  ];

  return (
    <AdminLayout title="إدارة المزادات">
      <SimpleToast
        message={message?.text || null}
        type={message?.type}
        onClose={() => setMessage(null)}
      />

      <UnifiedStats
        stats={StatsPresets.auctions({
          total: auctions.length,
          active: auctions.filter((a) => a.status === 'ACTIVE').length,
          ended: auctions.filter((a) => a.status === 'ENDED').length,
          pending: auctions.filter((a) => a.status === 'PENDING').length,
        })}
        className="mb-6"
      />

      <UnifiedSearch
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="ابحث في المزادات..."
        filters={[
          {
            id: 'status',
            value: filters.status || 'all',
            onChange: (v) => setFilter('status', v),
            options: CommonFilters.auctionStatus,
          },
        ]}
        onRefresh={fetchAuctions}
        className="mb-6"
      />

      <UnifiedTable
        columns={columns}
        data={filteredData}
        loading={loading}
        emptyMessage="لا توجد مزادات"
      />
    </AdminLayout>
  );
}
```

---

## ✅ أفضل الممارسات

1. **استخدم المكونات الموحدة دائماً** بدلاً من إنشاء مكونات مخصصة
2. **استخدم ColumnPresets** للأعمدة الشائعة
3. **استخدم StatsPresets** للإحصائيات القياسية
4. **استخدم CommonFilters** لخيارات الفلترة
5. **استخدم formatPrice, formatDate** لتنسيق البيانات
6. **استخدم getStatusClasses** لألوان الحالات

---

## 📁 الملفات

```
apps/admin/
├── lib/
│   └── unified-admin-system.ts     # النظام الأساسي والأدوات
├── components/
│   └── unified/
│       ├── index.ts                 # تصدير كل المكونات
│       ├── UnifiedImage.tsx         # مكون الصور
│       ├── UnifiedTable.tsx         # مكون الجداول
│       ├── UnifiedStats.tsx         # مكون الإحصائيات
│       ├── UnifiedToast.tsx         # مكون الإشعارات
│       └── UnifiedSearch.tsx        # مكون البحث
└── docs/
    └── UNIFIED_SYSTEM_GUIDE.md      # هذا الدليل
```

---

**تم إنشاء هذا النظام في: ديسمبر 2024**
