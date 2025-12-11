import {
  CalendarIcon,
  CheckCircleIcon,
  PhotoIcon,
  UserIcon,
  VideoCameraIcon,
} from '@heroicons/react/24/outline';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import AdminLayout from '../../../../components/AdminLayout';
import AdBannerEditor from '../../../../components/ad-placements/AdBannerEditor';
import AdVideoUpload from '../../../../components/ad-placements/AdVideoUpload';

export default function CreateCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [creativeType, setCreativeType] = useState<'image' | 'video'>('image');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    package: '',
    startDate: '',
    endDate: '',
    creative: null,
  });
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const res = await fetch('/api/admin/ads/packages?isActive=true');
      const data = await res.json();
      if (data.packages) {
        setPackages(data.packages);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  };

  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => setStep((prev) => prev - 1);

  const handleCreate = async () => {
    if (!formData.name || !formData.startDate || !formData.endDate || !formData.creative) {
      alert('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/ads/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          creativeType,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert('تم إنشاء الحملة بنجاح!');
        router.push('/admin/ads/campaigns');
      } else {
        alert(data.message || 'حدث خطأ أثناء إنشاء الحملة');
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('حدث خطأ في الاتصال بالخادم');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout title="إنشاء حملة إعلانية">
      <Head>
        <title>حملة جديدة | سوق مزاد</title>
      </Head>

      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">إنشاء حملة إعلانية جديدة</h1>
          <p className="text-slate-400">اتبع الخطوات لإنشاء وإطلاق حملة إعلانية</p>
        </div>

        {/* Steps Indicator */}
        <div className="mb-8 flex items-center justify-between rounded-2xl border border-slate-700 bg-slate-800 px-8 py-4">
          {[
            { id: 1, label: 'التفاصيل', icon: UserIcon },
            { id: 2, label: 'التصميم', icon: PhotoIcon },
            { id: 3, label: 'الجدولة', icon: CalendarIcon },
            { id: 4, label: 'المراجعة', icon: CheckCircleIcon },
          ].map((s) => (
            <div
              key={s.id}
              className={`flex items-center gap-2 ${
                step >= s.id ? 'text-amber-500' : 'text-slate-500'
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                  step >= s.id
                    ? 'border-amber-500 bg-amber-500 text-white'
                    : 'border-slate-600 bg-transparent'
                }`}
              >
                {step > s.id ? <CheckCircleIcon className="h-5 w-5" /> : s.id}
              </div>
              <span className="hidden font-medium sm:block">{s.label}</span>
              {s.id < 4 && (
                <div
                  className={`mx-4 h-0.5 w-12 ${step > s.id ? 'bg-amber-500' : 'bg-slate-700'}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="rounded-2xl border border-slate-700 bg-slate-800 p-8">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white">تفاصيل الحملة</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    اسم الحملة
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 p-3 text-white focus:border-amber-500 focus:outline-none"
                    placeholder="مثال: حملة رمضان 2024"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    العميل / المعلن
                  </label>
                  <input
                    type="text"
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 p-3 text-white focus:border-amber-500 focus:outline-none"
                    placeholder="ابحث عن مستخدم أو شركة..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    الباقة الإعلانية
                  </label>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {packages.length > 0 ? (
                      packages.map((pkg: any) => (
                        <button
                          key={pkg.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, package: pkg.name })}
                          className={`rounded-xl border-2 p-4 text-right transition-all ${
                            formData.package === pkg.name
                              ? 'border-amber-500 bg-amber-500/10'
                              : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                          }`}
                        >
                          <div className="font-bold text-white">{pkg.name}</div>
                          <div className="text-sm text-slate-400">
                            {pkg.price} د.ل - {pkg.duration} يوم
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="col-span-3 text-center text-slate-400">
                        لا توجد باقات متاحة. يرجى إنشاء باقات أولاً.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white">تصميم الإعلان</h2>

              {/* Creative Type Selector */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setCreativeType('image')}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all ${
                    creativeType === 'image'
                      ? 'border-amber-500 bg-amber-500/10 text-amber-500'
                      : 'border-slate-600 bg-slate-700/50 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <PhotoIcon className="h-6 w-6" />
                  <span className="font-bold">صورة / بانر</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCreativeType('video')}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all ${
                    creativeType === 'video'
                      ? 'border-amber-500 bg-amber-500/10 text-amber-500'
                      : 'border-slate-600 bg-slate-700/50 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <VideoCameraIcon className="h-6 w-6" />
                  <span className="font-bold">فيديو</span>
                </button>
              </div>

              {/* Editor */}
              <div className="mt-6">
                {creativeType === 'image' ? (
                  <AdBannerEditor
                    value={formData.creative}
                    onChange={(creative) => setFormData({ ...formData, creative })}
                    placement={{ name: 'الصفحة الرئيسية', width: 1200, height: 400 }}
                  />
                ) : (
                  <AdVideoUpload
                    value={formData.creative}
                    onChange={(creative) => setFormData({ ...formData, creative })}
                  />
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white">الجدولة والاستهداف</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    تاريخ البدء
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 p-3 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    تاريخ الانتهاء
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 p-3 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white">مراجعة الحملة</h2>
              <div className="rounded-xl border border-slate-600 bg-slate-700/50 p-6">
                <dl className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm text-slate-400">اسم الحملة</dt>
                    <dd className="text-lg font-bold text-white">{formData.name || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-slate-400">العميل</dt>
                    <dd className="text-lg font-bold text-white">{formData.client || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-slate-400">الباقة</dt>
                    <dd className="text-lg font-bold text-amber-500">{formData.package || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-slate-400">نوع الإعلان</dt>
                    <dd className="text-lg font-bold text-white">
                      {creativeType === 'image' ? 'صورة / بانر' : 'فيديو'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-slate-400">المدة</dt>
                    <dd className="text-lg font-bold text-white">
                      {formData.startDate} إلى {formData.endDate}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between border-t border-slate-700 pt-6">
            <button
              onClick={handleBack}
              disabled={step === 1 || isSubmitting}
              className="rounded-xl border border-slate-600 px-6 py-2 font-bold text-slate-300 hover:bg-slate-700 disabled:opacity-50"
            >
              السابق
            </button>
            <button
              onClick={step === 4 ? handleCreate : handleNext}
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-amber-500 px-8 py-2 font-bold text-white hover:bg-amber-600 disabled:opacity-50"
            >
              {isSubmitting && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              )}
              {step === 4 ? 'تأكيد وإنشاء' : 'التالي'}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
