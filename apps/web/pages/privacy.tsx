import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { OpensooqNavbar } from '../components/common';
import ShieldCheckIcon from '@heroicons/react/24/outline/ShieldCheckIcon';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import LockClosedIcon from '@heroicons/react/24/outline/LockClosedIcon';
import UserIcon from '@heroicons/react/24/outline/UserIcon';
import ArrowRightIcon from '@heroicons/react/24/outline/ArrowRightIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import DocumentTextIcon from '@heroicons/react/24/outline/DocumentTextIcon';
import CogIcon from '@heroicons/react/24/outline/CogIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import ShareIcon from '@heroicons/react/24/outline/ShareIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import InformationCircleIcon from '@heroicons/react/24/outline/InformationCircleIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import EnvelopeIcon from '@heroicons/react/24/outline/EnvelopeIcon';
import DevicePhoneMobileIcon from '@heroicons/react/24/outline/DevicePhoneMobileIcon';

// صفحة سياسة الخصوصية
const PrivacyPage = () => {
  return (
    <>
      <Head>
        <title>سياسة الخصوصية - موقع مزاد السيارات</title>
        <meta
          name="description"
          content="اطلع على سياسة الخصوصية وحماية البيانات في موقع مزاد السيارات"
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
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <ShieldCheckIcon className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">سياسة الخصوصية</h1>
              <p className="text-lg text-gray-600">كيف نحمي ونستخدم بياناتكم الشخصية</p>
              <p className="mt-2 text-sm text-gray-500">آخر تحديث: 26 يونيو 2025</p>
            </div>
          </div>

          {/* جدول المحتويات */}
          <div className="mb-8 rounded-xl bg-white p-8 shadow-lg">
            <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-gray-900">
              <InformationCircleIcon className="h-6 w-6 text-green-600" />
              جدول المحتويات
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <a
                href="#introduction"
                className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-600">
                  1
                </div>
                <span className="text-gray-700">مقدمة</span>
              </a>
              <a
                href="#data-collection"
                className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-600">
                  2
                </div>
                <span className="text-gray-700">جمع البيانات</span>
              </a>
              <a
                href="#data-usage"
                className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-600">
                  3
                </div>
                <span className="text-gray-700">استخدام البيانات</span>
              </a>
              <a
                href="#data-sharing"
                className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-600">
                  4
                </div>
                <span className="text-gray-700">مشاركة البيانات</span>
              </a>
              <a
                href="#data-protection"
                className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-600">
                  5
                </div>
                <span className="text-gray-700">حماية البيانات</span>
              </a>
              <a
                href="#user-rights"
                className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-600">
                  6
                </div>
                <span className="text-gray-700">حقوق المستخدم</span>
              </a>
              <a
                href="#cookies"
                className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-600">
                  7
                </div>
                <span className="text-gray-700">ملفات تعريف الارتباط</span>
              </a>
              <a
                href="#contact-privacy"
                className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-600">
                  8
                </div>
                <span className="text-gray-700">التواصل</span>
              </a>
            </div>
          </div>

          {/* Content */}
          <div className="rounded-xl bg-white p-8 shadow-lg">
            {/* مقدمة */}
            <section id="introduction" className="mb-8">
              <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-gray-900">
                <LockClosedIcon className="h-6 w-6 text-green-600" />
                التزامنا بالخصوصية
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                <p className="mb-4">
                  في موقع مزاد السيارات، نحن ملتزمون بحماية خصوصيتكم وأمان بياناتكم الشخصية. هذه
                  السياسة توضح كيف نجمع ونستخدم ونحمي معلوماتكم.
                </p>
                <p>
                  نحن نؤمن بأن الشفافية هي أساس الثقة، لذلك نوضح لكم بوضوح كيف نتعامل مع بياناتكم.
                </p>
              </div>
            </section>

            {/* البيانات التي نجمعها */}
            <section id="data-collection" className="mb-8">
              <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-gray-900">
                <UserIcon className="h-6 w-6 text-blue-600" />
                البيانات التي نجمعها
              </h2>

              <div className="space-y-6">
                <div className="rounded-lg bg-blue-50 p-6">
                  <h3 className="mb-3 text-lg font-semibold text-blue-900">1. البيانات الشخصية</h3>
                  <ul className="mr-4 list-inside list-disc space-y-2 text-blue-800">
                    <li>الاسم الكامل</li>
                    <li>رقم الهاتف</li>
                    <li>البريد الإلكتروني</li>
                    <li>العنوان والمدينة</li>
                    <li>تاريخ الميلاد (للتحقق من العمر)</li>
                    <li>صور وثائق الهوية (للتحقق)</li>
                  </ul>
                </div>

                <div className="rounded-lg bg-green-50 p-6">
                  <h3 className="mb-3 text-lg font-semibold text-green-900">2. بيانات الاستخدام</h3>
                  <ul className="mr-4 list-inside list-disc space-y-2 text-green-800">
                    <li>عنوان IP والموقع الجغرافي</li>
                    <li>نوع المتصفح والجهاز</li>
                    <li>الصفحات التي تزورونها</li>
                    <li>وقت ومدة الزيارة</li>
                    <li>تفضيلات البحث والفلاتر</li>
                  </ul>
                </div>

                <div className="rounded-lg bg-purple-50 p-6">
                  <h3 className="mb-3 text-lg font-semibold text-purple-900">
                    3. البيانات المالية
                  </h3>
                  <ul className="mr-4 list-inside list-disc space-y-2 text-purple-800">
                    <li>معلومات الدفع (مشفرة)</li>
                    <li>تاريخ المعاملات</li>
                    <li>فواتير الشراء والبيع</li>
                    <li>معلومات البنك (للتحويلات)</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* كيف نستخدم البيانات */}
            <section className="mb-8">
              <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-gray-900">
                <EyeIcon className="h-6 w-6 text-purple-600" />
                كيف نستخدم بياناتكم
              </h2>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="rounded-lg border border-gray-200 p-4">
                    <h3 className="mb-2 font-semibold text-gray-900">تقديم الخدمات</h3>
                    <p className="text-sm text-gray-700">
                      لتمكينكم من استخدام المزادات والسوق الفوري وجميع ميزات الموقع
                    </p>
                  </div>

                  <div className="rounded-lg border border-gray-200 p-4">
                    <h3 className="mb-2 font-semibold text-gray-900">التحقق من الهوية</h3>
                    <p className="text-sm text-gray-700">
                      لضمان أمان المعاملات ومنع الاحتيال والتلاعب
                    </p>
                  </div>

                  <div className="rounded-lg border border-gray-200 p-4">
                    <h3 className="mb-2 font-semibold text-gray-900">التواصل</h3>
                    <p className="text-sm text-gray-700">
                      لإرسال الإشعارات المهمة وتحديثات الحساب والعروض
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-lg border border-gray-200 p-4">
                    <h3 className="mb-2 font-semibold text-gray-900">تحسين الخدمة</h3>
                    <p className="text-sm text-gray-700">
                      لتطوير وتحسين ميزات الموقع وتجربة المستخدم
                    </p>
                  </div>

                  <div className="rounded-lg border border-gray-200 p-4">
                    <h3 className="mb-2 font-semibold text-gray-900">الأمان والحماية</h3>
                    <p className="text-sm text-gray-700">
                      لحماية الموقع من الهجمات والاستخدام غير المشروع
                    </p>
                  </div>

                  <div className="rounded-lg border border-gray-200 p-4">
                    <h3 className="mb-2 font-semibold text-gray-900">الامتثال القانوني</h3>
                    <p className="text-sm text-gray-700">
                      للامتثال للقوانين واللوائح المحلية والدولية
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* مشاركة البيانات */}
            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">مشاركة البيانات</h2>

              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-6">
                <div className="mb-3 flex items-center gap-2">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                  <h3 className="text-lg font-semibold text-red-900">متى نشارك بياناتكم</h3>
                </div>
                <p className="mb-3 text-red-800">
                  نحن لا نبيع أو نؤجر بياناتكم الشخصية لأطراف ثالثة. نشارك البيانات فقط في الحالات
                  التالية:
                </p>
                <ul className="mr-4 list-inside list-disc space-y-2 text-red-700">
                  <li>بموافقتكم الصريحة</li>
                  <li>مع مقدمي الخدمات الموثوقين (البنوك، شركات الدفع)</li>
                  <li>عند الطلب من السلطات القانونية</li>
                  <li>لحماية حقوقنا أو حقوق المستخدمين الآخرين</li>
                </ul>
              </div>
            </section>

            {/* أمان البيانات */}
            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">أمان وحماية البيانات</h2>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="rounded-lg bg-green-50 p-4 text-center">
                  <LockClosedIcon className="mx-auto mb-2 h-8 w-8 text-green-600" />
                  <h3 className="mb-2 font-semibold text-green-900">التشفير</h3>
                  <p className="text-sm text-green-800">
                    جميع البيانات الحساسة مشفرة باستخدام أحدث تقنيات التشفير
                  </p>
                </div>

                <div className="rounded-lg bg-blue-50 p-4 text-center">
                  <ShieldCheckIcon className="mx-auto mb-2 h-8 w-8 text-blue-600" />
                  <h3 className="mb-2 font-semibold text-blue-900">الحماية</h3>
                  <p className="text-sm text-blue-800">
                    خوادم آمنة وجدران حماية متقدمة لحماية بياناتكم
                  </p>
                </div>

                <div className="rounded-lg bg-purple-50 p-4 text-center">
                  <UserIcon className="mx-auto mb-2 h-8 w-8 text-purple-600" />
                  <h3 className="mb-2 font-semibold text-purple-900">الوصول المحدود</h3>
                  <p className="text-sm text-purple-800">
                    فقط الموظفون المخولون يمكنهم الوصول للبيانات الشخصية
                  </p>
                </div>
              </div>
            </section>

            {/* حقوقكم */}
            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">حقوقكم في البيانات</h2>

              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
                <h3 className="mb-4 text-lg font-semibold text-yellow-900">لديكم الحق في:</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <ul className="mr-4 list-inside list-disc space-y-2 text-yellow-800">
                    <li>الوصول لبياناتكم الشخصية</li>
                    <li>تصحيح البيانات غير الصحيحة</li>
                    <li>حذف بياناتكم (في حالات معينة)</li>
                    <li>تقييد معالجة البيانات</li>
                  </ul>
                  <ul className="mr-4 list-inside list-disc space-y-2 text-yellow-800">
                    <li>نقل البيانات لخدمة أخرى</li>
                    <li>الاعتراض على معالجة البيانات</li>
                    <li>سحب الموافقة في أي وقت</li>
                    <li>تقديم شكوى للسلطات المختصة</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* ملفات تعريف الارتباط */}
            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                ملفات تعريف الارتباط (Cookies)
              </h2>

              <div className="space-y-4">
                <p className="text-gray-700">
                  نستخدم ملفات تعريف الارتباط لتحسين تجربتكم على الموقع. هذه الملفات تساعدنا في:
                </p>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-lg bg-gray-50 p-4">
                    <h3 className="mb-2 font-semibold text-gray-900">ملفات ضرورية</h3>
                    <p className="text-sm text-gray-700">لتشغيل الموقع بشكل صحيح وآمن</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4">
                    <h3 className="mb-2 font-semibold text-gray-900">ملفات تحليلية</h3>
                    <p className="text-sm text-gray-700">لفهم كيفية استخدام الموقع وتحسينه</p>
                  </div>
                </div>

                <p className="text-sm text-gray-600">
                  يمكنكم التحكم في ملفات تعريف الارتباط من خلال إعدادات المتصفح الخاص بكم.
                </p>
              </div>
            </section>

            {/* الاحتفاظ بالبيانات */}
            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">مدة الاحتفاظ بالبيانات</h2>

              <div className="rounded-lg bg-blue-50 p-6">
                <p className="mb-4 text-blue-800">
                  نحتفظ ببياناتكم الشخصية للمدة اللازمة لتقديم خدماتنا والامتثال للقوانين:
                </p>
                <ul className="mr-4 list-inside list-disc space-y-2 text-blue-700">
                  <li>بيانات الحساب: طوال فترة نشاط الحساب + 3 سنوات</li>
                  <li>بيانات المعاملات: 7 سنوات (للامتثال الضريبي)</li>
                  <li>سجلات الأمان: 2 سنة</li>
                  <li>بيانات التسويق: حتى سحب الموافقة</li>
                </ul>
              </div>
            </section>

            {/* التحديثات */}
            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">تحديثات السياسة</h2>

              <div className="space-y-3 text-gray-700">
                <p>
                  قد نقوم بتحديث هذه السياسة من وقت لآخر لتعكس التغييرات في خدماتنا أو القوانين
                  المطبقة.
                </p>
                <p>
                  سنقوم بإشعاركم بأي تغييرات مهمة عبر البريد الإلكتروني أو إشعار على الموقع قبل 30
                  يوماً من تطبيق التغييرات.
                </p>
              </div>
            </section>

            {/* استخدام البيانات */}
            <section id="data-usage" className="mb-8">
              <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-gray-900">
                <CogIcon className="h-6 w-6 text-purple-600" />
                كيف نستخدم بياناتكم
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-lg bg-purple-50 p-4">
                  <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-purple-900">
                    <CheckCircleIcon className="h-5 w-5" />
                    الأغراض الأساسية
                  </h3>
                  <ul className="mr-4 list-inside list-disc space-y-2 text-sm text-purple-800">
                    <li>إنشاء وإدارة حسابكم</li>
                    <li>معالجة المزادات والمعاملات</li>
                    <li>التحقق من الهوية والأمان</li>
                    <li>تقديم خدمة العملاء</li>
                    <li>إرسال الإشعارات المهمة</li>
                  </ul>
                </div>
                <div className="rounded-lg bg-blue-50 p-4">
                  <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-blue-900">
                    <InformationCircleIcon className="h-5 w-5" />
                    التحسينات والتطوير
                  </h3>
                  <ul className="mr-4 list-inside list-disc space-y-2 text-sm text-blue-800">
                    <li>تحسين تجربة المستخدم</li>
                    <li>تطوير ميزات جديدة</li>
                    <li>تحليل الاستخدام والإحصائيات</li>
                    <li>منع الاحتيال والأنشطة المشبوهة</li>
                    <li>تخصيص المحتوى والإعلانات</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* مشاركة البيانات */}
            <section id="data-sharing" className="mb-8">
              <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-gray-900">
                <ShareIcon className="h-6 w-6 text-orange-600" />
                مشاركة البيانات
              </h2>
              <div className="space-y-4">
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold text-red-900">
                    <XMarkIcon className="h-5 w-5" />
                    لا نبيع بياناتكم
                  </h3>
                  <p className="text-sm text-red-800">
                    نحن لا نبيع أو نؤجر أو نتاجر ببياناتكم الشخصية لأطراف ثالثة لأغراض تجارية.
                  </p>
                </div>
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold text-green-900">
                    <CheckCircleIcon className="h-5 w-5" />
                    المشاركة المحدودة
                  </h3>
                  <p className="mb-2 text-sm text-green-800">
                    نشارك البيانات فقط في الحالات التالية:
                  </p>
                  <ul className="mr-4 list-inside list-disc space-y-1 text-sm text-green-700">
                    <li>مع مقدمي الخدمات الموثوقين (البنوك، شركات النقل)</li>
                    <li>عند الطلب القانوني من السلطات المختصة</li>
                    <li>لحماية حقوقنا أو حقوق المستخدمين الآخرين</li>
                    <li>في حالة بيع أو دمج الشركة (بعد إشعاركم)</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* حماية البيانات */}
            <section id="data-protection" className="mb-8">
              <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-gray-900">
                <LockClosedIcon className="h-6 w-6 text-blue-600" />
                حماية البيانات
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-blue-50 p-4 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <LockClosedIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="mb-2 font-semibold text-blue-900">التشفير</h3>
                  <p className="text-sm text-blue-800">جميع البيانات محمية بتشفير SSL/TLS</p>
                </div>
                <div className="rounded-lg bg-green-50 p-4 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <ShieldCheckIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="mb-2 font-semibold text-green-900">الأمان</h3>
                  <p className="text-sm text-green-800">خوادم آمنة ومراقبة على مدار الساعة</p>
                </div>
                <div className="rounded-lg bg-purple-50 p-4 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                    <UserIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="mb-2 font-semibold text-purple-900">الوصول المحدود</h3>
                  <p className="text-sm text-purple-800">وصول محدود للموظفين المخولين فقط</p>
                </div>
              </div>
            </section>

            {/* حقوق المستخدم */}
            <section id="user-rights" className="mb-8">
              <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-gray-900">
                <UserIcon className="h-6 w-6 text-indigo-600" />
                حقوقكم في البيانات
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="rounded-lg bg-indigo-50 p-4">
                    <h3 className="mb-2 flex items-center gap-2 font-semibold text-indigo-900">
                      <EyeIcon className="h-5 w-5" />
                      الوصول والاطلاع
                    </h3>
                    <p className="text-sm text-indigo-800">
                      يحق لكم طلب نسخة من جميع بياناتكم المحفوظة لدينا
                    </p>
                  </div>
                  <div className="rounded-lg bg-green-50 p-4">
                    <h3 className="mb-2 flex items-center gap-2 font-semibold text-green-900">
                      <CogIcon className="h-5 w-5" />
                      التصحيح والتحديث
                    </h3>
                    <p className="text-sm text-green-800">
                      يمكنكم طلب تصحيح أو تحديث أي معلومات غير صحيحة
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="rounded-lg bg-red-50 p-4">
                    <h3 className="mb-2 flex items-center gap-2 font-semibold text-red-900">
                      <TrashIcon className="h-5 w-5" />
                      الحذف والإزالة
                    </h3>
                    <p className="text-sm text-red-800">
                      يحق لكم طلب حذف بياناتكم (مع مراعاة المتطلبات القانونية)
                    </p>
                  </div>
                  <div className="rounded-lg bg-orange-50 p-4">
                    <h3 className="mb-2 flex items-center gap-2 font-semibold text-orange-900">
                      <XMarkIcon className="h-5 w-5" />
                      الاعتراض والتقييد
                    </h3>
                    <p className="text-sm text-orange-800">
                      يمكنكم الاعتراض على معالجة بياناتكم أو طلب تقييدها
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* ملفات تعريف الارتباط */}
            <section id="cookies" className="mb-8">
              <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-gray-900">
                <DocumentTextIcon className="h-6 w-6 text-yellow-600" />
                ملفات تعريف الارتباط (Cookies)
              </h2>
              <div className="space-y-4">
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                  <h3 className="mb-2 text-lg font-semibold text-yellow-900">
                    ما هي ملفات تعريف الارتباط؟
                  </h3>
                  <p className="text-sm text-yellow-800">
                    هي ملفات صغيرة تُحفظ على جهازكم لتحسين تجربة التصفح وتذكر تفضيلاتكم.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-lg bg-blue-50 p-4">
                    <h4 className="mb-2 font-semibold text-blue-900">ملفات ضرورية</h4>
                    <p className="text-sm text-blue-800">مطلوبة لعمل الموقع الأساسي</p>
                  </div>
                  <div className="rounded-lg bg-green-50 p-4">
                    <h4 className="mb-2 font-semibold text-green-900">ملفات الأداء</h4>
                    <p className="text-sm text-green-800">لتحليل الاستخدام وتحسين الموقع</p>
                  </div>
                  <div className="rounded-lg bg-purple-50 p-4">
                    <h4 className="mb-2 font-semibold text-purple-900">ملفات التخصيص</h4>
                    <p className="text-sm text-purple-800">لتذكر تفضيلاتكم وإعداداتكم</p>
                  </div>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-700">
                    <strong>إدارة ملفات تعريف الارتباط:</strong> يمكنكم التحكم في هذه الملفات من
                    خلال إعدادات المتصفح أو
                    <Link
                      href="/cookie-settings"
                      className="mx-1 text-blue-600 hover:text-blue-800"
                    >
                      إعدادات الموقع
                    </Link>
                  </p>
                </div>
              </div>
            </section>

            {/* التواصل */}
            <section id="contact-privacy" className="mb-8">
              <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-gray-900">
                <EnvelopeIcon className="h-6 w-6 text-green-600" />
                التواصل معنا
              </h2>

              <div className="rounded-lg bg-gray-50 p-6">
                <p className="mb-4 text-gray-700">
                  إذا كان لديكم أي أسئلة حول سياسة الخصوصية أو تريدون ممارسة حقوقكم في البيانات:
                </p>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="mb-2 font-semibold text-gray-900">مسؤول حماية البيانات</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>البريد الإلكتروني: privacy@carauction.ly</p>
                      <p>الهاتف: +218-91-907-7400</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-2 font-semibold text-gray-900">العنوان البريدي</h3>
                    <div className="text-sm text-gray-600">
                      <p>موقع مزاد السيارات</p>
                      <p>قسم حماية البيانات</p>
                      <p>طرابلس، ليبيا</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <Link
                    href="/advertising-contact?type=team"
                    className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm text-white transition-colors hover:bg-green-700"
                  >
                    <ShieldCheckIcon className="h-4 w-4" />
                    تواصل مع فريق الخصوصية
                  </Link>
                </div>
              </div>
            </section>

            {/* تاريخ النفاذ */}
            <section>
              <div className="border-t border-gray-200 pt-6">
                <p className="text-center text-sm text-gray-500">
                  هذه السياسة سارية المفعول اعتباراً من 26 يونيو 2025
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPage;
