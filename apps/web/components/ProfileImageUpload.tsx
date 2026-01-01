import PhotoIcon from '@heroicons/react/24/outline/PhotoIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import React, { useRef, useState } from 'react';
import UserAvatar from './UserAvatar';
import { getUserSession, refreshAuthToken } from '../utils/authUtils';

interface ProfileImageUploadProps {
  currentImage?: string | null;
  accountType: string;
  onImageChange: (imageUrl: string) => void;
  className?: string;
}

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  currentImage,
  accountType,
  onImageChange,
  className = '',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      setUploadError('يرجى اختيار ملف صورة صحيح');
      return;
    }

    // التحقق من حجم الملف (5MB كحد أقصى)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
      return;
    }

    setUploadError(null);

    // إنشاء معاينة للصورة
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // رفع الصورة
    uploadImage(file);
  };

  const uploadImage = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', 'profile');

      // احصل على التوكن الحالي من الجلسة
      const session = getUserSession();
      const token = session?.token;

      if (!token) {
        console.error('غير مصرح: مفقود رمز الوصول');
        setUploadError('غير مصرح: مفقود رمز الوصول');
        setPreviewImage(null);
        return;
      }

      const doRequest = async (authToken: string) =>
        fetch('/api/upload/profile-image', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          body: formData,
        });

      let response = await doRequest(token);

      // في حال انتهاء الجلسة أو رفض غير مصرح، جرّب تحديث التوكن ثم أعد المحاولة مرة واحدة
      if (response.status === 401) {
        const refreshed = await refreshAuthToken();
        if (refreshed) {
          const newSession = getUserSession();
          if (newSession?.token) {
            response = await doRequest(newSession.token);
          }
        }
      }

      const result = await response.json();

      if (result.success) {
        onImageChange(result.imageUrl);
        setPreviewImage(null);

        // إرسال حدث مخصص لتحديث جميع المكونات
        window.dispatchEvent(
          new CustomEvent('profileImageUpdated', {
            detail: { imageUrl: result.imageUrl },
          }),
        );
      } else {
        console.error('فشل في رفع الصورة:', result.error);
        setUploadError(result.error || 'فشل في رفع الصورة');
        setPreviewImage(null);
      }
    } catch (error) {
      console.error('حدث خطأ أثناء رفع الصورة', error);
      setUploadError('حدث خطأ أثناء رفع الصورة');
      setPreviewImage(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    onImageChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayImage = previewImage || currentImage;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* عرض الصورة الحالية أو المعاينة */}
      <div className="flex items-center justify-center">
        <div
          className="group relative flex items-center justify-center rounded-full"
          data-testid="image-container"
        >
          <UserAvatar
            src={displayImage}
            alt="الصورة الشخصية"
            size="xl"
            accountType={accountType}
            className="rounded-full transition-all duration-200 group-hover:brightness-75"
          />

          {/* Overlay للتحرير */}
          {!isUploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-0 transition-all duration-200 group-hover:bg-opacity-40">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="opacity-0 transform scale-75 transition-all duration-200 group-hover:opacity-100 group-hover:scale-100 rounded-full bg-white/90 p-3 text-gray-700 hover:bg-white hover:text-blue-600"
                title="تحرير الصورة"
                data-testid="edit-button"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* أيقونة التحميل */}
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-50">
              <div
                      className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                      style={{ width: 24, height: 24 }}
                      role="status"
                      aria-label="جاري التحميل"
                    />
            </div>
          )}

          {/* زر إزالة الصورة */}
          {displayImage && !isUploading && (
            <button
              onClick={handleRemoveImage}
              className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1.5 text-white transition-all duration-200 hover:bg-red-600 hover:scale-110 shadow-lg"
              title="إزالة الصورة"
              data-testid="remove-button"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* زر رفع الصورة - مطور */}
      <div className="flex justify-center">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={`flex items-center gap-3 rounded-xl border-2 border-dashed px-6 py-3 transition-all duration-200 ${
            isUploading
              ? 'cursor-not-allowed border-gray-300 text-gray-400'
              : 'border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 hover:shadow-md'
          }`}
        >
          <PhotoIcon className="h-5 w-5" />
          <span className="font-medium">
            {isUploading ? 'جاري الرفع...' : displayImage ? 'تغيير الصورة' : 'إضافة صورة'}
          </span>
        </button>
      </div>

      {/* رسالة الخطأ */}
      {uploadError && (
        <div className="rounded-lg bg-red-50 p-2 text-center text-sm text-red-600">
          {uploadError}
        </div>
      )}

      {/* معلومات إضافية */}
      <div className="text-center text-xs text-gray-500">
        <p>الحد الأقصى: 5 ميجابايت</p>
        <p>الصيغ المدعومة: JPG, PNG, WebP</p>
      </div>

      {/* حقل الإدخال المخفي */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        data-testid="file-input"
      />
    </div>
  );
};

export default ProfileImageUpload;
