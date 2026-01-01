/**
 * 🎥 useWebRTC Hook
 * Hook احترافي لإدارة مكالمات الفيديو والصوت باستخدام WebRTC
 */

import { getSocketManager } from '@/utils/socketManager';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AUDIO_CONSTRAINTS, CALL_TIMEOUTS, RTC_CONFIG, VIDEO_CONSTRAINTS } from './config';
import type { CallData, CallParticipant, CallType, RTCSignal } from './types';

interface UseWebRTCOptions {
    currentUser: CallParticipant;
    onCallStateChange?: (state: CallData | null) => void;
    onRemoteStream?: (stream: MediaStream | null) => void;
    onError?: (error: string) => void;
}

interface UseWebRTCReturn {
    // حالة المكالمة
    callState: CallData | null;
    isCallActive: boolean;
    isCalling: boolean;
    isReceiving: boolean;

    // الـ Streams
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;

    // التحكم بالوسائط
    isAudioEnabled: boolean;
    isVideoEnabled: boolean;
    toggleAudio: () => void;
    toggleVideo: () => void;

    // إجراءات المكالمة
    startCall: (callee: CallParticipant, type: CallType) => Promise<void>;
    answerCall: () => Promise<void>;
    rejectCall: () => void;
    endCall: () => void;

    // تبديل الكاميرا
    switchCamera: () => Promise<void>;
}

// إنشاء معرف فريد للمكالمة
const generateCallId = () => `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export function useWebRTC(options: UseWebRTCOptions): UseWebRTCReturn {
    const { currentUser, onCallStateChange, onRemoteStream, onError } = options;

    // حالة المكالمة
    const [callState, setCallState] = useState<CallData | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);

    // المراجع
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const remoteStreamRef = useRef<MediaStream | null>(null);
    const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
    const ringingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Socket manager
    const socketManager = getSocketManager();

    // تحديث حالة المكالمة
    const updateCallState = useCallback((updates: Partial<CallData> | null) => {
        setCallState(prev => {
            if (updates === null) {
                onCallStateChange?.(null);
                return null;
            }
            const newState = prev ? { ...prev, ...updates } : null;
            if (newState) onCallStateChange?.(newState);
            return newState;
        });
    }, [onCallStateChange]);

    // تنظيف الموارد
    const cleanup = useCallback(() => {
        // إيقاف الـ streams
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
            setLocalStream(null);
        }

        if (remoteStreamRef.current) {
            remoteStreamRef.current.getTracks().forEach(track => track.stop());
            remoteStreamRef.current = null;
            setRemoteStream(null);
            onRemoteStream?.(null);
        }

        // إغلاق الـ peer connection
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }

        // مسح الـ timeouts
        if (ringingTimeoutRef.current) {
            clearTimeout(ringingTimeoutRef.current);
            ringingTimeoutRef.current = null;
        }
        if (connectionTimeoutRef.current) {
            clearTimeout(connectionTimeoutRef.current);
            connectionTimeoutRef.current = null;
        }

        // مسح ICE candidates المعلقة
        pendingCandidatesRef.current = [];
    }, [onRemoteStream]);

    // الحصول على الـ media stream
    const getMediaStream = useCallback(async (type: CallType): Promise<MediaStream> => {
        const constraints: MediaStreamConstraints = {
            audio: AUDIO_CONSTRAINTS,
            video: type === 'video' ? VIDEO_CONSTRAINTS.high : false,
        };

        try {
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            localStreamRef.current = stream;
            setLocalStream(stream);
            return stream;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'فشل في الوصول للكاميرا أو الميكروفون';
            onError?.(message);
            throw error;
        }
    }, [onError]);

    // إنشاء RTCPeerConnection
    const createPeerConnection = useCallback(() => {
        const pc = new RTCPeerConnection(RTC_CONFIG);

        // إضافة الـ local tracks
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                if (localStreamRef.current) {
                    pc.addTrack(track, localStreamRef.current);
                }
            });
        }

        // معالجة الـ remote tracks
        pc.ontrack = (event) => {
            const [remoteStream] = event.streams;
            if (remoteStream) {
                remoteStreamRef.current = remoteStream;
                setRemoteStream(remoteStream);
                onRemoteStream?.(remoteStream);
            }
        };

        // معالجة ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate && callState?.callId) {
                socketManager.sendIceCandidate('', callState.callId, event.candidate.toJSON());
            }
        };

        // معالجة تغيير حالة الاتصال
        pc.onconnectionstatechange = () => {
            switch (pc.connectionState) {
                case 'connected':
                    updateCallState({ status: 'connected', startTime: new Date() });
                    if (connectionTimeoutRef.current) {
                        clearTimeout(connectionTimeoutRef.current);
                        connectionTimeoutRef.current = null;
                    }
                    break;
                case 'disconnected':
                case 'failed':
                    endCall();
                    break;
            }
        };

        peerConnectionRef.current = pc;
        return pc;
    }, [callState, currentUser.id, socketManager, onRemoteStream, updateCallState]);

    // بدء مكالمة جديدة
    const startCall = useCallback(async (callee: CallParticipant, type: CallType) => {
        try {
            cleanup();

            const callId = generateCallId();

            // إنشاء حالة المكالمة
            const newCallState: CallData = {
                callId,
                type,
                status: 'ringing',
                direction: 'outgoing',
                caller: currentUser,
                callee,
            };
            setCallState(newCallState);
            onCallStateChange?.(newCallState);

            // الحصول على الـ media stream
            await getMediaStream(type);

            // إنشاء الـ peer connection
            const pc = createPeerConnection();

            // إنشاء الـ offer
            const offer = await pc.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: type === 'video',
            });
            await pc.setLocalDescription(offer);

            // إرسال طلب المكالمة
            socketManager.startCall(
                '', // conversationId - سيتم تحديده لاحقاً
                callee.id,
                type === 'video' ? 'video' : 'audio',
                callId
            );
            // إرسال الـ offer
            socketManager.sendOffer('', callId, offer);

            // تعيين مهلة الرنين
            ringingTimeoutRef.current = setTimeout(() => {
                if (callState?.status === 'ringing') {
                    updateCallState({ status: 'missed' });
                    cleanup();
                }
            }, CALL_TIMEOUTS.ringingTimeout);

        } catch (error) {
            const message = error instanceof Error ? error.message : 'فشل في بدء المكالمة';
            onError?.(message);
            cleanup();
            updateCallState(null);
        }
    }, [currentUser, cleanup, getMediaStream, createPeerConnection, socketManager, onCallStateChange, onError, updateCallState, callState?.status]);

    // الرد على مكالمة واردة
    const answerCall = useCallback(async () => {
        if (!callState || callState.direction !== 'incoming') return;

        try {
            updateCallState({ status: 'connecting' });

            // الحصول على الـ media stream
            await getMediaStream(callState.type);

            // إنشاء الـ peer connection
            const pc = createPeerConnection();

            // إنشاء الـ answer
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            // إضافة أي ICE candidates معلقة
            for (const candidate of pendingCandidatesRef.current) {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            }
            pendingCandidatesRef.current = [];

            // إرسال القبول
            socketManager.acceptCall('', callState.callId);
            socketManager.sendAnswer('', callState.callId, answer);

            // تعيين مهلة الاتصال
            connectionTimeoutRef.current = setTimeout(() => {
                if (callState?.status === 'connecting') {
                    onError?.('انتهت مهلة الاتصال');
                    endCall();
                }
            }, CALL_TIMEOUTS.connectionTimeout);

        } catch (error) {
            const message = error instanceof Error ? error.message : 'فشل في الرد على المكالمة';
            onError?.(message);
            cleanup();
            updateCallState(null);
        }
    }, [callState, currentUser.id, getMediaStream, createPeerConnection, socketManager, onError, cleanup, updateCallState]);

    // رفض المكالمة
    const rejectCall = useCallback(() => {
        if (!callState) return;

        socketManager.rejectCall('', callState.callId, 'user_rejected');

        updateCallState({ status: 'rejected' });
        cleanup();
        setTimeout(() => updateCallState(null), 1000);
    }, [callState, currentUser.id, socketManager, cleanup, updateCallState]);

    // إنهاء المكالمة
    const endCall = useCallback(() => {
        if (!callState) return;

        socketManager.endCall('', callState.callId, 'call_ended');

        const duration = callState.startTime
            ? Math.floor((Date.now() - callState.startTime.getTime()) / 1000)
            : 0;

        updateCallState({ status: 'ended', endTime: new Date(), duration });
        cleanup();
        setTimeout(() => updateCallState(null), 1000);
    }, [callState, currentUser.id, socketManager, cleanup, updateCallState]);

    // تبديل الصوت
    const toggleAudio = useCallback(() => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsAudioEnabled(audioTrack.enabled);
            }
        }
    }, []);

    // تبديل الفيديو
    const toggleVideo = useCallback(() => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoEnabled(videoTrack.enabled);
            }
        }
    }, []);

    // تبديل الكاميرا (أمامية/خلفية)
    const switchCamera = useCallback(async () => {
        if (!localStreamRef.current || !callState) return;

        try {
            const currentVideoTrack = localStreamRef.current.getVideoTracks()[0];
            if (!currentVideoTrack) return;

            const currentFacingMode = currentVideoTrack.getSettings().facingMode;
            const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';

            const newStream = await navigator.mediaDevices.getUserMedia({
                video: { ...VIDEO_CONSTRAINTS.high, facingMode: newFacingMode },
            });

            const newVideoTrack = newStream.getVideoTracks()[0];

            // استبدال الـ track في الـ peer connection
            const sender = peerConnectionRef.current?.getSenders().find(s => s.track?.kind === 'video');
            if (sender) {
                await sender.replaceTrack(newVideoTrack);
            }

            // تحديث الـ local stream
            currentVideoTrack.stop();
            localStreamRef.current.removeTrack(currentVideoTrack);
            localStreamRef.current.addTrack(newVideoTrack);
            setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
        } catch (error) {
            onError?.('فشل في تبديل الكاميرا');
        }
    }, [callState, onError]);

    // معالجة الإشارات الواردة
    useEffect(() => {
        const handleSignal = async (signal: RTCSignal) => {
            // تجاهل الإشارات غير الموجهة لنا
            if (signal.receiverId !== currentUser.id) return;

            switch (signal.type) {
                case 'call-request':
                    // مكالمة واردة جديدة
                    if (callState) {
                        // نحن مشغولون بمكالمة أخرى - رفض المكالمة
                        socketManager.rejectCall('', signal.callId, 'user_busy');
                        return;
                    }

                    const incomingCall: CallData = {
                        callId: signal.callId,
                        type: signal.callType || 'voice',
                        status: 'ringing',
                        direction: 'incoming',
                        caller: signal.callerInfo || { id: signal.senderId, name: 'مستخدم' },
                        callee: currentUser,
                    };
                    setCallState(incomingCall);
                    onCallStateChange?.(incomingCall);

                    // حفظ الـ offer لاستخدامه لاحقاً
                    if (signal.payload && 'sdp' in signal.payload) {
                        const pc = new RTCPeerConnection(RTC_CONFIG);
                        await pc.setRemoteDescription(new RTCSessionDescription(signal.payload as RTCSessionDescriptionInit));
                        peerConnectionRef.current = pc;
                    }
                    break;

                case 'call-accept':
                    // تم قبول المكالمة
                    if (peerConnectionRef.current && signal.payload && 'sdp' in signal.payload) {
                        await peerConnectionRef.current.setRemoteDescription(
                            new RTCSessionDescription(signal.payload as RTCSessionDescriptionInit)
                        );
                        updateCallState({ status: 'connecting' });

                        // إضافة أي ICE candidates معلقة
                        for (const candidate of pendingCandidatesRef.current) {
                            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
                        }
                        pendingCandidatesRef.current = [];
                    }
                    break;

                case 'call-reject':
                    updateCallState({ status: 'rejected' });
                    cleanup();
                    setTimeout(() => updateCallState(null), 1000);
                    break;

                case 'call-end':
                    updateCallState({ status: 'ended', endTime: new Date() });
                    cleanup();
                    setTimeout(() => updateCallState(null), 1000);
                    break;

                case 'call-busy':
                    updateCallState({ status: 'busy' });
                    cleanup();
                    setTimeout(() => updateCallState(null), 2000);
                    break;

                case 'ice-candidate':
                    if (signal.payload && 'candidate' in signal.payload) {
                        const candidate = signal.payload as RTCIceCandidateInit;
                        if (peerConnectionRef.current?.remoteDescription) {
                            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
                        } else {
                            pendingCandidatesRef.current.push(candidate);
                        }
                    }
                    break;
            }
        };

        // الاستماع للإشارات
        socketManager.on('rtc:signal', handleSignal);

        return () => {
            socketManager.off('rtc:signal', handleSignal);
        };
    }, [currentUser, callState, socketManager, onCallStateChange, updateCallState, cleanup]);

    // تنظيف عند إلغاء التحميل
    useEffect(() => {
        return () => {
            cleanup();
        };
    }, [cleanup]);

    return {
        callState,
        isCallActive: callState?.status === 'connected',
        isCalling: callState?.direction === 'outgoing' && callState?.status === 'ringing',
        isReceiving: callState?.direction === 'incoming' && callState?.status === 'ringing',

        localStream,
        remoteStream,

        isAudioEnabled,
        isVideoEnabled,
        toggleAudio,
        toggleVideo,

        startCall,
        answerCall,
        rejectCall,
        endCall,

        switchCamera,
    };
}
