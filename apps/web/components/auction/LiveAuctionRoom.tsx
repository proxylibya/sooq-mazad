/**
 * Live Auction Room Component
 * مكون غرفة المزاد المباشر
 */

import {
  BellIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useUserContext } from '../../contexts/UserContext';
import { useAuctionSocket } from '../../hooks/useAuctionSocket';
import useBrowserNotifications from '../../hooks/useBrowserNotifications';
import { AuctionState, BidData, SocketUser } from '../../types/socket';
import { formatCurrency, formatTimeRemaining } from '../../utils/formatters';
import AuctionInfo from './AuctionInfo';
import AuctionTimer from './AuctionTimer';
import BidHistory from './BidHistory';
import BiddingPanel from './BiddingPanel';
import ConnectionStatus from './ConnectionStatus';
import ParticipantsList from './ParticipantsList';

interface LiveAuctionRoomProps {
  auctionId: string;
  userToken: string;
  autoJoin?: boolean;
  showParticipants?: boolean;
  soundEnabled?: boolean;
}

interface AuctionSettings {
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  autoScrollBids: boolean;
  showMyBidsOnly: boolean;
}

const LiveAuctionRoom: React.FC<LiveAuctionRoomProps> = ({
  auctionId,
  userToken,
  autoJoin = true,
  showParticipants = true,
  soundEnabled: initialSoundEnabled = true,
}) => {
  const router = useRouter();

  // Settings state
  const [settings, setSettings] = useState<AuctionSettings>({
    soundEnabled: initialSoundEnabled,
    notificationsEnabled: true,
    autoScrollBids: true,
    showMyBidsOnly: false,
  });

  // Browser notifications hook
  const { notify, requestPermission, registerServiceWorker, subscribePush } =
    useBrowserNotifications();
  const { user } = useUserContext();

  // Audio refs for sound effects
  const bidSoundRef = React.useRef<HTMLAudioElement | null>(null);
  const outbidSoundRef = React.useRef<HTMLAudioElement | null>(null);
  const endingSoonSoundRef = React.useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = React.useRef<AudioContext | null>(null);
  const endingSoonNotifiedRef = React.useRef<boolean>(false);

  // Socket integration
  const [socketState, socketActions] = useAuctionSocket({
    auctionId,
    userToken,
    autoConnect: true,
    onBidPlaced: handleBidPlaced,
    onBidRejected: handleBidRejected,
    onOutbid: handleOutbid,
    onAuctionEnded: handleAuctionEnded,
    onError: handleError,
  });

  const {
    isConnected,
    connectionState,
    auction,
    participants,
    recentBids,
    isJoined,
    isPlacingBid,
    lastBidError,
    timeRemaining,
    isEndingSoon,
  } = socketState;

  const { connect, disconnect, joinAuction, leaveAuction, placeBid, clearError, refreshAuction } =
    socketActions;

  // Auto join auction when connected
  useEffect(() => {
    if (isConnected && !isJoined && autoJoin) {
      joinAuction().then((result) => {
        if (!result.success) {
          toast.error(`فشل في الانضمام للمزاد: ${result.error}`);
        }
      });
    }
  }, [isConnected, isJoined, autoJoin, joinAuction]);

  // Initialize audio elements
  useEffect(() => {
    if (typeof window !== 'undefined' && settings.soundEnabled) {
      bidSoundRef.current = new Audio('/sounds/bid-placed.mp3');
      outbidSoundRef.current = new Audio('/sounds/outbid.mp3');
      endingSoonSoundRef.current = new Audio('/sounds/ending-soon.mp3');

      // Preload audio files
      bidSoundRef.current.preload = 'auto';
      outbidSoundRef.current.preload = 'auto';
      endingSoonSoundRef.current.preload = 'auto';
    }
  }, [settings.soundEnabled]);

  // Simple beep fallback using Web Audio API
  const beep = useCallback((frequency: number, duration = 160) => {
    if (typeof window === 'undefined') return;
    try {
      const AC: any = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AC) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AC();
      }
      const ctx = audioCtxRef.current as any;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + duration / 1000);
    } catch {
      // تجاهل أي أخطاء في الصوت الاحتياطي
    }
  }, []);

  // Play sound effect
  const playSound = useCallback(
    (type: 'bid' | 'outbid' | 'endingSoon') => {
      if (!settings.soundEnabled) return;

      const tryPlay = (audio: HTMLAudioElement | null, fallbackFreq: number) => {
        if (audio) {
          const p = audio.play();
          if (p && typeof p.then === 'function') {
            p.catch(() => beep(fallbackFreq));
          }
        } else {
          beep(fallbackFreq);
        }
      };

      try {
        switch (type) {
          case 'bid':
            tryPlay(bidSoundRef.current, 880);
            break;
          case 'outbid':
            tryPlay(outbidSoundRef.current, 520);
            break;
          case 'endingSoon':
            tryPlay(endingSoonSoundRef.current, 360);
            break;
        }
      } catch (error) {
        console.warn('فشل في تشغيل الصوت:', error);
      }
    },
    [settings.soundEnabled, beep],
  );

  // Event handlers
  function handleBidPlaced(bid: BidData & { user: SocketUser }) {
    playSound('bid');

    if (settings.notificationsEnabled) {
      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircleIcon className="h-5 w-5 text-green-500" />
          <span>
            عرض جديد: {formatCurrency(bid.amount)} من {bid.user.name}
          </span>
        </div>,
      );
      notify('مزايدة جديدة', `عرض جديد: ${formatCurrency(bid.amount)} من ${bid.user.name}`);
    }
  }

  function handleBidRejected(data: { reason: string; bidAmount: number; minimumRequired: number }) {
    toast.error(
      <div className="flex items-center gap-2">
        <XCircleIcon className="h-5 w-5 text-red-500" />
        <span>تم رفض العرض: {data.reason}</span>
      </div>,
    );
  }

  function handleOutbid(data: { newBid: BidData & { user: SocketUser }; yourPreviousBid: number }) {
    playSound('outbid');

    toast(
      <div className="flex items-center gap-2">
        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
        <span>تم تجاوز عرضك! العرض الجديد: {formatCurrency(data.newBid.amount)}</span>
      </div>,
      {
        style: { backgroundColor: '#fef3c7', color: '#92400e' },
        duration: 5000,
      },
    );

    if (settings.notificationsEnabled) {
      notify('تم تجاوز عرضك', `العرض الجديد: ${formatCurrency(data.newBid.amount)}`);
    }
  }

  function handleAuctionEnded(data: {
    auction: AuctionState;
    winner: SocketUser | null;
    finalPrice: number;
  }) {
    if (data.winner) {
      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircleIcon className="h-5 w-5 text-green-500" />
          <span>
            انتهى المزاد! الفائز: {data.winner.name} بسعر {formatCurrency(data.finalPrice)}
          </span>
        </div>,
      );
      if (settings.notificationsEnabled) {
        notify(
          'انتهى المزاد',
          `الفائز: ${data.winner.name} بسعر ${formatCurrency(data.finalPrice)}`,
        );
      }
    } else {
      toast('انتهى المزاد بدون فائز', {
        style: { backgroundColor: '#e0f2fe', color: '#0277bd' },
      });
      if (settings.notificationsEnabled) {
        notify('انتهى المزاد', 'انتهى المزاد بدون فائز');
      }
    }

    // Redirect after 5 seconds
    setTimeout(() => {
      router.push(`/auction/${auctionId}/results`);
    }, 5000);
  }

  function handleError(error: { code: string; message: string }) {
    console.error('خطأ في المزاد:', error);
    toast.error(`خطأ: ${error.message}`);
  }

  // Handle bid submission
  const handleBidSubmit = useCallback(
    async (amount: number) => {
      if (!auction || !isJoined) {
        toast.error('لا يمكن تقديم العرض الآن');
        return;
      }

      const result = await placeBid(amount);
      if (!result.success) {
        toast.error(`فشل في تقديم العرض: ${result.error}`);
      }
    },
    [auction, isJoined, placeBid],
  );

  // Calculate minimum bid
  const minimumBid = useMemo(() => {
    if (!auction) return 0;
    return auction.currentPrice + auction.minimumBidIncrement;
  }, [auction]);

  // Settings handlers
  const toggleSound = useCallback(() => {
    setSettings((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  }, []);

  const toggleNotifications = useCallback(() => {
    setSettings((prev) => {
      const next = {
        ...prev,
        notificationsEnabled: !prev.notificationsEnabled,
      };
      if (!prev.notificationsEnabled) {
        // تم التفعيل: طلب الإذن ومحاولة الاشتراك في Push إن أمكن
        requestPermission().catch(() => {});
        registerServiceWorker()
          .then((reg) => {
            const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (reg && vapid) {
              subscribePush(vapid, user?.id).catch(() => {});
            }
          })
          .catch(() => {});
      }
      return next;
    });
  }, [requestPermission, registerServiceWorker, subscribePush, user?.id]);

  // Ending soon effect
  useEffect(() => {
    if (isEndingSoon) {
      if (settings.soundEnabled) {
        playSound('endingSoon');
      }
      if (settings.notificationsEnabled && !endingSoonNotifiedRef.current) {
        notify('المزاد ينتهي قريباً', `المزاد ينتهي خلال ${formatTimeRemaining(timeRemaining)}!`);
        endingSoonNotifiedRef.current = true;
      }
    } else {
      endingSoonNotifiedRef.current = false;
    }
  }, [
    isEndingSoon,
    settings.soundEnabled,
    settings.notificationsEnabled,
    playSound,
    notify,
    timeRemaining,
  ]);

  // تم تبسيط حالة التحميل - UnifiedPageTransition يتولى ذلك
  if (!isConnected || !auction) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-900">مزاد مباشر #{auctionId.slice(-6)}</h1>
              <ConnectionStatus
                connectionState={connectionState}
                isConnected={isConnected}
                onRetry={connect}
                compact
              />
            </div>

            <div className="flex items-center gap-2">
              {/* Notifications Toggle */}
              <button
                onClick={toggleNotifications}
                className={`rounded-lg p-2 transition-colors ${
                  settings.notificationsEnabled
                    ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
                title={
                  settings.notificationsEnabled ? 'إيقاف إشعارات المتصفح' : 'تشغيل إشعارات المتصفح'
                }
              >
                <BellIcon className="h-5 w-5" />
              </button>

              {/* Sound Toggle */}
              <button
                onClick={toggleSound}
                className={`rounded-lg p-2 transition-colors ${
                  settings.soundEnabled
                    ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
                title={settings.soundEnabled ? 'إيقاف الصوت' : 'تشغيل الصوت'}
              >
                {settings.soundEnabled ? (
                  <SpeakerWaveIcon className="h-5 w-5" />
                ) : (
                  <SpeakerXMarkIcon className="h-5 w-5" />
                )}
              </button>

              {/* Leave Button */}
              <button
                onClick={leaveAuction}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                مغادرة المزاد
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Auction Info & Timer */}
          <div className="space-y-6 lg:col-span-1">
            <AuctionInfo auction={auction} />

            <AuctionTimer
              endTime={auction.endTime}
              status={auction.status}
              isEndingSoon={isEndingSoon}
              timeRemaining={timeRemaining}
            />

            {showParticipants && (
              <ParticipantsList
                participants={participants}
                currentUserId={null} // يمكن إضافة معرف المستخدم الحالي لاحقاً
                showOnlineOnly={false}
                onToggleOnlineOnly={() => {}}
              />
            )}
          </div>

          {/* Center Column - Bidding */}
          <div className="space-y-6 lg:col-span-1">
            <BiddingPanel
              auction={auction}
              minimumBid={minimumBid}
              isPlacingBid={isPlacingBid}
              isJoined={isJoined}
              lastBidError={lastBidError}
              onBidSubmit={handleBidSubmit}
              onClearError={clearError}
            />
          </div>

          {/* Right Column - Bid History */}
          <div className="lg:col-span-1">
            <BidHistory
              bids={recentBids}
              autoScroll={settings.autoScrollBids}
              showMyBidsOnly={settings.showMyBidsOnly}
              currentUserId={null} // يمكن إضافة معرف المستخدم الحالي لاحقاً
              onToggleAutoScroll={() =>
                setSettings((prev) => ({
                  ...prev,
                  autoScrollBids: !prev.autoScrollBids,
                }))
              }
              onToggleMyBidsOnly={() =>
                setSettings((prev) => ({
                  ...prev,
                  showMyBidsOnly: !prev.showMyBidsOnly,
                }))
              }
            />
          </div>
        </div>
      </div>

      {/* Error Toast Container */}
      {lastBidError && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="rounded-lg border border-red-400 bg-red-100 px-4 py-3 text-red-700 shadow-lg">
            <div className="flex items-center justify-between">
              <span>{lastBidError}</span>
              <button onClick={clearError} className="ml-2 text-red-500 hover:text-red-700">
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ending Soon Alert */}
      {isEndingSoon && (
        <div className="fixed left-1/2 top-20 z-50 -translate-x-1/2 transform">
          <div className="animate-pulse rounded-lg bg-red-500 px-6 py-3 text-white shadow-lg">
            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className="h-5 w-5" />
              <span className="font-medium">
                المزاد ينتهي خلال {formatTimeRemaining(timeRemaining)}!
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveAuctionRoom;
