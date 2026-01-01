/**
 * مكونات المحتوى المحلي حسب البلد
 */

import React from 'react';
import { useContent, useCurrentCountry, useBusiness } from '../contexts/SimpleLocalizationContext';
import PhoneIcon from '@heroicons/react/24/outline/PhoneIcon';
import EnvelopeIcon from '@heroicons/react/24/outline/EnvelopeIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import CurrencyDollarIcon from '@heroicons/react/24/outline/CurrencyDollarIcon';
import TruckIcon from '@heroicons/react/24/outline/TruckIcon';
import BuildingOfficeIcon from '@heroicons/react/24/outline/BuildingOfficeIcon';
import CreditCardIcon from '@heroicons/react/24/outline/CreditCardIcon';
import WrenchScrewdriverIcon from '@heroicons/react/24/outline/WrenchScrewdriverIcon';

// مكون رسالة الترحيب
export const WelcomeMessage: React.FC<{ className?: string }> = ({ className = '' }) => {
  const content = useContent();

  if (!content) return null;

  return (
    <div className={`welcome-message ${className}`}>
      <h1 className="text-2xl font-bold text-gray-900">{content.welcomeMessage}</h1>
    </div>
  );
};

// مكون معلومات الاتصال
export const ContactInfo: React.FC<{ className?: string }> = ({ className = '' }) => {
  const content = useContent();

  if (!content?.contactInfo) return null;

  const { contactInfo } = content;

  return (
    <div className={`contact-info ${className}`}>
      <h3 className="mb-2 font-semibold text-gray-900">معلومات الاتصال</h3>
      <div className="space-y-1 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <PhoneIcon className="h-4 w-4 text-blue-600" />
          <span>{contactInfo.phone}</span>
        </div>
        <div className="flex items-center gap-2">
          <EnvelopeIcon className="h-4 w-4 text-blue-600" />
          <span>{contactInfo.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPinIcon className="h-4 w-4 text-blue-600" />
          <span>{contactInfo.address}</span>
        </div>
        <div className="flex items-center gap-2">
          <ClockIcon className="h-4 w-4 text-blue-600" />
          <span>{contactInfo.workingHours}</span>
        </div>
      </div>
    </div>
  );
};

// مكون طرق الدفع المتاحة
export const PaymentMethods: React.FC<{ className?: string }> = ({ className = '' }) => {
  const content = useContent();

  if (!content?.paymentMethods) return null;

  return (
    <div className={`payment-methods ${className}`}>
      <h3 className="mb-2 font-semibold text-gray-900">طرق الدفع المتاحة</h3>
      <div className="flex flex-wrap gap-2">
        {content.paymentMethods.map((method, index) => (
          <span key={index} className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-800">
            {method}
          </span>
        ))}
      </div>
    </div>
  );
};

// مكون معلومات الشحن
export const ShippingInfo: React.FC<{ className?: string }> = ({ className = '' }) => {
  const content = useContent();
  const country = useCurrentCountry();

  if (!content?.shippingInfo) return null;

  const { shippingInfo } = content;

  return (
    <div className={`shipping-info ${className}`}>
      <h3 className="mb-2 font-semibold text-gray-900">معلومات الشحن</h3>
      {shippingInfo.available ? (
        <div className="space-y-1 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <CurrencyDollarIcon className="h-4 w-4 text-green-600" />
            <span>
              التكلفة: {shippingInfo.cost}{' '}
              {(country as any)?.currencySymbol || country?.currency || ''}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <TruckIcon className="h-4 w-4 text-blue-600" />
            <span>المدة: {shippingInfo.duration}</span>
          </div>
          {shippingInfo.restrictions.length > 0 && (
            <div>
              <div className="mb-1 flex items-center gap-2">
                <span className="h-4 w-4 font-bold text-yellow-600">⚠</span>
                <span>القيود:</span>
              </div>
              <ul className="ml-4 list-inside list-disc">
                {shippingInfo.restrictions.map((restriction, index) => (
                  <li key={index}>{restriction}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="text-sm text-gray-500">الشحن غير متاح حالياً</div>
      )}
    </div>
  );
};

// مكون الماركات الشائعة
export const PopularBrands: React.FC<{
  className?: string;
  limit?: number;
}> = ({ className = '', limit }) => {
  const business = useBusiness();

  if (!business?.popularBrands) return null;

  const brands = limit ? business.popularBrands.slice(0, limit) : business.popularBrands;

  // شعارات الماركات
  const brandLogos: { [key: string]: string } = {
    تويوتا: '/images/car-brands/toyota.svg',
    نيسان: '/images/car-brands/nissan.svg',
    هيونداي: '/images/car-brands/default.svg',
    كيا: '/images/car-brands/default.svg',
    'فولكس واجن': '/images/car-brands/volkswagen.svg',
    بيجو: '/images/car-brands/default.svg',
    رينو: '/images/car-brands/default.svg',
    شيفروليه: '/images/car-brands/chevrolet.svg',
    فورد: '/images/car-brands/ford.svg',
    مازda: '/images/car-brands/default.svg',
  };

  return (
    <div className={`popular-brands ${className}`}>
      <div className="mb-8 text-center">
        <h3 className="mb-3 text-2xl font-bold text-gray-900">الماركات الشائعة</h3>
        <p className="text-gray-600">تصفح أشهر الماركات المتوفرة في السوق</p>
      </div>
      <div className="grid grid-cols-2 gap-6 md:grid-cols-5">
        {brands.map((brand, index) => (
          <div
            key={index}
            className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm transition-all duration-300 hover:border-blue-300 hover:shadow-lg"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gray-100">
              <img
                src={brandLogos[brand] || '/images/car-brands/default.svg'}
                alt={brand}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                onError={(e) => {
                  e.currentTarget.src =
                    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMzIiIGZpbGw9IiNGM0Y0RjYiLz4KPHN2ZyB4PSIxNiIgeT0iMTYiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMS41Ij4KPHA+PHBhdGggZD0iTTMgN3YxMGE0IDQgMCAwIDAgNCA0aDEwYTQgNCAwIDAgMCA0LTRWN2E0IDQgMCAwIDAtNC00SDdhNCA0IDAgMCAwLTQgNFoiLz4KPHBhdGggZD0ibTkgOSA2IDYiLz4KPHA+PHBhdGggZD0ibTE1IDkgLTYgNiIvPgo8L3N2Zz4KPC9zdmc+';
                }}
              />
            </div>
            <h4 className="font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
              {brand}
            </h4>
            <p className="mt-1 text-xs text-gray-500">عرض السيارات</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// مكون الوكلاء المحليين
export const LocalDealers: React.FC<{ className?: string }> = ({ className = '' }) => {
  const business = useBusiness();

  if (!business?.localDealers) return null;

  return (
    <div className={`local-dealers ${className}`}>
      <h3 className="mb-2 font-semibold text-gray-900">الوكلاء المحليون</h3>
      <div className="space-y-1">
        {business.localDealers.map((dealer, index) => (
          <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
            <BuildingOfficeIcon className="h-4 w-4 text-blue-600" />
            <span>{dealer}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// مكون خيارات التمويل
export const FinancingOptions: React.FC<{ className?: string }> = ({ className = '' }) => {
  const business = useBusiness();

  if (!business?.financingOptions) return null;

  return (
    <div className={`financing-options ${className}`}>
      <h3 className="mb-2 font-semibold text-gray-900">خيارات التمويل</h3>
      <div className="space-y-1">
        {business.financingOptions.map((option, index) => (
          <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
            <CreditCardIcon className="h-4 w-4 text-green-600" />
            <span>{option}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// مكون مراكز الفحص
export const InspectionCenters: React.FC<{ className?: string }> = ({ className = '' }) => {
  const business = useBusiness();

  if (!business?.inspectionCenters) return null;

  return (
    <div className={`inspection-centers ${className}`}>
      <h3 className="mb-2 font-semibold text-gray-900">مراكز الفحص الفني</h3>
      <div className="space-y-1">
        {business.inspectionCenters.map((center, index) => (
          <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
            <WrenchScrewdriverIcon className="h-4 w-4 text-orange-600" />
            <span>{center}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// مكون شامل لمعلومات البلد
export const CountryInfoPanel: React.FC<{ className?: string }> = ({ className = '' }) => {
  const country = useCurrentCountry();

  if (!country) return null;

  return (
    <div className={`country-info-panel rounded-lg bg-gray-50 p-4 ${className}`}>
      <div className="mb-4 flex items-center gap-3">
        <span className="text-2xl">{country.flag}</span>
        <div>
          <h2 className="text-lg font-bold text-gray-900">{country.name}</h2>
          <p className="text-sm text-gray-600">
            العملة: {(country as any)?.currencyName || country.currency}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ContactInfo />
        <PaymentMethods />
        <ShippingInfo />
        <PopularBrands limit={5} />
        <FinancingOptions />
        <InspectionCenters />
      </div>
    </div>
  );
};

// مكون مبسط لمعلومات البلد في الفوتر
export const CountryFooterInfo: React.FC<{ className?: string }> = ({ className = '' }) => {
  const country = useCurrentCountry();
  const content = useContent();

  if (!country || !content) return null;

  return (
    <div className={`country-footer-info ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>{country.flag}</span>
          <span className="text-sm font-medium">{country.name}</span>
        </div>
        <div className="text-sm text-gray-600">{content.contactInfo.phone}</div>
      </div>
    </div>
  );
};

const LocalizedContentComponents = {
  WelcomeMessage,
  ContactInfo,
  PaymentMethods,
  ShippingInfo,
  PopularBrands,
  LocalDealers,
  FinancingOptions,
  InspectionCenters,
  CountryInfoPanel,
  CountryFooterInfo,
};

export default LocalizedContentComponents;
