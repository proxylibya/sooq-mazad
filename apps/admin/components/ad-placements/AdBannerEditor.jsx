import { ArrowsPointingOutIcon, CheckIcon, ScissorsIcon } from '@heroicons/react/24/outline';
import { useEffect, useRef, useState } from 'react';
import AdImageUpload from './AdImageUpload';

const BANNER_SIZES = {
  ORIGINAL: { width: 0, height: 0, label: 'المقاس الأصلي', ratio: 'أصلي', isOriginal: true },
  LEADERBOARD: { width: 728, height: 90, label: 'Leaderboard', ratio: '728:90' },
  BILLBOARD: { width: 970, height: 250, label: 'Billboard', ratio: '970:250' },
  LARGE_RECTANGLE: { width: 336, height: 280, label: 'Large Rectangle', ratio: '336:280' },
  MEDIUM_RECTANGLE: { width: 300, height: 250, label: 'Medium Rectangle', ratio: '300:250' },
  WIDE_SKYSCRAPER: { width: 160, height: 600, label: 'Wide Skyscraper', ratio: '160:600' },
  MOBILE_BANNER: { width: 320, height: 50, label: 'Mobile Banner', ratio: '320:50' },
  MOBILE_LEADERBOARD: { width: 320, height: 100, label: 'Mobile Leaderboard', ratio: '320:100' },
  FACEBOOK_COVER: { width: 820, height: 312, label: 'Facebook Cover', ratio: '820:312' },
  INSTAGRAM_STORY: { width: 1080, height: 1920, label: 'Instagram Story', ratio: '9:16' },
  SQUARE: { width: 1080, height: 1080, label: 'Square (1:1)', ratio: '1:1' },
  WIDE: { width: 1920, height: 1080, label: 'Wide (16:9)', ratio: '16:9' },
  CUSTOM: { width: 0, height: 0, label: 'مخصص', ratio: 'custom' },
};

export default function AdBannerEditor({ value, onChange, placement }) {
  const [uploadedImage, setUploadedImage] = useState(value?.originalImage || null);
  const [selectedSize, setSelectedSize] = useState(value?.selectedSize || 'ORIGINAL');
  const [customWidth, setCustomWidth] = useState(value?.customWidth || '');
  const [customHeight, setCustomHeight] = useState(value?.customHeight || '');
  const [cropSettings, setCropSettings] = useState(value?.cropSettings || null);
  const [isCropping, setIsCropping] = useState(false);
  const [previewMode, setPreviewMode] = useState('desktop');

  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    if (uploadedImage && selectedSize !== 'CUSTOM') {
      updateBanner();
    }
  }, [uploadedImage, selectedSize]);

  const updateBanner = () => {
    if (!uploadedImage) return;

    let size;
    if (selectedSize === 'ORIGINAL') {
      size = { width: uploadedImage.width, height: uploadedImage.height };
    } else if (selectedSize === 'CUSTOM') {
      size = { width: parseInt(customWidth) || 0, height: parseInt(customHeight) || 0 };
    } else {
      size = BANNER_SIZES[selectedSize];
    }

    const ratio =
      selectedSize === 'ORIGINAL'
        ? `${uploadedImage.width}:${uploadedImage.height}`
        : BANNER_SIZES[selectedSize]?.ratio || 'custom';

    const bannerData = {
      originalImage: uploadedImage,
      selectedSize,
      customWidth: selectedSize === 'CUSTOM' ? customWidth : null,
      customHeight: selectedSize === 'CUSTOM' ? customHeight : null,
      cropSettings,
      finalUrl: uploadedImage.url,
      width: size.width,
      height: size.height,
      aspectRatio: ratio,
    };

    onChange(bannerData);
  };

  const handleImageUpload = (image) => {
    setUploadedImage(image);
  };

  const handleSizeSelect = (sizeKey) => {
    setSelectedSize(sizeKey);
    if (sizeKey !== 'CUSTOM') {
      updateBanner();
    }
  };

  const handleCustomSize = () => {
    if (customWidth && customHeight && uploadedImage) {
      updateBanner();
    }
  };

  const startCrop = () => {
    setIsCropping(true);
  };

  const applyCrop = () => {
    setIsCropping(false);
    updateBanner();
  };

  const getBannerDimensions = () => {
    if (selectedSize === 'ORIGINAL' && uploadedImage) {
      return { width: uploadedImage.width, height: uploadedImage.height };
    }
    if (selectedSize === 'CUSTOM') {
      return { width: parseInt(customWidth) || 0, height: parseInt(customHeight) || 0 };
    }
    return BANNER_SIZES[selectedSize] || { width: 0, height: 0 };
  };

  const getPreviewScale = () => {
    const dims = getBannerDimensions();
    if (previewMode === 'mobile') {
      return Math.min(320 / dims.width, 1);
    }
    return Math.min(800 / dims.width, 1);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-3 block text-sm font-medium text-slate-300">
          اختر مقاس البنر (اختياري)
        </label>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(BANNER_SIZES).map(([key, size]) => {
            const isSelected = selectedSize === key;
            const isOriginal = size.isOriginal;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSizeSelect(key)}
                className={`relative rounded-lg border-2 p-3 text-right transition-all ${
                  isSelected
                    ? isOriginal
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-amber-500 bg-amber-500/10'
                    : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`text-sm font-bold ${isSelected ? (isOriginal ? 'text-green-500' : 'text-amber-500') : 'text-white'}`}
                    >
                      {size.label}
                    </p>
                    {key !== 'CUSTOM' && !isOriginal && (
                      <p className="mt-1 text-xs text-slate-400">
                        {size.width} × {size.height}
                      </p>
                    )}
                    {isOriginal && uploadedImage && (
                      <p className="mt-1 text-xs text-green-400">
                        {uploadedImage.width} × {uploadedImage.height}
                      </p>
                    )}
                    {isOriginal && !uploadedImage && (
                      <p className="mt-1 text-xs text-slate-400">سيُستخدم مقاس الصورة</p>
                    )}
                  </div>
                  {isSelected && (
                    <CheckIcon
                      className={`h-5 w-5 ${isOriginal ? 'text-green-500' : 'text-amber-500'}`}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedSize === 'CUSTOM' && (
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
          <h3 className="mb-3 text-sm font-bold text-white">المقاس المخصص</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs text-slate-400">العرض (بكسل)</label>
              <input
                type="number"
                min="1"
                value={customWidth}
                onChange={(e) => setCustomWidth(e.target.value)}
                placeholder="مثال: 1200"
                className="w-full rounded-lg border border-slate-600 bg-slate-700 p-3 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs text-slate-400">الارتفاع (بكسل)</label>
              <input
                type="number"
                min="1"
                value={customHeight}
                onChange={(e) => setCustomHeight(e.target.value)}
                placeholder="مثال: 400"
                className="w-full rounded-lg border border-slate-600 bg-slate-700 p-3 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleCustomSize}
            disabled={!customWidth || !customHeight || !uploadedImage}
            className="mt-3 w-full rounded-lg bg-amber-500 py-2 text-sm font-bold text-white hover:bg-amber-600 disabled:opacity-50"
          >
            تطبيق المقاس
          </button>
        </div>
      )}

      <div>
        <AdImageUpload value={uploadedImage} onChange={handleImageUpload} />
      </div>

      {uploadedImage && (
        <>
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">المعاينة</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewMode('desktop')}
                  className={`rounded px-3 py-1 text-xs ${
                    previewMode === 'desktop'
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  ديسكتوب
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('mobile')}
                  className={`rounded px-3 py-1 text-xs ${
                    previewMode === 'mobile'
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  موبايل
                </button>
              </div>
            </div>

            <div className="flex justify-center overflow-auto rounded-lg border border-slate-700 bg-slate-900 p-4">
              <div
                style={{
                  width: `${getBannerDimensions().width * getPreviewScale()}px`,
                  height: `${getBannerDimensions().height * getPreviewScale()}px`,
                }}
                className="relative overflow-hidden rounded bg-slate-800"
              >
                <img
                  ref={imageRef}
                  src={uploadedImage.url}
                  alt="Banner Preview"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
              <span>
                الأبعاد: {getBannerDimensions().width} × {getBannerDimensions().height}
              </span>
              <span>
                النسبة:{' '}
                {selectedSize === 'ORIGINAL'
                  ? 'أصلي'
                  : BANNER_SIZES[selectedSize]?.ratio || 'custom'}
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
            <h3 className="mb-3 text-sm font-bold text-white">أدوات التحرير</h3>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={startCrop}
                className="flex items-center gap-2 rounded-lg bg-blue-500/20 px-4 py-2 text-sm text-blue-400 hover:bg-blue-500/30"
              >
                <ScissorsIcon className="h-4 w-4" />
                قص الصورة
              </button>
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg bg-green-500/20 px-4 py-2 text-sm text-green-400 hover:bg-green-500/30"
              >
                <ArrowsPointingOutIcon className="h-4 w-4" />
                تكبير تلقائي
              </button>
            </div>
          </div>
        </>
      )}

      {placement && (
        <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
          <p className="text-xs text-amber-400">
            <span className="font-bold">ملاحظة:</span> المقاس الموصى به لموقع "{placement.name}" هو{' '}
            {placement.width || 'غير محدد'} × {placement.height || 'غير محدد'}
          </p>
        </div>
      )}
    </div>
  );
}
