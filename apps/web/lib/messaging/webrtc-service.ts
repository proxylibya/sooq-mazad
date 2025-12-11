/**
 * خدمة WebRTC للمكالمات الصوتية والفيديو
 * Sooq Mazad - نظام المكالمات المتكامل
 */

import { getSocketManager } from '@/utils/socketManager';

// ==================== الأنواع ====================

export type CallType = 'VOICE' | 'VIDEO';

export interface CallState {
    callId: string | null;
    type: CallType | null;
    status: 'idle' | 'ringing' | 'connecting' | 'connected' | 'ended';
    isIncoming: boolean;
    isMuted: boolean;
    isVideoEnabled: boolean;
    remoteUserId: string | null;
    remoteUserName: string | null;
    startTime: Date | null;
    duration: number;
}

export interface WebRTCConfig {
    iceServers: RTCIceServer[];
}

// ==================== التكوين ====================

const DEFAULT_ICE_SERVERS: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
];

// ==================== خدمة WebRTC ====================

class WebRTCService {
    private static instance: WebRTCService;

    private peerConnection: RTCPeerConnection | null = null;
    private localStream: MediaStream | null = null;
    private remoteStream: MediaStream | null = null;

    private state: CallState = {
        callId: null,
        type: null,
        status: 'idle',
        isIncoming: false,
        isMuted: false,
        isVideoEnabled: true,
        remoteUserId: null,
        remoteUserName: null,
        startTime: null,
        duration: 0,
    };

    private durationInterval: NodeJS.Timeout | null = null;
    private eventHandlers: Map<string, Set<Function>> = new Map();
    private config: WebRTCConfig;

    private constructor() {
        this.config = {
            iceServers: DEFAULT_ICE_SERVERS,
        };
        this.setupSocketListeners();
    }

    static getInstance(): WebRTCService {
        if (!WebRTCService.instance) {
            WebRTCService.instance = new WebRTCService();
        }
        return WebRTCService.instance;
    }

    // ==================== إدارة الأحداث ====================

    on(event: string, handler: Function) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, new Set());
        }
        this.eventHandlers.get(event)!.add(handler);
        return () => this.off(event, handler);
    }

    off(event: string, handler: Function) {
        this.eventHandlers.get(event)?.delete(handler);
    }

    private emit(event: string, data?: unknown) {
        this.eventHandlers.get(event)?.forEach(handler => handler(data));
    }

    // ==================== Socket Listeners ====================

    private setupSocketListeners() {
        try {
            const socketManager = getSocketManager();

            // عرض المكالمة
            socketManager.on('call:offer', async (data: {
                callId: string;
                callerId: string;
                callerName: string;
                type: CallType;
                offer: RTCSessionDescriptionInit;
            }) => {
                this.state = {
                    ...this.state,
                    callId: data.callId,
                    type: data.type,
                    status: 'ringing',
                    isIncoming: true,
                    remoteUserId: data.callerId,
                    remoteUserName: data.callerName,
                };
                this.emit('incoming', { ...data, state: this.state });
            });

            // قبول المكالمة
            socketManager.on('call:answer', async (data: {
                callId: string;
                answer: RTCSessionDescriptionInit;
            }) => {
                if (this.peerConnection && data.answer) {
                    await this.peerConnection.setRemoteDescription(
                        new RTCSessionDescription(data.answer)
                    );
                    this.state.status = 'connected';
                    this.startDurationTimer();
                    this.emit('connected', { callId: data.callId });
                }
            });

            // مرشح ICE
            socketManager.on('call:ice-candidate', async (data: {
                callId: string;
                candidate: RTCIceCandidateInit;
            }) => {
                if (this.peerConnection && data.candidate) {
                    try {
                        await this.peerConnection.addIceCandidate(
                            new RTCIceCandidate(data.candidate)
                        );
                    } catch (e) {
                        console.error('[WebRTC] Failed to add ICE candidate:', e);
                    }
                }
            });

            // إنهاء المكالمة
            socketManager.on('call:ended', (data: { callId: string; }) => {
                this.endCallLocal();
                this.emit('ended', { callId: data.callId, duration: this.state.duration });
            });

            // رفض المكالمة
            socketManager.on('call:declined', (data: { callId: string; }) => {
                this.endCallLocal();
                this.emit('declined', { callId: data.callId });
            });

            // المستخدم مشغول
            socketManager.on('call:busy', (data: { callId: string; }) => {
                this.endCallLocal();
                this.emit('busy', { callId: data.callId });
            });

        } catch (error) {
            console.error('[WebRTC] Failed to setup socket listeners:', error);
        }
    }

    // ==================== إدارة المكالمات ====================

    /**
     * بدء مكالمة
     */
    async startCall(
        callId: string,
        remoteUserId: string,
        remoteUserName: string,
        type: CallType
    ): Promise<boolean> {
        try {
            // التحقق من الحالة
            if (this.state.status !== 'idle') {
                console.warn('[WebRTC] Already in a call');
                return false;
            }

            // الحصول على الوسائط المحلية
            this.localStream = await this.getLocalStream(type);

            // إنشاء اتصال
            this.createPeerConnection();

            // إضافة المسارات
            this.localStream.getTracks().forEach(track => {
                this.peerConnection!.addTrack(track, this.localStream!);
            });

            // إنشاء العرض
            const offer = await this.peerConnection!.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: type === 'VIDEO',
            });

            await this.peerConnection!.setLocalDescription(offer);

            // إرسال العرض
            const socketManager = getSocketManager();
            socketManager.sendOffer(callId, callId, offer);

            // تحديث الحالة
            this.state = {
                ...this.state,
                callId,
                type,
                status: 'ringing',
                isIncoming: false,
                remoteUserId,
                remoteUserName,
                isVideoEnabled: type === 'VIDEO',
            };

            this.emit('calling', { callId, remoteUserId, type });
            return true;

        } catch (error) {
            console.error('[WebRTC] Failed to start call:', error);
            this.endCallLocal();
            return false;
        }
    }

    /**
     * الرد على مكالمة
     */
    async answerCall(offer: RTCSessionDescriptionInit): Promise<boolean> {
        try {
            if (this.state.status !== 'ringing' || !this.state.isIncoming) {
                return false;
            }

            // الحصول على الوسائط المحلية
            this.localStream = await this.getLocalStream(this.state.type || 'VOICE');

            // إنشاء اتصال
            this.createPeerConnection();

            // إضافة المسارات
            this.localStream.getTracks().forEach(track => {
                this.peerConnection!.addTrack(track, this.localStream!);
            });

            // تعيين العرض البعيد
            await this.peerConnection!.setRemoteDescription(
                new RTCSessionDescription(offer)
            );

            // إنشاء الإجابة
            const answer = await this.peerConnection!.createAnswer();
            await this.peerConnection!.setLocalDescription(answer);

            // إرسال الإجابة
            if (this.state.callId) {
                const socketManager = getSocketManager();
                socketManager.sendAnswer(this.state.callId, this.state.callId, answer);
            }

            // تحديث الحالة
            this.state.status = 'connected';
            this.startDurationTimer();

            this.emit('connected', { callId: this.state.callId });
            return true;

        } catch (error) {
            console.error('[WebRTC] Failed to answer call:', error);
            this.endCallLocal();
            return false;
        }
    }

    /**
     * إنهاء المكالمة
     */
    endCall(): void {
        if (this.state.callId) {
            const socketManager = getSocketManager();
            socketManager.endCall(this.state.callId, this.state.callId);
        }
        this.endCallLocal();
        this.emit('ended', { callId: this.state.callId, duration: this.state.duration });
    }

    /**
     * رفض المكالمة
     */
    declineCall(): void {
        if (this.state.callId) {
            const socketManager = getSocketManager();
            socketManager.rejectCall(this.state.callId, this.state.callId);
        }
        this.endCallLocal();
        this.emit('declined', { callId: this.state.callId });
    }

    // ==================== التحكم في المكالمة ====================

    /**
     * كتم/إلغاء كتم الصوت
     */
    toggleMute(): boolean {
        if (!this.localStream) return this.state.isMuted;

        const audioTrack = this.localStream.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            this.state.isMuted = !audioTrack.enabled;
            this.emit('muteChanged', { isMuted: this.state.isMuted });
        }
        return this.state.isMuted;
    }

    /**
     * تشغيل/إيقاف الفيديو
     */
    toggleVideo(): boolean {
        if (!this.localStream) return !this.state.isVideoEnabled;

        const videoTrack = this.localStream.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            this.state.isVideoEnabled = videoTrack.enabled;
            this.emit('videoChanged', { isVideoEnabled: this.state.isVideoEnabled });
        }
        return this.state.isVideoEnabled;
    }

    /**
     * تبديل الكاميرا (أمامية/خلفية)
     */
    async switchCamera(): Promise<boolean> {
        if (!this.localStream || this.state.type !== 'VIDEO') return false;

        try {
            const currentVideoTrack = this.localStream.getVideoTracks()[0];
            const constraints = currentVideoTrack.getConstraints();
            const facingMode = constraints.facingMode === 'user' ? 'environment' : 'user';

            const newStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode },
                audio: false,
            });

            const newVideoTrack = newStream.getVideoTracks()[0];

            // استبدال المسار
            const sender = this.peerConnection?.getSenders().find(s => s.track?.kind === 'video');
            if (sender) {
                await sender.replaceTrack(newVideoTrack);
            }

            // تحديث البث المحلي
            currentVideoTrack.stop();
            this.localStream.removeTrack(currentVideoTrack);
            this.localStream.addTrack(newVideoTrack);

            this.emit('cameraChanged', { facingMode });
            return true;

        } catch (error) {
            console.error('[WebRTC] Failed to switch camera:', error);
            return false;
        }
    }

    // ==================== الأدوات المساعدة ====================

    private async getLocalStream(type: CallType): Promise<MediaStream> {
        const constraints: MediaStreamConstraints = {
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
            },
            video: type === 'VIDEO' ? {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'user',
            } : false,
        };

        return navigator.mediaDevices.getUserMedia(constraints);
    }

    private createPeerConnection(): void {
        this.peerConnection = new RTCPeerConnection({
            iceServers: this.config.iceServers,
        });

        // معالجة مرشحات ICE
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate && this.state.callId) {
                const socketManager = getSocketManager();
                socketManager.sendIceCandidate(
                    this.state.callId,
                    this.state.callId,
                    event.candidate.toJSON()
                );
            }
        };

        // معالجة المسار البعيد
        this.peerConnection.ontrack = (event) => {
            this.remoteStream = event.streams[0];
            this.emit('remoteStream', { stream: this.remoteStream });
        };

        // معالجة تغيير حالة الاتصال
        this.peerConnection.onconnectionstatechange = () => {
            const connectionState = this.peerConnection?.connectionState;
            console.log('[WebRTC] Connection state:', connectionState);

            if (connectionState === 'failed' || connectionState === 'disconnected') {
                this.endCall();
            }
        };
    }

    private endCallLocal(): void {
        // إيقاف عداد المدة
        if (this.durationInterval) {
            clearInterval(this.durationInterval);
            this.durationInterval = null;
        }

        // إيقاف المسارات المحلية
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }

        // إغلاق الاتصال
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }

        this.remoteStream = null;

        // إعادة تعيين الحالة
        const duration = this.state.duration;
        this.state = {
            callId: null,
            type: null,
            status: 'idle',
            isIncoming: false,
            isMuted: false,
            isVideoEnabled: true,
            remoteUserId: null,
            remoteUserName: null,
            startTime: null,
            duration: 0,
        };

        return;
    }

    private startDurationTimer(): void {
        this.state.startTime = new Date();
        this.state.duration = 0;

        this.durationInterval = setInterval(() => {
            if (this.state.startTime) {
                this.state.duration = Math.floor(
                    (Date.now() - this.state.startTime.getTime()) / 1000
                );
                this.emit('durationUpdate', { duration: this.state.duration });
            }
        }, 1000);
    }

    // ==================== Getters ====================

    getState(): CallState {
        return { ...this.state };
    }

    getLocalMediaStream(): MediaStream | null {
        return this.localStream;
    }

    getRemoteMediaStream(): MediaStream | null {
        return this.remoteStream;
    }

    isInCall(): boolean {
        return this.state.status !== 'idle';
    }

    /**
     * تنسيق مدة المكالمة
     */
    formatDuration(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

// التصدير
export const webRTCService = WebRTCService.getInstance();
export default webRTCService;
