import {
  ChatBubbleLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  FlagIcon,
  PlusIcon,
  StarIcon as StarOutline,
  UserIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import React, { useCallback, useEffect, useState } from 'react';
import UserAvatar from '../UserAvatar';
import LoginModal from '../auth/LoginModal';
import { WarningIcon } from '../ui/icons/NotificationIcons';

interface User {
  id: string;
  userId?: string;
  name?: string;
  fullName?: string;
  phone?: string;
  email?: string;
  profileImage?: string;
  verified?: boolean;
}

interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  isHelpful?: number;
  isNotHelpful?: number;
  reviewer?: {
    id?: string;
    name?: string;
    profileImage?: string;
    verified?: boolean;
  };
  replies?: Review[];
}

interface ReviewsAndRatingsProps {
  /** معرف العنصر المراد تقييمه */
  itemId: string;
  /** نوع العنصر (car, auction, transport, showroom, company, user) */
  itemType: 'car' | 'auction' | 'company' | 'user' | 'showroom' | 'transport';
  /** عنوان العنصر */
  itemTitle?: string;
  /** معرف المستخدم المستهدف (البائع/مقدم الخدمة) */
  targetUserId?: string;
  /** فئات CSS إضافية */
  className?: string;
  /** تمكين التقييم السريع (افتراضي: true) */
  canQuickReview?: boolean;
  /** إظهار قسم التقييم السريع (افتراضي: true) */
  showQuickRating?: boolean;
  /** إظهار إحصائيات التقييم (افتراضي: true) */
  showRatingStats?: boolean;
}

const ReviewsAndRatings: React.FC<ReviewsAndRatingsProps> = ({
  itemId,
  itemType,
  itemTitle,
  targetUserId,
  className = '',
  canQuickReview: _canQuickReview = true,
  showQuickRating: _showQuickRating = true,
  showRatingStats: _showRatingStats = true,
}) => {
  // حالة المستخدم
  const [user, setUser] = useState<User | null>(null);

  // حالة البيانات الأساسية
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
  }>({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: {},
  });

  // حالة النموذج
  const [showForm, setShowForm] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // حالة الإشعارات
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'info';
    message: string;
  }>({ show: false, type: 'info', message: '' });

  // دالة عرض الإشعار
  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ show: true, type, message });

    // إشعار صوتي للأخطاء المهمة (التقييم المكرر)
    if (type === 'error' && message.includes('مسبقاً')) {
      // تنبيه صوتي بسيط باستخدام Web Audio API
      if (typeof window !== 'undefined') {
        try {
          // إنشاء تنبيه صوتي بسيط
          const AudioContextClass =
            (window as typeof window & { webkitAudioContext?: typeof AudioContext }).AudioContext ||
            (window as typeof window & { webkitAudioContext?: typeof AudioContext })
              .webkitAudioContext;
          if (!AudioContextClass) return;
          const audioContext = new AudioContextClass();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);

          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);

          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.2);
        } catch (error) {
          // إذا فشل الصوت، استخدم تنبيه المتصفح الافتراضي
          console.log('تنبيه: لقد قمت بتقييم هذا العنصر مسبقاً');
        }
      }
    }

    // مدة أطول للأخطاء المهمة مثل التقييم المكرر
    const duration = type === 'error' && message.includes('مسبقاً') ? 6000 : 3000;

    setTimeout(() => {
      setNotification({ show: false, type: 'info', message: '' });
    }, duration);
  };

  // حالة التقييم السريع
  const [quickRating, setQuickRating] = useState(0);
  const [quickSubmitting, setQuickSubmitting] = useState(false);

  // حالة نافذة تسجيل الدخول
  const [showLoginModal, setShowLoginModal] = useState(false);

  // حالة نافذة التقييم المكرر
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  // حالة الردود على التعليقات
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [replySubmitting, setReplySubmitting] = useState<boolean>(false);

  // تحميل بيانات المستخدم
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('خطأ في تحليل بيانات المستخدم:', error);
      }
    }
  }, []);

  // جلب التقييمات من الخادم مع إجبار التحديث
  const fetchReviews = useCallback(
    async (forceRefresh: boolean = false) => {
      if (!itemId || !itemType) return;

      setLoading(true);
      setError(null);

      try {
        // console.log('🔄 [جلب التقييمات] بدء جلب التقييمات...'); // معطل
        // console.log(
        //   '🔄 [Force Refresh]',
        //   forceRefresh ? 'نعم - تجاهل Cache' : 'لا - استخدام Cache',
        // ); // معطل

        const params = new URLSearchParams({
          itemId,
          itemType,
          limit: '50',
          offset: '0',
        });

        // إضافة معامل لإجبار التحديث
        if (forceRefresh) {
          params.append('_t', Date.now().toString());
        }

        // console.log('🔄 [جلب التقييمات] المعاملات:', { itemId, itemType, forceRefresh }); // معطل

        const response = await fetch(`/api/reviews?${params}`);
        const data = await response.json();

        // console.log('📥 [جلب التقييمات] الاستجابة:', data); // معطل

        if (data.success) {
          const reviewsData = data.data?.reviews || [];
          // console.log('📝 [جلب التقييمات] التقييمات المجلبة:', reviewsData); // معطل

          setReviews(reviewsData);
          setStats({
            averageRating: data.data?.averageRating || 0,
            totalReviews: data.data?.totalReviews || 0,
            ratingDistribution: data.data?.ratingDistribution || {},
          });

          // console.log('✅ [جلب التقييمات] تم تحديث الحالة بنجاح'); // معطل
          // console.log('📊 [جلب التقييمات] State بعد التحديث:', {
          //   reviewsCount: reviewsData.length,
          //   statsTotal: data.data?.totalReviews || 0,
          //   avgRating: data.data?.averageRating || 0,
          // }); // معطل
        } else {
          console.error('❌ [جلب التقييمات] فشل:', data.error);
          setError(data.error || 'فشل في جلب التقييمات');
        }
      } catch (error) {
        console.error('❌ [جلب التقييمات] خطأ:', error);
        setError('حدث خطأ أثناء جلب التقييمات');
      } finally {
        setLoading(false);
      }
    },
    [itemId, itemType],
  );

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // إرسال تقييم جديد
  const submitReview = async () => {
    if (!user) {
      showNotification('error', 'يجب تسجيل الدخول لإضافة تقييم');
      return;
    }

    if (newRating === 0) {
      showNotification('error', 'يرجى اختيار تقييم من النجوم');
      return;
    }

    // منع الإرسال إذا كانت التقييمات معطلة (مثلاً: مالك الإعلان)
    if (!_canQuickReview) {
      showNotification('error', 'إضافة التقييم غير متاحة لهذا العنصر');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');

      console.log('🔑 [Token Debug] token من localStorage:', token ? 'موجود' : 'مفقود');
      console.log('🔑 [Token Debug] طول token:', token ? token.length : 0);
      console.log(
        '🔑 [Token Debug] أول 20 حرف:',
        token ? token.substring(0, 20) + '...' : 'لا يوجد',
      );

      if (!token) {
        showNotification('error', 'جلسة المستخدم منتهية - يرجى تسجيل الدخول مرة أخرى');
        return;
      }

      console.log('🚀 [إرسال تقييم] البيانات:', {
        rating: newRating,
        comment: newComment.trim(),
        targetUserId: targetUserId && targetUserId.trim() ? targetUserId : undefined,
        itemId,
        itemType,
      });

      const payloadBase = {
        rating: newRating,
        comment: newComment.trim() || '',
        itemId,
        itemType,
      } as Record<string, unknown>;
      const payload =
        targetUserId && targetUserId.trim() ? { ...payloadBase, targetUserId } : payloadBase;

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('📥 [استجابة API] البيانات:', data);

      if (response.ok && data.success) {
        console.log('✅ [Review Created] التقييم تم إنشاؤه بنجاح، إعادة جلب البيانات...');

        // تأخير بسيط لضمان تحديث الـ cache
        await new Promise((resolve) => setTimeout(resolve, 200));

        // إعادة جلب التقييمات مع إجبار التحديث
        await fetchReviews(true);

        // تنظيف النموذج
        setNewRating(0);
        setNewComment('');
        setShowForm(false);
        showNotification('success', 'تم إرسال التقييم بنجاح');

        console.log('🔄 [After Submit] تم تحديث البيانات بعد إرسال التقييم');
      } else {
        let errorMessage = data.error || 'فشل في إرسال التقييم';

        // تخصيص رسالة الخطأ لحالة التقييم المكرر
        if (errorMessage.includes('مسبقاً') || errorMessage.includes('already rated')) {
          errorMessage =
            'تنبيه: لقد قمت بتقييم هذا العنصر مسبقاً!\n\nيمكنك تعديل تقييمك السابق أو حذفه من قائمة التقييمات أدناه.';
          // إظهار النافذة المنبثقة للتقييم المكرر
          setShowDuplicateModal(true);
        }

        console.error('[خطأ API]:', errorMessage);
        showNotification('error', errorMessage);
      }
    } catch (error: unknown) {
      console.error('[خطأ في إرسال التقييم]:', error);
      const errorMessage =
        (error as Error).message === 'غير مصرح'
          ? 'جلسة المستخدم منتهية - يرجى تسجيل الدخول مرة أخرى'
          : 'حدث خطأ في الاتصال - يرجى المحاولة مرة أخرى';
      showNotification('error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // إرسال تقييم سريع
  const submitQuickRating = async () => {
    if (!user) {
      showNotification('error', 'يجب تسجيل الدخول لإضافة تقييم');
      return;
    }

    if (quickRating === 0) {
      showNotification('error', 'يرجى اختيار تقييم');
      return;
    }

    setQuickSubmitting(true);

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        showNotification('error', 'جلسة المستخدم منتهية - يرجى تسجيل الدخول مرة أخرى');
        return;
      }

      console.log('⚡ [تقييم سريع] البيانات:', {
        rating: quickRating,
        itemId,
        itemType,
        reviewerId: user.id || user.userId,
      });

      const quickPayloadBase = {
        rating: quickRating,
        comment: '',
        itemId,
        itemType,
      } as Record<string, unknown>;
      const quickPayload =
        targetUserId && targetUserId.trim()
          ? { ...quickPayloadBase, targetUserId }
          : quickPayloadBase;

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(quickPayload),
      });

      const data = await response.json();
      console.log('📥 [استجابة API تقييم سريع] البيانات:', data);

      if (response.ok && data.success) {
        console.log('✅ [Quick Rating Created] التقييم السريع تم إنشاؤه بنجاح...');

        // تأخير بسيط لضمان تحديث الـ cache
        await new Promise((resolve) => setTimeout(resolve, 200));

        // إعادة جلب التقييمات مع إجبار التحديث
        await fetchReviews(true);

        setQuickRating(0);
        showNotification('success', 'تم إرسال التقييم السريع بنجاح');
      } else {
        let errorMessage = data.error || 'فشل في إرسال التقييم السريع';

        // تخصيص رسالة الخطأ لحالة التقييم المكرر
        if (errorMessage.includes('مسبقاً') || errorMessage.includes('already rated')) {
          errorMessage =
            'تنبيه: لقد قمت بتقييم هذا العنصر مسبقاً!\n\nيمكنك تعديل تقييمك السابق أو حذفه من قائمة التقييمات أدناه.';
          // إظهار النافذة المنبثقة للتقييم المكرر
          setShowDuplicateModal(true);
        }

        console.error('❌ [خطأ API تقييم سريع]:', errorMessage);
        showNotification('error', errorMessage);
      }
    } catch (error: unknown) {
      console.error('❌ [خطأ في التقييم السريع]:', error);
      const errorMessage =
        (error as Error).message === 'غير مصرح'
          ? 'جلسة المستخدم منتهية - يرجى تسجيل الدخول مرة أخرى'
          : 'حدث خطأ في الاتصال - يرجى المحاولة مرة أخرى';
      showNotification('error', errorMessage);
    } finally {
      setQuickSubmitting(false);
    }
  };

  // إرسال رد على تعليق
  const submitReply = async (parentReviewId: string) => {
    if (!user) {
      showNotification('error', 'يجب تسجيل الدخول لإضافة رد');
      setShowLoginModal(true);
      return;
    }

    if (!replyText.trim()) {
      showNotification('error', 'يرجى كتابة الرد');
      return;
    }

    setReplySubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification('error', 'جلسة المستخدم منتهية - يرجى تسجيل الدخول مرة أخرى');
        return;
      }

      const replyPayloadBase = {
        rating: 0,
        comment: replyText,
        itemId,
        itemType,
        parentId: parentReviewId,
      } as Record<string, unknown>;
      const replyPayload =
        targetUserId && targetUserId.trim()
          ? { ...replyPayloadBase, targetUserId }
          : replyPayloadBase;

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(replyPayload),
      });

      const data = await response.json();

      if (data.success) {
        // إعادة جلب التقييمات
        await fetchReviews(true);

        // إعادة تعيين النموذج
        setReplyText('');
        setReplyingToId(null);

        showNotification('success', 'تم إضافة الرد بنجاح');
      } else {
        const errorMessage = data.error || 'فشل في إضافة الرد';
        showNotification('error', errorMessage);
      }
    } catch (error: unknown) {
      console.error('❌ [خطأ في إرسال الرد]:', error);
      showNotification('error', 'حدث خطأ في الاتصال - يرجى المحاولة مرة أخرى');
    } finally {
      setReplySubmitting(false);
    }
  };

  // رسم النجوم
  const renderStars = (
    rating: number,
    interactive: boolean = false,
    onRatingChange?: (rating: number) => void,
    size: 'sm' | 'md' | 'lg' = 'md',
  ) => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
    };

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
            className={`${
              interactive ? 'cursor-pointer transition-transform hover:scale-110' : 'cursor-default'
            }`}
            disabled={!interactive}
            type="button"
          >
            {star <= rating ? (
              <StarSolid className={`${sizeClasses[size]} text-amber-500`} />
            ) : (
              <StarOutline className={`${sizeClasses[size]} text-gray-300`} />
            )}
          </button>
        ))}
      </div>
    );
  };

  // استخدام الإحصائيات من API بدلاً من الحساب المحلي
  const ratedReviews = reviews.filter((r) => r.rating > 0);
  const averageRating = stats.averageRating;
  const totalReviews = stats.totalReviews;

  // توزيع التقييمات من API
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: stats.ratingDistribution[rating] || 0,
    percentage:
      totalReviews > 0 ? ((stats.ratingDistribution[rating] || 0) / totalReviews) * 100 : 0,
  }));

  // إعدادات العرض
  // تفعيل التقييم السريع يعتمد على الخاصية المستلمة من المكوّن الأب
  const showQuickRating = Boolean(_canQuickReview && _showQuickRating);
  // إظهار إحصائيات التقييم
  const showRatingStats = Boolean(_showRatingStats);

  // تقليل console spam - معطل بالكامل
  // if (Math.random() < 0.01) {
  //   console.log('🎯 [عرض التقييمات] البيانات النهائية:', {
  //     reviewsArray: reviews.length,
  //     averageRating,
  //     totalReviews,
  //     ratingDistribution: stats.ratingDistribution,
  //   });
  // }

  return (
    <>
      {/* إشعار Toast */}
      {notification.show && (
        <div className="fixed right-4 top-4 z-50 animate-bounce">
          <div
            className={`flex items-center gap-3 rounded-lg border-2 px-6 py-4 shadow-xl ${
              notification.type === 'success'
                ? 'border-green-400 bg-green-600 text-white'
                : notification.type === 'error'
                  ? 'animate-pulse border-red-400 bg-red-600 text-white'
                  : 'border-blue-400 bg-blue-600 text-white'
            }`}
            style={{
              minWidth: '300px',
              boxShadow:
                notification.type === 'error' ? '0 0 20px rgba(239, 68, 68, 0.5)' : undefined,
            }}
          >
            {notification.type === 'success' ? (
              <CheckCircleIcon className="h-6 w-6 animate-bounce" />
            ) : notification.type === 'error' ? (
              <WarningIcon className="h-6 w-6 animate-pulse text-red-100" />
            ) : (
              <ChatBubbleLeftIcon className="h-6 w-6" />
            )}
            <span className="text-sm font-bold">{notification.message}</span>

            {/* زر إغلاق الإشعار */}
            <button
              onClick={() => setNotification({ show: false, type: 'info', message: '' })}
              className="ml-2 rounded-full p-1 hover:bg-black hover:bg-opacity-20"
              aria-label="إغلاق الإشعار"
              type="button"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className={`rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}>
        {/* Header */}
        <div className="border-b border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <StarOutline className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">التقييمات والمراجعات</h3>
                <p className="text-sm text-gray-600">شاركنا رأيك في {itemTitle}</p>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-2 max-sm:flex-col max-sm:items-end max-sm:gap-1">
                {renderStars(Math.round(averageRating), false, undefined, 'lg')}
                <span className="text-2xl font-bold text-gray-900">{averageRating.toFixed(1)}</span>
              </div>
              <p className="text-sm text-gray-600">
                {totalReviews} {totalReviews === 1 ? 'تقييم' : 'تقييمات'}
              </p>
            </div>
          </div>

          {/* إحصائيات التقييم */}
          {showRatingStats && ratedReviews.length > 0 && (
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                {ratingDistribution.map(({ rating, count, percentage }) => (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="flex min-w-[44px] items-center gap-1 text-sm font-medium text-gray-700">
                      {rating}
                      <StarSolid className="h-4 w-4 text-yellow-500" />
                    </span>
                    <div className="h-2 flex-1 rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-yellow-400 transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-sm text-gray-600">{count}</span>
                  </div>
                ))}
              </div>

              {/* التقييم السريع */}
              {showQuickRating && user && (
                <div className="rounded-lg bg-gray-50 p-4">
                  <h4 className="mb-3 text-sm font-medium text-gray-900">تقييم سريع</h4>
                  <div className="flex items-center gap-3">
                    {renderStars(quickRating, true, setQuickRating)}
                    <button
                      onClick={submitQuickRating}
                      disabled={quickRating === 0 || quickSubmitting}
                      className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {quickSubmitting ? 'جاري الإرسال...' : 'إرسال'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* قسم إضافة التقييم المحسن */}
        <div className="p-6">
          {!user ? (
            /* رسالة تسجيل الدخول */
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
              <div className="mb-4">
                <UserIcon className="mx-auto h-12 w-12 text-amber-500" />
              </div>
              <h4 className="mb-2 text-lg font-semibold text-amber-800">سجل دخولك لإضافة تقييم</h4>
              <p className="mb-4 text-amber-700">شاركنا رأيك وتجربتك مع {itemTitle}</p>
              <button
                onClick={() => setShowLoginModal(true)}
                className="rounded-lg bg-amber-600 px-6 py-2 text-white transition-colors hover:bg-amber-700"
              >
                تسجيل الدخول
              </button>
            </div>
          ) : !_canQuickReview ? null : !showForm ? ( // إخفاء زر/نموذج إضافة التقييم عندما لا يسمح بذلك (مثلاً المالك)
            /* زر إضافة تقييم محسن */
            <div className="space-y-4">
              <button
                onClick={() => setShowForm(true)}
                className="group w-full rounded-xl border-2 border-dashed border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 text-blue-700 transition-all hover:border-blue-500 hover:from-blue-100 hover:to-indigo-100 hover:shadow-md"
              >
                <div className="flex items-center justify-center gap-3">
                  <div className="rounded-full bg-blue-200 p-2 transition-colors group-hover:bg-blue-300">
                    <PlusIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">إضافة تقييم ومراجعة</div>
                    <div className="text-sm text-blue-600">شاركنا رأيك وتجربتك</div>
                  </div>
                </div>
              </button>

              {/* التقييم السريع المحسن */}
              {showQuickRating && (
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">تقييم سريع</h4>
                    <span className="text-sm text-gray-500">اختر عدد النجوم</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {renderStars(quickRating, true, setQuickRating, 'lg')}
                    </div>
                    <button
                      onClick={submitQuickRating}
                      disabled={quickRating === 0 || quickSubmitting}
                      className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {quickSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div
                            className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                            style={{ width: 24, height: 24 }}
                            role="status"
                            aria-label="جاري التحميل"
                          />
                          <span>جاري الإرسال...</span>
                        </div>
                      ) : (
                        'إرسال التقييم'
                      )}
                    </button>
                  </div>
                  {quickRating > 0 && (
                    <div className="mt-2 text-center text-sm text-gray-600">
                      تقييمك: {quickRating} من 5 نجوم
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* نموذج إضافة تقييم محسن */
            <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 shadow-lg">
              {/* رأس النموذج */}
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-blue-100 p-2">
                    <UserIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {user?.fullName || user?.name || 'مستخدم'}
                    </div>
                    <div className="text-sm text-blue-600">شاركنا تجربتك مع {itemTitle}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setNewRating(0);
                    setNewComment('');
                  }}
                  className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* قسم التقييم */}
              <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
                <label className="mb-3 flex items-center text-sm font-semibold text-gray-700">
                  <StarOutline className="ml-1 inline h-4 w-4" />
                  تقييمك (مطلوب)
                </label>
                <div className="flex items-center gap-3">
                  {renderStars(newRating, true, setNewRating, 'lg')}
                  {newRating > 0 && (
                    <span className="text-sm font-medium text-blue-600">{newRating} من 5 نجوم</span>
                  )}
                </div>
                {newRating === 0 && (
                  <p className="mt-2 text-xs text-red-500">يرجى اختيار تقييم قبل المتابعة</p>
                )}
              </div>

              {/* قسم التعليق */}
              <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
                <label className="mb-3 flex items-center text-sm font-semibold text-gray-700">
                  <ChatBubbleLeftIcon className="ml-1 inline h-4 w-4" />
                  مراجعتك (اختياري)
                </label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="شاركنا تفاصيل تجربتك... ما الذي أعجبك؟ ما الذي يمكن تحسينه؟"
                  className="w-full resize-none rounded-lg border border-gray-300 p-4 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50"
                  rows={5}
                  maxLength={500}
                />
                <div className="mt-2 flex justify-between text-xs text-gray-500">
                  <span>اكتب مراجعة مفيدة للآخرين</span>
                  <span>{newComment.length}/500</span>
                </div>
              </div>

              {/* أزرار الإجراء */}
              <div className="flex gap-3">
                <button
                  onClick={submitReview}
                  disabled={submitting || newRating === 0}
                  className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-600"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div
                        className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                        style={{ width: 24, height: 24 }}
                        role="status"
                        aria-label="جاري التحميل"
                      />
                      <span>جاري النشر...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircleIcon className="h-5 w-5" />
                      <span>نشر التقييم</span>
                    </div>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setNewRating(0);
                    setNewComment('');
                  }}
                  className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                >
                  إلغاء
                </button>
              </div>

              {/* نصائح مفيدة */}
              <div className="mt-4 rounded-lg bg-yellow-50 p-3">
                <div className="flex items-start gap-2">
                  <ExclamationCircleIcon className="mt-0.5 h-4 w-4 text-yellow-500" />
                  <div className="text-xs text-yellow-800">
                    <strong>نصائح لكتابة مراجعة مفيدة:</strong>
                    <ul className="mt-1 list-inside list-disc space-y-1">
                      <li>اذكر ما أعجبك وما لم يعجبك</li>
                      <li>كن صادقاً وموضوعياً</li>
                      <li>ساعد الآخرين في اتخاذ قرار مدروس</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* قائمة التقييمات */}
          <div className="mt-6">
            {loading ? (
              <div className="py-8 text-center">
                <div
                  className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                  style={{ width: 24, height: 24 }}
                  role="status"
                  aria-label="جاري التحميل"
                />
                <p className="mt-2 text-gray-600">جاري تحميل التقييمات...</p>
              </div>
            ) : error ? (
              <div className="py-8 text-center text-red-600">
                <p>{error}</p>
                <button
                  onClick={() => fetchReviews()}
                  className="mt-2 text-sm text-blue-600 underline hover:text-blue-800"
                >
                  إعادة المحاولة
                </button>
              </div>
            ) : reviews.length === 0 ? (
              <>
                {/* تقليل console spam - معطل */}
                {/* {Math.random() < 0.01 ? (
                  (console.log(
                    '📭 [عرض] عرض رسالة "لا توجد تقييمات" - reviews.length:',
                    reviews.length,
                  ), null)
                ) : null} */}
                <div className="py-8 text-center text-gray-500">
                  <ChatBubbleLeftIcon className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                  <p className="text-lg font-medium">لا توجد تقييمات بعد</p>
                  <p className="text-sm">كن أول من يشارك رأيه</p>
                </div>
              </>
            ) : (
              <div className="space-y-4" data-reviews-list>
                {/* تقليل console spam - معطل */}
                {/* {Math.random() < 0.01 ? (
                  (console.log(
                    '📝 [عرض] عرض التقييمات - reviews.length:',
                    reviews.length,
                    'التقييمات:',
                    reviews,
                  ), null)
                ) : null} */}
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                  >
                    {/* معلومات المراجع */}
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          src={review.reviewer?.profileImage}
                          alt={review.reviewer?.name || 'مستخدم'}
                          size="md"
                          showVerificationBadge={true}
                          isVerified={review.reviewer?.verified}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                              {review.reviewer?.name || 'مستخدم'}
                            </span>
                            {review.reviewer?.verified && (
                              <CheckCircleIcon className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <ClockIcon className="h-4 w-4" />
                            {new Date(review.createdAt).toLocaleDateString('ar-SA')}
                          </div>
                        </div>
                      </div>

                      {review.rating > 0 && (
                        <div className="flex items-center gap-1">{renderStars(review.rating)}</div>
                      )}
                    </div>

                    {/* محتوى المراجعة */}
                    {review.comment && (
                      <p className="mb-3 leading-relaxed text-gray-700">{review.comment}</p>
                    )}

                    {/* إجراءات التعليق: رد/إبلاغ */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => {
                            if (!user) {
                              setShowLoginModal(true);
                              return;
                            }
                            setReplyingToId(replyingToId === review.id ? null : review.id);
                            setReplyText('');
                          }}
                          className="flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-blue-600"
                        >
                          <ChatBubbleLeftIcon className="h-4 w-4" />
                          <span>{replyingToId === review.id ? 'إلغاء الرد' : 'رد'}</span>
                        </button>
                      </div>

                      <button
                        className="text-gray-400 transition-colors hover:text-red-600"
                        title="إبلاغ عن تعليق"
                      >
                        <FlagIcon className="h-4 w-4" />
                      </button>
                    </div>

                    {/* نموذج الرد */}
                    {replyingToId === review.id && (
                      <div className="mt-3 rounded-lg bg-gray-50 p-3">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="اكتب ردك هنا..."
                          className="w-full resize-none rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          rows={3}
                          maxLength={500}
                        />
                        <div className="mt-2 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingToId(null);
                              setReplyText('');
                            }}
                            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            إلغاء
                          </button>
                          <button
                            type="button"
                            onClick={() => submitReply(review.id)}
                            disabled={replySubmitting || !replyText.trim()}
                            className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {replySubmitting ? 'جاري الإرسال...' : 'إرسال الرد'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* عرض الردود */}
                    {Array.isArray(review.replies) && review.replies.length > 0 && (
                      <div className="mr-6 mt-4 space-y-3">
                        {review.replies.map((rep: Review) => (
                          <div key={rep.id} className="rounded-lg bg-gray-50 p-3">
                            <div className="mb-2 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <UserAvatar
                                  src={rep.reviewer?.profileImage}
                                  alt={rep.reviewer?.name || 'مستخدم'}
                                  size="sm"
                                  showVerificationBadge={true}
                                  isVerified={rep.reviewer?.verified}
                                />
                                <span className="font-medium text-gray-900">
                                  {rep.reviewer?.name || 'مستخدم'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <ClockIcon className="h-4 w-4" />
                                {new Date(rep.createdAt as unknown as string).toLocaleDateString(
                                  'ar-SA',
                                )}
                              </div>
                            </div>
                            {rep.comment && (
                              <p className="text-sm leading-relaxed text-gray-700">{rep.comment}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* نافذة تسجيل الدخول المنبثقة */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={() => {
          setShowLoginModal(false);
          // يمكن إضافة منطق إضافي هنا بعد تسجيل الدخول الناجح
          window.location.reload(); // إعادة تحميل الصفحة لتحديث حالة المستخدم
        }}
      />

      {/* نافذة التقييم المكرر المنبثقة */}
      {showDuplicateModal && (
        <div className="animate-fade-in fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
          <div className="animate-scale-in mx-4 w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="p-6">
              {/* عنوان التنبيه */}
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-full bg-yellow-100">
                  <WarningIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">تنبيه تقييم مكرر</h3>
              </div>

              {/* محتوى الرسالة */}
              <div className="mb-6">
                <p className="mb-3 text-gray-700">
                  <span className="font-semibold text-red-600">
                    لقد قمت بتقييم هذا العنصر مسبقاً!
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  يمكنك العثور على تقييمك السابق في قائمة التقييمات أدناه. إذا كنت ترغب في تغيير
                  تقييمك، يمكنك تعديله أو حذفه أولاً ثم إضافة تقييم جديد.
                </p>
              </div>

              {/* أزرار العمل */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDuplicateModal(false)}
                  className="flex-1 rounded-lg bg-gray-100 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-200"
                >
                  فهمت
                </button>
                <button
                  onClick={() => {
                    setShowDuplicateModal(false);
                    // التمرير لقائمة التقييمات
                    const reviewsSection = document.querySelector('[data-reviews-list]');
                    if (reviewsSection) {
                      reviewsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
                >
                  إظهار تقييمي
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReviewsAndRatings;
