import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getSocketManager } from '@/utils/socketManager';

export type CallMedia = 'video' | 'audio';

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  callId: string;
  currentUserId: string;
  remoteUserId: string;
  media: CallMedia;
  mode: 'incoming' | 'outgoing';
}

// Build ICE servers from env (STUN + optional TURN)
const buildIceServers = (): RTCIceServer[] => {
  const stunUrls = (process.env.NEXT_PUBLIC_STUN_URL || 'stun:stun.l.google.com:19302')
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean);
  const ice: RTCIceServer[] = [{ urls: stunUrls }];
  const turnUrls = process.env.NEXT_PUBLIC_TURN_URLS;
  const turnUser = process.env.NEXT_PUBLIC_TURN_USERNAME;
  const turnCred = process.env.NEXT_PUBLIC_TURN_CREDENTIAL;
  if (turnUrls && turnUser && turnCred) {
    ice.push({ urls: turnUrls.split(',').map((u) => u.trim()), username: turnUser, credential: turnCred });
  }
  return ice;
};

export default function VideoCallModal(props: VideoCallModalProps) {
  const { isOpen, onClose, conversationId, callId, currentUserId: _currentUserId, remoteUserId: _remoteUserId, media, mode } = props;

  const [connected, setConnected] = useState(false);
  const [ringing, setRinging] = useState(mode === 'outgoing');
  const [accepting, setAccepting] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(media === 'video');

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const ringAudioRef = useRef<HTMLAudioElement | null>(null);

  const sm = useMemo(() => getSocketManager(), []);
  const ringTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const offerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanup = useCallback(() => {
    if (ringTimeoutRef.current) { clearTimeout(ringTimeoutRef.current); ringTimeoutRef.current = null; }
    if (offerTimeoutRef.current) { clearTimeout(offerTimeoutRef.current); offerTimeoutRef.current = null; }
    try {
      pcRef.current?.getSenders().forEach((s) => {
        try { s.track?.stop(); } catch (_) {}
      });
    } catch (_) {}
    try {
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
    } catch (_) {}
    try {
      pcRef.current?.close();
    } catch (_) {}
    pcRef.current = null;
    localStreamRef.current = null;
    remoteStreamRef.current = null;
    setConnected(false);
  }, []);

  const endCall = useCallback((reason?: string) => {
    try {
      if (!connected && mode === 'outgoing') {
        sm.cancelCall(String(conversationId), String(callId));
      } else {
        sm.endCall(String(conversationId), String(callId), reason);
      }
    } catch (_) {}
    cleanup();
    onClose();
  }, [cleanup, sm, conversationId, callId, onClose, connected, mode]);

  const initPeer = useCallback(async () => {
    const pc = new RTCPeerConnection({ iceServers: buildIceServers() });
    pcRef.current = pc;

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        sm.sendIceCandidate(String(conversationId), String(callId), e.candidate.toJSON());
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') setConnected(true);
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        endCall(pc.connectionState);
      }
      if (pc.connectionState === 'connected') {
        if (ringTimeoutRef.current) { clearTimeout(ringTimeoutRef.current); ringTimeoutRef.current = null; }
        if (offerTimeoutRef.current) { clearTimeout(offerTimeoutRef.current); offerTimeoutRef.current = null; }
      }
    };

    pc.ontrack = (e) => {
      const [stream] = e.streams;
      if (!remoteStreamRef.current) {
        remoteStreamRef.current = stream;
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    };

    // For outgoing calls, get local media immediately; for incoming, wait until accept/offer
    if (mode === 'outgoing') {
      const constraints: MediaStreamConstraints = media === 'video'
        ? { video: { width: { ideal: 1280 }, height: { ideal: 720 } }, audio: true }
        : { audio: true };
      const localStream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = localStream;
      localStream.getTracks().forEach((t) => pc.addTrack(t, localStream));
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }
    }
  }, [conversationId, callId, endCall, media, mode, sm]);

  const createAndSendOffer = useCallback(async () => {
    const pc = pcRef.current;
    if (!pc) return;
    const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: media === 'video' });
    await pc.setLocalDescription(offer);
    sm.sendOffer(String(conversationId), String(callId), offer);
  }, [media, sm, conversationId, callId]);

  const createAndSendAnswer = useCallback(async () => {
    const pc = pcRef.current;
    if (!pc) return;
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    sm.sendAnswer(String(conversationId), String(callId), answer);
  }, [sm, conversationId, callId]);

  // Incoming socket handlers
  useEffect(() => {
    if (!isOpen) return;

    const onAccepted = (data: { conversationId: string; callId: string; byUserId: string }) => {
      if (String(data.conversationId) !== String(conversationId) || String(data.callId) !== String(callId)) return;
      if (mode === 'outgoing') {
        setRinging(false);
        // Caller creates offer after callee accepts
        void createAndSendOffer();
      }
    };

    const onRejected = (data: { conversationId: string; callId: string }) => {
      if (String(data.conversationId) !== String(conversationId) || String(data.callId) !== String(callId)) return;
      endCall('rejected');
    };

    const onEnded = (data: { conversationId: string; callId: string }) => {
      if (String(data.conversationId) !== String(conversationId) || String(data.callId) !== String(callId)) return;
      endCall('ended');
    };

    const onOffer = async (data: { conversationId: string; callId: string; sdp: RTCSessionDescriptionInit }) => {
      if (String(data.conversationId) !== String(conversationId) || String(data.callId) !== String(callId)) return;
      const pc = pcRef.current;
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      // Callee responds with answer
      if (mode === 'incoming') {
        // Ensure local media only after accept
        if (!localStreamRef.current) {
          const constraints: MediaStreamConstraints = media === 'video'
            ? { video: { width: { ideal: 1280 }, height: { ideal: 720 } }, audio: true }
            : { audio: true };
          const localStream = await navigator.mediaDevices.getUserMedia(constraints);
          localStreamRef.current = localStream;
          localStream.getTracks().forEach((t) => pc.addTrack(t, localStream));
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
          }
        }
        await createAndSendAnswer();
      }
    };

    const onAnswer = async (data: { conversationId: string; callId: string; sdp: RTCSessionDescriptionInit }) => {
      if (String(data.conversationId) !== String(conversationId) || String(data.callId) !== String(callId)) return;
      const pc = pcRef.current;
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
    };

    const onIce = async (data: { conversationId: string; callId: string; candidate: RTCIceCandidateInit }) => {
      if (String(data.conversationId) !== String(conversationId) || String(data.callId) !== String(callId)) return;
      const pc = pcRef.current;
      if (!pc) return;
      try {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (_) {}
    };

    const onBusy = (data: { conversationId: string; callId: string }) => {
      if (String(data.conversationId) !== String(conversationId) || String(data.callId) !== String(callId)) return;
      endCall('busy');
    };

    const onError = (data: { conversationId?: string; callId?: string; message: string }) => {
      if (data.conversationId && String(data.conversationId) !== String(conversationId)) return;
      if (data.callId && String(data.callId) !== String(callId)) return;
      endCall('error');
    };

    sm.on('call:accepted', onAccepted as unknown as (...args: unknown[]) => void);
    sm.on('call:rejected', onRejected as unknown as (...args: unknown[]) => void);
    sm.on('call:ended', onEnded as unknown as (...args: unknown[]) => void);
    sm.on('call:offer', onOffer as unknown as (...args: unknown[]) => void);
    sm.on('call:answer', onAnswer as unknown as (...args: unknown[]) => void);
    sm.on('call:ice-candidate', onIce as unknown as (...args: unknown[]) => void);
    sm.on('call:busy', onBusy as unknown as (...args: unknown[]) => void);
    sm.on('call:error', onError as unknown as (...args: unknown[]) => void);

    return () => {
      sm.off('call:accepted', onAccepted as unknown as (...args: unknown[]) => void);
      sm.off('call:rejected', onRejected as unknown as (...args: unknown[]) => void);
      sm.off('call:ended', onEnded as unknown as (...args: unknown[]) => void);
      sm.off('call:offer', onOffer as unknown as (...args: unknown[]) => void);
      sm.off('call:answer', onAnswer as unknown as (...args: unknown[]) => void);
      sm.off('call:ice-candidate', onIce as unknown as (...args: unknown[]) => void);
      sm.off('call:busy', onBusy as unknown as (...args: unknown[]) => void);
      sm.off('call:error', onError as unknown as (...args: unknown[]) => void);
    };
  }, [isOpen, sm, conversationId, callId, createAndSendOffer, createAndSendAnswer, mode, endCall, media]);

  // Initialize on open
  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        await initPeer();
        if (mode === 'incoming') {
          // wait for caller offer, user must accept first
          setRinging(true);
        } else {
          // Outgoing: already rang via call:start; wait accept
          setRinging(true);
          // Auto-cancel if not accepted within 45s
          ringTimeoutRef.current = setTimeout(() => {
            try { sm.cancelCall(String(conversationId), String(callId)); } catch (_) {}
            endCall('no-answer');
          }, 45000);
        }
      } catch (e) {
        console.error('[VideoCallModal] init error', e);
        endCall('init-error');
      }
    })();

    return () => {
      cleanup();
    };
  }, [isOpen, initPeer, cleanup, endCall, mode, media, callId, conversationId, sm]);

  // Ringtone management
  useEffect(() => {
    if (!isOpen) return;
    // Simple beep (very short wav) loop while ringing
    if (!ringAudioRef.current) {
      ringAudioRef.current = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAABErAAABAAgAZGF0YQgAAAAA');
      ringAudioRef.current.loop = true;
      try { ringAudioRef.current.volume = 0.35; } catch (_) {}
    }
    if (ringing) {
      void ringAudioRef.current.play().catch(() => {});
    } else {
      try { ringAudioRef.current.pause(); ringAudioRef.current.currentTime = 0; } catch (_) {}
    }
    return () => {
      try { ringAudioRef.current?.pause(); } catch (_) {}
    };
  }, [isOpen, ringing]);

  const handleAccept = useCallback(async () => {
    try {
      setAccepting(true);
      sm.acceptCall(String(conversationId), String(callId));
      setRinging(false);
      // Caller will send offer; handled in onOffer
      // Start a timeout to wait for offer (20s)
      if (offerTimeoutRef.current) { clearTimeout(offerTimeoutRef.current); }
      offerTimeoutRef.current = setTimeout(() => {
        endCall('offer-timeout');
      }, 20000);
    } finally {
      setAccepting(false);
    }
  }, [sm, conversationId, callId, endCall]);

  const handleReject = useCallback(() => {
    try {
      sm.rejectCall(String(conversationId), String(callId));
    } finally {
      endCall('rejected');
    }
  }, [sm, conversationId, callId, endCall]);

  const toggleMic = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const track = stream.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setMicOn(track.enabled);
    }
  }, []);

  const toggleCam = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setCamOn(track.enabled);
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60">
      <div className="w-full max-w-4xl mx-3 rounded-2xl overflow-hidden bg-gray-900 text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-800/80">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${connected ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`} />
            <div className="text-sm font-semibold">
              {media === 'video' ? 'مكالمة فيديو' : 'مكالمة صوتية'}
            </div>
          </div>
          <button
            onClick={() => endCall('hangup')}
            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-sm"
            title="إنهاء المكالمة"
          >إنهاء</button>
        </div>

        {/* Body */}
        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-2 p-2 md:p-3 min-h-[50vh] bg-black">
          {/* Remote */}
          <div className="relative rounded-xl overflow-hidden bg-gray-800">
            {media === 'video' ? (
              <video ref={remoteVideoRef} className="w-full h-full object-cover" autoPlay playsInline />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">المستلم</div>
            )}
            {ringing && mode === 'outgoing' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-sm">جارٍ الاتصال...</div>
            )}
          </div>
          {/* Local */}
          <div className="relative rounded-xl overflow-hidden bg-gray-800">
            {media === 'video' ? (
              <video ref={localVideoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">أنت</div>
            )}
            {mode === 'incoming' && ringing && (
              <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/50">
                <button
                  onClick={handleAccept}
                  disabled={accepting}
                  className="px-5 py-2 rounded-full bg-green-600 hover:bg-green-700 text-white shadow"
                >قبول</button>
                <button
                  onClick={handleReject}
                  className="px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white shadow"
                >رفض</button>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 px-4 py-3 bg-gray-800/80">
          <button onClick={toggleMic} className={`px-4 py-2 rounded-full ${micOn ? 'bg-gray-700' : 'bg-gray-600/60'} hover:bg-gray-700`}>{micOn ? 'كتم الميكروفون' : 'تشغيل الميكروفون'}</button>
          {media === 'video' && (
            <button onClick={toggleCam} className={`px-4 py-2 rounded-full ${camOn ? 'bg-gray-700' : 'bg-gray-600/60'} hover:bg-gray-700`}>{camOn ? 'إيقاف الكاميرا' : 'تشغيل الكاميرا'}</button>
          )}
        </div>
      </div>
    </div>
  );
}
