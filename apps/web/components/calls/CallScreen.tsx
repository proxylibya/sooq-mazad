/**
 * 📞 CallScreen Component
 * واجهة المكالمة الرئيسية - شبيهة بواتساب
 */

import type { CallData, CallStatus } from '@/lib/webrtc/types';
import { useEffect, useRef, useState } from 'react';

interface CallScreenProps {
  call: CallData;
  callStatus: CallStatus;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  onToggleVideo: (enabled: boolean) => void;
  onToggleAudio: (enabled: boolean) => void;
  onSwitchCamera: () => void;
  onEndCall: () => void;
  onAcceptCall?: () => void;
  onRejectCall?: () => void;
}

export function CallScreen({
  call,
  callStatus,
  localStream,
  remoteStream,
  isVideoEnabled,
  isAudioEnabled,
  onToggleVideo,
  onToggleAudio,
  onSwitchCamera,
  onEndCall,
  onAcceptCall,
  onRejectCall,
}: CallScreenProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  // ربط الفيديو المحلي
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // ربط الفيديو البعيد
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // عداد مدة المكالمة
  useEffect(() => {
    if (callStatus !== 'connected') return;

    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [callStatus]);

  // تنسيق الوقت
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // الحصول على نص الحالة
  const getStatusText = (): string => {
    switch (callStatus) {
      case 'ringing':
        return call.direction === 'incoming' ? 'مكالمة واردة...' : 'جارٍ الاتصال...';
      case 'connecting':
        return 'جارٍ الاتصال...';
      case 'connected':
        return formatDuration(callDuration);
      case 'ended':
        return 'انتهت المكالمة';
      case 'rejected':
        return 'تم رفض المكالمة';
      case 'missed':
        return 'مكالمة فائتة';
      case 'busy':
        return 'الخط مشغول';
      case 'failed':
        return 'فشل الاتصال';
      default:
        return '';
    }
  };

  // الحصول على اسم المشارك الآخر
  const otherParticipant = call.direction === 'incoming' ? call.caller : call.callee;

  // مكالمة واردة - شاشة الرنين
  if (callStatus === 'ringing' && call.direction === 'incoming') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-green-600 to-green-800">
        {/* معلومات المتصل */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-white/20 ring-4 ring-white/30">
            {otherParticipant.avatar ? (
              <img
                src={otherParticipant.avatar}
                alt={otherParticipant.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-5xl text-white">{otherParticipant.name.charAt(0)}</span>
            )}
          </div>
          <h2 className="mb-2 text-2xl font-bold text-white">{otherParticipant.name}</h2>
          <p className="text-lg text-white/80">
            {call.type === 'video' ? 'مكالمة فيديو واردة' : 'مكالمة صوتية واردة'}
          </p>
        </div>

        {/* أنيميشن الرنين */}
        <div className="mb-12 flex items-center justify-center">
          <div className="h-4 w-4 animate-ping rounded-full bg-white/50" />
          <div className="mx-2 h-4 w-4 animate-ping rounded-full bg-white/50 delay-75" />
          <div className="h-4 w-4 animate-ping rounded-full bg-white/50 delay-150" />
        </div>

        {/* أزرار القبول والرفض */}
        <div className="flex items-center gap-16">
          {/* زر الرفض */}
          <button
            onClick={onRejectCall}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
          >
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* زر القبول */}
          <button
            onClick={onAcceptCall}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
          >
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // الشاشة المصغرة
  if (isMinimized) {
    return (
      <div
        className="fixed bottom-4 right-4 z-50 flex cursor-pointer items-center gap-3 rounded-full bg-green-600 px-4 py-2 text-white shadow-lg transition-transform hover:scale-105"
        onClick={() => setIsMinimized(false)}
      >
        <div className="h-10 w-10 overflow-hidden rounded-full bg-white/20">
          {otherParticipant.avatar ? (
            <img
              src={otherParticipant.avatar}
              alt={otherParticipant.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-lg">
              {otherParticipant.name.charAt(0)}
            </span>
          )}
        </div>
        <div>
          <p className="text-sm font-medium">{otherParticipant.name}</p>
          <p className="text-xs opacity-80">{getStatusText()}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEndCall();
          }}
          className="ml-2 rounded-full bg-red-500 p-2"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    );
  }

  // الشاشة الكاملة
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-900">
      {/* خلفية الفيديو / الصورة */}
      <div className="relative flex-1">
        {/* فيديو المشارك الآخر */}
        {call.type === 'video' && remoteStream ? (
          <video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full object-cover" />
        ) : (
          // خلفية للمكالمة الصوتية
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-gray-800 to-gray-900">
            <div className="mb-6 flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-gray-700 ring-4 ring-gray-600">
              {otherParticipant.avatar ? (
                <img
                  src={otherParticipant.avatar}
                  alt={otherParticipant.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-5xl text-white">{otherParticipant.name.charAt(0)}</span>
              )}
            </div>
            <h2 className="mb-2 text-2xl font-bold text-white">{otherParticipant.name}</h2>
            <p className="text-lg text-gray-400">{getStatusText()}</p>
          </div>
        )}

        {/* فيديو محلي مصغر */}
        {call.type === 'video' && localStream && isVideoEnabled && (
          <div className="absolute right-4 top-4 h-40 w-28 overflow-hidden rounded-2xl bg-black shadow-lg">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />
          </div>
        )}

        {/* معلومات المكالمة في الأعلى */}
        <div className="absolute left-0 right-0 top-0 bg-gradient-to-b from-black/50 to-transparent p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsMinimized(true)}
              className="rounded-full bg-white/10 p-2 text-white"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <div className="text-center">
              <p className="text-sm font-medium text-white">{otherParticipant.name}</p>
              <p className="text-xs text-white/70">{getStatusText()}</p>
            </div>
            <div className="w-9" /> {/* للتوازن */}
          </div>
        </div>
      </div>

      {/* أزرار التحكم */}
      <div className="bg-gray-900 px-6 py-8">
        <div className="flex items-center justify-center gap-6">
          {/* تبديل الكاميرا */}
          {call.type === 'video' && (
            <button
              onClick={onSwitchCamera}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-700 text-white transition-colors hover:bg-gray-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          )}

          {/* تبديل الفيديو */}
          {call.type === 'video' && (
            <button
              onClick={() => onToggleVideo(!isVideoEnabled)}
              className={`flex h-14 w-14 items-center justify-center rounded-full transition-colors ${
                isVideoEnabled
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-red-500 text-white'
              }`}
            >
              {isVideoEnabled ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                  />
                </svg>
              )}
            </button>
          )}

          {/* تبديل الميكروفون */}
          <button
            onClick={() => onToggleAudio(!isAudioEnabled)}
            className={`flex h-14 w-14 items-center justify-center rounded-full transition-colors ${
              isAudioEnabled ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-red-500 text-white'
            }`}
          >
            {isAudioEnabled ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                />
              </svg>
            )}
          </button>

          {/* إنهاء المكالمة */}
          <button
            onClick={onEndCall}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white transition-transform hover:scale-110 active:scale-95"
          >
            <svg
              className="h-8 w-8 rotate-[135deg]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default CallScreen;
