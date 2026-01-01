import React from 'react';
import { Phone, MapPin, Eye, Heart, Calendar } from 'lucide-react';

const ImprovedCarCard = () => {
  return (
    <div className="mx-auto max-w-4xl rounded-2xl border border-gray-200 bg-white shadow-lg transition-shadow duration-300 hover:shadow-xl">
      {/* Header Section */}
      <div className="rounded-t-2xl border-b border-gray-200 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 px-6 py-5">
        <h2 className="text-2xl font-bold text-white drop-shadow-sm">نيسان باثفايندر 2022</h2>
        <p className="mt-1 flex items-center gap-2 text-sm text-blue-50">
          <span className="rounded-full bg-white/20 px-3 py-0.5 font-medium backdrop-blur-sm">
            رقم الإعلان: cmgadpyu50007vg3csiz3uozs
          </span>
        </p>
      </div>

      <div className="p-6">
        {/* Main Info Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Car Information */}
          <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-5 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
              <div className="h-1 w-1 rounded-full bg-blue-600"></div>
              معلومات السيارة
            </h3>
            <div className="space-y-3">
              {[
                { label: 'الماركة', value: 'نيسان' },
                { label: 'الموديل', value: 'باثفايندر' },
                { label: 'السنة', value: '2022' },
                { label: 'المسافة', value: '68,000 كم' },
                { label: 'اللون', value: 'فضي' },
                { label: 'الحالة', value: 'مستعملة' },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg bg-white px-4 py-2.5 shadow-sm transition-all duration-200 hover:shadow-md"
                >
                  <span className="text-sm font-semibold text-gray-700">{item.label}:</span>
                  <span className="text-sm font-bold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sale Information */}
          <div className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 p-5 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
              <div className="h-1 w-1 rounded-full bg-green-600"></div>
              معلومات البيع
            </h3>
            <div className="space-y-3">
              {/* Price - Highlighted */}
              <div className="rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 p-4 shadow-md">
                <span className="block text-xs font-medium text-green-100">السعر:</span>
                <span className="mt-1 block text-3xl font-black text-white drop-shadow-sm">
                  55,000 د.ل
                </span>
              </div>

              {[
                { label: 'البائع', value: 'غير محدد' },
                { label: 'نوع البائع', value: 'فرد' },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg bg-white px-4 py-2.5 shadow-sm transition-all duration-200 hover:shadow-md"
                >
                  <span className="text-sm font-semibold text-gray-700">{item.label}:</span>
                  <span className="text-sm font-bold text-gray-900">{item.value}</span>
                </div>
              ))}

              {/* Phone */}
              <div className="flex items-center justify-between rounded-lg bg-white px-4 py-2.5 shadow-sm transition-all duration-200 hover:shadow-md">
                <span className="text-sm font-semibold text-gray-700">الهاتف:</span>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-green-600" />
                  <span className="font-mono text-sm font-bold text-gray-900" dir="ltr">
                    950000000
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Location Section */}
        <div className="mt-6 rounded-xl border-2 border-green-300 bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 p-5 shadow-md">
          <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-green-900">
            <MapPin className="h-5 w-5 text-green-700" />
            الموقع
          </h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-lg bg-white/60 p-3 backdrop-blur-sm">
              <span className="block text-xs font-medium text-green-700">المدينة:</span>
              <p className="mt-1 text-base font-bold text-green-900">صبراتة</p>
            </div>
            <div className="rounded-lg bg-white/60 p-3 backdrop-blur-sm">
              <span className="block text-xs font-medium text-green-700">العنوان:</span>
              <p className="mt-1 text-base font-bold text-green-900">صبراتة</p>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="mt-6 rounded-xl bg-gray-50 p-5 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-gray-900">
            <div className="h-1 w-1 rounded-full bg-gray-600"></div>
            الوصف
          </h3>
          <p className="text-sm leading-relaxed text-gray-700">
            هذا الرقم للمهتمين بالسيارة. سيارة بحالة ممتازة ونظيفة جداً، تم الاعتناء بها بشكل
            منتظم. جميع الأوراق سليمة والسيارة جاهزة للاستخدام الفوري.
          </p>
        </div>

        {/* Statistics Section */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          {/* Views */}
          <div className="group rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-4 text-center shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <Eye className="mx-auto h-6 w-6 text-blue-600 transition-transform duration-300 group-hover:scale-110" />
            <p className="mt-2 text-2xl font-black text-blue-900">0</p>
            <p className="mt-1 text-xs font-medium text-blue-700">مشاهدة</p>
          </div>

          {/* Favorites */}
          <div className="group rounded-xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-pink-100 p-4 text-center shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <Heart className="mx-auto h-6 w-6 text-red-600 transition-transform duration-300 group-hover:scale-110" />
            <p className="mt-2 text-2xl font-black text-red-900">0</p>
            <p className="mt-1 text-xs font-medium text-red-700">مفضل</p>
          </div>

          {/* Created Date */}
          <div className="group rounded-xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-4 text-center shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <Calendar className="mx-auto h-6 w-6 text-gray-600 transition-transform duration-300 group-hover:scale-110" />
            <p className="mt-2 text-sm font-black text-gray-900">10/3/2025</p>
            <p className="mt-1 text-xs font-medium text-gray-700">تاريخ الإنشاء</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6">
          <button className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-base font-bold text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl active:scale-[0.98]">
            اتصل بالبائع
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImprovedCarCard;
