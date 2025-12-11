import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { OpensooqNavbar } from '../components/common';
import GlobeAltIcon from '@heroicons/react/24/outline/GlobeAltIcon';
import CurrencyDollarIcon from '@heroicons/react/24/outline/CurrencyDollarIcon';
import ChartBarIcon from '@heroicons/react/24/outline/ChartBarIcon';
import UserGroupIcon from '@heroicons/react/24/outline/UserGroupIcon';
import BuildingOfficeIcon from '@heroicons/react/24/outline/BuildingOfficeIcon';
import AcademicCapIcon from '@heroicons/react/24/outline/AcademicCapIcon';
import ShieldCheckIcon from '@heroicons/react/24/outline/ShieldCheckIcon';
import ArrowTrendingUpIcon from '@heroicons/react/24/outline/ArrowTrendingUpIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import StarIcon from '@heroicons/react/24/outline/StarIcon';

const PartnershipPage = () => {
  const [selectedCountry, setSelectedCountry] = useState('');

  const partnershipBenefits = [
    {
      icon: CurrencyDollarIcon,
      title: 'عوائد مالية مضمونة',
      description: 'نظام عمولات تنافسي مع مكافآت أداء تصل إلى 25% من الإيرادات',
      color: 'text-green-600 bg-green-100',
    },
    {
      icon: GlobeAltIcon,
      title: 'شبكة ليبية رائدة',
      description: 'انضم إلى أكبر شبكة مراكز فحص في ليبيا مع تغطية شاملة لجميع المدن الرئيسية',
      color: 'text-blue-600 bg-blue-100',
    },
    {
      icon: AcademicCapIcon,
      title: 'تدريب شامل',
      description: 'برامج تدريب متقدمة وشهادات معتمدة لك ولفريقك',
      color: 'text-purple-600 bg-purple-100',
    },
    {
      icon: ShieldCheckIcon,
      title: 'دعم تقني مستمر',
      description: 'دعم فني 24/7 وتحديثات مستمرة للأنظمة والتقنيات',
      color: 'text-orange-600 bg-orange-100',
    },
    {
      icon: ChartBarIcon,
      title: 'تحليلات متقدمة',
      description: 'تقارير مفصلة وتحليلات ذكية لتحسين الأداء والربحية',
      color: 'text-indigo-600 bg-indigo-100',
    },
    {
      icon: UserGroupIcon,
      title: 'مجتمع الشركاء',
      description: 'شبكة من الشركاء المحترفين لتبادل الخبرات والتجارب',
      color: 'text-pink-600 bg-pink-100',
    },
  ];

  const investmentPlans = [
    {
      name: 'الخطة الأساسية',
      investment: '120,000 - 200,000',
      currency: 'دولار أمريكي',
      features: [
        'مركز فحص صغير (2-3 خطوط فحص)',
        'تدريب لـ 5-8 موظفين ليبيين',
        'معدات أساسية للفحص معتمدة',
        'نظام إدارة باللغة العربية',
        'دعم تقني محلي لمدة سنة',
        'تراخيص وتصاريح ليبية',
      ],
      expectedROI: '18-25%',
      breakEven: '10-15 شهر',
      color: 'border-blue-200 bg-blue-50',
    },
    {
      name: 'الخطة المتقدمة',
      investment: '200,000 - 350,000',
      currency: 'دولار أمريكي',
      features: [
        'مركز فحص متوسط (4-6 خطوط فحص)',
        'تدريب لـ 10-15 موظف ليبي',
        'معدات متقدمة + تصوير احترافي',
        'نظام إدارة متكامل باللغة العربية',
        'دعم تقني محلي لمدة سنتين',
        'خدمات تسويقية في السوق الليبي',
        'شراكة مع شركات التأمين الليبية',
      ],
      expectedROI: '25-32%',
      breakEven: '8-12 شهر',
      color: 'border-green-200 bg-green-50',
      popular: true,
    },
    {
      name: 'الخطة الاحترافية',
      investment: '350,000 - 600,000',
      currency: 'دولار أمريكي',
      features: [
        'مركز فحص كبير (8+ خطوط فحص)',
        'تدريب لـ 20+ موظف ليبي',
        'أحدث المعدات والتقنيات المعتمدة',
        'نظام إدارة متطور مع AI باللغة العربية',
        'دعم تقني محلي مدى الحياة',
        'خدمات تسويقية متكاملة في ليبيا',
        'إدارة العمليات عن بُعد',
        'شراكة حصرية في المنطقة',
      ],
      expectedROI: '30-40%',
      breakEven: '6-10 أشهر',
      color: 'border-purple-200 bg-purple-50',
    },
  ];

  const successStories = [
    {
      name: 'أحمد المبروك',
      location: 'طرابلس، ليبيا',
      rating: 5,
      story:
        'بدأت بالخطة المتقدمة في 2022 وحققت أرباحاً تفوق التوقعات. الدعم التقني والتدريب كان ممتازاً، والآن أخطط لفتح مركز ثاني في بنغازي.',
      investment: '350,000 دولار',
      monthlyProfit: '45,000 دولار',
      timeframe: '18 شهر',
      image:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    },
    {
      name: 'فاطمة الزروق',
      location: 'مصراتة، ليبيا',
      rating: 5,
      story:
        'كنت أعمل في مجال السيارات لسنوات، لكن الشراكة مع المنصة غيرت حياتي تماماً. الآن لدي مركز فحص حديث ومربح جداً.',
      investment: '180,000 دولار',
      monthlyProfit: '28,000 دولار',
      timeframe: '14 شهر',
      image:
        'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    },
    {
      name: 'محمد القذافي',
      location: 'بنغازي، ليبيا',
      rating: 4,
      story:
        'استثمرت في الخطة الأساسية كبداية، والنتائج كانت مشجعة جداً. الفريق محترف والنظام سهل الاستخدام. أنصح بشدة.',
      investment: '150,000 دولار',
      monthlyProfit: '22,000 دولار',
      timeframe: '16 شهر',
      image:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    },
    {
      name: 'عائشة بن علي',
      location: 'الزاوية، ليبيا',
      rating: 5,
      story:
        'بعد تقاعدي من الخدمة الحكومية، قررت الاستثمار في هذا المشروع. كان القرار الأفضل في حياتي، الآن لدي دخل ثابت ومستقبل مضمون.',
      investment: '220,000 دولار',
      monthlyProfit: '32,000 دولار',
      timeframe: '12 شهر',
      image:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    },
    {
      name: 'يوسف الشريف',
      location: 'سبها، ليبيا',
      rating: 5,
      story:
        'فتحت أول مركز فحص في الجنوب الليبي، والطلب كان أكبر من التوقعات. الدعم من الفريق كان استثنائياً، خاصة في المناطق النائية.',
      investment: '280,000 دولار',
      monthlyProfit: '38,000 دولار',
      timeframe: '15 شهر',
      image:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    },
    {
      name: 'نادية الفيتوري',
      location: 'طرابلس، ليبيا',
      rating: 4,
      story:
        'كوني امرأة في هذا المجال، كنت متخوفة في البداية، لكن الفريق دعمني بشكل كامل. الآن لدي مركز ناجح وأشجع النساء على الاستثمار.',
      investment: '320,000 دولار',
      monthlyProfit: '41,000 دولار',
      timeframe: '13 شهر',
      image:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    },
  ];

  const libyanCities = [
    {
      name: 'طرابلس',
      demand: 'عالي جداً',
      competition: 'متوسط',
      population: '1.2 مليون',
      carOwnership: '65%',
      potentialRevenue: '80,000 - 120,000 دولار/شهر',
    },
    {
      name: 'بنغازي',
      demand: 'عالي',
      competition: 'منخفض',
      population: '650,000',
      carOwnership: '58%',
      potentialRevenue: '45,000 - 70,000 دولار/شهر',
    },
    {
      name: 'مصراتة',
      demand: 'عالي',
      competition: 'منخفض',
      population: '550,000',
      carOwnership: '62%',
      potentialRevenue: '40,000 - 65,000 دولار/شهر',
    },
    {
      name: 'الزاوية',
      demand: 'متوسط',
      competition: 'منخفض',
      population: '290,000',
      carOwnership: '55%',
      potentialRevenue: '25,000 - 40,000 دولار/شهر',
    },
    {
      name: 'سبها',
      demand: 'متوسط',
      competition: 'منخفض جداً',
      population: '130,000',
      carOwnership: '48%',
      potentialRevenue: '15,000 - 25,000 دولار/شهر',
    },
    {
      name: 'أجدابيا',
      demand: 'متوسط',
      competition: 'منخفض جداً',
      population: '85,000',
      carOwnership: '52%',
      potentialRevenue: '12,000 - 20,000 دولار/شهر',
    },
  ];

  return (
    <>
      <Head>
        <title>الشراكة والاستثمار - مزاد السيارات</title>
        <meta
          name="description"
          content="انضم إلى شبكتنا العالمية من مراكز الفحص واحصل على عوائد استثمارية مضمونة"
        />
      </Head>

      <div className="min-h-screen bg-white" dir="rtl">
        <OpensooqNavbar />

        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white">
          <div className="mx-auto max-w-7xl px-4 py-16">
            <div className="text-center">
              <h1 className="mb-6 text-4xl font-bold md:text-5xl">
                استثمر في مستقبل صناعة السيارات في ليبيا
              </h1>
              <p className="mx-auto mb-8 max-w-3xl text-xl text-blue-100 md:text-2xl">
                انضم إلى شبكة مراكز الفحص والتقييم الرائدة في ليبيا واحصل على عوائد استثمارية مضمونة
                تصل إلى 35%
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link
                  href="/apply-center"
                  className="rounded-lg bg-white px-8 py-3 font-semibold text-blue-900 transition-colors hover:bg-gray-100"
                >
                  ابدأ الآن
                </Link>
                <button className="rounded-lg border-2 border-white px-8 py-3 font-semibold text-white transition-colors hover:bg-white hover:text-blue-900">
                  تحميل دليل الاستثمار
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gray-50 py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              <div className="text-center">
                <div className="mb-2 text-3xl font-bold text-blue-600 md:text-4xl">12+</div>
                <div className="text-gray-600">مركز في ليبيا</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-3xl font-bold text-green-600 md:text-4xl">6</div>
                <div className="text-gray-600">مدن رئيسية</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-3xl font-bold text-purple-600 md:text-4xl">28%</div>
                <div className="text-gray-600">متوسط العائد السنوي</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-3xl font-bold text-orange-600 md:text-4xl">98%</div>
                <div className="text-gray-600">معدل نجاح الشركاء</div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900">لماذا تختار الشراكة معنا؟</h2>
              <p className="mx-auto max-w-2xl text-gray-600">
                نقدم لك كل ما تحتاجه لبناء مشروع ناجح ومربح في صناعة فحص وتقييم السيارات
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {partnershipBenefits.map((benefit, index) => (
                <div
                  key={index}
                  className="rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div
                    className={`h-12 w-12 rounded-lg ${benefit.color} mb-4 flex items-center justify-center`}
                  >
                    <benefit.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-900">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Investment Plans */}
        <div className="bg-gray-50 py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900">خطط الاستثمار</h2>
              <p className="mx-auto max-w-2xl text-gray-600">
                اختر الخطة التي تناسب ميزانيتك وأهدافك الاستثمارية
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {investmentPlans.map((plan, index) => (
                <div
                  key={index}
                  className={`rounded-lg border-2 bg-white shadow-sm ${plan.color} relative p-6`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform">
                      <span className="rounded-full bg-green-500 px-4 py-1 text-sm font-medium text-white">
                        الأكثر شعبية
                      </span>
                    </div>
                  )}

                  <div className="mb-6 text-center">
                    <h3 className="mb-2 text-2xl font-bold text-gray-900">{plan.name}</h3>
                    <div className="mb-1 text-3xl font-bold text-blue-600">{plan.investment}</div>
                    <div className="text-gray-600">{plan.currency}</div>
                  </div>

                  <ul className="mb-6 space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <CheckCircleIcon className="ml-2 mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mb-6 border-t pt-4">
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-gray-600">العائد المتوقع:</span>
                      <span className="font-semibold text-green-600">{plan.expectedROI}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">فترة الاسترداد:</span>
                      <span className="font-semibold text-blue-600">{plan.breakEven}</span>
                    </div>
                  </div>

                  <Link
                    href="/apply-center"
                    className="block w-full rounded-lg bg-blue-600 py-3 text-center font-semibold text-white transition-colors hover:bg-blue-700"
                  >
                    اختر هذه الخطة
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Libyan Cities Section */}
        <div className="py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900">
                الفرص الاستثمارية في المدن الليبية
              </h2>
              <p className="mx-auto max-w-2xl text-gray-600">
                اكتشف أفضل الفرص الاستثمارية في المدن الليبية الرئيسية
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {libyanCities.map((city, index) => (
                <div
                  key={index}
                  className="cursor-pointer rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="mb-4 text-center">
                    <h3 className="mb-3 text-xl font-semibold text-gray-900">{city.name}</h3>
                    <div className="mb-2 text-sm text-gray-600">عدد السكان: {city.population}</div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">الطلب:</span>
                      <span
                        className={`font-medium ${
                          city.demand === 'عالي جداً'
                            ? 'text-red-600'
                            : city.demand === 'عالي'
                              ? 'text-orange-600'
                              : 'text-yellow-600'
                        }`}
                      >
                        {city.demand}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">المنافسة:</span>
                      <span
                        className={`font-medium ${
                          city.competition === 'عالي'
                            ? 'text-red-600'
                            : city.competition === 'متوسط'
                              ? 'text-yellow-600'
                              : 'text-green-600'
                        }`}
                      >
                        {city.competition}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ملكية السيارات:</span>
                      <span className="font-medium text-blue-600">{city.carOwnership}</span>
                    </div>
                    <div className="mt-3 border-t pt-3">
                      <div className="text-center">
                        <div className="mb-1 text-xs text-gray-500">الإيرادات المتوقعة</div>
                        <div className="font-semibold text-green-600">{city.potentialRevenue}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Success Stories */}
        <div className="bg-gray-50 py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900">قصص نجاح شركائنا</h2>
              <p className="mx-auto max-w-2xl text-gray-600">
                اكتشف كيف حقق شركاؤنا نجاحاً باهراً في مشاريعهم
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {successStories.map((story, index) => (
                <div
                  key={index}
                  className="rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="mb-4 flex items-center">
                    <div className="ml-3 h-12 w-12 overflow-hidden rounded-full">
                      <img
                        src={story.image}
                        alt={story.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{story.name}</h3>
                      <p className="text-sm text-gray-600">{story.location}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`h-4 w-4 ${
                            i < story.rating ? 'fill-current text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="mr-2 text-sm text-gray-600">({story.rating}/5)</span>
                    </div>
                  </div>

                  <p className="mb-4 text-sm italic leading-relaxed text-gray-700">
                    &quot;{story.story}&quot;
                  </p>

                  <div className="space-y-2 border-t pt-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">الاستثمار:</span>
                      <span className="font-semibold text-blue-600">{story.investment}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">الربح الشهري:</span>
                      <span className="font-semibold text-green-600">{story.monthlyProfit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">فترة الاسترداد:</span>
                      <span className="font-semibold text-purple-600">{story.timeframe}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Libya Market Advantages */}
        <div className="py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900">لماذا السوق الليبي؟</h2>
              <p className="mx-auto max-w-2xl text-gray-600">
                ليبيا تقدم فرصاً استثمارية فريدة في قطاع فحص السيارات
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border bg-white p-6 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                  <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">نمو سريع</h3>
                <p className="text-sm text-gray-600">نمو سوق السيارات بنسبة 15% سنوياً</p>
              </div>

              <div className="rounded-lg border bg-white p-6 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">منافسة قليلة</h3>
                <p className="text-sm text-gray-600">عدد محدود من مراكز الفحص المعتمدة</p>
              </div>

              <div className="rounded-lg border bg-white p-6 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                  <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">عوائد عالية</h3>
                <p className="text-sm text-gray-600">أسعار خدمات مرتفعة مقارنة بالتكاليف</p>
              </div>

              <div className="rounded-lg border bg-white p-6 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                  <ShieldCheckIcon className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">دعم حكومي</h3>
                <p className="text-sm text-gray-600">تشجيع حكومي للاستثمار في القطاع</p>
              </div>
            </div>

            {/* Additional Statistics */}
            <div className="mt-12 rounded-lg bg-gray-50 p-8">
              <h3 className="mb-6 text-center text-xl font-bold text-gray-900">
                حقائق عن السوق الليبي
              </h3>
              <div className="grid grid-cols-1 gap-6 text-center md:grid-cols-3">
                <div>
                  <div className="mb-2 text-2xl font-bold text-blue-600">2.5 مليون</div>
                  <div className="text-gray-600">سيارة مسجلة في ليبيا</div>
                </div>
                <div>
                  <div className="mb-2 text-2xl font-bold text-green-600">60%</div>
                  <div className="text-gray-600">نسبة السيارات المستعملة</div>
                </div>
                <div>
                  <div className="mb-2 text-2xl font-bold text-purple-600">85%</div>
                  <div className="text-gray-600">نسبة الحاجة لفحص دوري</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-blue-900 py-16 text-white">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <h2 className="mb-4 text-3xl font-bold">هل أنت مستعد لبدء رحلتك الاستثمارية؟</h2>
            <p className="mb-8 text-xl text-blue-100">
              انضم إلى شبكتنا العالمية اليوم واحصل على استشارة مجانية من خبرائنا
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/apply-center"
                className="rounded-lg bg-white px-8 py-3 font-semibold text-blue-900 transition-colors hover:bg-gray-100"
              >
                قدم طلبك الآن
              </Link>
              <Link
                href="/advertising-contact?type=team"
                className="inline-block rounded-lg border-2 border-white px-8 py-3 font-semibold text-white transition-colors hover:bg-white hover:text-blue-900"
              >
                تحدث مع خبير
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PartnershipPage;
