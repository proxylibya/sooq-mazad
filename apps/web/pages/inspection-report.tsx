import React from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';

interface ManualReportData {
  engineCondition?: string;
  bodyCondition?: string;
  interiorCondition?: string;
  tiresCondition?: string;
  electricalCondition?: string;
  overallRating?: string;
  notes?: string;
}

interface FullReportData {
  manualData?: ManualReportData | null;
  reportUrl?: string | null;
  reportFileName?: string | null;
}

interface InspectionReportPageProps {
  reportData: FullReportData | null;
}

const InspectionReportPage: React.FC<InspectionReportPageProps> = ({ reportData }) => {
  if (!reportData || (!reportData.manualData && !reportData.reportUrl)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">خطأ في تحميل تقرير الفحص</h1>
          <p className="text-gray-600">لا توجد بيانات متاحة لعرضها</p>
        </div>
      </div>
    );
  }

  // دالة لتحديد نوع الملف
  const getFileType = (fileName?: string | null): 'pdf' | 'image' | 'unknown' => {
    if (!fileName) return 'unknown';
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) return 'image';
    return 'unknown';
  };

  const fileType = getFileType(reportData.reportFileName);
  const manualData = reportData.manualData;

  return (
    <>
      <Head>
        <title>تقرير الفحص الكامل - سوق مزاد</title>
        <meta name="description" content="تقرير فحص شامل للمركبة" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="h-8 w-8 text-green-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">تقرير الفحص الكامل</h1>
            <p className="mt-2 text-gray-600">تم فحص هذه السيارة من قبل خبراء معتمدين</p>
          </div>

          <div className="space-y-6">
            {/* عرض الملف المرفوع */}
            {reportData.reportUrl && (
              <div className="rounded-xl bg-white p-8 shadow-sm">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="h-6 w-6 text-blue-600"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {fileType === 'image' ? 'صورة تقرير الفحص' : 'ملف تقرير الفحص'}
                  </h2>
                </div>

                {/* عرض الصورة */}
                {fileType === 'image' && (
                  <div className="mb-6">
                    <div className="rounded-lg border border-gray-200 p-4">
                      <img
                        src={reportData.reportUrl}
                        alt="تقرير الفحص"
                        className="w-full rounded-md object-contain"
                        style={{ maxHeight: '600px' }}
                      />
                    </div>
                    {reportData.reportFileName && (
                      <p className="mt-3 text-sm text-gray-600">
                        اسم الملف: {reportData.reportFileName}
                      </p>
                    )}
                  </div>
                )}

                {/* عرض ملف PDF */}
                {fileType === 'pdf' && (
                  <div className="mb-6">
                    <div className="overflow-hidden rounded-lg border border-gray-200">
                      {/* عارض PDF مدمج */}
                      <div className="border-b border-gray-200 bg-gray-100 p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="h-5 w-5 text-red-600"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                                />
                              </svg>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                ملف PDF - تقرير الفحص
                              </h3>
                              {reportData.reportFileName && (
                                <p className="text-sm text-gray-600">{reportData.reportFileName}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <a
                              href={reportData.reportUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm text-white transition-colors hover:bg-blue-700"
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
                                  d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                                />
                              </svg>
                              فتح في تاب جديدة
                            </a>
                            <a
                              href={reportData.reportUrl}
                              download={reportData.reportFileName}
                              className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
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
                              تحميل
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* عارض PDF مدمج */}
                      <div className="bg-white">
                        <iframe
                          src={reportData.reportUrl}
                          className="h-96 w-full border-0"
                          title="تقرير الفحص PDF"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* التقييم العام */}
            {manualData?.overallRating && (
              <div className="rounded-xl bg-white p-8 shadow-sm">
                <div className="text-center">
                  <h2 className="mb-4 text-2xl font-bold text-green-800">التقييم العام</h2>
                  <div className="text-5xl font-bold text-green-600">
                    {manualData.overallRating}
                  </div>
                </div>
              </div>
            )}

            {/* تفاصيل الفحص */}
            {manualData && (
              <div className="rounded-xl bg-white p-8 shadow-sm">
                <h2 className="mb-6 text-xl font-bold text-gray-900">تفاصيل الفحص</h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {manualData.engineCondition && (
                    <div className="rounded-lg border border-gray-200 p-6">
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="h-5 w-5 text-blue-600"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z"
                            />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">حالة المحرك</h3>
                      </div>
                      <p className="text-gray-600">{manualData.engineCondition}</p>
                    </div>
                  )}

                  {manualData.bodyCondition && (
                    <div className="rounded-lg border border-gray-200 p-6">
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="h-5 w-5 text-purple-600"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m0-3.75A1.125 1.125 0 013.375 9h1.5m-1.5 0V5.625a1.125 1.125 0 011.125-1.125M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">حالة الهيكل</h3>
                      </div>
                      <p className="text-gray-600">{manualData.bodyCondition}</p>
                    </div>
                  )}

                  {manualData.interiorCondition && (
                    <div className="rounded-lg border border-gray-200 p-6">
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="h-5 w-5 text-orange-600"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                            />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">حالة الداخلية</h3>
                      </div>
                      <p className="text-gray-600">{manualData.interiorCondition}</p>
                    </div>
                  )}

                  {manualData.tiresCondition && (
                    <div className="rounded-lg border border-gray-200 p-6">
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="h-5 w-5 text-red-600"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 12a3 3 0 116 0 3 3 0 01-6 0z"
                            />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">حالة الإطارات</h3>
                      </div>
                      <p className="text-gray-600">{manualData.tiresCondition}</p>
                    </div>
                  )}

                  {manualData.electricalCondition && (
                    <div className="rounded-lg border border-gray-200 p-6">
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="h-5 w-5 text-yellow-600"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                            />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">النظام الكهربائي</h3>
                      </div>
                      <p className="text-gray-600">{manualData.electricalCondition}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* الملاحظات */}
            {manualData?.notes && (
              <div className="rounded-xl bg-white p-8 shadow-sm">
                <h2 className="mb-4 text-xl font-bold text-gray-900">ملاحظات الخبير</h2>
                <div className="rounded-lg bg-blue-50 p-6">
                  <p className="leading-relaxed text-blue-800">{manualData.notes}</p>
                </div>
              </div>
            )}

            {/* معلومات إضافية */}
            <div className="rounded-xl bg-white p-8 shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-gray-900">معلومات الفحص</h2>
              <div className="space-y-3 text-gray-600">
                <div className="flex items-center gap-3">
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
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>تم الفحص بواسطة خبراء معتمدين</span>
                </div>
                <div className="flex items-center gap-3">
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
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>الفحص شامل لجميع أجزاء السيارة</span>
                </div>
                <div className="flex items-center gap-3">
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
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>التقرير معتمد ومضمون</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <button
              onClick={() => window.close()}
              className="rounded-lg bg-gray-600 px-6 py-3 text-white transition-colors hover:bg-gray-700"
            >
              إغلاق النافذة
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { data } = context.query;

  let reportData: FullReportData | null = null;

  if (data && typeof data === 'string') {
    try {
      reportData = JSON.parse(decodeURIComponent(data));
    } catch (error) {
      console.error('خطأ في تحليل بيانات تقرير الفحص:', error);
    }
  }

  return {
    props: {
      reportData,
    },
  };
};

export default InspectionReportPage;
