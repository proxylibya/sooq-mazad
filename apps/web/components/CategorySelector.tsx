import SelectField from './ui/SelectField';
import BuildingStorefrontIcon from '@heroicons/react/24/outline/BuildingStorefrontIcon';
import CpuChipIcon from '@heroicons/react/24/outline/CpuChipIcon';
import ShoppingBagIcon from '@heroicons/react/24/outline/ShoppingBagIcon';
import Squares2X2Icon from '@heroicons/react/24/outline/Squares2X2Icon';
import TrophyIcon from '@heroicons/react/24/outline/TrophyIcon';
import TruckIcon from '@heroicons/react/24/outline/TruckIcon';
import WrenchScrewdriverIcon from '@heroicons/react/24/outline/WrenchScrewdriverIcon';
import React, { useMemo } from 'react';

interface CategorySelectorProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  forcePosition?: 'top' | 'bottom' | 'auto'; // إجبار موضع القائمة
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onCategoryChange,
  className = '',
  placeholder = 'جميع الفئات',
  disabled = false,
  required = false,
  forcePosition = 'auto',
}) => {
  // قائمة الفئات مع الأيقونات
  const categories = useMemo(
    () => [
      {
        value: 'all',
        label: 'جميع الفئات',
        icon: <Squares2X2Icon className="h-4 w-4" />,
        description: 'عرض جميع الفئات',
      },
      {
        value: 'auctions',
        label: 'المزادات',
        icon: <TrophyIcon className="h-4 w-4" />,
        description: 'مزادات السيارات المباشرة',
      },
      {
        value: 'marketplace',
        label: 'السوق الفوري',
        icon: <ShoppingBagIcon className="h-4 w-4" />,
        description: 'بيع وشراء السيارات',
      },
      {
        value: 'yards',
        label: 'الساحات',
        icon: <BuildingStorefrontIcon className="h-4 w-4" />,
        description: 'ساحات عرض السيارات',
      },
      {
        value: 'transport',
        label: 'خدمات النقل',
        icon: <TruckIcon className="h-4 w-4" />,
        description: 'نقل السيارات بين المدن',
      },
      {
        value: 'parts',
        label: 'قطع الغيار',
        icon: <WrenchScrewdriverIcon className="h-4 w-4" />,
        description: 'قطع غيار السيارات',
      },
      {
        value: 'motorcycles',
        label: 'الدراجات',
        icon: <CpuChipIcon className="h-4 w-4" />,
        description: 'الدراجات النارية',
      },
    ],
    [],
  );

  return (
    <SelectField
      options={categories.map((cat) => cat.label)}
      value={selectedCategory}
      onChange={onCategoryChange}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      required={required}
      searchable
      clearable
    />
  );
};

export default CategorySelector;
