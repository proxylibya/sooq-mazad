import React from 'react';
import Link from 'next/link';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import PhoneIcon from '@heroicons/react/24/outline/PhoneIcon';
import QuestionMarkCircleIcon from '@heroicons/react/24/outline/QuestionMarkCircleIcon';

interface NavbarTopBarProps {
  selectedCity: string;
  onCityChange: (city: string) => void;
}

/**
 * الشريط العلوي في الـ Navbar
 * يحتوي على: اختيار المدينة، الدعم، رقم الهاتف
 */
export function NavbarTopBar({ selectedCity, onCityChange }: NavbarTopBarProps) {
  const cities = [
    'جميع المدن',
    'طرابلس',
    'بنغازي',
    'مصراتة',
    'الزاوية',
    'البيضاء',
    'سبها',
    'غريان',
    'صبراتة',
    'الخمس',
    'زليتن',
  ];

  return (
    <div className="border-b bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex h-10 items-center justify-between text-xs">
          {/* اختيار المدينة */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <MapPinIcon className="h-4 w-4 text-gray-600" />
              <select
                value={selectedCity}
                onChange={(e) => onCityChange(e.target.value)}
                className="border-none bg-transparent text-sm focus:outline-none focus:ring-0"
              >
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* روابط الدعم */}
          <div className="flex items-center gap-4 text-gray-600">
            <Link href="/contact" className="flex items-center gap-1 hover:text-blue-600">
              <PhoneIcon className="h-4 w-4" />
              <span>اتصل بنا</span>
            </Link>
            <Link href="/help" className="flex items-center gap-1 hover:text-blue-600">
              <QuestionMarkCircleIcon className="h-4 w-4" />
              <span>المساعدة</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
