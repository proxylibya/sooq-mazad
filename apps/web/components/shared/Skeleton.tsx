/**
 * مكون Skeleton موحد
 * ⚠️ هذا الملف هو wrapper للتوافقية العكسية
 * يُرجى استخدام المكونات من '@/components/ui/loading' مباشرة
 *
 * @deprecated استخدم الاستيراد من '@/components/ui/loading' بدلاً من هذا الملف
 */

// إعادة تصدير من النظام الموحد
export {
  SkeletonAvatar,
  SkeletonBadge,
  SkeletonButton,
  SkeletonImage,
  SkeletonText,
  SkeletonTitle,
  default,
} from '../ui/loading/skeletons/SkeletonBase';

export {
  AuctionCardSkeleton,
  CarCardSkeleton,
  CarCardSkeleton as CardSkeleton,
  MessageCardSkeleton,
  NotificationCardSkeleton,
  ShowroomCardSkeleton,
  TransportCardSkeleton,
  UserCardSkeleton,
} from '../ui/loading/skeletons/CardSkeleton';

export {
  AuctionsGridSkeleton,
  CarsGridSkeleton,
  CarsGridSkeleton as GridSkeleton,
  UsersListSkeleton as ListSkeleton,
  MessagesListSkeleton,
  NotificationsListSkeleton,
  ShowroomsGridSkeleton,
  TransportGridSkeleton,
} from '../ui/loading/skeletons/GridSkeleton';
