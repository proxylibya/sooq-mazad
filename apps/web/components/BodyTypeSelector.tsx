import React, { useState, useRef, useEffect } from 'react';
import ChevronDownIcon from '@heroicons/react/24/outline/ChevronDownIcon';

interface BodyTypeSelectorProps {
  selectedBodyType: string;
  onBodyTypeChange: (bodyType: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  forcePosition?: 'top' | 'bottom' | 'auto';
}

// أنواع الهياكل مع المعاني الليبية
const bodyTypesWithLibyanMeaning = [
  { value: '', label: 'بدون تحديد', libyanMeaning: '' },
  { value: 'all', label: 'جميع الأنواع', libyanMeaning: '' },
  { value: 'سيدان', label: 'سيدان', libyanMeaning: 'صندوق منفصل' },
  { value: 'هاتشباك', label: 'هاتشباك', libyanMeaning: 'باب خلفي' },
  { value: 'SUV', label: 'SUV', libyanMeaning: 'دفع رباعي' },
  { value: 'كوبيه', label: 'كوبيه', libyanMeaning: 'بابين رياضية' },
  { value: 'كونفرتيبل', label: 'كونفرتيبل', libyanMeaning: 'مكشوفة' },
  { value: 'واجن', label: 'واجن', libyanMeaning: 'عائلية طويلة' },
  { value: 'بيك أب', label: 'بيك أب', libyanMeaning: 'حوض خلفي' },
  { value: 'ميني فان', label: 'ميني فان', libyanMeaning: 'فان صغيرة' },
  { value: 'كروس أوفر', label: 'كروس أوفر', libyanMeaning: 'مرتفعة مدمجة' },
  { value: 'رياضية', label: 'رياضية', libyanMeaning: 'سريعة وقوية' },
];

const BodyTypeSelector: React.FC<BodyTypeSelectorProps> = ({
  selectedBodyType,
  onBodyTypeChange,
  placeholder = 'نوع الهيكل',
  className = '',
  required = false,
  disabled = false,
  forcePosition = 'auto',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [calculatedPosition, setCalculatedPosition] = useState<'top' | 'bottom'>('bottom');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // حساب موضع القائمة وإغلاقها عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    // حساب موضع القائمة عند فتحها
    if (isOpen && forcePosition === 'auto' && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const menuHeight = 240; // max-h-60 = 240px تقريباً
      
      // إذا لم يكن هناك مساحة كافية في الأسفل، اعرضها في الأعلى
      if (spaceBelow < menuHeight && rect.top > menuHeight) {
        setCalculatedPosition('top');
      } else {
        setCalculatedPosition('bottom');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, forcePosition]);

  const handleSelect = (value: string) => {
    onBodyTypeChange(value);
    setIsOpen(false);
  };

  const getSelectedLabel = () => {
    const selected = bodyTypesWithLibyanMeaning.find((type) => type.value === selectedBodyType);
    if (selected && selected.value !== 'all' && selected.value !== '') {
      return selected.libyanMeaning
        ? `${selected.label} (${selected.libyanMeaning})`
        : selected.label;
    }
    return selected?.label || placeholder;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        نوع الهيكل
        {required && <span className="mr-1 text-red-500">*</span>}
      </label>

      <div className="relative">
        <div
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`relative w-full cursor-pointer rounded-lg border px-3 py-2 transition-colors ${
            disabled
              ? 'cursor-not-allowed border-gray-200 bg-gray-100'
              : isOpen
                ? 'border-blue-500 bg-white'
                : 'border-gray-300 bg-white hover:border-gray-400'
          } `}
        >
          <div className="flex items-center justify-between">
            <span
              className={`block truncate ${
                selectedBodyType === 'all' || !selectedBodyType ? 'text-gray-500' : 'text-gray-900'
              }`}
            >
              {getSelectedLabel()}
            </span>
            <ChevronDownIcon
              className={`h-5 w-5 text-gray-400 transition-transform ${
                isOpen ? 'rotate-180 transform' : ''
              }`}
            />
          </div>
        </div>

        {/* القائمة المنسدلة */}
        {isOpen && !disabled && (
          <div
            className={`absolute z-50 w-full max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg ${
              forcePosition === 'top' 
                ? 'bottom-full mb-1' 
                : forcePosition === 'bottom' 
                  ? 'top-full mt-1'
                  : calculatedPosition === 'top' 
                    ? 'bottom-full mb-1' 
                    : 'top-full mt-1'
            }`}
          >
            {bodyTypesWithLibyanMeaning.map((type) => (
              <div
                key={type.value}
                onClick={() => handleSelect(type.value)}
                className={`cursor-pointer border-b border-gray-100 px-3 py-2 transition-colors last:border-b-0 ${
                  selectedBodyType === type.value
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-900 hover:bg-gray-50'
                } `}
              >
                {type.value === 'all' || type.value === '' ? (
                  <span className="font-medium">{type.label}</span>
                ) : (
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {type.label}
                      {type.libyanMeaning && (
                        <span className="mr-2 font-normal text-gray-500">
                          ({type.libyanMeaning})
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BodyTypeSelector;
