import React, { useState, useRef, useEffect } from 'react';
import MicrophoneIcon from '@heroicons/react/24/outline/MicrophoneIcon';
import StopIcon from '@heroicons/react/24/outline/StopIcon';
import PlayIcon from '@heroicons/react/24/outline/PlayIcon';
import PauseIcon from '@heroicons/react/24/outline/PauseIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import PaperAirplaneIcon from '@heroicons/react/24/outline/PaperAirplaneIcon';
import SpeakerWaveIcon from '@heroicons/react/24/outline/SpeakerWaveIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import { MicrophoneIcon as MicrophoneSolid } from '@heroicons/react/24/solid';

interface VoiceRecorderProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (audioBlob: Blob, duration: number, audioUrl?: string) => void;
  quality?: 'low' | 'medium' | 'high';
  format?: 'webm' | 'mp4' | 'wav';
  maxDuration?: number; // بالثواني
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  isOpen,
  onClose,
  onSend,
  quality = 'medium',
  format = 'webm',
  maxDuration = 300, // 5 دقائق افتراضياً
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingQuality, setRecordingQuality] = useState(quality);
  const [compressionLevel, setCompressionLevel] = useState<number>(0.8);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout>();
  const playbackTimerRef = useRef<NodeJS.Timeout>();
  const chunksRef = useRef<Blob[]>([]);

  // الحصول على إعدادات الجودة
  const getAudioConstraints = () => {
    const constraints: MediaTrackConstraints = {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    };

    switch (recordingQuality) {
      case 'high':
        return {
          ...constraints,
          sampleRate: 48000,
          channelCount: 2,
        };
      case 'medium':
        return {
          ...constraints,
          sampleRate: 44100,
          channelCount: 1,
        };
      case 'low':
        return {
          ...constraints,
          sampleRate: 22050,
          channelCount: 1,
        };
      default:
        return constraints;
    }
  };

  // الحصول على إعدادات MediaRecorder
  const getRecorderOptions = () => {
    const mimeType = `audio/${format}`;

    // التحقق من دعم النوع
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return { mimeType };
    }

    // البحث عن نوع مدعوم
    const supportedTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/wav'];

    for (const type of supportedTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        return { mimeType: type };
      }
    }

    return {}; // استخدام الافتراضي
  };

  // بدء التسجيل
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: getAudioConstraints(),
      });

      const recorderOptions = getRecorderOptions();
      const mediaRecorder = new MediaRecorder(stream, recorderOptions);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = recorderOptions.mimeType || 'audio/wav';
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setDuration(recordingTime);

        // إيقاف جميع المسارات
        stream.getTracks().forEach((track) => track.stop());

        console.log(`تم التسجيل: ${recordingTime}ث، الحجم: ${(blob.size / 1024).toFixed(2)}KB`);
      };

      mediaRecorder.onerror = (event) => {
        console.error('خطأ في MediaRecorder:', event);
        stopRecording();
      };

      mediaRecorder.start(1000); // حفظ البيانات كل ثانية
      setIsRecording(true);
      setRecordingTime(0);

      // بدء عداد التسجيل
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1;

          // إيقاف التسجيل عند الوصول للحد الأقصى
          if (newTime >= maxDuration) {
            stopRecording();
          }

          return newTime;
        });
      }, 1000);
    } catch (error) {
      console.error('خطأ في الوصول للميكروفون:', error);
      alert('لا يمكن الوصول للميكروفون. تأكد من السماح بالوصول للميكروفون.');
    }
  };

  // إيقاف التسجيل
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  // تشغيل التسجيل
  const playRecording = () => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
      setPlaybackTime(0);

      // عداد التشغيل
      playbackTimerRef.current = setInterval(() => {
        if (audioRef.current) {
          setPlaybackTime(audioRef.current.currentTime);
        }
      }, 100);
    }
  };

  // إيقاف التشغيل
  const pauseRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);

      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
      }
    }
  };

  // حذف التسجيل
  const deleteRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setPlaybackTime(0);
    setDuration(0);
    setIsPlaying(false);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  // ضغط الصوت (محاكاة)
  const compressAudio = async (blob: Blob): Promise<Blob> => {
    // في التطبيق الحقيقي، يمكن استخدام مكتبة لضغط الصوت
    // هنا سنقوم بمحاكاة الضغط

    if (compressionLevel >= 1.0) {
      return blob; // لا ضغط
    }

    try {
      // محاكاة ضغط بسيط عن طريق تقليل جودة البيانات
      const arrayBuffer = await blob.arrayBuffer();
      const compressedSize = Math.floor(arrayBuffer.byteLength * compressionLevel);
      const compressedBuffer = arrayBuffer.slice(0, compressedSize);

      console.log(
        `ضغط الصوت: ${(arrayBuffer.byteLength / 1024).toFixed(2)}KB → ${(compressedBuffer.byteLength / 1024).toFixed(2)}KB`,
      );

      return new Blob([compressedBuffer], { type: blob.type });
    } catch (error) {
      console.error('خطأ في ضغط الصوت:', error);
      return blob; // إرجاع الأصلي في حالة الخطأ
    }
  };

  // إرسال التسجيل
  const sendRecording = async () => {
    if (audioBlob) {
      try {
        // ضغط الصوت إذا كان مطلوباً
        const finalBlob = compressionLevel < 1.0 ? await compressAudio(audioBlob) : audioBlob;

        // إرسال التسجيل مع URL للمعاينة
        onSend(finalBlob, duration, audioUrl || undefined);

        console.log(
          `تم إرسال التسجيل: ${duration}ث، الحجم: ${(finalBlob.size / 1024).toFixed(2)}KB`,
        );

        onClose();
        deleteRecording();
      } catch (error) {
        console.error('خطأ في إرسال التسجيل:', error);
        alert('فشل في إرسال التسجيل الصوتي');
      }
    }
  };

  // تنسيق الوقت
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // تنظيف الموارد
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // معالج انتهاء التشغيل
  const handleAudioEnded = () => {
    setIsPlaying(false);
    setPlaybackTime(0);
    if (playbackTimerRef.current) {
      clearInterval(playbackTimerRef.current);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">تسجيل رسالة صوتية</h3>
            <button
              onClick={onClose}
              className="text-gray-400 transition-colors hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Recording Interface */}
        <div className="p-6">
          {/* Quality Settings */}
          {!isRecording && !audioBlob && (
            <div className="mb-4 rounded-lg bg-gray-50 p-4">
              <h4 className="mb-3 text-sm font-medium text-gray-700">إعدادات الجودة</h4>

              {/* Quality Selection */}
              <div className="mb-3">
                <label className="mb-2 block text-xs text-gray-600">جودة التسجيل</label>
                <select
                  value={recordingQuality}
                  onChange={(e) => setRecordingQuality(e.target.value as 'low' | 'medium' | 'high')}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="low">منخفضة (22kHz)</option>
                  <option value="medium">متوسطة (44kHz)</option>
                  <option value="high">عالية (48kHz)</option>
                </select>
              </div>

              {/* Compression Level */}
              <div className="mb-3">
                <label className="mb-2 block text-xs text-gray-600">
                  مستوى الضغط: {Math.round((1 - compressionLevel) * 100)}%
                </label>
                <input
                  type="range"
                  min="0.3"
                  max="1.0"
                  step="0.1"
                  value={compressionLevel}
                  onChange={(e) => setCompressionLevel(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Max Duration Info */}
              <div>
                <div className="text-xs text-gray-500">
                  الحد الأقصى: {Math.floor(maxDuration / 60)}:
                  {(maxDuration % 60).toString().padStart(2, '0')} | الجودة: {recordingQuality} |
                  التنسيق: {format}
                </div>
              </div>
            </div>
          )}

          {/* Recording Status */}
          <div className="mb-6 text-center">
            {isRecording ? (
              <div className="flex flex-col items-center">
                <div className="mb-4 flex h-20 w-20 animate-pulse items-center justify-center rounded-full bg-red-500">
                  <MicrophoneSolid className="h-10 w-10 text-white" />
                </div>
                <p className="font-semibold text-red-600">جاري التسجيل...</p>
                <p className="mt-2 font-mono text-2xl text-gray-900">{formatTime(recordingTime)}</p>
              </div>
            ) : audioBlob ? (
              <div className="flex flex-col items-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-500">
                  <SpeakerWaveIcon className="h-10 w-10 text-white" />
                </div>
                <p className="font-semibold text-green-600">تم التسجيل بنجاح</p>
                <p className="mt-2 text-lg text-gray-700">المدة: {formatTime(duration)}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-300">
                  <MicrophoneIcon className="h-10 w-10 text-gray-600" />
                </div>
                <p className="text-gray-600">اضغط لبدء التسجيل</p>
              </div>
            )}
          </div>

          {/* Audio Element */}
          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={handleAudioEnded}
              onLoadedMetadata={() => {
                if (audioRef.current) {
                  setDuration(audioRef.current.duration);
                }
              }}
            />
          )}

          {/* Playback Controls */}
          {audioBlob && (
            <div className="mb-6">
              <div className="mb-4 flex items-center justify-center gap-4">
                <button
                  onClick={isPlaying ? pauseRecording : playRecording}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white transition-colors hover:bg-blue-600"
                >
                  {isPlaying ? (
                    <PauseIcon className="h-6 w-6" />
                  ) : (
                    <PlayIcon className="mr-1 h-6 w-6" />
                  )}
                </button>

                <div className="mx-4 flex-1">
                  <div className="relative h-2 rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-blue-500 transition-all duration-100"
                      style={{
                        width: `${duration > 0 ? (playbackTime / duration) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-gray-500">
                    <span>{formatTime(playbackTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
              </div>

              {/* Volume Control */}
              <div className="mb-4 flex items-center gap-2">
                <SpeakerWaveIcon className="h-4 w-4 text-gray-500" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => {
                    const newVolume = parseFloat(e.target.value);
                    setVolume(newVolume);
                    if (audioRef.current) {
                      audioRef.current.volume = newVolume;
                    }
                  }}
                  className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-gray-200"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!isRecording && !audioBlob && (
              <button
                onClick={startRecording}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-3 text-white transition-colors hover:bg-red-600"
              >
                <MicrophoneIcon className="h-5 w-5" />
                بدء التسجيل
              </button>
            )}

            {isRecording && (
              <button
                onClick={stopRecording}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-600 px-4 py-3 text-white transition-colors hover:bg-gray-700"
              >
                <StopIcon className="h-5 w-5" />
                إيقاف التسجيل
              </button>
            )}

            {audioBlob && (
              <>
                <button
                  onClick={deleteRecording}
                  className="flex items-center justify-center rounded-lg bg-red-500 px-4 py-3 text-white transition-colors hover:bg-red-600"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>

                <button
                  onClick={sendRecording}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-3 text-white transition-colors hover:bg-green-600"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                  إرسال
                </button>
              </>
            )}
          </div>

          {/* Tips */}
          <div className="mt-4 text-center text-xs text-gray-500">
            <p>نصيحة: تحدث بوضوح وتأكد من وجودك في مكان هادئ للحصول على أفضل جودة صوت</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceRecorder;
