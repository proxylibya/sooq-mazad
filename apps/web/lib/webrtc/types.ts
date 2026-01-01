/**
 * 🎥 WebRTC Types
 * أنواع البيانات لنظام الاتصالات الفورية
 */

export type CallType = 'voice' | 'video';
export type CallStatus = 'idle' | 'ringing' | 'connecting' | 'connected' | 'ended' | 'rejected' | 'missed' | 'busy' | 'failed';
export type CallDirection = 'incoming' | 'outgoing';

export interface CallParticipant {
    id: string;
    name: string;
    avatar?: string;
    phone?: string;
}

export interface CallData {
    callId: string;
    type: CallType;
    status: CallStatus;
    direction: CallDirection;
    caller: CallParticipant;
    callee: CallParticipant;
    startTime?: Date;
    endTime?: Date;
    duration?: number; // بالثواني
    conversationId?: string;
}

export interface RTCSignal {
    type: 'offer' | 'answer' | 'ice-candidate' | 'call-request' | 'call-accept' | 'call-reject' | 'call-end' | 'call-busy';
    callId: string;
    senderId: string;
    receiverId: string;
    payload?: RTCSessionDescriptionInit | RTCIceCandidateInit | null;
    callType?: CallType;
    callerInfo?: CallParticipant;
}

export interface CallSettings {
    // إعدادات الفيديو
    videoEnabled: boolean;
    videoQuality: 'low' | 'medium' | 'high' | 'hd';
    // إعدادات الصوت
    audioEnabled: boolean;
    noiseSuppression: boolean;
    echoCancellation: boolean;
    // إعدادات عامة
    autoAnswer: boolean;
    ringtoneVolume: number;
}

export interface MediaDevices {
    cameras: MediaDeviceInfo[];
    microphones: MediaDeviceInfo[];
    speakers: MediaDeviceInfo[];
    selectedCamera?: string;
    selectedMicrophone?: string;
    selectedSpeaker?: string;
}

// سجل المكالمات
export interface CallLog {
    id: string;
    callId: string;
    callerId: string;
    calleeId: string;
    type: CallType;
    status: CallStatus;
    direction: CallDirection;
    startTime: Date;
    endTime?: Date;
    duration?: number;
    conversationId?: string;
    createdAt: Date;
}

// إحصائيات المكالمات
export interface CallStats {
    totalCalls: number;
    voiceCalls: number;
    videoCalls: number;
    missedCalls: number;
    totalDuration: number; // بالثواني
    averageDuration: number;
}
