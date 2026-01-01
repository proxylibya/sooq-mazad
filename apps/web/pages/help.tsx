import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { OpensooqNavbar } from '../components/common';
import PhoneDisplay from '../components/PhoneDisplay';
import SafetyTips from '../components/SafetyTips';
import QuestionMarkCircleIcon from '@heroicons/react/24/outline/QuestionMarkCircleIcon';
import ChatBubbleLeftRightIcon from '@heroicons/react/24/outline/ChatBubbleLeftRightIcon';
import PhoneIcon from '@heroicons/react/24/outline/PhoneIcon';
import EnvelopeIcon from '@heroicons/react/24/outline/EnvelopeIcon';
import ChevronDownIcon from '@heroicons/react/24/outline/ChevronDownIcon';
import ChevronUpIcon from '@heroicons/react/24/outline/ChevronUpIcon';
import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';
import TrophyIcon from '@heroicons/react/24/outline/TrophyIcon';
import BuildingStorefrontIcon from '@heroicons/react/24/outline/BuildingStorefrontIcon';
import ShieldCheckIcon from '@heroicons/react/24/outline/ShieldCheckIcon';
import CurrencyDollarIcon from '@heroicons/react/24/outline/CurrencyDollarIcon';
import UserIcon from '@heroicons/react/24/outline/UserIcon';
import DocumentTextIcon from '@heroicons/react/24/outline/DocumentTextIcon';

// صفحة المساعدة والأسئلة الشائعة
const HelpPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  // الأسئلة الشائعة
  const faqs = [
    {
      id: 1,
      category: 'auctions',
      question: 'كيف يمكنني المشاركة في المزادات؟',
      answer:
        'للمشاركة في المزادات، يجب أولاً إنشاء حساب والتحقق من هويتك. بعد ذلك يمكنك تصفح المزادات النشطة والمشاركة بالمزايدة عن طريق النقر على زر "زايد الآن" وإدخال مبلغ المزايدة.',
    },
    {
      id: 2,
      category: 'auctions',
      question: 'ما هي شروط المزايدة؟',
      answer:
        'يجب أن تكون المزايدة أعلى من المزايدة الحالية بمبلغ لا يقل عن الحد الأدنى للزيادة المحدد. كما يجب دفع عربون 10% من قيمة المزايدة النهائية خلال 24 ساعة من انتهاء المزاد.',
    },
    {
      id: 3,
      category: 'marketplace',
      question: 'كيف أضع إعلان لبيع سيارتي؟',
      answer:
        'انقر على "إضافة إعلان" من القائمة الرئيسية، اختر نوع الإعلان (سوق فوري أو مزاد)، املأ تفاصيل السيارة، أضف الصور، وحدد السعر. سيتم مراجعة الإعلان ونشره خلال 24 ساعة.',
    },
    {
      id: 4,
      category: 'marketplace',
      question: 'هل يمكنني تعديل إعلاني بعد النشر؟',
      answer:
        'نعم، يمكنك تعديل إعلانك في أي وقت من خلال الذهاب إلى "ملفي الشخصي" ثم "إعلاناتي" والنقر على "تعديل" بجانب الإعلان المطلوب.',
    },
    {
      id: 5,
      category: 'payment',
      question: 'ما هي طرق الدفع المتاحة؟',
      answer:
        'نقبل الدفع نقداً عند الاستلام، التحويل البنكي، والدفع الإلكتروني عبر البطاقات المصرفية. جميع المعاملات آمنة ومحمية.',
    },
    {
      id: 6,
      category: 'payment',
      question: 'هل هناك رسوم على المعاملات؟',
      answer:
        'رسوم المزادات 3% من قيمة البيع النهائية. إعلانات السوق الفوري مجانية للإعلان الأول، ثم 50 دينار لكل إعلان إضافي.',
    },
    {
      id: 7,
      category: 'safety',
      question: 'كيف أتأكد من صحة الإعلان؟',
      answer:
        'تحقق من علامة التحقق بجانب اسم البائع، اقرأ التقييمات، اطلب معاينة السيارة قبل الشراء، وتأكد من صحة الأوراق والوثائق.',
    },
    {
      id: 8,
      category: 'safety',
      question: 'ماذا أفعل إذا واجهت مشكلة مع البائع؟',
      answer:
        'يمكنك الإبلاغ عن المشكلة من خلال صفحة "اتصل بنا" أو النقر على "الإبلاغ عن هذا الإعلان". فريقنا سيتدخل لحل المشكلة في أسرع وقت ممكن.',
    },
    {
      id: 9,
      category: 'account',
      question: 'كيف أحدث معلومات حسابي؟',
      answer:
        'اذهب إلى "الملف الشخصي" ثم "الإعدادات" لتحديث معلوماتك الشخصية، رقم الهاتف، والبريد الإلكتروني.',
    },
    {
      id: 10,
      category: 'account',
      question: 'كيف أحذف حسابي؟',
      answer:
        'لحذف حسابك، تواصل مع خدمة العملاء عبر البريد الإلكتروني أو الهاتف. سيتم حذف جميع بياناتك خلال 30 يوم من الطلب.',
    },
    {
      id: 11,
      category: 'auctions',
      question: 'متى يتم انتهاء المزاد؟',
      answer:
        'ينتهي المزاد في الوقت المحدد، ولكن إذا تم وضع مزايدة في آخر دقيقتين، يتم تمديد المزاد لدقيقتين إضافيتين لإعطاء فرصة للمزايدين الآخرين.',
    },
    {
      id: 12,
      category: 'auctions',
      question: 'ماذا يحدث إذا لم أدفع العربون؟',
      answer:
        'إذا لم تدفع العربون خلال 24 ساعة من انتهاء المزاد، سيتم إلغاء مزايدتك وقد يتم تعليق حسابك مؤقتاً. السيارة ستذهب للمزايد التالي.',
    },
    {
      id: 13,
      category: 'marketplace',
      question: 'كم من الوقت يبقى إعلاني منشوراً؟',
      answer:
        'إعلانات السوق الفوري تبقى منشورة لمدة 30 يوم، ويمكنك تجديدها مجاناً. إعلانات المزادات تبقى حتى انتهاء فترة المزاد المحددة.',
    },
    {
      id: 14,
      category: 'marketplace',
      question: 'هل يمكنني بيع أكثر من سيارة واحدة؟',
      answer:
        'نعم، يمكنك نشر عدة إعلانات لسيارات مختلفة. الإعلان الأول مجاني، والإعلانات الإضافية برسوم رمزية.',
    },
    {
      id: 15,
      category: 'payment',
      question: 'هل يمكنني استرداد العربون؟',
      answer:
        'العربون غير قابل للاسترداد إلا في حالات خاصة مثل عدم مطابقة السيارة للوصف أو وجود عيوب مخفية لم يتم الإفصاح عنها.',
    },
    {
      id: 16,
      category: 'payment',
      question: 'متى أدفع باقي المبلغ؟',
      answer:
        'يجب دفع باقي المبلغ خلال 7 أيام من دفع العربون، ويتم التسليم فور استكمال الدفع والتأكد من صحة الأوراق.',
    },
    {
      id: 17,
      category: 'safety',
      question: 'هل تقدمون خدمة فحص السيارات؟',
      answer:
        'نعم، لدينا شبكة من مراكز الفحص المعتمدة في جميع أنحاء ليبيا. يمكنك طلب فحص شامل للسيارة قبل الشراء مقابل رسوم رمزية.',
    },
    {
      id: 18,
      category: 'safety',
      question: 'ما هي ضمانات الموقع؟',
      answer:
        'نوفر ضمان استرداد العربون في حالة الغش أو عدم مطابقة الوصف، وخدمة وساطة لحل النزاعات، وتأمين على جميع المعاملات.',
    },
    {
      id: 19,
      category: 'account',
      question: 'كيف أرفع مستوى حسابي؟',
      answer:
        'يمكنك ترقية حسابك إلى حساب معرض أو شركة نقل من خلال تقديم الوثائق المطلوبة والحصول على التحقق. هذا يمنحك مميزات إضافية.',
    },
    {
      id: 20,
      category: 'account',
      question: 'ما فائدة التحقق من الحساب؟',
      answer:
        'التحقق من الحساب يزيد من ثقة المشترين، يمنحك أولوية في نتائج البحث، ويتيح لك الوصول لمميزات إضافية مثل المزادات الخاصة.',
    },
    {
      id: 21,
      category: 'technical',
      question: 'لا أستطيع تسجيل الدخول لحسابي',
      answer:
        'تأكد من صحة البريد الإلكتروني وكلمة المرور. إذا نسيت كلمة المرور، انقر على "نسيت كلمة المرور" لإعادة تعيينها. إذا استمرت المشكلة، تواصل معنا.',
    },
    {
      id: 22,
      category: 'technical',
      question: 'الموقع بطيء أو لا يعمل بشكل صحيح',
      answer:
        'جرب تحديث الصفحة أو مسح ذاكرة التخزين المؤقت للمتصفح. تأكد من استخدام متصفح محدث. إذا استمرت المشكلة، أبلغنا عنها.',
    },
    {
      id: 23,
      category: 'shipping',
      question: 'هل تقدمون خدمة النقل؟',
      answer:
        'نعم، لدينا شبكة من شركاء النقل المعتمدين في جميع أنحاء ليبيا. يمكنك طلب خدمة النقل عند إتمام الشراء.',
    },
    {
      id: 24,
      category: 'shipping',
      question: 'كم تكلفة النقل؟',
      answer:
        'تكلفة النقل تختلف حسب المسافة ونوع السيارة. ستحصل على عرض سعر مفصل قبل تأكيد طلب النقل.',
    },
  ];

  // فئات الأسئلة
  const categories = [
    { id: 'all', name: 'جميع الأسئلة', icon: QuestionMarkCircleIcon },
    { id: 'auctions', name: 'المزادات', icon: TrophyIcon },
    { id: 'marketplace', name: 'السوق الفوري', icon: BuildingStorefrontIcon },
    { id: 'payment', name: 'الدفع والرسوم', icon: CurrencyDollarIcon },
    { id: 'safety', name: 'الأمان والحماية', icon: ShieldCheckIcon },
    { id: 'account', name: 'إدارة الحساب', icon: UserIcon },
    { id: 'technical', name: 'المشاكل التقنية', icon: DocumentTextIcon },
    { id: 'shipping', name: 'النقل والتوصيل', icon: BuildingStorefrontIcon },
  ];

  // تصفية الأسئلة
  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (faqId: number) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  return (
    <>
      <Head>
        <title>المساعدة والدعم - مزاد السيارات</title>
        <meta
          name="description"
          content="احصل على المساعدة والإجابات على أسئلتك حول استخدام موقع مزاد السيارات"
        />
      </Head>

      <div className="min-h-screen bg-gray-50" dir="rtl">
        <OpensooqNavbar />

        {/* Header */}
        <div className="bg-blue-600 py-16 text-white">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <h1 className="mb-4 text-4xl font-bold">كيف يمكننا مساعدتك؟</h1>
            <p className="mb-8 text-xl text-blue-100">
              ابحث في الأسئلة الشائعة أو تواصل مع فريق الدعم
            </p>

            {/* Search Bar */}
            <div className="relative mx-auto max-w-2xl">
              <MagnifyingGlassIcon className="pointer-events-none absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
              <input
                type="text"
                placeholder="ابحث عن سؤالك..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border-0 py-4 pl-4 pr-14 text-lg text-gray-900 focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {/* Categories Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 rounded-lg bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold">الفئات</h3>
                <div className="space-y-2">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-right transition-colors ${
                          activeCategory === category.id
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {category.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* FAQ Content */}
            <div className="lg:col-span-3">
              <div className="rounded-lg bg-white shadow-sm">
                <div className="border-b border-gray-200 p-6">
                  <h2 className="text-2xl font-bold text-gray-900">الأسئلة الشائعة</h2>
                  <p className="mt-2 text-gray-600">{filteredFAQs.length} سؤال متاح</p>
                </div>

                <div className="divide-y divide-gray-200">
                  {filteredFAQs.map((faq) => (
                    <div key={faq.id} className="p-6">
                      <button
                        onClick={() => toggleFAQ(faq.id)}
                        className="flex w-full items-center justify-between text-right transition-colors hover:text-blue-600"
                      >
                        <h3 className="flex-1 text-lg font-semibold text-gray-900">
                          {faq.question}
                        </h3>
                        {expandedFAQ === faq.id ? (
                          <ChevronUpIcon className="mr-4 h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronDownIcon className="mr-4 h-5 w-5 text-gray-500" />
                        )}
                      </button>

                      {expandedFAQ === faq.id && (
                        <div className="mt-4 leading-relaxed text-gray-700">{faq.answer}</div>
                      )}
                    </div>
                  ))}
                </div>

                {filteredFAQs.length === 0 && (
                  <div className="p-12 text-center">
                    <QuestionMarkCircleIcon className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                    <h3 className="mb-2 text-lg font-medium text-gray-900">لم نجد أسئلة مطابقة</h3>
                    <p className="text-gray-500">جرب البحث بكلمات مختلفة أو تواصل مع فريق الدعم</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="mt-16">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900">لم تجد إجابة لسؤالك؟</h2>
              <p className="text-lg text-gray-600">تواصل مع فريق الدعم وسنساعدك في أسرع وقت ممكن</p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Live Chat */}
              <div className="rounded-lg bg-white p-8 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                  <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">الدردشة المباشرة</h3>
                <p className="mb-6 text-gray-600">تحدث مع فريق الدعم مباشرة</p>
                <Link
                  href="/advertising-contact"
                  className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
                >
                  بدء المحادثة
                </Link>
                <div className="mt-3 text-sm text-gray-500">متاح: 9:00 ص - 9:00 م</div>
              </div>

              {/* Phone Support */}
              <div className="rounded-lg bg-white p-8 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <PhoneIcon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">الدعم الهاتفي</h3>
                <p className="mb-6 text-gray-600">اتصل بنا للحصول على مساعدة فورية</p>
                <a
                  href="tel:+218919077400"
                  className="phone-number inline-block rounded-lg bg-green-600 px-6 py-3 text-white transition-colors hover:bg-green-700"
                  dir="ltr"
                >
                  91-907-7400
                </a>
                <div className="mt-3 text-sm text-gray-500">متاح: 8:00 ص - 8:00 م</div>
              </div>

              {/* Email Support */}
              <div className="rounded-lg bg-white p-8 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                  <EnvelopeIcon className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">البريد الإلكتروني</h3>
                <p className="mb-6 text-gray-600">أرسل لنا رسالة وسنرد خلال 24 ساعة</p>
                <a
                  href="mailto:support@carauction.ly"
                  className="inline-block rounded-lg bg-purple-600 px-6 py-3 text-white transition-colors hover:bg-purple-700"
                >
                  إرسال رسالة
                </a>
                <div className="mt-3 text-sm text-gray-500">الرد خلال 24 ساعة</div>
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="mt-16 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 p-8">
            <h3 className="mb-6 text-center text-2xl font-bold text-gray-900">
              نصائح مهمة للمستخدمين
            </h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center">
                  <div className="ml-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                    <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">نصائح الأمان</h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• تأكد من فحص السيارة قبل الشراء</li>
                  <li>• لا تدفع أي مبالغ خارج المنصة</li>
                  <li>• تحقق من هوية البائع وتقييماته</li>
                  <li>• اطلب جميع الأوراق والوثائق</li>
                </ul>
              </div>

              <div className="rounded-lg bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center">
                  <div className="ml-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                    <TrophyIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">نصائح المزايدة</h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• ضع حد أقصى للمزايدة والتزم به</li>
                  <li>• راقب المزاد في الدقائق الأخيرة</li>
                  <li>• تأكد من توفر العربون قبل المزايدة</li>
                  <li>• اقرأ وصف السيارة بعناية</li>
                </ul>
              </div>

              <div className="rounded-lg bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center">
                  <div className="ml-3 flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                    <BuildingStorefrontIcon className="h-5 w-5 text-purple-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">نصائح البيع</h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• أضف صور واضحة من جميع الزوايا</li>
                  <li>• اكتب وصف دقيق وصادق</li>
                  <li>• حدد سعر مناسب للسوق</li>
                  <li>• رد على استفسارات المشترين بسرعة</li>
                </ul>
              </div>

              <div className="rounded-lg bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center">
                  <div className="ml-3 flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                    <CurrencyDollarIcon className="h-5 w-5 text-orange-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">نصائح الدفع</h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• استخدم طرق الدفع الآمنة فقط</li>
                  <li>• احتفظ بإيصالات جميع المدفوعات</li>
                  <li>• تأكد من استلام السيارة قبل الدفع النهائي</li>
                  <li>• اقرأ شروط الاسترداد بعناية</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-16 rounded-lg bg-white p-8 shadow-sm">
            <h3 className="mb-6 text-center text-2xl font-bold text-gray-900">روابط مفيدة</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div
                className="flex cursor-pointer items-center gap-3 rounded-lg p-4 transition-colors hover:bg-gray-50"
                onClick={() => (window.location.href = '/marketplace')}
              >
                <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                <div>
                  <div className="font-semibold">سوق المزاد</div>
                  <div className="text-sm text-gray-500">تصفح السيارات المعروضة</div>
                </div>
              </div>

              <div
                className="flex cursor-pointer items-center gap-3 rounded-lg p-4 transition-colors hover:bg-gray-50"
                onClick={() => (window.location.href = '/auctions')}
              >
                <TrophyIcon className="h-6 w-6 text-amber-600" />
                <div>
                  <div className="font-semibold">المزادات</div>
                  <div className="text-sm text-gray-500">تصفح المزادات النشطة</div>
                </div>
              </div>

              <div
                className="flex cursor-pointer items-center gap-3 rounded-lg p-4 transition-colors hover:bg-gray-50"
                onClick={() => (window.location.href = '/yards')}
              >
                <BuildingStorefrontIcon className="h-6 w-6 text-green-600" />
                <div>
                  <div className="font-semibold">الساحات المعتمدة</div>
                  <div className="text-sm text-gray-500">ساحات موثوقة</div>
                </div>
              </div>

              <div
                className="flex cursor-pointer items-center gap-3 rounded-lg p-4 transition-colors hover:bg-gray-50"
                onClick={() => (window.location.href = '/my-account')}
              >
                <UserIcon className="h-6 w-6 text-purple-600" />
                <div>
                  <div className="font-semibold">ملفي الشخصي</div>
                  <div className="text-sm text-gray-500">إدارة حسابك</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* نصائح الأمان */}
        <div className="container mx-auto px-4 py-8">
          <SafetyTips />
        </div>
      </div>
    </>
  );
};

export default HelpPage;
