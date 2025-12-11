import PlusIcon from '@heroicons/react/24/outline/PlusIcon';
import SparklesIcon from '@heroicons/react/24/outline/SparklesIcon';
import Link from 'next/link';
import React from 'react';

const FeaturedAddListingSection: React.FC = () => {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center text-white">
          <div className="mb-6">
            <SparklesIcon className="mx-auto h-16 w-16 text-yellow-300" />
          </div>

          <h2 className="mb-4 text-3xl font-bold md:text-4xl">أضف إعلانك مجاناً</h2>

          <p className="mb-8 text-lg text-blue-100 md:text-xl">
            انشر إعلانك واصل إلى آلاف المشترين المهتمين في جميع أنحاء ليبيا
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            {/* إضافة سيارة */}
            <div className="rounded-lg bg-white/10 p-6 backdrop-blur-sm transition-all hover:bg-white/20">
              <div className="mb-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                  <PlusIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="mb-2 text-xl font-semibold">بيع سيارتك</h3>
              <p className="mb-4 text-blue-100">أضف إعلان سيارتك بسهولة وسرعة</p>
              <button
                onClick={() => alert('خدمة إضافة الإعلانات غير متوفرة حالياً')}
                className="inline-flex cursor-not-allowed items-center rounded-lg bg-gray-400 px-6 py-3 font-semibold text-white"
              >
                أضف إعلان
                <PlusIcon className="mr-2 h-4 w-4" />
              </button>
            </div>

            {/* المزادات */}
            <div className="rounded-lg bg-white/10 p-6 backdrop-blur-sm transition-all hover:bg-white/20">
              <div className="mb-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                  <SparklesIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="mb-2 text-xl font-semibold">شارك في المزادات</h3>
              <p className="mb-4 text-blue-100">اعرض سيارتك في المزاد للحصول على أفضل سعر</p>
              <Link
                href="/auctions"
                className="inline-flex items-center rounded-lg bg-yellow-400 px-6 py-3 font-semibold text-gray-900 transition-colors hover:bg-yellow-300"
              >
                تصفح المزادات
                <SparklesIcon className="mr-2 h-4 w-4" />
              </Link>
            </div>

            {/* الخدمات */}
            <div className="rounded-lg bg-white/10 p-6 backdrop-blur-sm transition-all hover:bg-white/20">
              <div className="mb-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                  <PlusIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="mb-2 text-xl font-semibold">خدمات النقل</h3>
              <p className="mb-4 text-blue-100">احجز خدمة نقل سيارتك بأمان</p>
              <Link
                href="/transport"
                className="inline-flex items-center rounded-lg bg-green-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-400"
              >
                احجز الآن
                <PlusIcon className="mr-2 h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* إحصائيات سريعة */}
          <div className="mt-12 grid gap-6 md:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-300">1000+</div>
              <div className="text-blue-100">إعلان نشط</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-300">500+</div>
              <div className="text-blue-100">مزاد مكتمل</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-300">50+</div>
              <div className="text-blue-100">معرض سيارات</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-300">24/7</div>
              <div className="text-blue-100">دعم فني</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedAddListingSection;
