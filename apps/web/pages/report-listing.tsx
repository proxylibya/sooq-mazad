import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { OpensooqNavbar, BackButton } from '../components/common';

const ReportListingPage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    listingId: router.query.id || '',
    listingTitle: router.query.title || '',
    reportType: '',
    description: '',
    contactEmail: '',
    evidence: '',
  });

  const reportTypes = [
    { value: 'fake', label: 'إعلان مزيف أو احتيالي' },
    { value: 'inappropriate', label: 'محتوى غير مناسب' },
    { value: 'spam', label: 'رسائل مزعجة أو إعلانات متكررة' },
    { value: 'wrong_category', label: 'تصنيف خاطئ' },
    { value: 'expired', label: 'إعلان منتهي الصلاحية' },
    { value: 'duplicate', label: 'إعلان مكرر' },
    { value: 'other', label: 'أخرى' },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // محاكاة إرسال البلاغ
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);

      setTimeout(() => {
        router.push('/marketplace');
      }, 3000);
    }, 2000);
  };

  return (
    <>
      <Head>
        <title>الإبلاغ عن مشكلة - مزاد السيارات</title>
      </Head>

      <OpensooqNavbar />

      <div className="min-h-screen bg-gray-50" dir="rtl">
        <div className="mx-auto max-w-2xl px-4 py-8">
          {/* رأس الصفحة */}
          <div className="mb-8 flex items-center gap-4">
            <BackButton onClick={() => router.back()} text="العودة" size="sm" variant="gray" />
            <h1 className="text-2xl font-bold text-gray-900">الإبلاغ عن مشكلة</h1>
          </div>

          {showSuccess ? (
            <div className="rounded-xl bg-white p-8 text-center shadow-lg">
              <CheckCircleIcon className="mx-auto mb-4 h-16 w-16 text-green-500" />
              <h2 className="mb-2 text-xl font-semibold text-gray-900">تم إرسال البلاغ بنجاح!</h2>
              <p className="mb-4 text-gray-600">
                شكراً لك على مساعدتنا في الحفاظ على جودة الموقع. سنراجع البلاغ ونتخذ الإجراء
                المناسب.
              </p>
              <div
                      className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                      style={{ width: 24, height: 24 }}
                      role="status"
                      aria-label="جاري التحميل"
                    />
              <p className="mt-4 text-sm text-gray-500">جاري التوجيه للصفحة الرئيسية...</p>
            </div>
          ) : (
            <div className="rounded-xl bg-white p-8 shadow-lg">
              <div className="mb-6 flex items-center gap-3">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
                <h2 className="text-xl font-semibold text-gray-900">الإبلاغ عن مشكلة في الإعلان</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* معلومات الإعلان */}
                {(formData.listingId || formData.listingTitle) && (
                  <div className="rounded-lg bg-gray-50 p-4">
                    <h3 className="mb-2 font-medium text-gray-900">معلومات الإعلان</h3>
                    {formData.listingTitle && (
                      <p className="mb-1 text-gray-600">
                        <span className="font-medium">العنوان:</span> {formData.listingTitle}
                      </p>
                    )}
                    {formData.listingId && (
                      <p className="text-gray-600">
                        <span className="font-medium">رقم الإعلان:</span> {formData.listingId}
                      </p>
                    )}
                  </div>
                )}

                {/* نوع المشكلة */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    نوع المشكلة *
                  </label>
                  <select
                    value={formData.reportType}
                    onChange={(e) => handleInputChange('reportType', e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">اختر نوع المشكلة</option>
                    {reportTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* وصف المشكلة */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    وصف المشكلة *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    required
                    rows={5}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder="اشرح المشكلة بالتفصيل لمساعدتنا في فهمها وحلها..."
                  />
                </div>

                {/* البريد الإلكتروني */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    البريد الإلكتروني (اختياري)
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder="your@email.com"
                  />
                  <p className="mt-1 text-sm text-gray-500">إذا كنت ترغب في متابعة حالة البلاغ</p>
                </div>

                {/* أدلة إضافية */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    أدلة إضافية (اختياري)
                  </label>
                  <textarea
                    value={formData.evidence}
                    onChange={(e) => handleInputChange('evidence', e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder="أي معلومات إضافية أو روابط قد تساعد في فهم المشكلة..."
                  />
                </div>

                {/* ملاحظة مهمة */}
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-start gap-3">
                    <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 text-blue-600" />
                    <div>
                      <h4 className="mb-1 font-medium text-blue-900">ملاحظة مهمة</h4>
                      <p className="text-sm text-blue-800">
                        نحن نراجع جميع البلاغات بعناية. الإبلاغات الكاذبة أو الضارة قد تؤدي إلى
                        تعليق حسابك. تأكد من صحة معلوماتك قبل الإرسال.
                      </p>
                    </div>
                  </div>
                </div>

                {/* أزرار الإجراءات */}
                <div className="flex gap-4 pt-4">
                  <BackButton
                    onClick={() => router.back()}
                    text="إلغاء"
                    variant="gray"
                    size="md"
                    className="flex-1 justify-center"
                  />

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        جاري الإرسال...
                      </>
                    ) : (
                      <>
                        <ExclamationTriangleIcon className="h-5 w-5" />
                        إرسال البلاغ
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ReportListingPage;
