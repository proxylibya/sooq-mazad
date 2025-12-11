import { useState, useRef } from 'react';
import {
  VideoCameraIcon,
  XMarkIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from '@heroicons/react/24/outline';

const ACCEPTED_FORMATS = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
const MAX_FILE_SIZE = 100 * 1024 * 1024;

export default function AdVideoUpload({ value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [video, setVideo] = useState(value || null);
  const [dragOver, setDragOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  const [videoSettings, setVideoSettings] = useState({
    autoplay: value?.autoplay || false,
    muted: value?.muted !== undefined ? value.muted : true,
    loop: value?.loop || false,
  });

  const handleFileSelect = (files) => {
    const file = files[0];
    
    if (!file) return;

    if (!ACCEPTED_FORMATS.includes(file.type)) {
      alert(`الصيغة غير مدعومة: ${file.name}\nالصيغ المدعومة: MP4, WEBM, MOV`);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      alert(`حجم الملف كبير جداً: ${(file.size / 1024 / 1024).toFixed(2)} MB\n(الحد الأقصى 100 MB)`);
      return;
    }

    uploadVideo(file);
  };

  const uploadVideo = async (file) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('video', file);
      formData.append('category', 'ads');
      formData.append('generateThumbnail', 'true');

      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const result = JSON.parse(xhr.responseText);
          
          const videoData = {
            url: result.url,
            thumbnailUrl: result.thumbnailUrl,
            filename: result.filename,
            duration: result.duration,
            width: result.width,
            height: result.height,
            size: result.size,
            format: result.format,
            ...videoSettings,
          };
          
          setVideo(videoData);
          onChange(videoData);
          setUploadProgress(100);
        } else {
          alert('فشل رفع الفيديو');
        }
        setUploading(false);
      };

      xhr.onerror = () => {
        alert('حدث خطأ أثناء الرفع');
        setUploading(false);
      };

      xhr.open('POST', '/api/admin/ad-placements/upload-video');
      xhr.send(formData);
    } catch (error) {
      console.error('Upload error:', error);
      alert('حدث خطأ أثناء الرفع');
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleRemove = () => {
    setVideo(null);
    onChange(null);
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const updateVideoSettings = (key, value) => {
    const newSettings = { ...videoSettings, [key]: value };
    setVideoSettings(newSettings);
    
    if (video) {
      const updatedVideo = { ...video, ...newSettings };
      setVideo(updatedVideo);
      onChange(updatedVideo);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (video) {
    return (
      <div className="space-y-4">
        <label className="block text-sm font-medium text-slate-300">الفيديو</label>
        
        <div className="group relative overflow-hidden rounded-lg border border-slate-700 bg-slate-800">
          <div className="relative aspect-video">
            <video
              ref={videoRef}
              src={video.url}
              className="h-full w-full object-contain"
              muted={isMuted}
              loop={videoSettings.loop}
              onEnded={() => setIsPlaying(false)}
            />
            
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={togglePlay}
                className="rounded-full bg-white/20 p-4 text-white backdrop-blur-sm transition-all hover:bg-white/30"
              >
                {isPlaying ? (
                  <PauseIcon className="h-8 w-8" />
                ) : (
                  <PlayIcon className="h-8 w-8" />
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={handleRemove}
              className="absolute left-2 top-2 rounded-full bg-red-500 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={toggleMute}
              className="absolute bottom-2 left-2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm"
            >
              {isMuted ? (
                <SpeakerXMarkIcon className="h-5 w-5" />
              ) : (
                <SpeakerWaveIcon className="h-5 w-5" />
              )}
            </button>

            <div className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs text-white backdrop-blur-sm">
              {formatDuration(video.duration)}
            </div>
          </div>

          <div className="border-t border-slate-700 p-4">
            <div className="grid gap-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">الحجم:</span>
                <span className="text-white">
                  {video.width} × {video.height}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">حجم الملف:</span>
                <span className="text-white">
                  {(video.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
          <h3 className="mb-3 text-sm font-bold text-white">إعدادات التشغيل</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm text-slate-300">تشغيل تلقائي</span>
              <input
                type="checkbox"
                checked={videoSettings.autoplay}
                onChange={(e) => updateVideoSettings('autoplay', e.target.checked)}
                className="h-4 w-4 rounded border-slate-600"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-slate-300">كتم الصوت</span>
              <input
                type="checkbox"
                checked={videoSettings.muted}
                onChange={(e) => updateVideoSettings('muted', e.target.checked)}
                className="h-4 w-4 rounded border-slate-600"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-slate-300">تكرار</span>
              <input
                type="checkbox"
                checked={videoSettings.loop}
                onChange={(e) => updateVideoSettings('loop', e.target.checked)}
                className="h-4 w-4 rounded border-slate-600"
              />
            </label>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-300">الفيديو</label>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative overflow-hidden rounded-lg border-2 border-dashed transition-colors ${
          dragOver
            ? 'border-amber-500 bg-amber-500/10'
            : 'border-slate-600 bg-slate-700/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_FORMATS.join(',')}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center justify-center gap-3 p-12">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
            <p className="text-sm font-medium text-amber-500">
              جاري رفع الفيديو... {uploadProgress}%
            </p>
            <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-slate-700">
              <div
                className="h-full bg-amber-500 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-3 p-12 text-center transition-colors hover:bg-slate-700/30"
          >
            {dragOver ? (
              <>
                <ArrowUpTrayIcon className="h-16 w-16 text-amber-500" />
                <p className="text-sm font-medium text-amber-500">اترك الملف هنا</p>
              </>
            ) : (
              <>
                <VideoCameraIcon className="h-16 w-16 text-slate-400" />
                <p className="text-sm font-medium text-white">
                  اضغط لاختيار فيديو أو اسحب الملف هنا
                </p>
                <p className="text-xs text-slate-400">
                  MP4, WEBM, MOV (الحد الأقصى 100 MB)
                </p>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
