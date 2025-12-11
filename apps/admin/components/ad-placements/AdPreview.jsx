import { EyeIcon } from '@heroicons/react/24/outline';

export default function AdPreview({ adData, placement }) {
  if (!adData) {
    return (
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
          <EyeIcon className="h-5 w-5" />
          معاينة الإعلان
        </label>
        <div className="flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800/50 p-8">
          <p className="text-slate-400">لا توجد بيانات لعرضها</p>
        </div>
      </div>
    );
  }

  const getPreviewDimensions = () => {
    if (placement?.width && placement?.height) {
      return {
        width: placement.width,
        height: placement.height,
      };
    }
    return {
      width: '100%',
      height: '300px',
    };
  };

  const dimensions = getPreviewDimensions();

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
        <EyeIcon className="h-5 w-5" />
        معاينة الإعلان
      </label>

      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="text-xs text-slate-400">معاينة مباشرة</span>
          </div>
          {adData.dimensions && (
            <span className="text-xs text-slate-400">
              {adData.dimensions.width} × {adData.dimensions.height}
            </span>
          )}
        </div>

        <div
          className="group relative overflow-hidden rounded-lg border border-slate-700 bg-slate-900"
          style={{
            width: dimensions.width,
            height: dimensions.height,
            maxWidth: '100%',
          }}
        >
          {adData.imageUrl ? (
            <>
              <img
                src={adData.imageUrl}
                alt={adData.title || 'Ad preview'}
                className="h-full w-full object-cover"
              />
              {(adData.title || adData.description) && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4">
                  {adData.title && (
                    <h3 className="text-lg font-bold text-white">
                      {adData.title}
                    </h3>
                  )}
                  {adData.description && (
                    <p className="mt-1 text-sm text-slate-300 line-clamp-2">
                      {adData.description}
                    </p>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center">
              {adData.title ? (
                <>
                  <p className="text-2xl font-bold text-amber-500">
                    {adData.title}
                  </p>
                  {adData.description && (
                    <p className="mt-2 text-slate-400">{adData.description}</p>
                  )}
                </>
              ) : (
                <p className="text-slate-400">لا توجد صورة</p>
              )}
            </div>
          )}

          {adData.linkUrl && (
            <div className="absolute left-2 top-2 rounded bg-blue-500 px-2 py-1 text-xs font-bold text-white">
              رابط خارجي
            </div>
          )}

          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <div className="rounded-lg bg-slate-800/90 p-3 text-center">
              <EyeIcon className="mx-auto h-8 w-8 text-white" />
              <p className="mt-2 text-sm text-white">معاينة</p>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2 rounded-lg bg-slate-900/50 p-3 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">النوع:</span>
            <span className="font-medium text-white">
              {adData.entityType || adData.contentType || 'CUSTOM'}
            </span>
          </div>
          {adData.linkUrl && (
            <div className="flex justify-between">
              <span className="text-slate-400">الرابط:</span>
              <span className="max-w-xs truncate font-medium text-blue-400">
                {adData.linkUrl}
              </span>
            </div>
          )}
          {adData.priority !== undefined && (
            <div className="flex justify-between">
              <span className="text-slate-400">الأولوية:</span>
              <span className="font-medium text-white">{adData.priority}</span>
            </div>
          )}
        </div>
      </div>

      {placement && (
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-3">
          <p className="mb-2 text-xs font-medium text-slate-300">
            معلومات المكان الإعلاني:
          </p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">الموقع:</span>
              <span className="font-medium text-white">{placement.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">النوع:</span>
              <span className="font-medium text-white">{placement.type}</span>
            </div>
            {placement.autoRotate && (
              <div className="flex justify-between">
                <span className="text-slate-400">دوران تلقائي:</span>
                <span className="font-medium text-green-400">
                  كل {placement.rotateInterval} ثانية
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
