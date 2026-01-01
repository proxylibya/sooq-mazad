/**
 * Lazy Loading Components Index
 * مركز تصدير جميع المكونات المُحمّلة بشكل كسول
 */

// Charts - المسار الصحيح للمكون
export { DynamicChart } from '../DynamicChart';
export type { ChartDataPoint, DynamicChartProps } from '../DynamicChart';
// DynamicLazyChart غير موجود - تم إزالته

// Maps
export {
  DynamicInteractiveMap, DynamicMap, DynamicMarketplaceMapView, DynamicSafeLeafletMap, DynamicSimpleMap
} from './DynamicMap';

// Dynamic imports للمكونات الثقيلة الأخرى
import dynamic from 'next/dynamic';

// Modal Components
export const DynamicLoginModal = dynamic(() => import('../auth/LoginModal'), {
  ssr: false,
});

export const DynamicRegisterModal = dynamic(() => import('../auth/RegisterModal'), { ssr: false });

// Heavy Sections
export const DynamicPremiumAdsSection = dynamic(() => import('../sections/PremiumAdsSection'), {
  ssr: false,
});

export const DynamicDownloadAppSection = dynamic(() => import('../DownloadAppSection'), {
  ssr: false,
});

export const DynamicBusinessPackagesSection = dynamic(
  () => import('../sections/BusinessPackagesSection'),
  { ssr: false },
);

// Admin Components - تم تعطيلها لأن المجلد غير موجود
// يمكن إعادة تفعيلها عند إنشاء المكونات المطلوبة
// export const DynamicDashboardCharts = dynamic(() => import('../admin/charts/DashboardCharts'), { ssr: false });
// export const DynamicInteractiveChart = dynamic(() => import('../admin/InteractiveChart'), { ssr: false });

// Form Components (ثقيلة بسبب الـ validation)
export const DynamicRichTextEditor = dynamic(() => import('../forms/RichTextEditor'), {
  ssr: false,
});

// Image Components
export const DynamicImageGallery = dynamic(() => import('../ui/ImageGallery'), {
  ssr: false,
});

export const DynamicImageUploader = dynamic(() => import('../forms/ImageUploader'), { ssr: false });

// Date Picker (ثقيل بسبب date-fns)
export const DynamicDatePicker = dynamic(() => import('../forms/DatePicker'), {
  ssr: false,
});

// QR Code Generator
export const DynamicQRCode = dynamic(() => import('../ui/QRCode'), {
  ssr: false,
});

// Video Player
export const DynamicVideoPlayer = dynamic(() => import('../ui/VideoPlayer'), {
  ssr: false,
});

// PDF Viewer
export const DynamicPDFViewer = dynamic(() => import('../ui/PDFViewer'), {
  ssr: false,
});
