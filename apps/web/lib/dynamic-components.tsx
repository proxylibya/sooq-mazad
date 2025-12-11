// Dynamic Components محسنة للأداء العالي والاستقرار
import dynamic from 'next/dynamic';
import React from 'react';

// Loading Skeletons محسنة
export const LoadingSkeleton: React.FC = () => (
  <div className="animate-pulse bg-gray-200 rounded-lg p-6">
    <div className="space-y-3">
      <div className="bg-gray-300 rounded h-4 w-3/4"></div>
      <div className="bg-gray-300 rounded h-4 w-1/2"></div>
      <div className="bg-gray-300 rounded h-8 w-full"></div>
    </div>
  </div>
);

export const ModalSkeleton: React.FC = () => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="animate-pulse bg-white rounded-lg w-full max-w-md mx-4 p-6">
      <div className="space-y-4">
        <div className="bg-gray-200 rounded h-6 w-1/2"></div>
        <div className="bg-gray-200 rounded h-32 w-full"></div>
        <div className="flex gap-3">
          <div className="bg-gray-200 rounded h-10 flex-1"></div>
          <div className="bg-gray-200 rounded h-10 flex-1"></div>
        </div>
      </div>
    </div>
  </div>
);

export const GridSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: 6 }).map((_, i) => (
      <LoadingSkeleton key={i} />
    ))}
  </div>
);

// Dynamic Imports محسنة مع Error Boundaries
export const DynamicLoginModal = dynamic(
  () => import('@/components/auth/LoginModal'),
  {
    ssr: false,
    loading: () => <ModalSkeleton />
  }
);

export const DynamicShareModal = dynamic(
  () => import('@/components/ShareModal'),
  {
    ssr: false,
    loading: () => <ModalSkeleton />
  }
);

export const DynamicSafetyTips = dynamic(
  () => import('@/components/SafetyTips'),
  {
    ssr: false,
    loading: () => <LoadingSkeleton />
  }
);

// مكونات الإدارة الثقيلة
export const DynamicAdminDashboard = dynamic(
  () => import('@/components/admin/dashboard/DashboardStats'),
  {
    ssr: false,
    loading: () => <GridSkeleton />
  }
);

export const DynamicSystemHealth = dynamic(
  () => import('@/components/admin/dashboard/SystemHealthPanel'),
  {
    ssr: false,
    loading: () => <LoadingSkeleton />
  }
);

// مكونات المزادات
export const DynamicAuctionFilters = dynamic(
  () => import('@/components/auctions/AuctionFilters'),
  {
    ssr: false,
    loading: () => <LoadingSkeleton />
  }
);

export const DynamicMarketplaceGrid = dynamic(
  () => import('@/components/marketplace/MarketplaceGrid'),
  {
    ssr: true, // مهم للـ SEO
    loading: () => <GridSkeleton />
  }
);

// HOC للتحميل الذكي مع قياس الأداء
export const withPerformanceTracking = <P extends object>(
  importFn: () => Promise<{ default: React.ComponentType<P> }>,
  componentName: string
) => {
  return dynamic(
    async () => {
      const startTime = performance.now();
      try {
        const component = await importFn();
        const loadTime = performance.now() - startTime;
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`🚀 ${componentName} loaded in ${loadTime.toFixed(2)}ms`);
        }
        
        return component;
      } catch (error) {
        console.error(`❌ Failed to load ${componentName}:`, error);
        throw error;
      }
    },
    {
      ssr: false,
      loading: () => <LoadingSkeleton />
    }
  );
};

// تحميل شرطي محسن
export const createConditionalComponent = <P extends object>(
  condition: boolean,
  trueComponent: () => Promise<{ default: React.ComponentType<P> }>,
  falseComponent: () => Promise<{ default: React.ComponentType<P> }>
) => {
  return dynamic(
    async () => {
      const startTime = performance.now();
      const component = condition ? await trueComponent() : await falseComponent();
      const loadTime = performance.now() - startTime;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔄 Conditional component loaded in ${loadTime.toFixed(2)}ms`);
      }
      
      return component;
    },
    {
      ssr: false,
      loading: () => <LoadingSkeleton />
    }
  );
};

// تحميل حسب نوع الجهاز
export const createDeviceSpecificComponent = <P extends object>(
  mobileComponent: () => Promise<{ default: React.ComponentType<P> }>,
  desktopComponent: () => Promise<{ default: React.ComponentType<P> }>
) => {
  return dynamic(
    async () => {
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      const component = isMobile ? await mobileComponent() : await desktopComponent();
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`📱 ${isMobile ? 'Mobile' : 'Desktop'} component loaded`);
      }
      
      return component;
    },
    {
      ssr: false,
      loading: () => <LoadingSkeleton />
    }
  );
};
