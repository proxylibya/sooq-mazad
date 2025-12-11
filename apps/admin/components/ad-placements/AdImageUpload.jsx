import {
  ArrowUpTrayIcon,
  CheckCircleIcon,
  PhotoIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useRef, useState } from 'react';

const ACCEPTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
// No file size limit - accepts any size

export default function AdImageUpload({ value, onChange, multiple = false, maxFiles = 5 }) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [images, setImages] = useState(value || (multiple ? [] : null));
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter((file) => {
      if (!ACCEPTED_FORMATS.includes(file.type)) {
        alert(`الصيغة غير مدعومة: ${file.name}`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    if (multiple) {
      const remaining = maxFiles - (images?.length || 0);
      const filesToUpload = validFiles.slice(0, remaining);
      uploadFiles(filesToUpload);
    } else {
      uploadFiles([validFiles[0]]);
    }
  };

  const uploadFiles = async (files) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();

      if (multiple) {
        files.forEach((file) => {
          formData.append('media', file);
        });
        formData.append('multiple', 'true');
      } else {
        formData.append('media', files[0]);
      }

      formData.append('category', 'ads');
      formData.append('optimize', 'true');
      formData.append('generateSizes', 'true');

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

          if (multiple && result.files) {
            const newImages = [...(images || []), ...result.files];
            setImages(newImages);
            onChange(newImages);
          } else if (result.url) {
            const imageData = {
              url: result.url,
              originalUrl: result.originalUrl,
              filename: result.filename,
              width: result.width,
              height: result.height,
            };
            setImages(imageData);
            onChange(imageData);
          }
          setUploadProgress(100);
        } else {
          alert('فشل رفع الصورة');
        }
        setUploading(false);
      };

      xhr.onerror = () => {
        alert('حدث خطأ أثناء الرفع');
        setUploading(false);
      };

      xhr.open('POST', '/api/admin/ad-placements/upload-media');
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

  const handleRemove = (index) => {
    if (multiple) {
      const newImages = images.filter((_, i) => i !== index);
      setImages(newImages);
      onChange(newImages);
    } else {
      setImages(null);
      onChange(null);
    }
  };

  const renderImagePreview = (image, index) => (
    <div
      key={index}
      className="group relative overflow-hidden rounded-lg border border-slate-700 bg-slate-800"
    >
      <img src={image.url} alt={image.filename || 'Preview'} className="h-32 w-full object-cover" />
      <button
        type="button"
        onClick={() => handleRemove(index)}
        className="absolute left-1 top-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
        <p className="text-xs text-white">
          {image.width} × {image.height}
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-300">
        {multiple ? 'الصور' : 'الصورة'} {multiple && `(الحد الأقصى: ${maxFiles})`}
      </label>

      {multiple && images && images.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((image, index) => renderImagePreview(image, index))}
        </div>
      )}

      {!multiple && images && (
        <div className="grid grid-cols-1">{renderImagePreview(images, 0)}</div>
      )}

      {(!images || (multiple && images.length < maxFiles)) && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative overflow-hidden rounded-lg border-2 border-dashed transition-colors ${
            dragOver ? 'border-amber-500 bg-amber-500/10' : 'border-slate-600 bg-slate-700/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_FORMATS.join(',')}
            multiple={multiple}
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />

          {uploading ? (
            <div className="flex flex-col items-center justify-center gap-3 p-8">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
              <p className="text-sm font-medium text-amber-500">جاري الرفع... {uploadProgress}%</p>
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
              className="flex w-full flex-col items-center justify-center gap-2 p-8 text-center transition-colors hover:bg-slate-700/30"
            >
              {dragOver ? (
                <>
                  <ArrowUpTrayIcon className="h-12 w-12 text-amber-500" />
                  <p className="text-sm font-medium text-amber-500">اترك الملف هنا</p>
                </>
              ) : (
                <>
                  <PhotoIcon className="h-12 w-12 text-slate-400" />
                  <p className="text-sm font-medium text-white">
                    اضغط لاختيار {multiple ? 'صور' : 'صورة'} أو اسحب الملف هنا
                  </p>
                  <p className="text-xs text-slate-400">
                    JPG, PNG, WEBP, GIF (بدون قيود على الحجم)
                  </p>
                </>
              )}
            </button>
          )}
        </div>
      )}

      {multiple && images && images.length >= maxFiles && (
        <div className="flex items-center gap-2 rounded-lg bg-green-500/10 p-3">
          <CheckCircleIcon className="h-5 w-5 text-green-500" />
          <p className="text-sm text-green-500">تم رفع الحد الأقصى من الصور</p>
        </div>
      )}
    </div>
  );
}
