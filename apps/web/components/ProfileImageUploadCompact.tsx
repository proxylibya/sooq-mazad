import PhotoIcon from '@heroicons/react/24/outline/PhotoIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import React, { useRef, useState, useEffect } from 'react';
import UserAvatar from './UserAvatar';
import { getUserSession, refreshAuthToken } from '../utils/authUtils';

interface ProfileImageUploadCompactProps {
  currentImage?: string | null;
  accountType: string;
  onImageChange: (imageUrl: string) => void;
  className?: string;
  userName?: string;
}

const ProfileImageUploadCompact: React.FC<ProfileImageUploadCompactProps> = ({
  currentImage,
  accountType,
  onImageChange,
  className = '',
  userName = 'غير محدد',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(currentImage || null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // تحديث الصورة المرفوعة عند تغيير currentImage من الخارج
  useEffect(() => {
    setUploadedImage(currentImage || null);
  }, [currentImage]);

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
        console.log('تم رفع الصورة بنجاح:', result.imageUrl);
        
        // تحديث الصورة محلياً فوراً للعرض الفوري
        setUploadedImage(result.imageUrl);
        setPreviewImage(null);
        
        // إشعار المكون الأبوي
        onImageChange(result.imageUrl);

        // إرسال حدث مخصص لتحديث جميع المكونات
        window.dispatchEvent(
          new CustomEvent('profileImageUpdated', {
            detail: { imageUrl: result.imageUrl },
          }),
        );

        window.dispatchEvent(
          new CustomEvent('avatarChanged', {
            detail: { newAvatar: result.imageUrl, source: 'upload' },
          }),
        );

        console.log('تم تحديث الصورة في جميع المواضع');
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
    setShowDeleteConfirm(true);
  };

  const confirmDeleteImage = async () => {
    setIsDeleting(true);
    setUploadError(null);

    try {
      // محاولة حذف الصورة من الخادم إذا كانت موجودة
      if (currentImage) {
        const session = getUserSession();
        const token = session?.token;

        if (token) {
          try {
            const response = await fetch('/api/upload/profile-image', {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ imageUrl: currentImage })
            });

            if (!response.ok) {
              console.warn('فشل في حذف الصورة من الخادم، سيتم المتابعة بالحذف المحلي');
            }
          } catch (error) {
            console.warn('خطأ في حذف الصورة من الخادم:', error);
          }
        }
      }

      // حذف محلي (حالة نجح الحذف من الخادم أم لا)
      setPreviewImage(null);
      setUploadedImage(null);  // تحديث الصورة المحلية فوراً
      onImageChange('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // إرسال حدث مخصص لتحديث جميع المكونات
      window.dispatchEvent(
        new CustomEvent('profileImageUpdated', {
          detail: { imageUrl: '' },
        }),
      );

      window.dispatchEvent(
        new CustomEvent('avatarChanged', {
          detail: { newAvatar: '', source: 'delete' },
        }),
      );

      console.log('تم حذف الصورة من جميع المواضع');
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('خطأ في حذف الصورة:', error);
      setUploadError('حدث خطأ أثناء حذف الصورة');
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  // أولوية العرض: معاينة أثناء الرفع -> الصورة المحدثة محلياً -> الصورة من المكون الأبوي
  const displayImage = previewImage || uploadedImage || currentImage;

  // تحديد نوع الحساب للعرض
  const getAccountTypeLabel = () => {
    switch (accountType) {
      case 'TRANSPORT_OWNER': return 'مالك نقل';
      case 'COMPANY': return 'شركة';
      case 'SHOWROOM': return 'معرض';
      default: return 'مستخدم عادي';
    }
  };

  return (
    <div className={`${className}`}>
      {/* Layout مضغوط - صف واحد */}
      <div className="flex items-center gap-4">
        {/* الصورة مع أزرار التحكم */}
        <div className="relative flex-shrink-0">
          <div
            className="group relative flex items-center justify-center rounded-full"
            data-testid="image-container"
          >
            <UserAvatar
              src={displayImage || undefined}
              alt="الصورة الشخصية"
              size="lg" // تصغير من xl إلى lg
              className="rounded-full transition-all duration-200 group-hover:brightness-75"
            />

            {/* Overlay للتحرير */}
            {!isUploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-0 transition-all duration-200 group-hover:bg-opacity-40">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="opacity-0 transform scale-75 transition-all duration-200 group-hover:opacity-100 group-hover:scale-100 rounded-full bg-white/90 p-2 text-gray-700 hover:bg-white hover:text-blue-600"
                  title="تحرير الصورة"
                  data-testid="edit-button"
                >
                  <PencilIcon className="h-4 w-4" />
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
            {displayImage && !isUploading && !isDeleting && (
              <button
                onClick={handleRemoveImage}
                className="absolute -right-1 -top-1 rounded-full bg-red-500 p-1 text-white transition-all duration-200 hover:bg-red-600 hover:scale-110 shadow-lg"
                title="إزالة الصورة"
                data-testid="remove-button"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            )}

            {/* أيقونة الحذف */}
            {isDeleting && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-50">
                <div
                      className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                      style={{ width: 24, height: 24 }}
                      role="status"
                      aria-label="جاري التحميل"
                    />
              </div>
            )}
          </div>
        </div>

        {/* معلومات المستخدم والأزرار */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h4 className="text-base font-bold text-gray-900 truncate">
                {userName}
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                {getAccountTypeLabel()}
              </p>
              
              {/* زر رفع الصورة */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                  isUploading
                    ? 'cursor-not-allowed border-gray-300 text-gray-400'
                    : 'border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <PhotoIcon className="h-4 w-4" />
                <span>
                  {isUploading ? 'جاري الرفع...' : displayImage ? 'تغيير الصورة' : 'إضافة صورة'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* رسالة الخطأ */}
      {uploadError && (
        <div className="mt-2 rounded-lg bg-red-50 p-2 text-center text-sm text-red-600">
          {uploadError}
        </div>
      )}

      {/* معلومات إضافية مضغوطة */}
      <div className="mt-2 text-xs text-gray-500">
        <p>الحد الأقصى: 5 ميجابايت • الصيغ المدعومة: JPG, PNG, WebP</p>
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

      {/* نافذة تأكيد الحذف */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded-xl bg-white p-6 shadow-xl max-w-sm mx-4">
            <div className="mb-4 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <XMarkIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">حذف الصورة الشخصية</h3>
              <p className="mt-2 text-sm text-gray-600">
                هل أنت متأكد من حذف صورتك الشخصية؟ لن تتمكن من التراجع عن هذا الإجراء.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isDeleting}
              >
                إلغاء
              </button>
              <button
                onClick={confirmDeleteImage}
                disabled={isDeleting}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isDeleting ? 'جاري الحذف...' : 'حذف'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileImageUploadCompact;
