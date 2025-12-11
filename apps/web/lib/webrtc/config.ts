/**
 * 🔧 WebRTC Configuration
 * إعدادات STUN/TURN servers للاتصالات
 */

// خوادم STUN المجانية العامة
const PUBLIC_STUN_SERVERS = [
    'stun:stun.l.google.com:19302',
    'stun:stun1.l.google.com:19302',
    'stun:stun2.l.google.com:19302',
    'stun:stun3.l.google.com:19302',
    'stun:stun4.l.google.com:19302',
    'stun:stun.stunprotocol.org:3478',
    'stun:stun.voip.blackberry.com:3478',
];

// إعدادات ICE الافتراضية
export const ICE_SERVERS: RTCIceServer[] = [
    // خوادم STUN المجانية
    ...PUBLIC_STUN_SERVERS.map(url => ({ urls: url })),

    // يمكن إضافة خوادم TURN مدفوعة لجودة أفضل
    // {
    //   urls: 'turn:your-turn-server.com:3478',
    //   username: 'username',
    //   credential: 'password',
    // },
];

// إعدادات RTCPeerConnection
export const RTC_CONFIG: RTCConfiguration = {
    iceServers: ICE_SERVERS,
    iceCandidatePoolSize: 10,
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require',
};

// إعدادات جودة الفيديو
export const VIDEO_CONSTRAINTS = {
    low: {
        width: { ideal: 320 },
        height: { ideal: 240 },
        frameRate: { ideal: 15 },
    },
    medium: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        frameRate: { ideal: 24 },
    },
    high: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 },
    },
    hd: {
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 30 },
    },
};

// إعدادات الصوت
export const AUDIO_CONSTRAINTS: MediaTrackConstraints = {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 48000,
    channelCount: 1,
};

// مهلات الاتصال
export const CALL_TIMEOUTS = {
    ringingTimeout: 45000, // 45 ثانية للرنين
    connectionTimeout: 30000, // 30 ثانية للاتصال
    iceGatheringTimeout: 10000, // 10 ثوان لجمع ICE candidates
};

// أصوات المكالمات
export const CALL_SOUNDS = {
    ringtone: '/sounds/ringtone.mp3',
    ringingTone: '/sounds/ringing.mp3',
    endCall: '/sounds/end-call.mp3',
    busyTone: '/sounds/busy.mp3',
};
