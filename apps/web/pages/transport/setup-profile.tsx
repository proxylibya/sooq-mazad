import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import TruckIcon from '@heroicons/react/24/outline/TruckIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import XCircleIcon from '@heroicons/react/24/outline/XCircleIcon';
import { OpensooqNavbar, BackButton } from '../../components/common';

interface TransportProfileData {
  truckNumber: string;
  licenseCode: string;
  truckType: string;
  capacity: number;
  serviceArea: string;
  priceType: string;
  pricePerKm?: number | string | null;
}

export default function SetupTransportProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [profileData, setProfileData] = useState<TransportProfileData>({
    truckNumber: '',
    licenseCode: '',
    truckType: 'متوسطة',
    capacity: 4,
    serviceArea: 'طرابلس',
    priceType: 'fixed',
  });

  const truckTypes = [
    { value: 'صغيرة', label: 'ساحبة صغيرة (1-2 سيارات)', capacity: 2 },
    { value: 'متوسطة', label: 'ساحبة متوسطة (3-4 سيارات)', capacity: 4 },
    { value: 'كبيرة', label: 'ساحبة كبيرة (5-8 سيارات)', capacity: 8 },
    { value: 'فاخرة', label: 'ساحبة فاخرة (سيارات خاصة)', capacity: 2 },
  ];

  const serviceAreas = [
    'طرابلس',
    'بنغازي',
    'مصراتة',
    'الزاوية',
    'البيضاء',
    'طبرق',
    'الخمس',
    'زليتن',
    'صبراتة',
    'غريان',
    'جميع أنحاء ليبيا',
  ];

  const handleInputChange = (field: keyof TransportProfileData, value: string | number) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // تحديث السعة تلقائياً عند تغيير نوع الشاحنة
    if (field === 'truckType') {
      const selectedType = truckTypes.find((type) => type.value === value);
      if (selectedType) {
        setProfileData((prev) => ({
          ...prev,
          capacity: selectedType.capacity,
        }));
      }
    }
  };

  const validateForm = (): string | null => {
    if (!profileData.truckNumber.trim()) {
      return 'رقم الشاحنة مطلوب';
    }
    if (!profileData.licenseCode.trim()) {
      return 'رمز الرخصة مطلوب';
    }
    if (!profileData.truckType) {
      return 'نوع الشاحنة مطلوب';
    }
    if (!profileData.capacity || profileData.capacity < 1) {
      return 'السعة يجب أن تكون أكبر من صفر';
    }
    if (!profileData.serviceArea) {
      return 'منطقة الخدمة مطلوبة';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login-password');
        return;
      }

      const response = await fetch('/api/transport/profile', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          truckNumber: profileData.truckNumber.trim(),
          licenseCode: profileData.licenseCode.trim(),
          truckType: profileData.truckType,
          capacity: profileData.capacity,
          serviceArea: profileData.serviceArea,
          pricePerKm: profileData.pricePerKm ? Number(profileData.pricePerKm) : null,
          priceType: profileData.priceType,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('تم إنشاء ملف النقل بنجاح!');
        setTimeout(() => {
          router.push('/transport/dashboard');
        }, 2000);
      } else {
        setError(data.error || 'فشل في إنشاء ملف النقل');
      }
    } catch (error) {
      console.error('خطأ في إنشاء ملف النقل:', error);
      setError('خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>إنشاء ملف النقل | موقع مزاد السيارات</title>
        <meta name="description" content="إنشاء ملف النقل الخاص بك لتقديم خدمات نقل السيارات" />
      </Head>

      <div className="min-h-screen bg-gray-50" dir="rtl">
        <OpensooqNavbar />

        <div className="mx-auto max-w-2xl px-4 py-8">
          <div className="overflow-hidden rounded-xl bg-white shadow-lg">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-white/20 p-3">
                  <TruckIcon className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">إنشاء ملف النقل</h1>
                  <p className="text-blue-100">املأ البيانات التالية لإنشاء ملف النقل الخاص بك</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6 p-6">
              {/* Success Message */}
              {success && (
                <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  <p className="text-green-800">{success}</p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                  <XCircleIcon className="h-5 w-5 text-red-600" />
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              {/* Truck Number */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  رقم الشاحنة *
                </label>
                <input
                  type="text"
                  value={profileData.truckNumber}
                  onChange={(e) => handleInputChange('truckNumber', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  placeholder="أدخل رقم الشاحنة"
                  required
                />
              </div>

              {/* License Code */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">رمز الرخصة *</label>
                <input
                  type="text"
                  value={profileData.licenseCode}
                  onChange={(e) => handleInputChange('licenseCode', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  placeholder="أدخل رمز رخصة القيادة"
                  required
                />
              </div>

              {/* Truck Type */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  نوع الشاحنة *
                </label>
                <select
                  value={profileData.truckType}
                  onChange={(e) => handleInputChange('truckType', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {truckTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Capacity */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  السعة (عدد السيارات) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={profileData.capacity}
                  onChange={(e) => handleInputChange('capacity', Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Service Area */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  منطقة الخدمة *
                </label>
                <select
                  value={profileData.serviceArea}
                  onChange={(e) => handleInputChange('serviceArea', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {serviceAreas.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? 'جاري الإنشاء...' : 'إنشاء ملف النقل'}
                </button>
                <BackButton
                  onClick={() => router.back()}
                  text="إلغاء"
                  variant="gray"
                  size="md"
                  className="justify-center"
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
