import React from 'react';
import PhoneIcon from '@heroicons/react/24/outline/PhoneIcon';
import { maskLibyanPhoneFirst7Xxx, processPhoneNumber, getFullPhoneNumber } from '../utils/phoneUtils';
import { handlePhoneClickUnified } from '../utils/phoneActions';

interface PhoneDisplayProps {
  phone: string;
  className?: string;
  showIcon?: boolean;
  clickable?: boolean;
  size?: 'sm' | 'md' | 'lg';
  mask?: boolean; // إخفاء الرقم للعرض: أول 7 أرقام + xxx (افتراضي)
}

const PhoneDisplay: React.FC<PhoneDisplayProps> = ({
  phone,
  className = '',
  showIcon = false,
  clickable = true,
  size = 'md',
  mask = true,
}) => {
  // معالجة الرقم
  const processed = processPhoneNumber(phone);
  const displayLabel = mask
    ? maskLibyanPhoneFirst7Xxx(phone)
    : (processed.isValid ? processed.displayNumber : phone);
  const telTarget = processed.isValid ? getFullPhoneNumber(phone) : (phone || '');

  // تحديد أحجام النص
  const textSizeClass = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }[size];

  // إنشاء رابط الهاتف
  const phoneLink = `tel:${telTarget}`;

  const phoneElement = (
    <span
      className={`${textSizeClass} font-mono ${className}`}
      dir="ltr"
      style={{
        fontVariantNumeric: 'lining-nums',
        fontFeatureSettings: '"lnum"',
      }}
    >
      {showIcon && <PhoneIcon className="ml-1 inline h-4 w-4 align-text-top" />}
      {displayLabel}
    </span>
  );

  if (clickable) {
    return (
      <a
        href={phoneLink}
        onClick={(e) => {
          e.preventDefault();
          handlePhoneClickUnified({ phone });
        }}
        className={`inline-flex items-center transition-colors hover:text-blue-600 ${className}`}
        dir="ltr"
      >
        {phoneElement}
      </a>
    );
  }

  return phoneElement;
};

export default PhoneDisplay;
