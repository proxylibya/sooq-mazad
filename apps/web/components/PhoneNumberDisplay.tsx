import React from 'react';
import Flag from './common/icons/Flag';

interface PhoneNumberDisplayProps {
  phoneNumber: string;
  dialCode: string;
  countryCode: string;
  showFlag?: boolean;
  showCountryCode?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  layout?: 'horizontal' | 'vertical';
}

const PhoneNumberDisplay: React.FC<PhoneNumberDisplayProps> = ({
  phoneNumber,
  dialCode,
  countryCode,
  showFlag = true,
  showCountryCode = true,
  className = '',
  size = 'md',
  layout = 'horizontal',
}) => {
  // تنسيق رقم الهاتف - عرض الأرقام الإنجليزية فقط
  const formatPhoneNumber = (phone: string) => {
    // تحويل الأرقام العربية إلى إنجليزية أولاً
    const convertedPhone = phone.replace(/[٠-٩]/g, (digit) => {
      const arabicToEnglish: { [key: string]: string } = {
        '٠': '0',
        '١': '1',
        '٢': '2',
        '٣': '3',
        '٤': '4',
        '٥': '5',
        '٦': '6',
        '٧': '7',
        '٨': '8',
        '٩': '9',
      };
      return arabicToEnglish[digit] || digit;
    });

    // إزالة أي مسافات أو رموز غير مرغوب فيها
    const cleanPhone = convertedPhone.replace(/\D/g, '');

    // عرض الرقم بالتنسيق الإنجليزي فقط بدون فواصل
    return cleanPhone;
  };

  const formattedPhone = formatPhoneNumber(phoneNumber);

  // تحديد أحجام العناصر
  const flagSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md';
  const textSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base';
  const gapSize = size === 'sm' ? 'gap-1' : size === 'lg' ? 'gap-3' : 'gap-2';

  if (layout === 'vertical') {
    return (
      <div className={`flex flex-col items-center ${gapSize} ${className}`}>
        {showFlag && (
          <div className="flex items-center justify-center">
            <Flag countryCode={countryCode} size={flagSize} />
          </div>
        )}
        <div className="flex flex-col items-center gap-1">
          {showCountryCode && (
            <span
              className={`${textSize} phone-number font-medium text-gray-600`}
              dir="ltr"
              style={{
                fontFamily: 'monospace',
                fontVariantNumeric: 'lining-nums',
                fontFeatureSettings: '"lnum"',
              }}
            >
              {dialCode}
            </span>
          )}
          <span
            className={`${textSize} phone-number font-medium text-gray-900`}
            dir="ltr"
            style={{
              fontFamily: 'monospace',
              fontVariantNumeric: 'lining-nums',
              fontFeatureSettings: '"lnum"',
            }}
          >
            {formattedPhone}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center ${gapSize} ${className}`} dir="ltr">
      {showFlag && <Flag countryCode={countryCode} size={flagSize} />}
      {showCountryCode && (
        <span
          className={`${textSize} phone-number font-medium text-gray-600`}
          style={{
            fontFamily: 'monospace',
            fontVariantNumeric: 'lining-nums',
            fontFeatureSettings: '"lnum"',
          }}
        >
          {dialCode}
        </span>
      )}
      <span
        className={`${textSize} phone-number font-medium text-gray-900`}
        style={{
          fontFamily: 'monospace',
          fontVariantNumeric: 'lining-nums',
          fontFeatureSettings: '"lnum"',
        }}
      >
        {formattedPhone}
      </span>
    </div>
  );
};

export default PhoneNumberDisplay;
