// ملف CSS موحد - يحسّن التحميل ويمنع التضارب
import '../styles/auction-timer-responsive.css';
import '../styles/bidders-list.css';
// import '../styles/messenger-style.css'; // تم حذف الملف الفارغ
import '../styles/mobile-menu-optimized.css';
import '../styles/my-account-responsive.css';
import '../styles/responsive-user-dropdown.css';
import '../styles/toggle-switch-fix.css';
import '../styles/unified-main.css';
// نظام التنقل الموحد - يجمع كل أنماط التنقل والتحميل
import '../styles/unified-navigation.css';
// 🚀 تحسينات أداء معرض الصور والتمرير
import '../styles/gallery-performance.css';
// 🔄 نظام التحميل الموحد
import '../components/ui/loading/loading.css';

import { HydrationBoundary, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

// import { SessionProvider } from 'next-auth/react'; // تم تعطيل نظام next-auth مؤقتاً
import ErrorBoundary from '../components/ErrorBoundary';
import { PageVisibilityProvider } from '../contexts/PageVisibilityContext';
// ⚠️ SiteSectionsContext now re-exports from ContentVisibilityContext - no separate provider needed
import { UserProvider } from '../contexts/UserContext';
import { useAnalytics } from '../lib/hooks/useAnalytics';
// routerErrorSuppressor removed

// Import components directly instead of dynamic imports to avoid webpack async issues
import ClientWrapper from '../components/ClientWrapper';
import SessionManager from '../components/SessionManager';
// استخدام نظام التنقل الموحد الجديد بدلاً من PageTransitionOverlay البسيط
import UnifiedPageTransition from '../components/navigation/UnifiedPageTransition';
import { NotificationProvider } from '../components/ui/EnhancedNotificationSystem';
import { GlobalNavigationLoader, LoadingProvider } from '../components/ui/loading';
import { SimpleLocalizationProvider } from '../contexts/SimpleLocalizationContext';
// نظام إدارة المحتوى المحسن - يمنع وميض المحتوى
import { ContentVisibilityProvider } from '../lib/content-visibility/ContentVisibilityContext';

// تهيئة نظام الأرقام الغربية العالمي
import { initializeWesternNumeralsMiddleware } from '../utils/westernNumeralsMiddleware';

// تهيئة مدير الطلبات المحسن لحل أخطاء الشبكة
import '../lib/network/fetchManager';
import '../lib/network/globalFetchHandler';

// معالجة أخطاء HMR في وضع التطوير - تم دمجها في النظام الموحد

// معالج الأخطاء العامة - يمنع توقف السيرفر عند أخطاء SSE
import { initializeGlobalSocket } from '@/lib/socket/socket-initializer';

// مكون معالج عام لتفعيل الإعدادات العالمية الخفيفة
// يتضمن معالجة أخطاء MetaMask/Web3 بشكل كامل
const GlobalErrorHandler = React.memo(({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    // تفعيل نظام الأرقام الغربية العالمي مرة واحدة
    initializeWesternNumeralsMiddleware();

    // ===== معالجة أخطاء MetaMask/Web3 في React =====
    const walletKeywords = [
      'metamask',
      'ethereum',
      'web3',
      'wallet',
      'inpage.js',
      'failed to connect',
      'chrome-extension://',
      'moz-extension://',
      'nkbihfbeogaeaoehlefnkodbefgpgknn',
      'provider',
      'ethers',
    ];

    const isWalletError = (text: string): boolean => {
      if (!text) return false;
      const lower = text.toLowerCase();
      return walletKeywords.some((k) => lower.includes(k));
    };

    // إخفاء Next.js Error Overlay
    const hideErrorOverlay = () => {
      // البحث عن جميع عناصر Error Overlay المحتملة
      const selectors = [
        'nextjs-portal',
        '[data-nextjs-dialog]',
        '[data-nextjs-dialog-overlay]',
        '[data-nextjs-toast]',
        '#__next-build-watcher',
        '[class*="nextjs-container-errors"]',
      ];

      selectors.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el) => {
          const content = el.textContent || '';
          if (isWalletError(content)) {
            (el as HTMLElement).style.display = 'none';
            el.remove();
          }
        });
      });
    };

    // معالج Unhandled Rejection في React
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const reasonStr = String(reason || '').toLowerCase();

      // التحقق من أخطاء SILENT_ABORT من إضافات المتصفح (مثل frame_ant.js)
      const isSilentAbort =
        reason === 'SILENT_ABORT' ||
        reasonStr === 'silent_abort' ||
        reasonStr.includes('silent_abort') ||
        reasonStr.includes('aborterror') ||
        reason?.name === 'AbortError';

      if (
        isSilentAbort ||
        (reason && (isWalletError(String(reason)) || isWalletError(reason?.message || '')))
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (!isSilentAbort) hideErrorOverlay();
      }
    };

    // معالج Error في React
    const handleError = (event: ErrorEvent) => {
      const msg = (event.message || '').toLowerCase();
      const isSilentAbort = msg.includes('silent_abort') || msg.includes('aborterror');

      if (isSilentAbort || isWalletError(event.message) || isWalletError(event.filename || '')) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (!isSilentAbort) hideErrorOverlay();
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection, true);
    window.addEventListener('error', handleError, true);

    // MutationObserver لمراقبة DOM
    const observer = new MutationObserver(() => {
      hideErrorOverlay();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // فحص دوري
    const interval = setInterval(hideErrorOverlay, 300);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection, true);
      window.removeEventListener('error', handleError, true);
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  return <>{children}</>;
});
GlobalErrorHandler.displayName = 'GlobalErrorHandler';

// مكون تتبع التحليلات التلقائي
const AnalyticsTracker = React.memo(({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    // تتبع الصفحة الأولى
    if (typeof window !== 'undefined') {
      trackPageView(window.location.pathname, document.title);
    }

    // تتبع تغييرات الصفحات
    const handleRouteChange = (url: string) => {
      if (typeof document !== 'undefined') {
        trackPageView(url, document.title);
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events, trackPageView]);

  return <>{children}</>;
});
AnalyticsTracker.displayName = 'AnalyticsTracker';

function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 دقيقة - يمنع إعادة الجلب المتكررة
            gcTime: 5 * 60 * 1000, // 5 دقائق - تنظيف ذكي للنتائج
            retry: 2,
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            refetchOnMount: false,
          },
        },
      }),
  );

  // Initialize Socket.IO server/client globally once on the client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      void initializeGlobalSocket();
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={pageProps?.dehydratedState}>
        <ErrorBoundary>
          {/* <SessionProvider session={pageProps.session}> تم تعطيل نظام next-auth مؤقتاً */}
          <SimpleLocalizationProvider>
            {/* نظام إدارة المحتوى الموحد - يوفر جميع بيانات الأقسام والعناصر */}
            <ContentVisibilityProvider initialData={pageProps?.contentVisibilityConfig}>
              <UserProvider>
                <PageVisibilityProvider>
                  <NotificationProvider>
                    {/* نظام التحميل الموحد - يتتبع حالات التحميل عبر التطبيق */}
                    <LoadingProvider trackNavigation={true}>
                      {/* نظام التنقل الموحد - دائرة زرقاء وبيضاء تدور في المنتصف */}
                      <UnifiedPageTransition>
                        {/* شريط التحميل العلوي عند التنقل */}
                        <GlobalNavigationLoader />
                        <GlobalErrorHandler>
                          <AnalyticsTracker>
                            <ClientWrapper>
                              <SessionManager>
                                <Head>
                                  <meta
                                    name="viewport"
                                    content="width=device-width, initial-scale=1"
                                  />
                                  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
                                  <link rel="alternate icon" href="/favicon.ico" />
                                  <meta
                                    name="description"
                                    content="موقع مزادات السيارات - أداء عالي محسن للزيارات العالية"
                                  />
                                  <meta
                                    name="keywords"
                                    content="مزادات, سيارات, أداء عالي, تحسين"
                                  />
                                </Head>
                                <Component {...pageProps} />
                              </SessionManager>
                            </ClientWrapper>
                          </AnalyticsTracker>
                        </GlobalErrorHandler>
                      </UnifiedPageTransition>
                    </LoadingProvider>
                  </NotificationProvider>
                </PageVisibilityProvider>
              </UserProvider>
            </ContentVisibilityProvider>
          </SimpleLocalizationProvider>
          {/* </SessionProvider> */}
        </ErrorBoundary>
      </HydrationBoundary>
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

App.getInitialProps = async () => {
  return { pageProps: {} };
};

export default App;
