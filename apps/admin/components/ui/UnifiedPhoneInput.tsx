/**
 * مكون إدخال رقم الهاتف الموحد - نسخة لوحة التحكم
 * UnifiedPhoneInput - المكون الرسمي والوحيد لإدخال أرقام الهواتف
 * يستخدم في جميع أنحاء المشروع (web + admin)
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// ============================================
// قائمة الدول العربية مع SVG الأعلام
// ============================================

export interface Country {
  code: string; // رمز الاتصال (مثل +218)
  name: string; // الاسم بالعربية
  nameEn: string; // الاسم بالإنجليزية
  countryCode: string; // رمز الدولة ISO (مثل LY)
  flag: string; // SVG العلم
}

// SVG أعلام الدول
const flagSVGs: Record<string, string> = {
  LY: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="200" fill="#E70013"/>
    <rect y="200" width="900" height="200" fill="#000"/>
    <rect y="400" width="900" height="200" fill="#239E46"/>
    <g transform="translate(450,300)">
      <circle r="60" fill="none" stroke="#fff" stroke-width="8"/>
      <path d="M-20,-40 L20,-40 L20,40 L-20,40 Z" fill="#fff"/>
      <circle r="15" fill="#fff" transform="translate(0,-15)"/>
    </g>
  </svg>`,
  EG: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="200" fill="#CE1126"/>
    <rect y="200" width="900" height="200" fill="#fff"/>
    <rect y="400" width="900" height="200" fill="#000"/>
    <g transform="translate(450,300)" fill="#C8AA6E">
      <circle r="50"/>
    </g>
  </svg>`,
  SA: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="600" fill="#006C35"/>
    <g transform="translate(450,300)" fill="#fff">
      <rect x="-100" y="-30" width="200" height="60" rx="5"/>
    </g>
  </svg>`,
  AE: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="200" fill="#00732F"/>
    <rect y="200" width="900" height="200" fill="#fff"/>
    <rect y="400" width="900" height="200" fill="#000"/>
    <rect width="300" height="600" fill="#FF0000"/>
  </svg>`,
  QA: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="600" fill="#8D1B3D"/>
    <polygon points="300,0 900,0 900,600 300,600 450,550 300,500 450,450 300,400 450,350 300,300 450,250 300,200 450,150 300,100 450,50" fill="#fff"/>
  </svg>`,
  KW: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="200" fill="#007A3D"/>
    <rect y="200" width="900" height="200" fill="#fff"/>
    <rect y="400" width="900" height="200" fill="#CE1126"/>
    <polygon points="0,0 0,600 300,400 300,200" fill="#000"/>
  </svg>`,
  BH: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="600" fill="#CE1126"/>
    <polygon points="300,0 900,0 900,600 300,600 400,550 300,500 400,450 300,400 400,350 300,300 400,250 300,200 400,150 300,100 400,50" fill="#fff"/>
  </svg>`,
  OM: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="200" fill="#fff"/>
    <rect y="200" width="900" height="200" fill="#CE1126"/>
    <rect y="400" width="900" height="200" fill="#009639"/>
    <rect width="300" height="600" fill="#CE1126"/>
  </svg>`,
  JO: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="200" fill="#000"/>
    <rect y="200" width="900" height="200" fill="#fff"/>
    <rect y="400" width="900" height="200" fill="#007A3D"/>
    <polygon points="0,0 0,600 400,300" fill="#CE1126"/>
  </svg>`,
  LB: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="150" fill="#ED1C24"/>
    <rect y="150" width="900" height="300" fill="#fff"/>
    <rect y="450" width="900" height="150" fill="#ED1C24"/>
    <g transform="translate(450,300)" fill="#00A651">
      <path d="M0,-60 L-20,-20 L-40,-30 L-25,0 L-40,30 L-20,20 L0,60 L20,20 L40,30 L25,0 L40,-30 L20,-20 Z"/>
    </g>
  </svg>`,
  SY: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="200" fill="#CE1126"/>
    <rect y="200" width="900" height="200" fill="#fff"/>
    <rect y="400" width="900" height="200" fill="#000"/>
    <g fill="#007A3D">
      <polygon points="350,300 365,270 395,270 380,290 385,320 350,300 315,320 320,290 305,270 335,270" />
      <polygon points="550,300 565,270 595,270 580,290 585,320 550,300 515,320 520,290 505,270 535,270" />
    </g>
  </svg>`,
  IQ: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="200" fill="#CE1126"/>
    <rect y="200" width="900" height="200" fill="#fff"/>
    <rect y="400" width="900" height="200" fill="#000"/>
  </svg>`,
  MA: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="600" fill="#C1272D"/>
    <g transform="translate(450,300)" fill="none" stroke="#006233" stroke-width="12">
      <polygon points="0,-80 23,-25 76,-25 38,8 49,61 0,28 -49,61 -38,8 -76,-25 -23,-25"/>
    </g>
  </svg>`,
  DZ: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="450" height="600" fill="#006233"/>
    <rect x="450" width="450" height="600" fill="#fff"/>
    <g transform="translate(450,300)" fill="#D21034">
      <circle r="70"/>
      <circle r="55" fill="#fff"/>
      <polygon points="60,0 20,-12 20,12"/>
    </g>
  </svg>`,
  TN: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="600" fill="#E70013"/>
    <circle cx="450" cy="300" r="120" fill="#fff"/>
    <g transform="translate(450,300)" fill="#E70013">
      <circle r="80"/>
      <circle r="65" fill="#fff"/>
      <polygon points="70,0 25,-12 25,12"/>
    </g>
  </svg>`,
  SD: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="200" fill="#CE1126"/>
    <rect y="200" width="900" height="200" fill="#fff"/>
    <rect y="400" width="900" height="200" fill="#000"/>
    <polygon points="0,0 0,600 300,300" fill="#007A3D"/>
  </svg>`,
  YE: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="200" fill="#CE1126"/>
    <rect y="200" width="900" height="200" fill="#fff"/>
    <rect y="400" width="900" height="200" fill="#000"/>
  </svg>`,
  PS: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="200" fill="#000"/>
    <rect y="200" width="900" height="200" fill="#fff"/>
    <rect y="400" width="900" height="200" fill="#007A3D"/>
    <polygon points="0,0 0,600 400,300" fill="#CE1126"/>
  </svg>`,
  MR: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="600" fill="#00A651"/>
    <g transform="translate(450,250)" fill="#FFD700">
      <circle r="50" fill="none" stroke="#FFD700" stroke-width="8"/>
      <polygon points="0,-30 8,-9 26,-9 13,3 17,21 0,12 -17,21 -13,3 -26,-9 -8,-9"/>
    </g>
  </svg>`,
  SO: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="600" fill="#4189DD"/>
    <g transform="translate(450,300)" fill="#fff">
      <polygon points="0,-80 23,-25 76,-25 38,8 49,61 0,28 -49,61 -38,8 -76,-25 -23,-25"/>
    </g>
  </svg>`,
  DJ: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="300" fill="#6AB2DD"/>
    <rect y="300" width="900" height="300" fill="#12AD2B"/>
    <polygon points="0,0 0,600 350,300" fill="#fff"/>
    <g transform="translate(150,300)" fill="#D7141A">
      <polygon points="0,-30 8,-9 26,-9 13,3 17,21 0,12 -17,21 -13,3 -26,-9 -8,-9"/>
    </g>
  </svg>`,
  KM: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="150" fill="#FFD100"/>
    <rect y="150" width="900" height="150" fill="#fff"/>
    <rect y="300" width="900" height="150" fill="#CE1126"/>
    <rect y="450" width="900" height="150" fill="#3D5AA1"/>
    <polygon points="0,0 0,600 350,300" fill="#239E46"/>
  </svg>`,
};

// قائمة الدول العربية
export const arabCountries: Country[] = [
  { code: '+218', name: 'ليبيا', nameEn: 'Libya', countryCode: 'LY', flag: flagSVGs.LY },
  { code: '+20', name: 'مصر', nameEn: 'Egypt', countryCode: 'EG', flag: flagSVGs.EG },
  { code: '+966', name: 'السعودية', nameEn: 'Saudi Arabia', countryCode: 'SA', flag: flagSVGs.SA },
  { code: '+971', name: 'الإمارات', nameEn: 'UAE', countryCode: 'AE', flag: flagSVGs.AE },
  { code: '+974', name: 'قطر', nameEn: 'Qatar', countryCode: 'QA', flag: flagSVGs.QA },
  { code: '+965', name: 'الكويت', nameEn: 'Kuwait', countryCode: 'KW', flag: flagSVGs.KW },
  { code: '+973', name: 'البحرين', nameEn: 'Bahrain', countryCode: 'BH', flag: flagSVGs.BH },
  { code: '+968', name: 'عُمان', nameEn: 'Oman', countryCode: 'OM', flag: flagSVGs.OM },
  { code: '+962', name: 'الأردن', nameEn: 'Jordan', countryCode: 'JO', flag: flagSVGs.JO },
  { code: '+961', name: 'لبنان', nameEn: 'Lebanon', countryCode: 'LB', flag: flagSVGs.LB },
  { code: '+963', name: 'سوريا', nameEn: 'Syria', countryCode: 'SY', flag: flagSVGs.SY },
  { code: '+964', name: 'العراق', nameEn: 'Iraq', countryCode: 'IQ', flag: flagSVGs.IQ },
  { code: '+212', name: 'المغرب', nameEn: 'Morocco', countryCode: 'MA', flag: flagSVGs.MA },
  { code: '+213', name: 'الجزائر', nameEn: 'Algeria', countryCode: 'DZ', flag: flagSVGs.DZ },
  { code: '+216', name: 'تونس', nameEn: 'Tunisia', countryCode: 'TN', flag: flagSVGs.TN },
  { code: '+249', name: 'السودان', nameEn: 'Sudan', countryCode: 'SD', flag: flagSVGs.SD },
  { code: '+967', name: 'اليمن', nameEn: 'Yemen', countryCode: 'YE', flag: flagSVGs.YE },
  { code: '+970', name: 'فلسطين', nameEn: 'Palestine', countryCode: 'PS', flag: flagSVGs.PS },
  { code: '+222', name: 'موريتانيا', nameEn: 'Mauritania', countryCode: 'MR', flag: flagSVGs.MR },
  { code: '+252', name: 'الصومال', nameEn: 'Somalia', countryCode: 'SO', flag: flagSVGs.SO },
  { code: '+253', name: 'جيبوتي', nameEn: 'Djibouti', countryCode: 'DJ', flag: flagSVGs.DJ },
  { code: '+269', name: 'جزر القمر', nameEn: 'Comoros', countryCode: 'KM', flag: flagSVGs.KM },
];

// ============================================
// أيقونات SVG مضمنة
// ============================================

const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
);

const MagnifyingGlassIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
    />
  </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
);

// ============================================
// مكون العلم
// ============================================

interface FlagProps {
  svg: string;
  name: string;
  className?: string;
}

const Flag: React.FC<FlagProps> = ({ svg, name, className = '' }) => (
  <div
    className={`inline-block h-3 w-4 overflow-hidden rounded-sm border border-gray-200 ${className}`}
    title={name}
  >
    <div className="h-full w-full" dangerouslySetInnerHTML={{ __html: svg }} />
  </div>
);

// ============================================
// واجهة Props للمكون
// ============================================

export interface UnifiedPhoneInputProps {
  /** قيمة رقم الهاتف (بدون رمز الدولة) */
  value: string;
  /** دالة تُستدعى عند تغيير الرقم */
  onChange: (value: string) => void;
  /** دالة تُستدعى عند تغيير الدولة */
  onCountryChange?: (country: Country) => void;
  /** دالة تُستدعى عند الضغط على Enter */
  onEnterPress?: () => void;
  /** دالة تُستدعى عند تغيير الرقم الكامل (مع رمز الدولة) */
  onFullNumberChange?: (fullNumber: string) => void;
  /** نص التلميح */
  placeholder?: string;
  /** رسالة الخطأ */
  error?: string;
  /** تعطيل الحقل */
  disabled?: boolean;
  /** CSS classes إضافية */
  className?: string;
  /** عنوان الحقل */
  label?: string;
  /** حقل مطلوب */
  required?: boolean;
  /** تركيز تلقائي */
  autoFocus?: boolean;
  /** رمز الدولة الافتراضي */
  defaultCountry?: string;
  /** السمة (فاتح/داكن) */
  theme?: 'light' | 'dark';
}

// ============================================
// المكون الرئيسي
// ============================================

const UnifiedPhoneInput: React.FC<UnifiedPhoneInputProps> = ({
  value,
  onChange,
  onCountryChange,
  onEnterPress,
  onFullNumberChange,
  placeholder = 'أدخل رقم الموبايل',
  error,
  disabled = false,
  className = '',
  label,
  required = false,
  autoFocus = false,
  defaultCountry = 'LY',
  theme = 'light',
}) => {
  // الحالة الداخلية
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    () => arabCountries.find((c) => c.countryCode === defaultCountry) || arabCountries[0],
  );
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [mounted, setMounted] = useState(false);

  // المراجع
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // تأكد من التثبيت على العميل
  useEffect(() => {
    setMounted(true);
  }, []);

  // حساب موضع القائمة المنسدلة
  const updateDropdownPosition = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      // ملاحظة مهمة:
      // - القائمة تستخدم position: fixed
      // - لذلك يجب أن تكون قيم top/left نسبةً إلى نافذة العرض (viewport) فقط
      // - getBoundingClientRect يُعيد إحداثيات نسبةً للـ viewport بالفعل
      // - إضافة window.scrollY/window.scrollX هنا تجعل القائمة تظهر خارج الشاشة عند التمرير
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: Math.max(rect.width, 300),
      });
    }
  }, []);

  // تصفية الدول حسب البحث
  const filteredCountries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return arabCountries;
    return arabCountries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.nameEn.toLowerCase().includes(q) ||
        c.code.includes(q) ||
        c.countryCode.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const isInsideContainer = containerRef.current?.contains(target);
      const isInsideDropdown = dropdownRef.current?.contains(target);

      if (!isInsideContainer && !isInsideDropdown) {
        setIsOpen(false);
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // إغلاق بمفتاح Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // تركيز على حقل البحث وتحديث الموضع عند الفتح
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      updateDropdownPosition();
      setTimeout(() => searchInputRef.current?.focus(), 10);

      const handleUpdate = () => updateDropdownPosition();
      window.addEventListener('scroll', handleUpdate, true);
      window.addEventListener('resize', handleUpdate);

      return () => {
        window.removeEventListener('scroll', handleUpdate, true);
        window.removeEventListener('resize', handleUpdate);
      };
    }
  }, [isOpen, updateDropdownPosition]);

  // إعلام المكون الأب بتغيير الدولة
  useEffect(() => {
    onCountryChange?.(selectedCountry);
  }, [selectedCountry]); // eslint-disable-line react-hooks/exhaustive-deps

  // إعلام المكون الأب بتغيير الرقم الكامل
  useEffect(() => {
    if (onFullNumberChange && value) {
      onFullNumberChange(`${selectedCountry.code}${value}`);
    }
  }, [value, selectedCountry, onFullNumberChange]);

  // اختيار دولة
  const handleSelectCountry = (country: Country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // معالجة إدخال الرقم
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    // السماح بالأرقام فقط
    val = val.replace(/[^\d]/g, '');
    onChange(val);
  };

  // أنماط CSS حسب السمة
  const themeStyles = {
    light: {
      container: `bg-white border-gray-300 ${error ? 'border-red-400' : ''} focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200`,
      button: 'bg-gray-50 border-gray-300 hover:bg-gray-100',
      buttonText: 'text-gray-700',
      input: 'text-gray-900 placeholder-gray-400',
      dropdown: 'bg-white border-gray-200',
      dropdownItem: 'text-gray-700 hover:bg-gray-100',
      dropdownItemSelected: 'bg-blue-500 text-white',
      search: 'border-gray-200 focus:border-blue-500',
      label: 'text-gray-700',
      error: 'text-red-600',
    },
    dark: {
      container: `bg-slate-700 border-slate-600 ${error ? 'border-red-500' : ''} focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/30`,
      button: 'bg-slate-600/50 border-slate-600 hover:bg-slate-600',
      buttonText: 'text-white',
      input: 'text-white placeholder-slate-400',
      dropdown: 'bg-slate-800 border-slate-600',
      dropdownItem: 'text-slate-200 hover:bg-slate-700',
      dropdownItemSelected: 'bg-blue-600 text-white',
      search:
        'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500',
      label: 'text-slate-300',
      error: 'text-red-400',
    },
  };

  const styles = themeStyles[theme];

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* العنوان */}
      {label && (
        <label className={`mb-2 block text-sm font-medium ${styles.label}`}>
          {label}
          {required && <span className="mr-1 text-red-500">*</span>}
        </label>
      )}

      {/* حاوية الإدخال */}
      <div
        className={`relative flex h-12 w-full items-center rounded-xl border ${styles.container} ${
          disabled ? 'cursor-not-allowed opacity-50' : ''
        }`}
        dir="ltr"
      >
        {/* زر اختيار الدولة */}
        <button
          type="button"
          onClick={() => {
            if (!disabled) {
              updateDropdownPosition();
              setIsOpen(!isOpen);
            }
          }}
          disabled={disabled}
          className={`flex h-full min-w-[115px] items-center justify-center gap-1.5 rounded-l-xl border-r px-3 ${styles.button} ${
            disabled ? 'cursor-not-allowed' : 'cursor-pointer'
          }`}
          dir="ltr"
        >
          <Flag svg={selectedCountry.flag} name={selectedCountry.name} />
          <span className={`text-sm font-medium ${styles.buttonText}`} dir="ltr">
            {selectedCountry.code}
          </span>
          <ChevronDownIcon
            className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* حقل إدخال الرقم */}
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          autoComplete="tel"
          placeholder={placeholder}
          value={value}
          onChange={handlePhoneChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (onEnterPress) {
                onEnterPress();
              } else {
                const form = e.currentTarget.closest('form');
                form?.requestSubmit();
              }
            }
          }}
          disabled={disabled}
          autoFocus={autoFocus}
          className={`h-full flex-1 bg-transparent px-4 text-left text-base outline-none ${styles.input}`}
          dir="ltr"
        />
      </div>

      {/* رسالة الخطأ */}
      {error && <p className={`mt-1 text-sm ${styles.error}`}>{error}</p>}

      {/* القائمة المنسدلة - تستخدم Portal */}
      {mounted &&
        isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            className={`fixed overflow-hidden rounded-xl border shadow-2xl ${styles.dropdown}`}
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
              maxHeight: '320px',
              zIndex: 99999,
            }}
          >
            {/* حقل البحث */}
            <div
              className={`sticky top-0 z-10 border-b p-3 ${theme === 'dark' ? 'border-slate-700 bg-slate-800' : 'border-gray-100 bg-white'}`}
            >
              <div className="relative">
                <MagnifyingGlassIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن الدولة..."
                  className={`w-full rounded-lg border py-2 pl-3 pr-9 text-sm outline-none ${styles.search}`}
                  dir="rtl"
                />
              </div>
            </div>

            {/* قائمة الدول */}
            <div className="max-h-[250px] overflow-y-auto p-2">
              {filteredCountries.length === 0 ? (
                <div className="py-4 text-center text-sm text-gray-500">لا توجد نتائج</div>
              ) : (
                filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleSelectCountry(country)}
                    className={`flex w-full items-center gap-3 rounded-lg p-2.5 text-right ${
                      selectedCountry.code === country.code
                        ? styles.dropdownItemSelected
                        : styles.dropdownItem
                    }`}
                  >
                    <Flag svg={country.flag} name={country.name} className="flex-shrink-0" />
                    <div className="flex-1 text-right">
                      <span className="text-sm font-medium">{country.name}</span>
                      <span
                        className={`mr-2 text-sm ${
                          selectedCountry.code === country.code
                            ? theme === 'dark'
                              ? 'text-blue-200'
                              : 'text-blue-100'
                            : 'text-gray-400'
                        }`}
                        dir="ltr"
                      >
                        ({country.code})
                      </span>
                    </div>
                    {selectedCountry.code === country.code && (
                      <CheckIcon className="h-5 w-5 flex-shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default UnifiedPhoneInput;
