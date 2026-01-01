import CallScreen from '@/components/calls/CallScreen';
import { NavConnectionIndicator } from '@/components/common/ConnectionIndicator';
import MessageComposer from '@/components/messages/MessageComposer';
import TransportBookingCard, {
  parseTransportBookingMetadata,
} from '@/components/messages/TransportBookingCard';
import { useRealtimeConnection } from '@/hooks/useRealtimeConnection';
import { useWebRTCCall } from '@/hooks/useWebRTCCall';
import type { ServerToClientEvents } from '@/types/socket';
import { getSocketManager } from '@/utils/socketManager';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import LocationMessage from '../components/LocationMessage';
import StartConversationModal from '../components/StartConversationModal';
import UserAvatar from '../components/UserAvatar';
import { OpensooqNavbar } from '../components/common';
import useAuth from '../hooks/useAuth';
// ⚠️ تعطيل مؤقت - unifiedNotificationManager يحتاج server-side modules
// import { unifiedNotificationManager } from '@/lib/notifications/UnifiedNotificationManager';
// Icons
import {
  ArchiveBoxIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  CheckBadgeIcon,
  ChevronLeftIcon,
  ClockIcon,
  EllipsisVerticalIcon,
  HandRaisedIcon,
  MagnifyingGlassIcon,
  MicrophoneIcon,
  NoSymbolIcon,
  PhoneIcon,
  SpeakerXMarkIcon,
  StarIcon,
  UserIcon,
  VideoCameraIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

type UiConversation = {
  id: string;
  title: string; // other participant name or context
  subtitle?: string; // e.g., car title
  avatar?: string;
  lastMessage?: string;
  lastTime?: string; // formatted
  unread?: number;
  otherUserId?: string;
  otherUserPhone?: string; // رقم هاتف المستخدم الآخر
};

// ===== Types (DTOs) for API payloads and socket events =====
type ChatMessageEvent = Parameters<ServerToClientEvents['chat:message:new']>[0];
type ApiMessageDTO = {
  id: string | number;
  senderId: string | number;
  conversationId?: string | number;
  content: string;
  type: string;
  status?: string;
  createdAt: string;
};
type ApiUserSlim = {
  id?: string | number;
  name?: string;
  phone?: string | null;
  profileImage?: string | null;
};
type ApiConversationParticipantDTO = { userId?: string | number; users?: ApiUserSlim };
type ApiConversationDTO = {
  id?: string | number;
  title?: string;
  messages?: ApiMessageDTO[];
  updatedAt?: string;
  cars?: { title?: string } | null;
  auctions?: { title?: string } | null;
  carTitle?: string | null;
  conversation_participants?: ApiConversationParticipantDTO[];
  unread?: number | string | null;
  lastMessage?: string | null;
};

type UiMessage = {
  id: string;
  senderId: string;
  type: 'text' | 'image' | 'file' | 'voice' | 'location' | 'bid' | 'video';
  content: string;
  createdAt: string;
  status?: 'sent' | 'delivered' | 'read';
  imageUrl?: string;
  metadata?: string | Record<string, any>; // بيانات إضافية للرسائل الخاصة
};

// Helpers
const formatRelativeTime = (ts: string | Date) => {
  try {
    const dt = ts instanceof Date ? ts : new Date(ts);
    const now = Date.now();
    const diff = Math.max(0, now - dt.getTime());
    const m = Math.floor(diff / (1000 * 60));
    const h = Math.floor(diff / (1000 * 60 * 60));
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (m < 1) return 'الآن';
    if (m < 60) return `منذ ${m} دقيقة`;
    if (h < 24) return `منذ ${h} ساعة`;
    return `منذ ${d} يوم`;
  } catch {
    return '';
  }
};

// 🔄 تطبيع نوع الرسالة
const normalizeMessageType = (type: string): UiMessage['type'] => {
  const lower = type.toLowerCase();
  return ['text', 'image', 'file', 'voice', 'location', 'bid', 'video'].includes(lower)
    ? (lower as UiMessage['type'])
    : 'text';
};

// 🔄 تطبيع حالة الرسالة
const normalizeMessageStatus = (status: string): UiMessage['status'] => {
  const lower = status.toLowerCase();
  if (lower === 'read') return 'read';
  if (lower === 'delivered') return 'delivered';
  return 'sent';
};

// 🖼️ بناء مسار الصورة
const getImageUrl = (type: string, content: string): string | undefined => {
  if (type.toLowerCase() !== 'image') return undefined;
  return content.startsWith('/uploads/') ? content : `/uploads/messages/${content}`;
};

// 🔀 دمج الرسائل الجديدة مع المحلية (محسّن لمنع التكرار)
const mergeMessages = (
  current: UiMessage[],
  incoming: UiMessage[],
  _currentUserId: string,
): UiMessage[] => {
  const byId = new Map<string, UiMessage>();

  // إضافة الرسائل الحالية أولاً
  for (const msg of current) {
    if (msg.id) {
      byId.set(String(msg.id), msg);
    }
  }

  // دمج الرسائل الواردة مع تحديث الحالة
  for (const msg of incoming) {
    if (!msg.id) continue;
    const msgId = String(msg.id);
    const existing = byId.get(msgId);

    if (!existing) {
      byId.set(msgId, msg);
    } else {
      // ترقية الحالة فقط
      const statusRank = (s?: UiMessage['status']) =>
        s === 'read' ? 2 : s === 'delivered' ? 1 : 0;
      if (statusRank(msg.status) > statusRank(existing.status)) {
        byId.set(msgId, { ...existing, status: msg.status });
      }
    }
  }

  // ترتيب تصاعدي حسب التاريخ
  return Array.from(byId.values()).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
};

// 📢 تشغيل صوت إشعار
const playNotificationSound = () => {
  try {
    const audio = new Audio(
      'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBzaM0fPTgjMGHm7A7+OZUQ==',
    );
    audio.volume = 0.3;
    void audio.play().catch(() => {});
  } catch (_) {}
};

// 🔍 فحص تحديث الحالة
const hasStatusUpdate = (old: UiMessage[], updated: UiMessage[]): boolean => {
  if (old.length !== updated.length) return true;
  return old.some((m, i) => m.status !== updated[i]?.status);
};

// 🔧 إزالة المحادثات المكررة - كل مستخدم يظهر مرة واحدة فقط
const deduplicateConversations = (
  conversations: UiConversation[],
  preferredConversationId?: string,
): UiConversation[] => {
  const seen = new Map<string, UiConversation>();
  const fallback: UiConversation[] = [];

  for (const conv of conversations) {
    // المحادثات التي لا تحتوي على otherUserId يتم حفظها كما هي
    if (!conv.otherUserId) {
      fallback.push(conv);
      continue;
    }

    const userId = String(conv.otherUserId);
    const existing = seen.get(userId);

    if (!existing) {
      seen.set(userId, conv);
      continue;
    }

    // أفضلية للمحادثة المحددة صراحة (convId في الرابط)
    if (preferredConversationId && String(conv.id) === String(preferredConversationId)) {
      seen.set(userId, conv);
      continue;
    }
    if (preferredConversationId && String(existing.id) === String(preferredConversationId)) {
      continue;
    }

    const currentUnread = Number(conv.unread || 0);
    const existingUnread = Number(existing.unread || 0);

    // تفضيل المحادثات ذات الرسائل غير المقروءة الأعلى
    if (currentUnread > existingUnread) {
      seen.set(userId, conv);
      continue;
    }
    if (existingUnread > currentUnread) {
      continue;
    }

    // في حال التساوي، نختار المحادثة التي لديها آخر رسالة أحدث
    const currentTime = conv.lastTime === 'الآن' ? Date.now() : 0;
    const existingTime = existing.lastTime === 'الآن' ? Date.now() : 0;

    if (currentTime > existingTime || conv.lastMessage) {
      seen.set(userId, conv);
    }
  }

  return [...Array.from(seen.values()), ...fallback];
};

// 🔢 أدوات مساعدة للبحث في أرقام الهاتف بأي شكل
const buildPhoneVariants = (digits: string): string[] => {
  const v = new Set<string>();
  const d = String(digits || '').replace(/\D/g, '');
  if (!d) return [];
  v.add(d);
  const noZeros = d.replace(/^0+/, '');
  if (noZeros) v.add(noZeros);
  const no218 = d.startsWith('218') ? d.slice(3) : d;
  v.add(no218);
  const no218NoZero = no218.replace(/^0+/, '');
  if (no218NoZero) v.add(no218NoZero);
  if (no218NoZero) v.add('0' + no218NoZero);
  if (no218NoZero) v.add('218' + no218NoZero);
  return Array.from(v);
};

const normalizePhoneQueryVariants = (qDigits: string): string[] => {
  const v = new Set<string>();
  const d = String(qDigits || '').replace(/\D/g, '');
  if (!d) return [];
  v.add(d);
  const noZeros = d.replace(/^0+/, '');
  if (noZeros) v.add(noZeros);
  if (d.startsWith('218')) {
    const after = d.slice(3);
    v.add(after);
    const afterNoZero = after.replace(/^0+/, '');
    if (afterNoZero) v.add(afterNoZero);
  } else {
    if (noZeros) v.add('218' + noZeros);
  }
  return Array.from(v);
};

const MessagesPage: React.FC = () => {
  const router = useRouter();
  const { user, isLoading: authLoading, getToken } = useAuth();

  // Development-only logger to reduce console noise in production
  const devLog = (...args: unknown[]) => {
    if (process.env.NODE_ENV !== 'production') console.log(...args);
  };

  // ============================================
  // 🔌 نظام الاتصال الفوري المحسّن
  // ============================================
  const {
    status: connectionStatus,
    isConnected: isRealtimeConnected,
    joinConversation: realtimeJoinConversation,
    leaveConversation: realtimeLeaveConversation,
  } = useRealtimeConnection({
    autoConnect: true,
    announcePresence: true,
  });

  // ============================================
  // 📞 نظام المكالمات الصوتية والفيديو
  // ============================================
  const {
    callStatus,
    currentCall,
    isInCall,
    localStream,
    remoteStream,
    isVideoEnabled,
    isAudioEnabled,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleVideo,
    toggleAudio,
    switchCamera,
  } = useWebRTCCall({
    onIncomingCall: (call) => {
      // تشغيل صوت الرنين
      devLog('[Messages] Incoming call:', call);
    },
    onCallEnded: (callId) => {
      devLog('[Messages] Call ended:', callId);
    },
  });

  // ============================================
  // 📱 حالة البحث والفلترة
  // ============================================

  // 🔍 نص البحث - ما يكتبه المستخدم في خانة البحث
  const [searchQuery, setSearchQuery] = useState('');

  // 👥 نتائج البحث عن مستخدمين جدد
  const [searchResults, setSearchResults] = useState<
    Array<{
      id: string;
      name: string;
      phone: string | null;
      profileImage: string | null;
      isNewUser: boolean; // ليس في المحادثات الموجودة
    }>
  >([]);

  // ⏳ حالة تحميل نتائج البحث
  const [searchingUsers, setSearchingUsers] = useState(false);

  // 📂 الفلتر المختار - نوع المحادثات المعروضة (الكل، غير مقروءة، مثبتة، إلخ)
  const [selectedFilter, setSelectedFilter] = useState<
    'all' | 'unread' | 'pinned' | 'archived' | 'requests'
  >('all');

  // ============================================
  // 📌 حالة المحادثات (مثبتة، مؤرشفة، مكتومة، محظورة)
  // ============================================

  // 📌 المحادثات المثبتة - قائمة معرفات المحادثات التي ثبتها المستخدم في الأعلى
  const [pinnedConversations, setPinnedConversations] = useState<Set<string>>(new Set());

  // 📦 المحادثات المؤرشفة - المحادثات القديمة أو المخفية
  const [archivedConversations, setArchivedConversations] = useState<Set<string>>(new Set());

  // 🔇 المحادثات المكتومة - المحادثات التي أوقف المستخدم إشعاراتها
  const [mutedConversations, setMutedConversations] = useState<Set<string>>(new Set());

  // 🚫 المستخدمون المحظورون - قائمة المستخدمين الذين حظرهم المستخدم
  const [blockedUsers, setBlockedUsers] = useState<Set<string>>(new Set());

  // ============================================
  // 🎛️ حالة القوائم المنسدلة
  // ============================================

  // ⚙️ إظهار قائمة إجراءات المحادثة (النقاط الثلاث: ...)
  const [showChatActions, setShowChatActions] = useState(false);

  // ============================================
  // 💬 الإشعارات المؤقتة (Toast Notifications)
  // ============================================

  // رسالة تظهر في الأعلى وتختفي تلقائياً (مثل: "تم نسخ الرقم" أو "تم إرسال الرسالة")
  const [toast, setToast] = useState<{
    message: string; // النص المعروض
    type: 'success' | 'error'; // نوع الرسالة: نجاح (أخضر) أو خطأ (أحمر)
  } | null>(null);

  // ============================================
  // 💬 بيانات المحادثات والرسائل
  // ============================================

  // 📋 قائمة المحادثات - كل محادثة تحتوي على: الاسم، الصورة، آخر رسالة، عدد غير المقروءة
  const [conversations, setConversations] = useState<UiConversation[]>([]);

  // ⏳ هل نحمّل المحادثات الآن؟ (true = يظهر spinner التحميل)
  const [loadingConversations, setLoadingConversations] = useState(false);

  // 🎯 معرّف المحادثة المفتوحة حالياً - null إذا لم تُفتح أي محادثة
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);

  // 📨 الرسائل - كل محادثة لها رسائلها (مثل: messages['conv123'] = [رسالة1, رسالة2])
  const [messages, setMessages] = useState<Record<string, UiMessage[]>>({});

  // ⏳ هل نحمّل الرسائل الآن؟
  const [loadingMessages, setLoadingMessages] = useState(false);

  // 🔄 حالة التبديل بين المحادثات - تظهر مؤشر تحميل أثناء التبديل
  const [switchingConversation, setSwitchingConversation] = useState(false);

  // 📌 المحادثة السابقة - لتتبع التبديل
  const previousConvIdRef = useRef<string | null>(null);

  // 🟢 خريطة المستخدمين المتصلين - من متصل الآن؟ (مثل: onlineMap['user123'] = true)
  const [onlineMap, setOnlineMap] = useState<Record<string, boolean>>({});

  // ⌨️ هل الشخص الآخر يكتب الآن؟ (يظهر: "يكتب...")
  const [typingOther, setTypingOther] = useState(false);

  // ============================================
  // 🆕 النوافذ المنبثقة
  // ============================================

  // إظهار نافذة "بدء محادثة جديدة"
  const [showStartModal, setShowStartModal] = useState(false);

  // ============================================
  // 📱 حالة العرض المتجاوب (Mobile Responsive)
  // ============================================

  // هل الشاشة صغيرة (أقل من 800px)؟ - لعرض نمط Messenger
  const [isMobileView, setIsMobileView] = useState(false);

  // في الموبايل: true = عرض المحادثة، false = عرض القائمة
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);

  // ============================================
  // 🔧 أدوات مساعدة (Refs)
  // ============================================

  // 👇 مرجع لمنطقة الرسائل - للتحكم في الـ scroll بشكل دقيق
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  // 🔑 دالة للحصول على التوكن الحالي - تجلب مباشرة من localStorage
  // ✅ إصلاح: استخدام ref بدلاً من useCallback لتجنب إعادة render متكررة
  const getAuthTokenRef = useRef<() => string | null>(() => null);
  getAuthTokenRef.current = () => {
    // أولاً: محاولة من getToken hook
    const hookToken = getToken?.();
    if (hookToken) return hookToken;
    // ثانياً: محاولة مباشرة من localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };
  const getAuthToken = useCallback((): string | null => {
    return getAuthTokenRef.current();
  }, []);

  // مرجع للتوافق مع الكود القديم
  const tokenRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    tokenRef.current = getAuthToken() ?? undefined;
  }, [getAuthToken, user?.id]);

  // ============================================
  // 📖 وظيفة: وضع علامة "مقروء" على الرسائل
  // ============================================
  // عندما يفتح المستخدم محادثة، تُسجّل جميع الرسائل كـ "مقروءة"
  const markConversationAsRead = useCallback(
    async (convId: string) => {
      try {
        const token = getAuthToken();
        if (!token) return; // تخطي بدون توكن
        // 📡 إرسال طلب للسيرفر: سجّل هذه الرسائل كمقروءة
        await fetch('/api/messages', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include', // إرسال الـ Cookie أيضاً لضمان المصادقة
          body: JSON.stringify({ action: 'markAsRead', conversationId: String(convId) }),
        });
        // 🔌 إرسال إشارة فورية عبر WebSocket (الاتصال المباشر)
        try {
          const sm = getSocketManager();
          sm.readAck(String(convId));
        } catch (_) {
          // تجاهل أخطاء الاتصال المباشر
        }
      } catch (_) {
        // تجاهل أخطاء الشبكة - سنحدّث الواجهة على أي حال
      }
      // ✅ تحديث الواجهة فوراً: غيّر حالة الرسائل إلى "مقروءة"
      setMessages((prev) => ({
        ...prev,
        [String(convId)]: (prev[String(convId)] || []).map((m) =>
          String(m.senderId) !== String(user?.id) ? { ...m, status: 'read' } : m,
        ),
      }));
      // 🔄 صفّر عداد الرسائل غير المقروءة في قائمة المحادثات
      setConversations((prev) =>
        prev.map((cv) => (cv.id === String(convId) ? { ...cv, unread: 0 } : cv)),
      );
    },
    [user?.id, getAuthToken],
  );

  // مرجع ثابت للدالة لتجنّب إعادة تشغيل المؤثرات عند تغيّر هوية useCallback
  const markReadRef = useRef(markConversationAsRead);
  useEffect(() => {
    markReadRef.current = markConversationAsRead;
  }, [markConversationAsRead]);

  // ============================================
  // 📱 مراقبة حجم الشاشة للعرض المتجاوب
  // ============================================
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 800;
      setIsMobileView(isMobile);

      // إذا تحولنا من موبايل لشاشة كبيرة، نعيد تعيين حالة العرض
      if (!isMobile) {
        setShowChatOnMobile(false);
      }
    };

    // فحص أولي
    handleResize();

    // مراقبة التغييرات
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ============================================
  // 🔒 التحقق من تسجيل الدخول
  // ============================================
  // إذا لم يكن المستخدم مسجلاً دخوله، يتم توجيهه لصفحة تسجيل الدخول
  useEffect(() => {
    const checkAuthTimeout = setTimeout(() => {
      if (!authLoading && !user) {
        router.push('/?callbackUrl=' + encodeURIComponent('/messages'));
      }
    }, 200);

    return () => clearTimeout(checkAuthTimeout);
  }, [authLoading, user, router]);

  // ============================================
  // 💬 إخفاء الإشعارات المؤقتة تلقائياً
  // ============================================
  // Toast يختفي بعد 2.5 ثانية تلقائياً
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // ============================================
  // 📞 الاستماع لحدث نسخ رقم الهاتف
  // ============================================
  // عندما يضغط المستخدم زر نسخ الرقم، يظهر Toast
  useEffect(() => {
    const handlePhoneCopied = (event: CustomEvent) => {
      const phone = event.detail?.phone;
      setToast({
        message: `تم نسخ الرقم: ${phone}`,
        type: 'success',
      });
    };

    window.addEventListener('phone-copied', handlePhoneCopied as EventListener);
    return () => window.removeEventListener('phone-copied', handlePhoneCopied as EventListener);
  }, []);

  // ============================================
  // 🔔 طلب إذن الإشعارات من المتصفح
  // ============================================
  // عند أول زيارة، نطلب من المستخدم السماح بالإشعارات
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      // تأخير طلب الإذن حتى يكون المستخدم جاهزاً
      const timer = setTimeout(() => {
        Notification.requestPermission().then((permission) => {
          // إزالة console.log المزعج
          if (permission === 'granted') {
            setToast({
              message: 'تم تفعيل الإشعارات الفورية للرسائل الجديدة',
              type: 'success',
            });
          }
        });
      }, 2000); // تأخير 2 ثانية

      return () => clearTimeout(timer);
    }
  }, []);

  // Enhanced notification on new conversation created
  useEffect(() => {
    if (conversations.length > 0) {
      const latestConv = conversations[0];
      const isNewConversation = latestConv.lastTime === 'الآن' && !latestConv.lastMessage;

      if (isNewConversation) {
        // ⚠️ تعطيل مؤقت - unifiedNotificationManager
        // unifiedNotificationManager.send({
        //   userId: String(user?.id || ''),
        //   type: 'info',
        //   title: 'محادثة جديدة',
        //   message: `تم بدء محادثة جديدة مع ${latestConv.title}`,
        //   metadata: {
        //     conversationId: latestConv.id,
        //     otherUserId: latestConv.otherUserId
        //   }
        // });
        devLog('[Messages] محادثة جديدة:', latestConv.title);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations.length, user?.id]);

  // ============================================
  // 🖱️ إغلاق القوائم عند الضغط خارجها
  // ============================================
  // إذا فتح المستخدم قائمة (مثل: إجراءات المحادثة) وضغط في أي مكان آخر، تُغلق القائمة
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showChatActions && !target.closest('[data-chat-actions]')) {
        setShowChatActions(false);
      }
    };

    if (showChatActions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showChatActions]);

  // ============================================
  // 📥 تحميل قائمة المحادثات من السيرفر
  // ============================================
  // يُنفذ مرة واحدة عند فتح الصفحة - يجلب جميع محادثات المستخدم
  useEffect(() => {
    const loadConvs = async () => {
      if (!user?.id) return;
      setLoadingConversations(true);
      try {
        const token = getToken?.();
        const res = await fetch(`/api/conversations?userId=${encodeURIComponent(user.id)}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          credentials: 'include', // إرسال الـ Cookie أيضاً لضمان المصادقة
        });
        const data: { success: boolean; data: ApiConversationDTO[] } = await res.json();
        if (data?.success) {
          const normalized: UiConversation[] = (data.data || []).map((c: ApiConversationDTO) => {
            // استخراج معلومات الطرف الآخر في المحادثة
            const other = (() => {
              // جلب المشاركين من conversation_participants
              const arr = Array.isArray(c?.conversation_participants)
                ? c.conversation_participants!
                : [];
              // البحث عن المشارك الآخر (ليس المستخدم الحالي)
              const otherP = arr.find((x) => String(x?.userId) !== String(user.id));
              // جلب بيانات المستخدم من users object
              const u: ApiUserSlim = otherP?.users || {};

              // تشخيص معطل - تقليل console spam
              // console.log(`[Conversation ${c?.id}] المشاركون:`, arr.length, '| الطرف الآخر:', u?.name || 'غير معروف');

              return {
                name: u?.name || c?.title || 'مستخدم',
                avatar: u?.profileImage || '/images/default-avatar.svg',
                id: u?.id || otherP?.userId || '',
                phone: u?.phone || null, // رقم الهاتف
              };
            })();

            const msgs: ApiMessageDTO[] | undefined = Array.isArray(c?.messages)
              ? c.messages
              : undefined;
            const lastMsg = (msgs && msgs[0]) || null;

            return {
              id: String(c?.id || ''),
              title: String(other.name || 'مستخدم'),
              subtitle: c?.cars?.title || c?.auctions?.title || c?.carTitle || undefined,
              avatar: other.avatar,
              lastMessage: lastMsg?.content || c?.lastMessage || '',
              lastTime: lastMsg?.createdAt
                ? formatRelativeTime(lastMsg.createdAt)
                : c?.updatedAt
                  ? formatRelativeTime(c.updatedAt)
                  : undefined,
              unread: Math.max(0, Number(c?.unread || 0)) || 0,
              otherUserId: String(other.id || ''),
              otherUserPhone: other.phone || undefined, // رقم الهاتف من قاعدة البيانات
            };
          });

          // 🔧 إزالة المحادثات المكررة - كل مستخدم يظهر مرة واحدة فقط
          // مع الحفاظ على المحادثة المطلوبة من URL إذا وجدت
          const requestedConvId =
            typeof router.query.convId === 'string' ? router.query.convId : undefined;
          const deduplicated = deduplicateConversations(normalized, requestedConvId);
          setConversations(deduplicated);
          // لا يتم فتح أي محادثة تلقائياً - المستخدم يختار بنفسه
          // if (!selectedConvId && normalized.length > 0) {
          //   setSelectedConvId(normalized[0].id);
          // }
        }
      } catch (_) {
        // ignore
      } finally {
        setLoadingConversations(false);
      }
    };
    loadConvs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isRealtimeConnected]);

  // Select conversation by convId from query if provided
  // 🔧 إصلاح: جلب المحادثة من API مباشرة وفتحها تلقائياً
  useEffect(() => {
    const convId = typeof router.query.convId === 'string' ? router.query.convId : '';
    if (!convId || !user?.id) return;

    devLog('[Messages] معالجة convId من الرابط:', convId);

    // جلب المحادثة من API مباشرة (بغض النظر عن القائمة المحلية)
    const loadAndOpenConversation = async () => {
      try {
        const token = getToken?.();
        const res = await fetch(
          `/api/conversations?userId=${encodeURIComponent(user.id)}&conversationId=${encodeURIComponent(convId)}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            credentials: 'include',
          },
        );
        const data = await res.json();

        devLog('[Messages] استجابة API للمحادثة:', {
          success: data?.success,
          hasData: !!data?.data,
        });

        if (data?.success && data.data) {
          const c = Array.isArray(data.data) ? data.data[0] : data.data;

          if (c) {
            const other = (() => {
              const arr = Array.isArray(c?.conversation_participants)
                ? c.conversation_participants
                : [];
              const otherP = arr.find((x: any) => String(x?.userId) !== String(user.id));
              const u = otherP?.users || {};
              return {
                name: u?.name || c?.title || 'مستخدم',
                avatar: u?.profileImage || '/images/default-avatar.svg',
                id: u?.id || otherP?.userId || '',
                phone: u?.phone || null,
              };
            })();

            const msgs = Array.isArray(c?.messages) ? c.messages : [];
            const lastMsg = msgs[0] || null;

            const newConv: UiConversation = {
              id: String(c?.id || ''),
              title: String(other.name || 'مستخدم'),
              subtitle: c?.cars?.title || c?.auctions?.title || c?.carTitle || undefined,
              avatar: other.avatar,
              lastMessage: lastMsg?.content || c?.lastMessage || '',
              lastTime: lastMsg?.createdAt
                ? formatRelativeTime(lastMsg.createdAt)
                : c?.updatedAt
                  ? formatRelativeTime(c.updatedAt)
                  : undefined,
              unread: Math.max(0, Number(c?.unread || 0)) || 0,
              otherUserId: String(other.id || ''),
              otherUserPhone: other.phone || undefined,
            };

            devLog('[Messages] تم جلب المحادثة:', { id: newConv.id, title: newConv.title });

            // إضافة المحادثة للقائمة إذا لم تكن موجودة
            setConversations((prev) => {
              const exists = prev.some((p) => String(p.id) === String(newConv.id));
              if (exists) {
                // تحديث المحادثة الموجودة بالبيانات الجديدة
                return prev.map((p) => (String(p.id) === String(newConv.id) ? newConv : p));
              }
              return [newConv, ...prev];
            });

            // ✅ فتح المحادثة تلقائياً
            setSelectedConvId(String(convId));

            // ✅ في الموبايل: الانتقال مباشرة لنافذة الدردشة
            if (isMobileView) {
              setShowChatOnMobile(true);
            }

            // ✅ إظهار رسالة نجاح
            setToast({
              message: `تم فتح المحادثة مع ${newConv.title}`,
              type: 'success',
            });

            // تنظيف الرابط من convId بعد الفتح
            router.replace('/messages', undefined, { shallow: true });
          }
        } else {
          // فشل في جلب المحادثة - ربما غير موجودة أو غير مصرح
          devLog('[Messages] فشل جلب المحادثة:', data?.error);
          setToast({
            message: 'تعذر فتح المحادثة',
            type: 'error',
          });
          router.replace('/messages', undefined, { shallow: true });
        }
      } catch (error) {
        console.error('[Messages] خطأ في جلب المحادثة المحددة:', error);
        setToast({
          message: 'حدث خطأ في فتح المحادثة',
          type: 'error',
        });
        router.replace('/messages', undefined, { shallow: true });
      }
    };

    void loadAndOpenConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.convId, user?.id, isMobileView]);

  // 🆕 معالجة معامل chat (userId) لفتح/إنشاء محادثة مع مستخدم محدد
  useEffect(() => {
    const chatUserId = typeof router.query.chat === 'string' ? router.query.chat : '';
    const chatUserName =
      typeof router.query.name === 'string' ? decodeURIComponent(router.query.name) : '';
    const chatUserPhone = typeof router.query.phone === 'string' ? router.query.phone : '';

    if (!chatUserId || !user?.id || chatUserId === user.id) return;

    devLog('[Messages] محاولة فتح محادثة مع المستخدم:', {
      chatUserId,
      chatUserName,
      chatUserPhone,
    });

    // البحث عن محادثة موجودة مع هذا المستخدم
    const existingConv = conversations.find((c) => String(c.otherUserId) === String(chatUserId));

    if (existingConv) {
      devLog('[Messages] وجدت محادثة موجودة:', existingConv.id);
      setSelectedConvId(String(existingConv.id));
      // ✅ في الموبايل: الانتقال مباشرة لنافذة الدردشة
      if (isMobileView) {
        setShowChatOnMobile(true);
      }
      // إزالة المعاملات من الرابط لتنظيفه
      router.replace('/messages', undefined, { shallow: true });
      return;
    }

    // لا توجد محادثة، إنشاء واحدة جديدة في الواجهة
    devLog('[Messages] إنشاء محادثة جديدة مع:', chatUserName || chatUserId);

    const newTempConv: UiConversation = {
      id: `temp-${chatUserId}-${Date.now()}`, // معرف مؤقت
      title: chatUserName || 'مستخدم',
      subtitle: undefined,
      avatar: '/images/default-avatar.svg',
      lastMessage: '',
      lastTime: undefined,
      unread: 0,
      otherUserId: chatUserId,
      otherUserPhone: chatUserPhone || undefined,
    };

    // إضافة المحادثة المؤقتة للقائمة
    setConversations((prev) => [newTempConv, ...prev]);
    setSelectedConvId(newTempConv.id);
    // ✅ في الموبايل: الانتقال مباشرة لنافذة الدردشة
    if (isMobileView) {
      setShowChatOnMobile(true);
    }

    // إزالة المعاملات من الرابط
    router.replace('/messages', undefined, { shallow: true });
  }, [
    router.query.chat,
    router.query.name,
    router.query.phone,
    conversations,
    user?.id,
    router,
    isMobileView,
  ]);

  // Load messages for selected conversation with switching animation
  useEffect(() => {
    const loadMsgs = async () => {
      if (!user?.id || !selectedConvId) return;

      // 🔄 تفعيل حالة التبديل إذا كانت محادثة مختلفة
      const isNewConversation = previousConvIdRef.current !== selectedConvId;
      if (isNewConversation && previousConvIdRef.current !== null) {
        setSwitchingConversation(true);
      }
      previousConvIdRef.current = selectedConvId;

      setLoadingMessages(true);
      devLog('[Messages Page] تحميل رسائل المحادثة:', selectedConvId);

      // ⏱️ تأخير بسيط لضمان ظهور مؤشر التحميل (تجربة مستخدم أفضل)
      const minLoadingTime = isNewConversation ? 300 : 0;
      const startTime = Date.now();

      try {
        // جلب التوكن مباشرة من localStorage لضمان وجوده
        const token = getAuthToken();
        if (!token) {
          setLoadingMessages(false);
          setSwitchingConversation(false);
          return;
        }
        const res = await fetch(
          `/api/messages?conversationId=${encodeURIComponent(selectedConvId)}&userId=${encodeURIComponent(user.id)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            credentials: 'include', // إرسال الـ Cookie أيضاً لضمان المصادقة
          },
        );
        const data: { success: boolean; messages: ApiMessageDTO[] } = await res.json();
        devLog('[Messages Page] استجابة API:', {
          success: data?.success,
          count: data?.messages?.length || 0,
        });
        if (data?.success) {
          // تطبيع البيانات القادمة من API
          const normalized: UiMessage[] = (data.messages || []).map((m: ApiMessageDTO) => ({
            id: String(m.id ?? ''),
            senderId: String(m.senderId ?? ''),
            type: normalizeMessageType(String(m.type ?? 'TEXT')),
            content: String(m.content ?? ''),
            createdAt: m.createdAt || new Date().toISOString(),
            status: normalizeMessageStatus(String(m.status ?? 'SENT')),
            imageUrl: getImageUrl(String(m.type ?? 'TEXT'), String(m.content ?? '')),
          }));

          // ترتيب تصاعدي حسب التاريخ (أقدم → أحدث)
          const sorted = normalized.sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          );
          setMessages((prev) => ({ ...prev, [selectedConvId]: sorted }));
          // Mark read for current conversation after loading
          void markReadRef.current(String(selectedConvId));
        }
      } catch (error) {
        console.error('[Messages Page] ❌ خطأ في تحميل الرسائل:', error);
      } finally {
        // ⏱️ ضمان حد أدنى لوقت التحميل للتجربة السلسة
        const elapsed = Date.now() - startTime;
        const remainingTime = Math.max(0, minLoadingTime - elapsed);

        setTimeout(() => {
          setLoadingMessages(false);
          setSwitchingConversation(false);
        }, remainingTime);
      }
    };
    loadMsgs();
    // ✅ نحصر التبعيات على المعرفات فقط لتفادي حلقات إعادة لا نهائية
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, selectedConvId]);

  // ============================================
  // 🔄 نظام Polling للرسائل الجديدة (بديل Socket.IO)
  // ============================================
  // يتحقق من الرسائل الجديدة كل 2 ثانية للمحادثة المفتوحة (محسّن)
  // يُعطّل تلقائياً عند اتصال Socket.IO
  useEffect(() => {
    if (!user?.id || !selectedConvId) return;
    if (isRealtimeConnected) {
      // لا حاجة للـ polling عند الاتصال الفوري
      return;
    }

    const pollMessages = async () => {
      try {
        // جلب التوكن مباشرة لضمان وجوده
        const token = getAuthToken();
        if (!token) return;

        const res = await fetch(
          `/api/messages?conversationId=${encodeURIComponent(selectedConvId)}&userId=${encodeURIComponent(user.id)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            credentials: 'include', // إرسال الـ Cookie أيضاً لضمان المصادقة
          },
        );
        const data: { success: boolean; messages: ApiMessageDTO[] } = await res.json();

        if (data?.success) {
          // تطبيع البيانات القادمة من API
          const list: UiMessage[] = (data.messages || []).map((m: ApiMessageDTO) => ({
            id: String(m.id ?? ''),
            senderId: String(m.senderId ?? ''),
            type: normalizeMessageType(String(m.type ?? 'TEXT')),
            content: String(m.content ?? ''),
            createdAt: m.createdAt || new Date().toISOString(),
            status: normalizeMessageStatus(String(m.status ?? 'SENT')),
            imageUrl: getImageUrl(String(m.type ?? 'TEXT'), String(m.content ?? '')),
          }));

          // تحديث الرسائل فقط إذا كان هناك رسائل جديدة
          // دمج آمن للرسائل الجديدة مع المحلية
          setMessages((prev) => {
            const current = prev[selectedConvId] || [];
            const merged = mergeMessages(current, list, String(user.id));

            // إشعار صوتي عند وصول رسائل جديدة
            const hasNew = list.some(
              (msg) =>
                String(msg.senderId) !== String(user.id) &&
                !current.some((m) => String(m.id) === String(msg.id)),
            );
            if (hasNew) {
              playNotificationSound();
              void markReadRef.current(String(selectedConvId));
            }

            const willUpdate = merged.length !== current.length || hasStatusUpdate(current, merged);
            // تم إزالة السجل لتحسين الأداء

            return willUpdate ? { ...prev, [selectedConvId]: merged } : prev;
          });
        }
      } catch (_) {
        // تجاهل أخطاء polling
      }
    };

    // تشغيل polling كل 3 ثواني للمحادثة المفتوحة عند غياب WebSocket
    // نبدأ فوراً ثم نكرر كل 3 ثوان
    pollMessages(); // تشغيل فوري للتحميل الأولي
    const pollInterval = setInterval(pollMessages, 3000);

    return () => clearInterval(pollInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, selectedConvId, isRealtimeConnected]); // ✅ إزالة getAuthToken من التبعيات

  // ============================================
  // 🔄 نظام Polling لقائمة المحادثات
  // ============================================
  // يتحقق من المحادثات الجديدة كل 3 ثوانٍ (محسّن)
  // يُعطّل تلقائياً عند اتصال Socket.IO
  useEffect(() => {
    if (!user?.id) return;
    if (isRealtimeConnected) {
      return;
    }

    const pollConversations = async () => {
      try {
        const token = getToken?.();
        const res = await fetch(`/api/conversations?userId=${encodeURIComponent(user.id)}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          credentials: 'include', // إرسال الـ Cookie أيضاً لضمان المصادقة
        });
        const data: { success: boolean; data: ApiConversationDTO[] } = await res.json();
        if (data?.success) {
          const normalized: UiConversation[] = (data.data || []).map((c: ApiConversationDTO) => {
            const other = (() => {
              const arr = Array.isArray(c?.conversation_participants)
                ? c.conversation_participants!
                : [];
              const otherP = arr.find((x) => String(x?.userId) !== String(user.id));
              const u: ApiUserSlim = otherP?.users || {};
              return {
                name: u?.name || c?.title || 'مستخدم',
                avatar: u?.profileImage || '/images/default-avatar.svg',
                id: u?.id || otherP?.userId || '',
                phone: u?.phone || null,
              };
            })();

            const msgs: ApiMessageDTO[] | undefined = Array.isArray(c?.messages)
              ? c.messages
              : undefined;
            const lastMsg = (msgs && msgs[0]) || null;

            return {
              id: String(c?.id || ''),
              title: String(other.name || 'مستخدم'),
              subtitle: c?.cars?.title || c?.auctions?.title || c?.carTitle || undefined,
              avatar: other.avatar,
              lastMessage: lastMsg?.content || c?.lastMessage || '',
              lastTime: lastMsg?.createdAt
                ? formatRelativeTime(lastMsg.createdAt)
                : c?.updatedAt
                  ? formatRelativeTime(c.updatedAt)
                  : undefined,
              unread: Math.max(0, Number(c?.unread || 0)) || 0,
              otherUserId: String(other.id || ''),
              otherUserPhone: other.phone || undefined,
            };
          });

          // 🔧 إزالة المحادثات المكررة في polling
          // مع الحفاظ على المحادثة المطلوبة من URL إذا وجدت
          const requestedConvId =
            typeof router.query.convId === 'string' ? router.query.convId : undefined;
          const deduplicated = deduplicateConversations(normalized, requestedConvId);
          setConversations(deduplicated);
        }
      } catch (_) {
        // تجاهل أخطاء polling
      }
    };

    // تشغيل polling كل 5 ثوان لقائمة المحادثات عند غياب WebSocket
    const pollInterval = setInterval(pollConversations, 5000);

    return () => clearInterval(pollInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // ✅ إزالة isRealtimeConnected لتجنب إعادة تشغيل متكررة

  // 🔌 Socket: المستمعين فقط (بدون اتصال تلقائي - الرسائل تعمل عبر HTTP)
  useEffect(() => {
    if (!user?.id) return;
    const sm = getSocketManager();
    const token = getAuthToken();

    // إعلان عن الحضور
    if (token) {
      sm.announcePresence(token);
    }
    if (user?.id) {
      sm.announcePresence(String(user.id));
    }

    // 🛡️ Set لتتبع الرسائل المستلمة ومنع التكرار
    const processedMessageIds = new Set<string>();

    const presenceHandler: (...args: unknown[]) => void = (...args) => {
      const data = (args?.[0] || {}) as { userId: string; isOnline: boolean };
      if (!data || !('userId' in data)) return;
      setOnlineMap((prev) => ({ ...prev, [String(data.userId)]: Boolean(data.isOnline) }));
    };

    const typingHandler: (...args: unknown[]) => void = (...args) => {
      const data = (args?.[0] || {}) as { conversationId: string; userId: string; typing: boolean };
      if (!data || !('conversationId' in data)) return;
      if (
        String(data.conversationId) === String(selectedConvId) &&
        String(data.userId) !== String(user.id)
      ) {
        setTypingOther(Boolean(data.typing));
      }
    };

    const messageHandler: (...args: unknown[]) => void = (...args) => {
      const payload = (args?.[0] || {}) as ChatMessageEvent;
      const { conversationId, message } = payload || ({} as ChatMessageEvent);
      if (!conversationId || !message) return;

      const msgId = String(message.id);

      // 🔍 تشخيص: طباعة نوع الرسالة المستلمة
      // 🛡️ منع معالجة نفس الرسالة مرتين من Socket.IO
      if (processedMessageIds.has(msgId)) {
        return;
      }
      processedMessageIds.add(msgId);

      const uiMsg: UiMessage = {
        id: msgId,
        senderId: String(message.senderId),
        type: String(message.type || 'text') as UiMessage['type'] as UiMessage['type'],
        content: String(message.content || ''),
        createdAt: String(message.createdAt || new Date().toISOString()),
        imageUrl: message.imageUrl,
        status: 'sent',
      };

      setMessages((prev) => {
        const key = String(conversationId);
        const list = prev[key] || [];
        // فحص إضافي في state
        if (list.some((m) => String(m.id) === msgId)) {
          return prev;
        }
        return { ...prev, [key]: [...list, uiMsg] };
      });
      // Update conversation preview and unread counter
      try {
        const isCurrent = String(conversationId) === String(selectedConvId);
        const preview =
          uiMsg.type === 'image'
            ? '[صورة]'
            : uiMsg.type === 'location'
              ? '[موقع]'
              : uiMsg.content || '';

        setConversations((prev) =>
          prev.map((c) =>
            String(c.id) === String(conversationId)
              ? {
                  ...c,
                  lastMessage: preview,
                  lastTime: 'الآن',
                  unread: isCurrent ? 0 : Math.max(0, Number(c.unread || 0) + 1),
                }
              : c,
          ),
        );

        // Enhanced notifications for new messages
        if (String(message.senderId) !== String(user?.id)) {
          // 🔍 البحث بشكل آمن باستخدام functional update واسترجاع المحادثة للإشعارات
          let foundConv: UiConversation | undefined;
          setConversations((currentConvs) => {
            foundConv = currentConvs.find((c) => String(c.id) === String(conversationId));
            return currentConvs;
          });

          // Show browser notification if not in current conversation
          if (!isCurrent && foundConv) {
            // Browser notification (if permission granted)
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(`رسالة جديدة من ${foundConv?.title || 'مستخدم'}`, {
                body: preview,
                icon: foundConv?.avatar || '/images/default-avatar.svg',
                tag: `message-${conversationId}`,
                requireInteraction: false,
                silent: mutedConversations.has(String(conversationId)),
              });
            }
          }
        }
      } catch (_) {
        // ignore UI errors
      }
      // Send delivery ACK if the message is from the other user
      try {
        if (String(message.senderId) !== String(user?.id)) {
          const sm = getSocketManager();
          sm.deliveredAck(String(conversationId), String(message.id));
        }
      } catch (_) {
        // ignore ack errors
      }
      if (String(conversationId) === String(selectedConvId)) {
        // Clear typing indicator if other user sent a message
        if (String(message.senderId) !== String(user?.id)) {
          setTypingOther(false);
          // Immediately mark as read for current conversation
          void markConversationAsRead(String(conversationId));
        }
        // لا scroll تلقائي - المستخدم يبقى في موضعه الحالي
      }
    };

    const messagesReadHandler: (...args: unknown[]) => void = (...args) => {
      const data = (args?.[0] || {}) as {
        conversationId: string;
        readerId: string;
        readAt: string;
      };
      if (!data || !('conversationId' in data)) return;
      setMessages((prev) => ({
        ...prev,
        [String(data.conversationId)]: (prev[String(data.conversationId)] || []).map((m) =>
          String(m.senderId) === String(user?.id) ? { ...m, status: 'read' } : m,
        ),
      }));
    };

    const messageDeliveredHandler: (...args: unknown[]) => void = (...args) => {
      const data = (args?.[0] || {}) as {
        conversationId: string;
        messageId: string;
        deliveredTo: string;
        deliveredAt: string;
      };
      if (!data || !('conversationId' in data) || !data.messageId) return;
      setMessages((prev) => ({
        ...prev,
        [String(data.conversationId)]: (prev[String(data.conversationId)] || []).map((m) =>
          String(m.id) === String(data.messageId)
            ? { ...m, status: m.status === 'read' ? 'read' : 'delivered' }
            : m,
        ),
      }));
    };

    // 🔔 معالج تحديث العداد اللحظي (يحدّث Navbar)
    const unreadUpdateHandler: (...args: unknown[]) => void = (...args) => {
      const data = (args?.[0] || {}) as { userId: string; increment?: number; decrement?: number };
      if (!data || !('userId' in data)) return;

      // تحديث لقائمة المحادثات أيضاً (ليس فقط Navbar)
      if (String(data.userId) === String(user.id)) {
        // بث custom event لتحديث Badge
        window.dispatchEvent(new CustomEvent('messagesUpdated'));

        // إعادة تحميل قائمة المحادثات لتحديث العدادات
        const loadConvs = async () => {
          try {
            const token = getToken?.();
            const res = await fetch(`/api/conversations?userId=${encodeURIComponent(user.id)}`, {
              headers: token ? { Authorization: `Bearer ${token}` } : undefined,
              credentials: 'include', // إرسال الـ Cookie أيضاً لضمان المصادقة
            });
            const resData: { success: boolean; data: ApiConversationDTO[] } = await res.json();
            if (resData?.success) {
              const normalized: UiConversation[] = (resData.data || []).map(
                (c: ApiConversationDTO) => {
                  const other = (() => {
                    const arr = Array.isArray(c?.conversation_participants)
                      ? c.conversation_participants!
                      : [];
                    const otherP = arr.find((x) => String(x?.userId) !== String(user.id));
                    const u: ApiUserSlim = otherP?.users || {};
                    return {
                      name: u?.name || c?.title || 'مستخدم',
                      avatar: u?.profileImage || '/images/default-avatar.svg',
                      id: u?.id || otherP?.userId || '',
                      phone: u?.phone || null,
                    };
                  })();
                  const msgs: ApiMessageDTO[] | undefined = Array.isArray(c?.messages)
                    ? c.messages
                    : undefined;
                  const lastMsg = (msgs && msgs[0]) || null;
                  return {
                    id: String(c?.id || ''),
                    title: String(other.name || 'مستخدم'),
                    subtitle: c?.cars?.title || c?.auctions?.title || c?.carTitle || undefined,
                    avatar: other.avatar,
                    lastMessage: lastMsg?.content || c?.lastMessage || '',
                    lastTime: lastMsg?.createdAt
                      ? formatRelativeTime(lastMsg.createdAt)
                      : c?.updatedAt
                        ? formatRelativeTime(c.updatedAt)
                        : undefined,
                    unread: Math.max(0, Number(c?.unread || 0)) || 0,
                    otherUserId: String(other.id || ''),
                    otherUserPhone: other.phone || undefined,
                  };
                },
              );
              const deduplicated = deduplicateConversations(normalized);
              setConversations(deduplicated);
            }
          } catch (_) {
            // ignore
          }
        };
        void loadConvs();
      }
    };

    sm.on('presence:update', presenceHandler);
    sm.on('chat:typing', typingHandler);
    sm.on('chat:message:new', messageHandler);
    sm.on('chat:messages:read', messagesReadHandler);
    sm.on('chat:message:delivered', messageDeliveredHandler);
    sm.on('messages:unread-update', unreadUpdateHandler);

    return () => {
      // 🧹 تنظيف كامل للمستمعين
      sm.off('presence:update', presenceHandler);
      sm.off('chat:typing', typingHandler);
      sm.off('chat:message:new', messageHandler);
      sm.off('chat:messages:read', messagesReadHandler);
      sm.off('chat:message:delivered', messageDeliveredHandler);
      sm.off('messages:unread-update', unreadUpdateHandler);

      // 🧹 تنظيف Set الرسائل المعالجة
      processedMessageIds.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, selectedConvId]);

  // Join/leave chat room when conversation changes - النظام الجديد المحسّن
  useEffect(() => {
    if (!user?.id || !selectedConvId) return;

    // استخدام النظام الجديد
    realtimeJoinConversation(String(selectedConvId));

    setTypingOther(false);

    return () => {
      realtimeLeaveConversation(String(selectedConvId));
      setTypingOther(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, selectedConvId]);

  const unreadTotal = useMemo(() => {
    return conversations.reduce((sum, c) => sum + Number(c.unread || 0), 0);
  }, [conversations]);

  const pinnedTotal = useMemo(() => {
    return conversations.filter((c) => pinnedConversations.has(c.id)).length;
  }, [conversations, pinnedConversations]);

  const archivedTotal = useMemo(() => {
    return conversations.filter((c) => archivedConversations.has(c.id)).length;
  }, [conversations, archivedConversations]);

  const requestsTotal = useMemo(() => {
    // Mock requests - in real app this would come from API
    return 2; // placeholder
  }, []);

  // 🔍 نظام البحث الموحد - يبحث في المحادثات الموجودة والمستخدمين الجدد
  useEffect(() => {
    const query = searchQuery.trim();

    // إذا كان البحث فارغاً، مسح النتائج
    if (!query) {
      setSearchResults([]);
      setSearchingUsers(false);
      return;
    }

    // تأخير البحث لتجنب الكثير من الطلبات (debounce)
    const timer = setTimeout(async () => {
      setSearchingUsers(true);
      try {
        const token = getToken?.();
        const res = await fetch(
          `/api/users/search?q=${encodeURIComponent(query)}&exclude=${encodeURIComponent(user?.id || '')}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            credentials: 'include',
          },
        );
        const data = await res.json();

        if (data?.success && Array.isArray(data.data)) {
          // تصفية النتائج - استبعاد المستخدمين الموجودين في المحادثات
          const existingUserIds = new Set(conversations.map((c) => String(c.otherUserId)));
          const newUsers = data.data
            .filter(
              (u: any) => !existingUserIds.has(String(u.id)) && String(u.id) !== String(user?.id),
            )
            .map((u: any) => ({
              id: String(u.id),
              name: u.name || 'مستخدم',
              phone: u.phone || null,
              profileImage: u.profileImage || null,
              isNewUser: true,
            }));

          setSearchResults(newUsers);
        } else {
          setSearchResults([]);
        }
      } catch (_) {
        setSearchResults([]);
      } finally {
        setSearchingUsers(false);
      }
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, user?.id, conversations]);

  const filteredConversations = useMemo(() => {
    let list = conversations;

    // Apply filter
    if (selectedFilter === 'unread') {
      list = list.filter((c) => Number(c.unread || 0) > 0);
    } else if (selectedFilter === 'pinned') {
      list = list.filter((c) => pinnedConversations.has(c.id));
    } else if (selectedFilter === 'archived') {
      list = list.filter((c) => archivedConversations.has(c.id));
    } else if (selectedFilter === 'requests') {
      // Mock - show conversations that are requests
      list = conversations.slice(0, 2); // placeholder
    }

    // Apply search - بحث شامل في الاسم، رقم الهاتف (بكل الأشكال)، عنوان السيارة، وآخر رسالة
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    const qDigits = searchQuery.replace(/\D/g, '');
    const qDigitVariants = normalizePhoneQueryVariants(qDigits);
    return list.filter((c) => {
      const matchesName = (c.title || '').toLowerCase().includes(q);
      const matchesSubtitle = (c.subtitle || '').toLowerCase().includes(q);
      const matchesLastMessage = (c.lastMessage || '').toLowerCase().includes(q);

      // مطابقة مرنة لرقم الهاتف: 091xxxxxxx / 91xxxxxxx / +21891xxxxxxx / 21891xxxxxxx
      const phoneRaw = c.otherUserPhone || '';
      const phoneDigits = phoneRaw.replace(/\D/g, '');
      const phoneVariants = buildPhoneVariants(phoneDigits);
      const numericMatch =
        qDigitVariants.length > 0
          ? qDigitVariants.some((qv) => phoneVariants.some((pv) => pv.includes(qv)))
          : false;
      const matchesPhoneText = phoneRaw.toLowerCase().includes(q);

      return (
        matchesName || matchesSubtitle || matchesLastMessage || matchesPhoneText || numericMatch
      );
    });
  }, [conversations, searchQuery, selectedFilter, pinnedConversations, archivedConversations]);

  const currentMessages = messages[selectedConvId || ''] || [];

  // Sending and uploads are handled inside MessageComposer

  const onStartConversation = async (_userId: string, _userName: string) => {
    // After modal creates conversation via /api/conversations, refresh list
    try {
      if (!user?.id) return;

      const token = getToken?.();
      const res = await fetch(`/api/conversations?userId=${encodeURIComponent(user.id)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        credentials: 'include', // إرسال الـ Cookie أيضاً لضمان المصادقة
      });

      const data = await res.json();

      if (data?.success && Array.isArray(data.data) && data.data.length > 0) {
        const normalized: UiConversation[] = (data.data || []).map((c: any) => {
          // استخراج معلومات الطرف الآخر في المحادثة
          const other = (() => {
            // جلب المشاركين من conversation_participants
            const p = c?.conversation_participants || [];
            const arr: any[] = Array.isArray(p) ? p : [];

            // البحث عن المشارك الآخر (ليس المستخدم الحالي)
            const otherP = arr.find((x: any) => String(x?.userId) !== String(user.id));

            // جلب بيانات المستخدم من users object
            const u = otherP?.users || {};

            return {
              name: u?.name || c?.title || 'مستخدم',
              avatar: u?.profileImage || '/images/default-avatar.svg',
              id: u?.id || otherP?.userId || '',
              phone: u?.phone || '',
            };
          })();
          const msgs: any[] | undefined = Array.isArray(c?.messages)
            ? (c.messages as any[])
            : undefined;
          const lastMsg = (msgs && msgs[0]) || null;
          return {
            id: String(c?.id || ''),
            title: String(other.name || 'مستخدم'),
            subtitle: c?.cars?.title || c?.auctions?.title || c?.carTitle || undefined,
            avatar: other.avatar,
            lastMessage: lastMsg?.content || c?.lastMessage || '',
            lastTime: lastMsg?.createdAt
              ? formatRelativeTime(lastMsg.createdAt)
              : c?.updatedAt
                ? formatRelativeTime(c.updatedAt)
                : undefined,
            unread: Math.max(0, Number(c?.unread || 0)) || 0,
            otherUserId: String(other.id || ''),
            otherUserPhone: other.phone || undefined,
          };
        });

        // 🔧 إزالة المحادثات المكررة بعد إنشاء محادثة جديدة
        const deduplicated = deduplicateConversations(normalized);
        setConversations(deduplicated);

        // ✅ اختر المحادثة الخاصة بالمستخدم الذي تم النقر عليه (بدلاً من أول محادثة)
        const createdConv =
          deduplicated.find((c) => String(c.otherUserId) === String(_userId)) ||
          deduplicated.find((c) => String(c.title || '').includes(_userName)) ||
          deduplicated[0];

        if (createdConv) {
          setSelectedConvId(String(createdConv.id || ''));
          // في الموبايل: الانتقال مباشرةً إلى نافذة الدردشة
          setShowChatOnMobile(true);
          setToast({
            message: `تم فتح محادثة مع ${_userName}`,
            type: 'success',
          });
        } else {
          setToast({
            message: 'حدث خطأ في فتح المحادثة',
            type: 'error',
          });
        }
      } else {
        setToast({
          message: 'حدث خطأ في تحديث قائمة المحادثات',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('خطأ في onStartConversation:', error);
      setToast({
        message: 'حدث خطأ في فتح المحادثة',
        type: 'error',
      });
    }
  };

  // تم حذف السبينر الداخلي - UnifiedPageTransition يتولى عرض مؤشر التحميل
  if (authLoading || (!user && typeof window === 'undefined')) return null;

  if (!user) return null; // redirected

  return (
    <>
      <Head>
        <title>الرسائل - مزاد السيارات</title>
        <meta name="description" content="تواصل مع البائعين والمشترين عبر نظام الرسائل" />
        <style jsx global>{`
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #e2e8f0 transparent;
          }

          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }

          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #e2e8f0;
            border-radius: 3px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #cbd5e1;
          }
        `}</style>
      </Head>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed right-4 top-4 z-50 rounded-lg p-3 text-sm shadow-lg transition-all duration-300 ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
        >
          <div className="flex items-center gap-2">
            <CheckBadgeIcon className="h-5 w-5" />
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-white/80 hover:text-white"
              aria-label="إغلاق"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* شاشة المكالمة - تظهر عند وجود مكالمة نشطة */}
      {currentCall && (
        <CallScreen
          call={currentCall}
          callStatus={callStatus}
          localStream={localStream}
          remoteStream={remoteStream}
          isVideoEnabled={isVideoEnabled}
          isAudioEnabled={isAudioEnabled}
          onToggleVideo={toggleVideo}
          onToggleAudio={toggleAudio}
          onSwitchCamera={switchCamera}
          onEndCall={endCall}
          onAcceptCall={acceptCall}
          onRejectCall={rejectCall}
        />
      )}

      <div className="flex h-screen flex-col bg-gray-50" dir="rtl">
        {/* Navbar - مخفي في الموبايل عند فتح محادثة */}
        {!(isMobileView && showChatOnMobile) && (
          <div className="relative">
            <OpensooqNavbar />
            {/* مؤشر حالة الاتصال */}
            <div className="absolute left-4 top-4 z-50">
              <NavConnectionIndicator status={connectionStatus} />
            </div>
          </div>
        )}

        {/* المحتوى الرئيسي مع سكرول */}
        <div className="flex-1 overflow-hidden">
          <div className="mx-auto h-full max-w-7xl px-4 py-3">
            {/* شريط الفلاتر الأفقي - يظهر عند 1150px أو أقل، مخفي في الموبايل عند فتح محادثة */}
            <div
              className={`custom-scrollbar mb-3 block overflow-x-auto min-[1151px]:hidden ${
                isMobileView && showChatOnMobile ? 'hidden' : ''
              }`}
            >
              <div className="flex min-w-max items-center gap-2 pb-2">
                {/* أزرار الفلاتر */}
                <button
                  type="button"
                  onClick={() => setSelectedFilter('all')}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    selectedFilter === 'all'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <ChatBubbleLeftRightIcon className="h-4 w-4" />
                  <span>الكل</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      selectedFilter === 'all'
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {conversations.length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFilter('unread')}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    selectedFilter === 'unread'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <BellIcon className="h-4 w-4" />
                  <span>غير المقروءة</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      selectedFilter === 'unread'
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {unreadTotal}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFilter('pinned')}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    selectedFilter === 'pinned'
                      ? 'bg-yellow-600 text-white shadow-md'
                      : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <StarIcon className="h-4 w-4" />
                  <span>المثبتة</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      selectedFilter === 'pinned'
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {pinnedTotal}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFilter('archived')}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    selectedFilter === 'archived'
                      ? 'bg-gray-600 text-white shadow-md'
                      : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <ArchiveBoxIcon className="h-4 w-4" />
                  <span>المؤرشفة</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      selectedFilter === 'archived'
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {archivedTotal}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFilter('requests')}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    selectedFilter === 'requests'
                      ? 'bg-green-600 text-white shadow-md'
                      : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <HandRaisedIcon className="h-4 w-4" />
                  <span>طلبات الرسائل</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      selectedFilter === 'requests'
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {requestsTotal}
                  </span>
                </button>
              </div>
            </div>

            {/* Layout: Left rail + Conversations list + Chat area */}
            <div className="grid h-full grid-cols-5 gap-3 min-[1151px]:grid-cols-8">
              {/* Left Rail: Filters & Actions - مخفي عند 1150px أو أقل */}
              <div className="custom-scrollbar col-span-1 hidden max-h-[calc(100vh-170px)] flex-col gap-2 overflow-y-auto min-[1151px]:flex">
                <div className="rounded-lg border border-gray-100 bg-white p-2.5 shadow-sm">
                  <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                    التصنيف
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedFilter('all')}
                      className={`flex items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors ${
                        selectedFilter === 'all'
                          ? 'border border-blue-200 bg-blue-50 text-blue-700'
                          : 'border border-transparent bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                      aria-pressed={selectedFilter === 'all'}
                    >
                      <div className="flex items-center gap-1.5">
                        <ChatBubbleLeftRightIcon className="h-3.5 w-3.5" />
                        <span className="font-medium">الكل</span>
                      </div>
                      <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] text-gray-700 shadow-sm">
                        {conversations.length}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedFilter('unread')}
                      className={`flex items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors ${
                        selectedFilter === 'unread'
                          ? 'border border-blue-200 bg-blue-50 text-blue-700'
                          : 'border border-transparent bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                      aria-pressed={selectedFilter === 'unread'}
                    >
                      <div className="flex items-center gap-1.5">
                        <BellIcon className="h-3.5 w-3.5" />
                        <span className="font-medium">غير المقروءة</span>
                      </div>
                      <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] text-gray-700 shadow-sm">
                        {unreadTotal}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedFilter('pinned')}
                      className={`flex items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors ${
                        selectedFilter === 'pinned'
                          ? 'border border-yellow-200 bg-yellow-50 text-yellow-700'
                          : 'border border-transparent bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                      aria-pressed={selectedFilter === 'pinned'}
                    >
                      <div className="flex items-center gap-1.5">
                        <StarIcon className="h-3.5 w-3.5" />
                        <span className="font-medium">المثبتة</span>
                      </div>
                      <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] text-gray-700 shadow-sm">
                        {pinnedTotal}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedFilter('archived')}
                      className={`flex items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors ${
                        selectedFilter === 'archived'
                          ? 'border border-gray-300 bg-gray-100 text-gray-700'
                          : 'border border-transparent bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                      aria-pressed={selectedFilter === 'archived'}
                    >
                      <div className="flex items-center gap-1.5">
                        <ArchiveBoxIcon className="h-3.5 w-3.5" />
                        <span className="font-medium">المؤرشفة</span>
                      </div>
                      <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] text-gray-700 shadow-sm">
                        {archivedTotal}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedFilter('requests')}
                      className={`flex items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors ${
                        selectedFilter === 'requests'
                          ? 'border border-green-200 bg-green-50 text-green-700'
                          : 'border border-transparent bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                      aria-pressed={selectedFilter === 'requests'}
                    >
                      <div className="flex items-center gap-1.5">
                        <HandRaisedIcon className="h-3.5 w-3.5" />
                        <span className="font-medium">طلبات الرسائل</span>
                      </div>
                      <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] text-gray-700 shadow-sm">
                        {requestsTotal}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-100 bg-white p-2.5 shadow-sm">
                  <button
                    onClick={() => setShowStartModal(true)}
                    className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-1.5 text-xs font-medium text-white shadow-md transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-lg"
                  >
                    بدء محادثة جديدة
                  </button>
                </div>

                {/* Quick Actions & Stats */}
                <div className="rounded-lg border border-gray-100 bg-white p-2.5 shadow-sm">
                  <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                    إحصائيات سريعة
                  </div>
                  <div className="mb-2.5 grid grid-cols-2 gap-1.5">
                    <div className="rounded-md bg-blue-50 p-1.5 text-center">
                      <div className="text-base font-bold text-blue-600">
                        {conversations.length}
                      </div>
                      <div className="text-[10px] text-blue-600">المحادثات</div>
                    </div>
                    <div className="rounded-md bg-red-50 p-1.5 text-center">
                      <div className="text-base font-bold text-red-600">{unreadTotal}</div>
                      <div className="text-[10px] text-red-600">غير مقروءة</div>
                    </div>
                  </div>
                  <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                    إجراءات سريعة
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={async () => {
                        // Mark all as read functionality
                        try {
                          const token = getToken?.();
                          for (const conv of conversations) {
                            if (conv.unread && conv.unread > 0) {
                              await fetch('/api/messages', {
                                method: 'PUT',
                                headers: {
                                  'Content-Type': 'application/json',
                                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                                },
                                credentials: 'include', // إرسال الـ Cookie أيضاً لضمان المصادقة
                                body: JSON.stringify({
                                  action: 'markAsRead',
                                  conversationId: conv.id,
                                }),
                              });
                            }
                          }

                          // Update UI
                          setConversations((prev) => prev.map((c) => ({ ...c, unread: 0 })));

                          setToast({ message: 'تم تحديد جميع الرسائل كمقروءة', type: 'success' });

                          // ⚠️ تعطيل مؤقت - notificationService
                          // notificationService.showInAppNotification(
                          //   'تم تحديد جميع المحادثات كمقروءة',
                          //   'success'
                          // );
                        } catch (error) {
                          setToast({ message: 'حدث خطأ أثناء تحديد الرسائل', type: 'error' });
                        }
                      }}
                      className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-800"
                    >
                      <CheckBadgeIcon className="h-3 w-3" />
                      <span>تحديد الكل كمقروء</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        // Clear search and show all
                        setSearchQuery('');
                        setSelectedFilter('all');
                        setToast({ message: 'تم إعادة تعيين التصفية', type: 'success' });
                      }}
                      className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-800"
                    >
                      <MagnifyingGlassIcon className="h-3 w-3" />
                      <span>إظهار جميع المحادثات</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Conversations */}
              <div
                className={`relative max-[1150px]:col-span-2 min-[1151px]:col-span-2 ${
                  isMobileView
                    ? showChatOnMobile
                      ? 'hidden' // في الموبايل: إخفاء القائمة عند فتح الدردشة
                      : 'col-span-5' // في الموبايل: ملء العرض عند إظهار القائمة
                    : '' // في الشاشات الكبيرة: عرض عادي
                }`}
              >
                <div className="flex max-h-[calc(100vh-170px)] flex-col overflow-hidden rounded-lg border border-gray-200 bg-gray-50/50">
                  {/* شريط الإجراءات الثابت - يظهر عند تحديد محادثة */}
                  {selectedConvId &&
                    (() => {
                      const selectedConv = conversations.find((c) => c.id === selectedConvId);
                      const isPinned = pinnedConversations.has(selectedConvId);
                      const isArchived = archivedConversations.has(selectedConvId);
                      const isMuted = mutedConversations.has(selectedConvId);
                      const isBlocked = blockedUsers.has(selectedConv?.otherUserId || '');

                      return (
                        <div className="flex-shrink-0 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-3 py-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-500">
                              إجراءات المحادثة
                            </span>
                            <div className="flex flex-wrap items-center gap-1">
                              {/* زر التثبيت */}
                              <button
                                onClick={() => {
                                  const newPinned = new Set(pinnedConversations);
                                  if (isPinned) {
                                    newPinned.delete(selectedConvId);
                                    setToast({
                                      message: 'تم إلغاء تثبيت المحادثة',
                                      type: 'success',
                                    });
                                  } else {
                                    newPinned.add(selectedConvId);
                                    setToast({ message: 'تم تثبيت المحادثة', type: 'success' });
                                  }
                                  setPinnedConversations(newPinned);
                                }}
                                className={`flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors ${
                                  isPinned
                                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                                title={isPinned ? 'إلغاء التثبيت' : 'تثبيت'}
                              >
                                <StarIcon className="h-4 w-4" />
                                <span>{isPinned ? 'مثبتة' : 'تثبيت'}</span>
                              </button>

                              {/* زر الأرشفة */}
                              <button
                                onClick={() => {
                                  const newArchived = new Set(archivedConversations);
                                  if (isArchived) {
                                    newArchived.delete(selectedConvId);
                                    setToast({
                                      message: 'تم إلغاء أرشفة المحادثة',
                                      type: 'success',
                                    });
                                  } else {
                                    newArchived.add(selectedConvId);
                                    setToast({ message: 'تم أرشفة المحادثة', type: 'success' });
                                  }
                                  setArchivedConversations(newArchived);
                                }}
                                className={`flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors ${
                                  isArchived
                                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                                title={isArchived ? 'إلغاء الأرشفة' : 'أرشفة'}
                              >
                                <ArchiveBoxIcon className="h-4 w-4" />
                                <span>{isArchived ? 'مؤرشفة' : 'أرشفة'}</span>
                              </button>

                              {/* زر الكتم */}
                              <button
                                onClick={() => {
                                  const newMuted = new Set(mutedConversations);
                                  if (isMuted) {
                                    newMuted.delete(selectedConvId);
                                    setToast({ message: 'تم إلغاء كتم المحادثة', type: 'success' });
                                  } else {
                                    newMuted.add(selectedConvId);
                                    setToast({ message: 'تم كتم المحادثة', type: 'success' });
                                  }
                                  setMutedConversations(newMuted);
                                }}
                                className={`flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors ${
                                  isMuted
                                    ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                                title={isMuted ? 'إلغاء الكتم' : 'كتم'}
                              >
                                <SpeakerXMarkIcon className="h-4 w-4" />
                                <span>{isMuted ? 'مكتومة' : 'كتم'}</span>
                              </button>

                              {/* زر الحظر */}
                              <button
                                onClick={() => {
                                  if (!selectedConv?.otherUserId) return;
                                  const newBlocked = new Set(blockedUsers);
                                  if (isBlocked) {
                                    newBlocked.delete(selectedConv.otherUserId);
                                    setToast({ message: 'تم إلغاء حظر المستخدم', type: 'success' });
                                  } else {
                                    newBlocked.add(selectedConv.otherUserId);
                                    setToast({ message: 'تم حظر المستخدم', type: 'success' });
                                  }
                                  setBlockedUsers(newBlocked);
                                }}
                                className={`flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors ${
                                  isBlocked
                                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                                title={isBlocked ? 'إلغاء الحظر' : 'حظر'}
                              >
                                <NoSymbolIcon className="h-4 w-4" />
                                <span>{isBlocked ? 'محظور' : 'حظر'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                  {/* Header + حقل البحث الموحد */}
                  <div className="flex-shrink-0 border-b border-gray-200 bg-white p-3">
                    {/* عنوان الرسائل وزر محادثة جديدة */}
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {/* زر الرجوع - يظهر فقط في الموبايل */}
                        {isMobileView && (
                          <button
                            onClick={() => router.back()}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200"
                            aria-label="العودة للصفحة السابقة"
                            title="رجوع"
                          >
                            <ChevronLeftIcon className="h-4 w-4" />
                          </button>
                        )}
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50">
                          <ChatBubbleLeftRightIcon className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex items-baseline gap-1.5">
                          <h1 className="text-sm font-bold text-gray-900">الرسائل</h1>
                          <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                            {conversations.length}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowStartModal(true)}
                        className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-md"
                      >
                        <ChatBubbleLeftRightIcon className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">محادثة جديدة</span>
                        <span className="sm:hidden">جديد</span>
                      </button>
                    </div>
                    {/* حقل البحث الموحد - يبحث في المحادثات الموجودة والمستخدمين الجدد */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder={
                          searchQuery ? 'جاري البحث...' : 'ابحث في المحادثات أو عن مستخدم جديد...'
                        }
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-12 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                      <MagnifyingGlassIcon
                        className={`pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${
                          searchingUsers ? 'animate-pulse text-blue-500' : 'text-gray-400'
                        }`}
                      />
                      {searchQuery && (
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setSearchResults([]);
                          }}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 transition-colors hover:bg-gray-100"
                          aria-label="مسح البحث"
                        >
                          <XMarkIcon className="h-4 w-4 text-gray-500" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="custom-scrollbar flex-1 space-y-2 overflow-y-auto px-3 py-4">
                    {/* نتائج البحث عن مستخدمين جدد */}
                    {searchQuery && searchResults.length > 0 && (
                      <div className="mb-3">
                        <div className="mb-2 flex items-center gap-2 px-2">
                          <div className="h-px flex-1 bg-gray-200"></div>
                          <span className="text-xs font-medium text-gray-500">
                            مستخدمون جدد ({searchResults.length})
                          </span>
                          <div className="h-px flex-1 bg-gray-200"></div>
                        </div>
                        {searchResults.map((newUser) => (
                          <div
                            key={newUser.id}
                            onClick={async () => {
                              // بدء محادثة مباشرة مع المستخدم الجديد
                              try {
                                const token = getToken?.();
                                const createRes = await fetch('/api/conversations', {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                                  },
                                  credentials: 'include', // إرسال الـ Cookie أيضاً لضمان المصادقة
                                  body: JSON.stringify({
                                    otherUserId: newUser.id,
                                  }),
                                });

                                const createData = await createRes.json();

                                if (createData?.success) {
                                  // تحديث قائمة المحادثات وفتحها مباشرة
                                  await onStartConversation(newUser.id, newUser.name);
                                  setSearchQuery('');
                                  setSearchResults([]);
                                  // الرسالة تُعرض في onStartConversation
                                } else {
                                  console.error('[Search] فشل إنشاء المحادثة:', createData);
                                  setToast({
                                    message: createData?.error || 'حدث خطأ في بدء المحادثة',
                                    type: 'error',
                                  });
                                }
                              } catch (error) {
                                console.error('[Search] خطأ في بدء المحادثة:', error);
                                setToast({ message: 'حدث خطأ في بدء المحادثة', type: 'error' });
                              }
                            }}
                            className="group mb-2 cursor-pointer rounded-lg border border-dashed border-blue-200 bg-blue-50/30 p-2.5 shadow-sm transition-all hover:border-blue-300 hover:bg-blue-50 hover:shadow-md"
                          >
                            <div className="flex items-start gap-2.5">
                              {/* Avatar */}
                              <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
                                <UserAvatar
                                  src={newUser.profileImage || undefined}
                                  alt={newUser.name}
                                  size="md"
                                  showPresenceDot={false}
                                  isOnline={false}
                                />
                              </div>

                              {/* Content */}
                              <div className="min-w-0 flex-1">
                                <div className="mb-1 flex items-center justify-between gap-2">
                                  <div className="flex min-w-0 items-center gap-2">
                                    <h3 className="truncate font-semibold text-gray-900">
                                      {newUser.name}
                                    </h3>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                                      <UserIcon className="h-3 w-3" />
                                      جديد
                                    </span>
                                  </div>
                                </div>
                                {newUser.phone && (
                                  <div className="mb-1 flex items-center gap-1 truncate text-xs text-gray-500">
                                    <PhoneIcon className="h-3 w-3" />
                                    {newUser.phone}
                                  </div>
                                )}
                                <p className="text-sm text-blue-600">انقر لبدء محادثة</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* عنوان المحادثات الموجودة عند وجود نتائج بحث */}
                    {searchQuery && filteredConversations.length > 0 && (
                      <div className="mb-2 flex items-center gap-2 px-2">
                        <div className="h-px flex-1 bg-gray-200"></div>
                        <span className="text-xs font-medium text-gray-500">
                          محادثات موجودة ({filteredConversations.length})
                        </span>
                        <div className="h-px flex-1 bg-gray-200"></div>
                      </div>
                    )}

                    {loadingConversations ? (
                      <div className="rounded-xl bg-white p-8 text-center shadow-sm">
                        <div
                          className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                          style={{ width: 24, height: 24 }}
                          role="status"
                          aria-label="جاري التحميل"
                        />
                        <p className="mt-3 text-gray-600">جاري تحميل المحادثات...</p>
                      </div>
                    ) : filteredConversations.length === 0 && searchResults.length === 0 ? (
                      <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-6 text-center shadow-sm">
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
                          <ChatBubbleLeftRightIcon className="h-10 w-10 text-blue-500" />
                        </div>
                        {searchQuery ? (
                          <>
                            <h3 className="mb-2 text-lg font-bold text-gray-900">لا توجد نتائج</h3>
                            <p className="mb-4 text-sm text-gray-600">
                              لا توجد محادثات تطابق &quot;{searchQuery}&quot;
                            </p>
                            <button
                              onClick={() => setSearchQuery('')}
                              className="mx-auto rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                            >
                              مسح البحث
                            </button>
                          </>
                        ) : (
                          <>
                            <h3 className="mb-2 text-lg font-bold text-gray-900">
                              لا توجد محادثات بعد
                            </h3>
                            <p className="mb-4 text-sm text-gray-600">
                              ابدأ أول محادثة مع البائعين والمشترين
                            </p>
                            <button
                              onClick={() => setShowStartModal(true)}
                              className="mx-auto inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-sm font-medium text-white shadow-lg transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-xl"
                            >
                              <ChatBubbleLeftRightIcon className="h-5 w-5" />
                              <span>بدء محادثة جديدة</span>
                            </button>
                          </>
                        )}
                      </div>
                    ) : (
                      filteredConversations.map((c) => {
                        const isPinned = pinnedConversations.has(c.id);
                        const isArchived = archivedConversations.has(c.id);
                        const isMuted = mutedConversations.has(c.id);
                        const isBlocked = blockedUsers.has(c.otherUserId || '');

                        return (
                          <div
                            key={c.id}
                            onClick={() => {
                              // 🔄 تفعيل حالة التبديل فوراً إذا كانت محادثة مختلفة
                              if (selectedConvId && selectedConvId !== c.id) {
                                setSwitchingConversation(true);
                              }

                              setSelectedConvId(c.id);

                              // تصفير عداد الرسائل غير المقروءة فوراً عند فتح المحادثة
                              setConversations((prev) =>
                                prev.map((conv) =>
                                  conv.id === c.id ? { ...conv, unread: 0 } : conv,
                                ),
                              );

                              // في الموبايل: فتح المحادثة مباشرة
                              if (isMobileView) {
                                setShowChatOnMobile(true);
                              }
                            }}
                            className={`group relative cursor-pointer rounded-lg border bg-white p-2.5 shadow-sm transition-all hover:border-gray-300 hover:shadow-md active:scale-[0.98] ${
                              selectedConvId === c.id
                                ? 'border-blue-300 bg-blue-50/40 ring-1 ring-blue-200'
                                : 'border-gray-200'
                            } ${isPinned ? 'border-yellow-200 bg-yellow-50/20' : ''} ${
                              isArchived ? 'opacity-60' : ''
                            }`}
                          >
                            {/* Status indicators - Always visible */}
                            <div className="absolute right-2 top-2 flex items-center gap-1">
                              {isPinned && (
                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-100">
                                  <StarIcon className="h-3 w-3 text-yellow-600" />
                                </div>
                              )}
                              {isMuted && (
                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100">
                                  <SpeakerXMarkIcon className="h-3 w-3 text-gray-500" />
                                </div>
                              )}
                              {isBlocked && (
                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100">
                                  <NoSymbolIcon className="h-3 w-3 text-red-600" />
                                </div>
                              )}
                            </div>

                            <div className="flex items-start gap-2.5">
                              {/* Avatar */}
                              <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
                                <UserAvatar
                                  src={c.avatar}
                                  alt={c.title}
                                  size="md"
                                  showPresenceDot={Boolean(c.otherUserId)}
                                  isOnline={Boolean(
                                    c.otherUserId && onlineMap[String(c.otherUserId)],
                                  )}
                                />
                                {isBlocked && (
                                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-50">
                                    <NoSymbolIcon className="h-5 w-5 text-white" />
                                  </div>
                                )}
                              </div>

                              {/* Content */}
                              <div className="min-w-0 flex-1">
                                <div className="mb-1 flex items-center justify-between gap-2">
                                  <div className="flex min-w-0 items-center gap-2">
                                    <h3
                                      className={`truncate font-semibold ${
                                        isBlocked ? 'text-gray-400 line-through' : 'text-gray-900'
                                      }`}
                                    >
                                      {c.title}
                                    </h3>
                                  </div>
                                  {((c.unread &&
                                    Number(c.unread) > 0 &&
                                    String(c.unread) !== '0' &&
                                    String(c.unread) !== '00') ||
                                    false) && (
                                    <div className="flex flex-shrink-0 items-center gap-1">
                                      {!isMuted && (
                                        <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
                                          {c.unread}
                                        </span>
                                      )}
                                      {isMuted && (
                                        <span className="rounded-full bg-gray-400 px-2 py-0.5 text-xs font-medium text-white">
                                          {c.unread}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                                {c.subtitle && (
                                  <div className="mb-1 truncate text-xs text-gray-500">
                                    {c.subtitle}
                                  </div>
                                )}
                                {/* Last Message - سطرين مع تحسين */}
                                <p
                                  className={`mb-1.5 line-clamp-2 text-sm leading-snug ${
                                    isBlocked ? 'text-gray-400' : 'text-gray-600'
                                  }`}
                                >
                                  {isBlocked ? (
                                    'تم حظر هذا المستخدم'
                                  ) : c.lastMessage ? (
                                    <span className="inline-flex items-start gap-1">
                                      <ChatBubbleLeftRightIcon className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                                      <span className="line-clamp-2">{c.lastMessage}</span>
                                    </span>
                                  ) : (
                                    <span className="italic text-gray-400">لا توجد رسائل بعد</span>
                                  )}
                                </p>
                                {/* Time and status indicators */}
                                <div className="flex items-center justify-between text-xs text-gray-400">
                                  {c.lastTime ? (
                                    <div className="flex items-center gap-1.5">
                                      <ClockIcon className="h-3.5 w-3.5" />
                                      <span>{c.lastTime}</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1.5 text-gray-400">
                                      <span>محادثة جديدة</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1">
                                    {isArchived && (
                                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-400">
                                        مؤرشفة
                                      </span>
                                    )}
                                    {selectedFilter === 'requests' && (
                                      <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-600">
                                        طلب
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* زر عائم لمحادثة جديدة - يظهر فقط في الموبايل */}
                {isMobileView && !showChatOnMobile && (
                  <button
                    onClick={() => setShowStartModal(true)}
                    className="fixed bottom-6 left-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-2xl transition-all hover:scale-110 hover:from-blue-700 hover:to-blue-800 hover:shadow-blue-500/50 active:scale-95"
                    aria-label="محادثة جديدة"
                    title="محادثة جديدة"
                  >
                    <ChatBubbleLeftRightIcon className="h-6 w-6" />
                  </button>
                )}
              </div>

              {/* Chat Area */}
              <div
                className={`max-[1150px]:col-span-3 min-[1151px]:col-span-5 ${
                  isMobileView
                    ? showChatOnMobile
                      ? 'fixed bottom-0 left-0 right-0 top-0 z-50 flex flex-col bg-white' // في الموبايل: ملء الشاشة بالكامل (navbar مخفي)
                      : 'hidden' // مخفي في الموبايل عندما لا يكون مفتوح
                    : 'max-h-[calc(100vh-170px)]' // في الشاشات الكبيرة: حجم عادي
                }`}
              >
                {!selectedConvId ? (
                  <div
                    className={`flex h-full flex-col overflow-hidden ${
                      isMobileView ? '' : 'rounded-xl border border-gray-100 shadow-sm'
                    } bg-white`}
                  >
                    {/* Header - معطل بدون محادثة */}
                    <div className="flex-shrink-0 border-b border-gray-200 bg-white px-3 py-2 shadow-sm">
                      <div className="flex items-center justify-end gap-3">
                        {/* زر الاتصال - معطل */}
                        <button
                          disabled
                          className="flex h-10 w-10 flex-shrink-0 cursor-not-allowed items-center justify-center text-gray-400"
                          aria-label="اتصال بالمستخدم"
                          title="اختر محادثة أولاً"
                        >
                          <PhoneIcon className="h-6 w-6" />
                        </button>

                        {/* زر مكالمة فيديو - معطل */}
                        <button
                          disabled
                          className="flex h-10 w-10 flex-shrink-0 cursor-not-allowed items-center justify-center text-gray-400"
                          aria-label="مكالمة فيديو"
                          title="اختر محادثة أولاً"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="h-6 w-6"
                          >
                            <path
                              strokeLinecap="round"
                              d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                            />
                          </svg>
                        </button>

                        {/* قائمة الإجراءات - معطلة */}
                        <button
                          disabled
                          className="cursor-not-allowed rounded-full p-2 text-gray-400 transition-colors"
                          aria-label="إجراءات الدردشة"
                          title="اختر محادثة أولاً"
                        >
                          <EllipsisVerticalIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-1 items-center justify-center p-8">
                      <div className="text-center">
                        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-purple-50">
                          <ChatBubbleLeftRightIcon className="h-12 w-12 text-blue-500" />
                        </div>
                        <h3 className="mb-2 text-xl font-bold text-gray-900">
                          مرحباً بك في الرسائل
                        </h3>
                        <p className="mb-6 text-gray-600">
                          {conversations.length > 0
                            ? 'قم باختيار محادثة من القائمة للبدء'
                            : 'ابدأ محادثة جديدة مع البائعين والمشترين'}
                        </p>
                        {conversations.length === 0 && (
                          <button
                            onClick={() => setShowStartModal(true)}
                            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-3 text-base font-medium text-white shadow-lg transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-xl"
                          >
                            <ChatBubbleLeftRightIcon className="h-5 w-5" />
                            <span>ابدأ أول محادثة</span>
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0 border-t border-gray-100 p-3">
                      <MessageComposer
                        currentUserId={String(user.id)}
                        conversationId={''}
                        getToken={() => getToken?.() || undefined}
                        minimal
                        enableLocation
                        disabled
                      />
                    </div>
                  </div>
                ) : (
                  <div
                    className={`flex flex-col ${
                      isMobileView
                        ? 'h-full flex-1'
                        : 'h-full rounded-xl border border-gray-100 shadow-sm'
                    } relative bg-white`}
                  >
                    {/* Header - محسن مع صورة واسم ونقطة حالة */}
                    {(() => {
                      const conv = conversations.find((c) => c.id === selectedConvId);
                      if (!conv) return null;
                      const isOnline = conv.otherUserId && onlineMap[String(conv.otherUserId)];
                      const isPinned = pinnedConversations.has(conv.id);
                      const isArchived = archivedConversations.has(conv.id);
                      const isMuted = mutedConversations.has(conv.id);
                      const isBlocked = blockedUsers.has(conv.otherUserId || '');

                      return (
                        <div className="flex-shrink-0 border-b border-gray-200 bg-white px-3 py-2 shadow-sm">
                          <div className="flex items-center justify-between gap-3">
                            {/* الجانب الأيسر: زر الرجوع + صورة المستخدم + المعلومات */}
                            <div className="flex min-w-0 flex-1 items-center gap-3">
                              {/* زر الرجوع - يظهر فقط في الموبايل */}
                              {isMobileView && (
                                <button
                                  onClick={() => {
                                    setShowChatOnMobile(false);
                                    setSelectedConvId(null);
                                  }}
                                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100"
                                  aria-label="العودة للمحادثات"
                                  title="العودة للمحادثات"
                                >
                                  <ChevronLeftIcon className="h-6 w-6" />
                                </button>
                              )}
                              {/* صورة المستخدم مع نقطة الحالة */}
                              <div className="relative h-12 w-12 flex-shrink-0">
                                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gray-200 ring-2 ring-gray-100">
                                  <UserAvatar
                                    src={conv.avatar}
                                    alt={conv.title}
                                    size="lg"
                                    showPresenceDot={false}
                                    isOnline={false}
                                  />
                                </div>
                                {/* نقطة الحالة - خضراء للنشط، رمادية لغير النشط */}
                                <span
                                  className={`absolute bottom-0 left-0 h-3.5 w-3.5 rounded-full border-2 border-white ${
                                    isOnline ? 'bg-green-500' : 'bg-gray-400'
                                  }`}
                                  title={isOnline ? 'متصل الآن' : 'غير متصل'}
                                />
                              </div>

                              {/* اسم المستخدم والمعلومات */}
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="truncate text-base font-bold text-gray-900">
                                    {conv.title}
                                  </h3>
                                  {isPinned && <StarIcon className="h-4 w-4 text-yellow-500" />}
                                  {isMuted && (
                                    <SpeakerXMarkIcon className="h-4 w-4 text-gray-400" />
                                  )}
                                  {isBlocked && <NoSymbolIcon className="h-4 w-4 text-red-500" />}
                                </div>
                                {conv.subtitle && (
                                  <p className="mb-0.5 truncate text-xs text-gray-500">
                                    {conv.subtitle}
                                  </p>
                                )}
                                {/* حالة الاتصال */}
                                <p
                                  className={`flex items-center gap-1 text-xs ${
                                    isOnline ? 'text-green-600' : 'text-gray-400'
                                  }`}
                                >
                                  {isOnline ? 'متصل الآن' : 'غير متصل'}
                                </p>
                              </div>
                            </div>

                            {/* الجانب الأيمن: أزرار الإجراءات */}
                            <div className="flex flex-shrink-0 items-center gap-2">
                              {/* زر مكالمة صوتية WebRTC */}
                              <button
                                onClick={() => {
                                  if (conv.otherUserId) {
                                    startCall(
                                      {
                                        id: conv.otherUserId,
                                        name: conv.title,
                                        avatar: conv.avatar,
                                        phone: conv.otherUserPhone,
                                      },
                                      'voice',
                                      conv.id,
                                    );
                                  }
                                }}
                                disabled={isInCall || !conv.otherUserId}
                                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600 transition-all hover:scale-110 hover:bg-green-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                                aria-label="مكالمة صوتية"
                                title="مكالمة صوتية"
                              >
                                <PhoneIcon className="h-5 w-5" />
                              </button>

                              {/* زر مكالمة فيديو WebRTC */}
                              <button
                                onClick={() => {
                                  if (conv.otherUserId) {
                                    startCall(
                                      {
                                        id: conv.otherUserId,
                                        name: conv.title,
                                        avatar: conv.avatar,
                                        phone: conv.otherUserPhone,
                                      },
                                      'video',
                                      conv.id,
                                    );
                                  }
                                }}
                                disabled={isInCall || !conv.otherUserId}
                                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-all hover:scale-110 hover:bg-blue-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                                aria-label="مكالمة فيديو"
                                title="مكالمة فيديو"
                              >
                                <VideoCameraIcon className="h-5 w-5" />
                              </button>

                              {/* Chat Actions Menu */}
                              <div className="relative" data-chat-actions>
                                <button
                                  onClick={() => setShowChatActions(!showChatActions)}
                                  className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                                  aria-label="إجراءات الدردشة"
                                  title="المزيد من الخيارات"
                                >
                                  <EllipsisVerticalIcon className="h-5 w-5" />
                                </button>

                                {showChatActions && (
                                  <div
                                    className="absolute left-0 top-full z-50 mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
                                    onClick={() => setShowChatActions(false)}
                                  >
                                    <button
                                      onClick={() => {
                                        const newPinned = new Set(pinnedConversations);
                                        if (isPinned) {
                                          newPinned.delete(conv.id);
                                          setToast({
                                            message: 'تم إلغاء تثبيت المحادثة',
                                            type: 'success',
                                          });
                                        } else {
                                          newPinned.add(conv.id);
                                          setToast({
                                            message: 'تم تثبيت المحادثة',
                                            type: 'success',
                                          });
                                        }
                                        setPinnedConversations(newPinned);
                                        setShowChatActions(false);
                                      }}
                                      className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                      <StarIcon className="h-4 w-4" />
                                      <span>{isPinned ? 'إلغاء التثبيت' : 'تثبيت المحادثة'}</span>
                                    </button>

                                    <button
                                      onClick={() => {
                                        const newMuted = new Set(mutedConversations);
                                        if (isMuted) {
                                          newMuted.delete(conv.id);
                                          setToast({
                                            message: 'تم إلغاء كتم المحادثة',
                                            type: 'success',
                                          });
                                        } else {
                                          newMuted.add(conv.id);
                                          setToast({ message: 'تم كتم المحادثة', type: 'success' });
                                        }
                                        setMutedConversations(newMuted);
                                        setShowChatActions(false);
                                      }}
                                      className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                      <SpeakerXMarkIcon className="h-4 w-4" />
                                      <span>{isMuted ? 'إلغاء الكتم' : 'كتم المحادثة'}</span>
                                    </button>

                                    <button
                                      onClick={() => {
                                        const newArchived = new Set(archivedConversations);
                                        if (isArchived) {
                                          newArchived.delete(conv.id);
                                          setToast({
                                            message: 'تم إخراج المحادثة من الأرشيف',
                                            type: 'success',
                                          });
                                        } else {
                                          newArchived.add(conv.id);
                                          setToast({
                                            message: 'تم أرشفة المحادثة',
                                            type: 'success',
                                          });
                                        }
                                        setArchivedConversations(newArchived);
                                        setShowChatActions(false);
                                      }}
                                      className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                      <ArchiveBoxIcon className="h-4 w-4" />
                                      <span>{isArchived ? 'إلغاء الأرشفة' : 'أرشفة'}</span>
                                    </button>

                                    <hr className="my-1 border-gray-200" />

                                    <button
                                      onClick={() => {
                                        // Show user profile/details
                                        setToast({
                                          message: 'عرض تفاصيل المستخدم قريباً',
                                          type: 'success',
                                        });
                                        setShowChatActions(false);
                                      }}
                                      className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                      <UserIcon className="h-4 w-4" />
                                      <span>عرض الملف الشخصي</span>
                                    </button>

                                    <button
                                      onClick={() => {
                                        const newBlocked = new Set(blockedUsers);
                                        if (isBlocked) {
                                          newBlocked.delete(conv.otherUserId || '');
                                          setToast({
                                            message: 'تم إلغاء حظر المستخدم',
                                            type: 'success',
                                          });
                                        } else {
                                          newBlocked.add(conv.otherUserId || '');
                                          setToast({ message: 'تم حظر المستخدم', type: 'error' });
                                        }
                                        setBlockedUsers(newBlocked);
                                        setShowChatActions(false);
                                      }}
                                      className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                    >
                                      <NoSymbolIcon className="h-4 w-4" />
                                      <span>{isBlocked ? 'إلغاء الحظر' : 'حظر المستخدم'}</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Messages */}
                    <div
                      ref={messagesContainerRef}
                      className="custom-scrollbar flex flex-1 flex-col-reverse gap-1.5 overflow-y-auto p-2"
                      style={{ scrollBehavior: 'smooth', minHeight: 0 }}
                    >
                      {loadingMessages || switchingConversation ? (
                        <div className="flex h-full items-center justify-center">
                          {/* 🔄 مؤشر تحميل بسيط - دائرة مع أيقونة */}
                          <div className="relative flex h-14 w-14 items-center justify-center">
                            <div className="border-3 absolute h-full w-full animate-spin rounded-full border-gray-200 border-t-blue-600"></div>
                            <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                      ) : currentMessages.length === 0 ? (
                        <div className="py-8 text-center">
                          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                            <ChatBubbleLeftRightIcon className="h-8 w-8 text-gray-400" />
                          </div>
                          <p className="text-sm font-medium text-gray-900">لا توجد رسائل بعد</p>
                          <p className="mt-1 text-xs text-gray-500">
                            ابدأ المحادثة بإرسال أول رسالة
                          </p>
                        </div>
                      ) : (
                        [...currentMessages].reverse().map((m, index) => {
                          const isMine = String(m.senderId) === String(user?.id);
                          // استخدام مفتاح فريد: ID + index لمنع التكرار
                          const uniqueKey = `${m.id}-${index}`;

                          if (m.type === 'location') {
                            let loc: { lat: number; lng: number; address: string } | null = null;
                            try {
                              const parsed = JSON.parse(m.content || '{}');
                              if (
                                parsed &&
                                typeof parsed.lat === 'number' &&
                                typeof parsed.lng === 'number' &&
                                typeof parsed.address === 'string'
                              ) {
                                loc = { lat: parsed.lat, lng: parsed.lng, address: parsed.address };
                              }
                            } catch (_) {
                              // ignore parse errors
                            }
                            if (loc) {
                              return (
                                <div
                                  key={uniqueKey}
                                  className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                                >
                                  <div className="max-w-[75%]">
                                    <LocationMessage
                                      location={loc}
                                      isOwn={isMine}
                                      timestamp={String(m.createdAt)}
                                    />
                                  </div>
                                </div>
                              );
                            }
                          }
                          // التحقق من رسائل طلب النقل
                          const transportBooking = parseTransportBookingMetadata(
                            m.content,
                            m.metadata,
                          );

                          if (transportBooking.isTransportBooking && transportBooking.bookingData) {
                            const conv = conversations.find((c) => c.id === selectedConvId);
                            return (
                              <div
                                key={uniqueKey}
                                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                              >
                                <div className="w-full max-w-sm">
                                  <TransportBookingCard
                                    bookingId={transportBooking.bookingData.bookingId}
                                    serviceTitle={transportBooking.bookingData.serviceTitle}
                                    customerName={transportBooking.bookingData.customerName}
                                    customerPhone={
                                      transportBooking.bookingData.customerPhone ||
                                      conv?.otherUserPhone
                                    }
                                    fromCity={transportBooking.bookingData.fromCity}
                                    toCity={transportBooking.bookingData.toCity}
                                    preferredDate={transportBooking.bookingData.preferredDate}
                                    isMine={isMine}
                                  />
                                  <div
                                    className={`mt-1 flex items-center gap-2 text-xs ${
                                      isMine ? 'justify-end' : 'justify-start'
                                    } text-gray-500`}
                                  >
                                    <span>{formatRelativeTime(m.createdAt)}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div
                              key={uniqueKey}
                              className={`flex ${isMine ? 'justify-end' : 'justify-start'} group`}
                            >
                              <div className="flex max-w-[80%] gap-1.5">
                                {!isMine && (
                                  <div className="h-6 w-6 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
                                    {(() => {
                                      const conv = conversations.find(
                                        (c) => c.id === selectedConvId,
                                      );
                                      return (
                                        <UserAvatar
                                          src={conv?.avatar}
                                          alt={conv?.title || 'مستخدم'}
                                          size="sm"
                                          showPresenceDot={false}
                                        />
                                      );
                                    })()}
                                  </div>
                                )}

                                <div className="flex flex-col">
                                  <div
                                    className={`rounded-xl px-3 py-1.5 text-[13px] shadow-sm ${
                                      isMine
                                        ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white'
                                        : 'border border-gray-200 bg-gray-100 text-gray-900'
                                    }`}
                                  >
                                    {m.type === 'image' ? (
                                      <div className="space-y-2">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                          src={m.imageUrl || m.content}
                                          alt="صورة"
                                          className="max-h-72 w-full cursor-pointer rounded-lg object-cover transition-opacity hover:opacity-90"
                                          onClick={() =>
                                            window.open(m.imageUrl || m.content, '_blank')
                                          }
                                          onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).src =
                                              '/images/cars/default-car.svg';
                                          }}
                                        />
                                      </div>
                                    ) : m.type === 'voice' ? (
                                      <div className="flex items-center gap-2">
                                        <MicrophoneIcon className="h-5 w-5" />
                                        <audio controls className="max-w-xs">
                                          <source src={m.content} type="audio/webm" />
                                          المتصفح لا يدعم تشغيل الصوت
                                        </audio>
                                      </div>
                                    ) : (
                                      <p className="whitespace-pre-wrap break-words leading-snug">
                                        {m.content}
                                      </p>
                                    )}
                                  </div>

                                  <div
                                    className={`mt-0.5 flex items-center gap-1.5 text-[10px] ${
                                      isMine ? 'justify-end' : 'justify-start'
                                    } ${isMine ? 'text-gray-400' : 'text-gray-400'}`}
                                  >
                                    <span>{formatRelativeTime(m.createdAt)}</span>
                                    {isMine && (
                                      <span className="flex items-center gap-1">
                                        {m.status === 'read' ? (
                                          <>
                                            <CheckBadgeIcon className="h-2.5 w-2.5 text-blue-600" />
                                          </>
                                        ) : m.status === 'delivered' ? (
                                          <>
                                            <CheckBadgeIcon className="h-2.5 w-2.5 text-gray-400" />
                                          </>
                                        ) : (
                                          <>
                                            <CheckBadgeIcon className="h-2.5 w-2.5 text-gray-300" />
                                          </>
                                        )}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                      {typingOther && (
                        <div className="flex items-center gap-1.5 px-2 pb-1 text-left text-[10px] text-gray-400">
                          <div className="flex gap-0.5">
                            <span
                              className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
                              style={{ animationDelay: '0ms' }}
                            ></span>
                            <span
                              className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
                              style={{ animationDelay: '150ms' }}
                            ></span>
                            <span
                              className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
                              style={{ animationDelay: '300ms' }}
                            ></span>
                          </div>
                          <span>يكتب...</span>
                        </div>
                      )}
                    </div>

                    {/* Composer - ثابت في الأسفل */}
                    <div className="relative z-[9999] flex-shrink-0 overflow-visible border-t border-gray-200 bg-white p-3 shadow-lg">
                      <MessageComposer
                        currentUserId={String(user.id)}
                        conversationId={String(selectedConvId)}
                        getToken={() => getToken?.() || undefined}
                        enableLocation
                        onTypingChange={(typing) => {
                          const sm = getSocketManager();
                          if (typing) sm.typingStart(String(selectedConvId));
                          else sm.typingStop(String(selectedConvId));
                        }}
                        onConversationIdChange={(oldId, newId) => {
                          // 🆕 معالجة تحويل المحادثة المؤقتة لحقيقية
                          console.log('[Messages] تحويل المحادثة:', oldId, '->', newId);

                          // تحديث selectedConvId إلى المعرف الحقيقي
                          setSelectedConvId(newId);

                          // نقل الرسائل من المعرف القديم للجديد
                          setMessages((prev) => {
                            const oldMessages = prev[oldId] || [];
                            const newMessages = prev[newId] || [];
                            const merged = [...newMessages, ...oldMessages];
                            const { [oldId]: _, ...rest } = prev;
                            return { ...rest, [newId]: merged };
                          });

                          // تحديث قائمة المحادثات لاستبدال المحادثة المؤقتة بالحقيقية
                          setConversations((prev) =>
                            prev
                              .map((c) => (String(c.id) === oldId ? { ...c, id: newId } : c))
                              .filter(
                                (c, i, arr) =>
                                  // إزالة التكرار بناءً على المعرف
                                  arr.findIndex((x) => x.id === c.id) === i,
                              ),
                          );

                          // الانضمام للغرفة الجديدة في Socket
                          realtimeLeaveConversation(oldId);
                          realtimeJoinConversation(newId);
                        }}
                        onMessageAdd={(msg) => {
                          const newMsg: UiMessage = {
                            id: String(msg.id),
                            senderId: String(msg.senderId),
                            type: msg.type as UiMessage['type'],
                            content: msg.content,
                            createdAt: msg.createdAt,
                            status: msg.status,
                            imageUrl: msg.imageUrl,
                          } as UiMessage;

                          // استخدام معرف المحادثة الحقيقي من الرسالة إذا كان موجوداً
                          const convKey = String(msg.conversationId || selectedConvId);

                          // إضافة الرسالة مع منع التكرار
                          setMessages((prev) => {
                            const existingMessages = prev[convKey] || [];

                            // تحقق من عدم وجود الرسالة مسبقاً
                            if (existingMessages.some((m) => String(m.id) === String(newMsg.id))) {
                              console.log(
                                '[Messages] تم تجاهل رسالة مكررة عند الإضافة:',
                                newMsg.id,
                              );
                              return prev;
                            }

                            return {
                              ...prev,
                              [convKey]: [...existingMessages, newMsg],
                            };
                          });

                          // تمرير تلقائي لأسفل لإظهار الرسالة الجديدة
                          setTimeout(() => {
                            if (messagesContainerRef.current) {
                              messagesContainerRef.current.scrollTop = 0; // في flex-col-reverse، scrollTop = 0 هو الأسفل
                            }
                          }, 100);
                          // Update conversation preview and reset unread
                          try {
                            const preview =
                              newMsg.type === 'image'
                                ? '[صورة]'
                                : newMsg.type === 'voice'
                                  ? '[رسالة صوتية]'
                                  : newMsg.type === 'location'
                                    ? '[موقع]'
                                    : newMsg.type === 'file'
                                      ? '[ملف]'
                                      : newMsg.content || '';
                            setConversations((prev) =>
                              prev.map((c) =>
                                String(c.id) === convKey
                                  ? { ...c, lastMessage: preview, lastTime: 'الآن', unread: 0 }
                                  : c,
                              ),
                            );
                          } catch (_) {}
                          const successMsg =
                            msg.type === 'image'
                              ? 'تم رفع وإرسال الصورة'
                              : msg.type === 'voice'
                                ? 'تم تسجيل وإرسال الرسالة الصوتية'
                                : msg.type === 'file'
                                  ? 'تم رفع الملف'
                                  : 'تم إرسال الرسالة';
                          setToast({ message: successMsg, type: 'success' });

                          // 🔔 إعادة تحميل قائمة المحادثات فوراً لتحديث العدادات
                          setTimeout(async () => {
                            try {
                              const token = getToken?.();
                              const res = await fetch(
                                `/api/conversations?userId=${encodeURIComponent(user.id)}`,
                                {
                                  headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                                  credentials: 'include', // إرسال الـ Cookie أيضاً لضمان المصادقة
                                },
                              );
                              const data = await res.json();
                              if (data?.success) {
                                const normalized: UiConversation[] = (data.data || []).map(
                                  (c: any) => {
                                    const other = (() => {
                                      const p = c?.conversation_participants || [];
                                      const arr: any[] = Array.isArray(p) ? p : [];
                                      const otherP = arr.find(
                                        (x: any) => String(x?.userId) !== String(user.id),
                                      );
                                      const u = otherP?.users || {};
                                      return {
                                        name: u?.name || c?.title || 'مستخدم',
                                        avatar: u?.profileImage || '/images/default-avatar.svg',
                                        id: u?.id || otherP?.userId || '',
                                        phone: u?.phone || null,
                                      };
                                    })();
                                    const msgs: any[] | undefined = Array.isArray(c?.messages)
                                      ? (c.messages as any[])
                                      : undefined;
                                    const lastMsg = (msgs && msgs[0]) || null;
                                    return {
                                      id: String(c?.id || ''),
                                      title: String(other.name || 'مستخدم'),
                                      subtitle:
                                        c?.cars?.title ||
                                        c?.auctions?.title ||
                                        c?.carTitle ||
                                        undefined,
                                      avatar: other.avatar,
                                      lastMessage: lastMsg?.content || c?.lastMessage || '',
                                      lastTime: lastMsg?.createdAt
                                        ? formatRelativeTime(lastMsg.createdAt)
                                        : c?.updatedAt
                                          ? formatRelativeTime(c.updatedAt)
                                          : undefined,
                                      unread: Math.max(0, Number(c?.unread || 0)) || 0,
                                      otherUserId: String(other.id || ''),
                                      otherUserPhone: other.phone || undefined,
                                    };
                                  },
                                );
                                const deduplicated = deduplicateConversations(normalized);
                                setConversations(deduplicated);
                              }
                            } catch (_) {
                              // تجاهل أخطاء التحديث
                            }
                          }, 500); // تأخير نصف ثانية لضمان حفظ الرسالة

                          // لا scroll تلقائي عند الإرسال - يبقى في موضعه الحالي
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Start Conversation Modal */}
      <StartConversationModal
        isOpen={showStartModal}
        onClose={() => setShowStartModal(false)}
        onStartConversation={onStartConversation}
        currentUserId={String(user?.id || '')}
      />
    </>
  );
};

export default MessagesPage;
