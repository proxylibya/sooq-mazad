import React from 'react';
import Head from 'next/head';
import { PageHeader, SimplePageHeader, BackButton } from '../../components/common/ui';
import Layout from '../../components/common/layout/Layout';

/**
 * صفحة توضيحية لاستخدام المكونات الجديدة
 * PageHeader و BackButton
 */
const HeaderDemoPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>أمثلة Header و BackButton - مزاد السيارات</title>
        <meta name="description" content="صفحة توضيحية لاستخدام مكونات PageHeader و BackButton" />
      </Head>

      <div className="min-h-screen bg-gray-50" dir="rtl">
        {/* مثال 1: PageHeader كامل مع شعار وزر رجوع */}
        <div className="mb-8">
          <PageHeader
            showBackButton={true}
            backHref="/"
            showLogo={true}
            logoHref="/"
            logoText="مزاد السيارات"
            variant="white"
          />
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8">
          <h1 className="mb-8 text-3xl font-bold text-gray-900">
            أمثلة على استخدام مكونات Header الموحدة
          </h1>

          {/* القسم الأول: أمثلة PageHeader */}
          <section className="mb-12">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">1. مكون PageHeader</h2>

            {/* مثال بسيط */}
            <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-700">
                أ) PageHeader بسيط مع عنوان
              </h3>
              <div className="overflow-hidden rounded border border-gray-300">
                <SimplePageHeader title="صفحة الملف الشخصي" showBackButton={true} backHref="/" />
                <div className="bg-gray-50 p-8 text-center text-gray-500">محتوى الصفحة هنا</div>
              </div>
            </div>

            {/* مثال مع شعار */}
            <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-700">
                ب) PageHeader مع شعار وزر رجوع
              </h3>
              <div className="overflow-hidden rounded border border-gray-300">
                <PageHeader
                  showBackButton={true}
                  showLogo={true}
                  logoHref="/"
                  logoText="مزاد السيارات"
                  variant="white"
                />
                <div className="bg-gray-50 p-8 text-center text-gray-500">محتوى الصفحة هنا</div>
              </div>
            </div>

            {/* مثال بخلفية رمادية */}
            <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-700">
                ج) PageHeader بخلفية رمادية
              </h3>
              <div className="overflow-hidden rounded border border-gray-300">
                <PageHeader
                  showBackButton={true}
                  showLogo={true}
                  logoHref="/"
                  logoText="مزاد السيارات"
                  variant="gray"
                />
                <div className="bg-white p-8 text-center text-gray-500">محتوى الصفحة هنا</div>
              </div>
            </div>
          </section>

          {/* القسم الثاني: أمثلة BackButton */}
          <section className="mb-12">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">2. مكون BackButton</h2>

            {/* أنماط مختلفة */}
            <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-700">
                أ) أنماط مختلفة (Variants)
              </h3>
              <div className="flex flex-wrap gap-4">
                <BackButton href="/" text="افتراضي" variant="default" size="md" />
                <BackButton href="/" text="بنفسجي" variant="purple" size="md" />
                <BackButton href="/" text="أخضر" variant="green" size="md" />
                <BackButton href="/" text="أزرق" variant="blue" size="md" />
                <BackButton href="/" text="رمادي" variant="gray" size="md" />
              </div>
            </div>

            {/* أحجام مختلفة */}
            <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-700">ب) أحجام مختلفة (Sizes)</h3>
              <div className="flex flex-wrap items-center gap-4">
                <BackButton href="/" text="صغير" variant="default" size="sm" />
                <BackButton href="/" text="متوسط" variant="default" size="md" />
                <BackButton href="/" text="كبير" variant="default" size="lg" />
              </div>
            </div>

            {/* أيقونة فقط */}
            <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-700">ج) أزرار بأيقونة فقط</h3>
              <div className="flex flex-wrap items-center gap-4">
                <BackButton href="/" variant="default" size="sm" iconOnly={true} />
                <BackButton href="/" variant="blue" size="md" iconOnly={true} />
                <BackButton href="/" variant="green" size="lg" iconOnly={true} />
              </div>
            </div>

            {/* مع دالة onClick مخصصة */}
            <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-700">د) مع دالة onClick مخصصة</h3>
              <BackButton
                text="تنفيذ إجراء مخصص"
                variant="blue"
                size="md"
                onClick={() => alert('تم النقر على الزر!')}
              />
            </div>
          </section>

          {/* القسم الثالث: حالات الاستخدام */}
          <section className="mb-12">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">3. حالات استخدام عملية</h2>

            <div className="space-y-6">
              {/* صفحة نموذج */}
              <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="overflow-hidden rounded-t border-b border-gray-200">
                  <PageHeader
                    showBackButton={true}
                    backHref="/listings"
                    showLogo={true}
                    logoHref="/"
                    variant="white"
                  />
                </div>
                <div className="p-6">
                  <h3 className="mb-4 text-xl font-bold text-gray-900">إضافة إعلان جديد</h3>
                  <form className="space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        عنوان الإعلان
                      </label>
                      <input
                        type="text"
                        className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="أدخل عنوان الإعلان"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">الوصف</label>
                      <textarea
                        className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                        placeholder="أدخل وصف الإعلان"
                      ></textarea>
                    </div>
                    <div className="flex justify-end gap-3">
                      <BackButton href="/listings" text="إلغاء" variant="gray" />
                      <button
                        type="submit"
                        className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700"
                      >
                        حفظ
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </section>

          {/* إرشادات الاستخدام */}
          <section className="mb-12">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">4. إرشادات الاستخدام</h2>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
              <h3 className="mb-3 text-lg font-semibold text-blue-900">متى تستخدم هذه المكونات؟</h3>
              <ul className="list-inside list-disc space-y-2 text-blue-800">
                <li>
                  استخدم <code className="rounded bg-blue-100 px-2 py-1">PageHeader</code> في
                  الصفحات التي تحتاج لهيدر موحد مع شعار
                </li>
                <li>
                  استخدم <code className="rounded bg-blue-100 px-2 py-1">SimplePageHeader</code>{' '}
                  للصفحات البسيطة مع عنوان فقط
                </li>
                <li>
                  استخدم <code className="rounded bg-blue-100 px-2 py-1">BackButton</code> لزر رجوع
                  مستقل في أي مكان
                </li>
                <li>اختر النمط المناسب حسب سياق الصفحة (ألوان الشركة)</li>
                <li>استخدم الأحجام المناسبة للشاشات المختلفة</li>
              </ul>
            </div>
          </section>

          {/* الكود المصدري */}
          <section className="mb-12">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">5. أمثلة الكود</h2>
            <div className="rounded-lg border border-gray-200 bg-gray-900 p-6 text-white">
              <pre className="overflow-x-auto text-sm">
                <code>{`// استيراد المكونات
import { PageHeader, BackButton } from '@/components/common/ui';

// استخدام PageHeader
<PageHeader
  showBackButton={true}
  backHref="/previous-page"
  showLogo={true}
  logoHref="/"
  variant="white"
/>

// استخدام BackButton
<BackButton
  href="/listings"
  text="العودة للإعلانات"
  variant="blue"
  size="md"
/>`}</code>
              </pre>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default HeaderDemoPage;
