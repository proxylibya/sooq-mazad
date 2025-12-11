import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../../../components/AdminLayout';
import AdAnalyticsChart from '../../../../../components/ad-placements/AdAnalyticsChart';
import AdBannerEditor from '../../../../../components/ad-placements/AdBannerEditor';
import AdContentSelector from '../../../../../components/ad-placements/AdContentSelector';
import AdImageUpload from '../../../../../components/ad-placements/AdImageUpload';
import AdScheduler from '../../../../../components/ad-placements/AdScheduler';
import AdSearch from '../../../../../components/ad-placements/AdSearch';
import AdTargetingPanel from '../../../../../components/ad-placements/AdTargetingPanel';
import AdVariantManager from '../../../../../components/ad-placements/AdVariantManager';
import AdVideoUpload from '../../../../../components/ad-placements/AdVideoUpload';

export default function EditPlacementAdPage() {
  const router = useRouter();
  const { id } = router.query;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [ad, setAd] = useState(null);
  const [placement, setPlacement] = useState(null);
  const [contentType, setContentType] = useState('POST');
  const [selectedPost, setSelectedPost] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedVideo, setUploadedVideo] = useState(null);
  const [bannerData, setBannerData] = useState(null);
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
    if (id) {
      fetchAd();
    }
  }, [id]);

  const fetchAd = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/placement-ads/${id}`);
      if (res.ok) {
        const data = await res.json();
        const adData = data.ad;
        setAd(adData);

        // Set form data
        setFormData({
          title: adData.title || '',
          description: adData.description || '',
          linkUrl: adData.linkUrl || '',
          priority: adData.priority || 0,
          isActive: adData.isActive,
          startDate: adData.startDate || '',
          endDate: adData.endDate || '',
        });

        // Set content type
        if (adData.mediaType === 'VIDEO') {
          setContentType('VIDEO');
          setUploadedVideo({
            url: adData.videoUrl,
            thumbnailUrl: adData.videoThumbnail,
            duration: adData.videoDuration,
            autoplay: adData.videoAutoplay,
            muted: adData.videoMuted,
            loop: adData.videoLoop,
          });
        } else if (adData.mediaType === 'BANNER') {
          setContentType('BANNER');
          setBannerData({
            finalUrl: adData.imageUrl,
            width: adData.dimensions?.width,
            height: adData.dimensions?.height,
            aspectRatio: adData.aspectRatio,
            selectedSize: adData.bannerConfig?.selectedSize,
          });
        } else if (adData.imageUrl) {
          setContentType('IMAGE');
          setUploadedImage({ url: adData.imageUrl });
        } else if (adData.entityId) {
          setContentType('POST');
          setSelectedPost({
            id: adData.entityId,
            type: adData.entityType,
            title: adData.title,
            imageUrl: adData.imageUrl,
          });
        } else {
          setContentType('EXTERNAL');
        }

        // Set targeting
        if (adData.targeting) {
          setTargeting(adData.targeting);
        }

        // Fetch placement
        if (adData.placementId) {
          fetchPlacement(adData.placementId);
        }
      }
    } catch (error) {
      console.error('Error fetching ad:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlacement = async (placementId) => {
    try {
      const res = await fetch(`/api/admin/ad-placements/${placementId}`);
      if (res.ok) {
        const data = await res.json();
        setPlacement(data.placement);
      }
    } catch (error) {
      console.error('Error fetching placement:', error);
    }
  };

  const buildAdData = () => {
    const base = {
      title: formData.title,
      description: formData.description,
      priority: parseInt(formData.priority),
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
      };
    }

    if (contentType === 'EXTERNAL') {
      return {
        ...base,
        entityType: 'CUSTOM',
        linkUrl: formData.linkUrl,
        mediaType: 'HTML_EMBED',
      };
    }

    return base;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const adData = buildAdData();

      // Add targeting if set
      if (targeting && Object.keys(targeting).length > 0) {
        adData.targeting = targeting;
      }

      const res = await fetch(`/api/admin/placement-ads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adData),
      });

      if (res.ok) {
        alert('تم تحديث الإعلان بنجاح');
        fetchAd(); // Reload data
      } else {
        const err = await res.json();
        alert(err.error || 'حدث خطأ');
      }
    } catch (error) {
      console.error('Error updating ad:', error);
      alert('حدث خطأ');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="تعديل الإعلان">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!ad) {
    return (
      <AdminLayout title="تعديل الإعلان">
        <div className="rounded-xl border border-red-700 bg-red-900/20 p-6 text-center">
          <XCircleIcon className="mx-auto h-12 w-12 text-red-500" />
          <p className="mt-3 text-red-400">لم يتم العثور على الإعلان</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="تعديل الإعلان">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-white"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          رجوع
        </button>
        <div className="text-right">
          <h1 className="text-2xl font-bold text-white">تعديل الإعلان</h1>
          {placement && <p className="text-sm text-slate-400">{placement.name}</p>}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="space-y-6 lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Content Type Selector */}
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
              <h3 className="mb-4 text-lg font-bold text-white">نوع المحتوى</h3>
              <AdContentSelector value={contentType} onChange={setContentType} />
            </div>

            {/* Content Based on Type */}
            {contentType === 'POST' && (
              <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
                <h3 className="mb-4 text-lg font-bold text-white">اختر المحتوى</h3>
                <AdSearch selectedItem={selectedPost} onSelect={setSelectedPost} />
              </div>
            )}

            {contentType === 'VIDEO' && (
              <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
                <h3 className="mb-4 text-lg font-bold text-white">فيديو إعلاني</h3>
                <AdVideoUpload value={uploadedVideo} onChange={setUploadedVideo} />
              </div>
            )}

            {contentType === 'BANNER' && (
              <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
                <h3 className="mb-4 text-lg font-bold text-white">بنر احترافي</h3>
                <AdBannerEditor value={bannerData} onChange={setBannerData} placement={placement} />
              </div>
            )}

            {contentType === 'IMAGE' && (
              <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
                <h3 className="mb-4 text-lg font-bold text-white">صورة الإعلان</h3>
                <AdImageUpload value={uploadedImage} onChange={setUploadedImage} />
              </div>
            )}

            {/* Basic Info */}
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
              <h3 className="mb-4 text-lg font-bold text-white">معلومات الإعلان</h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">العنوان</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 p-3 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">الوصف</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 p-3 text-white focus:border-amber-500 focus:outline-none"
                    rows={3}
                  />
                </div>

                {(contentType === 'VIDEO' ||
                  contentType === 'BANNER' ||
                  contentType === 'IMAGE' ||
                  contentType === 'EXTERNAL') && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      الرابط المستهدف
                    </label>
                    <input
                      type="url"
                      value={formData.linkUrl}
                      onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                      className="w-full rounded-lg border border-slate-600 bg-slate-700 p-3 text-white focus:border-amber-500 focus:outline-none"
                      placeholder="https://..."
                    />
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    الأولوية (الأعلى يظهر أولاً)
                  </label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 p-3 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <span className="text-sm font-medium text-slate-300">مفعّل</span>
                </div>
              </div>
            </div>

            {/* Targeting */}
            <AdTargetingPanel value={targeting} onChange={setTargeting} />

            {/* Scheduler */}
            <AdScheduler value={schedule} onChange={setSchedule} />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-4 text-lg font-bold text-white hover:from-amber-600 hover:to-orange-600 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-6 w-6" />
                  حفظ التغييرات
                </>
              )}
            </button>
          </form>
        </div>

        {/* Sidebar - Analytics & Variants */}
        <div className="space-y-6">
          {/* Analytics */}
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <h3 className="mb-4 text-lg font-bold text-white">التحليلات</h3>
            <AdAnalyticsChart placementAdId={id} dateRange={7} />
          </div>

          {/* A/B Testing Variants */}
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <h3 className="mb-4 text-lg font-bold text-white">اختبارات A/B</h3>
            <AdVariantManager placementAdId={id} />
          </div>

          {/* Quick Stats */}
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <h3 className="mb-4 text-lg font-bold text-white">إحصائيات سريعة</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">المشاهدات</span>
                <span className="font-bold text-white">
                  {ad.impressions?.toLocaleString() || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">النقرات</span>
                <span className="font-bold text-white">{ad.clicks?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">معدل النقر</span>
                <span className="font-bold text-amber-500">
                  {ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">المشاهدات الفريدة</span>
                <span className="font-bold text-white">
                  {ad.uniqueViews?.toLocaleString() || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
