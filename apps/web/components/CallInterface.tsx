import React, { useState, useRef, useEffect } from 'react';
import PhoneIcon from '@heroicons/react/24/outline/PhoneIcon';
import VideoCameraIcon from '@heroicons/react/24/outline/VideoCameraIcon';
import MicrophoneIcon from '@heroicons/react/24/outline/MicrophoneIcon';
import SpeakerWaveIcon from '@heroicons/react/24/outline/SpeakerWaveIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import PhoneXMarkIcon from '@heroicons/react/24/outline/PhoneXMarkIcon';
import CameraIcon from '@heroicons/react/24/outline/CameraIcon';
import SpeakerXMarkIcon from '@heroicons/react/24/outline/SpeakerXMarkIcon';
import {
  PhoneIcon as PhoneSolid,
  VideoCameraIcon as VideoCameraSolid,
  MicrophoneIcon as MicrophoneSolid,
} from '@heroicons/react/24/solid';

interface CallInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  callType: 'audio' | 'video';
  contactName: string;
  contactAvatar?: string;
  isIncoming?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
  contactId?: string;
  conversationId?: string;
}

const CallInterface: React.FC<CallInterfaceProps> = ({
  isOpen,
  onClose,
  callType,
  contactName,
  contactAvatar,
  isIncoming = false,
  onAccept,
  onDecline,
  contactId,
  conversationId,
}) => {
  const [isConnected, setIsConnected] = useState(!isIncoming);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(callType === 'video');
  const [callDuration, setCallDuration] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'ended'>(
    'connecting',
  );
  const [callQuality, setCallQuality] = useState<'excellent' | 'good' | 'poor'>('excellent');
  const [networkStatus, setNetworkStatus] = useState<'stable' | 'unstable' | 'reconnecting'>(
    'stable',
  );

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const callTimerRef = useRef<NodeJS.Timeout>();

  // محاكاة بدء المكالمة
  useEffect(() => {
    if (isConnected && !isIncoming) {
      setConnectionStatus('connecting');
      const timer = setTimeout(() => {
        setConnectionStatus('connected');
        startCallTimer();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, isIncoming]);

  // عداد وقت المكالمة
  const startCallTimer = () => {
    callTimerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  };

  const stopCallTimer = () => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }
  };

  // تنسيق وقت المكالمة
  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // قبول المكالمة
  const handleAcceptCall = () => {
    setIsConnected(true);
    setConnectionStatus('connected');
    startCallTimer();
    onAccept?.();
  };

  // رفض المكالمة
  const handleDeclineCall = () => {
    setConnectionStatus('ended');
    stopCallTimer();
    onDecline?.();
    setTimeout(() => onClose(), 1000);
  };

  // إنهاء المكالمة
  const handleEndCall = () => {
    setConnectionStatus('ended');
    stopCallTimer();
    setTimeout(() => onClose(), 1000);
  };

  // تبديل كتم الصوت
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // تبديل السماعة
  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
  };

  // تبديل الكاميرا
  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    // في التطبيق الحقيقي، يمكن إيقاف/تشغيل الكاميرا
    if (localVideoRef.current) {
      if (isVideoOn) {
        // إيقاف الكاميرا
        const stream = localVideoRef.current.srcObject as MediaStream;
        if (stream) {
          stream.getVideoTracks().forEach((track) => (track.enabled = false));
        }
      } else {
        // تشغيل الكاميرا
        const stream = localVideoRef.current.srcObject as MediaStream;
        if (stream) {
          stream.getVideoTracks().forEach((track) => (track.enabled = true));
        }
      }
    }
  };

  // محاكاة تغيير جودة الاتصال
  const simulateNetworkChanges = () => {
    const qualities: Array<'excellent' | 'good' | 'poor'> = ['excellent', 'good', 'poor'];
    const statuses: Array<'stable' | 'unstable' | 'reconnecting'> = [
      'stable',
      'unstable',
      'reconnecting',
    ];

    setInterval(() => {
      if (connectionStatus === 'connected') {
        setCallQuality(qualities[Math.floor(Math.random() * qualities.length)]);
        setNetworkStatus(statuses[Math.floor(Math.random() * statuses.length)]);
      }
    }, 10000); // تغيير كل 10 ثوان
  };

  // حفظ سجل المكالمة
  const saveCallLog = async () => {
    if (!contactId || !conversationId) return;

    try {
      const callLog = {
        contactId,
        conversationId,
        callType,
        duration: callDuration,
        status: connectionStatus,
        timestamp: new Date().toISOString(),
      };

      // في التطبيق الحقيقي، يمكن حفظ سجل المكالمة في قاعدة البيانات
    } catch (error) {
      console.error('خطأ في حفظ سجل المكالمة:', error);
    }
  };

  useEffect(() => {
    return () => {
      stopCallTimer();
    };
  }, []);

  // بدء محاكاة تغييرات الشبكة عند الاتصال
  useEffect(() => {
    if (connectionStatus === 'connected') {
      simulateNetworkChanges();
    }
  }, [connectionStatus]);

  // حفظ سجل المكالمة عند الإنهاء
  useEffect(() => {
    if (connectionStatus === 'ended') {
      saveCallLog();
    }
  }, [connectionStatus]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
      <div className="relative mx-auto h-full w-full max-w-4xl">
        {/* Video Call Interface */}
        {callType === 'video' && isConnected && connectionStatus === 'connected' && (
          <div className="relative h-full w-full">
            {/* Remote Video */}
            <div className="flex h-full w-full items-center justify-center bg-gray-900">
              {isVideoOn ? (
                <video
                  ref={remoteVideoRef}
                  className="h-full w-full object-cover"
                  autoPlay
                  playsInline
                />
              ) : (
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-32 w-32 items-center justify-center rounded-full bg-gray-700">
                    {contactAvatar ? (
                      <img
                        src={contactAvatar}
                        alt={contactName}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl text-white">{contactName.charAt(0)}</span>
                    )}
                  </div>
                  <p className="text-lg text-white">{contactName}</p>
                  <p className="text-sm text-gray-300">الكاميرا مغلقة</p>
                </div>
              )}
            </div>

            {/* Call Quality Indicator */}
            <div className="absolute left-4 top-4 flex items-center gap-2 rounded-lg bg-black bg-opacity-50 px-3 py-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  callQuality === 'excellent'
                    ? 'bg-green-500'
                    : callQuality === 'good'
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                }`}
              ></div>
              <span className="text-sm text-white">
                {callQuality === 'excellent' ? 'ممتاز' : callQuality === 'good' ? 'جيد' : 'ضعيف'}
              </span>
              {networkStatus === 'reconnecting' && (
                <span className="text-xs text-yellow-300">جاري إعادة الاتصال...</span>
              )}
            </div>

            {/* Local Video (Picture in Picture) */}
            <div className="absolute right-4 top-4 h-24 w-32 overflow-hidden rounded-lg bg-gray-800">
              <video
                ref={localVideoRef}
                className="h-full w-full object-cover"
                autoPlay
                playsInline
                muted
              />
            </div>

            {/* Call Duration */}
            <div className="absolute right-4 top-16 rounded-lg bg-black bg-opacity-50 px-3 py-2">
              <span className="text-sm text-white">{formatCallDuration(callDuration)}</span>
            </div>
          </div>
        )}

        {/* Audio Call Interface */}
        {(callType === 'audio' || !isVideoOn) && (
          <div className="flex h-full flex-col items-center justify-center text-white">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-6 flex h-40 w-40 items-center justify-center rounded-full bg-gray-700">
                {contactAvatar ? (
                  <img
                    src={contactAvatar}
                    alt={contactName}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-6xl text-white">{contactName.charAt(0)}</span>
                )}
              </div>
              <h2 className="mb-2 text-2xl font-semibold">{contactName}</h2>

              {/* Call Status */}
              {connectionStatus === 'connecting' && (
                <p className="text-lg text-gray-300">جاري الاتصال...</p>
              )}
              {connectionStatus === 'connected' && (
                <p className="text-lg text-green-400">{formatCallDuration(callDuration)}</p>
              )}
              {connectionStatus === 'ended' && (
                <p className="text-lg text-red-400">انتهت المكالمة</p>
              )}
            </div>
          </div>
        )}

        {/* Incoming Call Interface */}
        {isIncoming && !isConnected && (
          <div className="flex h-full flex-col items-center justify-center text-white">
            <div className="mb-12 text-center">
              <div className="mx-auto mb-6 flex h-40 w-40 animate-pulse items-center justify-center rounded-full bg-gray-700">
                {contactAvatar ? (
                  <img
                    src={contactAvatar}
                    alt={contactName}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-6xl text-white">{contactName.charAt(0)}</span>
                )}
              </div>
              <h2 className="mb-2 text-2xl font-semibold">{contactName}</h2>
              <p className="text-lg text-gray-300">
                {callType === 'video' ? 'مكالمة فيديو واردة' : 'مكالمة صوتية واردة'}
              </p>
            </div>

            {/* Incoming Call Actions */}
            <div className="flex gap-8">
              <button
                onClick={handleDeclineCall}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 transition-colors hover:bg-red-700"
              >
                <PhoneXMarkIcon className="h-8 w-8 text-white" />
              </button>
              <button
                onClick={handleAcceptCall}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-green-600 transition-colors hover:bg-green-700"
              >
                {callType === 'video' ? (
                  <VideoCameraSolid className="h-8 w-8 text-white" />
                ) : (
                  <PhoneSolid className="h-8 w-8 text-white" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Call Controls */}
        {isConnected && connectionStatus !== 'ended' && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 transform">
            <div className="flex items-center gap-4 rounded-full bg-black bg-opacity-50 px-6 py-4">
              {/* Mute Button */}
              <button
                onClick={toggleMute}
                className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
                  isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
                }`}
                title={isMuted ? 'إلغاء كتم الصوت' : 'كتم الصوت'}
              >
                {isMuted ? (
                  <SpeakerXMarkIcon className="h-6 w-6 text-white" />
                ) : (
                  <MicrophoneSolid className="h-6 w-6 text-white" />
                )}
              </button>

              {/* End Call Button */}
              <button
                onClick={handleEndCall}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 transition-colors hover:bg-red-700"
                title="إنهاء المكالمة"
              >
                <PhoneXMarkIcon className="h-7 w-7 text-white" />
              </button>

              {/* Speaker Button (Audio only) */}
              {callType === 'audio' && (
                <button
                  onClick={toggleSpeaker}
                  className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
                    isSpeakerOn ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'
                  }`}
                >
                  <SpeakerWaveIcon className="h-6 w-6 text-white" />
                </button>
              )}

              {/* Video Toggle Button (Video calls only) */}
              {callType === 'video' && (
                <button
                  onClick={toggleVideo}
                  className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
                    isVideoOn ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'
                  }`}
                >
                  <CameraIcon className="h-6 w-6 text-white" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black bg-opacity-50 text-white transition-colors hover:bg-opacity-70"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default CallInterface;
