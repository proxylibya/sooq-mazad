import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Layout, BackButton } from '../../../components/common';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import { toast } from 'react-hot-toast';

interface ListingData {
  id: string;
  title?: string;
  brand?: string;
  model?: string;
  year?: number;
  price?: number;
  description?: string;
  condition?: string;
  fuelType?: string;
  transmission?: string;
  mileage?: number;
  location?: string;
  city?: string;
  area?: string;
  images?: string[];
  [key: string]: string | number | string[] | undefined;
}

const EditListingPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [_listingType, setListingType] = useState<'car' | 'auction' | null>(null);
  const [formData, setFormData] = useState<ListingData>({
    id: '',
    title: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    price: 0,
    description: '',
    condition: 'مستعمل',
    fuelType: 'بنزين',
    transmission: 'أوتوماتيك',
    mileage: 0,
    city: 'طرابلس',
    area: '',
  });

  const fetchListingData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/listings/${id}/get`);
      const result = await response.json();

      if (result.success) {
        setListingType(result.type);
        const data = result.data;
        
        // تحديد البيانات حسب النوع
        if (result.type === 'car') {
          setFormData({
            id: data.id,
            title: data.title || '',
            brand: data.brand || '',
            model: data.model || '',
            year: data.year || new Date().getFullYear(),
            price: data.price || 0,
            description: data.description || '',
            condition: data.condition || 'مستعمل',
            fuelType: data.fuelType || 'بنزين',
            transmission: data.transmission || 'أوتوماتيك',
            mileage: data.mileage || 0,
            city: typeof data.location === 'string' ? data.location : (data.city || 'طرابلس'),
            area: data.area || '',
            images: data.images || [],
          });
        } else if (result.type === 'auction') {
          const car = data.car || {};
          setFormData({
            id: data.id,
            title: data.title || car.title || '',
            brand: car.brand || '',
            model: car.model || '',
            year: car.year || new Date().getFullYear(),
            price: data.startingPrice || 0,
            description: data.description || car.description || '',
            condition: car.condition || 'مستعمل',
            fuelType: car.fuelType || 'بنزين',
            transmission: car.transmission || 'أوتوماتيك',
            mileage: car.mileage || 0,
            city: typeof car.location === 'string' ? car.location : (car.city || 'طرابلس'),
            area: car.area || '',
            images: car.images || [],
          });
        }
      } else {
        toast.error('فشل في تحميل بيانات الإعلان');
        router.push('/my-account?tab=listings');
      }
    } catch (error) {
      console.error('خطأ في تحميل البيانات:', error);
      toast.error('حدث خطأ أثناء تحميل البيانات');
      router.push('/my-account?tab=listings');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (id) {
      fetchListingData();
    }
  }, [id, fetchListingData]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // التحقق من البيانات
    if (!formData.title || !formData.price) {
      toast.error('يرجى ملء العنوان والسعر على الأقل');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/listings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('تم تحديث الإعلان بنجاح');
        router.push('/my-account?tab=listings');
      } else {
        toast.error(result.error || 'فشل في تحديث الإعلان');
      }
    } catch (error) {
      console.error('خطأ في الحفظ:', error);
      toast.error('حدث خطأ أثناء حفظ التعديلات');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  // تم إزالة spinner - UnifiedPageTransition يتولى ذلك
  if (loading) return null;

  return (
    <Layout title="تحرير الإعلان" description="تحرير بيانات الإعلان">
      <Head>
        <title>تحرير الإعلان - سوق مزاد</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8 select-none">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <BackButton onClick={handleBack} text="العودة" variant="gray" size="sm" />
          </div>

          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">تحرير الإعلان</h1>
            <p className="mt-2 text-gray-600">قم بتحديث بيانات إعلانك</p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-lg">
            <div className="space-y-6">
              {/* المعلومات الأساسية */}
              <div>
                <h3 className="mb-4 text-lg font-semibold text-gray-900">المعلومات الأساسية</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">عنوان الإعلان *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="مثال: تويوتا كامري 2020"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">السعر (د.ل) *</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">الماركة</label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => handleInputChange('brand', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="تويوتا، هوندا، إلخ"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">الموديل</label>
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => handleInputChange('model', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="كامري، أكورد، إلخ"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">سنة الصنع</label>
                    <input
                      type="number"
                      value={formData.year}
                      onChange={(e) => handleInputChange('year', parseInt(e.target.value) || new Date().getFullYear())}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      min="1950"
                      max={new Date().getFullYear() + 1}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">المسافة المقطوعة (كم)</label>
                    <input
                      type="number"
                      value={formData.mileage}
                      onChange={(e) => handleInputChange('mileage', parseInt(e.target.value) || 0)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">الحالة</label>
                    <select
                      value={formData.condition}
                      onChange={(e) => handleInputChange('condition', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="جديد">جديد</option>
                      <option value="مستعمل">مستعمل</option>
                      <option value="تحتاج صيانة">تحتاج صيانة</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">نوع الوقود</label>
                    <select
                      value={formData.fuelType}
                      onChange={(e) => handleInputChange('fuelType', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="بنزين">بنزين</option>
                      <option value="ديزل">ديزل</option>
                      <option value="كهربائي">كهربائي</option>
                      <option value="هجين">هجين</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">ناقل الحركة</label>
                    <select
                      value={formData.transmission}
                      onChange={(e) => handleInputChange('transmission', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="أوتوماتيك">أوتوماتيك</option>
                      <option value="يدوي">يدوي</option>
                      <option value="متغير مستمر">متغير مستمر</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">المدينة</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="طرابلس، بنغازي، إلخ"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">المنطقة</label>
                    <input
                      type="text"
                      value={formData.area}
                      onChange={(e) => handleInputChange('area', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="حي الأندلس، إلخ"
                    />
                  </div>
                </div>
              </div>

              {/* الوصف */}
              <div>
                <h3 className="mb-4 text-lg font-semibold text-gray-900">الوصف</h3>
                <textarea
                  rows={6}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="اكتب وصفاً تفصيلياً للسيارة..."
                />
              </div>

              {/* الأزرار */}
              <div className="flex gap-4 border-t border-gray-200 pt-6">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 rounded-lg bg-green-600 px-6 py-3 text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <div className="flex items-center justify-center gap-2">
                      <div
                      className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                      style={{ width: 24, height: 24 }}
                      role="status"
                      aria-label="جاري التحميل"
                    />
                      <span>جاري الحفظ...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircleIcon className="h-5 w-5" />
                      <span>حفظ التعديلات</span>
                    </div>
                  )}
                </button>

                <button
                  onClick={handleBack}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-6 py-3 text-gray-700 transition-colors hover:bg-gray-50"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EditListingPage;
