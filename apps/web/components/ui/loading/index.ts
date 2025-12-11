/**
 * نظام التحميل العالمي الموحد - سوق مزاد
 * Unified Loading System
 * 
 * @description تصدير جميع مكونات نظام التحميل
 * @version 2.0.0
 * @author سوق مزاد
 */

// ============================================
// CSS Styles - يجب استيرادها في _app.tsx وليس هنا
// ============================================
// Note: Import './components/ui/loading/loading.css' in pages/_app.tsx

// ============================================
// Provider & Context
// ============================================
export {
    LoadingProvider,
    useLoading,
    useLoadingAction,
    useLoadingState
} from './LoadingProvider';
export type {
    LoadingContextValue,
    LoadingProviderProps,
    LoadingState,
    LoadingType
} from './LoadingProvider';

// ============================================
// Skeleton Base Components
// ============================================
export {
    SkeletonAvatar,
    SkeletonBadge, default as SkeletonBase, SkeletonButton,
    SkeletonDivider,
    SkeletonImage,
    SkeletonText,
    SkeletonTitle
} from './skeletons/SkeletonBase';
export type {
    SkeletonBaseProps,
    SkeletonShape,
    SkeletonVariant
} from './skeletons/SkeletonBase';

// ============================================
// Card Skeletons
// ============================================
export {
    AuctionCardSkeleton,
    CarCardSkeleton,
    default as CardSkeleton,
    MessageCardSkeleton,
    NotificationCardSkeleton,
    ShowroomCardSkeleton,
    TransportCardSkeleton,
    UserCardSkeleton
} from './skeletons/CardSkeleton';
export type { CardSkeletonProps } from './skeletons/CardSkeleton';

// ============================================
// Grid & List Skeletons
// ============================================
export {
    AuctionsGridSkeleton,
    CarsGridSkeleton,
    default as GridSkeleton,
    MessagesListSkeleton,
    NotificationsListSkeleton,
    ShowroomsGridSkeleton,
    TransportGridSkeleton,
    UsersListSkeleton
} from './skeletons/GridSkeleton';
export type { GridSkeletonProps } from './skeletons/GridSkeleton';

// ============================================
// Page Skeletons
// ============================================
export {
    AuctionDetailsSkeleton,
    AuctionsListPageSkeleton,
    MarketplacePageSkeleton,
    MessagesPageSkeleton,
    default as PageSkeleton,
    ProfilePageSkeleton,
    WalletPageSkeleton
} from './skeletons/PageSkeleton';
export type { PageSkeletonProps } from './skeletons/PageSkeleton';

// ============================================
// Spinners
// ============================================
export {
    BarsSpinner,
    DotsSpinner,
    PulseSpinner,
    RingSpinner,
    Spinner
} from './spinners/Spinner';
export type {
    SpinnerColor,
    SpinnerProps,
    SpinnerSize
} from './spinners/Spinner';

// ============================================
// Overlays
// ============================================
export {
    ButtonLoader,
    FullPageLoader,
    GlobalNavigationLoader,
    InlineLoader,
    default as LoadingOverlay,
    NavigationLoader,
    SectionLoader
} from './overlays/LoadingOverlay';
export type {
    LoadingOverlayProps,
    OverlayVariant,
    SpinnerVariant
} from './overlays/LoadingOverlay';

// ============================================
// Page Content Wrapper
// ============================================
export {
    EmptyState,
    ErrorState,
    default as PageContentWrapper
} from './PageContentWrapper';
export type {
    ContentType,
    PageContentWrapperProps
} from './PageContentWrapper';

// ============================================
// Utility Components
// ============================================

/**
 * مكون Skeleton عام قابل للتخصيص
 */
export { default as Skeleton } from './skeletons/SkeletonBase';

/**
 * مكون تحميل افتراضي
 */
export { Spinner as DefaultLoader } from './spinners/Spinner';

