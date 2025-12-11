import React from 'react';
import Link from 'next/link';
import BuildingLibraryIcon from '@heroicons/react/24/outline/BuildingLibraryIcon';
import PlusIcon from '@heroicons/react/24/outline/PlusIcon';
import ArrowRightIcon from '@heroicons/react/24/outline/ArrowRightIcon';
import BankCard from '../features/wallet/deposit/BankCard';

// بيانات البنوك الليبية
const libyanBanks = [
  'مصرف الجمهورية',
  'مصرف الأمان',
  'مصرف الوحدة',
  'المصرف الإسلامي الليبي',
  'مصرف التجاري الوطني',
  'المصرف التضامن',
  'مصرف الخليج الأول',
  'مصرف الواحة',
  'مصرف الأندلس',
  'مصرف الإستثمار العربي الإسلامي',
  'مصرف الاتحاد الوطني',
  'مصرف التجارة والتنمية',
  'مصرف السراي',
  'مصرف الصحارى',
  'مصرف المتحد',
  'مصرف المتوسط',
  'مصرف النوران',
  'مصرف الوفاء',
  'مصرف اليقين',
  'مصرف شمال أفريقيا',
  'مصرف التنمية',
];

// تصميم موحد باللون الأزرق لجميع البنوك
const bankData: Record<
  string,
  {
    color: string;
    bgColor: string;
    description?: string;
    type?: string;
    established?: string;
    services?: string[];
  }
> = {
  'مصرف الجمهورية': {
    color: 'text-white',
    bgColor: 'bg-blue-700 border-blue-800',
    description: 'البنك المركزي الرئيسي في ليبيا',
    type: 'بنك مركزي',
    established: '1956',
    services: ['خدمات مصرفية شاملة', 'تحويلات دولية', 'حسابات توفير'],
  },
  'مصرف الأمان': {
    color: 'text-white',
    bgColor: 'bg-blue-700 border-blue-800',
    description: 'خدمات مصرفية آمنة ومتطورة',
    type: 'بنك تجاري',
    established: '2010',
    services: ['خدمات رقمية', 'قروض شخصية', 'بطاقات ائتمان'],
  },
  'مصرف الوحدة': {
    color: 'text-white',
    bgColor: 'bg-blue-700 border-blue-800',
    description: 'بنك تجاري رائد في ليبيا',
    type: 'بنك تجاري',
    established: '1970',
    services: ['خدمات الشركات', 'تمويل المشاريع', 'حسابات جارية'],
  },
  'المصرف الإسلامي الليبي': {
    color: 'text-white',
    bgColor: 'bg-blue-700 border-blue-800',
    description: 'خدمات مصرفية إسلامية متوافقة مع الشريعة',
    type: 'بنك إسلامي',
    established: '2007',
    services: ['تمويل إسلامي', 'مرابحة', 'مشاركة'],
  },
  'مصرف التجاري الوطني': {
    color: 'text-white',
    bgColor: 'bg-blue-700 border-blue-800',
    description: 'بنك تجاري وطني بخدمات شاملة',
    type: 'بنك تجاري',
    established: '1964',
    services: ['خدمات تجارية', 'تمويل التجارة', 'اعتمادات مستندية'],
  },
  'المصرف التضامن': {
    color: 'text-white',
    bgColor: 'bg-blue-700 border-blue-800',
    description: 'بنك التضامن الاجتماعي',
    type: 'بنك اجتماعي',
    established: '2011',
    services: ['قروض اجتماعية', 'تمويل المشاريع الصغيرة', 'حسابات توفير'],
  },
  'مصرف الخليج الأول': {
    color: 'text-white',
    bgColor: 'bg-blue-700 border-blue-800',
    description: 'خدمات مصرفية متميزة',
    type: 'بنك تجاري',
    established: '2009',
    services: ['خدمات استثمارية', 'إدارة الثروات', 'خدمات خاصة'],
  },
  'مصرف الواحة': {
    color: 'text-white',
    bgColor: 'bg-blue-700 border-blue-800',
    description: 'بنك الواحة للخدمات المصرفية',
    type: 'بنك تجاري',
    established: '2009',
    services: ['خدمات نفطية', 'تمويل الطاقة', 'خدمات صناعية'],
  },
  'مصرف الأندلس': {
    color: 'text-white',
    bgColor: 'bg-blue-700 border-blue-800',
    description: 'خدمات مصرفية عصرية',
    type: 'بنك تجاري',
    established: '2012',
    services: ['خدمات رقمية متقدمة', 'بنكنة إلكترونية', 'تطبيقات ذكية'],
  },
  'مصرف الإستثمار العربي الإسلامي': {
    color: 'text-white',
    bgColor: 'bg-blue-700 border-blue-800',
    description: 'بنك استثماري إسلامي',
    type: 'بنك استثماري إسلامي',
    established: '2008',
    services: ['استثمار إسلامي', 'صناديق استثمار', 'تمويل المشاريع'],
  },
  'مصرف الاتحاد الوطني': {
    color: 'text-white',
    bgColor: 'bg-blue-700 border-blue-800',
    description: 'بنك الاتحاد الوطني',
    type: 'بنك تجاري',
    established: '2013',
    services: ['خدمات وطنية', 'دعم الاقتصاد المحلي', 'تمويل المشاريع الوطنية'],
  },
  'مصرف التجارة والتنمية': {
    color: 'text-white',
    bgColor: 'bg-blue-700 border-blue-800',
    description: 'بنك التجارة والتنمية',
    type: 'بنك تنموي',
    established: '2014',
    services: ['تمويل التنمية', 'دعم المشاريع', 'قروض تنموية'],
  },
  'مصرف السراي': {
    color: 'text-white',
    bgColor: 'bg-blue-700 border-blue-800',
    description: 'مصرف السراي للخدمات المصرفية',
    type: 'بنك تجاري',
    established: '2015',
    services: ['خدمات مصرفية شاملة', 'حسابات شخصية', 'خدمات الشركات'],
  },
  'مصرف الصحارى': {
    color: 'text-white',
    bgColor: 'bg-blue-700 border-blue-800',
    description: 'بنك الصحارى',
    type: 'بنك إقليمي',
    established: '2016',
    services: ['خدمات إقليمية', 'تمويل المناطق النائية', 'خدمات محلية'],
  },
  'مصرف المتحد': {
    color: 'text-white',
    bgColor: 'bg-blue-700 border-blue-800',
    description: 'المصرف المتحد',
    type: 'بنك تجاري',
    established: '2017',
    services: ['خدمات متحدة', 'شراكات مصرفية', 'حلول متكاملة'],
  },
  'مصرف المتوسط': {
    color: 'text-white',
    bgColor: 'bg-blue-700 border-blue-800',
    description: 'بنك البحر المتوسط',
    type: 'بنك دولي',
    established: '2018',
    services: ['خدمات دولية', 'تحويلات عالمية', 'تجارة خارجية'],
  },
  'مصرف النوران': {
    color: 'text-white',
    bgColor: 'bg-blue-700 border-blue-800',
    description: 'مصرف النوران الإسلامي',
    type: 'بنك إسلامي',
    established: '2011',
    services: ['خدمات إسلامية', 'تمويل شرعي', 'استثمار حلال'],
  },
  'مصرف الوفاء': {
    color: 'text-white',
    bgColor: 'bg-blue-700 border-blue-800',
    description: 'مصرف الوفاء الإسلامي',
    type: 'بنك إسلامي',
    established: '2012',
    services: ['خدمات إسلامية متقدمة', 'تمويل المساكن', 'حسابات إسلامية'],
  },
  'مصرف اليقين': {
    color: 'text-white',
    bgColor: 'bg-blue-700 border-blue-800',
    description: 'مصرف اليقين',
    type: 'بنك تجاري',
    established: '2019',
    services: ['خدمات موثوقة', 'أمان مصرفي', 'حلول مبتكرة'],
  },
  'مصرف شمال أفريقيا': {
    color: 'text-white',
    bgColor: 'bg-blue-700 border-blue-800',
    description: 'بنك شمال أفريقيا',
    type: 'بنك إقليمي',
    established: '2014',
    services: ['خدمات أفريقية', 'تجارة إقليمية', 'شراكات دولية'],
  },
  'مصرف التنمية': {
    color: 'text-white',
    bgColor: 'bg-blue-700 border-blue-800',
    description: 'مصرف التنمية',
    type: 'بنك تنموي',
    established: '2020',
    services: ['تمويل التنمية المستدامة', 'مشاريع البنية التحتية', 'دعم الاقتصاد'],
  },
};

interface AvailableBanksProps {
  linkedAccounts?: string[]; // أسماء البنوك المرتبطة
  showTitle?: boolean;
}

const AvailableBanks: React.FC<AvailableBanksProps> = ({
  linkedAccounts = [],
  showTitle = true,
}) => {
  // تصفية البنوك غير المرتبطة
  const availableBanks = libyanBanks.filter((bank) => !linkedAccounts.includes(bank));

  return (
    <div className="space-y-4">
      {/* عنوان القسم */}
      {showTitle && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BuildingLibraryIcon className="h-6 w-6 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">البنوك المتاحة للربط</h3>
          </div>
          <button
            onClick={() => (window.location.href = '/wallet/link-bank-account')}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4" />
            <span>ربط حساب جديد</span>
          </button>
        </div>
      )}

      {/* قائمة البنوك */}
      {availableBanks.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center shadow-sm">
          <BuildingLibraryIcon className="mx-auto mb-4 h-16 w-16 text-gray-300" />
          <h4 className="mb-2 text-lg font-medium text-gray-900">جميع البنوك مرتبطة</h4>
          <p className="text-gray-600">تم ربط جميع البنوك المتاحة مع حسابك</p>
        </div>
      ) : (
        <div className="bank-list-container">
          {availableBanks.map((bankName) => {
            const bankInfo = bankData[bankName] || {
              color: 'text-white',
              bgColor: 'bg-blue-700 border-blue-800',
              description: 'خدمات مصرفية',
              type: 'بنك تجاري',
              established: '2020',
              services: ['خدمات مصرفية'],
            };

            return (
              <div
                key={bankName}
                className="bank-list-item group cursor-pointer"
                onClick={() => {
                  window.location.href = `/wallet/link-bank-account?bank=${encodeURIComponent(bankName)}`;
                }}
              >
                <div className="bank-content-layout">
                  {/* الشعار */}
                  <div className="bank-logo-section">
                    <BankCard bankName={bankName} bankInfo={bankInfo} size="small" asLink={false} />
                  </div>

                  {/* معلومات البنك */}
                  <div className="bank-info-section">
                    <div className="flex items-start justify-between">
                      <div className="flex-grow">
                        {/* اسم البنك */}
                        <h3 className="bank-name-title">{bankName}</h3>

                        {/* نوع البنك وسنة التأسيس */}
                        <div className="bank-meta-info">
                          <span className="bank-type-badge">{bankInfo.type}</span>
                          <span className="bank-established-year">
                            تأسس عام {bankInfo.established}
                          </span>
                        </div>

                        {/* وصف البنك */}
                        <p className="bank-description">{bankInfo.description}</p>

                        {/* الخدمات */}
                        {bankInfo.services && bankInfo.services.length > 0 && (
                          <div className="bank-services-list">
                            {bankInfo.services.slice(0, 3).map((service, index) => (
                              <span key={index} className="bank-service-tag">
                                {service}
                              </span>
                            ))}
                            {bankInfo.services.length > 3 && (
                              <span className="bank-service-tag">
                                +{bankInfo.services.length - 3} خدمة أخرى
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* زر الربط */}
                      <div className="bank-link-button-section">
                        <div className="bank-link-button">
                          <span>ربط الحساب</span>
                          <ArrowRightIcon className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* رسالة إضافية */}
      {availableBanks.length > 0 && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <BuildingLibraryIcon className="mt-0.5 h-5 w-5 text-blue-600" />
            <div>
              <h4 className="mb-1 font-medium text-blue-900">معلومات مهمة</h4>
              <p className="text-sm text-blue-700">
                عند ربط حسابك البنكي، سيتم إرسال رمز تحقق إلى رقم هاتفك المسجل للتأكد من ملكية
                الحساب.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailableBanks;
