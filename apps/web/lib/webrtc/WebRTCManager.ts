/**
 * 🎥 WebRTC Manager
 * مدير الاتصالات الفورية الاحترافي
 */

import { AUDIO_CONSTRAINTS, CALL_TIMEOUTS, RTC_CONFIG, VIDEO_CONSTRAINTS } from './config';
import type { CallParticipant, CallStatus, CallType, RTCSignal } from './types';

type SignalCallback = (signal: RTCSignal) => void;
type StatusCallback = (status: CallStatus) => void;
type StreamCallback = (stream: MediaStream) => void;

interface WebRTCManagerConfig {
    onSignal: SignalCallback;
    onStatusChange: StatusCallback;
    onRemoteStream: StreamCallback;
    onLocalStream?: StreamCallback;
    onError?: (error: Error) => void;
}

class WebRTCManager {
    private peerConnection: RTCPeerConnection | null = null;
    private localStream: MediaStream | null = null;
    private remoteStream: MediaStream | null = null;
    private config: WebRTCManagerConfig | null = null;
    private callId: string | null = null;
    private callType: CallType = 'voice';
    private currentStatus: CallStatus = 'idle';
    private iceCandidatesQueue: RTCIceCandidateInit[] = [];
    private ringingTimeout: NodeJS.Timeout | null = null;
    private connectionTimeout: NodeJS.Timeout | null = null;

    /**
     * تهيئة المدير
     */
    initialize(config: WebRTCManagerConfig): void {
        this.config = config;
        console.log('[WebRTC] Manager initialized');
    }

    /**
     * الحصول على حالة المكالمة الحالية
     */
    getStatus(): CallStatus {
        return this.currentStatus;
    }

    /**
     * تحديث الحالة
     */
    private updateStatus(status: CallStatus): void {
        this.currentStatus = status;
        this.config?.onStatusChange(status);
    }

    /**
     * إنشاء peer connection جديد
     */
    private async createPeerConnection(): Promise<RTCPeerConnection> {
        const pc = new RTCPeerConnection(RTC_CONFIG);

        // معالجة ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate && this.callId) {
                this.config?.onSignal({
                    type: 'ice-candidate',
                    callId: this.callId,
                    senderId: '', // سيتم تعبئته من الخارج
                    receiverId: '',
                    payload: event.candidate.toJSON(),
                });
            }
        };

        // معالجة حالة ICE
        pc.oniceconnectionstatechange = () => {
            console.log('[WebRTC] ICE state:', pc.iceConnectionState);
            switch (pc.iceConnectionState) {
                case 'connected':
                    this.clearTimeouts();
                    this.updateStatus('connected');
                    break;
                case 'disconnected':
                case 'failed':
                    this.endCall();
                    break;
                case 'closed':
                    this.cleanup();
                    break;
            }
        };

        // استقبال remote stream
        pc.ontrack = (event) => {
            console.log('[WebRTC] Remote track received');
            if (event.streams && event.streams[0]) {
                this.remoteStream = event.streams[0];
                this.config?.onRemoteStream(event.streams[0]);
            }
        };

        return pc;
    }

    /**
     * الحصول على الوسائط المحلية
     */
    private async getLocalMedia(callType: CallType, videoQuality: 'low' | 'medium' | 'high' | 'hd' = 'medium'): Promise<MediaStream> {
        const constraints: MediaStreamConstraints = {
            audio: AUDIO_CONSTRAINTS,
            video: callType === 'video' ? VIDEO_CONSTRAINTS[videoQuality] : false,
        };

        try {
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.localStream = stream;
            this.config?.onLocalStream?.(stream);
            return stream;
        } catch (error) {
            console.error('[WebRTC] Failed to get media:', error);
            throw new Error('فشل الوصول إلى الكاميرا أو الميكروفون');
        }
    }

    /**
     * بدء مكالمة صادرة
     */
    async startCall(
        callId: string,
        receiverId: string,
        callType: CallType,
        callerInfo: CallParticipant
    ): Promise<void> {
        try {
            this.callId = callId;
            this.callType = callType;
            this.updateStatus('ringing');

            // إرسال طلب المكالمة
            this.config?.onSignal({
                type: 'call-request',
                callId,
                senderId: callerInfo.id,
                receiverId,
                callType,
                callerInfo,
            });

            // مهلة الرنين
            this.ringingTimeout = setTimeout(() => {
                if (this.currentStatus === 'ringing') {
                    this.updateStatus('missed');
                    this.cleanup();
                }
            }, CALL_TIMEOUTS.ringingTimeout);

        } catch (error) {
            console.error('[WebRTC] Start call error:', error);
            this.config?.onError?.(error as Error);
            this.updateStatus('failed');
        }
    }

    /**
     * قبول مكالمة واردة
     */
    async acceptCall(callId: string, callType: CallType): Promise<void> {
        try {
            this.callId = callId;
            this.callType = callType;
            this.updateStatus('connecting');

            // الحصول على الوسائط المحلية
            const stream = await this.getLocalMedia(callType);

            // إنشاء peer connection
            this.peerConnection = await this.createPeerConnection();

            // إضافة المسارات المحلية
            stream.getTracks().forEach((track) => {
                this.peerConnection?.addTrack(track, stream);
            });

            // معالجة ICE candidates المعلقة
            for (const candidate of this.iceCandidatesQueue) {
                await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            }
            this.iceCandidatesQueue = [];

            // مهلة الاتصال
            this.connectionTimeout = setTimeout(() => {
                if (this.currentStatus === 'connecting') {
                    this.updateStatus('failed');
                    this.cleanup();
                }
            }, CALL_TIMEOUTS.connectionTimeout);

        } catch (error) {
            console.error('[WebRTC] Accept call error:', error);
            this.config?.onError?.(error as Error);
            this.updateStatus('failed');
        }
    }

    /**
     * رفض مكالمة واردة
     */
    rejectCall(callId: string, senderId: string, receiverId: string): void {
        this.config?.onSignal({
            type: 'call-reject',
            callId,
            senderId,
            receiverId,
        });
        this.updateStatus('rejected');
        this.cleanup();
    }

    /**
     * معالجة إشارة واردة
     */
    async handleSignal(signal: RTCSignal): Promise<void> {
        try {
            switch (signal.type) {
                case 'call-accept':
                    // المتصل: إنشاء العرض
                    await this.handleCallAccepted(signal);
                    break;

                case 'offer':
                    // المتلقي: معالجة العرض وإنشاء الإجابة
                    await this.handleOffer(signal);
                    break;

                case 'answer':
                    // المتصل: معالجة الإجابة
                    await this.handleAnswer(signal);
                    break;

                case 'ice-candidate':
                    // معالجة ICE candidate
                    await this.handleIceCandidate(signal);
                    break;

                case 'call-end':
                    // إنهاء المكالمة
                    this.updateStatus('ended');
                    this.cleanup();
                    break;

                case 'call-reject':
                    // رفض المكالمة
                    this.updateStatus('rejected');
                    this.cleanup();
                    break;

                case 'call-busy':
                    // المستخدم مشغول
                    this.updateStatus('busy');
                    this.cleanup();
                    break;
            }
        } catch (error) {
            console.error('[WebRTC] Signal handling error:', error);
            this.config?.onError?.(error as Error);
        }
    }

    /**
     * معالجة قبول المكالمة (للمتصل)
     */
    private async handleCallAccepted(signal: RTCSignal): Promise<void> {
        this.clearTimeouts();
        this.updateStatus('connecting');

        // الحصول على الوسائط المحلية
        const stream = await this.getLocalMedia(this.callType);

        // إنشاء peer connection
        this.peerConnection = await this.createPeerConnection();

        // إضافة المسارات المحلية
        stream.getTracks().forEach((track) => {
            this.peerConnection?.addTrack(track, stream);
        });

        // إنشاء العرض
        const offer = await this.peerConnection.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: this.callType === 'video',
        });
        await this.peerConnection.setLocalDescription(offer);

        // إرسال العرض
        this.config?.onSignal({
            type: 'offer',
            callId: this.callId!,
            senderId: signal.receiverId,
            receiverId: signal.senderId,
            payload: offer,
        });
    }

    /**
     * معالجة العرض (للمتلقي)
     */
    private async handleOffer(signal: RTCSignal): Promise<void> {
        if (!this.peerConnection || !signal.payload) return;

        await this.peerConnection.setRemoteDescription(
            new RTCSessionDescription(signal.payload as RTCSessionDescriptionInit)
        );

        // إنشاء الإجابة
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);

        // إرسال الإجابة
        this.config?.onSignal({
            type: 'answer',
            callId: this.callId!,
            senderId: signal.receiverId,
            receiverId: signal.senderId,
            payload: answer,
        });
    }

    /**
     * معالجة الإجابة (للمتصل)
     */
    private async handleAnswer(signal: RTCSignal): Promise<void> {
        if (!this.peerConnection || !signal.payload) return;

        await this.peerConnection.setRemoteDescription(
            new RTCSessionDescription(signal.payload as RTCSessionDescriptionInit)
        );
    }

    /**
     * معالجة ICE candidate
     */
    private async handleIceCandidate(signal: RTCSignal): Promise<void> {
        if (!signal.payload) return;

        if (this.peerConnection) {
            await this.peerConnection.addIceCandidate(
                new RTCIceCandidate(signal.payload as RTCIceCandidateInit)
            );
        } else {
            // حفظ للمعالجة لاحقاً
            this.iceCandidatesQueue.push(signal.payload as RTCIceCandidateInit);
        }
    }

    /**
     * إنهاء المكالمة
     */
    endCall(): void {
        if (this.callId) {
            this.config?.onSignal({
                type: 'call-end',
                callId: this.callId,
                senderId: '',
                receiverId: '',
            });
        }
        this.updateStatus('ended');
        this.cleanup();
    }

    /**
     * تبديل الفيديو
     */
    toggleVideo(enabled: boolean): void {
        if (this.localStream) {
            this.localStream.getVideoTracks().forEach((track) => {
                track.enabled = enabled;
            });
        }
    }

    /**
     * تبديل الصوت
     */
    toggleAudio(enabled: boolean): void {
        if (this.localStream) {
            this.localStream.getAudioTracks().forEach((track) => {
                track.enabled = enabled;
            });
        }
    }

    /**
     * تبديل الكاميرا
     */
    async switchCamera(): Promise<void> {
        if (!this.localStream || this.callType !== 'video') return;

        const videoTrack = this.localStream.getVideoTracks()[0];
        if (!videoTrack) return;

        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const cameras = devices.filter((d) => d.kind === 'videoinput');

            if (cameras.length < 2) return;

            const currentCamera = videoTrack.getSettings().deviceId;
            const nextCamera = cameras.find((c) => c.deviceId !== currentCamera);

            if (nextCamera) {
                const newStream = await navigator.mediaDevices.getUserMedia({
                    video: { deviceId: { exact: nextCamera.deviceId } },
                });

                const newTrack = newStream.getVideoTracks()[0];

                // استبدال المسار في peer connection
                const sender = this.peerConnection
                    ?.getSenders()
                    .find((s) => s.track?.kind === 'video');

                if (sender) {
                    await sender.replaceTrack(newTrack);
                }

                // تحديث local stream
                videoTrack.stop();
                this.localStream.removeTrack(videoTrack);
                this.localStream.addTrack(newTrack);
                this.config?.onLocalStream?.(this.localStream);
            }
        } catch (error) {
            console.error('[WebRTC] Switch camera error:', error);
        }
    }

    /**
     * مسح المهلات
     */
    private clearTimeouts(): void {
        if (this.ringingTimeout) {
            clearTimeout(this.ringingTimeout);
            this.ringingTimeout = null;
        }
        if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
        }
    }

    /**
     * تنظيف الموارد
     */
    private cleanup(): void {
        this.clearTimeouts();

        // إيقاف المسارات المحلية
        if (this.localStream) {
            this.localStream.getTracks().forEach((track) => track.stop());
            this.localStream = null;
        }

        // إغلاق peer connection
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }

        this.remoteStream = null;
        this.callId = null;
        this.iceCandidatesQueue = [];
        this.updateStatus('idle');
    }

    /**
     * الحصول على Local Stream
     */
    getLocalStream(): MediaStream | null {
        return this.localStream;
    }

    /**
     * الحصول على Remote Stream
     */
    getRemoteStream(): MediaStream | null {
        return this.remoteStream;
    }

    /**
     * تدمير المدير
     */
    destroy(): void {
        this.cleanup();
        this.config = null;
    }
}

// Singleton instance
export const webRTCManager = new WebRTCManager();
export default webRTCManager;
