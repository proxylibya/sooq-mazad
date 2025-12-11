import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';
import { type Country } from '../components/CountryCodeSelector';
import PhoneInputField from '../components/PhoneInputField';
import { OpensooqNavbar } from '../components/common';
import {
  HelpProfessionalIcon,
  PaymentProfessionalIcon,
  SecurityProfessionalIcon,
  StatsProfessionalIcon,
  WalletProfessionalIcon,
} from '../components/icons/ProfessionalIcons';
import SelectField from '../components/ui/SelectField';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { cityNames } from '../data/libyan-cities';
import { processPhoneNumber } from '../utils/phoneUtils';

// خريطة أسماء الحزم
const PACKAGE_NAMES: Record<string, string> = {
  bronze: 'الحزمة البرونزية (300-500 د.ل)',
  silver: 'الحزمة الفضية (800-1200 د.ل)',
  gold: 'الحزمة الذهبية (1500-2500 د.ل)',
  'company-page': 'صفحة شركة مدفوعة (1000-2000 د.ل)',
  'video-ad': 'إعلان مرئي/صوتي (500-1000 د.ل)',
};

const SERVICE_TYPES = [
  'عرض إعلان في الصفحة الرئيسية',
  'عرض إعلان في أغلب الموقع',
  'طلب عرض فيديو إعلاني',
  'شيء آخر',
];

const TEAM_INQUIRY_TYPES = [
  'اقتراح تحسين',
  'شكوى',
  'استفسار عام',
  'مشكلة تقنية',
  'طلب شراكة',
  'أخرى',
];

function getPackageName(key?: string | string[]): string | null {
  if (!key) return null;
  const k = Array.isArray(key) ? key[0] : key;
  return PACKAGE_NAMES[k] ?? null;
}

// التحقق سيتم عبر processPhoneNumber الموحد

export default function AdvertisingContactPage() {
  const router = useRouter();
  const { type, package: pkg } = router.query;

  const isTeamContact = useMemo(() => type === 'team', [type]);
  const selectedPackageName = useMemo(() => getPackageName(pkg), [pkg]);

  const pageTitle = isTeamContact ? 'مراسلة فريق الموقع' : 'طلب خدمة إعلانية للأعمال';
  const pageDescription = isTeamContact
    ? 'تواصل مع فريق الموقع للاستفسارات العامة والاقتراحات والمشاكل التقنية'
    : 'اطلب باقة أو خدمة إعلانية وسنقوم بالتواصل معك لتأكيد التفاصيل خلال 24 ساعة';

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    companyName: '',
    serviceType: '',
    message: '',
  });
  const [dialCode, setDialCode] = useState('+218');

  const [submitState, setSubmitState] = useState<{
    status: 'idle' | 'submitting' | 'success' | 'error';
    message?: string;
  }>({ status: 'idle' });

  // تعيين نوع الخدمة تلقائياً عند وجود حزمة محددة
  useEffect(() => {
    if (!isTeamContact && selectedPackageName) {
      setFormData((prev) => ({ ...prev, serviceType: selectedPackageName }));
    }
  }, [isTeamContact, selectedPackageName]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // تحقق أساسي
    if (!formData.name || !formData.phone || !formData.city || !formData.serviceType) {
      setSubmitState({
        status: 'error',
        message: 'يرجى ملء جميع الحقول المطلوبة',
      });
      return;
    }
    const phoneResult = processPhoneNumber(dialCode + formData.phone);
    if (!phoneResult.isValid) {
      setSubmitState({
        status: 'error',
        message: phoneResult.error || 'رقم الهاتف غير صحيح',
      });
      return;
    }

    setSubmitState({ status: 'submitting' });

    try {
      // إرسال البيانات للـ API
      const response = await fetch('/api/advertising-contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          dialCode: dialCode,
          city: formData.city,
          companyName: formData.companyName?.trim() || null,
          serviceType: formData.serviceType,
          message: formData.message?.trim() || null,
          requestType: isTeamContact ? 'team' : 'advertising',
          packageType: selectedPackageName || null,
          source: typeof window !== 'undefined' ? window.location.href : null,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitState({
          status: 'success',
          message:
            data.message ||
            (selectedPackageName
              ? `تم استلام طلب ${selectedPackageName}. سنتواصل معك خلال 24 ساعة.`
              : 'تم استلام طلبك بنجاح. سنتواصل معك خلال 24 ساعة.'),
        });
        // إعادة الضبط مع الحفاظ على المدينة لتجربة أفضل
        setFormData((prev) => ({
          name: '',
          phone: '',
          city: prev.city,
          companyName: '',
          serviceType: isTeamContact ? '' : selectedPackageName || '',
          message: '',
        }));
      } else {
        setSubmitState({
          status: 'error',
          message: data.message || 'حدث خطأ أثناء الإرسال. حاول مجدداً.',
        });
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setSubmitState({
        status: 'error',
        message: 'حدث خطأ في الاتصال بالخادم. حاول مجدداً.',
      });
    }
  };

  return (
    <>
      <Head>
        <title>{pageTitle} - مزاد السيارات</title>
        <meta name="description" content={pageDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-50" dir="rtl">
        <OpensooqNavbar />

        <div className="mx-auto max-w-6xl px-4 py-8">
          {/* روابط علوية */}
          <div className="mb-6 flex flex-wrap items-center gap-4 text-sm">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              <StatsProfessionalIcon className="h-4 w-4 text-blue-600" />
              العودة للصفحة الرئيسية
            </Link>
            {!isTeamContact && (
              <>
                <span className="text-gray-300">|</span>
                <Link
                  href="/#business_packages"
                  className="inline-flex items-center gap-2 text-green-600 hover:text-green-800"
                >
                  <StatsProfessionalIcon className="h-4 w-4 text-green-600" />
                  الحزم الإعلانية
                </Link>
              </>
            )}
          </div>

          {/* عنوان ووصف */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              {isTeamContact ? (
                <WalletProfessionalIcon className="h-8 w-8 text-blue-600" />
              ) : (
                <HelpProfessionalIcon className="h-8 w-8 text-blue-600" />
              )}
            </div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">{pageTitle}</h1>
            <p className="text-gray-600">{pageDescription}</p>

            {selectedPackageName && !isTeamContact && (
              <div className="mx-auto mt-4 max-w-xl rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-800">
                <div className="flex items-center justify-center gap-2">
                  <SecurityProfessionalIcon className="h-5 w-5 text-green-600" />
                  <span className="font-medium">تم اختيار: {selectedPackageName}</span>
                </div>
              </div>
            )}
          </div>

          {/* تنبيهات الحالة */}
          {submitState.status !== 'idle' && submitState.message && (
            <div
              className={
                'mb-6 rounded-lg border p-4 ' +
                (submitState.status === 'success'
                  ? 'border-green-300 bg-green-50 text-green-700'
                  : submitState.status === 'error'
                    ? 'border-red-300 bg-red-50 text-red-700'
                    : 'border-blue-300 bg-blue-50 text-blue-700')
              }
            >
              <div className="flex items-center gap-2">
                {submitState.status === 'success' && (
                  <SecurityProfessionalIcon className="h-5 w-5 text-green-600" />
                )}
                {submitState.status === 'error' && (
                  <PaymentProfessionalIcon className="h-5 w-5 text-red-600" />
                )}
                <span className="text-sm font-medium">{submitState.message}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* النموذج */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-xl">
                  {isTeamContact ? 'نموذج مراسلة الفريق' : 'نموذج طلب الخدمة'}
                </CardTitle>
                <p className="text-sm text-gray-600">
                  يرجى تعبئة الحقول المطلوبة وسنقوم بالتواصل معك خلال 24 ساعة.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* الاسم */}
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        الاسم الكامل <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <StatsProfessionalIcon className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full rounded-md border border-gray-300 py-2.5 pl-3 pr-10 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                          placeholder="أدخل اسمك الكامل"
                          required
                        />
                      </div>
                    </div>
                    {/* الهاتف */}
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        رقم الهاتف <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <PaymentProfessionalIcon className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <PhoneInputField
                          value={formData.phone}
                          onChange={(v: string) => setFormData((prev) => ({ ...prev, phone: v }))}
                          onCountryChange={(c: Country) => setDialCode(c.code)}
                          placeholder="أدخل رقم الهاتف"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* المدينة */}
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        المدينة <span className="text-red-500">*</span>
                      </label>
                      <SelectField
                        options={cityNames}
                        value={formData.city}
                        onChange={(val) => setFormData((prev) => ({ ...prev, city: val }))}
                        placeholder="اختر المدينة"
                        searchable
                        clearable
                        compact
                        size="md"
                      />
                    </div>
                    {/* الشركة */}
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        اسم الشركة (اختياري)
                      </label>
                      <div className="relative">
                        <WalletProfessionalIcon className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleChange}
                          className="w-full rounded-md border border-gray-300 py-2.5 pl-3 pr-10 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                          placeholder="اسم الشركة أو المؤسسة"
                        />
                      </div>
                    </div>
                  </div>

                  {/* نوع الخدمة / الاستفسار */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      {isTeamContact ? 'نوع الاستفسار' : 'نوع الإعلان المطلوب'}{' '}
                      <span className="text-red-500">*</span>
                    </label>
                    {selectedPackageName && !isTeamContact && (
                      <div className="mb-2 rounded-md border border-green-200 bg-green-50 p-2 text-xs text-green-800">
                        تم تعيين نوع الإعلان تلقائياً حسب الحزمة المختارة – يمكنك التغيير أدناه.
                      </div>
                    )}
                    <select
                      name="serviceType"
                      value={formData.serviceType}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 py-2.5 pl-3 pr-3 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="" disabled>
                        {isTeamContact ? 'اختر نوع الاستفسار' : 'اختر نوع الإعلان'}
                      </option>
                      {(isTeamContact ? TEAM_INQUIRY_TYPES : SERVICE_TYPES).map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* الرسالة */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      الرسالة (اختياري)
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={4}
                      className="w-full resize-y rounded-md border border-gray-300 p-3 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      placeholder={
                        isTeamContact
                          ? 'اكتب تفاصيل الاستفسار أو المشكلة...'
                          : 'اكتب تفاصيل إضافية عن الخدمة المطلوبة...'
                      }
                    />
                  </div>

                  <CardFooter className="px-0">
                    <Button
                      type="submit"
                      disabled={submitState.status === 'submitting'}
                      className="w-full"
                    >
                      {submitState.status === 'submitting' ? 'جاري الإرسال...' : 'إرسال الطلب'}
                    </Button>
                  </CardFooter>
                </form>
              </CardContent>
            </Card>

            {/* الشريط الجانبي */}
            <div className="space-y-6">
              {/* طرق التواصل الأخرى */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">طرق التواصل الأخرى</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                      <PaymentProfessionalIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium">الدعم الهاتفي</div>
                      <div className="text-sm text-gray-600">91-907-7400</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                      <WalletProfessionalIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">البريد الإلكتروني</div>
                      <div className="text-sm text-gray-600">support@carauction.ly</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* أوقات العمل */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">أوقات العمل والرد</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-gray-700">
                  <div>• الرد على الاستفسارات: خلال 24 ساعة</div>
                  <div>• المكالمات الهاتفية: 8:00 ص - 8:00 م</div>
                  <div>• أيام العمل: السبت - الخميس</div>
                </CardContent>
              </Card>

              {/* ماذا يحدث بعد الإرسال؟ */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">ماذا يحدث بعد الإرسال؟</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal space-y-2 pr-4 text-sm text-gray-700">
                    <li>يتحقق فريقنا من بياناتك ونوع الطلب</li>
                    <li>نتواصل معك عبر الهاتف أو البريد خلال 24 ساعة</li>
                    <li>نؤكد التفاصيل ونبدأ التنفيذ أو المتابعة</li>
                  </ol>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
