import { ArrowPathIcon, ArrowsPointingOutIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

const PRESET_DIMENSIONS = [
  { name: 'المقاس الأصلي', width: null, height: null, ratio: 'أصلي', isOriginal: true },
  { name: 'بنر أفقي كامل', width: 1200, height: 300, ratio: '4:1' },
  { name: 'بنر أفقي متوسط', width: 970, height: 250, ratio: '~4:1' },
  { name: 'بنر مربع كبير', width: 600, height: 600, ratio: '1:1' },
  { name: 'بنر عمودي', width: 300, height: 600, ratio: '1:2' },
  { name: 'بنر صغير', width: 468, height: 60, ratio: '~8:1' },
  { name: 'سكاي سكريبر', width: 160, height: 600, ratio: '~1:4' },
  { name: 'مربع متوسط', width: 300, height: 250, ratio: '6:5' },
  { name: 'ليدر بورد', width: 728, height: 90, ratio: '~8:1' },
];

export default function AdDimensionEditor({ value, onChange, imageData, optional = true }) {
  const [dimensions, setDimensions] = useState(
    value || { width: null, height: null, aspectRatio: null, useOriginal: true },
  );
  const [customMode, setCustomMode] = useState(false);
  const [lockRatio, setLockRatio] = useState(true);
  const [tempWidth, setTempWidth] = useState('');
  const [tempHeight, setTempHeight] = useState('');
  const [useOriginalSize, setUseOriginalSize] = useState(value?.useOriginal !== false);

  useEffect(() => {
    if (imageData?.width && imageData?.height) {
      // Always update with original dimensions when image changes
      if (useOriginalSize || !dimensions.width) {
        const newDimensions = {
          width: imageData.width,
          height: imageData.height,
          aspectRatio: imageData.width / imageData.height,
          useOriginal: useOriginalSize,
        };
        setDimensions(newDimensions);
        onChange(newDimensions);
        setTempWidth(imageData.width.toString());
        setTempHeight(imageData.height.toString());
      }
    }
  }, [imageData, useOriginalSize]);

  const handlePresetSelect = (preset) => {
    if (preset.isOriginal) {
      // Use original image dimensions
      setUseOriginalSize(true);
      if (imageData?.width && imageData?.height) {
        const newDimensions = {
          width: imageData.width,
          height: imageData.height,
          aspectRatio: imageData.width / imageData.height,
          useOriginal: true,
        };
        setDimensions(newDimensions);
        setTempWidth(imageData.width.toString());
        setTempHeight(imageData.height.toString());
        onChange(newDimensions);
      }
    } else {
      setUseOriginalSize(false);
      const newDimensions = {
        width: preset.width,
        height: preset.height,
        aspectRatio: preset.width / preset.height,
        useOriginal: false,
      };
      setDimensions(newDimensions);
      setTempWidth(preset.width.toString());
      setTempHeight(preset.height.toString());
      onChange(newDimensions);
    }
    setCustomMode(false);
  };

  const handleCustomWidth = (value) => {
    setTempWidth(value);
    const width = parseInt(value);

    if (isNaN(width) || width <= 0) return;

    if (lockRatio && dimensions.aspectRatio) {
      const height = Math.round(width / dimensions.aspectRatio);
      setTempHeight(height.toString());
      const newDimensions = {
        width,
        height,
        aspectRatio: dimensions.aspectRatio,
      };
      setDimensions(newDimensions);
      onChange(newDimensions);
    } else {
      const newDimensions = {
        ...dimensions,
        width,
        aspectRatio: dimensions.height ? width / dimensions.height : null,
      };
      setDimensions(newDimensions);
      onChange(newDimensions);
    }
  };

  const handleCustomHeight = (value) => {
    setTempHeight(value);
    const height = parseInt(value);

    if (isNaN(height) || height <= 0) return;

    if (lockRatio && dimensions.aspectRatio) {
      const width = Math.round(height * dimensions.aspectRatio);
      setTempWidth(width.toString());
      const newDimensions = {
        width,
        height,
        aspectRatio: dimensions.aspectRatio,
      };
      setDimensions(newDimensions);
      onChange(newDimensions);
    } else {
      const newDimensions = {
        ...dimensions,
        height,
        aspectRatio: dimensions.width ? dimensions.width / height : null,
      };
      setDimensions(newDimensions);
      onChange(newDimensions);
    }
  };

  const handleAutoOptimize = () => {
    if (!imageData?.width || !imageData?.height) return;

    let optimizedWidth = imageData.width;
    let optimizedHeight = imageData.height;

    if (imageData.width > 1200) {
      optimizedWidth = 1200;
      optimizedHeight = Math.round((1200 / imageData.width) * imageData.height);
    } else if (imageData.width < 300) {
      optimizedWidth = 300;
      optimizedHeight = Math.round((300 / imageData.width) * imageData.height);
    }

    const newDimensions = {
      width: optimizedWidth,
      height: optimizedHeight,
      aspectRatio: optimizedWidth / optimizedHeight,
    };
    setDimensions(newDimensions);
    setTempWidth(optimizedWidth.toString());
    setTempHeight(optimizedHeight.toString());
    onChange(newDimensions);
  };

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
        <ArrowsPointingOutIcon className="h-5 w-5" />
        المقاسات والأبعاد
      </label>

      {imageData && (
        <div className="flex items-center justify-between rounded-lg bg-slate-700/50 p-3">
          <div>
            <p className="text-xs text-slate-400">المقاس الأصلي:</p>
            <p className="text-sm font-medium text-white">
              {imageData.width} × {imageData.height} px
            </p>
          </div>
          <button
            type="button"
            onClick={handleAutoOptimize}
            className="flex items-center gap-2 rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-600"
          >
            <ArrowPathIcon className="h-4 w-4" />
            تحسين تلقائي
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setCustomMode(false)}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            !customMode
              ? 'bg-amber-500 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          مقاسات جاهزة
        </button>
        <button
          type="button"
          onClick={() => setCustomMode(true)}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            customMode
              ? 'bg-amber-500 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          مقاس مخصص
        </button>
      </div>

      {!customMode ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {PRESET_DIMENSIONS.map((preset) => {
            const isSelected = preset.isOriginal
              ? useOriginalSize
              : !useOriginalSize &&
                dimensions.width === preset.width &&
                dimensions.height === preset.height;

            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                className={`relative rounded-lg border-2 p-3 text-right transition-all ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                }`}
              >
                {isSelected && (
                  <CheckIcon className="absolute left-2 top-2 h-4 w-4 text-amber-500" />
                )}
                <p className={`text-sm font-bold ${isSelected ? 'text-amber-500' : 'text-white'}`}>
                  {preset.name}
                </p>
                {preset.isOriginal ? (
                  <p className="mt-1 text-xs text-green-400">
                    {imageData
                      ? `${imageData.width} × ${imageData.height}`
                      : 'سيُستخدم مقاس الصورة'}
                  </p>
                ) : (
                  <>
                    <p className="mt-1 text-xs text-slate-400">
                      {preset.width} × {preset.height}
                    </p>
                    <p className="text-xs text-slate-500">نسبة {preset.ratio}</p>
                  </>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={lockRatio}
              onChange={(e) => setLockRatio(e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm text-slate-300">قفل نسبة العرض للارتفاع</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-medium text-slate-300">العرض (px)</label>
              <input
                type="number"
                min="100"
                max="2000"
                value={tempWidth}
                onChange={(e) => handleCustomWidth(e.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-slate-700 p-3 text-white focus:border-amber-500 focus:outline-none"
                placeholder="العرض"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-slate-300">الارتفاع (px)</label>
              <input
                type="number"
                min="50"
                max="2000"
                value={tempHeight}
                onChange={(e) => handleCustomHeight(e.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-slate-700 p-3 text-white focus:border-amber-500 focus:outline-none"
                placeholder="الارتفاع"
              />
            </div>
          </div>

          {dimensions.aspectRatio && (
            <div className="rounded-lg bg-slate-700/50 p-3 text-center">
              <p className="text-xs text-slate-400">نسبة الأبعاد الحالية:</p>
              <p className="text-sm font-bold text-white">{dimensions.aspectRatio.toFixed(2)}:1</p>
            </div>
          )}
        </div>
      )}

      {dimensions.width && dimensions.height && (
        <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-3">
          <p className="text-sm font-medium text-green-500">
            المقاس المحدد: {dimensions.width} × {dimensions.height} px
          </p>
        </div>
      )}
    </div>
  );
}
