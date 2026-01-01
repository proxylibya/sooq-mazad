import { maskLibyanPhoneFirst7Xxx } from '@/utils/phoneUtils';
import PhoneIcon from '@heroicons/react/24/outline/PhoneIcon';
import React from 'react';

interface ContactButtonProps {
  phone?: string | null;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  ariaLabel?: string;
}

const baseClasses =
  'flex h-10 items-center gap-1 rounded-md bg-blue-600 px-2 text-xs font-medium text-white transition-colors hover:bg-blue-700';

const ContactButton: React.FC<ContactButtonProps> = ({
  phone,
  onClick,
  className = '',
  ariaLabel,
}) => {
  const label = maskLibyanPhoneFirst7Xxx(phone || '');

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseClasses} ${className}`.trim()}
      aria-label={ariaLabel || 'اتصال'}
    >
      <PhoneIcon className="h-3 w-3 flex-shrink-0" />
      <span className="text-xs" dir="ltr">
        {label}
      </span>
    </button>
  );
};

export default ContactButton;
