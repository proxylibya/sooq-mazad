import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
// import { useSession } from 'next-auth/react'; // تم تعطيل نظام المصادقة مؤقتاً
import { OpensooqNavbar } from '../components/common';
import BuildingOfficeIcon from '@heroicons/react/24/outline/BuildingOfficeIcon';
import DocumentTextIcon from '@heroicons/react/24/outline/DocumentTextIcon';
import CurrencyDollarIcon from '@heroicons/react/24/outline/CurrencyDollarIcon';
import UserIcon from '@heroicons/react/24/outline/UserIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import AcademicCapIcon from '@heroicons/react/24/outline/AcademicCapIcon';
import PhotoIcon from '@heroicons/react/24/outline/PhotoIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import { countries } from '../utils/localizationSystem';
import PhoneInputField from '../components/PhoneInputField';
import { type Country } from '../components/CountryCodeSelector';
import { processPhoneNumber } from '../utils/phoneUtils';

const ApplyCenterPage = () => {
  const router = useRouter();
  // const { data: session } = useSession(); // تم تعطيل نظام المصادقة مؤقتاً
  const session = null; // مؤقتاً
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // معلومات مقدم الطلب
    applicant: {
      name: '',
      email: '',
      phone: session?.user?.phone ? session.user.phone.replace(/^\+218/, '') : '',
      nationalId: '',
      businessLicense: '',
    },
    // معلومات المركز المقترح
    proposedCenter: {
      name: '',
      country: '',
      city: '',
      address: '',
      coordinates: {
        lat: 0,
        lng: 0,
      },
    },
    // الخبرة والمؤهلات
    qualifications: {
      experience: 0,
      previousWork: [''],
      certifications: [''],
      teamSize: 0,
    },
    // الخطة المالية
    financialPlan: {
      initialInvestment: 0,
      monthlyOperatingCost: 0,
      expectedMonthlyRevenue: 0,
      breakEvenPeriod: 0,
    },
  });
  const [dialCode, setDialCode] = useState('+218');

  const steps = [
    { id: 1, name: 'المعلومات الشخصية', icon: UserIcon },
    { id: 2, name: 'معلومات المركز', icon: BuildingOfficeIcon },
    { id: 3, name: 'الخبرة والمؤهلات', icon: AcademicCapIcon },
    { id: 4, name: 'الخطة المالية', icon: CurrencyDollarIcon },
    { id: 5, name: 'المراجعة والإرسال', icon: CheckCircleIcon },
  ];

  // تحديث رقم الهاتف عند تحميل بيانات المستخدم
  useEffect(() => {
    if (session?.user?.phone) {
      const phoneWithoutCountryCode = session.user.phone.replace(/^\+218/, '');
      setFormData((prev) => ({
        ...prev,
        applicant: {
          ...prev.applicant,
          phone: phoneWithoutCountryCode,
        },
      }));
    }
  }, [session?.user?.phone]);

  const handleInputChange = (section: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value,
      },
    }));
  };

  const handleArrayChange = (section: string, field: string, index: number, value: string) => {
    setFormData((prev) => {
      const sectionData = prev[section as keyof typeof prev] as any;
      const fieldArray = sectionData[field] as string[];

      return {
        ...prev,
        [section]: {
          ...sectionData,
          [field]: fieldArray.map((item: string, i: number) => (i === index ? value : item)),
        },
      };
    });
  };

  const addArrayItem = (section: string, field: string) => {
    setFormData((prev) => {
      const sectionData = prev[section as keyof typeof prev] as any;
      const fieldArray = sectionData[field] as string[];

      return {
        ...prev,
        [section]: {
          ...sectionData,
          [field]: [...fieldArray, ''],
        },
      };
    });
  };

  const removeArrayItem = (section: string, field: string, index: number) => {
    setFormData((prev) => {
      const sectionData = prev[section as keyof typeof prev] as any;
      const fieldArray = sectionData[field] as string[];

      return {
        ...prev,
        [section]: {
          ...sectionData,
          [field]: fieldArray.filter((_: any, i: number) => i !== index),
        },
      };
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // تحقق وتنسيق رقم الهاتف قبل الإرسال
      if (!formData.applicant.phone.trim()) {
        alert('رقم الهاتف مطلوب');
        setIsSubmitting(false);
        return;
      }
      const phoneResult = processPhoneNumber(dialCode + formData.applicant.phone);
      if (!phoneResult.isValid) {
        alert(phoneResult.error || 'رقم الهاتف غير صحيح');
        setIsSubmitting(false);
        return;
      }

      const response = await fetch('/api/center-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          applicant: { ...formData.applicant, phone: phoneResult.fullNumber },
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('تم تقديم طلبك بنجاح! سيتم مراجعته خلال 5-7 أيام عمل.');
        router.push('/');
      } else {
        alert('حدث خطأ في تقديم الطلب. يرجى المحاولة مرة أخرى.');
      }
    } catch (error) {
      console.error('خطأ في تقديم الطلب:', error);
      alert('حدث خطأ في تقديم الطلب. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);

      // التمرير إلى الأعلى بسلاسة عند الانتقال للخطوة التالية
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      }, 100);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);

      // التمرير إلى الأعلى بسلاسة عند الانتقال للخطوة السابقة
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      }, 100);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="mb-4 text-xl font-semibold text-gray-900">المعلومات الشخصية</h3>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  الاسم الكامل *
                </label>
                <input
                  type="text"
                  value={formData.applicant.name}
                  onChange={(e) => handleInputChange('applicant', 'name', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  placeholder="أدخل اسمك الكامل"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  البريد الإلكتروني *
                </label>
                <input
                  type="email"
                  value={formData.applicant.email}
                  onChange={(e) => handleInputChange('applicant', 'email', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  placeholder="example@email.com"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">رقم الهاتف *</label>
                <PhoneInputField
                  value={formData.applicant.phone}
                  onChange={(v: string) => handleInputChange('applicant', 'phone', v)}
                  onCountryChange={(c: Country) => setDialCode(c.code)}
                  placeholder="أدخل رقم الهاتف"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  رقم الهوية الوطنية *
                </label>
                <input
                  type="text"
                  value={formData.applicant.nationalId}
                  onChange={(e) => handleInputChange('applicant', 'nationalId', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  placeholder="رقم الهوية"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  رقم السجل التجاري (اختياري)
                </label>
                <input
                  type="text"
                  value={formData.applicant.businessLicense}
                  onChange={(e) =>
                    handleInputChange('applicant', 'businessLicense', e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  placeholder="رقم السجل التجاري"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="mb-4 text-xl font-semibold text-gray-900">معلومات المركز المقترح</h3>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">اسم المركز *</label>
                <input
                  type="text"
                  value={formData.proposedCenter.name}
                  onChange={(e) => handleInputChange('proposedCenter', 'name', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  placeholder="مثال: مركز الرياض للفحص الفني"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">البلد *</label>
                <select
                  value={formData.proposedCenter.country}
                  onChange={(e) => handleInputChange('proposedCenter', 'country', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">اختر البلد</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.name}>
                      {country.flag} {country.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">المدينة *</label>
                <input
                  type="text"
                  value={formData.proposedCenter.city}
                  onChange={(e) => handleInputChange('proposedCenter', 'city', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  placeholder="اسم المدينة"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  العنوان التفصيلي *
                </label>
                <textarea
                  value={formData.proposedCenter.address}
                  onChange={(e) => handleInputChange('proposedCenter', 'address', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="العنوان الكامل للمركز المقترح"
                  required
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="mb-4 text-xl font-semibold text-gray-900">الخبرة والمؤهلات</h3>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  سنوات الخبرة *
                </label>
                <input
                  type="number"
                  value={formData.qualifications.experience}
                  onChange={(e) =>
                    handleInputChange('qualifications', 'experience', parseInt(e.target.value))
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  placeholder="عدد سنوات الخبرة"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  حجم الفريق المتوقع *
                </label>
                <input
                  type="number"
                  value={formData.qualifications.teamSize}
                  onChange={(e) =>
                    handleInputChange('qualifications', 'teamSize', parseInt(e.target.value))
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  placeholder="عدد الموظفين"
                  min="1"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                الخبرات السابقة
              </label>
              {formData.qualifications.previousWork.map((work, index) => (
                <div key={index} className="mb-2 flex gap-2">
                  <input
                    type="text"
                    value={work}
                    onChange={(e) =>
                      handleArrayChange('qualifications', 'previousWork', index, e.target.value)
                    }
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder="وصف الخبرة السابقة"
                  />
                  {formData.qualifications.previousWork.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('qualifications', 'previousWork', index)}
                      className="rounded-lg px-3 py-2 text-red-600 hover:bg-red-50"
                    >
                      حذف
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('qualifications', 'previousWork')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                + إضافة خبرة أخرى
              </button>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                الشهادات والمؤهلات
              </label>
              {formData.qualifications.certifications.map((cert, index) => (
                <div key={index} className="mb-2 flex gap-2">
                  <input
                    type="text"
                    value={cert}
                    onChange={(e) =>
                      handleArrayChange('qualifications', 'certifications', index, e.target.value)
                    }
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder="اسم الشهادة أو المؤهل"
                  />
                  {formData.qualifications.certifications.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('qualifications', 'certifications', index)}
                      className="rounded-lg px-3 py-2 text-red-600 hover:bg-red-50"
                    >
                      حذف
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('qualifications', 'certifications')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                + إضافة شهادة أخرى
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="mb-4 text-xl font-semibold text-gray-900">الخطة المالية</h3>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  الاستثمار الأولي *
                </label>
                <input
                  type="number"
                  value={formData.financialPlan.initialInvestment}
                  onChange={(e) =>
                    handleInputChange(
                      'financialPlan',
                      'initialInvestment',
                      parseInt(e.target.value),
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  placeholder="المبلغ بالعملة المحلية"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  التكلفة التشغيلية الشهرية *
                </label>
                <input
                  type="number"
                  value={formData.financialPlan.monthlyOperatingCost}
                  onChange={(e) =>
                    handleInputChange(
                      'financialPlan',
                      'monthlyOperatingCost',
                      parseInt(e.target.value),
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  placeholder="التكلفة الشهرية"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  الإيرادات الشهرية المتوقعة *
                </label>
                <input
                  type="number"
                  value={formData.financialPlan.expectedMonthlyRevenue}
                  onChange={(e) =>
                    handleInputChange(
                      'financialPlan',
                      'expectedMonthlyRevenue',
                      parseInt(e.target.value),
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  placeholder="الإيرادات المتوقعة"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  فترة استرداد رأس المال (بالأشهر) *
                </label>
                <input
                  type="number"
                  value={formData.financialPlan.breakEvenPeriod}
                  onChange={(e) =>
                    handleInputChange('financialPlan', 'breakEvenPeriod', parseInt(e.target.value))
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  placeholder="عدد الأشهر"
                  min="1"
                  required
                />
              </div>
            </div>

            {/* حساب الربحية المتوقعة */}
            <div className="rounded-lg bg-blue-50 p-4">
              <h4 className="mb-2 font-medium text-blue-900">تحليل الربحية المتوقعة</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">الربح الشهري المتوقع:</span>
                  <span className="mr-2 font-medium text-blue-900">
                    {(
                      formData.financialPlan.expectedMonthlyRevenue -
                      formData.financialPlan.monthlyOperatingCost
                    ).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-blue-700">هامش الربح:</span>
                  <span className="mr-2 font-medium text-blue-900">
                    {formData.financialPlan.expectedMonthlyRevenue > 0
                      ? Math.round(
                          ((formData.financialPlan.expectedMonthlyRevenue -
                            formData.financialPlan.monthlyOperatingCost) /
                            formData.financialPlan.expectedMonthlyRevenue) *
                            100,
                        )
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="mb-4 text-xl font-semibold text-gray-900">مراجعة البيانات</h3>

            {/* ملخص البيانات */}
            <div className="space-y-4">
              <div className="rounded-lg bg-gray-50 p-4">
                <h4 className="mb-2 font-medium text-gray-900">المعلومات الشخصية</h4>
                <p>
                  <strong>الاسم:</strong> {formData.applicant.name}
                </p>
                <p>
                  <strong>البريد الإلكتروني:</strong> {formData.applicant.email}
                </p>
                <p>
                  <strong>الهاتف:</strong> {formData.applicant.phone}
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <h4 className="mb-2 font-medium text-gray-900">معلومات المركز</h4>
                <p>
                  <strong>اسم المركز:</strong> {formData.proposedCenter.name}
                </p>
                <p>
                  <strong>الموقع:</strong> {formData.proposedCenter.city},{' '}
                  {formData.proposedCenter.country}
                </p>
                <p>
                  <strong>العنوان:</strong> {formData.proposedCenter.address}
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <h4 className="mb-2 font-medium text-gray-900">الخبرة والمؤهلات</h4>
                <p>
                  <strong>سنوات الخبرة:</strong> {formData.qualifications.experience} سنة
                </p>
                <p>
                  <strong>حجم الفريق:</strong> {formData.qualifications.teamSize} موظف
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <h4 className="mb-2 font-medium text-gray-900">الخطة المالية</h4>
                <p>
                  <strong>الاستثمار الأولي:</strong>{' '}
                  {formData.financialPlan.initialInvestment.toLocaleString()}
                </p>
                <p>
                  <strong>الإيرادات الشهرية المتوقعة:</strong>{' '}
                  {formData.financialPlan.expectedMonthlyRevenue.toLocaleString()}
                </p>
                <p>
                  <strong>فترة استرداد رأس المال:</strong> {formData.financialPlan.breakEvenPeriod}{' '}
                  شهر
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <p className="text-sm text-yellow-800">
                <strong>ملاحظة:</strong> بعد تقديم الطلب، سيتم مراجعته من قبل فريقنا المختص خلال 5-7
                أيام عمل. سيتم التواصل معك عبر البريد الإلكتروني أو الهاتف لمناقشة التفاصيل والخطوات
                التالية.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Head>
        <title>طلب إنشاء مركز فحص - مزاد السيارات</title>
        <meta name="description" content="قدم طلبك لإنشاء مركز فحص وتقييم السيارات معتمد في بلدك" />
      </Head>

      <div className="min-h-screen bg-gray-50" dir="rtl">
        <OpensooqNavbar />

        <div className="mx-auto max-w-4xl px-4 py-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="mb-4 text-3xl font-bold text-gray-900">
              طلب إنشاء مركز فحص وتقييم السيارات
            </h1>
            <p className="mx-auto max-w-2xl text-gray-600">
              انضم إلى شبكتنا العالمية من مراكز الفحص المعتمدة وابدأ رحلتك في عالم مزادات السيارات
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                      currentStep >= step.id
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-gray-300 text-gray-400'
                    }`}
                  >
                    <step.icon className="h-5 w-5" />
                  </div>
                  <div className="mr-3 hidden md:block">
                    <p
                      className={`text-sm font-medium ${
                        currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'
                      }`}
                    >
                      {step.name}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`mx-4 h-0.5 w-full ${
                        currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">{renderStepContent()}</div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`rounded-lg px-6 py-2 font-medium ${
                currentStep === 1
                  ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              السابق
            </button>

            {currentStep < steps.length ? (
              <button
                onClick={nextStep}
                className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700"
              >
                التالي
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`rounded-lg px-6 py-2 font-medium ${
                  isSubmitting
                    ? 'cursor-not-allowed bg-gray-400 text-white'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isSubmitting ? 'جاري الإرسال...' : 'تقديم الطلب'}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ApplyCenterPage;
