// Dynamic Imports محسنة للأداء العالي والاستقرار
import dynamic from 'next/dynamic';
import React from 'react';

// Loading Components بدون JSX داخل ملف .ts
const LoadingCard: React.FC = () => {
  return React.createElement(
    'div',
    { className: 'animate-pulse bg-gray-200 rounded-lg p-6' },
    React.createElement(
      'div',
      { className: 'space-y-3' },
      React.createElement('div', { className: 'bg-gray-300 rounded h-4 w-3/4' }),
      React.createElement('div', { className: 'bg-gray-300 rounded h-4 w-1/2' }),
      React.createElement('div', { className: 'bg-gray-300 rounded h-8 w-full' })
    )
  );
};

const LoadingModal: React.FC = () => {
  return React.createElement(
    'div',
    { className: 'fixed inset-0 bg-black/50 flex items-center justify-center z-50' },
    React.createElement(
      'div',
      { className: 'animate-pulse bg-white rounded-lg w-full max-w-md mx-4 p-6' },
      React.createElement(
        'div',
        { className: 'space-y-4' },
        React.createElement('div', { className: 'bg-gray-200 rounded h-6 w-1/2' }),
        React.createElement('div', { className: 'bg-gray-200 rounded h-32 w-full' }),
        React.createElement(
          'div',
          { className: 'flex gap-3' },
          React.createElement('div', { className: 'bg-gray-200 rounded h-10 flex-1' }),
          React.createElement('div', { className: 'bg-gray-200 rounded h-10 flex-1' })
        )
      )
    )
  );
};

const LoadingGrid: React.FC = () => {
  return React.createElement(
    'div',
    { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' },
    ...Array.from({ length: 6 }).map((_, i) =>
      React.createElement(LoadingCard, { key: i })
    )
  );
};

// صفحات رئيسية محسنة
export const DynamicMarketplacePage = dynamic(
  () => import('@/pages/marketplace'),
  {
    loading: () => React.createElement(LoadingGrid),
    ssr: true // SEO مهم للصفحات الرئيسية
  }
);

export const DynamicAuctionPage = dynamic(
  () => import('@/pages/auction/[id]'),
  {
    loading: () => React.createElement(LoadingCard),
    ssr: true
  }
);

export const DynamicSettingsPage = dynamic(
  () => import('@/pages/settings'),
  {
    loading: () => React.createElement(LoadingCard),
    ssr: false // إعدادات شخصية
  }
);

// مكونات الإدارة (ثقيلة)
export const DynamicAdminDashboard = dynamic(
  () => import('@/components/admin/dashboard/DashboardStats'),
  {
    loading: () => React.createElement(LoadingGrid),
    ssr: false
  }
);

// نماذج وحوارات
export const DynamicLoginModal = dynamic(
  () => import('@/components/auth/LoginModal'),
  {
    loading: () => React.createElement(LoadingModal),
    ssr: false
  }
);

export const DynamicShareModal = dynamic(
  () => import('@/components/ShareModal'),
  {
    loading: () => React.createElement(LoadingModal),
    ssr: false
  }
);

export const DynamicReportModal = dynamic(
  () => import('@/components/ReportModal'),
  {
    loading: () => React.createElement(LoadingModal),
    ssr: false
  }
);

// مكونات الخرائط (ثقيلة)
export const DynamicLocationPicker = dynamic(
  () => import('@/components/LocationPickerModal'),
  {
    loading: () => React.createElement('div', { className: 'animate-pulse bg-gray-200 rounded-lg h-96' }),
    ssr: false
  }
);

export const DynamicMapView = dynamic(
  () => import('@/components/maps/MarketplaceMapView'),
  {
    loading: () => React.createElement('div', { className: 'animate-pulse bg-gray-200 rounded-lg h-64' }),
    ssr: false
  }
);

// مكونات المحفظة والمدفوعات
// مكونات التحليلات والإحصائيات
export const DynamicAnalyticsDashboard = dynamic(
  () => import('@/components/admin/AnalyticsDashboard'),
  {
    loading: () => React.createElement(LoadingGrid),
    ssr: false
  }
);

export const DynamicPerformanceMonitor = dynamic(
  () => import('@/components/admin/PerformanceMonitor'),
  {
    loading: () => React.createElement('div', { className: 'animate-pulse bg-gray-200 rounded h-20' }),
    ssr: false
  }
);

// مكونات الدردشة والرسائل
export const DynamicChatInterface = dynamic(
  () => import('@/components/ModernChatInterface'),
  {
    loading: () => React.createElement('div', { className: 'animate-pulse bg-gray-200 rounded-lg h-80' }),
    ssr: false
  }
);

// HOC لقياس أداء المكونات المحملة ديناميكياً
export const withPerformanceTracking = <P = unknown>(
  importFn: () => Promise<{ default: React.ComponentType<P> }>,
  componentName: string
) => {
  return dynamic(
    async () => {
      const startTime = performance.now();
      const component = await importFn();
      const loadTime = performance.now() - startTime;
      
      console.log(`Component ${componentName} loaded in ${loadTime.toFixed(2)}ms`);
      
      return component;
    },
    {
      loading: () => React.createElement(LoadingCard),
      ssr: false
    }
  );
};

// دالة مساعدة لتحميل المكونات بناءً على الشروط
export const conditionalDynamicImport = <P = unknown>(
  condition: boolean,
  trueImport: () => Promise<{ default: React.ComponentType<P> }>,
  falseImport: () => Promise<{ default: React.ComponentType<P> }>
) => {
  return dynamic(
    async () => {
      return condition ? await trueImport() : await falseImport();
    },
    {
      loading: () => React.createElement(LoadingCard),
      ssr: false
    }
  );
};

// تحميل مكونات بناءً على نوع الجهاز
export const deviceSpecificImport = <P = unknown>(
  mobileImport: () => Promise<{ default: React.ComponentType<P> }>,
  desktopImport: () => Promise<{ default: React.ComponentType<P> }>
) => {
  return dynamic(
    async () => {
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      return isMobile ? await mobileImport() : await desktopImport();
    },
    {
      loading: () => React.createElement(LoadingCard),
      ssr: false
    }
  );
};
