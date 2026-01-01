import {
  BuildingOfficeIcon,
  BuildingStorefrontIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  HeartIcon,
  InformationCircleIcon,
  MapPinIcon,
  PhoneIcon,
  QuestionMarkCircleIcon,
  ScaleIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  SparklesIcon,
  TruckIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import React from 'react';
import { useSiteSections } from '../../../contexts/SiteSectionsContext';

// خريطة الأيقونات للأقسام الديناميكية
const sectionIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ScaleIcon,
  ShoppingBagIcon,
  MapPinIcon,
  BuildingStorefrontIcon,
  TruckIcon,
  BuildingOfficeIcon,
  SparklesIcon,
};

interface AdvancedFooterProps {
  className?: string;
}

const AdvancedFooter: React.FC<AdvancedFooterProps> = ({ className = '' }) => {
  const currentYear = new Date().getFullYear();
  const { getFooterSections, getSectionStatus } = useSiteSections();

  // جلب الأقسام الديناميكية للفوتر
  const footerSections = getFooterSections();

  const socialLinks = [
    {
      name: 'فيسبوك',
      url: 'https://facebook.com/sooqmazad',
      icon: (
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      name: 'واتساب',
      url: 'https://wa.me/218910000000',
      icon: (
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.56-.01-.188 0-.495.074-.754.372-.26.297-.99.968-.99 2.36 0 1.393.99 2.737 1.128 2.925.139.188 1.943 2.967 4.708 4.161.658.284 1.172.453 1.573.579.66.21 1.261.18 1.737.109.53-.079 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.484 3.488" />
        </svg>
      ),
    },
    {
      name: 'تليجرام',
      url: 'https://t.me/sooqmazad',
      icon: (
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      ),
    },
    {
      name: 'إنستجرام',
      url: 'https://instagram.com/sooqmazad',
      icon: (
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.017 0C8.396 0 7.989.013 7.041.048 6.094.082 5.52.204 5.02.43a5.105 5.105 0 00-1.84 1.196A5.105 5.105 0 001.984 3.466c-.226.5-.348 1.074-.382 2.021C1.567 6.435 1.554 6.842 1.554 10.462s.013 4.028.048 4.975c.034.947.156 1.521.382 2.021a5.105 5.105 0 001.196 1.84 5.105 5.105 0 001.84 1.196c.5.226 1.074.348 2.021.382.947.035 1.354.048 4.975.048s4.028-.013 4.975-.048c.947-.034 1.521-.156 2.021-.382a5.105 5.105 0 001.84-1.196 5.105 5.105 0 001.196-1.84c.226-.5.348-1.074.382-2.021.035-.947.048-1.354.048-4.975s-.013-4.028-.048-4.975c-.034-.947-.156-1.521-.382-2.021a5.105 5.105 0 00-1.196-1.84A5.105 5.105 0 0016.534 1.984c-.5-.226-1.074-.348-2.021-.382C13.566.013 13.159 0 12.017 0zm0 2.17c3.4 0 3.795.013 5.126.066.895.04 1.38.187 1.703.311.428.166.732.366 1.053.687.321.321.521.625.687 1.053.124.323.271.808.311 1.703.053 1.331.066 1.726.066 5.126s-.013 3.795-.066 5.126c-.04.895-.187 1.38-.311 1.703a2.936 2.936 0 01-.687 1.053 2.936 2.936 0 01-1.053.687c-.323.124-.808.271-1.703.311-1.331.053-1.726.066-5.126.066s-3.795-.013-5.126-.066c-.895-.04-1.38-.187-1.703-.311a2.936 2.936 0 01-1.053-.687 2.936 2.936 0 01-.687-1.053c-.124-.323-.271-.808-.311-1.703-.053-1.331-.066-1.726-.066-5.126s.013-3.795.066-5.126c.04-.895.187-1.38.311-1.703.166-.428.366-.732.687-1.053a2.936 2.936 0 011.053-.687c.323-.124.808-.271 1.703-.311 1.331-.053 1.726-.066 5.126-.066z" />
          <circle cx="12.017" cy="10.462" r="3.291" />
          <circle cx="15.717" cy="6.762" r="0.769" />
        </svg>
      ),
    },
  ];

  // الروابط الثابتة (المفضلة، الرسائل، إلخ)
  const staticQuickLinks = [
    { name: 'المفضلة', href: '/favorites', icon: <HeartIcon className="h-4 w-4" /> },
    { name: 'الرسائل', href: '/messages', icon: <ChatBubbleLeftRightIcon className="h-4 w-4" /> },
    { name: 'ترويج الإعلانات', href: '/promotions', icon: <SparklesIcon className="h-4 w-4" /> },
    { name: 'حسابي', href: '/my-account', icon: <UserIcon className="h-4 w-4" /> },
  ];

  const supportLinks = [
    { name: 'مركز المساعدة', href: '/help', icon: <QuestionMarkCircleIcon className="h-4 w-4" /> },
    { name: 'تواصل معنا', href: '/contact', icon: <EnvelopeIcon className="h-4 w-4" /> },
    { name: 'الشروط والأحكام', href: '/terms', icon: <DocumentTextIcon className="h-4 w-4" /> },
    { name: 'سياسة الخصوصية', href: '/privacy', icon: <ShieldCheckIcon className="h-4 w-4" /> },
    { name: 'معلومات عنا', href: '/about', icon: <InformationCircleIcon className="h-4 w-4" /> },
  ];

  return (
    <footer className={`bg-gradient-to-br from-gray-900 to-gray-800 text-white ${className}`}>
      {/* القسم الرئيسي */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* معلومات الشركة */}
          <div className="space-y-6">
            <div>
              <h3 className="mb-4 text-2xl font-bold text-white">سوق مزاد</h3>
              <p className="leading-relaxed text-gray-300">
                أكبر منصة لبيع وشراء السيارات في ليبيا. نوفر خدمات المزادات والسوق الفوري مع ضمان
                الأمان والشفافية.
              </p>
            </div>

            {/* معلومات التواصل */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-300">
                <MapPinIcon className="h-5 w-5 text-blue-400" />
                <span>طرابلس، ليبيا</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <PhoneIcon className="h-5 w-5 text-blue-400" />
                <a href="tel:+218910000000" className="transition-colors hover:text-white">
                  +218 91 000 0000
                </a>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <EnvelopeIcon className="h-5 w-5 text-blue-400" />
                <a href="mailto:info@sooqmazad.ly" className="transition-colors hover:text-white">
                  info@sooqmazad.ly
                </a>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <ClockIcon className="h-5 w-5 text-blue-400" />
                <span>متاح 24/7</span>
              </div>
            </div>
          </div>

          {/* الروابط السريعة */}
          <div>
            <h4 className="mb-6 text-lg font-semibold text-white">الروابط السريعة</h4>
            <ul className="space-y-4">
              {/* الأقسام الديناميكية */}
              {footerSections.map((section) => {
                const status = getSectionStatus(section.slug);
                if (status === 'DISABLED') return null;

                const IconComponent = sectionIconMap[section.icon || ''];

                return (
                  <li key={section.id}>
                    <Link
                      href={section.pageUrl}
                      className={`group flex items-center gap-3 text-gray-300 transition-colors hover:text-white ${
                        status !== 'ACTIVE' ? 'opacity-60' : ''
                      }`}
                    >
                      <span className="text-blue-400 transition-colors group-hover:text-blue-300">
                        {IconComponent ? (
                          <IconComponent className="h-4 w-4" />
                        ) : (
                          <CurrencyDollarIcon className="h-4 w-4" />
                        )}
                      </span>
                      {section.name}
                      {status === 'COMING_SOON' && (
                        <span className="text-xs text-blue-400">(قريباً)</span>
                      )}
                    </Link>
                  </li>
                );
              })}

              {/* فاصل */}
              <li className="border-t border-gray-700 pt-2"></li>

              {/* الروابط الثابتة */}
              {staticQuickLinks.map((link, index) => (
                <li key={`static-${index}`}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-3 text-gray-300 transition-colors hover:text-white"
                  >
                    <span className="text-blue-400 transition-colors group-hover:text-blue-300">
                      {link.icon}
                    </span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* الدعم والمساعدة */}
          <div>
            <h4 className="mb-6 text-lg font-semibold text-white">الدعم والمساعدة</h4>
            <ul className="space-y-4">
              {supportLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-3 text-gray-300 transition-colors hover:text-white"
                  >
                    <span className="text-green-400 transition-colors group-hover:text-green-300">
                      {link.icon}
                    </span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* التطبيقات ووسائل التواصل */}
          <div>
            <h4 className="mb-6 text-lg font-semibold text-white">حمل التطبيق</h4>

            {/* أزرار متاجر التطبيقات */}
            <div className="mb-8 space-y-4">
              <a
                href="https://apps.apple.com/app/sooq-mazad"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div className="flex items-center gap-3 rounded-xl bg-black p-3 transition-colors hover:bg-gray-800">
                  <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  <div>
                    <div className="text-xs text-gray-300">متاح على</div>
                    <div className="font-semibold">App Store</div>
                  </div>
                </div>
              </a>

              <a
                href="https://play.google.com/store/apps/details?id=ly.sooqmazad"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div className="flex items-center gap-3 rounded-xl bg-green-600 p-3 transition-colors hover:bg-green-700">
                  <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                  </svg>
                  <div>
                    <div className="text-xs text-green-100">متاح على</div>
                    <div className="font-semibold">Google Play</div>
                  </div>
                </div>
              </a>
            </div>

            {/* وسائل التواصل الاجتماعي */}
            <div>
              <h5 className="mb-4 text-sm font-semibold text-gray-300">تابعنا على</h5>
              <div className="flex gap-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    className="flex h-10 w-10 transform items-center justify-center rounded-full bg-gray-700 text-gray-300 transition-all hover:scale-110 hover:bg-blue-600 hover:text-white"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* الشريط السفلي */}
      <div className="border-t border-gray-700 bg-gray-900 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2 text-gray-400">
              <MapPinIcon className="h-4 w-4 text-blue-400" />
              <span className="text-sm">ليبيا</span>
            </div>

            <div className="text-center text-sm text-gray-400">
              © {currentYear} سوق مزاد. جميع الحقوق محفوظة.
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>نسخة 2.0</span>
              <span>•</span>
              <span>محدث</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AdvancedFooter;
