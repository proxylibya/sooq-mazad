import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { OpensooqNavbar } from '../components/common';
import DocumentTextIcon from '@heroicons/react/24/outline/DocumentTextIcon';
import ShieldCheckIcon from '@heroicons/react/24/outline/ShieldCheckIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import ArrowRightIcon from '@heroicons/react/24/outline/ArrowRightIcon';
import UserIcon from '@heroicons/react/24/outline/UserIcon';
import CurrencyDollarIcon from '@heroicons/react/24/outline/CurrencyDollarIcon';
import TrophyIcon from '@heroicons/react/24/outline/TrophyIcon';
import BuildingStorefrontIcon from '@heroicons/react/24/outline/BuildingStorefrontIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import InformationCircleIcon from '@heroicons/react/24/outline/InformationCircleIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import XCircleIcon from '@heroicons/react/24/outline/XCircleIcon';

// صفحة الشروط والأحكام
const TermsPage = () => {
  return (
    <>
      <Head>
        <title>الشروط والأحكام - موقع مزاد السيارات</title>
        <meta
          name="description"
          content="اطلع على الشروط والأحكام الخاصة باستخدام موقع مزاد السيارات"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-50" dir="rtl">
        <OpensooqNavbar />

        <div className="mx-auto max-w-4xl px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/"
              className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              <ArrowRightIcon className="h-4 w-4" />
              العودة للصفحة الرئيسية
            </Link>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <DocumentTextIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">الشروط والأحكام</h1>
              <p className="text-lg text-gray-600">شروط وأحكام استخدام موقع مزاد السيارات</p>
              <p className="mt-2 text-sm text-gray-500">آخر تحديث: 26 يونيو 2025</p>
            </div>
          </div>

          {/* جدول المحتويات */}
          <div className="mb-8 rounded-xl bg-white p-8 shadow-lg">
            <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-gray-900">
              <InformationCircleIcon className="h-6 w-6 text-blue-600" />
              جدول المحتويات
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <a
                href="#introduction"
                className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                  1
                </div>
                <span className="text-gray-700">مقدمة</span>
              </a>
              <a
                href="#definitions"
                className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                  2
                </div>
                <span className="text-gray-700">التعريفات</span>
              </a>
              <a
                href="#usage-terms"
                className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                  3
                </div>
                <span className="text-gray-700">شروط الاستخدام</span>
              </a>
              <a
                href="#auction-rules"
                className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                  4
                </div>
                <span className="text-gray-700">قواعد المزادات</span>
              </a>
              <a
                href="#payment-terms"
                className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                  5
                </div>
                <span className="text-gray-700">شروط الدفع</span>
              </a>
              <a
                href="#user-responsibilities"
                className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                  6
                </div>
                <span className="text-gray-700">مسؤوليات المستخدم</span>
              </a>
              <a
                href="#prohibited-activities"
                className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                  7
                </div>
                <span className="text-gray-700">الأنشطة المحظورة</span>
              </a>
              <a
                href="#liability"
                className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                  8
                </div>
                <span className="text-gray-700">المسؤولية القانونية</span>
              </a>
              <a
                href="#termination"
                className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                  9
                </div>
                <span className="text-gray-700">إنهاء الخدمة</span>
              </a>
              <a
                href="#changes"
                className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                  10
                </div>
                <span className="text-gray-700">التعديلات</span>
              </a>
            </div>
          </div>

          {/* Content */}
          <div className="rounded-xl bg-white p-8 shadow-lg">
            {/* مقدمة */}
            <section id="introduction" className="mb-8">
              <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-gray-900">
                <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
                مقدمة
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                <p className="mb-4">
                  مرحباً بكم في موقع مزاد السيارات. هذه الشروط والأحكام تحكم استخدامكم لموقعنا
                  الإلكتروني وخدماتنا. باستخدام موقعنا، فإنكم توافقون على الالتزام بهذه الشروط
                  والأحكام.
                </p>
                <p>
                  يرجى قراءة هذه الشروط بعناية قبل استخدام الموقع. إذا كنتم لا توافقون على أي من هذه
                  الشروط، يرجى عدم استخدام موقعنا.
                </p>
              </div>
            </section>

            {/* تعريفات */}
            <section id="definitions" className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">التعريفات</h2>
              <div className="space-y-3">
                <div className="rounded-lg bg-gray-50 p-4">
                  <h3 className="mb-2 font-semibold text-gray-900">الموقع:</h3>
                  <p className="text-gray-700">
                    موقع مزاد السيارات الإلكتروني وجميع صفحاته وخدماته
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <h3 className="mb-2 font-semibold text-gray-900">المستخدم:</h3>
                  <p className="text-gray-700">أي شخص يستخدم الموقع أو يتصفحه أو يسجل فيه</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <h3 className="mb-2 font-semibold text-gray-900">الخدمات:</h3>
                  <p className="text-gray-700">
                    جميع الخدمات المقدمة عبر الموقع بما في ذلك المزادات والسوق الفوري
                  </p>
                </div>
              </div>
            </section>

            {/* شروط الاستخدام */}
            <section id="usage-terms" className="mb-8">
              <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-gray-900">
                <UserIcon className="h-6 w-6 text-blue-600" />
                شروط الاستخدام
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">1. التسجيل والحساب</h3>
                  <ul className="mr-4 list-inside list-disc space-y-2 text-gray-700">
                    <li>يجب أن تكون بعمر 18 سنة أو أكثر للتسجيل في الموقع</li>
                    <li>يجب تقديم معلومات صحيحة ومحدثة عند التسجيل</li>
                    <li>أنت مسؤول عن الحفاظ على سرية كلمة المرور الخاصة بك</li>
                    <li>يحق لنا إيقاف أو حذف الحسابات التي تنتهك هذه الشروط</li>
                  </ul>
                </div>

                <div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    2. المزادات والمبيعات
                  </h3>
                  <ul className="mr-4 list-inside list-disc space-y-2 text-gray-700">
                    <li>جميع المزايدات ملزمة ولا يمكن التراجع عنها</li>
                    <li>يجب دفع عربون 10% من قيمة المزايدة النهائية خلال 24 ساعة</li>
                    <li>يتم تحصيل عمولة 5% من قيمة البيع على البائع</li>
                    <li>يحق للموقع إلغاء أي مزاد في حالة الاشتباه في عدم الجدية</li>
                  </ul>
                </div>

                <div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    3. الإعلانات والمحتوى
                  </h3>
                  <ul className="mr-4 list-inside list-disc space-y-2 text-gray-700">
                    <li>يجب أن تكون جميع الإعلانات صادقة ودقيقة</li>
                    <li>يُمنع نشر إعلانات مضللة أو احتيالية</li>
                    <li>يحق للموقع حذف أي إعلان يخالف هذه الشروط</li>
                    <li>المستخدم مسؤول عن محتوى إعلاناته</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* السلوك المحظور */}
            <section className="mb-8">
              <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-gray-900">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                السلوك المحظور
              </h2>
              <div className="rounded-lg border border-red-200 bg-red-50 p-6">
                <p className="mb-3 font-medium text-red-800">يُمنع منعاً باتاً:</p>
                <ul className="mr-4 list-inside list-disc space-y-2 text-red-700">
                  <li>استخدام الموقع لأغراض غير قانونية</li>
                  <li>نشر محتوى مسيء أو غير لائق</li>
                  <li>محاولة اختراق أو تعطيل الموقع</li>
                  <li>انتحال شخصية الآخرين</li>
                  <li>التلاعب في المزادات أو الأسعار</li>
                  <li>إرسال رسائل غير مرغوب فيها (سبام)</li>
                </ul>
              </div>
            </section>

            {/* المسؤولية */}
            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">المسؤولية وإخلاء المسؤولية</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  موقع مزاد السيارات يعمل كوسيط بين البائعين والمشترين. نحن لا نضمن جودة أو حالة
                  السيارات المعروضة.
                </p>
                <p>
                  المستخدمون مسؤولون عن التحقق من حالة السيارات قبل الشراء. ننصح بشدة بإجراء فحص فني
                  شامل.
                </p>
                <p>
                  الموقع غير مسؤول عن أي خسائر أو أضرار قد تنتج عن استخدام الخدمات أو التعاملات بين
                  المستخدمين.
                </p>
              </div>
            </section>

            {/* الدفع والرسوم */}
            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">الدفع والرسوم</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-lg bg-blue-50 p-4">
                  <h3 className="mb-2 font-semibold text-blue-900">رسوم البائع</h3>
                  <ul className="space-y-1 text-sm text-blue-800">
                    <li>• عمولة 5% من قيمة البيع</li>
                    <li>• رسوم الإعلان المميز: 50-200 د.ل</li>
                    <li>• رسوم التحقق من الهوية: مجاني</li>
                  </ul>
                </div>
                <div className="rounded-lg bg-green-50 p-4">
                  <h3 className="mb-2 font-semibold text-green-900">رسوم المشتري</h3>
                  <ul className="space-y-1 text-sm text-green-800">
                    <li>• التصفح والبحث: مجاني</li>
                    <li>• المزايدة: مجانية</li>
                    <li>• عربون المزاد: 10% من القيمة</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* الخصوصية */}
            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">الخصوصية وحماية البيانات</h2>
              <div className="space-y-3 text-gray-700">
                <p>
                  نحن ملتزمون بحماية خصوصيتكم وبياناتكم الشخصية. يرجى مراجعة
                  <Link href="/privacy" className="mx-1 text-blue-600 hover:text-blue-800">
                    سياسة الخصوصية
                  </Link>
                  للحصول على تفاصيل أكثر.
                </p>
                <p>
                  لا نشارك معلوماتكم الشخصية مع أطراف ثالثة إلا بموافقتكم أو عند الضرورة القانونية.
                </p>
              </div>
            </section>

            {/* قواعد المزادات */}
            <section id="auction-rules" className="mb-8">
              <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-gray-900">
                <TrophyIcon className="h-6 w-6 text-blue-600" />
                قواعد المزادات
              </h2>
              <div className="space-y-4">
                <div className="rounded-lg bg-blue-50 p-4">
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    شروط المشاركة في المزادات
                  </h3>
                  <ul className="mr-4 list-inside list-disc space-y-2 text-gray-700">
                    <li>يجب التحقق من الحساب قبل المشاركة في المزادات</li>
                    <li>المزايدة ملزمة ولا يمكن التراجع عنها</li>
                    <li>يجب دفع العربون خلال 24 ساعة من انتهاء المزاد</li>
                    <li>عدم الالتزام بالدفع يؤدي إلى تعليق الحساب</li>
                  </ul>
                </div>
                <div className="rounded-lg bg-green-50 p-4">
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">آلية المزايدة</h3>
                  <ul className="mr-4 list-inside list-disc space-y-2 text-gray-700">
                    <li>المزايدة تتم بزيادات محددة مسبقاً</li>
                    <li>في حالة المزايدة في آخر دقيقتين، يتم تمديد المزاد</li>
                    <li>الفائز هو صاحب أعلى مزايدة عند انتهاء الوقت</li>
                    <li>يتم إشعار الفائز فوراً عبر البريد الإلكتروني والرسائل</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* شروط الدفع */}
            <section id="payment-terms" className="mb-8">
              <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-gray-900">
                <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
                شروط الدفع
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      طرق الدفع المقبولة
                    </h3>
                    <ul className="mr-4 list-inside list-disc space-y-1 text-sm text-gray-700">
                      <li>الدفع نقداً عند الاستلام</li>
                      <li>التحويل البنكي</li>
                      <li>البطاقات المصرفية</li>
                      <li>المحافظ الإلكترونية</li>
                    </ul>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <ClockIcon className="h-5 w-5 text-blue-600" />
                      مواعيد الدفع
                    </h3>
                    <ul className="mr-4 list-inside list-disc space-y-1 text-sm text-gray-700">
                      <li>العربون: خلال 24 ساعة</li>
                      <li>باقي المبلغ: خلال 7 أيام</li>
                      <li>رسوم الخدمة: عند إتمام المعاملة</li>
                      <li>رسوم النقل: عند طلب الخدمة</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* مسؤوليات المستخدم */}
            <section id="user-responsibilities" className="mb-8">
              <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-gray-900">
                <UserIcon className="h-6 w-6 text-blue-600" />
                مسؤوليات المستخدم
              </h2>
              <div className="rounded-lg bg-gray-50 p-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="mb-3 text-lg font-semibold text-gray-900">للبائعين</h3>
                    <ul className="mr-4 list-inside list-disc space-y-2 text-sm text-gray-700">
                      <li>تقديم معلومات صحيحة ودقيقة عن السيارة</li>
                      <li>إضافة صور واضحة وحديثة</li>
                      <li>الإفصاح عن جميع العيوب والأضرار</li>
                      <li>توفير جميع الأوراق والوثائق المطلوبة</li>
                      <li>الالتزام بتسليم السيارة في الموعد المحدد</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="mb-3 text-lg font-semibold text-gray-900">للمشترين</h3>
                    <ul className="mr-4 list-inside list-disc space-y-2 text-sm text-gray-700">
                      <li>فحص السيارة قبل المزايدة أو الشراء</li>
                      <li>الالتزام بالدفع في المواعيد المحددة</li>
                      <li>التأكد من صحة الأوراق والوثائق</li>
                      <li>احترام شروط البائع المعلنة</li>
                      <li>عدم إساءة استخدام نظام التقييم</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* الأنشطة المحظورة */}
            <section id="prohibited-activities" className="mb-8">
              <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-gray-900">
                <XCircleIcon className="h-6 w-6 text-red-600" />
                الأنشطة المحظورة
              </h2>
              <div className="rounded-lg border border-red-200 bg-red-50 p-6">
                <p className="mb-4 font-medium text-red-800">
                  يُمنع منعاً باتاً القيام بالأنشطة التالية:
                </p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <ul className="mr-4 list-inside list-disc space-y-2 text-sm text-red-700">
                    <li>نشر إعلانات وهمية أو مضللة</li>
                    <li>التلاعب في المزادات أو الأسعار</li>
                    <li>انتحال شخصية الآخرين</li>
                    <li>استخدام الموقع لأغراض غير قانونية</li>
                    <li>نشر محتوى مسيء أو غير لائق</li>
                  </ul>
                  <ul className="mr-4 list-inside list-disc space-y-2 text-sm text-red-700">
                    <li>محاولة اختراق أو تعطيل الموقع</li>
                    <li>جمع معلومات المستخدمين بطرق غير مشروعة</li>
                    <li>إنشاء حسابات متعددة للتلاعب</li>
                    <li>التواصل خارج المنصة لتجنب الرسوم</li>
                    <li>بيع سيارات مسروقة أو غير قانونية</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* المسؤولية القانونية */}
            <section id="liability" className="mb-8">
              <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-gray-900">
                <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />
                المسؤولية القانونية
              </h2>
              <div className="space-y-4">
                <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">مسؤولية الموقع</h3>
                  <p className="text-sm text-orange-800">
                    الموقع يعمل كوسيط بين البائعين والمشترين. نحن غير مسؤولين عن جودة السيارات أو
                    صحة المعلومات المقدمة من البائعين، ولكننا نبذل قصارى جهدنا للتحقق من الإعلانات
                    ومراقبة المحتوى.
                  </p>
                </div>
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">حدود المسؤولية</h3>
                  <p className="text-sm text-blue-800">
                    مسؤوليتنا محدودة بقيمة الرسوم المدفوعة للموقع. نحن غير مسؤولين عن أي أضرار غير
                    مباشرة أو خسائر في الأرباح قد تنتج عن استخدام الموقع.
                  </p>
                </div>
              </div>
            </section>

            {/* إنهاء الخدمة */}
            <section id="termination" className="mb-8">
              <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-gray-900">
                <XCircleIcon className="h-6 w-6 text-gray-600" />
                إنهاء الخدمة
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700">
                  يحق لنا إنهاء أو تعليق حسابك في أي وقت دون إشعار مسبق في الحالات التالية:
                </p>
                <ul className="mr-4 list-inside list-disc space-y-2 text-gray-700">
                  <li>انتهاك أي من هذه الشروط والأحكام</li>
                  <li>القيام بأنشطة احتيالية أو مشبوهة</li>
                  <li>عدم الدفع أو التأخير المتكرر في الدفع</li>
                  <li>تلقي شكاوى متعددة من المستخدمين الآخرين</li>
                </ul>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-700">
                    <strong>ملاحظة:</strong> يمكنك إنهاء حسابك في أي وقت من خلال التواصل مع خدمة
                    العملاء. سيتم حذف بياناتك خلال 30 يوم من الطلب وفقاً لسياسة الخصوصية.
                  </p>
                </div>
              </div>
            </section>

            {/* تعديل الشروط */}
            <section id="changes" className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">تعديل الشروط والأحكام</h2>
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
                <p className="text-yellow-800">
                  يحق لنا تعديل هذه الشروط والأحكام في أي وقت. سيتم إشعاركم بأي تغييرات مهمة عبر
                  البريد الإلكتروني أو إشعار على الموقع. استمراركم في استخدام الموقع بعد التعديلات
                  يعني موافقتكم على الشروط الجديدة.
                </p>
              </div>
            </section>

            {/* القانون المطبق */}
            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">القانون المطبق وحل النزاعات</h2>
              <div className="space-y-3 text-gray-700">
                <p>
                  تخضع هذه الشروط والأحكام للقوانين الليبية. أي نزاع ينشأ عن استخدام الموقع سيتم حله
                  وفقاً للقانون الليبي.
                </p>
                <p>
                  نشجع على حل النزاعات ودياً أولاً. في حالة عدم التوصل لحل، يمكن اللجوء للمحاكم
                  المختصة في ليبيا.
                </p>
              </div>
            </section>

            {/* معلومات التواصل */}
            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">التواصل معنا</h2>
              <div className="rounded-lg bg-gray-50 p-6">
                <p className="mb-4 text-gray-700">
                  إذا كان لديكم أي أسئلة حول هذه الشروط والأحكام، يرجى التواصل معنا:
                </p>
                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                  <div>
                    <p className="font-medium text-gray-900">البريد الإلكتروني:</p>
                    <p className="text-gray-600">legal@carauction.ly</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">الهاتف:</p>
                    <p className="text-gray-600">+218-91-907-7400</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Link
                    href="/advertising-contact?type=team"
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
                  >
                    <DocumentTextIcon className="h-4 w-4" />
                    تواصل مع الفريق القانوني
                  </Link>
                </div>
              </div>
            </section>

            {/* تاريخ النفاذ */}
            <section>
              <div className="border-t border-gray-200 pt-6">
                <p className="text-center text-sm text-gray-500">
                  هذه الشروط والأحكام سارية المفعول اعتباراً من 26 يونيو 2025
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsPage;
