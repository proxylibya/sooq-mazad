/**
 * 🎥 useWebRTCCall Hook
 * Hook لإدارة مكالمات الصوت والفيديو
 */

import { webRTCManager } from '@/lib/webrtc/WebRTCManager';
import type { CallData, CallParticipant, CallStatus, CallType, RTCSignal } from '@/lib/webrtc/types';
import { getSocketManager } from '@/utils/socketManager';
import { useCallback, useEffect, useRef, useState } from 'react';
import useAuth from './useAuth';

interface UseWebRTCCallOptions {
    onIncomingCall?: (call: CallData) => void;
    onCallEnded?: (callId: string) => void;
}

interface UseWebRTCCallReturn {
    // حالة المكالمة
    callStatus: CallStatus;
    currentCall: CallData | null;
    isInCall: boolean;

    // Streams
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;

    // التحكم في المكالمة
    startCall: (participant: CallParticipant, callType: CallType, conversationId?: string) => Promise<void>;
    acceptCall: () => Promise<void>;
    rejectCall: () => void;
    endCall: () => void;

    // التحكم في الوسائط
    toggleVideo: (enabled: boolean) => void;
    toggleAudio: (enabled: boolean) => void;
    switchCamera: () => Promise<void>;

    // حالات الوسائط
    isVideoEnabled: boolean;
    isAudioEnabled: boolean;

    // أخطاء
    error: string | null;
}

export function useWebRTCCall(options: UseWebRTCCallOptions = {}): UseWebRTCCallReturn {
    const { onIncomingCall, onCallEnded } = options;
    const { user } = useAuth();

    const [callStatus, setCallStatus] = useState<CallStatus>('idle');
    const [currentCall, setCurrentCall] = useState<CallData | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const callStartTimeRef = useRef<Date | null>(null);

    /**
     * إرسال إشارة عبر Socket
     */
    const sendSignal = useCallback((signal: RTCSignal) => {
        const sm = getSocketManager();
        const socket = sm.getClientSocket();
        if (socket && user) {
            // تعبئة sender ID
            signal.senderId = user.id;
            // @ts-expect-error - custom event
            socket.emit('webrtc:signal', signal);
        }
    }, [user]);

    /**
     * تهيئة WebRTC Manager
     */
    useEffect(() => {
        webRTCManager.initialize({
            onSignal: sendSignal,
            onStatusChange: setCallStatus,
            onRemoteStream: setRemoteStream,
            onLocalStream: setLocalStream,
            onError: (err) => setError(err.message),
        });

        return () => {
            webRTCManager.destroy();
        };
    }, [sendSignal]);

    /**
     * الاستماع لإشارات WebRTC
     */
    useEffect(() => {
        const sm = getSocketManager();
        const socket = sm.getClientSocket();

        if (!socket || !user) return;

        const handleSignal = (signal: RTCSignal) => {
            // تجاهل الإشارات الموجهة لغيرنا
            if (signal.receiverId !== user.id) return;

            if (signal.type === 'call-request') {
                // مكالمة واردة
                const incomingCall: CallData = {
                    callId: signal.callId,
                    type: signal.callType || 'voice',
                    status: 'ringing',
                    direction: 'incoming',
                    caller: signal.callerInfo!,
                    callee: { id: user.id, name: user.name || 'أنا' },
                };
                setCurrentCall(incomingCall);
                setCallStatus('ringing');
                onIncomingCall?.(incomingCall);
            } else {
                // إشارات أخرى
                webRTCManager.handleSignal(signal);
            }
        };

        // استخدام أحداث المكالمات الموجودة
        // @ts-expect-error - custom event
        socket.on('webrtc:signal', handleSignal);

        return () => {
            // @ts-expect-error - custom event
            socket.off('webrtc:signal', handleSignal);
        };
    }, [user, onIncomingCall]);

    /**
     * بدء مكالمة صادرة
     */
    const startCall = useCallback(async (
        participant: CallParticipant,
        callType: CallType,
        conversationId?: string
    ) => {
        if (!user) {
            setError('يجب تسجيل الدخول لإجراء مكالمة');
            return;
        }

        try {
            setError(null);
            const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            const callData: CallData = {
                callId,
                type: callType,
                status: 'ringing',
                direction: 'outgoing',
                caller: { id: user.id, name: user.name || 'أنا', avatar: user.profileImage },
                callee: participant,
                conversationId,
            };

            setCurrentCall(callData);
            callStartTimeRef.current = new Date();

            await webRTCManager.startCall(
                callId,
                participant.id,
                callType,
                { id: user.id, name: user.name || 'أنا', avatar: user.profileImage }
            );
        } catch (err) {
            setError((err as Error).message);
            setCallStatus('failed');
        }
    }, [user]);

    /**
     * قبول مكالمة واردة
     */
    const acceptCall = useCallback(async () => {
        if (!currentCall || !user) return;

        try {
            setError(null);
            callStartTimeRef.current = new Date();

            // إرسال إشارة القبول
            sendSignal({
                type: 'call-accept',
                callId: currentCall.callId,
                senderId: user.id,
                receiverId: currentCall.caller.id,
                callType: currentCall.type,
            });

            await webRTCManager.acceptCall(currentCall.callId, currentCall.type);
        } catch (err) {
            setError((err as Error).message);
            setCallStatus('failed');
        }
    }, [currentCall, user, sendSignal]);

    /**
     * رفض مكالمة واردة
     */
    const rejectCall = useCallback(() => {
        if (!currentCall || !user) return;

        webRTCManager.rejectCall(currentCall.callId, user.id, currentCall.caller.id);
        setCurrentCall(null);
        onCallEnded?.(currentCall.callId);
    }, [currentCall, user, onCallEnded]);

    /**
     * إنهاء المكالمة
     */
    const endCall = useCallback(() => {
        const callId = currentCall?.callId;
        webRTCManager.endCall();
        setCurrentCall(null);
        setLocalStream(null);
        setRemoteStream(null);
        if (callId) {
            onCallEnded?.(callId);
        }
    }, [currentCall, onCallEnded]);

    /**
     * تبديل الفيديو
     */
    const toggleVideo = useCallback((enabled: boolean) => {
        webRTCManager.toggleVideo(enabled);
        setIsVideoEnabled(enabled);
    }, []);

    /**
     * تبديل الصوت
     */
    const toggleAudio = useCallback((enabled: boolean) => {
        webRTCManager.toggleAudio(enabled);
        setIsAudioEnabled(enabled);
    }, []);

    /**
     * تبديل الكاميرا
     */
    const switchCamera = useCallback(async () => {
        await webRTCManager.switchCamera();
    }, []);

    /**
     * تتبع حالة المكالمة
     */
    useEffect(() => {
        if (callStatus === 'ended' || callStatus === 'rejected' || callStatus === 'missed') {
            const callId = currentCall?.callId;
            setCurrentCall(null);
            setLocalStream(null);
            setRemoteStream(null);
            if (callId) {
                onCallEnded?.(callId);
            }
        }
    }, [callStatus, currentCall, onCallEnded]);

    return {
        callStatus,
        currentCall,
        isInCall: callStatus === 'connected' || callStatus === 'connecting' || callStatus === 'ringing',
        localStream,
        remoteStream,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleVideo,
        toggleAudio,
        switchCamera,
        isVideoEnabled,
        isAudioEnabled,
        error,
    };
}

export default useWebRTCCall;
