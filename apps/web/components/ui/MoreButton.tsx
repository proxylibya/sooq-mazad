import ChevronDownIcon from '@heroicons/react/24/outline/ChevronDownIcon';
import React, { useEffect, useRef, useState } from 'react';

export interface MoreButtonItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  divider?: boolean;
  href?: string;
}

export interface MoreButtonProps {
  // النص والأيقونة
  label?: string;

  // قائمة العناصر
  items: MoreButtonItem[];

  // المظهر
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;

  // الحالة
  disabled?: boolean;

  // الموضع
  position?: 'left' | 'right' | 'center';

  // التخصيص
  dropdownClassName?: string;
  buttonClassName?: string;
}

const MoreButton: React.FC<MoreButtonProps> = ({
  label = 'المزيد',
  items = [],
  variant = 'default',
  size = 'md',
  className = '',
  disabled = false,
  position = 'right',
  dropdownClassName = '',
  buttonClassName = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'top' | 'bottom'>('bottom');

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // حساب موضع القائمة المنسدلة
  const calculateDropdownPosition = () => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const dropdownHeight = Math.min(300, items.length * 44 + 20);
    const spaceBelow = windowHeight - rect.bottom - 10;
    const spaceAbove = rect.top - 10;

    if (spaceBelow >= dropdownHeight) {
      setDropdownPosition('bottom');
    } else if (spaceAbove >= dropdownHeight) {
      setDropdownPosition('top');
    } else {
      setDropdownPosition(spaceBelow > spaceAbove ? 'bottom' : 'top');
    }
  };

  // معالجة فتح/إغلاق القائمة
  const handleToggle = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (disabled) return;

    if (!isOpen) {
      calculateDropdownPosition();
    }
    setIsOpen(!isOpen);
  };

  // معالجة النقر على عنصر
  const handleItemClick = (item: MoreButtonItem, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (item.disabled) return;

    if (item.href) {
      window.location.href = item.href;
    } else if (item.onClick) {
      item.onClick();
    }

    setIsOpen(false);
  };

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      calculateDropdownPosition();
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // أنماط الحجم
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-3 text-base gap-2.5',
  };

  // أنماط المتغيرات
  const variantClasses = {
    default:
      'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:text-blue-600 hover:border-gray-400 shadow-sm hover:shadow-md',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 hover:text-blue-600',
    outline:
      'bg-transparent text-gray-700 border border-gray-300 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-300',
  };

  // أنماط موضع القائمة
  const positionClasses = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 transform -translate-x-1/2',
  };

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      {/* الزر الرئيسي */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`inline-flex items-center justify-center rounded-lg font-medium outline-none transition-all duration-200 ${sizeClasses[size]} ${variantClasses[variant]} ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${isOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : ''} ${buttonClassName} `}
      >
        {/* النص */}
        <span className="font-medium">{label}</span>

        {/* سهم القائمة */}
        <ChevronDownIcon
          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* القائمة المنسدلة */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={`absolute z-[9999] mt-2 min-w-48 rounded-xl border border-gray-200 bg-white shadow-2xl ${dropdownPosition === 'bottom' ? 'top-full' : 'bottom-full mb-2'} ${positionClasses[position]} ${dropdownClassName} `}
          style={{
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.preventDefault()}
        >
          <div className="py-2">
            {items.map((item, index) => (
              <React.Fragment key={item.id}>
                {/* فاصل */}
                {item.divider && index > 0 && <div className="my-2 border-t border-gray-200" />}

                {/* عنصر القائمة */}
                {!item.divider && (
                  <button
                    type="button"
                    onClick={(e) => handleItemClick(item, e)}
                    disabled={item.disabled}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-right text-sm transition-colors duration-150 ${
                      item.disabled
                        ? 'cursor-not-allowed text-gray-400 opacity-50'
                        : 'cursor-pointer text-gray-900 hover:bg-blue-50 hover:text-blue-700'
                    } `}
                  >
                    {/* أيقونة العنصر */}
                    {item.icon && <span className="flex-shrink-0">{item.icon}</span>}

                    {/* نص العنصر */}
                    <span className="flex-1 text-right font-medium">{item.label}</span>
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MoreButton;
