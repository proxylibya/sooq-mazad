import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../../components/AdminLayout';
import AdBannerEditor from '../../../../components/ad-placements/AdBannerEditor';
import AdContentSelector from '../../../../components/ad-placements/AdContentSelector';
import AdDimensionEditor from '../../../../components/ad-placements/AdDimensionEditor';
import AdImageUpload from '../../../../components/ad-placements/AdImageUpload';
import AdPreview from '../../../../components/ad-placements/AdPreview';
import AdScheduler from '../../../../components/ad-placements/AdScheduler';
import AdSearch from '../../../../components/ad-placements/AdSearch';
import AdTargetingPanel from '../../../../components/ad-placements/AdTargetingPanel';
import AdVideoUpload from '../../../../components/ad-placements/AdVideoUpload';

export default function CreatePlacementAdPage() {
  const router = useRouter();
  const { placementId } = router.query;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placement, setPlacement] = useState(null);
  const [contentType, setContentType] = useState('POST');
  const [selectedPost, setSelectedPost] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedVideo, setUploadedVideo] = useState(null);
  const [bannerData, setBannerData] = useState(null);
  const [dimensions, setDimensions] = useState(null);
  const [targeting, setTargeting] = useState(null);
  const [schedule, setSchedule] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    linkUrl: '',
    priority: 0,
    isActive: true,
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    if (placementId) {
      fetchPlacement();
    }
  }, [placementId]);

  const fetchPlacement = async () => {
    try {
      const res = await fetch(`/api/admin/ad-placements?id=${placementId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.placements && data.placements.length > 0) {
          setPlacement(data.placements[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching placement:', error);
    }
  };

  const buildAdData = () => {
    const base = {
      placementId: placementId,
      title: formData.title,
      description: formData.description,
      priority: formData.priority || 0,
      isActive: formData.isActive,
      startDate:
        schedule?.enabled && schedule.startDate
          ? new Date(schedule.startDate)
          : formData.startDate || null,
      endDate:
        schedule?.enabled && schedule.endDate
          ? new Date(schedule.endDate)
          : formData.endDate || null,
    };

    if (contentType === 'POST' && selectedPost) {
      return {
        ...base,
        entityType: selectedPost.type,
        entityId: selectedPost.id,
        imageUrl: selectedPost.imageUrl,
        title: formData.title || selectedPost.title,
        description: formData.description || selectedPost.description,
        mediaType: 'IMAGE',
      };
    }

    if (contentType === 'VIDEO' && uploadedVideo) {
      return {
        ...base,
        entityType: 'CUSTOM',
        videoUrl: uploadedVideo.url,
        videoThumbnail: uploadedVideo.thumbnailUrl,
        videoDuration: uploadedVideo.duration,
        videoAutoplay: uploadedVideo.autoplay,
        videoMuted: uploadedVideo.muted,
        videoLoop: uploadedVideo.loop,
        linkUrl: formData.linkUrl,
        mediaType: 'VIDEO',
        aspectRatio: '16:9',
      };
    }

    if (contentType === 'BANNER' && bannerData) {
      return {
        ...base,
        entityType: 'CUSTOM',
        imageUrl: bannerData.finalUrl,
        linkUrl: formData.linkUrl,
        mediaType: 'BANNER',
        dimensions: {
          width: bannerData.width,
          height: bannerData.height,
        },
        aspectRatio: bannerData.aspectRatio,
        bannerConfig: {
          selectedSize: bannerData.selectedSize,
          customWidth: bannerData.customWidth,
          customHeight: bannerData.customHeight,
        },
      };
    }

    if (contentType === 'IMAGE' && uploadedImage) {
      return {
        ...base,
        entityType: 'CUSTOM',
        imageUrl: uploadedImage.url,
        linkUrl: formData.linkUrl,
        mediaType: 'IMAGE',
        dimensions: dimensions,
        customData: {
          originalUrl: uploadedImage.originalUrl,
          filename: uploadedImage.filename,
        },
      };
    }

    if (contentType === 'EXTERNAL') {
      return {
        ...base,
        entityType: 'EXTERNAL',
        imageUrl: uploadedImage?.url || null,
        linkUrl: formData.linkUrl,
        mediaType: 'HTML_EMBED',
        dimensions: dimensions,
      };
    }

    return null;
  };

  const getPreviewData = () => {
    if (contentType === 'POST' && selectedPost) {
      return {
        ...selectedPost,
        title: formData.title || selectedPost.title,
        description: formData.description || selectedPost.description,
        linkUrl: null,
        contentType: 'POST',
      };
    }

    if (contentType === 'IMAGE' && uploadedImage) {
      return {
        imageUrl: uploadedImage.url,
        title: formData.title,
        description: formData.description,
        linkUrl: formData.linkUrl,
        dimensions: dimensions,
        contentType: 'IMAGE',
      };
    }

    if (contentType === 'EXTERNAL') {
      return {
        imageUrl: uploadedImage?.url,
        title: formData.title,
        description: formData.description,
        linkUrl: formData.linkUrl,
        dimensions: dimensions,
        contentType: 'EXTERNAL',
      };
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!placementId) {
      alert('معرف المكان الإعلاني مفقود');
      return;
    }

    const adData = buildAdData();

    if (!adData) {
      alert('يرجى استكمال بيانات الإعلان');
      return;
    }

    if (contentType === 'IMAGE' && !uploadedImage) {
      alert('يرجى رفع صورة للإعلان');
      return;
    }

    if ((contentType === 'IMAGE' || contentType === 'EXTERNAL') && !formData.linkUrl) {
      alert('يرجى إدخال رابط الإعلان');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/admin/placement-ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adData),
      });

      if (res.ok) {
        router.push(`/admin/promotions/ad-placements/${placementId}`);
      } else {
        const err = await res.json();
        alert(err.error || 'حدث خطأ');
      }
    } catch (error) {
      console.error('Error creating ad:', error);
      alert('حدث خطأ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout title="إضافة إعلان">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-400 hover:text-white"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            رجوع
          </button>
          <h1 className="text-2xl font-bold text-white">إضافة إعلان جديد</h1>
        </div>

        {placement && (
          <div className="mb-6 rounded-xl border border-amber-500/50 bg-amber-500/10 p-4">
            <p className="text-sm text-amber-500">
              <span className="font-bold">المكان الإعلاني:</span> {placement.name}
            </p>
            <p className="mt-1 text-xs text-amber-400">
              {placement.location} • {placement.type}
            </p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <AdContentSelector value={contentType} onChange={setContentType} />

                {contentType === 'POST' && (
                  <AdSearch onSelect={setSelectedPost} selectedItem={selectedPost} />
                )}

                {contentType === 'IMAGE' && (
                  <>
                    <AdImageUpload
                      value={uploadedImage}
                      onChange={setUploadedImage}
                      multiple={false}
                    />

                    {uploadedImage && (
                      <AdDimensionEditor
                        value={dimensions}
                        onChange={setDimensions}
                        imageData={uploadedImage}
                      />
                    )}
                  </>
                )}

                {contentType === 'VIDEO' && (
                  <AdVideoUpload value={uploadedVideo} onChange={setUploadedVideo} />
                )}

                {contentType === 'BANNER' && (
                  <AdBannerEditor
                    value={bannerData}
                    onChange={setBannerData}
                    placement={placement}
                  />
                )}

                {contentType === 'EXTERNAL' && (
                  <>
                    <AdImageUpload
                      value={uploadedImage}
                      onChange={setUploadedImage}
                      multiple={false}
                    />

                    {uploadedImage && (
                      <AdDimensionEditor
                        value={dimensions}
                        onChange={setDimensions}
                        imageData={uploadedImage}
                      />
                    )}
                  </>
                )}

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    العنوان {contentType === 'POST' && '(اختياري)'}
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 p-3 text-white focus:border-amber-500 focus:outline-none"
                    placeholder={
                      contentType === 'POST'
                        ? 'سيتم استخدام عنوان المنشور إذا ترك فارغاً'
                        : 'أدخل عنوان الإعلان'
                    }
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    الوصف (اختياري)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 p-3 text-white focus:border-amber-500 focus:outline-none"
                    rows={3}
                    placeholder="وصف الإعلان"
                  />
                </div>

                {(contentType === 'IMAGE' || contentType === 'EXTERNAL') && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      رابط الإعلان *
                    </label>
                    <input
                      type="url"
                      required
                      value={formData.linkUrl}
                      onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                      className="w-full rounded-lg border border-slate-600 bg-slate-700 p-3 text-white focus:border-amber-500 focus:outline-none"
                      placeholder="https://example.com"
                    />
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      الأولوية
                    </label>
                    <input
                      type="number"
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          priority: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full rounded-lg border border-slate-600 bg-slate-700 p-3 text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="h-4 w-4"
                      />
                      <span className="text-sm font-medium text-slate-300">مفعّل</span>
                    </label>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      تاريخ البدء (اختياري)
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full rounded-lg border border-slate-600 bg-slate-700 p-3 text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      تاريخ الانتهاء (اختياري)
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full rounded-lg border border-slate-600 bg-slate-700 p-3 text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <AdTargetingPanel value={targeting} onChange={setTargeting} />

                <AdScheduler value={schedule} onChange={setSchedule} />

                <div className="flex gap-3 border-t border-slate-700 pt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 py-3 font-bold text-white hover:from-amber-600 hover:to-orange-600 disabled:opacity-50"
                  >
                    <CheckCircleIcon className="h-5 w-5" />
                    {isSubmitting ? 'جاري الحفظ...' : 'حفظ الإعلان'}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-700 py-3 font-bold text-white hover:bg-slate-600"
                  >
                    <XCircleIcon className="h-5 w-5" />
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
              <AdPreview adData={getPreviewData()} placement={placement} />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
