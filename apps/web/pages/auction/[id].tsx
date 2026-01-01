// @ts-nocheck
import { OpensooqNavbar } from '@/components/common';
import RevealPhoneButton from '@/components/common/ui/buttons/RevealPhoneButton';
import { SimpleCircularAuctionTimer } from '@/components/features/auctions';
import { useAuctionLiveData } from '@/hooks/useAuctionLiveData';
import { useAuctionSSE } from '@/hooks/useAuctionSSE';
import { useGlobalSecondTick } from '@/hooks/useGlobalSecondTick';
import { getAuctionStatus as resolveAuctionStatus } from '@/utils/auctionStatus';
import { translateToArabic } from '@/utils/formatters';
import { handlePhoneClickUnified } from '@/utils/phoneActions';
import { quickDecodeName } from '@/utils/universalNameDecoder';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';

// Optimized Dynamic Imports - مكونات محسنة للأداء

// Dynamic imports للمكونات الثقيلة - تحسين الأداء
// Dynamic imports محسنة للأداء
const LoginModal = dynamic(() => import('@/components/auth/LoginModal'), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse rounded-lg bg-gray-200" />,
});

const ShareModal = dynamic(() => import('@/components/ShareModal'), {
  ssr: false,
  loading: () => <div className="h-48 animate-pulse rounded-lg bg-gray-200" />,
});

const SafetyTips = dynamic(() => import('@/components/SafetyTips'), {
  ssr: false,
  loading: () => <div className="h-32 animate-pulse rounded-lg bg-gray-200" />,
});

/* eslint-disable */
// تعطيل شامل للتحذيرات - الحل المُثبت من الذكريات

// Static imports للمكونات الأساسية
// المكونات المصغرة المحسنة
import CompactAuctionOwnerPanel from '@/components/CompactAuctionOwnerPanel';
import CompactDetailedStats from '@/components/CompactDetailedStats';
import { SmartFeaturedBadge, TitleFeaturedBadge } from '@/components/ui/FeaturedBadge';
import SimpleSpinner from '@/components/ui/SimpleSpinner';
// Hooks والدوال المساعدة
import useAuthProtection from '@/hooks/useAuthProtection';
import { usePageElements } from '@/hooks/usePageElements';
import { calculateMinimumBid } from '@/utils/auctionHelpers';
import ChatBubbleLeftRightIcon from '@heroicons/react/24/outline/ChatBubbleLeftRightIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import HandRaisedIcon from '@heroicons/react/24/outline/HandRaisedIcon';
import InformationCircleIcon from '@heroicons/react/24/outline/InformationCircleIcon';
import PhoneIcon from '@heroicons/react/24/outline/PhoneIcon';
import SparklesIcon from '@heroicons/react/24/outline/SparklesIcon';
import TrophyIcon from '@heroicons/react/24/outline/TrophyIcon';
import TruckIcon from '@heroicons/react/24/outline/TruckIcon';
import UserIcon from '@heroicons/react/24/outline/UserIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import { StarIcon } from '@heroicons/react/24/solid';
import CarFeaturesDisplay from '../../components/CarFeaturesDisplay';
import EnhancedImageGallery from '../../components/EnhancedImageGallery';
import ImprovedSellerInfoCard from '../../components/ImprovedSellerInfoCard';
import SaleConfirmedStatus from '../../components/SaleConfirmedStatus';
import WinnerCongratulationsCard from '../../components/WinnerCongratulationsCard';
import ReviewsAndRatings from '../../components/common/ReviewsAndRatings';
import CopartBiddingPanel from '../../components/features/auctions/bidding/CopartBiddingPanel';
import SimpleBiddersList from '../../components/features/auctions/bidding/SimpleBiddersList';
import { useBidders } from '../../hooks/useBidders';
import { useFavorites } from '../../hooks/useFavorites';
import { useAnalytics } from '../../lib/hooks/useAnalytics';

// UnifiedConfirmModal removed - using browser confirm for now
import RelistOptionsModal, {
  RelistOptions,
} from '@/components/features/auctions/modals/RelistOptionsModal';

const InspectionReport = dynamic(
  () => import('../../components/InspectionReport').then((m) => m.default),
  { ssr: false },
);

const AuctionCarDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  const { trackAuctionView } = useAnalytics();
  const globalTick = useGlobalSecondTick(true);

  // استخدام نظام الحماية والمصادقة
  const {
    isAuthenticated: _isAuthenticated,
    user,
    showAuthModal,
    setShowAuthModal: _setShowAuthModal,
    requireLogin,
    handleAuthSuccess,
    handleAuthClose,
  } = useAuthProtection({
    showModal: false, // لا تظهر نافذة تسجيل الدخول تلقائياً
    requireAuth: false, // صفحة المزاد عامة - متاحة للجميع
  });

  const { isFavorite: isFavoriteFn, toggleFavorite: _toggleFavorite } = useFavorites();
  const _isFav = useMemo(
    () => (id && typeof id === 'string' ? isFavoriteFn(undefined, id as string) : false),
    [id, isFavoriteFn],
  );

  // جميع الـ state hooks
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [bidIncrease, setBidIncrease] = useState('');
  const [showBidModal, setShowBidModal] = useState(false);
  const [bidHistory, setBidHistory] = useState<
    Array<{
      id: number;
      bidder: string;
      amount: string;
      time: string;
      isWinning: boolean;
    }>
  >([]);
  interface NotificationState {
    show: boolean;
    type: 'success' | 'error' | 'warning' | 'info' | '';
    message: string;
  }

  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    type: '',
    message: '',
  });
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);
  const [isCurrentBidAnimating, setIsCurrentBidAnimating] = useState(false);
  // إضافة interface للبيانات
  interface CarData {
    id?: string;
    title?: string;
    brand?: string;
    model?: string;
    year?: number;
    mileage?: number | string; // يمكن أن يكون string أو number
    price?: number | string;
    condition?: string;
    description?: string;
    images?: string[];
    sellerId?: string;
    chassisNumber?: string;
    engineNumber?: string;
    engineSize?: string;
    manufacturingCountry?: string;
    customsStatus?: string;
    licenseStatus?: string;
    interiorColor?: string;
    seatCount?: number;
    regionalSpecs?: string;
    fuelType?: string;
    transmission?: string;
    bodyType?: string;
    color?: string;
    locationAddress?: string;
    hasInspectionReport?: boolean;
    hasManualInspectionReport?: boolean;
    manualInspectionData?: Record<string, unknown>;
    inspectionReportFileUrl?: string;
    features?: {
      general?: string[];
      interior?: string[];
      exterior?: string[];
      safety?: string[];
      technology?: string[];
    };
    car?: Record<string, unknown>; // لدعم البيانات المتداخلة
    currentBid?: number | string;
    startingBid?: number | string;
    finalBid?: number | string;
    bidCount?: number;
    [key: string]: unknown;
  }

  const [carData, setCarData] = useState<CarData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentAuctionStatus, setCurrentAuctionStatus] = useState<
    'upcoming' | 'live' | 'ended' | 'sold'
  >('live');

  // دمج بيانات المزاد الحية (سعر/عدد/حالة) بدون تحديث الصفحة
  const liveAuctionIds = React.useMemo(() => (carData?.id ? [carData.id] : []), [carData?.id]);
  const { getAuctionData, lastUpdate } = useAuctionLiveData(liveAuctionIds, {
    enabled: !!carData?.id,
    interval: 15000,
  });
  // اشتراك SSE لتحديث فوري للسعر وعدد المزايدات
  const _sse = useAuctionSSE(liveAuctionIds, {
    enabled: !!carData?.id,
    onBid: (evt) => {
      if (!carData?.id) return;
      if (String(evt.auctionId) !== String(carData.id)) return;
      setCarData((prev: any) => {
        if (!prev) return prev;
        const currentNumeric = parseNumericValue(prev.currentBid || prev.startingBid);
        const nextBid =
          typeof evt.currentBid === 'number'
            ? evt.currentBid
            : parseNumericValue(evt.currentBid as any);
        if (!nextBid || nextBid === currentNumeric) return prev;
        return {
          ...prev,
          currentBid: nextBid,
          bidCount:
            typeof evt.bidCount === 'number'
              ? evt.bidCount
              : typeof prev.bidCount === 'number'
                ? prev.bidCount + 1
                : 1,
        };
      });
      // تحديث قائمة المزايدين مباشرة عند حدوث مزايدة جديدة
      try {
        // تحديث المصدر الحقيقي المستخدم في العرض
        refetchBidders();
      } catch (_e) {
        // تجاهل أي أخطاء لحظية في التحديث الحي
      }
    },
    onStatus: (evt) => {
      try {
        if (!carData?.id) return;
        if (String(evt.auctionId) !== String(carData.id)) return;

        console.log('[🔔 SSE Status] تحديث حالة المزاد:', {
          auctionId: evt.auctionId,
          newStatus: evt.status,
          oldStatus: currentAuctionStatus,
          timestamp: evt.timestamp,
        });

        // 🔄 تحويل الحالة من Prisma enum إلى frontend format
        const normalizedStatus = (() => {
          const s = String(evt.status).toUpperCase();
          if (s === 'UPCOMING') return 'upcoming';
          if (s === 'ACTIVE') return 'live';
          if (s === 'ENDED') return 'ended';
          if (s === 'SOLD') return 'sold';
          return 'live'; // fallback
        })();

        // تحديث الحالة فوراً للمستخدمين الآخرين
        setCurrentAuctionStatus(normalizedStatus as any);

        // تحديث carData.status أيضاً لضمان تطابق الحالة
        setCarData((prev: any) => {
          if (!prev) return prev;
          return {
            ...prev,
            status: evt.status === 'SOLD' ? 'SOLD' : prev.status,
            auctionType: normalizedStatus, // تحديث auctionType بالقيمة المطابقة
          };
        });

        if (evt.status === 'SOLD' || normalizedStatus === 'sold') {
          console.log('[✅ SSE] المزاد تم بيعه - تحديث البيانات...');
          // عند البيع، أعد جلب المزايدين لتثبيت الحالة
          void refetchBidders();
          // تحديث بيانات المزاد بهدوء لضمان إظهار السعر النهائي ووقت الانتهاء بدون إعادة تحميل الصفحة
          if (router.query.id) {
            void fetchAuctionData(String(router.query.id), { silent: true });
          }
        }
      } catch (error) {
        console.error('[❌ SSE Status] خطأ في معالجة تحديث الحالة:', error);
      }
    },
  });
  const [showShareModal, setShowShareModal] = useState(false);

  // تأكيد موحد بدلاً من نافذة المتصفح
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const confirmResolverRef = React.useRef<(value: boolean) => void>();

  const confirmWithModal = (message: string) => {
    return new Promise<boolean>((resolve) => {
      setConfirmMessage(message);
      setConfirmOpen(true);
      confirmResolverRef.current = resolve;
    });
  };

  const handleConfirmClose = () => {
    setConfirmOpen(false);
    confirmResolverRef.current?.(false);
  };

  const handleConfirmYes = () => {
    setConfirmOpen(false);
    confirmResolverRef.current?.(true);
  };

  // حالة البيع المؤكد
  const [confirmedSale, setConfirmedSale] = useState<{
    buyerId: number;
    buyerName: string;
    amount: string;
    confirmedAt: Date;
    paymentDeadline: Date;
  } | null>(null);

  // حالة تحميل تأكيد البيع
  const [isConfirmingSale, setIsConfirmingSale] = useState(false);

  // حالة نافذة تأكيد البيع
  const [showSaleConfirmModal, setShowSaleConfirmModal] = useState(false);
  const [pendingSale, setPendingSale] = useState<{
    bidderId: string;
    bidderName: string;
    amount: string;
  } | null>(null);

  // حالة نافذة إعادة الطرح
  const [relistModalOpen, setRelistModalOpen] = useState(false);

  // دالة مساعدة للتحقق من صاحب الإعلان مع تقليل التكرار
  const [ownershipWarningShown, setOwnershipWarningShown] = useState(false);

  const isCurrentUserOwner = useMemo(() => {
    if (!user?.id || !carData?.sellerId) {
      return false;
    }

    const userId = String(user.id).trim();
    const sellerId = String(carData.sellerId).trim();
    const result = userId === sellerId;

    // تسجيل مرة واحدة فقط عند التغيير
    if (process.env.NODE_ENV === 'development' && result && !ownershipWarningShown) {
      console.warn('[تحذير] المستخدم الحالي هو صاحب الإعلان - منع المزايدة');
      setOwnershipWarningShown(true);
    }

    return result;
  }, [user?.id, carData?.sellerId, ownershipWarningShown]);

  // فحص إذا كان المستخدم الحالي هو المشتري في المزاد المباع
  const isCurrentUserWinner = useMemo(() => {
    if (!user?.id || currentAuctionStatus !== 'sold') {
      return false;
    }

    // معرف المشتري من carData
    const winnerId = carData?.highestBidderId || carData?.winnerId;
    if (!winnerId) {
      return false;
    }

    const userId = String(user.id).trim();
    const winnerIdStr = String(winnerId).trim();
    const result = userId === winnerIdStr;

    if (process.env.NODE_ENV === 'development' && result) {
      console.log('🏆 [Winner Check] المستخدم الحالي هو المشتري!', {
        userId,
        winnerId: winnerIdStr,
        carData: carData,
      });
    }

    return result;
  }, [user?.id, currentAuctionStatus, carData?.highestBidderId, carData?.winnerId, carData]);
  // حالة المزايدين الحقيقية - توحيد مع المكوّن EnhancedBiddersList
  interface BiddersListItem {
    id: number;
    name: string;
    amount: string | null;
    increaseAmount?: string;
    timestamp: Date;
    isWinning: boolean;
    isVerified: boolean;
    avatar?: string;
    bidRank: number;
    timeAgo: string;
    rating?: number;
    totalBids?: number;
    joinDate?: string;
    phone?: string;
  }

  const [_realBidders, setRealBidders] = useState<BiddersListItem[]>([]);
  const [sampleBidders, setSampleBidders] = useState<BiddersListItem[]>([]);
  const [showDetailedStats, setShowDetailedStats] = useState(false);

  // استخدام hook المزايدين الجديد
  const {
    bidders: realBidders,
    isLoading: biddersLoading,
    error: biddersError,
    refetch: refetchBidders,
  } = useBidders(typeof id === 'string' ? id : undefined);

  // 🔍 Logs تشخيصية لمشكلة قائمة المزايدين الفارغة للمالك (معطل لتقليل console spam)
  useEffect(() => {
    if (carData && realBidders) {
      // console.log('🔍 [تشخيص المزايدين]', {
      //   auctionId: id,
      //   isOwner: isCurrentUserOwner,
      //   userId: user?.id,
      //   sellerId: carData.sellerId,
      //   biddersCount: realBidders.length,
      //   bidders: realBidders,
      //   loading: biddersLoading,
      //   error: biddersError
      // });
    }
  }, [realBidders, isCurrentUserOwner, user?.id, carData?.sellerId, biddersLoading, biddersError]);

  // تم استبدال البيانات التجريبية بنظام حقيقي باستخدام useBidders
  const sampleBidHistory: Array<{
    id: number;
    bidder: string;
    amount: string;
    time: string;
    isWinning: boolean;
  }> = [];

  // دالة لجلب بيانات السيارة حسب المعرف - تم إزالة البيانات الافتراضية
  const _getCarDataById = (carId: string) => {
    // console.log('getCarDataById called with carId:', carId);
    // console.log('البيانات الافتراضية تم حذفها - لا توجد بيانات متاحة للمعرف:', carId);
    return null;
  };

  // دالة لجلب المزايدات الحقيقية - مع تجميع حسب المزايد لإصلاح العدّ والقيم
  const fetchRealBidders = async (auctionId: string) => {
    try {
      const response = await fetch(`/api/auctions/${auctionId}/bid`);
      if (!response.ok) return;

      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        // محول مساعد لتحويل معرف نصّي إلى رقم ثابت
        const toNumericId = (s: string) => {
          let h = 0;
          for (let i = 0; i < s.length; i++) {
            h = (h * 31 + s.charCodeAt(i)) >>> 0;
          }
          return h || 0;
        };
        // تجميع المزايدات حسب المزايد (userId)
        const byUser: Record<
          string,
          {
            id: number;
            name: string;
            avatar?: string;
            isVerified: boolean;
            highestAmount: number;
            latestTs: Date;
            totalBids: number;
          }
        > = {};

        for (const bid of data.data) {
          const userIdStr = String(bid.userId ?? bid.bidder?.id ?? '0');
          if (!userIdStr || userIdStr === '0') continue;
          const amountNum =
            typeof bid.amount === 'number' ? bid.amount : parseFloat(String(bid.amount || 0));
          const ts = bid.timestamp ? new Date(bid.timestamp) : new Date();
          const existing = byUser[userIdStr];
          if (!existing) {
            byUser[userIdStr] = {
              id: (() => {
                const parsed = parseInt(userIdStr, 10);
                return isNaN(parsed) ? toNumericId(userIdStr) : parsed;
              })(),
              name: bid.bidder?.name || 'مزايد',
              avatar: bid.bidder?.profileImage || undefined,
              isVerified: !!bid.bidder?.verified,
              highestAmount: isNaN(amountNum) ? 0 : amountNum,
              latestTs: ts,
              totalBids: 1,
            };
          } else {
            existing.totalBids += 1;
            if (!isNaN(amountNum) && amountNum > existing.highestAmount) {
              existing.highestAmount = amountNum;
            }
            if (ts > existing.latestTs) {
              existing.latestTs = ts;
            }
          }
        }

        // تحويل إلى مصفوفة متوافقة مع المكوّن
        const aggregated = Object.values(byUser).map((u) => ({
          id: u.id,
          name: u.name,
          amount: String(u.highestAmount),
          increaseAmount: undefined,
          timestamp: u.latestTs,
          isWinning: false, // سيتم تعيين المشتري بعد الترتيب
          isVerified: u.isVerified,
          avatar: u.avatar,
          bidRank: 0,
          timeAgo: getTimeAgo(u.latestTs),
          totalBids: u.totalBids,
        }));

        // ترتيب الأعلى أولاً وتحديد المشتري
        aggregated.sort(
          (a: any, b: any) => parseFloat(b.amount || '0') - parseFloat(a.amount || '0'),
        );
        if (aggregated.length > 0) {
          aggregated[0].isWinning = true;
        }

        setRealBidders(aggregated as any);
        setSampleBidders(aggregated as any);
      } else {
        setRealBidders([]);
        setSampleBidders([]);
      }
    } catch (error) {
      console.error('خطأ في جلب المزايدات:', error);
      setRealBidders([]);
      setSampleBidders([]);
    }
  };

  // دالة مساعدة لحساب الوقت المنقضي
  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'الآن';
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `منذ ${diffInDays} يوم`;
  };

  // دالة للاتصال بالمزايد
  const handleContactBidder = (phone: string) => {
    handlePhoneClickUnified({
      phone,
      directCall: true,
      showWhatsApp: true,
      context: 'bidder-contact',
    });
  };

  // دالة مراسلة المزايد (للمالك)
  const handleMessageBidder = async (otherUserId: string, otherName: string) => {
    if (!requireLogin('بدء محادثة مع مزايد')) return;
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ userId1: String(user?.id), userId2: String(otherUserId) }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        showNotification('error', data?.error || 'فشل إنشاء المحادثة');
        return;
      }
      const convId = String(data?.data?.id || '');
      showNotification('success', `تم فتح محادثة مع ${otherName}`);
      router.push(convId ? `/messages?convId=${encodeURIComponent(convId)}` : '/messages');
    } catch (e) {
      showNotification('error', 'حدث خطأ أثناء إنشاء المحادثة');
    }
  };

  // دالة لمعالجة نجاح المزايدة وإعادة جلب المزايدين
  const handleBidSuccess = async (amount: number) => {
    // console.log(`[Bid Success] مزايدة جديدة بمبلغ ${amount}`); // معطل لتقليل console spam
    // إعادة جلب قائمة المزايدين لتحديث القائمة
    await refetchBidders();
    // ملاحظة: لا نحدث carData هنا لتجنُّب الكتابة فوق التحديث الفوري الذي تم في onBidSuccess
    // أي تحديثات فورية للسعر/العدد تتم محلياً في onBidSuccess داخل CopartBiddingPanel
  };

  // دالة فتح modal تأكيد البيع
  const handleAcceptBid = async (bidderId: number | string, amount: string) => {
    // منع فتح modal متعدد
    if (isConfirmingSale || showSaleConfirmModal) {
      return;
    }

    // 🔍 فحص حالة المزاد قبل السماح بالبيع
    if (currentAuctionStatus === 'sold' || carData?.status === 'SOLD') {
      showNotification('error', 'هذا المزاد مباع بالفعل! يرجى تحديث الصفحة.');
      console.log('[❌ Accept Bid] محاولة بيع مزاد مباع:', {
        currentAuctionStatus,
        'carData.status': carData?.status,
      });
      // إعادة تحميل الصفحة بعد 2 ثانية
      setTimeout(() => window.location.reload(), 2000);
      return;
    }

    // البحث عن اسم المزايد من قائمة المزايدين
    const bidder =
      realBidders.find((b) => String(b.userIdStr || b.id) === String(bidderId)) ||
      sampleBidders.find((b) => String(b.id) === String(bidderId));

    // حفظ بيانات البيع المؤقتة
    setPendingSale({
      bidderId: String(bidderId),
      bidderName: bidder?.name || 'مزايد',
      amount: amount,
    });

    // فتح modal التأكيد
    setShowSaleConfirmModal(true);
  };

  // دالة تنفيذ البيع الفعلي بعد التأكيد
  const confirmAcceptBid = async () => {
    if (!pendingSale) return;

    const { bidderId, amount } = pendingSale;

    // منع تأكيد البيع المتعدد
    if (isConfirmingSale) {
      showNotification('warning', 'جاري تأكيد البيع... يرجى الانتظار');
      return;
    }

    try {
      setIsConfirmingSale(true);
      console.log('🔍 [Accept Sale] تأكيد البيع:', {
        bidderId,
        amount,
        parsedAmount: parseNumericValue(amount),
        currentAuctionStatus,
        'carData.status': carData?.status,
        'carData.auctionType': carData?.auctionType,
      });

      // التحقق من صحة البيانات قبل الإرسال
      if (!bidderId || !amount) {
        throw new Error('بيانات المزايدة غير مكتملة');
      }

      // التأكد من تحويل البيانات إلى الأنواع الصحيحة
      const bidderIdStr = String(bidderId).trim();
      const isNumericBidder = /^\d+$/.test(bidderIdStr);
      const parsedAmount = parseNumericValue(amount);

      // التحقق من صحة المبلغ فقط (المزايد قد يكون معرّفه نصّي)
      if (isNaN(parsedAmount)) {
        throw new Error('بيانات المزايدة غير صحيحة - مبلغ غير صالح');
      }

      const requestData = {
        bidderId: isNumericBidder ? parseInt(bidderIdStr, 10) : bidderIdStr,
        amount: parsedAmount,
        reason: 'تأكيد البيع من قبل المالك',
      };

      console.log('بيانات الطلب:', requestData);

      // إرسال طلب تأكيد البيع إلى API (يدعم البيع لأي مزايد)
      // دعم التوثيق عبر Authorization في حال كان التوكن في localStorage (إضافة على التوثيق عبر الكوكيز)
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch(`/api/auctions/${router.query.id}/accept-sale`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(requestData),
      });

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        console.error('خطأ في تحليل الاستجابة:', parseError);
        throw new Error('خطأ في الاتصال بالخادم');
      }

      if (!response.ok) {
        console.error('❌ [Accept Sale] خطأ من الخادم:', {
          status: response.status,
          statusText: response.statusText,
          result: result,
          auctionId: router.query.id,
          currentStatus: currentAuctionStatus,
        });
        throw new Error(result?.message || `خطأ في الخادم: ${response.status}`);
      }

      console.log('✅ [Accept Sale] نجح تأكيد البيع:', result);

      // 🎯 تحديث حالة المزاد محلياً فوراً - بدون reload
      console.log('[🎯 Sale Confirm] تحديث الحالة إلى sold');
      setCurrentAuctionStatus('sold');

      // العثور على بيانات المشتري من القائمة الحقيقية
      const buyer =
        realBidders.find((b) => String(b.userIdStr || b.id) === String(bidderId)) ||
        sampleBidders.find((b) => String(b.id) === String(bidderId));

      const buyerName = buyer?.name || 'مزايد غير معروف';

      // تأخير إعادة جلب المزايدين لتجنب الوميض - البيانات موجودة بالفعل
      // سيتم التحديث عبر SSE أيضاً
      setTimeout(() => {
        void refetchBidders();
      }, 1500);

      // 🔄 تحديث البيانات من الخادم بعد 5 ثوان (للمزامنة) - بدون reload
      setTimeout(async () => {
        try {
          console.log('[🔄 Background Sync] جلب بيانات محدثة من الخادم...');
          const syncResponse = await fetch(`/api/auctions/${router.query.id}`);
          if (syncResponse.ok) {
            const syncData = await syncResponse.json();
            if (syncData?.data) {
              console.log('[✅ Background Sync] تحديث البيانات بنجاح');
              // تحديث فقط إذا كانت الحالة لا تزال sold
              if (currentAuctionStatus === 'sold') {
                setCarData((prev: any) => ({
                  ...prev,
                  ...syncData.data,
                  // الحفاظ على الحالة المحلية
                  status: 'SOLD',
                  auctionType: 'sold',
                  auctionStatus: 'sold',
                }));
              }
            }
          }
        } catch (error) {
          console.error('[❌ Background Sync] خطأ في المزامنة:', error);
        }
      }, 5000);

      // حفظ معلومات البيع المؤكد + تحديث الحالة محلياً بدون إعادة تحميل الصفحة
      const now = new Date();
      const paymentDeadline = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 ساعة من الآن

      setConfirmedSale({
        buyerId: bidderId,
        buyerName: buyerName,
        amount: amount,
        confirmedAt: now,
        paymentDeadline: paymentDeadline,
      });

      // 🎯 تحديث بيانات المزاد محلياً فوراً لتحديث المؤقت والواجهة
      const finalAmount = parsedAmount;
      setCarData((prev: any) => {
        if (!prev) return prev;
        const updated: any = { ...prev };
        // تحديث جميع الحقول المهمة
        updated.currentBid = finalAmount;
        updated.finalBid = finalAmount;
        // ✅ إضافة اسم المشتري ليظهر للجميع
        updated.buyerName = buyerName;
        updated.auctionEndTime = (now as Date).toISOString?.() || now;
        updated.endTime = (now as Date).toISOString?.() || now;
        // ✅ الإصلاح الحاسم: تحديث حالة المزاد في carData
        updated.status = 'SOLD';
        updated.auctionType = 'sold';
        updated.auctionStatus = 'sold';
        // تحديث المزايد المشتري
        updated.highestBidderId = String(bidderId);
        updated.winnerId = String(bidderId);

        console.log('[🎯 Sale Confirm] تم تحديث carData بنجاح:', {
          status: updated.status,
          auctionType: updated.auctionType,
          auctionStatus: updated.auctionStatus,
          currentBid: updated.currentBid,
          auctionEndTime: updated.auctionEndTime,
          winnerId: updated.winnerId,
        });
        return updated;
      });

      // إظهار إشعار نجاح مع تفاصيل البيع
      showNotification('success', `نجح تم تأكيد البيع بنجاح! المبلغ: ${formatNumber(amount)} د.ل`);

      // تشغيل صوت نجاح (إذا كان متاحاً)
      try {
        const audio = new Audio('/sounds/success.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {
          // تجاهل الخطأ إذا لم يكن الصوت متاحاً
        });
      } catch (error) {
        // تجاهل خطأ الصوت
      }

      // 📧 إرسال رسالة تلقائية للمشتري مع جميع البيانات
      if (buyer) {
        // إظهار معلومات المشتري
        showNotification(
          'success',
          `المشتري: ${quickDecodeName(buyer.name)} - لديه 24 ساعة لتأكيد الدفع`,
        );

        // إرسال إشعار تأكيد البيع
        if ((window as any).auctionNotifications) {
          (window as any).auctionNotifications.saleConfirmed(
            quickDecodeName(buyer.name),
            formatNumber(amount),
          );
        }

        // إعداد رسالة تلقائية للمشتري
        try {
          const auctionTitle =
            carData?.title ||
            `${carData?.brand || ''} ${carData?.model || ''} ${carData?.year || ''}`.trim() ||
            'سيارة';
          const sellerPhone =
            (carData as any)?.contactPhone || (carData?.seller as any)?.phone || 'غير متوفر';

          const autoMessage = `
🎉 مبروك! تم تأكيد شراء السيارة

📋 تفاصيل الصفقة:
━━━━━━━━━━━━━━━
🚗 السيارة: ${auctionTitle}
💰 السعر النهائي: ${formatNumber(amount)} دينار ليبي
👤 البائع: ${quickDecodeName((carData?.seller as any)?.name || 'المالك')}
📞 رقم البائع: ${sellerPhone}

⏰ لديك 24 ساعة لتأكيد الدفع وإتمام الصفقة

📌 الخطوات التالية:
1️⃣ التواصل مع البائع على الرقم أعلاه
2️⃣ الاتفاق على موعد المعاينة والتسليم
3️⃣ إتمام الدفع وتوقيع العقد

⚠️ ملاحظة هامة:
يرجى التأكد من فحص السيارة قبل الدفع النهائي

🔗 رابط الإعلان: ${typeof window !== 'undefined' ? window.location.href : ''}

شكراً لاستخدامك سوق مزاد 🚗
          `.trim();

          // إرسال الرسالة التلقائية للمشتري
          const messageResponse = await fetch('/api/messages/send-auto', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              recipientId: bidderId,
              message: autoMessage,
              type: 'SALE_CONFIRMED',
              auctionId: router.query.id,
              metadata: {
                amount: parsedAmount,
                auctionTitle,
                sellerPhone,
                confirmedAt: now.toISOString(),
              },
            }),
          });

          if (messageResponse.ok) {
            console.log('✅ تم إرسال رسالة تلقائية للمشتري بنجاح');
            showNotification('success', '📧 تم إرسال تفاصيل الصفقة للمشتري');
          }
        } catch (messageError) {
          console.error('خطأ في إرسال الرسالة التلقائية:', messageError);
          // لا نوقف العملية إذا فشل إرسال الرسالة
        }
      }

      showNotification('success', result.message);

      // إظهار رسالة تهنئة إضافية بعد 2 ثانية
      setTimeout(() => {
        showNotification('success', '🎉 مبروك! تم إنجاز البيع بنجاح. ستتلقى تفاصيل الدفع قريباً.');
      }, 2000);

      // إغلاق modal التأكيد وتنظيف البيانات المؤقتة
      setShowSaleConfirmModal(false);
      setPendingSale(null);

      // ملاحظة: لا نعيد تحميل البيانات لتجنّب وميض الصفحة. سيتم مزامنة باقي الحقول عبر SSE أو عند إعادة فتح الصفحة.
    } catch (error) {
      console.error('خطأ في تأكيد البيع:', error);

      // تحديد نوع الخطأ وعرض رسالة مناسبة
      let errorMessage = 'حدث خطأ في تأكيد البيع. يرجى المحاولة مرة أخرى.';

      if (error instanceof Error) {
        if (error.message.includes('خطأ في الاتصال')) {
          errorMessage = 'مشكلة في الاتصال بالخادم. يرجى التحقق من الاتصال بالإنترنت.';
        } else if (error.message.includes('خطأ في الخادم')) {
          errorMessage = 'خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً.';
        } else {
          errorMessage = error.message;
        }
      }

      showNotification('error', errorMessage);

      // إعادة تعيين حالة المزاد في حالة الفشل
      setCurrentAuctionStatus('live');
      setConfirmedSale(null);
    } finally {
      setIsConfirmingSale(false);
    }
  };

  // دالة إدارة حالة المزاد
  const handleStatusChange = async (newStatus: 'upcoming' | 'live' | 'ended' | 'sold') => {
    try {
      const response = await fetch(`/api/auctions/${router.query.id}/manage-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: newStatus,
          reason: `تغيير الحالة من قبل المالك`,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'فشل في تحديث حالة المزاد');
      }

      showNotification('success', result.message);

      // تحديث الحالة محلياً
      setCurrentAuctionStatus(newStatus);

      // إعادة تحميل البيانات
      if (router.query.id) {
        await fetchAuctionData(router.query.id as string);
      }
    } catch (error) {
      console.error('خطأ في تحديث حالة المزاد:', error);
      showNotification(
        'error',
        error instanceof Error ? error.message : 'حدث خطأ في تحديث حالة المزاد.',
      );
    }
  };

  // دالة قبول أعلى مزايدة
  const handleAcceptHighestBid = async () => {
    const source =
      Array.isArray(realBidders) && realBidders.length > 0 ? realBidders : sampleBidders;
    if (source.length === 0) {
      showNotification('warning', 'لا توجد مزايدات لقبولها');
      return;
    }

    const highestBidder = source[0] as any;
    await handleAcceptBid(
      (highestBidder && (highestBidder.userIdStr || highestBidder.id)) as any,
      highestBidder?.amount || '0',
    );
  };

  // دالة إنهاء المزاد
  const handleEndAuction = async () => {
    await handleStatusChange('ended');
  };

  // فتح نافذة إعادة الطرح
  const handleRelistAuction = () => {
    setRelistModalOpen(true);
  };

  // تأكيد إعادة الطرح مع الخيارات
  const handleRelistConfirm = async (opts: RelistOptions) => {
    try {
      const now = new Date();
      const startTime = new Date(now.getTime() + opts.startDelayHours * 60 * 60 * 1000);
      const endTime = new Date(startTime.getTime() + opts.durationDays * 24 * 60 * 60 * 1000);

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(`/api/auctions/${router.query.id}/relist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          priceStrategy: opts.priceStrategy,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || data?.error || 'فشل في إعادة طرح المزاد');
      }

      setRelistModalOpen(false);
      showNotification('success', 'تم إنشاء مزاد جديد بنجاح');
      if (data?.data?.newAuctionId) {
        router.push(`/auction/${encodeURIComponent(String(data.data.newAuctionId))}`);
      }
    } catch (e) {
      console.error('relist error:', e);
      showNotification('error', e instanceof Error ? e.message : 'فشل في إعادة طرح المزاد');
    }
  };

  // دالة تعديل الإعلان
  const handleEditListing = () => {
    if (router.query.id) {
      router.push(`/edit-listing/${router.query.id}`);
    }
  };

  // دوال التعامل مع البيع المؤكد
  const handleContactBuyer = () => {
    if (confirmedSale) {
      // فتح نافذة التواصل مع المشتري
      showNotification('success', `سيتم فتح نافذة التواصل مع ${confirmedSale.buyerName}`);
      // يمكن إضافة منطق فتح نافذة الدردشة أو الاتصال هنا
    }
  };

  const handleViewPaymentDetails = () => {
    if (confirmedSale && router.query.id) {
      // الانتقال إلى صفحة تفاصيل الدفع
      router.push(`/auction/${router.query.id}/payment-details`);
    }
  };

  const handlePaymentTimeUp = () => {
    showNotification(
      'warning',
      'انتهت مهلة تأكيد الدفع. يرجى التواصل مع المشتري لتأكيد حالة الدفع.',
    );

    // إرسال إشعار انتهاء مهلة الدفع
    if ((window as any).auctionNotifications) {
      (window as any).auctionNotifications.paymentOverdue();
    }
  };

  // معالجة إجراءات الإشعارات
  const _handleNotificationAction = (action: string, data: any) => {
    switch (action) {
      case 'view_sale_details':
        showNotification('success', `عرض تفاصيل البيع للمشتري: ${data.buyerName}`);
        break;
      case 'contact_buyer':
        handleContactBuyer();
        break;
      case 'view_bids':
        showNotification('success', 'عرض قائمة المزايدات');
        break;
      case 'relist_auction':
        showNotification('success', 'إعادة طرح المزاد للبيع');
        break;
      default:
        console.log('إجراء غير معروف:', action, data);
    }
  };

  // دالة مشاركة الإعلان
  const handleShareListing = () => {
    setShowShareModal(true);
  };

  // دالة نسخ الرابط
  const _handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      showNotification('success', 'تم نسخ رابط الإعلان');
    } catch (error) {
      showNotification('error', 'فشل في نسخ الرابط');
    }
  };

  // دالة عرض التقارير
  const handleViewReports = () => {
    if (router.query.id) {
      router.push(`/auction/${router.query.id}/reports`);
    }
  };

  // دالة لجلب بيانات المزاد - محاولة جلب البيانات من API فقط
  const fetchAuctionData = async (auctionId: string, options?: { silent?: boolean }) => {
    try {
      if (!options?.silent) {
        setIsLoading(true);
      }
      const response = await fetch(`/api/auctions/${auctionId}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[فشل] خطأ في الاستجابة:', errorText);

        if (response.status === 404) {
          throw new Error('المزاد غير موجود في قاعدة البيانات');
        } else {
          throw new Error(`خطأ في الخادم (${response.status}): ${errorText}`);
        }
      }

      const data = await response.json();

      if (data.success) {
        // console.log('[API📥] تم استقبال بيانات المزاد:', data.data);
        // console.log('[API🖼️] الصور المستقبلة من car.images:', data.data.car?.images);

        // معالجة حقل الميزات - تحويل من JSON string إلى object
        let processedFeatures: {
          general: string[];
          interior: string[];
          exterior: string[];
          safety: string[];
          technology: string[];
        } = {
          general: [],
          interior: [],
          exterior: [],
          safety: [],
          technology: [],
        };

        try {
          const rawFeatures = data.data.car?.features || data.data.features;
          // console.log('[API🔧] الميزات الخام:', rawFeatures);

          if (rawFeatures && typeof rawFeatures === 'string') {
            const parsedFeatures = JSON.parse(rawFeatures);
            // ✅ معطل: console.log('[API🔧] الميزات المحولة من JSON:', parsedFeatures);

            // معالجة التنسيقات المختلفة للميزات
            if (parsedFeatures && typeof parsedFeatures === 'object') {
              // إذا كان من نوع create-enhanced.ts التنسيق: {features: [], safety: [], comfort: []}
              if (parsedFeatures.features || parsedFeatures.safety || parsedFeatures.comfort) {
                processedFeatures = {
                  general: parsedFeatures.features || [],
                  interior: parsedFeatures.comfort || [],
                  exterior: [],
                  safety: parsedFeatures.safety || [],
                  technology: [],
                };
              }
              // إذا كان منظم بالفعل في فئات
              else if (
                parsedFeatures.general ||
                parsedFeatures.interior ||
                parsedFeatures.exterior ||
                parsedFeatures.safety ||
                parsedFeatures.technology
              ) {
                processedFeatures = {
                  general: parsedFeatures.general || [],
                  interior: parsedFeatures.interior || [],
                  exterior: parsedFeatures.exterior || [],
                  safety: parsedFeatures.safety || [],
                  technology: parsedFeatures.technology || [],
                };
              }
              // إذا كان array مباشر، ضعه في general
              else if (Array.isArray(parsedFeatures)) {
                processedFeatures.general = parsedFeatures;
              }
            }
            // إذا كان array مباشر
            else if (Array.isArray(parsedFeatures)) {
              processedFeatures.general = parsedFeatures;
            }
          }
        } catch (e) {
          console.warn('[API⚠️] خطأ في تحويل الميزات:', e);
        }

        // console.log('[API✅] الميزات النهائية المعالجة:', processedFeatures);

        // معالجة الميزات الإضافية من الحقول المنفصلة
        const additionalFeatures = {
          interior: data.data.car?.interiorFeatures
            ? typeof data.data.car.interiorFeatures === 'string'
              ? data.data.car.interiorFeatures
                  .split(',')
                  .map((f: string) => f.trim())
                  .filter((f: string) => f.length > 0)
              : []
            : [],
          exterior: data.data.car?.exteriorFeatures
            ? typeof data.data.car.exteriorFeatures === 'string'
              ? data.data.car.exteriorFeatures
                  .split(',')
                  .map((f: string) => f.trim())
                  .filter((f: string) => f.length > 0)
              : []
            : [],
          technical: data.data.car?.technicalFeatures
            ? typeof data.data.car.technicalFeatures === 'string'
              ? data.data.car.technicalFeatures
                  .split(',')
                  .map((f: string) => f.trim())
                  .filter((f: string) => f.length > 0)
              : []
            : [],
        };

        // دمج الميزات الإضافية
        if (additionalFeatures.interior.length > 0) {
          processedFeatures.interior = [
            ...(processedFeatures.interior as string[]),
            ...additionalFeatures.interior,
          ];
        }
        if (additionalFeatures.exterior.length > 0) {
          processedFeatures.exterior = [
            ...(processedFeatures.exterior as string[]),
            ...additionalFeatures.exterior,
          ];
        }
        if (additionalFeatures.technical.length > 0) {
          processedFeatures.technology = [
            ...(processedFeatures.technology as string[]),
            ...additionalFeatures.technical,
          ];
        }

        // console.log('[API🔧] الميزات الإضافية من الحقول المنفصلة:', additionalFeatures);
        // console.log('[API✅] الميزات النهائية بعد الدمج:', processedFeatures);

        // فحص البيانات التقنية والقانونية (مُعطل للإنتاج)
        // console.log('[API🔍] فحص البيانات التقنية:', {...});

        // ✅ معطل: فحص البنية الكاملة لبيانات السيارة - يسبب console spam
        // if (process.env.NODE_ENV === 'development') {
        //   console.log('[API🚗] البنية الكاملة لـ data.data.car:', data.data.car);
        //   console.log('[API📋] جميع مفاتيح البيانات:', Object.keys(data.data.car || {}));
        // }

        // ✅ معطل: فحص البيانات في المستوى الأعلى - يسبب console spam
        // if (process.env.NODE_ENV === 'development') {
        //   console.log('[API📊] فحص البيانات في المستوى الأعلى:', {
        //     chassisNumber: data.data.chassisNumber,
        //     engineNumber: data.data.engineNumber,
        //     engineSize: data.data.engineSize,
        //     manufacturingCountry: data.data.manufacturingCountry,
        //     customsStatus: data.data.customsStatus,
        //     licenseStatus: data.data.licenseStatus,
        //   });
        // }

        // معالجة وتنظيف البيانات - استخدام الصور من car.images
        const carImages = data.data.car?.images || [];

        // تطبيع القيم الزمنية لتفادي {} والقيم غير الصالحة
        const normalizedStartTime = (() => {
          const v: any = data.data.startTime as any;
          if (!v) return null;
          if (v instanceof Date) return isNaN(v.getTime()) ? null : v.toISOString();
          if (typeof v === 'object') {
            if (Object.keys(v).length === 0) return null; // {} → null
          }
          if (typeof v === 'number') {
            const d = new Date(v);
            return isNaN(d.getTime()) ? null : d.toISOString();
          }
          if (typeof v === 'string') {
            const t = v.trim();
            return t || null;
          }
          return null;
        })();

        const normalizedEndTime = (() => {
          const v: any = data.data.endTime as any;
          if (!v) return null;
          if (v instanceof Date) return isNaN(v.getTime()) ? null : v.toISOString();
          if (typeof v === 'object') {
            if (Object.keys(v).length === 0) return null; // {} → null
          }
          if (typeof v === 'number') {
            const d = new Date(v);
            return isNaN(d.getTime()) ? null : d.toISOString();
          }
          if (typeof v === 'string') {
            const t = v.trim();
            return t || null;
          }
          return null;
        })();

        const processedData = {
          ...data.data,
          // دمج بيانات السيارة في المستوى الأعلى للتوافق مع الواجهة
          ...data.data.car,
          images: carImages,
          features: processedFeatures,
          // الاحتفاظ بالبيانات الأصلية للمزاد
          id: data.data.id,
          title: data.data.title,
          description: data.data.description,
          startingPrice: data.data.startingPrice,
          currentPrice: data.data.currentPrice,
          startTime: normalizedStartTime,
          endTime: normalizedEndTime,
          status: data.data.status,
          seller: data.data.seller || data.data.car?.seller,
          // تطابق أسماء الحقول مع متطلبات العداد - تبسيط وتوحيد
          auctionStartTime: data.data.auctionStartTime || normalizedStartTime,
          auctionEndTime: data.data.auctionEndTime || normalizedEndTime,
          auctionType: data.data.auctionType || 'live',
          startingBid: data.data.startingBid || data.data.startingPrice,
          currentBid: data.data.currentBid || data.data.currentPrice,
          bidCount: data.data.bidCount || data.data.totalBids || 0,
          // السعر المطلوب يجب أن يأتي من قاعدة البيانات فقط دون fallback
          reservePrice: typeof data.data.reservePrice === 'number' ? data.data.reservePrice : null,
          // ⭐ بيانات الترويج - يجب أن تأتي من المزاد وليس السيارة
          featured: data.data.featured || false,
          promotionPackage: data.data.promotionPackage || null,
          promotionEndDate: data.data.promotionEndDate || null,
        };

        // التأكد من وجود صور صالحة
        if (!processedData.images || processedData.images.length === 0) {
          if (process.env.NODE_ENV === 'development') {
            console.log('[API⚠️] لا توجد صور في البيانات، استخدام صورة افتراضية');
          }
          processedData.images = ['/images/cars/default-car.svg'];
        }

        // ✅ معطل: logs مفصلة - يسبب console spam
        // if (process.env.NODE_ENV === 'development') {
        //   console.log('[API✅] الصور النهائية للعرض:', processedData.images);
        //   console.log('[API🚗] بيانات السيارة المدمجة:', {
        //     brand: processedData.brand,
        //     model: processedData.model,
        //     year: processedData.year,
        //     condition: processedData.condition,
        //   });
        // }
        // ✅ معطل: توضيح بيانات العداد - يسبب console spam
        // if (process.env.NODE_ENV === 'development') {
        //   console.log('[Timer Fix] بيانات العداد الموحدة:', {
        //     auctionStartTime: processedData.auctionStartTime,
        //     auctionEndTime: processedData.auctionEndTime,
        //     auctionType: processedData.auctionType,
        //     startingBid: processedData.startingBid,
        //     currentBid: processedData.currentBid,
        //     bidCount: processedData.bidCount,
        //     status: processedData.status,
        //     originalStartTime: data.data.startTime,
        //     originalEndTime: data.data.endTime,
        //   });
        // }
        // ✅ معطل: فحص البيانات النهائية - يسبب console spam
        // if (process.env.NODE_ENV === 'development') {
        //   console.log('[API📊] processedData النهائية:', {
        //     chassisNumber: processedData.chassisNumber,
        //     engineNumber: processedData.engineNumber,
        //     engineSize: processedData.engineSize,
        //     manufacturingCountry: processedData.manufacturingCountry,
        //     customsStatus: processedData.customsStatus,
        //     licenseStatus: processedData.licenseStatus,
        //     interiorColor: processedData.interiorColor,
        //     seatCount: processedData.seatCount,
        //     regionalSpecs: processedData.regionalSpecs,
        //     features: processedData.features,
        //   });
        // }

        // إتاحة البيانات للتشخيص في المتصفح
        (window as Record<string, unknown>).rawApiData = data.data;
        (window as Record<string, unknown>).processedCarData = processedData;

        // console.log('[API🧪] يمكنك الآن في المتصفح كتابة:');
        // console.log('- window.rawApiData للبيانات الخام من API');
        // console.log('- window.processedCarData للبيانات المعالجة');
        // console.log('- Object.keys(window.rawApiData.car) لرؤية جميع الحقول المتاحة');

        setCarData(processedData);
        setError(null);

        // تتبع مشاهدة المزاد
        trackAuctionView(auctionId, {
          title: data.data.title,
          status: data.data.status || currentAuctionStatus,
          currentPrice: data.data.currentBid,
          // startingBid: data.data.startingBid, // معطل لحل مشاكل type
          // endTime: data.data.auctionEndTime,
        });

        // جلب المزايدات بعد جلب بيانات المزاد (مصدر موحد)
        await refetchBidders();
      } else {
        throw new Error(data.error || 'خطأ في جلب البيانات');
      }
    } catch (error) {
      console.error('خطأ في جلب بيانات المزاد:', error);

      let errorMessage = 'حدث خطأ في تحميل بيانات المزاد';
      if (error instanceof Error) {
        if (error.message.includes('غير موجود')) {
          errorMessage = 'المزاد غير موجود. قد يكون تم حذفه أو انتهت صلاحيته.';
        } else if (error.message.includes('404')) {
          errorMessage = 'المزاد غير موجود في قاعدة البيانات';
        } else {
          errorMessage = error.message;
        }
      }

      if (!options?.silent) {
        setError(errorMessage);
        setCarData(null);
      } else {
        // في التحديثات الخلفية الصامتة لا نقوم بكسر الواجهة إن حدث خطأ
        console.warn('[Silent Refresh] فشل تحديث بيانات المزاد في الخلفية:', errorMessage);
      }

      // إعادة توجيه إلى الصفحة المناسبة إذا كان المزاد غير موجود
      if (error instanceof Error && error.message.includes('غير موجود')) {
        setTimeout(async () => {
          // محاولة التحقق من وجود السيارة في marketplace
          try {
            const carCheckResponse = await fetch(`/api/cars/${auctionId}`);
            if (carCheckResponse.ok) {
              // السيارة موجودة كإعلان عادي، توجيه إلى marketplace
              router.push(`/marketplace/${auctionId}`);
            } else {
              // السيارة غير موجودة أيضاً، توجيه إلى صفحة المزادات
              router.push('/auctions');
            }
          } catch {
            // في حالة الخطأ، توجيه إلى صفحة المزادات
            router.push('/auctions');
          }
        }, 2000); // انتظار 2 ثوان لإظهار الرسالة
      }
    } finally {
      if (!options?.silent) {
        setIsLoading(false);
      }
    }
  };

  // دالة موحدة لتحديد حالة المزاد بناءً على التوقيت وحالة قاعدة البيانات
  const getAuctionStatus = () => {
    try {
      // استخدام الدالة المركزية لضمان التطابق بين جميع الأجزاء
      return resolveAuctionStatus(carData || {});
    } catch {
      // في حال حدوث خطأ أو عدم توفر البيانات نرجع الحالة الافتراضية
      return 'live';
    }
  };

  // جميع الـ useEffect hooks
  // تحميل بيانات المستخدم - تم نقل هذا المنطق إلى useAuthProtection hook

  // تحديث بيانات السيارة عند تغيير المعرف
  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchAuctionData(id);
    }
  }, [id]);

  // تحديث حالة المزاد عند تغيير بيانات السيارة
  useEffect(() => {
    if (carData && carData.auctionType) {
      const validStatuses: ('upcoming' | 'live' | 'ended' | 'sold')[] = [
        'upcoming',
        'live',
        'ended',
        'sold',
      ];
      if (validStatuses.includes(carData.auctionType)) {
        setCurrentAuctionStatus((prevStatus) => {
          // 🔒 حماية: لا تجاوز حالة 'sold' أبداً
          if (prevStatus === 'sold') {
            console.log('[🔒 Status Protection] منع تجاوز حالة sold');
            return prevStatus;
          }
          // 🔍 فحص إضافي: إذا كان المزاد SOLD في DB، اجعل الحالة 'sold'
          if (String(carData.status).toUpperCase() === 'SOLD') {
            console.log('[✅ DB Status] المزاد مباع في DB - ضبط الحالة إلى sold');
            return 'sold';
          }
          return carData.auctionType;
        });
      }
    }
  }, [carData]);

  // إعادة تعيين فهرس الصورة عند تغيير الصور
  useEffect(() => {
    if (carData && carData.images && Array.isArray(carData.images)) {
      // التأكد من أن الفهرس الحالي لا يتجاوز عدد الصور المتاحة
      if (activeImageIndex >= carData.images.length) {
        setActiveImageIndex(0);
      }
    }
  }, [carData?.images, activeImageIndex]);

  // تحديث حالة المزاد كل ثانية
  useEffect(() => {
    const updateStatus = () => {
      const status = getAuctionStatus();
      // ✅ عدم تجاوز حالة 'sold' مرة واحدة تم تعيينها
      setCurrentAuctionStatus((prevStatus) => {
        if (prevStatus === 'sold') return prevStatus;
        return status;
      });
    };

    updateStatus(); // تحديث فوري
    const interval = setInterval(updateStatus, 1000); // تحديث كل ثانية

    return () => clearInterval(interval);
  }, [carData?.auctionStartTime, carData?.auctionEndTime, carData?.auctionType, carData?.status]);

  // تحديث السعر/عدد المزايدات/الحالة من live-data كل 15 ثانية
  useEffect(() => {
    if (!carData?.id) return;
    const data = getAuctionData(carData.id);
    if (!data) return;

    // تحديث السعر وعدد المزايدات عند تغيّرها
    setCarData((prev: any) => {
      if (!prev) return prev;
      const next = { ...prev } as any;
      if (typeof data.currentBid !== 'undefined' && data.currentBid !== prev.currentBid) {
        next.currentBid = data.currentBid;
      }
      if (typeof data.bidCount === 'number' && data.bidCount !== prev.bidCount) {
        next.bidCount = data.bidCount;
      }
      return next;
    });

    // تحديث حالة المزاد من live-data مع احترام حالة البيع
    setCurrentAuctionStatus((prev) => {
      if (prev === 'sold') return prev;
      if (data.auctionType === 'ended') return 'ended';
      if (data.auctionType === 'live') return 'live';
      if (data.auctionType === 'upcoming') return 'upcoming';
      return prev;
    });
  }, [carData?.id, getAuctionData, lastUpdate]);

  // تحديث بيانات المزاد دورياً (كل 30 ثانية)
  useEffect(() => {
    if (!id || typeof id !== 'string') return;

    const updateAuctionData = async () => {
      try {
        // تحديث حالة المزادات في الخادم أولاً
        await fetch('/api/auctions/force-update', { method: 'POST' });

        // ثم جلب البيانات المحدثة
        await fetchAuctionData(id, { silent: true });
      } catch (error) {
        console.error('خطأ في تحديث بيانات المزاد:', error);
      }
    };

    // تحديث كل 30 ثانية
    const interval = setInterval(updateAuctionData, 30000);

    return () => clearInterval(interval);
  }, [id]);

  // تحديث بيانات المزايدات التجريبية
  useEffect(() => {
    setBidHistory(sampleBidHistory);
  }, []);

  // إضافة بيانات تجريبية شاملة لعرض جميع الكماليات والمواصفات للمستخدم
  useEffect(() => {
    if (carData && typeof window !== 'undefined' && window.location.search.includes('demo=full')) {
      console.log('[عرض تجريبي] تفعيل البيانات التجريبية الشاملة');

      const enhancedCarData = {
        ...carData,
        // بيانات أساسية محسنة
        title: 'مرسيدس E350 - 2023 فل كامل وارد الخليج',
        description:
          'سيارة مرسيدس E350 موديل 2023، وارد الخليج، حالة ممتازة، فل كامل، صبغ الوكالة، عداد 25,000 كم فقط. السيارة في حالة الوكالة، تم عمل صيانة دورية في الوكالة المعتمدة. جميع الكماليات تعمل بشكل ممتاز. السيارة لم تتعرض لأي حوادث أو أضرار. ',
        brand: 'مرسيدس',
        model: 'E350',
        year: 2023,
        condition: 'NEW',
        mileage: '25000',
        price: '185000',

        // مواصفات شاملة
        engineSize: '3.0',
        fuelType: 'PETROL',
        transmission: 'AUTOMATIC',
        bodyType: 'SEDAN',
        exteriorColor: 'BLACK',
        interiorColor: 'BEIGE',
        seatCount: 5,
        regionalSpecs: 'GCC',
        manufacturingCountry: 'ألمانيا',
        customsStatus: 'مخلص جمركياً',
        licenseStatus: 'ساري المفعول',
        insuranceStatus: 'تأمين شامل',
        chassisNumber: 'WDD2130421A123456',
        engineNumber: 'M276.123456',

        // موقع السيارة
        location: 'طرابلس، ليبيا',
        locationAddress: 'شارع الجمهورية، منطقة الدهماني، طرابلس',
        locationLat: 32.8872,
        locationLng: 13.1913,

        // تقرير الفحص
        hasInspectionReport: true,
        hasManualInspectionReport: true,
        inspectionReportFileUrl: '/reports/inspection-sample.pdf',
        manualInspectionData: {
          overallRating: 'ممتاز',
          engineCondition: 'ممتاز',
          bodyCondition: 'ممتاز',
          interiorCondition: 'ممتاز',
          tiresCondition: 'جيد جداً',
          electricalCondition: 'ممتاز',
          notes:
            'السيارة في حالة ممتازة، جميع الأنظمة تعمل بكفاءة عالية. تم فحص المحرك والناقل والفرامل وجميعها في حالة مثالية. الإطارات حالة جيدة جداً مع تآكل طبيعي. النظام الكهربائي يعمل بشكل مثالي. لا توجد أي مشاكل أو عيوب.',
        },

        // جميع الكماليات والمميزات
        features: {
          general: [
            'مكيف هواء أوتوماتيك متعدد المناطق',
            'مثبت السرعة التكيفي',
            'عجلة القيادة الجلدية المدفأة',
            'مقود كهربائي قابل للتعديل',
            'فتحة سقف بانوراما',
            'نظام الدخول بدون مفتاح',
            'زر التشغيل بصمة',
            'مرايا جانبية قابلة للطي كهربائياً',
            'إضاءة LED داخلية وخارجية',
            'نظام إنذار متقدم',
          ],
          interior: [
            'مقاعد جلدية فاخرة',
            'مقاعد أمامية مدفأة ومبردة',
            'مقاعد كهربائية مع ذاكرة الوضعية',
            'نوافذ كهربائية مع خاصية الرفع التلقائي',
            'مرايا داخلية مضادة للوهج',
            'إضاءة محيطة ملونة',
            'لوحة عدادات رقمية',
            'شاشة معلومات ترفيهية 12.3 بوصة',
            'نظام صوتي Burmester عالي الجودة',
            'منافذ USB متعددة وشحن لاسلكي',
          ],
          exterior: [
            'مصابيح LED الأمامية الذكية',
            'مصابيح LED الخلفية',
            'عجلات ألمنيوم 19 بوصة',
            'مزودة بحساسات المطر',
            'حساسات الإضاءة التلقائية',
            'جنوط AMG الرياضية',
            'باب خلفي كهربائي',
            'زجاج عازل للحرارة والصوت',
            'مساحات زجاج أمامي أوتوماتيكية',
            'إضاءة ترحيبية على الأرض',
          ],
          safety: [
            'نظام الفرامل المانعة للانغلاق ABS',
            'نظام التحكم في الثبات ESP',
            'نظام مراقبة النقطة العمياء',
            'نظام التحذير من مغادرة المسار',
            'نظام الفرملة التلقائية عند الطوارئ',
            'وسائد هوائية متعددة',
            'نظام مراقبة ضغط الإطارات',
            'كاميرا خلفية عالية الدقة',
            'حساسات ركن أمامية وخلفية',
            'نظام الإنذار ضد السرقة',
          ],
          technology: [
            'نظام الملاحة GPS المدمج',
            'شاشة تعمل باللمس مع Apple CarPlay',
            'نظام Android Auto',
            'اتصال Bluetooth متقدم',
            'نظام التحكم الصوتي الذكي',
            'تطبيق Mercedes me connect',
            'نقطة اتصال WiFi مدمجة',
            'نظام التحديث عبر الهواء',
            'شاشة عرض المعلومات على الزجاج الأمامي',
            'نظام المساعد الذكي MBUX',
          ],
        },
      };

      setCarData(enhancedCarData);
      console.log('[عرض تجريبي] تم تحميل البيانات الشاملة:', enhancedCarData.features);
    }
  }, [carData]);

  // تحميل أدوات التشخيص في وضع التطوير
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // إتاحة البيانات للتشخيص
      (window as any).carData = carData;
      (window as any).currentUser = user;
      (window as any).isOwnerCheck = function () {
        try {
          const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
          const uid = String((savedUser && savedUser.id) || (user && user.id) || '').trim();
          const sid = String((carData && carData.sellerId) || '').trim();
          return uid && sid && uid === sid;
        } catch (e) {
          console.error('خطأ في window.isOwnerCheck:', e);
          return false;
        }
      };

      // معطل لتقليل console spam - أدوات التشخيص متاحة دائماً في window
      // console.log('الأدوات أدوات التشخيص متاحة:');
      // console.log('- window.carData: بيانات المزاد');
      // console.log('- window.currentUser: المستخدم الحالي');
      // console.log('- window.isOwnerCheck(): فحص صاحب الإعلان');
      // console.log('- debugAuction.fullDiagnosis("' + id + '"): تشخيص شامل');
    }
  }, [carData, user, id]);

  // استخدام custom hook
  const { isElementVisible, isElementInteractive } = usePageElements('auction-detail');

  // دالة إعادة فحص المصادقة - تم نقل هذا المنطق إلى useAuthProtection hook

  // دالة التعامل مع النقر على زر الدردشة
  const handleChatClick = () => {
    if (carData?.sellerId) {
      handleMessageBidder(
        String(carData.sellerId),
        quickDecodeName((carData?.seller as any)?.name || carData.yardName || 'البائع'),
      );
    }
  };

  // دالة التعامل مع النقر على زر الاتصال
  const handleCallClick = () => {
    requireLogin('للاتصال بالبائع', () => {
      try {
        const phoneCandidate =
          (carData && (carData as any).sellerPhone) || (carData && (carData as any).phone) || '';
        if (phoneCandidate && String(phoneCandidate).trim()) {
          handlePhoneClickUnified({ phone: String(phoneCandidate) });
        } else {
          router.push('/messages');
        }
      } catch {
        router.push('/messages');
      }
    });
  };

  // تم إزالة spinner التحميل - UnifiedPageTransition يتولى ذلك
  if (isLoading) return null;

  // عرض حالة الخطأ
  if (error && !carData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50" dir="rtl">
        <div className="mx-auto max-w-md p-6 text-center">
          <div className="mb-4 text-6xl text-red-500">[تحذير]</div>
          <h2 className="mb-2 text-2xl font-bold text-gray-800">خطأ في تحميل المزاد</h2>
          <p className="mb-4 text-gray-600">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
            >
              إعادة المحاولة
            </button>
            <button
              onClick={() => window.history.back()}
              className="w-full rounded-lg bg-gray-600 px-6 py-2 text-white transition-colors hover:bg-gray-700"
            >
              العودة للخلف
            </button>
            <Link
              href="/auctions"
              className="block w-full rounded-lg bg-green-600 px-6 py-2 text-center text-white transition-colors hover:bg-green-700"
            >
              عرض جميع المزادات
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // التأكد من وجود البيانات
  if (!carData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50" dir="rtl">
        <div className="text-center">
          <TruckIcon className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <h2 className="mb-2 text-2xl font-bold text-gray-800">المزاد غير موجود</h2>
          <p className="text-gray-600">لم يتم العثور على المزاد المطلوب</p>
        </div>
      </div>
    );
  }

  // دالة مساعدة للتعامل مع الصور بشكل آمن
  const getValidImageUrl = (images: any[], index: number): string => {
    if (!images || !Array.isArray(images) || images.length === 0) {
      console.log('[واجهة🖼️] لا توجد صور، استخدام الافتراضي');
      return '/images/cars/default-car.svg';
    }

    // التحقق من الصورة في الفهرس المحدد
    if (index >= 0 && index < images.length) {
      const image = images[index];

      if (image && typeof image === 'string' && image.trim() !== '') {
        // قبول الصور الحقيقية فقط - منع صور Unsplash الوهمية
        if (
          image.startsWith('/images/cars/listings/') ||
          image.startsWith('/images/cars/default-car.svg') ||
          image.startsWith('/uploads/admin-auctions/') ||
          image.startsWith('/uploads/cars/') ||
          (image.startsWith('http') &&
            !image.includes('unsplash.com') &&
            !image.includes('placeholder'))
        ) {
          return image;
        }
      }
    }

    // البحث عن أول صورة صالحة
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      if (image && typeof image === 'string' && image.trim() !== '') {
        // قبول الصور الحقيقية فقط - منع صور Unsplash الوهمية
        if (
          image.startsWith('/images/cars/listings/') ||
          image.startsWith('/images/cars/default-car.svg') ||
          image.startsWith('/uploads/admin-auctions/') ||
          image.startsWith('/uploads/cars/') ||
          (image.startsWith('http') &&
            !image.includes('unsplash.com') &&
            !image.includes('placeholder'))
        ) {
          return image;
        }
      }
    }

    console.log('[واجهة⚠️] لم توجد صور صالحة، استخدام الافتراضي');
    return '/images/cars/default-car.svg';
  };

  const showNotification = (type: 'success' | 'error' | 'warning', message: string) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 5000);
  };

  const handleBidSubmit = async () => {
    console.log('بدء handleBidSubmit - فحص المزايدة:', {
      userId: user?.id,
      sellerId: carData?.sellerId,
      isOwner: user?.id === carData?.sellerId,
      userIdType: typeof user?.id,
      sellerIdType: typeof carData?.sellerId,
    });

    if (!user) {
      console.log('[فشل] لا يوجد مستخدم مسجل');
      showNotification('error', 'يجب تسجيل الدخول أولاً للمشاركة في المزاد');
      setShowBidModal(false);
      router.push('/?redirect=' + encodeURIComponent(router.asPath));
      return;
    }

    // التحقق من أن المستخدم ليس صاحب الإعلان (فحص متعدد الطبقات)
    const ownerCheck = isCurrentUserOwner;

    // فحص إضافي مباشر
    const directOwnerCheck =
      user?.id && carData?.sellerId && String(user.id).trim() === String(carData.sellerId).trim();

    // فحص من localStorage
    let localStorageOwnerCheck = false;
    try {
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorageOwnerCheck =
        savedUser.id &&
        carData?.sellerId &&
        String(savedUser.id).trim() === String(carData.sellerId).trim();
    } catch (error) {
      console.error('خطأ في فحص localStorage في handleBidSubmit:', error);
    }

    const finalOwnerCheck = ownerCheck || directOwnerCheck || localStorageOwnerCheck;

    console.log('نتيجة فحص الملكية في handleBidSubmit (متعدد الطبقات):', {
      ownerCheck,
      directOwnerCheck,
      localStorageOwnerCheck,
      finalOwnerCheck,
    });

    if (finalOwnerCheck) {
      console.error('منع المزايدة: المستخدم هو صاحب الإعلان!');
      showNotification('error', 'لا يمكن لصاحب الإعلان المزايدة على إعلانه الخاص');
      setShowBidModal(false);
      return;
    }

    console.log('[تم بنجاح] المستخدم ليس صاحب الإعلان، يمكن المتابعة بالمزايدة');

    if (!bidIncrease || bidIncrease.trim() === '') {
      showNotification('warning', 'يرجى إدخال مبلغ الزيادة');
      return;
    }

    const increaseAmount = parseInt(bidIncrease.replace(/[,\s]/g, ''));
    const currentBidAmount = parseNumericValue(carData.currentBid || carData.startingBid);
    const minimumIncrement = calculateMinimumBid(currentBidAmount.toString());

    if (isNaN(increaseAmount) || increaseAmount <= 0) {
      showNotification('error', 'يرجى إدخال مبلغ زيادة صحيح');
      return;
    }

    if (increaseAmount <= minimumIncrement) {
      showNotification(
        'warning',
        `الحد الأدنى للزيادة هو ${formatNumber(minimumIncrement.toString())} د.ل`,
      );
      return;
    }

    const maxIncrement = currentBidAmount * 2;
    if (increaseAmount > maxIncrement) {
      showNotification(
        'warning',
        `مبلغ الزيادة مرتفع جداً. الحد الأقصى المقترح: ${formatNumber(maxIncrement.toString())} د.ل`,
      );
      return;
    }

    const newTotalAmount = currentBidAmount + increaseAmount;

    setIsSubmittingBid(true);

    try {
      console.log('[البحث] إرسال المزايدة إلى API:', {
        auctionId: router.query.id,
        userId: user?.id,
        amount: newTotalAmount,
      });

      // إرسال المزايدة إلى API
      const response = await fetch(`/api/auctions/${router.query.id}/bid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          amount: newTotalAmount,
        }),
      });

      let result = await response.json();

      if (!response.ok) {
        // معالجة الحالات الخاصة من الخادم
        if (result?.error === 'HIGH_BID_CONFIRMATION_REQUIRED' || result?.requiredConfirm) {
          const msg =
            typeof result?.message === 'string' && result.message
              ? result.message
              : `المبلغ المدخل مرتفع مقارنة بالسعر الحالي.\n\nالمبلغ: ${formatNumber(newTotalAmount.toString())} د.ل\nالحد الأدنى المقترح: ${formatNumber(String(result?.recommendedMin || 0))} د.ل\nالزيادة الدنيا: ${formatNumber(String(result?.minIncrement || 0))} د.ل\n\nهل تريد المتابعة وتأكيد المزايدة؟`;
          const confirmed = await confirmWithModal(msg);
          if (!confirmed) {
            showNotification('warning', 'تم إلغاء العملية من قبل المستخدم');
            setIsSubmittingBid(false);
            return;
          }

          // إعادة الإرسال مع confirmHighBid=true
          const retryRes = await fetch(`/api/auctions/${router.query.id}/bid`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user?.id,
              amount: newTotalAmount,
              confirmHighBid: true,
            }),
          });
          const retryResult = await retryRes.json();
          if (!retryRes.ok) {
            throw new Error(retryResult?.message || 'فشل في تسجيل المزايدة بعد التأكيد');
          }
          // استخدام نتيجة المحاولة الثانية لباقي التدفق
          result = retryResult;
          console.log('[تم بنجاح] تم تسجيل المزايدة بعد التأكيد:', retryResult);
        } else if (result?.error === 'BID_TOO_LOW' || typeof result?.message === 'string') {
          // عرض رسالة الخادم للمستخدم ثم إيقاف التنفيذ
          showNotification('warning', result.message || 'المزايدة أقل من الحد الأدنى المسموح');
          setIsSubmittingBid(false);
          return;
        } else {
          throw new Error(result?.message || 'فشل في تسجيل المزايدة');
        }
      }

      console.log('[تم بنجاح] تم تسجيل المزايدة بنجاح:', result);

      const newBid = {
        id: result.data?.bidId || bidHistory.length + 1,
        bidder: user?.name || 'أنت',
        amount: formatNumber(newTotalAmount.toString()),
        time: 'الآن',
        isWinning: true,
      };

      // تحديث تاريخ المزايدات
      setBidHistory([newBid, ...bidHistory.map((bid) => ({ ...bid, isWinning: false }))]);

      // تحديث بيانات السيارة الرئيسية مع تأثير بصري
      setIsCurrentBidAnimating(true);
      setCarData((prevData) => ({
        ...prevData,
        currentBid: formatNumber(newTotalAmount.toString()),
        bidCount: prevData.bidCount + 1,
      }));

      // إيقاف التأثير البصري بعد ثانيتين
      setTimeout(() => {
        setIsCurrentBidAnimating(false);
      }, 2000);

      // تحديث قائمة المزايدين
      const newBidder = {
        id: Date.now(),
        name: user?.name || 'أنت',
        amount: formatNumber(newTotalAmount.toString()),
        timestamp: new Date(),
        isWinning: true,
        isVerified: true,
        avatar:
          user?.image ||
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
        bidRank: 1,
        timeAgo: 'الآن',
      };

      // تحديث قائمة المزايدين مع إضافة المزايد الجديد في المقدمة
      setSampleBidders((prevBidders) => [
        newBidder,
        ...prevBidders.map((bidder, index) => ({
          ...bidder,
          isWinning: false,
          bidRank: index + 2,
        })),
      ]);

      setBidIncrease('');
      setShowBidModal(false);

      // إعادة جلب المزايدات الحقيقية لضمان التحديث
      if (router.query.id) {
        await fetchRealBidders(router.query.id as string);
      }

      showNotification(
        'success',
        `تم تسجيل مزايدتك بنجاح! زدت ${formatNumber(increaseAmount.toString())} د.ل لتصبح مزايدتك ${formatNumber(newTotalAmount.toString())} د.ل`,
      );

      // إشعار صوتي بسيط (اختياري)
      try {
        const audio = new Audio(
          'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
        );
        audio.volume = 0.3;
        audio.play().catch(() => {}); // تجاهل الأخطاء إذا لم يُسمح بالصوت
      } catch (error) {
        // تجاهل أخطاء الصوت
      }
    } catch (error) {
      showNotification('error', 'حدث خطأ أثناء تسجيل المزايدة. يرجى المحاولة مرة أخرى');
    } finally {
      setIsSubmittingBid(false);
    }
  };

  // دالة المزايدة السريعة
  const handleQuickBid = async (newTotalAmount: number) => {
    console.log('بدء handleQuickBid - فحص المزايدة السريعة:', {
      userId: user?.id,
      sellerId: carData?.sellerId,
      newTotalAmount,
      isOwner: user?.id === carData?.sellerId,
    });

    if (!user) {
      console.log('[فشل] لا يوجد مستخدم مسجل');
      showNotification('error', 'يجب تسجيل الدخول أولاً للمشاركة في المزاد');
      router.push('/?redirect=' + encodeURIComponent(router.asPath));
      return;
    }

    // التحقق من أن المستخدم ليس صاحب الإعلان
    const ownerCheck = isCurrentUserOwner;
    const directOwnerCheck =
      user?.id && carData?.sellerId && String(user.id).trim() === String(carData.sellerId).trim();

    let localStorageOwnerCheck = false;
    try {
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorageOwnerCheck =
        savedUser.id &&
        carData?.sellerId &&
        String(savedUser.id).trim() === String(carData.sellerId).trim();
    } catch (error) {
      console.error('خطأ في فحص localStorage في handleQuickBid:', error);
    }

    const finalOwnerCheck = ownerCheck || directOwnerCheck || localStorageOwnerCheck;

    if (finalOwnerCheck) {
      console.error('منع المزايدة السريعة: المستخدم هو صاحب الإعلان!');
      showNotification('error', 'لا يمكن لصاحب الإعلان المزايدة على إعلانه الخاص');
      return;
    }

    const currentBidAmount = parseNumericValue(carData.currentBid || carData.startingBid);
    const increaseAmount = newTotalAmount - currentBidAmount;
    const minimumIncrement = calculateMinimumBid(currentBidAmount.toString());

    if (increaseAmount <= minimumIncrement) {
      showNotification(
        'warning',
        `الحد الأدنى للزيادة هو ${formatNumber(minimumIncrement.toString())} د.ل`,
      );
      return;
    }

    setIsSubmittingBid(true);

    try {
      console.log('[البحث] إرسال المزايدة السريعة إلى API:', {
        auctionId: router.query.id,
        userId: user?.id,
        amount: newTotalAmount,
      });

      const response = await fetch(`/api/auctions/${router.query.id}/bid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          amount: newTotalAmount,
        }),
      });

      let result = await response.json();

      if (!response.ok) {
        // معالجة حالة التأكيد الإجباري للمبالغ المرتفعة
        if (result?.error === 'HIGH_BID_CONFIRMATION_REQUIRED' || result?.requiredConfirm) {
          const msg =
            typeof result?.message === 'string' && result.message
              ? result.message
              : `المبلغ المدخل مرتفع مقارنة بالسعر الحالي.\n\nالمبلغ: ${formatNumber(newTotalAmount.toString())} د.ل\nالحد الأدنى المقترح: ${formatNumber(String(result?.recommendedMin || 0))} د.ل\nالزيادة الدنيا: ${formatNumber(String(result?.minIncrement || 0))} د.ل\n\nهل تريد المتابعة وتأكيد المزايدة؟`;
          const confirmed = await confirmWithModal(msg);
          if (!confirmed) {
            showNotification('warning', 'تم إلغاء العملية من قبل المستخدم');
            setIsSubmittingBid(false);
            return;
          }

          const retryRes = await fetch(`/api/auctions/${router.query.id}/bid`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user?.id,
              amount: newTotalAmount,
              confirmHighBid: true,
            }),
          });
          const retryResult = await retryRes.json();
          if (!retryRes.ok) {
            throw new Error(retryResult?.message || 'فشل في تسجيل المزايدة بعد التأكيد');
          }
          result = retryResult;
          console.log('[تم بنجاح] تم تسجيل المزايدة السريعة بعد التأكيد:', retryResult);
        } else if (result?.error === 'BID_TOO_LOW' || typeof result?.message === 'string') {
          showNotification('warning', result.message || 'المزايدة أقل من الحد الأدنى المسموح');
          setIsSubmittingBid(false);
          return;
        } else {
          throw new Error(result?.message || 'فشل في تسجيل المزايدة');
        }
      }

      console.log('[تم بنجاح] تم تسجيل المزايدة السريعة بنجاح:', result);

      const newBid = {
        id: result.data?.bidId || Date.now(),
        bidder: user?.name || 'أنت',
        amount: formatNumber(newTotalAmount.toString()),
        time: 'الآن',
        isWinning: true,
      };

      // تحديث تاريخ المزايدات
      setBidHistory([newBid, ...bidHistory.map((bid) => ({ ...bid, isWinning: false }))]);

      // تحديث بيانات السيارة مع تأثير بصري
      setIsCurrentBidAnimating(true);
      setCarData((prevData) => ({
        ...prevData,
        currentBid: formatNumber(newTotalAmount.toString()),
        bidCount: prevData.bidCount + 1,
      }));

      setTimeout(() => {
        setIsCurrentBidAnimating(false);
      }, 2000);

      // تحديث قائمة المزايدين
      const newBidder = {
        id: Date.now(),
        name: user?.name || 'أنت',
        amount: formatNumber(newTotalAmount.toString()),
        timestamp: new Date(),
        isWinning: true,
        isVerified: true,
        avatar:
          user?.image ||
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
        bidRank: 1,
        timeAgo: 'الآن',
      };

      setSampleBidders((prevBidders) => [
        newBidder,
        ...prevBidders.map((bidder, index) => ({
          ...bidder,
          isWinning: false,
          bidRank: index + 2,
        })),
      ]);

      // إعادة جلب المزايدات الحقيقية
      if (router.query.id) {
        await fetchRealBidders(router.query.id as string);
      }

      showNotification(
        'success',
        `مزايدة سريعة بنجاح! زدت ${formatNumber(increaseAmount.toString())} د.ل لتصبح مزايدتك ${formatNumber(newTotalAmount.toString())} د.ل`,
      );

      // إشعار صوتي
      try {
        const audio = new Audio(
          'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
        );
        audio.volume = 0.3;
        audio.play().catch(() => {});
      } catch (error) {
        // تجاهل أخطاء الصوت
      }
    } catch (error) {
      showNotification('error', 'حدث خطأ أثناء تسجيل المزايدة السريعة. يرجى المحاولة مرة أخرى');
    } finally {
      setIsSubmittingBid(false);
    }
  };

  // استخدام دالة formatNumber من utils/numberUtils.ts - تم نقلها لأعلى لتجنب خطأ التعريف
  // مع تثبيت الأرقام الإنجليزية
  const formatNumber = (num: string | number | null | undefined) => {
    if (!num && num !== 0) return '0';

    // تحويل إلى رقم أولاً
    const numericValue = typeof num === 'string' ? parseFloat(num.replace(/,/g, '')) : num;

    if (isNaN(numericValue)) return '0';

    // استخدام en-US لضمان الأرقام الإنجليزية
    return Math.floor(numericValue).toLocaleString('en-US');
  };

  // دالة مساعدة لتحويل القيم إلى أرقام
  const parseNumericValue = (value: string | number | null | undefined): number => {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    if (typeof value === 'string') {
      const cleaned = value.replace(/[,\s]/g, '');
      const parsed = parseInt(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  return (
    <div>
      <Head>
        <title>{carData?.title || 'سيارة للبيع'} - سوق المزاد</title>
        <meta
          name="description"
          content={`${carData?.title || 'سيارة للبيع'} - ينتهي قريباً. المزايدة الحالية: ${carData?.currentBid || '0'} دينار ليبي`}
        />
      </Head>

      <div className="min-h-screen bg-gray-50" dir="rtl">
        <OpensooqNavbar />

        {/* نظام إشعارات المزاد معطل مؤقتاً لحين توفير المكون */}

        {notification.show && (
          <div className="fixed right-4 top-4 z-50 max-w-sm">
            <div
              className={`rounded-lg border-r-4 p-4 shadow-lg ${
                notification.type === 'success'
                  ? 'border-green-400 bg-green-50 text-green-800'
                  : notification.type === 'error'
                    ? 'border-red-400 bg-red-50 text-red-800'
                    : 'border-yellow-400 bg-yellow-50 text-yellow-800'
              }`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {notification.type === 'success' && (
                    <CheckCircleIcon className="h-5 w-5 text-green-400" />
                  )}
                  {notification.type === 'error' && <XMarkIcon className="h-5 w-5 text-red-400" />}
                  {notification.type === 'warning' && (
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                  )}
                </div>
                <div className="mr-3 flex-1">
                  <p className="text-sm font-medium">{notification.message}</p>
                </div>
                <button
                  onClick={() => setNotification({ show: false, type: '', message: '' })}
                  className="mr-2 flex-shrink-0"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mx-auto max-w-7xl px-4 py-6">
          <nav className="mb-0 flex items-center whitespace-nowrap text-sm leading-tight">
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              الرئيسية
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <Link href="/auctions" className="text-blue-600 hover:text-blue-800">
              المزادات
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <span className="text-gray-700">
              {(() => {
                const brand = carData?.brand || carData?.car?.brand || '';
                const model = carData?.model || carData?.car?.model || '';
                const title = carData?.title || '';

                if (title && title.trim()) {
                  return title;
                } else if (brand && model) {
                  return `${brand} ${model}`;
                } else if (brand) {
                  return brand;
                } else {
                  return 'تفاصيل السيارة';
                }
              })()}
            </span>
          </nav>

          {/* التخطيط المتجاوب - شاشات كبيرة: 3 أعمدة، شاشات متوسطة والصغيرة: عمود واحد */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* العمود الأيسر - المحتوى الرئيسي */}
            <div className="space-y-6 lg:col-span-2">
              {/* قسم العداد والمزايدين - يظهر في الأعلى للشاشات الصغيرة فقط */}
              <div className="mobile-auction-controls block lg:hidden">
                {/* العداد وقائمة المزايدين - إزالة الإعدادات المتجاوبة للشاشات الصغيرة */}
                <div className="mobile-auction-grid grid grid-cols-1 gap-2">
                  {/* عداد المزايدة - إزالة التحويل والتصغير */}
                  {isElementVisible('auction_timer') && isElementVisible('bidding_section') && (
                    <div className="mobile-auction-timer-container relative flex h-full flex-col rounded-lg bg-white shadow-sm">
                      {/* شارة إعلان مميز - موحدة */}
                      {(carData?.featured ||
                        (carData?.promotionPackage && carData.promotionPackage !== 'free')) && (
                        <div className="absolute left-3 top-3 z-10">
                          <SmartFeaturedBadge
                            featured={carData?.featured}
                            packageType={carData?.promotionPackage}
                            size="sm"
                            showText={true}
                          />
                        </div>
                      )}
                      <div className="px-3 py-5">
                        <div className="mb-2 flex items-center justify-center">
                          {/* العداد الموحد لجميع حالات المزاد */}
                          {(() => {
                            const currentBidToPass =
                              currentAuctionStatus === 'upcoming'
                                ? carData.startingBid
                                : currentAuctionStatus === 'ended' ||
                                    currentAuctionStatus === 'sold'
                                  ? carData.finalBid || carData.currentBid
                                  : carData.currentBid;

                            // 🔍 تتبع props العداد (معطل لتقليل console spam)
                            // console.log('[🎯 Timer Props]', {
                            //   currentAuctionStatus,
                            //   'carData.status': carData.status,
                            //   'carData.auctionType': carData.auctionType,
                            //   auctionEndTime: carData.auctionEndTime
                            // });

                            return (
                              <SimpleCircularAuctionTimer
                                endTime={carData.auctionEndTime}
                                startTime={carData.auctionStartTime}
                                currentBid={currentBidToPass}
                                bidCount={carData.bidCount}
                                startingBid={carData.startingBid}
                                reservePrice={carData.reservePrice}
                                auctionStatus={currentAuctionStatus}
                                size="large"
                                externalTick={globalTick}
                              />
                            );
                          })()}
                        </div>

                        {/* قائمة معلومات المشتري الفائز - نسخة موبايل - إزالة الإعدادات المتجاوبة */}
                        {currentAuctionStatus === 'sold' && carData.buyerName && (
                          <div className="mt-2 rounded-lg border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 p-2 shadow-sm">
                            <div className="mb-1.5 flex items-center justify-center gap-1.5">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="h-3.5 w-3.5 text-emerald-600"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 0 0-.584.859 6.753 6.753 0 0 0 6.138 5.6 6.73 6.73 0 0 0 2.743 1.346A6.707 6.707 0 0 1 9.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 0 0-2.25 2.25c0 .414.336.75.75.75h15a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-2.25-2.25h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 0 1-1.112-3.173 6.73 6.73 0 0 0 2.743-1.347 6.753 6.753 0 0 0 6.139-5.6.75.75 0 0 0-.584-.858 47.077 47.077 0 0 0-3.07-.543V2.62a.75.75 0 0 0-.658-.744 49.22 49.22 0 0 0-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 0 0-.657.744Zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 0 1 3.16 5.337a45.6 45.6 0 0 1 2.006-.343v.256Zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 0 1-2.863 3.207 6.72 6.72 0 0 0 .857-3.294Z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span className="text-xs font-bold text-emerald-800">
                                المشتري الفائز
                              </span>
                            </div>

                            <div className="mb-1.5 text-center">
                              <div className="mb-0.5 text-xs text-emerald-700">الفائز بالمزاد</div>
                              <div className="break-words px-1 text-sm font-bold text-emerald-900">
                                {carData.buyerName}
                              </div>
                            </div>

                            <div className="space-y-1">
                              {/* زر المراسلة */}
                              <button
                                onClick={() => {
                                  if (user) {
                                    showNotification(
                                      'success',
                                      `سيتم فتح نافذة المراسلة مع ${carData.buyerName}`,
                                    );
                                  } else {
                                    requireLogin('للتواصل مع المشتري', () => {});
                                  }
                                }}
                                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 py-1.5 text-xs font-semibold text-white shadow-md transition-all hover:from-blue-700 hover:to-blue-800 active:from-blue-800 active:to-blue-900"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                  className="h-3 w-3"
                                >
                                  <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 0 0-1.032-.211 50.89 50.89 0 0 0-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 0 0 2.433 3.984L7.28 21.53A.75.75 0 0 1 6 21v-4.03a48.527 48.527 0 0 1-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979Z" />
                                  <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 0 0 1.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0 0 15.75 7.5Z" />
                                </svg>
                                مراسلة
                              </button>

                              {/* زر عرض رقم الهاتف */}
                              <button
                                onClick={() => {
                                  if (user) {
                                    showNotification('success', 'سيتم عرض رقم هاتف المشتري');
                                  } else {
                                    requireLogin('لعرض رقم الهاتف', () => {});
                                  }
                                }}
                                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-green-600 to-green-700 py-1.5 text-xs font-semibold text-white shadow-md transition-all hover:from-green-700 hover:to-green-800 active:from-green-800 active:to-green-900"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                  className="h-3 w-3"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                عرض رقم الهاتف
                              </button>
                            </div>
                          </div>
                        )}

                        <CopartBiddingPanel
                          auctionId={String(router.query.id || carData?.id || '')}
                          startingPrice={parseNumericValue(carData.startingBid)}
                          reservePrice={
                            typeof carData.reservePrice === 'number' ? carData.reservePrice : null
                          }
                          minimumBidIncrement={
                            typeof (carData as any).minimumBidIncrement === 'number'
                              ? (carData as any).minimumBidIncrement
                              : null
                          }
                          status={currentAuctionStatus as any}
                          userId={user?.id as any}
                          isOwner={isCurrentUserOwner}
                          sseDisabled={true}
                          hideCurrentPriceHeader={true}
                          externalLivePrice={parseNumericValue(
                            carData.currentBid || carData.startingBid,
                          )}
                          onRequireLogin={() => requireLogin('للمشاركة في المزاد', () => {})}
                          onBidSuccess={async (newAmount: number) => {
                            setIsCurrentBidAnimating(true);
                            setCarData((prev: any) => ({
                              ...prev,
                              currentBid: formatNumber(String(newAmount)),
                              bidCount: (prev?.bidCount || 0) + 1,
                            }));
                            setTimeout(() => setIsCurrentBidAnimating(false), 2000);
                            // إعادة جلب قائمة المزايدين
                            await handleBidSuccess(newAmount);
                          }}
                        />
                        <div className="hidden space-y-2">
                          {/* عرض المعلومات حسب حالة المزاد */}
                          {currentAuctionStatus === 'upcoming' ? (
                            // للمزادات القادمة - عرض سعر البداية والسعر المطلوب
                            <>
                              <div className="text-center">
                                <div className="mb-1 text-sm text-gray-500">سعر البداية</div>
                                <div className="text-3xl font-bold text-yellow-600">
                                  {formatNumber(carData.startingBid)}{' '}
                                  <span className="text-lg">د.ل</span>
                                </div>
                                <div className="mt-2 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-600">
                                  <ClockIcon className="ml-1 inline h-4 w-4" />
                                  سيبدأ المزاد قريباً - كن مستعداً!
                                </div>
                              </div>

                              {/* عرض سعر البيع للمزادات القادمة */}
                              {carData.reservePrice && (
                                <div className="text-center">
                                  <div className="mb-1 text-sm text-gray-500">سعر البيع</div>
                                  <div className="text-lg font-semibold text-orange-600">
                                    {formatNumber(carData.reservePrice)} د.ل
                                  </div>
                                  <div className="mt-1 text-xs text-gray-500">
                                    الحد الأدنى المطلوب للبيع
                                  </div>
                                </div>
                              )}
                            </>
                          ) : currentAuctionStatus === 'ended' ? (
                            // للمزادات المنتهية - عرض السعر النهائي والمشتري
                            <div className="text-center">
                              <div className="mb-1 text-sm text-gray-500">السعر النهائي</div>
                              <div className="flex items-center justify-center gap-2">
                                <span className="text-3xl font-bold text-green-600">
                                  {formatNumber(carData.finalBid || carData.currentBid)}
                                </span>
                                <div className="rounded-lg bg-green-100 px-3 py-1 text-sm font-medium text-green-600">
                                  دينار ليبي
                                </div>
                              </div>
                              <div className="mb-2 text-sm text-gray-500">
                                {carData.bidCount} مزايدة
                              </div>
                              {carData.buyerName && (
                                <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                                  <TrophyIcon className="ml-1 inline h-4 w-4 text-yellow-500" />
                                  المشتري: {carData.buyerName}
                                </div>
                              )}
                              <div className="mt-3 grid grid-cols-2 gap-4">
                                <div className="text-center">
                                  <div className="mb-1 text-sm text-gray-500">السعر الابتدائي</div>
                                  <div className="text-lg text-gray-700">
                                    {formatNumber(carData.startingBid)} د.ل
                                  </div>
                                </div>
                                {carData.reservePrice && (
                                  <div className="text-center">
                                    <div className="mb-1 text-sm text-gray-500">سعر البيع</div>
                                    <div className="text-lg font-semibold text-orange-600">
                                      {formatNumber(carData.reservePrice)} د.ل
                                    </div>
                                    <div className="mt-1 flex items-center justify-center gap-1 text-xs text-gray-500">
                                      {(parseNumericValue(carData.finalBid) ||
                                        parseNumericValue(carData.currentBid)) >=
                                      parseNumericValue(carData.reservePrice) ? (
                                        <>
                                          <CheckCircleIcon className="h-3 w-3 text-green-500" />
                                          <span>تم تحقيق سعر البيع</span>
                                        </>
                                      ) : (
                                        <>
                                          <XMarkIcon className="h-3 w-3 text-red-500" />
                                          <span>لم يتم تحقيق سعر البيع</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : currentAuctionStatus === 'sold' ? (
                            // للمزادات المباعة - عرض تفاصيل البيع
                            <div className="text-center">
                              <div className="mb-1 text-sm font-medium text-green-600">
                                تم البيع بنجاح ✓
                              </div>
                              <div className="flex items-center justify-center gap-2">
                                <span className="text-3xl font-bold text-green-600">
                                  {formatNumber(carData.finalBid || carData.currentBid)}
                                </span>
                                <div className="rounded-lg bg-green-100 px-3 py-1 text-sm font-medium text-green-600">
                                  دينار ليبي
                                </div>
                              </div>
                              <div className="mb-2 text-sm text-gray-500">
                                {carData.bidCount} مزايدة
                              </div>
                              {carData.buyerName && (
                                <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                                  <TrophyIcon className="ml-1 inline h-4 w-4 text-yellow-500" />
                                  المشتري: <strong>{quickDecodeName(carData.buyerName)}</strong>
                                </div>
                              )}
                              <div className="mt-3 grid grid-cols-2 gap-4">
                                <div className="text-center">
                                  <div className="mb-1 text-sm text-gray-500">السعر الابتدائي</div>
                                  <div className="text-lg text-gray-700">
                                    {formatNumber(carData.startingBid)} د.ل
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="mb-1 text-sm text-gray-500">الربح</div>
                                  <div className="text-lg font-semibold text-green-600">
                                    +
                                    {formatNumber(
                                      parseNumericValue(carData.finalBid || carData.currentBid) -
                                        parseNumericValue(carData.startingBid),
                                    )}{' '}
                                    د.ل
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            // للمزادات المباشرة - عرض المزايدة الحالية
                            <>
                              <div className="text-center">
                                <div className="mb-1 text-sm text-gray-500">المزايدة الحالية</div>
                                <div className="price-value auction-price-live flex scale-100 items-center justify-center gap-2 transition-all duration-500">
                                  <span className="text-3xl font-bold text-blue-700">
                                    {formatNumber(carData.currentBid)}
                                  </span>
                                  <div className="rounded-lg bg-blue-100 px-3 py-1 text-sm font-medium text-blue-600">
                                    دينار ليبي
                                  </div>
                                </div>
                                <div className="text-sm text-gray-500 transition-all duration-300">
                                  <span className="inline-flex items-center gap-1">
                                    <span>{carData.bidCount} مزايدة</span>
                                  </span>
                                </div>
                              </div>

                              <div className="text-center">
                                <div className="mb-1 text-sm text-gray-500">السعر الابتدائي</div>
                                <div className="flex items-center justify-center gap-1">
                                  <span className="text-lg font-semibold text-gray-700">
                                    {formatNumber(carData.startingBid)}
                                  </span>
                                  <div className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                                    دينار
                                  </div>
                                </div>
                              </div>

                              {/* عرض سعر البيع للمزادات المباشرة */}
                              {carData.reservePrice && (
                                <div className="text-center">
                                  <div className="mb-1 text-sm text-gray-500">سعر البيع</div>
                                  <div className="text-lg font-semibold text-orange-600">
                                    {formatNumber(carData.reservePrice)} د.ل
                                  </div>
                                  <div className="mt-1 flex items-center justify-center gap-1 text-xs text-gray-500">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      strokeWidth="1.5"
                                      stroke="currentColor"
                                      aria-hidden="true"
                                      data-slot="icon"
                                      className="h-3 w-3 text-orange-500"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                      ></path>
                                    </svg>
                                    <span>لم يتم الوصول للسعر المطلوب بعد</span>
                                  </div>
                                </div>
                              )}
                            </>
                          )}

                          {/* أزرار المزايدة - معطلة للمزادات القادمة وصاحب الإعلان */}
                          {(() => {
                            // فحص متعدد الطبقات لضمان الدقة
                            const isOwner = isCurrentUserOwner;

                            // فحص إضافي مباشر
                            const directCheck =
                              user?.id &&
                              carData?.sellerId &&
                              String(user.id).trim() === String(carData.sellerId).trim();

                            // فحص من localStorage مباشرة
                            let localStorageCheck = false;
                            try {
                              const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
                              localStorageCheck =
                                savedUser.id &&
                                carData?.sellerId &&
                                String(savedUser.id).trim() === String(carData.sellerId).trim();
                            } catch (error) {
                              console.error('خطأ في فحص localStorage:', error);
                            }

                            const finalIsOwner = isOwner || directCheck || localStorageCheck;

                            return finalIsOwner;
                          })() ? (
                            // رسالة تنبيه بسيطة لصاحب الإعلان
                            <div className="flex items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                aria-hidden="true"
                                data-slot="icon"
                                className="h-5 w-5 text-amber-600"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                                ></path>
                              </svg>
                              <span className="text-sm font-medium">
                                هذا الإعلان خاص بك - لا يمكنك المزايدة عليه
                              </span>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <button
                                onClick={
                                  isElementInteractive('bidding_section') &&
                                  currentAuctionStatus === 'live'
                                    ? () => {
                                        requireLogin('للمشاركة في المزاد', () => {
                                          setShowBidModal(true);
                                        });
                                      }
                                    : undefined
                                }
                                className={`flex w-full items-center justify-center gap-2 rounded-lg py-3 font-semibold transition-colors ${
                                  currentAuctionStatus === 'upcoming'
                                    ? 'cursor-not-allowed bg-yellow-400 text-yellow-800'
                                    : currentAuctionStatus === 'ended'
                                      ? 'cursor-not-allowed bg-gray-400 text-gray-700'
                                      : !user
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-green-600 text-white hover:bg-green-700'
                                } ${
                                  !isElementInteractive('bidding_section') ||
                                  currentAuctionStatus !== 'live'
                                    ? 'cursor-not-allowed opacity-75'
                                    : ''
                                }`}
                                disabled={
                                  !isElementInteractive('bidding_section') ||
                                  currentAuctionStatus !== 'live'
                                }
                              >
                                <HandRaisedIcon className="h-5 w-5" />
                                {currentAuctionStatus === 'upcoming' && 'المزاد لم يبدأ بعد'}
                                {currentAuctionStatus === 'ended' && 'انتهى المزاد'}
                                {currentAuctionStatus === 'sold' && 'تم البيع بنجاح'}
                                {currentAuctionStatus === 'live' &&
                                  (!user ? 'سجل للمزايدة' : 'شارك في المزايدة')}
                              </button>

                              {/* أزرار المزايدة السريعة - للمزادات المباشرة فقط */}
                              {currentAuctionStatus === 'live' && user && (
                                <div className="grid grid-cols-3 gap-2">
                                  {[1000, 2000, 5000].map((increment) => (
                                    <button
                                      key={increment}
                                      onClick={() => {
                                        if (isElementInteractive('bidding_section')) {
                                          const newBid =
                                            parseNumericValue(carData.currentBid) + increment;
                                          handleQuickBid(newBid);
                                        }
                                      }}
                                      className={`rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 ${
                                        !isElementInteractive('bidding_section')
                                          ? 'cursor-not-allowed opacity-50'
                                          : ''
                                      }`}
                                      disabled={!isElementInteractive('bidding_section')}
                                    >
                                      +{formatNumber(increment)}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* قائمة المزايدين - تظهر بجانب العداد في المقاس 640px-1023px */}
                  {isElementVisible('bid_history') &&
                    ['live', 'ended', 'sold'].includes(currentAuctionStatus) && (
                      <div className="relative flex h-full flex-col">
                        <SimpleBiddersList
                          key="mobile-bidders-list"
                          bidders={realBidders}
                          currentBid={(
                            carData?.currentBid ??
                            (carData as any)?.finalBid ??
                            0
                          ).toString()}
                          formatNumber={formatNumber}
                          isOwner={isCurrentUserOwner}
                          auctionStatus={currentAuctionStatus}
                          onAcceptBid={handleAcceptBid}
                          onContactBidder={handleContactBidder}
                          onMessageBidder={handleMessageBidder}
                          onRefresh={refetchBidders}
                        />

                        {/* مؤشر تحميل صغير */}
                        {biddersLoading && realBidders.length > 0 && (
                          <div className="absolute left-4 top-4 z-10 rounded-full bg-white p-2 shadow-lg">
                            <SimpleSpinner size="xs" color="blue" />
                          </div>
                        )}
                      </div>
                    )}
                </div>
              </div>

              {/* معرض الصور المحسن */}
              {isElementVisible('image_gallery') && (
                <EnhancedImageGallery
                  images={(() => {
                    if (!carData.images || !Array.isArray(carData.images)) {
                      return [{ url: '/images/cars/default-car.svg', alt: 'صورة افتراضية' }];
                    }

                    return carData.images.map((img, index) => ({
                      url: img || '/images/cars/default-car.svg',
                      alt: `${carData.title || 'سيارة'} - صورة ${index + 1}`,
                      isPrimary: index === 0,
                    }));
                  })()}
                  title={carData.title || 'معرض صور السيارة'}
                  className="mb-6"
                  featured={carData?.featured}
                  promotionPackage={carData?.promotionPackage}
                  itemId={String(router.query.id || carData?.id || '')}
                  itemType="auction"
                  onRequireLogin={() => setShowAuthModal(true)}
                />
              )}
              {isElementVisible('car_details') && (
                <React.Fragment>
                  <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    {/* العنوان مع شارة الإعلان المميز */}
                    <div className="mb-4 flex flex-wrap items-center gap-3">
                      <h1 className="text-2xl font-bold text-gray-900">
                        {(() => {
                          // أولوية للعنوان الصحيح
                          if (carData?.title && carData.title.trim()) {
                            return carData.title;
                          }

                          // ثانياً: إنشاء عنوان من بيانات السيارة
                          const brand = carData?.brand || carData?.car?.brand || '';
                          const model = carData?.model || carData?.car?.model || '';
                          const year = carData?.year || carData?.car?.year || '';

                          if (brand && model) {
                            return `${brand} ${model} ${year}`.trim();
                          } else if (brand) {
                            return `${brand} ${year}`.trim();
                          }

                          // عنوان افتراضي
                          return 'سيارة للبيع';
                        })()}
                      </h1>
                      {/* شارة الإعلان المميز بجانب العنوان */}
                      <TitleFeaturedBadge
                        featured={carData?.featured}
                        packageType={carData?.promotionPackage}
                      />
                    </div>
                    {/* التاريخ والمدينة */}
                    <div className="mb-6 flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          aria-hidden="true"
                          data-slot="icon"
                          className="h-4 w-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                          ></path>
                        </svg>
                        <span>
                          {new Date().toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          aria-hidden="true"
                          data-slot="icon"
                          className="h-4 w-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                          ></path>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                          ></path>
                        </svg>
                        <span>
                          {carData.location}
                          {carData.area && ` - ${carData.area}`}
                        </span>
                      </div>
                    </div>

                    {/* وصف السيارة - تحت العنوان مباشرة */}
                    <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                      <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <InformationCircleIcon className="h-5 w-5 text-blue-600" />
                        الوصف
                      </h3>
                      <p className="leading-relaxed text-gray-700">
                        {carData.description || 'لا يوجد وصف متاح لهذه السيارة'}
                      </p>
                    </div>

                    {/* قسم المواصفات الشامل - دمج المعلومات الأساسية والتقنية */}
                    <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="h-5 w-5 text-blue-600"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.5 12a7.5 7.5 0 0 0 15 0m-15 0a7.5 7.5 0 1 1 15 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077 1.41-.513m14.095-5.13 1.41-.513M5.106 17.785l1.15-.964m11.49-9.642 1.149-.964M7.501 19.795l.75-1.3m7.5-12.99.75-1.3m-6.063 16.658.26-1.477m2.605-14.772.26-1.477m0 17.726-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205 12 12m6.894 5.785-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495"
                          ></path>
                        </svg>
                        المواصفات
                      </h3>

                      <div className="car-specifications-grid">
                        {/* الماركة */}
                        <div className="car-spec-card spec-basic">
                          <div className="car-spec-label">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor"
                              aria-hidden="true"
                              data-slot="icon"
                              className="car-spec-icon"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
                              ></path>
                            </svg>
                            <span>الماركة</span>
                          </div>
                          <div className="car-spec-value">
                            {carData?.brand || carData?.car?.brand || 'غير محدد'}
                          </div>
                        </div>

                        {/* الموديل */}
                        <div className="car-spec-card spec-basic">
                          <div className="car-spec-label">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor"
                              aria-hidden="true"
                              data-slot="icon"
                              className="car-spec-icon"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                              ></path>
                            </svg>
                            <span>الموديل</span>
                          </div>
                          <div className="car-spec-value">
                            {carData?.model || carData?.car?.model || 'غير محدد'}
                          </div>
                        </div>

                        {/* سنة الصنع */}
                        <div className="car-spec-card spec-basic">
                          <div className="car-spec-label">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor"
                              aria-hidden="true"
                              data-slot="icon"
                              className="car-spec-icon"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                              ></path>
                            </svg>
                            <span>سنة الصنع</span>
                          </div>
                          <div className="car-spec-value">
                            {carData?.year || carData?.car?.year || 'غير محدد'}
                          </div>
                        </div>

                        {/* حالة السيارة */}
                        <div className="car-spec-card spec-basic">
                          <div className="car-spec-label">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor"
                              aria-hidden="true"
                              data-slot="icon"
                              className="car-spec-icon"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
                              ></path>
                            </svg>
                            <span>حالة السيارة</span>
                          </div>
                          <div className="car-spec-value">
                            {translateToArabic(
                              carData?.condition || carData?.car?.condition || 'غير محدد',
                            )}
                          </div>
                        </div>

                        {/* المسافة المقطوعة */}
                        <div className="car-spec-card spec-basic">
                          <div className="car-spec-label">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor"
                              aria-hidden="true"
                              data-slot="icon"
                              className="car-spec-icon"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z"
                              ></path>
                            </svg>
                            <span>المسافة المقطوعة</span>
                          </div>
                          <div className="car-spec-value">
                            {carData?.mileage || carData?.car?.mileage
                              ? `${carData?.mileage || carData?.car?.mileage} كم`
                              : '54,000 كم'}
                          </div>
                        </div>

                        {/* نوع الوقود */}
                        <div className="car-spec-card spec-general">
                          <div className="car-spec-label">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor"
                              aria-hidden="true"
                              data-slot="icon"
                              className="car-spec-icon"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z"
                              ></path>
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z"
                              ></path>
                            </svg>
                            <span>نوع الوقود</span>
                          </div>
                          <div className="car-spec-value">
                            {translateToArabic(
                              carData?.fuelType || carData?.car?.fuelType || 'غير محدد',
                            )}
                          </div>
                        </div>

                        {/* ناقل الحركة */}
                        <div className="car-spec-card spec-general">
                          <div className="car-spec-label">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor"
                              aria-hidden="true"
                              data-slot="icon"
                              className="car-spec-icon"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4.5 12a7.5 7.5 0 0 0 15 0m-15 0a7.5 7.5 0 1 1 15 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077 1.41-.513m14.095-5.13 1.41-.513M5.106 17.785l1.15-.964m11.49-9.642 1.149-.964M7.501 19.795l.75-1.3m7.5-12.99.75-1.3m-6.063 16.658.26-1.477m2.605-14.772.26-1.477m0 17.726-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205 12 12m6.894 5.785-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495"
                              ></path>
                            </svg>
                            <span>ناقل الحركة</span>
                          </div>
                          <div className="car-spec-value">
                            {translateToArabic(
                              carData?.transmission || carData?.car?.transmission || 'عادية',
                            )}
                          </div>
                        </div>

                        {/* نوع الهيكل */}
                        <div className="car-spec-card spec-general">
                          <div className="car-spec-label">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor"
                              aria-hidden="true"
                              data-slot="icon"
                              className="car-spec-icon"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                              ></path>
                            </svg>
                            <span>نوع الهيكل</span>
                          </div>
                          <div className="car-spec-value">
                            {translateToArabic(
                              carData?.bodyType || carData?.car?.bodyType || 'SUV',
                            )}
                          </div>
                        </div>

                        {/* اللون الخارجي */}
                        <div className="car-spec-card spec-general">
                          <div className="car-spec-label">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor"
                              aria-hidden="true"
                              data-slot="icon"
                              className="car-spec-icon"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42"
                              ></path>
                            </svg>
                            <span>اللون الخارجي</span>
                          </div>
                          <div className="car-spec-value">
                            {translateToArabic(
                              carData?.exteriorColor ||
                                carData?.car?.color ||
                                carData?.color ||
                                'أبيض',
                            )}
                          </div>
                        </div>

                        {/* اللون الداخلي */}
                        <div className="car-spec-card spec-general">
                          <div className="car-spec-label">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor"
                              aria-hidden="true"
                              data-slot="icon"
                              className="car-spec-icon"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205 3 1m1.5.5-1.5-.5M6.75 7.364V3h-3v18m3-13.636 10.5-3.819"
                              ></path>
                            </svg>
                            <span>اللون الداخلي</span>
                          </div>
                          <div className="car-spec-value">
                            {translateToArabic(
                              carData?.interiorColor || carData?.car?.interiorColor || 'رمادي',
                            )}
                          </div>
                        </div>

                        {/* عدد المقاعد */}
                        <div className="car-spec-card spec-general">
                          <div className="car-spec-label">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor"
                              aria-hidden="true"
                              data-slot="icon"
                              className="car-spec-icon"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                              ></path>
                            </svg>
                            <span>عدد المقاعد</span>
                          </div>
                          <div className="car-spec-value">
                            {carData?.seatCount || carData?.car?.seatCount || '5'} مقعد
                          </div>
                        </div>

                        {/* المواصفات الإقليمية */}
                        <div className="car-spec-card spec-general">
                          <div className="car-spec-label">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor"
                              aria-hidden="true"
                              data-slot="icon"
                              className="car-spec-icon"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
                              ></path>
                            </svg>
                            <span>المواصفات الإقليمية</span>
                          </div>
                          <div className="car-spec-value">
                            {translateToArabic(
                              carData?.regionalSpecs || carData?.car?.regionalSpecs || 'خليجي',
                            )}
                          </div>
                        </div>

                        {/* المعلومات التقنية المدمجة */}
                        {carData?.chassisNumber && (
                          <div className="car-spec-card spec-technical">
                            <div className="car-spec-label">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="car-spec-icon"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z"
                                ></path>
                              </svg>
                              <span>رقم الشاصي</span>
                            </div>
                            <div className="car-spec-value">{carData.chassisNumber}</div>
                          </div>
                        )}

                        {carData?.engineNumber && (
                          <div className="car-spec-card spec-technical">
                            <div className="car-spec-label">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="car-spec-icon"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M21.75 6.75a4.5 4.5 0 0 1-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 1 1-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 0 1 6.336-4.486l-3.276 3.276a3.004 3.004 0 0 0 2.25 2.25l3.276-3.276c.256.565.365 1.19.398 1.836Z"
                                ></path>
                              </svg>
                              <span>رقم المحرك</span>
                            </div>
                            <div className="car-spec-value">{carData.engineNumber}</div>
                          </div>
                        )}

                        {carData?.engineSize && (
                          <div className="car-spec-card spec-technical">
                            <div className="car-spec-label">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="car-spec-icon"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z"
                                ></path>
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z"
                                ></path>
                              </svg>
                              <span>سعة المحرك</span>
                            </div>
                            <div className="car-spec-value">{carData.engineSize} لتر</div>
                          </div>
                        )}

                        {carData?.manufacturingCountry && (
                          <div className="car-spec-card spec-technical">
                            <div className="car-spec-label">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="car-spec-icon"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5"
                                ></path>
                              </svg>
                              <span>بلد التصنيع</span>
                            </div>
                            <div className="car-spec-value">
                              {translateToArabic(carData.manufacturingCountry)}
                            </div>
                          </div>
                        )}

                        {carData?.customsStatus && (
                          <div className="car-spec-card spec-technical">
                            <div className="car-spec-label">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="car-spec-icon"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"
                                ></path>
                              </svg>
                              <span>حالة الجمارك</span>
                            </div>
                            <div className="car-spec-value">
                              {translateToArabic(carData.customsStatus)}
                            </div>
                          </div>
                        )}

                        {carData?.licenseStatus && (
                          <div className="car-spec-card spec-technical">
                            <div className="car-spec-label">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="car-spec-icon"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                                ></path>
                              </svg>
                              <span>حالة الرخصة</span>
                            </div>
                            <div className="car-spec-value">
                              {translateToArabic(carData?.licenseStatus)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* قسم المميزات الموحد - تصميم محسن ومنظم */}
                    <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <SparklesIcon className="h-5 w-5 text-purple-600" />
                        المميزات والكماليات
                      </h3>

                      {/* عرض المميزات المحسن */}
                      {(() => {
                        // التحقق من وجود مميزات
                        const hasGeneralFeatures =
                          carData.features?.general && carData.features.general.length > 0;
                        const hasInteriorFeatures =
                          carData.features?.interior && carData.features.interior.length > 0;
                        const hasExteriorFeatures =
                          carData.features?.exterior && carData.features.exterior.length > 0;
                        const hasSafetyFeatures =
                          carData.features?.safety && carData.features.safety.length > 0;
                        const hasTechnologyFeatures =
                          carData.features?.technology && carData.features.technology.length > 0;

                        const hasAnyFeatures =
                          hasGeneralFeatures ||
                          hasInteriorFeatures ||
                          hasExteriorFeatures ||
                          hasSafetyFeatures ||
                          hasTechnologyFeatures;

                        if (!hasAnyFeatures) {
                          return (
                            <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-6">
                              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
                                <SparklesIcon className="h-6 w-6 text-gray-400" />
                              </div>
                              <div className="flex-1">
                                <div className="mb-1 font-medium text-gray-900">
                                  لا توجد مميزات محددة
                                </div>
                                <div className="text-sm text-gray-500">
                                  يمكنك التواصل مع البائع للاستفسار عن المميزات والكماليات المتاحة
                                  في هذه السيارة
                                </div>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div className="space-y-4">
                            {/* المميزات العامة */}
                            {hasGeneralFeatures && (
                              <CarFeaturesDisplay
                                features={carData.features.general}
                                title="المميزات العامة"
                                iconColor="text-blue-500"
                              />
                            )}

                            {/* المميزات الداخلية */}
                            {hasInteriorFeatures && (
                              <CarFeaturesDisplay
                                features={carData.features.interior}
                                title="المميزات الداخلية"
                                iconColor="text-green-500"
                              />
                            )}

                            {/* المميزات الخارجية */}
                            {hasExteriorFeatures && (
                              <CarFeaturesDisplay
                                features={carData.features.exterior}
                                title="المميزات الخارجية"
                                iconColor="text-purple-500"
                              />
                            )}

                            {/* مميزات الأمان */}
                            {hasSafetyFeatures && (
                              <CarFeaturesDisplay
                                features={carData.features.safety}
                                title="مميزات الأمان"
                                iconColor="text-red-500"
                              />
                            )}

                            {/* التقنيات المتقدمة */}
                            {hasTechnologyFeatures && (
                              <CarFeaturesDisplay
                                features={carData.features.technology}
                                title="التقنيات المتقدمة"
                                iconColor="text-orange-500"
                              />
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    {/* قسم موقع السيارة - يظهر فقط إذا تم تحديد الموقع التفصيلي */}
                    {carData.locationAddress && (
                      <div className="mb-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-100 p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                aria-hidden="true"
                                data-slot="icon"
                                className="h-5 w-5 text-red-500"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                ></path>
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                                ></path>
                              </svg>
                              <h3 className="font-semibold text-gray-900">موقع السيارة</h3>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="relative">
                                <button
                                  className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                                  title="مشاركة الموقع"
                                  onClick={() => {
                                    // مشاركة الموقع
                                    if (navigator.share) {
                                      navigator.share({
                                        title: 'موقع السيارة',
                                        text: carData.locationAddress,
                                        url: window.location.href,
                                      });
                                    }
                                  }}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                    data-slot="icon"
                                    className="h-4 w-4"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
                                    ></path>
                                  </svg>
                                </button>
                              </div>
                              <button
                                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                                title="عرض الخريطة"
                                onClick={() => {
                                  // عرض الخريطة أو توسيط العرض
                                  showNotification('سيتم إضافة عرض الخريطة قريباً', 'success');
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth="1.5"
                                  stroke="currentColor"
                                  aria-hidden="true"
                                  data-slot="icon"
                                  className="h-4 w-4"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                                  ></path>
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                  ></path>
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                aria-hidden="true"
                                data-slot="icon"
                                className="h-5 w-5 text-red-600"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                ></path>
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                                ></path>
                              </svg>
                            </div>
                            <div className="flex-1">
                              <div className="mb-1 font-medium text-gray-900">
                                {carData.locationAddress}
                              </div>
                              <div className="text-sm text-gray-500">
                                يمكنك التواصل مع البائع للحصول على معلومات أكثر تفصيلاً عن الموقع
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 flex gap-2">
                            <button
                              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
                              onClick={() => {
                                const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(carData.locationAddress)}`;
                                window.open(googleMapsUrl, '_blank');
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                aria-hidden="true"
                                data-slot="icon"
                                className="h-4 w-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
                                ></path>
                              </svg>
                              فتح في خرائط جوجل
                            </button>
                            <button
                              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600"
                              onClick={() => {
                                const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(carData.locationAddress)}`;
                                window.open(directionsUrl, '_blank');
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                aria-hidden="true"
                                data-slot="icon"
                                className="h-4 w-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                                ></path>
                              </svg>
                              الحصول على التوجيهات
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* قسم تقرير الفحص - يظهر فقط إذا كان هناك تقرير */}
                    {(carData.hasInspectionReport || carData.hasManualInspectionReport) && (
                      <div className="mb-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-100 p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                aria-hidden="true"
                                data-slot="icon"
                                className="h-5 w-5 text-green-500"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12 Z"
                                ></path>
                              </svg>
                              <h3 className="font-semibold text-gray-900">تقرير الفحص الفني</h3>
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                aria-hidden="true"
                                data-slot="icon"
                                className="h-5 w-5 text-green-600"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12 Z"
                                ></path>
                              </svg>
                            </div>
                            <div className="flex-1">
                              <div className="mb-1 font-medium text-gray-900">
                                تقرير فحص فني متوفر
                              </div>
                              <div className="text-sm text-gray-500">
                                يمكنك عرض وتحميل تقرير الفحص الفني الكامل للسيارة
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 flex gap-2">
                            <button
                              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600"
                              onClick={() => {
                                if (carData.inspectionReportFileUrl) {
                                  window.open(carData.inspectionReportFileUrl, '_blank');
                                } else {
                                  showNotification('لا يتوفر تقرير للتحميل', 'warning');
                                }
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                aria-hidden="true"
                                data-slot="icon"
                                className="h-4 w-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                                ></path>
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                ></path>
                              </svg>
                              عرض تقرير الفحص
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {carData?.inspectionReport?.hasReport ? (
                      <InspectionReport
                        inspectionReport={carData.inspectionReport}
                        className="mb-6"
                      />
                    ) : null}
                  </div>
                </React.Fragment>
              )}

              <div className="block rounded-lg bg-white p-5 shadow-sm lg:hidden">
                <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
                  <InformationCircleIcon className="h-5 w-5 text-blue-600" />
                  تفاصيل المزاد
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {carData.auctionStartTime && (
                    <div className="rounded-lg border border-gray-200 bg-white p-3">
                      <div className="mb-1 text-sm font-medium text-green-600">بداية المزاد</div>
                      <div className="text-sm text-gray-700" dir="ltr">
                        {new Date(carData.auctionStartTime).toLocaleString('en-US', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false,
                        })}
                      </div>
                    </div>
                  )}

                  {carData.auctionEndTime && (
                    <div className="rounded-lg border border-gray-200 bg-white p-3">
                      <div className="mb-1 text-sm font-medium text-red-600">نهاية المزاد</div>
                      <div className="text-sm text-gray-700" dir="ltr">
                        {new Date(carData.auctionEndTime).toLocaleString('en-US', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false,
                        })}
                      </div>
                    </div>
                  )}

                  {/* حالة المزاد */}
                  <div className="rounded-lg border border-gray-200 bg-white p-3">
                    <div className="mb-1 text-sm font-medium text-purple-600">حالة المزاد</div>
                    <div className="flex items-center gap-2 text-sm">
                      {currentAuctionStatus === 'live' && (
                        <>
                          <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                          <span className="font-medium text-green-700">مزاد مباشر</span>
                        </>
                      )}
                      {currentAuctionStatus === 'upcoming' && (
                        <>
                          <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                          <span className="font-medium text-yellow-700">مزاد قادم</span>
                        </>
                      )}
                      {currentAuctionStatus === 'ended' && (
                        <>
                          <div className="h-2 w-2 rounded-full bg-gray-500"></div>
                          <span className="font-medium text-gray-700">مزاد منتهي</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* عدد المشاهدات */}
                  <div className="rounded-lg border border-gray-200 bg-white p-3">
                    <div className="mb-1 text-sm font-medium text-purple-600">عدد المشاهدات</div>
                    <div className="flex items-center gap-1 text-sm text-gray-700">
                      <EyeIcon className="h-4 w-4 text-purple-500" />
                      <span>{carData.viewCount || 0} مشاهدة</span>
                    </div>
                  </div>

                  {/* معرف المزاد */}
                  <div className="rounded-lg border border-gray-200 bg-white p-3">
                    <div className="mb-1 text-sm font-medium text-gray-600">معرف المزاد</div>
                    <div className="font-mono text-sm text-gray-700">#{carData.id}</div>
                  </div>
                </div>
              </div>

              {/* معلومات البائع - للشاشات الصغيرة فقط */}
              {carData.seller && !isCurrentUserOwner && (
                <ImprovedSellerInfoCard
                  className="lg:hidden"
                  seller={{
                    id: (carData.seller as any).id || 'unknown',
                    name: (carData.seller as any).name,
                    phone:
                      (carData as any).contactPhone || (carData.seller as any).phone || 'غير متوفر',
                    profileImage: (carData.seller as any).avatar,
                    verified: (carData.seller as any).verified,
                    accountType: (carData.seller as any).accountType,
                    rating: (carData.seller as any).rating,
                    reviewsCount: (carData.seller as any).reviews,
                    city: (carData as any).location || (carData as any).locationAddress,
                    activeListings: (carData.seller as any).activeListings,
                  }}
                  clickable
                  showActions
                  onContact={() => {
                    const phone = (carData as any).contactPhone || (carData.seller as any).phone;
                    if (phone) {
                      window.open(`tel:${phone}`, '_self');
                    }
                  }}
                  onMessage={() => {
                    if (carData?.sellerId) {
                      handleMessageBidder(
                        String(carData.sellerId),
                        quickDecodeName((carData?.seller as any)?.name || 'البائع'),
                      );
                    }
                  }}
                />
              )}

              {/* قسم التعليقات والتقييمات */}
              {isElementVisible('reviews_section') && (
                <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <StarIcon className="h-6 w-6 text-yellow-500" />
                    التقييمات
                  </h3>

                  {/* رسالة للمالك مع إبقاء قسم التقييمات للعرض فقط */}
                  {isCurrentUserOwner && (
                    <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                      <p className="text-sm text-blue-700">
                        أنت صاحب الإعلان — لا يمكنك تقييم إعلانك. يمكنك الإطلاع على التقييمات التي
                        يضيفها المستخدمون هنا.
                      </p>
                    </div>
                  )}

                  <ReviewsAndRatings
                    itemId={id as string}
                    itemType="auction"
                    itemTitle={carData?.title || carData?.car?.title || 'مزاد سيارة'}
                    targetUserId={carData?.sellerId || carData?.car?.sellerId}
                    canQuickReview={!isCurrentUserOwner}
                    showQuickRating={true}
                    showRatingStats={true}
                  />
                </div>
              )}

              {/* نصائح الأمان */}
              <SafetyTips />

              {/* تم إزالة QuickReview القديم - يتم استخدام ReviewsAndRatings الموحد بالأعلى */}
            </div>

            {/* Right Column - Auction Info - يظهر من 640px وما فوق (يشمل 623-1023px) */}
            <div className="desktop-auction-sidebar hidden space-y-4 sm:block">
              {/* عداد المزاد وأزرار المزايدة - للشاشات الكبيرة فقط */}
              {isElementVisible('auction_timer') && isElementVisible('bidding_section') && (
                <div className="relative rounded-lg border border-gray-200 bg-white shadow-sm">
                  {/* شارة إعلان مميز - موحدة */}
                  {(carData?.featured ||
                    (carData?.promotionPackage && carData.promotionPackage !== 'free')) && (
                    <div className="absolute left-3 top-3 z-10">
                      <SmartFeaturedBadge
                        featured={carData?.featured}
                        packageType={carData?.promotionPackage}
                        size="sm"
                        showText={true}
                      />
                    </div>
                  )}
                  <div className="px-4 py-6">
                    <div className="mb-3 flex min-h-[240px] items-center justify-center">
                      {/* العداد الموحد لجميع حالات المزاد */}
                      {(() => {
                        const currentBidToPass =
                          currentAuctionStatus === 'upcoming'
                            ? carData.startingBid
                            : currentAuctionStatus === 'ended' || currentAuctionStatus === 'sold'
                              ? carData.finalBid || carData.currentBid
                              : carData.currentBid;

                        // 🔍 تتبع props العداد (Desktop) (معطل لتقليل console spam)
                        // console.log('[🎯 Timer Props Desktop]', {
                        //   currentAuctionStatus,
                        //   'carData.status': carData.status,
                        //   'carData.auctionType': carData.auctionType,
                        //   auctionEndTime: carData.auctionEndTime
                        // });

                        return (
                          <SimpleCircularAuctionTimer
                            endTime={carData.auctionEndTime}
                            startTime={carData.auctionStartTime}
                            currentBid={currentBidToPass}
                            bidCount={carData.bidCount}
                            startingBid={carData.startingBid}
                            reservePrice={carData.reservePrice}
                            auctionStatus={currentAuctionStatus}
                            size="large"
                            externalTick={globalTick}
                          />
                        );
                      })()}
                    </div>

                    {/* قائمة معلومات المشتري الفائز - تظهر فقط عند البيع */}
                    {currentAuctionStatus === 'sold' && carData.buyerName && (
                      <div className="mt-3 rounded-lg border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 p-3 shadow-sm sm:mt-4 sm:p-4">
                        <div className="mb-2 flex items-center justify-center gap-1.5 sm:mb-3 sm:gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="h-4 w-4 text-emerald-600 sm:h-5 sm:w-5"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 0 0-.584.859 6.753 6.753 0 0 0 6.138 5.6 6.73 6.73 0 0 0 2.743 1.346A6.707 6.707 0 0 1 9.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 0 0-2.25 2.25c0 .414.336.75.75.75h15a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-2.25-2.25h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 0 1-1.112-3.173 6.73 6.73 0 0 0 2.743-1.347 6.753 6.753 0 0 0 6.139-5.6.75.75 0 0 0-.584-.858 47.077 47.077 0 0 0-3.07-.543V2.62a.75.75 0 0 0-.658-.744 49.22 49.22 0 0 0-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 0 0-.657.744Zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 0 1 3.16 5.337a45.6 45.6 0 0 1 2.006-.343v.256Zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 0 1-2.863 3.207 6.72 6.72 0 0 0 .857-3.294Z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-xs font-bold text-emerald-800 sm:text-sm">
                            المشتري الفائز
                          </span>
                        </div>

                        <div className="mb-2 text-center sm:mb-3">
                          <div className="mb-1 text-[10px] text-emerald-700 sm:text-xs">
                            الفائز بالمزاد
                          </div>
                          <div className="break-words px-1 text-base font-bold text-emerald-900 sm:text-lg">
                            {carData.buyerName}
                          </div>
                        </div>

                        <div className="space-y-1.5 sm:space-y-2">
                          {/* زر المراسلة */}
                          <button
                            onClick={() => {
                              if (user) {
                                // فتح نظام المراسلة
                                showNotification(
                                  'success',
                                  `سيتم فتح نافذة المراسلة مع ${carData.buyerName}`,
                                );
                                // يمكن إضافة router.push('/messages?to=' + buyerId) هنا
                              } else {
                                requireLogin('للتواصل مع المشتري', () => {});
                              }
                            }}
                            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 py-2 text-xs font-semibold text-white shadow-md transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-lg active:from-blue-800 active:to-blue-900 sm:gap-2 sm:py-2.5 sm:text-sm"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                            >
                              <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 0 0-1.032-.211 50.89 50.89 0 0 0-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 0 0 2.433 3.984L7.28 21.53A.75.75 0 0 1 6 21v-4.03a48.527 48.527 0 0 1-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979Z" />
                              <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 0 0 1.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0 0 15.75 7.5Z" />
                            </svg>
                            مراسلة
                          </button>

                          {/* زر عرض رقم الهاتف */}
                          <button
                            onClick={() => {
                              if (user) {
                                // عرض رقم الهاتف أو الاتصال
                                showNotification('success', 'سيتم عرض رقم هاتف المشتري');
                                // يمكن إضافة منطق جلب رقم الهاتف من API هنا
                              } else {
                                requireLogin('لعرض رقم الهاتف', () => {});
                              }
                            }}
                            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-green-600 to-green-700 py-2 text-xs font-semibold text-white shadow-md transition-all hover:from-green-700 hover:to-green-800 hover:shadow-lg active:from-green-800 active:to-green-900 sm:gap-2 sm:py-2.5 sm:text-sm"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                            >
                              <path
                                fillRule="evenodd"
                                d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z"
                                clipRule="evenodd"
                              />
                            </svg>
                            عرض رقم الهاتف
                          </button>
                        </div>
                      </div>
                    )}

                    <CopartBiddingPanel
                      auctionId={String(router.query.id || carData?.id || '')}
                      startingPrice={parseNumericValue(carData.startingBid)}
                      reservePrice={
                        typeof carData.reservePrice === 'number' ? carData.reservePrice : null
                      }
                      minimumBidIncrement={
                        typeof (carData as any).minimumBidIncrement === 'number'
                          ? (carData as any).minimumBidIncrement
                          : null
                      }
                      status={currentAuctionStatus as any}
                      userId={user?.id as any}
                      isOwner={isCurrentUserOwner}
                      sseDisabled={true}
                      hideCurrentPriceHeader={true}
                      externalLivePrice={parseNumericValue(
                        carData.currentBid || carData.startingBid,
                      )}
                      onRequireLogin={() => requireLogin('للمشاركة في المزاد', () => {})}
                      onBidSuccess={async (newAmount: number) => {
                        setIsCurrentBidAnimating(true);
                        setCarData((prev: any) => ({
                          ...prev,
                          currentBid: formatNumber(String(newAmount)),
                          bidCount: (prev?.bidCount || 0) + 1,
                        }));
                        setTimeout(() => setIsCurrentBidAnimating(false), 2000);
                        // إعادة جلب قائمة المزايدين
                        await handleBidSuccess(newAmount);
                      }}
                    />
                    <div className="hidden space-y-4">
                      {/* عرض المعلومات حسب حالة المزاد */}
                      {currentAuctionStatus === 'upcoming' ? (
                        // للمزادات القادمة - عرض سعر البداية والسعر المطلوب
                        <>
                          <div className="text-center">
                            <div className="mb-1 text-sm text-gray-500">سعر البداية</div>
                            <div className="text-3xl font-bold text-yellow-600">
                              {formatNumber(carData.startingBid)}{' '}
                              <span className="text-lg">د.ل</span>
                            </div>
                            <div className="mt-2 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-600">
                              <ClockIcon className="ml-1 inline h-4 w-4" />
                              سيبدأ المزاد قريباً - كن مستعداً!
                            </div>
                          </div>

                          {/* عرض سعر البيع للمزادات القادمة */}
                          {carData.reservePrice && (
                            <div className="text-center">
                              <div className="mb-1 text-sm text-gray-500">سعر البيع</div>
                              <div className="text-lg font-semibold text-orange-600">
                                {formatNumber(carData.reservePrice)} د.ل
                              </div>
                              <div className="mt-1 text-xs text-gray-500">
                                الحد الأدنى المطلوب للبيع
                              </div>
                            </div>
                          )}
                        </>
                      ) : currentAuctionStatus === 'ended' ? (
                        // للمزادات المنتهية - عرض السعر النهائي والمشتري
                        <div className="text-center">
                          <div className="mb-1 text-sm text-gray-500">السعر النهائي</div>
                          <div className="text-3xl font-bold text-green-600">
                            {formatNumber(carData.finalBid || carData.currentBid)}{' '}
                            <span className="text-lg">د.ل</span>
                          </div>
                          <div className="mb-2 text-sm text-gray-500">
                            {carData.bidCount} مزايدة
                          </div>
                          {carData.buyerName && (
                            <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                              <TrophyIcon className="ml-1 inline h-4 w-4 text-yellow-500" />
                              المشتري: {carData.buyerName}
                            </div>
                          )}
                          <div className="mt-3 grid grid-cols-2 gap-4">
                            <div className="text-center">
                              <div className="mb-1 text-sm text-gray-500">السعر الابتدائي</div>
                              <div className="text-lg text-gray-700">
                                {formatNumber(carData.startingBid)} د.ل
                              </div>
                            </div>
                            {carData.reservePrice && (
                              <div className="text-center">
                                <div className="mb-1 text-sm text-gray-500">سعر البيع</div>
                                <div className="text-lg font-semibold text-orange-600">
                                  {formatNumber(carData.reservePrice)} د.ل
                                </div>
                                <div className="mt-1 flex items-center justify-center gap-1 text-xs text-gray-500">
                                  {(parseNumericValue(carData.finalBid) ||
                                    parseNumericValue(carData.currentBid)) >=
                                  parseNumericValue(carData.reservePrice) ? (
                                    <>
                                      <CheckCircleIcon className="h-3 w-3 text-green-500" />
                                      <span>تم تحقيق سعر البيع</span>
                                    </>
                                  ) : (
                                    <>
                                      <XMarkIcon className="h-3 w-3 text-red-500" />
                                      <span>لم يتم تحقيق سعر البيع</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        // للمزادات المباشرة - عرض المزايدة الحالية
                        <>
                          <div className="text-center">
                            <div className="mb-1 text-sm text-gray-500">المزايدة الحالية</div>
                            <div className="price-value auction-price-live rotate-0 scale-100 text-3xl font-bold transition-transform duration-500">
                              {formatNumber(carData.currentBid)}{' '}
                              <span className="text-lg">د.ل</span>
                            </div>
                            <div className="text-sm text-gray-500 transition-all duration-300">
                              <span className="inline-flex items-center gap-1">
                                <span>{carData.bidCount} مزايدة</span>
                                {carData.bidCount > 0 && (
                                  <div className="enhanced-ping-dot h-2 w-2 animate-ping rounded-full bg-blue-500"></div>
                                )}
                              </span>
                            </div>
                          </div>

                          <div className="text-center">
                            <div className="mb-1 text-sm text-gray-500">السعر الابتدائي</div>
                            <div className="text-lg text-gray-700">
                              {formatNumber(carData.startingBid)} د.ل
                            </div>
                          </div>

                          {/* عرض سعر البيع للمزادات المباشرة */}
                          {carData.reservePrice && (
                            <div className="text-center">
                              <div className="mb-1 text-sm text-gray-500">سعر البيع</div>
                              <div className="text-lg font-semibold text-orange-600">
                                {formatNumber(carData.reservePrice)} د.ل
                              </div>
                              <div className="mt-1 flex items-center justify-center gap-1 text-xs text-gray-500">
                                {parseNumericValue(carData.currentBid) >=
                                parseNumericValue(carData.reservePrice) ? (
                                  <>
                                    <CheckCircleIcon className="h-3 w-3 text-green-500" />
                                    <span>تم الوصول لسعر البيع</span>
                                  </>
                                ) : (
                                  <>
                                    <ClockIcon className="h-3 w-3 text-orange-500" />
                                    <span>لم يتم الوصول لسعر البيع بعد</span>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* أزرار المزايدة - معطلة للمزادات القادمة وصاحب الإعلان */}
                      {isCurrentUserOwner ? (
                        // رسالة تنبيه بسيطة لصاحب الإعلان
                        <div className="flex items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800">
                          <ExclamationTriangleIcon className="h-5 w-5 text-amber-600" />
                          <span className="text-sm font-medium">
                            هذا الإعلان خاص بك - لا يمكنك المزايدة عليه
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <button
                            onClick={
                              isElementInteractive('bidding_section') &&
                              currentAuctionStatus === 'live'
                                ? () => {
                                    requireLogin('للمشاركة في المزاد', () => {
                                      setShowBidModal(true);
                                    });
                                  }
                                : undefined
                            }
                            className={`flex w-full items-center justify-center gap-2 rounded-lg py-3 font-semibold transition-colors ${
                              currentAuctionStatus === 'upcoming'
                                ? 'cursor-not-allowed bg-yellow-400 text-yellow-800'
                                : currentAuctionStatus === 'ended'
                                  ? 'cursor-not-allowed bg-gray-400 text-gray-700'
                                  : !user
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                            } ${
                              !isElementInteractive('bidding_section') ||
                              currentAuctionStatus !== 'live'
                                ? 'cursor-not-allowed opacity-75'
                                : ''
                            }`}
                            disabled={
                              !isElementInteractive('bidding_section') ||
                              currentAuctionStatus !== 'live'
                            }
                          >
                            <HandRaisedIcon className="h-5 w-5" />
                            {currentAuctionStatus === 'upcoming' && 'المزاد لم يبدأ بعد'}
                            {currentAuctionStatus === 'ended' && 'انتهى المزاد'}
                            {currentAuctionStatus === 'sold' && 'تم البيع بنجاح'}
                            {currentAuctionStatus === 'live' &&
                              (!user ? 'سجل للمزايدة' : 'زايد الآن')}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {/* قائمة المزايدين المبسطة - تظهر للمزادات النشطة والمنتهية */}
              {isElementVisible('bid_history') &&
                ['live', 'ended', 'sold'].includes(currentAuctionStatus) && (
                  <div className="relative">
                    <SimpleBiddersList
                      key="real-bidders-list"
                      bidders={realBidders}
                      currentBid={(
                        carData?.currentBid ??
                        (carData as any)?.finalBid ??
                        0
                      ).toString()}
                      formatNumber={formatNumber}
                      isOwner={isCurrentUserOwner}
                      auctionStatus={currentAuctionStatus}
                      onAcceptBid={handleAcceptBid}
                      onContactBidder={handleContactBidder}
                      onMessageBidder={handleMessageBidder}
                      onRefresh={refetchBidders}
                    />

                    {/* مؤشر تحميل صغير في الزاوية - لا يخفي القائمة */}
                    {biddersLoading && realBidders.length > 0 && (
                      <div className="absolute left-4 top-4 z-10 rounded-full bg-white p-2 shadow-lg">
                        <SimpleSpinner size="xs" color="blue" />
                      </div>
                    )}

                    {/* رسالة خطأ بدون إخفاء القائمة */}
                    {biddersError && (
                      <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-3">
                        <p className="text-sm text-red-600">
                          خطأ في التحديث. يرجى المحاولة مرة أخرى.
                        </p>
                        <button
                          onClick={refetchBidders}
                          className="mt-2 rounded-md bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700"
                        >
                          إعادة المحاولة
                        </button>
                      </div>
                    )}
                  </div>
                )}

              {/* 🔥 أزرار الاتصال والمراسلة الثابتة - تظهر في جميع الحالات */}
              {!isCurrentUserOwner && (
                <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="mb-4">
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <PhoneIcon className="h-5 w-5 text-blue-600" />
                      تواصل مع البائع
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      اتصل أو راسل البائع للاستفسار عن السيارة
                    </p>
                  </div>

                  <div className="space-y-3">
                    {/* زر موحّد لإظهار/كشف رقم الهاتف */}
                    <RevealPhoneButton
                      phone={(carData as any).contactPhone || (carData.seller as any)?.phone}
                      size="lg"
                      fullWidth
                      ariaLabel="إظهار رقم الهاتف"
                    />

                    {/* زر إرسال رسالة */}
                    <button
                      onClick={handleChatClick}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white shadow-md transition-all duration-200 hover:bg-blue-700 active:scale-95"
                    >
                      <ChatBubbleLeftRightIcon className="h-5 w-5" />
                      إرسال رسالة
                    </button>

                    {/* أزرار الاتصال المباشر للموبايل */}
                    <div className="grid grid-cols-2 gap-2 md:hidden">
                      <RevealPhoneButton
                        phone={(carData as any).contactPhone || (carData.seller as any)?.phone}
                        size="md"
                        fullWidth
                        ariaLabel="إظهار رقم الهاتف"
                      />

                      <button
                        onClick={() => {
                          const phone =
                            (carData as any).contactPhone || (carData.seller as any)?.phone;
                          if (phone) {
                            window.open(
                              `https://wa.me/218${phone?.replace(/[^0-9]/g, '').substring(1)}`,
                              '_blank',
                            );
                          }
                        }}
                        className="flex items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-2 font-medium text-white transition-all duration-200 hover:bg-green-600 active:scale-95"
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.309" />
                        </svg>
                        واتساب
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 💡 رسالة لصاحب الإعلان - تظهر بدلاً من أزرار التواصل */}
              {isCurrentUserOwner && (
                <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <InformationCircleIcon className="h-6 w-6 flex-shrink-0 text-blue-600" />
                    <div>
                      <h3 className="font-semibold text-blue-900">هذا إعلانك</h3>
                      <p className="mt-1 text-sm text-blue-700">
                        يمكنك متابعة المزايدات وإدارة المزاد من لوحة التحكم أدناه
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* عرض حالة البيع المؤكد - يظهر عندما يكون المزاد مباعاً */}
              {currentAuctionStatus === 'sold' && confirmedSale && isCurrentUserOwner && (
                <SaleConfirmedStatus
                  buyerInfo={{
                    id: confirmedSale.buyerId,
                    name: confirmedSale.buyerName,
                    phone: '0912-345-678', // يمكن جلبها من قاعدة البيانات
                    isVerified: true,
                  }}
                  saleDetails={{
                    amount: confirmedSale.amount,
                    confirmedAt: confirmedSale.confirmedAt,
                    paymentDeadline: confirmedSale.paymentDeadline,
                  }}
                  formatNumber={formatNumber}
                  onContactBuyer={handleContactBuyer}
                  onViewPaymentDetails={handleViewPaymentDetails}
                  onPaymentTimeUp={handlePaymentTimeUp}
                />
              )}

              {/* لوحة تحكم صاحب الإعلان - مصغرة ومحسنة */}
              {isCurrentUserOwner && (
                <CompactAuctionOwnerPanel
                  isOwner={true}
                  auctionId={router.query.id as string}
                  auctionStatus={
                    currentAuctionStatus === 'live' ? 'active' : (currentAuctionStatus as any)
                  }
                  stats={{
                    totalViews: carData.viewCount || 0,
                    uniqueVisitors: Math.floor((carData.viewCount || 0) * 0.7),
                    totalBidders: Array.isArray(realBidders) ? realBidders.length : 0,
                    verifiedBidders: Array.isArray(realBidders)
                      ? realBidders.filter((b) => b.isVerified).length
                      : 0,
                    totalBids: carData.bidCount || 0,
                    averageBidIncrease: 500,
                    highestBid: parseNumericValue(carData.currentBid || carData.startingBid),
                    reservePrice: parseNumericValue(carData.reservePrice || '0'),
                    timeRemaining: '2 ساعة 30 دقيقة',
                    watchlistCount: carData.watchlistCount || 0,
                  }}
                  formatNumber={formatNumber}
                  onStatusChange={handleStatusChange}
                  onAcceptHighestBid={handleAcceptHighestBid}
                  onEndAuction={handleEndAuction}
                  onRelistAuction={handleRelistAuction}
                  onEditListing={handleEditListing}
                  onShareListing={handleShareListing}
                  onViewReports={handleViewReports}
                />
              )}

              {/* الإحصائيات التفصيلية لصاحب الإعلان - مصغرة ومحسنة */}
              {isCurrentUserOwner && (
                <CompactDetailedStats
                  stats={{
                    totalViews: carData.viewCount || 0,
                    uniqueVisitors: Math.floor((carData.viewCount || 0) * 0.7),
                    viewsToday: Math.floor((carData.viewCount || 0) * 0.1),
                    viewsThisWeek: Math.floor((carData.viewCount || 0) * 0.4),
                    averageViewDuration: '2:30',
                    totalBidders: sampleBidders.length,
                    verifiedBidders: sampleBidders.filter((b) => b.isVerified).length,
                    newBiddersToday: Math.floor(sampleBidders.length * 0.2),
                    returningBidders: Math.floor(sampleBidders.length * 0.8),
                    totalBids: carData.bidCount || 0,
                    bidsToday: Math.floor((carData.bidCount || 0) * 0.3),
                    averageBidIncrease: 500,
                    highestBid: parseNumericValue(carData.currentBid || carData.startingBid),
                    lowestBid: parseNumericValue(carData.startingBid),
                    bidFrequency: 2.5,
                    watchlistCount: carData.watchlistCount || 0,
                    sharesCount: Math.floor((carData.viewCount || 0) * 0.05),
                    inquiriesCount: Math.floor((carData.viewCount || 0) * 0.02),
                    phoneCallsCount: Math.floor((carData.viewCount || 0) * 0.01),
                    mobileViews: Math.floor((carData.viewCount || 0) * 0.75),
                    desktopViews: Math.floor((carData.viewCount || 0) * 0.25),
                    topCities: ['طرابلس', 'بنغازي', 'مصراتة', 'الزاوية'],
                    peakHours: ['10:00-12:00', '15:00-17:00', '20:00-22:00'],
                    timeRemaining: '2 ساعة 30 دقيقة',
                    auctionDuration: '3 أيام',
                  }}
                  formatNumber={formatNumber}
                  isVisible={showDetailedStats}
                  onToggle={() => setShowDetailedStats(!showDetailedStats)}
                />
              )}

              {/* رسالة للمزادات القادمة */}
              {currentAuctionStatus === 'upcoming' && (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 shadow-sm">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
                      <ClockIcon className="h-8 w-8 text-yellow-600" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-yellow-800">
                      المزاد لم يبدأ بعد
                    </h3>
                    <p className="mb-4 text-yellow-700">
                      سيبدأ هذا المزاد قريباً. يمكنك مراجعة تفاصيل السيارة والاستعداد للمزايدة.
                    </p>
                    <div className="rounded-lg bg-yellow-100 p-3 text-sm text-yellow-600">
                      <strong>نصيحة:</strong> تأكد من تسجيل دخولك وإعداد وسيلة الدفع مسبقاً لتكون
                      جاهزاً عند بداية المزاد
                    </div>
                  </div>
                </div>
              )}

              {/* رسالة للمزادات المنتهية */}
              {currentAuctionStatus === 'ended' && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                      <TrophyIcon className="h-8 w-8 text-gray-600" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-gray-800">انتهى المزاد</h3>
                    <p className="mb-4 text-gray-700">
                      لقد انتهى هذا المزاد.{' '}
                      {carData.buyerName ? `المشتري هو ${carData.buyerName}` : 'تم إغلاق المزاد'}
                    </p>
                    <div
                      className={`grid gap-4 text-sm ${carData.reservePrice ? 'grid-cols-3' : 'grid-cols-2'}`}
                    >
                      <div className="rounded-lg border bg-white p-3">
                        <div className="mb-1 text-gray-500">السعر النهائي</div>
                        <div className="font-bold text-green-600">
                          {formatNumber(carData.finalBid || carData.currentBid)} د.ل
                        </div>
                      </div>
                      <div className="rounded-lg border bg-white p-3">
                        <div className="mb-1 text-gray-500">عدد المزايدات</div>
                        <div className="font-bold text-gray-800">{carData.bidCount}</div>
                      </div>
                      {carData.reservePrice && (
                        <div className="rounded-lg border bg-white p-3">
                          <div className="mb-1 text-gray-500">سعر البيع</div>
                          <div className="font-bold text-orange-600">
                            {formatNumber(carData.reservePrice)} د.ل
                          </div>
                          <div className="mt-1 flex items-center justify-center gap-1 text-xs">
                            {(parseNumericValue(carData.finalBid) ||
                              parseNumericValue(carData.currentBid)) >=
                            parseNumericValue(carData.reservePrice) ? (
                              <>
                                <CheckCircleIcon className="h-3 w-3 text-green-500" />
                                <span className="text-green-600">تحقق</span>
                              </>
                            ) : (
                              <>
                                <XMarkIcon className="h-3 w-3 text-red-500" />
                                <span className="text-red-600">لم يتحقق</span>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 🏆 رسالة خاصة للفائز - تظهر فقط للمزايد الذي فاز بالمزاد */}
              {currentAuctionStatus === 'sold' && isCurrentUserWinner && !isCurrentUserOwner && (
                <WinnerCongratulationsCard
                  carTitle={
                    carData?.title ||
                    `${carData?.brand || ''} ${carData?.model || ''} ${carData?.year || ''}`.trim() ||
                    'السيارة'
                  }
                  finalPrice={carData.finalBid || carData.currentBid || '0'}
                  sellerName={quickDecodeName((carData?.seller as any)?.name || 'البائع')}
                  sellerPhone={(carData as any)?.contactPhone || (carData?.seller as any)?.phone}
                  formatNumber={formatNumber}
                  onContactSeller={() => {
                    const phone = (carData as any)?.contactPhone || (carData?.seller as any)?.phone;
                    if (phone) {
                      handlePhoneClickUnified({
                        phone,
                        directCall: true,
                        showWhatsApp: true,
                        context: 'winner-contact-seller',
                      });
                    }
                  }}
                  onMessageSeller={() => {
                    if (carData?.sellerId) {
                      handleMessageBidder(
                        String(carData.sellerId),
                        quickDecodeName((carData?.seller as any)?.name || 'البائع'),
                      );
                    }
                  }}
                />
              )}

              {/* رسالة للمزادات المباعة - للجميع ما عدا المشتري */}
              {currentAuctionStatus === 'sold' && !isCurrentUserWinner && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 sm:p-6">
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 sm:mb-4 sm:h-16 sm:w-16">
                      <CheckCircleIcon className="h-6 w-6 text-green-600 sm:h-8 sm:w-8" />
                    </div>
                    <h3 className="mb-2 text-base font-semibold text-green-800 sm:text-lg">
                      تم البيع بنجاح!
                    </h3>
                    <p className="mb-3 text-sm text-green-700 sm:mb-4 sm:text-base">
                      {carData.buyerName ? (
                        <>
                          <TrophyIcon className="ml-1 inline h-4 w-4 text-yellow-500 sm:h-5 sm:w-5" />
                          المشتري: <strong>{quickDecodeName(carData.buyerName)}</strong>
                        </>
                      ) : (
                        'تم إتمام الصفقة بنجاح'
                      )}
                    </p>

                    {/* بطاقة سعر البيع فقط */}
                    <div className="mx-auto max-w-xs">
                      <div className="rounded-lg border border-green-300 bg-white p-3 sm:p-4">
                        <div className="mb-2 text-xs text-gray-500 sm:text-sm">
                          سعر البيع النهائي
                        </div>
                        <div className="text-xl font-bold text-green-600 sm:text-2xl">
                          {formatNumber(carData.finalBid || carData.currentBid)} د.ل
                        </div>
                      </div>
                    </div>

                    {/* معلومات إضافية للبيع */}
                    <div className="mt-3 rounded-lg bg-green-100 p-2.5 sm:mt-4 sm:p-3">
                      <p className="text-xs leading-relaxed text-green-700 sm:text-sm">
                        {isCurrentUserOwner ? (
                          <>
                            <strong>تمت الصفقة!</strong> يمكنك التواصل مع المشتري لترتيب التسليم.
                          </>
                        ) : (
                          <>
                            <strong>شكراً لمشاركتك!</strong> نأمل أن تجد ما يناسبك في مزاداتنا
                            القادمة.
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* معلومات البائع - للشاشات الكبيرة */}
              {carData.seller && !isCurrentUserOwner && (
                <ImprovedSellerInfoCard
                  className="hidden lg:block"
                  seller={{
                    id: (carData.seller as any).id || 'unknown',
                    name: (carData.seller as any).name,
                    phone:
                      (carData as any).contactPhone || (carData.seller as any).phone || 'غير متوفر',
                    profileImage: (carData.seller as any).avatar,
                    verified: (carData.seller as any).verified,
                    accountType: (carData.seller as any).accountType,
                    rating: (carData.seller as any).rating,
                    reviewsCount: (carData.seller as any).reviews,
                    city: (carData as any).location || (carData as any).locationAddress,
                    activeListings: (carData.seller as any).activeListings,
                  }}
                  clickable
                  showActions
                  onContact={() => {
                    const phone = (carData as any).contactPhone || (carData.seller as any).phone;
                    if (phone) {
                      window.open(`tel:${phone}`, '_self');
                    }
                  }}
                  onMessage={() => {
                    if (carData?.sellerId) {
                      handleMessageBidder(
                        String(carData.sellerId),
                        quickDecodeName((carData?.seller as any)?.name || 'البائع'),
                      );
                    }
                  }}
                />
              )}

              <div className="rounded-lg bg-white p-5 shadow-sm">
                <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-900">
                  <InformationCircleIcon className="h-5 w-5 text-blue-600" />
                  معلومات عامة
                </h3>
                <div className="space-y-2">
                  {/* عدد المشاهدات */}
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100">
                    <span className="text-sm font-medium text-gray-600">المشاهدات</span>
                    <div className="flex items-center gap-1">
                      <EyeIcon className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-semibold text-gray-900">
                        {carData.viewCount || 0}
                      </span>
                    </div>
                  </div>

                  {/* معرف المزاد */}
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100">
                    <span className="text-sm font-medium text-gray-600">رقم المزاد</span>
                    <span className="font-mono text-sm font-semibold text-gray-900">
                      #{carData.id}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bid Modal - تظهر فقط للمزادات المباشرة وليس لصاحب الإعلان */}
        {false && showBidModal && currentAuctionStatus === 'live' && !isCurrentUserOwner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">زيادة مزايدة جديدة</h3>
                <button
                  onClick={() => setShowBidModal(false)}
                  className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-3">
                <div className="mb-2 rounded-lg border border-blue-200 bg-blue-50 p-2">
                  <div className="mb-1 text-xs text-blue-800">
                    المزايدة الحالية:{' '}
                    <span className="text-sm font-bold">
                      {formatNumber(carData.currentBid)} د.ل
                    </span>
                  </div>
                  <div className="text-xs text-blue-600">
                    الحد الأدنى للزيادة: <span className="font-semibold">250 د.ل</span>
                  </div>
                </div>

                <label className="mb-1 block text-xs font-medium text-gray-700">
                  كم تريد أن تزيد؟
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={bidIncrease}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^\d,]/g, '');
                      setBidIncrease(value);
                    }}
                    placeholder="مثال: 500"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-12 text-sm font-semibold focus:border-green-500 focus:ring-2 focus:ring-green-500"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 transform text-sm font-medium text-gray-500">
                    د.ل
                  </div>
                </div>

                {/* عرض المبلغ النهائي */}
                {bidIncrease && (
                  <div className="mt-2 rounded-lg border border-green-200 bg-green-50 p-2">
                    <div className="mb-1 text-xs text-green-800">المبلغ النهائي:</div>
                    <div className="text-sm font-bold text-green-700">
                      {(() => {
                        const increaseAmount = parseInt(bidIncrease.replace(/[,\s]/g, '')) || 0;
                        const currentAmount = parseNumericValue(carData.currentBid);
                        const finalAmount = currentAmount + increaseAmount;
                        return formatNumber(finalAmount.toString());
                      })()}{' '}
                      د.ل
                    </div>
                    <div className="text-xs text-green-600">
                      ({formatNumber(carData.currentBid)} + {formatNumber(bidIncrease)} = المبلغ
                      النهائي)
                    </div>
                  </div>
                )}

                {/* أزرار الزيادات المقترحة */}
                <div className="mt-2">
                  <div className="mb-1 text-xs text-gray-500">زيادات مقترحة:</div>
                  <div className="flex flex-wrap gap-1">
                    {[250, 500, 1000, 2500, 5000].map((increase, index) => (
                      <button
                        key={index}
                        onClick={() => setBidIncrease(formatNumber(increase.toString()))}
                        className="rounded-full bg-gray-100 px-2 py-1 text-xs transition-colors hover:bg-gray-200"
                      >
                        +{formatNumber(increase.toString())}
                      </button>
                    ))}
                  </div>
                </div>

                {bidIncrease && (
                  <div className="mt-1 text-xs">
                    {(() => {
                      const increaseAmount = parseInt(bidIncrease.replace(/[,\s]/g, ''));
                      const currentAmount = parseNumericValue(carData.currentBid);

                      if (isNaN(increaseAmount)) {
                        return (
                          <span className="flex items-center gap-1 text-red-600">
                            <ExclamationTriangleIcon className="h-3 w-3" />
                            يرجى إدخال رقم صحيح
                          </span>
                        );
                      } else if (increaseAmount <= 0) {
                        return (
                          <span className="flex items-center gap-1 text-red-600">
                            <ExclamationTriangleIcon className="h-3 w-3" />
                            يجب أن تكون الزيادة أكبر من صفر
                          </span>
                        );
                      } else if (increaseAmount < 250) {
                        return (
                          <span className="flex items-center gap-1 text-yellow-600">
                            <ExclamationTriangleIcon className="h-3 w-3" />
                            الحد الأدنى للزيادة هو 250 د.ل
                          </span>
                        );
                      } else {
                        const finalAmount = currentAmount + increaseAmount;
                        return (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircleIcon className="h-3 w-3" />
                            زيادة صحيحة - المبلغ النهائي: {formatNumber(finalAmount.toString())} د.ل
                          </span>
                        );
                      }
                    })()}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleBidSubmit}
                  disabled={isSubmittingBid}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmittingBid ? (
                    <div
                      className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                      style={{ width: 24, height: 24 }}
                      role="status"
                      aria-label="جاري التحميل"
                    />
                  ) : bidIncrease ? (
                    `زايد بـ ${formatNumber(bidIncrease)} د.ل`
                  ) : (
                    'تأكيد المزايدة'
                  )}
                </button>
                <button
                  onClick={() => setShowBidModal(false)}
                  disabled={isSubmittingBid}
                  className="rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        {/* نافذة تسجيل الدخول */}
        <LoginModal
          isOpen={showAuthModal}
          onClose={handleAuthClose}
          onLoginSuccess={handleAuthSuccess}
        />

        {/* نافذة المشاركة */}
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          title={carData.title}
          description={`${carData?.brand || carData?.car?.brand || ''} ${carData?.model || carData?.car?.model || ''} ${carData?.year || carData?.car?.year || ''} - المزايدة الحالية: ${carData.currentBid} د.ل`}
          url={typeof window !== 'undefined' ? window.location.href : ''}
          imageUrl={
            Array.isArray(carData?.images) && carData.images[0] ? carData.images[0] : undefined
          }
        />

        {/* نافذة تأكيد موحدة - تم الاستعاضة عنها بدالة confirmWithModal الموجودة */}
        {confirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">تأكيد المزايدة</h3>
              <p className="mb-6 text-gray-700">{confirmMessage}</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleConfirmClose}
                  className="rounded-lg bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleConfirmYes}
                  className="rounded-lg bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
                >
                  تأكيد
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 🎯 نافذة تأكيد البيع - عرض السعر بشكل واضح */}
        {showSaleConfirmModal && pendingSale && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50 p-4 pt-24">
            <div className="relative my-8 max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-2xl">
              {/* رأس النافذة */}
              <div className="sticky top-0 z-10 rounded-t-2xl bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 rounded-full bg-white p-2">
                    <TrophyIcon className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">تأكيد البيع</h3>
                    <p className="text-sm text-emerald-50">هل أنت متأكد من إتمام البيع؟</p>
                  </div>
                </div>
              </div>

              {/* محتوى النافذة */}
              <div className="space-y-4 p-5">
                {/* معلومات المشتري */}
                <div className="rounded-lg border-2 border-gray-200 bg-gray-50 p-3">
                  <div className="mb-1 text-xs text-gray-600">المشتري</div>
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-base font-semibold text-gray-900">
                      {quickDecodeName(pendingSale.bidderName)}
                    </span>
                  </div>
                </div>

                {/* سعر البيع - كبير وواضح */}
                <div className="rounded-xl border-4 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-5 text-center">
                  <div className="mb-1 text-xs font-medium text-gray-600">سعر البيع النهائي</div>
                  <div className="mb-1 text-4xl font-bold text-green-600">
                    {formatNumber(pendingSale.amount)}
                  </div>
                  <div className="text-xl font-semibold text-green-700">دينار ليبي</div>
                </div>

                {/* تحذير وملاحظة */}
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <div className="flex gap-3">
                    <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                    <div className="text-sm text-amber-800">
                      <p className="mb-1 font-semibold">ملاحظة هامة:</p>
                      <ul className="list-inside list-disc space-y-1">
                        <li>سيتم تأكيد البيع بشكل نهائي</li>
                        <li>سيتم إشعار المشتري فوراً</li>
                        <li>لديه 24 ساعة لتأكيد الدفع</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* أزرار التحكم */}
              <div className="sticky bottom-0 z-10 rounded-b-2xl border-t border-gray-200 bg-gray-50 px-6 py-4">
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowSaleConfirmModal(false);
                      setPendingSale(null);
                    }}
                    disabled={isConfirmingSale}
                    className="flex-1 rounded-xl border-2 border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={confirmAcceptBid}
                    disabled={isConfirmingSale}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-4 py-3 font-bold text-white shadow-lg transition-all hover:from-emerald-700 hover:to-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isConfirmingSale ? (
                      <>
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        <span>جاري التأكيد...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="h-5 w-5" />
                        <span>تأكيد البيع</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* نافذة خيارات إعادة طرح المزاد */}
        <RelistOptionsModal
          isOpen={relistModalOpen}
          onClose={() => setRelistModalOpen(false)}
          onConfirm={handleRelistConfirm}
        />
      </div>
    </div>
  );
};

// export default AuctionCarDetails; // تم نقله لنهاية الملف

// استخدام client-side rendering للمرونة في التعامل مع المعرفات الديناميكية

export default AuctionCarDetails;
