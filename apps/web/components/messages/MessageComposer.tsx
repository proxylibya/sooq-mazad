import {
  UPLOAD_CONFIG,
  getErrorMessage,
  isValidFileSize,
  isValidFileType,
} from '@/utils/uploadConfig';
import ChatBubbleLeftRightIcon from '@heroicons/react/24/outline/ChatBubbleLeftRightIcon';
import EllipsisVerticalIcon from '@heroicons/react/24/outline/EllipsisVerticalIcon';
import FaceSmileIcon from '@heroicons/react/24/outline/FaceSmileIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import MicrophoneIcon from '@heroicons/react/24/outline/MicrophoneIcon';
import PhotoIcon from '@heroicons/react/24/outline/PhotoIcon';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export type ComposerMessage = {
  id: string;
  senderId: string;
  type: 'text' | 'image' | 'location' | 'voice' | 'file';
  content: string;
  createdAt: string;
  status?: 'sent' | 'delivered' | 'read';
  imageUrl?: string;
  fileUrl?: string;
  fileName?: string;
  conversationId?: string; // معرف المحادثة الحقيقي (مهم عند تحويل محادثة مؤقتة لحقيقية)
};

interface MessageComposerProps {
  currentUserId: string;
  conversationId: string;
  getToken?: () => string | undefined;
  onMessageAdd?: (msg: ComposerMessage) => void;
  onConversationIdChange?: (oldId: string, newId: string) => void; // عند تحويل محادثة مؤقتة لحقيقية
  className?: string;
  disabled?: boolean;
  minimal?: boolean; // إخفاء رفع الملفات والخيارات الإضافية
  enableLocation?: boolean; // تفعيل زر إرسال الموقع
  onTypingChange?: (typing: boolean) => void;
  enableEmoji?: boolean; // تعطيل/تفعيل الإيموجي (افتراضياً معطّل احتراماً لسياسة عدم استخدام الإيموجي)
}

export function MessageComposer({
  currentUserId,
  conversationId,
  getToken,
  onMessageAdd,
  onConversationIdChange,
  className = '',
  disabled = false,
  minimal = false,
  enableLocation = false,
  onTypingChange,
  enableEmoji = false,
}: MessageComposerProps) {
  const [text, setText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dropRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const actionsMenuRef = useRef<HTMLDivElement | null>(null);
  const menuDropdownRef = useRef<HTMLDivElement | null>(null);
  const [menuPosition, setMenuPosition] = useState<'top' | 'bottom'>('top');

  const canSend = !disabled && text.trim().length > 0 && !isUploading && !isRecording;

  // Development-only logger to reduce console noise in production
  const devLog = (...args: unknown[]) => {
    if (process.env.NODE_ENV !== 'production') console.log(...args);
  };

  const resetUpload = () => {
    setIsUploading(false);
    setUploadProgress(0);
  };

  const handleSendText = useCallback(async () => {
    if (!canSend) return;

    // 🔍 تشخيص: التحقق من conversationId
    if (!conversationId || conversationId === '') {
      setError('خطأ: لا يوجد محادثة مفتوحة. يرجى اختيار محادثة أولاً.');
      console.error('[MessageComposer] conversationId مفقود أو فارغ');
      return;
    }

    try {
      const token = getToken?.();

      // 🔍 تشخيص: طباعة البيانات المُرسلة
      devLog('[MessageComposer] إرسال رسالة:', {
        senderId: currentUserId,
        conversationId,
        contentLength: text.trim().length,
        type: 'TEXT',
      });

      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          senderId: currentUserId,
          conversationId,
          content: text.trim(),
          type: 'TEXT',
        }),
      });

      const data = await res.json();

      // 🔍 تشخيص: طباعة الاستجابة
      devLog('[MessageComposer] استجابة API:', {
        success: data?.success,
        messageId: data?.data?.id,
        error: data?.error,
        status: res.status,
      });

      if (data?.success) {
        // 🆕 التحقق من تغيير معرف المحادثة (من مؤقت لحقيقي)
        const realConversationId = data.data?.conversationId;
        if (realConversationId && String(realConversationId) !== String(conversationId)) {
          devLog(
            '[MessageComposer] تحويل المحادثة من مؤقتة لحقيقية:',
            conversationId,
            '->',
            realConversationId,
          );
          onConversationIdChange?.(String(conversationId), String(realConversationId));
        }

        // ✅ إضافة الرسالة مباشرة للواجهة (لا ننتظر Socket لأنه قد يكون غير متصل)
        const newMsg: ComposerMessage = {
          id: String(data.data?.id || Date.now()),
          senderId: String(currentUserId),
          type: 'text',
          content: text.trim(),
          createdAt: new Date().toISOString(),
          status: 'sent',
          conversationId: realConversationId || conversationId, // معرف المحادثة الحقيقي
        };
        onMessageAdd?.(newMsg);
        setText('');
        setError(null);
        devLog('[MessageComposer] تم إرسال الرسالة وإضافتها للواجهة:', data.data?.id);
      } else {
        const errorMsg = data?.error || 'فشل في إرسال الرسالة';
        setError(errorMsg);
        console.error('[MessageComposer] فشل الإرسال:', errorMsg, data);
      }
    } catch (e) {
      const errorMsg = 'خطأ في الاتصال بالخادم';
      setError(errorMsg);
      console.error('[MessageComposer] خطأ في الشبكة:', e);
    }
  }, [
    canSend,
    conversationId,
    currentUserId,
    getToken,
    text,
    onMessageAdd,
    onConversationIdChange,
  ]);

  const handleSendLocation = useCallback(async () => {
    try {
      if (disabled || isUploading || isLocating) return;
      setIsLocating(true);

      const getPosition = (): Promise<GeolocationPosition> =>
        new Promise((resolve, reject) => {
          if (!navigator.geolocation) return reject(new Error('المتصفح لا يدعم تحديد الموقع'));
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          });
        });

      const pos = await getPosition();
      const lat = Number(pos.coords.latitude);
      const lng = Number(pos.coords.longitude);
      let address = `الموقع: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;

      // محاولة جلب عنوان مقروء بدون مفاتيح API (Nominatim)
      try {
        const r = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
          { headers: { 'Accept-Language': 'ar' } },
        );
        if (r.ok) {
          const j = await r.json();
          if (j?.display_name) address = String(j.display_name);
        }
      } catch (_) {
        // تجاهل الأخطاء واستخدم العنوان الافتراضي
      }

      const payload = { lat, lng, address };

      devLog('[MessageComposer] إرسال موقع:', {
        conversationId,
        payload,
        type: 'LOCATION',
      });

      const token = getToken?.();
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          senderId: currentUserId,
          conversationId,
          content: JSON.stringify(payload),
          type: 'LOCATION',
        }),
      });
      const data = await res.json();

      devLog('[MessageComposer] استجابة إرسال موقع:', {
        success: data?.success,
        messageId: data?.data?.id,
        error: data?.error,
      });

      if (data?.success) {
        const newMsg: ComposerMessage = {
          id: String(data.data?.id || Date.now()),
          senderId: String(currentUserId),
          type: 'location',
          content: JSON.stringify(payload),
          createdAt: new Date().toISOString(),
          status: 'sent',
        };
        onMessageAdd?.(newMsg);
        setError(null);
      } else {
        setError(data?.error || 'فشل في إرسال الموقع');
      }
    } catch (e) {
      setError('تعذر الحصول على الموقع');
    } finally {
      setIsLocating(false);
    }
  }, [conversationId, currentUserId, disabled, getToken, isLocating, isUploading, onMessageAdd]);

  const handleUploadImage = useCallback(
    async (file: File) => {
      setError(null);

      if (!file) return;
      if (!isValidFileType(file.type)) {
        setError(UPLOAD_CONFIG.ERROR_MESSAGES.INVALID_TYPE);
        return;
      }
      if (!isValidFileSize(file.size)) {
        setError(
          file.size > UPLOAD_CONFIG.MAX_FILE_SIZE
            ? UPLOAD_CONFIG.ERROR_MESSAGES.FILE_TOO_LARGE
            : UPLOAD_CONFIG.ERROR_MESSAGES.FILE_TOO_SMALL,
        );
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);

      try {
        const token = getToken?.();
        const form = new FormData();
        form.append('image', file);
        form.append('userId', String(currentUserId));
        form.append('conversationId', String(conversationId));

        // Use XHR for progress tracking
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', '/api/messages/upload-image');
          if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const percent = Math.round((e.loaded / e.total) * 100);
              setUploadProgress(percent);
            }
          };

          xhr.onload = () => {
            try {
              const resp = JSON.parse(xhr.responseText || '{}');
              if (xhr.status >= 200 && xhr.status < 300 && resp?.success) {
                const fileUrl: string = resp?.data?.fileUrl;
                const id: string = String(resp?.data?.messageId || Date.now());
                const msg: ComposerMessage = {
                  id,
                  senderId: String(currentUserId),
                  type: 'image',
                  content: fileUrl,
                  imageUrl: fileUrl,
                  createdAt: new Date().toISOString(),
                  status: 'sent',
                };
                onMessageAdd?.(msg);
                resolve();
              } else {
                setError(resp?.message || 'فشل في رفع الصورة');
                reject(new Error(resp?.message || 'Upload failed'));
              }
            } catch (err) {
              setError('فشل في معالجة استجابة الخادم');
              reject(err);
            }
          };

          xhr.onerror = () => {
            setError('خطأ أثناء رفع الصورة');
            reject(new Error('Network error'));
          };

          xhr.send(form);
        });
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        resetUpload();
      }
    },
    [conversationId, currentUserId, getToken, onMessageAdd],
  );

  // Drag & Drop events
  useEffect(() => {
    if (minimal) return; // في الوضع المصغر لا ندعم السحب والإفلات
    const el = dropRef.current;
    if (!el) return;

    const onDragOver = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
    };
    const onDragLeave = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
    };
    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (!e.dataTransfer || !e.dataTransfer.files?.length) return;
      const file = e.dataTransfer.files[0];
      void handleUploadImage(file);
    };

    el.addEventListener('dragover', onDragOver);
    el.addEventListener('dragleave', onDragLeave);
    el.addEventListener('drop', onDrop);
    return () => {
      el.removeEventListener('dragover', onDragOver);
      el.removeEventListener('dragleave', onDragLeave);
      el.removeEventListener('drop', onDrop);
    };
  }, [handleUploadImage, minimal]);

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (f) void handleUploadImage(f);
  };

  const handleRecordVoice = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('المتصفح لا يدعم تسجيل الصوت');
      return;
    }

    if (isRecording) {
      // إيقاف التسجيل
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());

        // رفع الملف الصوتي
        const file = new File([audioBlob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
        await handleUploadFile(file, 'voice');
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      setError('فشل الوصول إلى الميكروفون');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording]);

  const handleUploadFile = useCallback(
    async (file: File, type: 'file' | 'voice' = 'file') => {
      setError(null);
      if (!file) return;

      setIsUploading(true);
      setUploadProgress(0);

      try {
        const token = getToken?.();
        const form = new FormData();
        form.append('file', file);
        form.append('userId', String(currentUserId));
        form.append('conversationId', String(conversationId));
        form.append('type', type);

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', '/api/messages/upload-file');
          if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const percent = Math.round((e.loaded / e.total) * 100);
              setUploadProgress(percent);
            }
          };

          xhr.onload = () => {
            try {
              const resp = JSON.parse(xhr.responseText || '{}');
              if (xhr.status >= 200 && xhr.status < 300 && resp?.success) {
                const fileUrl: string = resp?.data?.fileUrl;
                const id: string = String(resp?.data?.messageId || Date.now());
                const msg: ComposerMessage = {
                  id,
                  senderId: String(currentUserId),
                  type: type,
                  content: fileUrl,
                  fileUrl: fileUrl,
                  fileName: file.name,
                  createdAt: new Date().toISOString(),
                  status: 'sent',
                };
                onMessageAdd?.(msg);
                resolve();
              } else {
                setError(resp?.message || 'فشل في رفع الملف');
                reject(new Error(resp?.message || 'Upload failed'));
              }
            } catch (err) {
              setError('فشل في معالجة استجابة الخادم');
              reject(err);
            }
          };

          xhr.onerror = () => {
            setError('خطأ أثناء رفع الملف');
            reject(new Error('Network error'));
          };

          xhr.send(form);
        });
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        resetUpload();
      }
    },
    [conversationId, currentUserId, getToken, onMessageAdd],
  );

  const insertEmoji = (emoji: string) => {
    if (!enableEmoji) return;
    setText((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };
  // قائمة الإيموجي مفعلة فقط عند السماح بها صراحةً
  const commonEmojis = enableEmoji ? ['🙂', '😉', '👌', '✅'] : [];

  // حساب موضع القائمة وإغلاقها عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      // تحقق من أن النقر ليس على الزر ولا على القائمة
      const clickedButton = actionsMenuRef.current && actionsMenuRef.current.contains(target);
      const clickedMenu = menuDropdownRef.current && menuDropdownRef.current.contains(target);

      if (!clickedButton && !clickedMenu) {
        devLog('[MessageComposer] نقر خارج القائمة - إغلاق');
        setShowActionsMenu(false);
      }
    };

    if (showActionsMenu) {
      // حساب موضع القائمة لتجنب الخروج من حافة الشاشة
      if (actionsMenuRef.current) {
        const rect = actionsMenuRef.current.getBoundingClientRect();
        const spaceAbove = rect.top;
        const spaceBelow = window.innerHeight - rect.bottom;
        const menuHeight = 250; // الارتفاع التقريبي للقائمة

        // على الشاشات الصغيرة (<= 800px) اجعل القائمة دائماً للأعلى لعدم القص
        if (window.innerWidth <= 800) {
          setMenuPosition('top'); // يظهر فوق الزر
        } else {
          // اختر الجانب ذو المساحة الأكبر
          if (spaceBelow < menuHeight && spaceAbove >= spaceBelow) {
            setMenuPosition('top');
          } else {
            setMenuPosition('bottom');
          }
        }
      }

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showActionsMenu]);

  return (
    <div className={className} ref={dropRef}>
      {error && (
        <div className="mb-2 rounded-md bg-red-50 p-2 text-xs text-red-700">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-600 hover:underline">
              اغلاق
            </button>
          </div>
        </div>
      )}

      {enableEmoji && showEmojiPicker && (
        <div className="mb-2 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
          <div className="flex flex-wrap gap-2">
            {commonEmojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => insertEmoji(emoji)}
                className="text-2xl transition-transform hover:scale-125"
                type="button"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      <div
        className={`relative flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white p-2 shadow-sm ${
          !minimal && isDragging ? 'ring-2 ring-blue-400' : ''
        }`}
      >
        {/* أزرار الوظائف - تظهر مباشرة في الشاشات > 800px */}
        <div className="hidden items-center gap-0.5 min-[801px]:flex">
          <label
            className="flex cursor-pointer items-center justify-center rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50 active:scale-95"
            title="إرفاق صورة"
          >
            <PhotoIcon className="h-5 w-5" />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileInputChange}
              disabled={disabled || isUploading || isRecording}
            />
          </label>

          <button
            type="button"
            onClick={() => void handleRecordVoice()}
            disabled={disabled || isUploading}
            className={`flex items-center justify-center rounded-lg p-2 transition-colors active:scale-95 ${
              isRecording
                ? 'animate-pulse bg-red-100 text-red-600'
                : 'text-green-600 hover:bg-green-50'
            }`}
            title={isRecording ? 'إيقاف التسجيل' : 'تسجيل رسالة صوتية'}
          >
            <MicrophoneIcon className="h-5 w-5" />
          </button>

          {enableLocation && (
            <button
              type="button"
              onClick={() => void handleSendLocation()}
              disabled={disabled || isUploading || isLocating}
              className={`flex items-center justify-center rounded-lg p-2 transition-colors active:scale-95 ${
                isLocating
                  ? 'animate-pulse bg-blue-100 text-blue-600'
                  : 'text-blue-600 hover:bg-blue-50'
              }`}
              title="إرسال الموقع"
            >
              <MapPinIcon className="h-5 w-5" />
            </button>
          )}

          {enableEmoji && (
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              disabled={disabled || isUploading || isRecording}
              className="flex items-center justify-center rounded-lg p-2 text-yellow-600 transition-colors hover:bg-yellow-50 active:scale-95"
              title="إضافة رموز تعبيرية"
            >
              <FaceSmileIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* قائمة منسدلة للأزرار - تظهر في الشاشات <= 800px */}
        <div className="relative flex items-center min-[801px]:hidden" ref={actionsMenuRef}>
          <button
            type="button"
            onClick={() => {
              const newState = !showActionsMenu;
              devLog('[MessageComposer] تبديل القائمة:', newState);
              setShowActionsMenu(newState);
            }}
            disabled={disabled || isUploading}
            className="flex items-center justify-center rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-50 active:scale-95"
            title="المزيد من الخيارات"
          >
            <EllipsisVerticalIcon className="h-5 w-5" />
          </button>

          {showActionsMenu &&
            typeof window !== 'undefined' &&
            createPortal(
              <div
                ref={menuDropdownRef}
                className="fixed z-[99999] min-w-[220px] rounded-lg border border-gray-300 bg-white shadow-2xl"
                style={{
                  left: actionsMenuRef.current
                    ? `${actionsMenuRef.current.getBoundingClientRect().right - 220}px`
                    : '0',
                  top:
                    actionsMenuRef.current && menuPosition !== 'top'
                      ? `${actionsMenuRef.current.getBoundingClientRect().bottom + 8}px`
                      : 'auto',
                  bottom:
                    actionsMenuRef.current && menuPosition === 'top'
                      ? `${window.innerHeight - actionsMenuRef.current.getBoundingClientRect().top + 8}px`
                      : 'auto',
                  boxShadow:
                    '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
                  pointerEvents: 'auto',
                }}
              >
                <div className="max-h-[300px] overflow-y-auto py-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      devLog('[MessageComposer] نقر على: إرفاق صورة');
                      devLog('[MessageComposer] فتح نافذة اختيار الملف...');
                      fileInputRef.current?.click();
                      setShowActionsMenu(false);
                    }}
                    disabled={disabled || isUploading || isRecording}
                    className="flex w-full items-center gap-3 px-4 py-3 text-right text-sm text-gray-700 transition-colors hover:bg-blue-50 active:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <PhotoIcon className="h-6 w-6 flex-shrink-0 text-blue-600" />
                    <span className="font-medium">إرفاق صورة</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      devLog('[MessageComposer] نقر على: تسجيل صوتي');
                      void handleRecordVoice();
                      setShowActionsMenu(false);
                    }}
                    disabled={disabled || isUploading}
                    className="flex w-full items-center gap-3 px-4 py-3 text-right text-sm text-gray-700 transition-colors hover:bg-green-50 active:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <MicrophoneIcon
                      className={`h-6 w-6 flex-shrink-0 ${isRecording ? 'text-red-600' : 'text-green-600'}`}
                    />
                    <span className="font-medium">
                      {isRecording ? 'إيقاف التسجيل' : 'تسجيل صوتي'}
                    </span>
                  </button>

                  {enableLocation && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        devLog('[MessageComposer] نقر على: إرسال الموقع');
                        void handleSendLocation();
                        setShowActionsMenu(false);
                      }}
                      disabled={disabled || isUploading || isLocating}
                      className="flex w-full items-center gap-3 px-4 py-3 text-right text-sm text-gray-700 transition-colors hover:bg-purple-50 active:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <MapPinIcon
                        className={`h-6 w-6 flex-shrink-0 ${isLocating ? 'animate-pulse text-blue-400' : 'text-purple-600'}`}
                      />
                      <span className="font-medium">
                        {isLocating ? 'جاري تحديد الموقع...' : 'إرسال الموقع'}
                      </span>
                    </button>
                  )}

                  {enableEmoji && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        devLog('[MessageComposer] نقر على: رموز تعبيرية');
                        setShowEmojiPicker(!showEmojiPicker);
                        setShowActionsMenu(false);
                      }}
                      disabled={disabled || isUploading || isRecording}
                      className="flex w-full items-center gap-3 px-4 py-3 text-right text-sm text-gray-700 transition-colors hover:bg-yellow-50 active:bg-yellow-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <FaceSmileIcon className="h-6 w-6 flex-shrink-0 text-yellow-600" />
                      <span className="font-medium">رموز تعبيرية</span>
                    </button>
                  )}
                </div>
              </div>,
              document.body,
            )}
        </div>

        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (onTypingChange) {
              onTypingChange(true);
              if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
              typingTimeoutRef.current = setTimeout(() => onTypingChange(false), 1200);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void handleSendText();
            }
          }}
          placeholder={
            isRecording
              ? 'جاري التسجيل...'
              : isUploading
                ? 'جاري الرفع...'
                : 'اكتب رسالتك... (Enter للإرسال)'
          }
          disabled={disabled || isUploading || isRecording}
          className="flex-1 rounded-lg border-none bg-transparent px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none disabled:opacity-60"
        />

        <button
          onClick={() => void handleSendText()}
          disabled={!canSend}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-white transition-colors ${
            canSend ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300'
          }`}
          title="إرسال"
        >
          <ChatBubbleLeftRightIcon className="h-5 w-5" />
          <span className="hidden sm:inline">إرسال</span>
        </button>
      </div>

      {!minimal && isUploading && (
        <div className="mt-2 h-2 w-full overflow-hidden rounded bg-gray-200">
          <div className="h-2 bg-blue-600 transition-all" style={{ width: `${uploadProgress}%` }} />
        </div>
      )}

      {!minimal && (
        <p className="mt-1 text-[11px] text-gray-400">
          يدعم السحب والإفلات للصور. الحد الأقصى:{' '}
          {Math.round(UPLOAD_CONFIG.MAX_FILE_SIZE / (1024 * 1024))}MB
        </p>
      )}
    </div>
  );
}

export default MessageComposer;
