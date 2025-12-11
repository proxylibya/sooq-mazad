import React, { useState } from 'react';

interface InspectionReportData {
  hasReport: boolean;
  reportUrl?: string | null;
  reportFileName?: string | null;
  manualData?: {
    engineCondition?: string;
    bodyCondition?: string;
    interiorCondition?: string;
    tiresCondition?: string;
    electricalCondition?: string;
    overallRating?: string;
    notes?: string;
  } | null;
}

interface InspectionReportProps {
  inspectionReport: InspectionReportData;
  className?: string;
}

const InspectionReport: React.FC<InspectionReportProps> = ({
  inspectionReport,
  className = '',
}) => {
  const [showDetailedModal, setShowDetailedModal] = useState(false);

  // لا تعرض المكون إذا لم يكن هناك تقرير
  if (!inspectionReport?.hasReport) {
    return null;
  }

  // دالة لتحديد نوع الملف
  const getFileType = (fileName: string | null | undefined): 'pdf' | 'image' | 'unknown' => {
    if (!fileName) return 'unknown';
    const extension = fileName.toLowerCase().split('.').pop();
    if (extension === 'pdf') return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) return 'image';
    return 'unknown';
  };

  const fileType = getFileType(inspectionReport.reportFileName);

  const handleViewReport = () => {
    // إذا كان هناك ملف مرفوع، فتحه مباشرة في تاب جديدة
    if (inspectionReport.reportUrl) {
      window.open(inspectionReport.reportUrl, '_blank');
      return;
    }

    // إذا كان هناك بيانات يدوية فقط، عرض المودال المحلي
    if (inspectionReport.manualData) {
      setShowDetailedModal(true);
      return;
    }

    // في حالة عدم وجود أي بيانات
    console.warn('لا توجد بيانات تقرير فحص متاحة');
  };

  return (
    <div className={`rounded-lg border border-gray-200 bg-white p-4 shadow-sm ${className}`}>
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="h-5 w-5 text-green-600"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
          />
        </svg>
        <h3 className="text-base font-semibold text-gray-900">تقرير الفحص</h3>
        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
          متوفر
        </span>
      </div>

      {/* Description */}
      <p className="mb-3 text-sm text-gray-600">
        تم فحص هذه السيارة من قبل خبراء معتمدين في ساحة الأمانة للسيارات
      </p>

      {/* Manual Report Summary */}
      {inspectionReport.manualData && (
        <div className="mb-3 rounded-md bg-gray-50 p-3">
          <h4 className="mb-2 text-sm font-medium text-gray-800">ملخص الفحص:</h4>
          <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
            {inspectionReport.manualData.engineCondition && (
              <div className="flex justify-between">
                <span className="text-gray-600">حالة المحرك:</span>
                <span className="font-medium">{inspectionReport.manualData.engineCondition}</span>
              </div>
            )}
            {inspectionReport.manualData.bodyCondition && (
              <div className="flex justify-between">
                <span className="text-gray-600">حالة الهيكل:</span>
                <span className="font-medium">{inspectionReport.manualData.bodyCondition}</span>
              </div>
            )}
            {inspectionReport.manualData.interiorCondition && (
              <div className="flex justify-between">
                <span className="text-gray-600">حالة الداخلية:</span>
                <span className="font-medium">{inspectionReport.manualData.interiorCondition}</span>
              </div>
            )}
            {inspectionReport.manualData.tiresCondition && (
              <div className="flex justify-between">
                <span className="text-gray-600">حالة الإطارات:</span>
                <span className="font-medium">{inspectionReport.manualData.tiresCondition}</span>
              </div>
            )}
            {inspectionReport.manualData.electricalCondition && (
              <div className="flex justify-between">
                <span className="text-gray-600">النظام الكهربائي:</span>
                <span className="font-medium">
                  {inspectionReport.manualData.electricalCondition}
                </span>
              </div>
            )}
            {inspectionReport.manualData.overallRating && (
              <div className="flex justify-between">
                <span className="text-gray-600">التقييم العام:</span>
                <span className="font-medium text-green-600">
                  {inspectionReport.manualData.overallRating}
                </span>
              </div>
            )}
          </div>

          {/* Notes */}
          {inspectionReport.manualData.notes && (
            <div className="mt-2 rounded-md bg-blue-50 p-2">
              <p className="text-xs text-blue-800">
                <span className="font-medium">ملاحظات: </span>
                {inspectionReport.manualData.notes}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          onClick={handleViewReport}
          className="flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="h-4 w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
          </svg>
          {inspectionReport.reportUrl ? 'عرض تقرير الفحص الكامل' : 'عرض تفاصيل الفحص'}
        </button>

        {inspectionReport.reportFileName && inspectionReport.reportUrl && (
          <a
            href={inspectionReport.reportUrl}
            download={inspectionReport.reportFileName}
            className="flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
            تحميل التقرير
          </a>
        )}
      </div>

      {/* Modal لعرض التقرير المفصل */}
      {showDetailedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900">تقرير الفحص الكامل</h2>
              <button
                onClick={() => setShowDetailedModal(false)}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* عرض الصورة المرفوعة إذا كانت موجودة */}
              {inspectionReport.reportUrl && fileType === 'image' && (
                <div className="mb-6">
                  <h3 className="mb-3 text-lg font-semibold text-gray-900">صورة تقرير الفحص</h3>
                  <div className="rounded-lg border border-gray-200 p-2">
                    <img
                      src={inspectionReport.reportUrl}
                      alt="تقرير الفحص"
                      className="w-full rounded-md object-contain"
                      style={{ maxHeight: '500px' }}
                    />
                  </div>
                  {inspectionReport.reportFileName && (
                    <p className="mt-2 text-sm text-gray-600">
                      اسم الملف: {inspectionReport.reportFileName}
                    </p>
                  )}
                </div>
              )}

              {inspectionReport.manualData ? (
                <div className="space-y-6">
                  {/* التقييم العام */}
                  {inspectionReport.manualData.overallRating && (
                    <div className="rounded-lg bg-green-50 p-4 text-center">
                      <h3 className="mb-2 text-lg font-semibold text-green-800">التقييم العام</h3>
                      <div className="text-3xl font-bold text-green-600">
                        {inspectionReport.manualData.overallRating}
                      </div>
                    </div>
                  )}

                  {/* تفاصيل الفحص */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {inspectionReport.manualData.engineCondition && (
                      <div className="rounded-lg border border-gray-200 p-4">
                        <h4 className="mb-2 font-semibold text-gray-800">حالة المحرك</h4>
                        <p className="text-gray-600">
                          {inspectionReport.manualData.engineCondition}
                        </p>
                      </div>
                    )}

                    {inspectionReport.manualData.bodyCondition && (
                      <div className="rounded-lg border border-gray-200 p-4">
                        <h4 className="mb-2 font-semibold text-gray-800">حالة الهيكل</h4>
                        <p className="text-gray-600">{inspectionReport.manualData.bodyCondition}</p>
                      </div>
                    )}

                    {inspectionReport.manualData.interiorCondition && (
                      <div className="rounded-lg border border-gray-200 p-4">
                        <h4 className="mb-2 font-semibold text-gray-800">حالة الداخلية</h4>
                        <p className="text-gray-600">
                          {inspectionReport.manualData.interiorCondition}
                        </p>
                      </div>
                    )}

                    {inspectionReport.manualData.tiresCondition && (
                      <div className="rounded-lg border border-gray-200 p-4">
                        <h4 className="mb-2 font-semibold text-gray-800">حالة الإطارات</h4>
                        <p className="text-gray-600">
                          {inspectionReport.manualData.tiresCondition}
                        </p>
                      </div>
                    )}

                    {inspectionReport.manualData.electricalCondition && (
                      <div className="rounded-lg border border-gray-200 p-4">
                        <h4 className="mb-2 font-semibold text-gray-800">النظام الكهربائي</h4>
                        <p className="text-gray-600">
                          {inspectionReport.manualData.electricalCondition}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* الملاحظات */}
                  {inspectionReport.manualData.notes && (
                    <div className="rounded-lg bg-blue-50 p-4">
                      <h4 className="mb-3 font-semibold text-blue-800">ملاحظات الخبير</h4>
                      <p className="leading-relaxed text-blue-700">
                        {inspectionReport.manualData.notes}
                      </p>
                    </div>
                  )}

                  {/* معلومات إضافية */}
                  <div className="rounded-lg bg-gray-50 p-4">
                    <h4 className="mb-3 font-semibold text-gray-800">معلومات الفحص</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>• تم الفحص بواسطة خبراء معتمدين</p>
                      <p>• الفحص شامل لجميع أجزاء السيارة</p>
                      <p>• التقرير معتمد ومضمون</p>
                    </div>
                  </div>
                </div>
              ) : !inspectionReport.reportUrl ? (
                <div className="py-8 text-center text-gray-500">
                  <p>لا توجد بيانات تفصيلية متاحة لتقرير الفحص</p>
                </div>
              ) : null}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-6">
              <div className="flex flex-col gap-3 sm:flex-row">
                {inspectionReport.reportUrl && inspectionReport.reportFileName && (
                  <a
                    href={inspectionReport.reportUrl}
                    download={inspectionReport.reportFileName}
                    className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="h-4 w-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                      />
                    </svg>
                    تحميل التقرير
                  </a>
                )}
                <button
                  onClick={() => setShowDetailedModal(false)}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectionReport;
