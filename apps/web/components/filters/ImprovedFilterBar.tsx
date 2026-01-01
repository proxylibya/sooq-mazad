import React from 'react';
import FilterDropdown from '../ui/FilterDropdown';
import TagIcon from '@heroicons/react/24/outline/TagIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import TrophyIcon from '@heroicons/react/24/outline/TrophyIcon';
import BuildingStorefrontIcon from '@heroicons/react/24/outline/BuildingStorefrontIcon';

interface FilterBarProps {
  typeFilter: string;
  statusFilter: string;
  onTypeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  totalResults?: number;
}

const ImprovedFilterBar: React.FC<FilterBarProps> = ({
  typeFilter,
  statusFilter,
  onTypeChange,
  onStatusChange,
  totalResults = 0,
}) => {
  // خيارات نوع الإعلان
  const typeOptions = [
    { value: 'all', label: 'جميع الأنواع' },
    { value: 'marketplace', label: 'السوق الفوري' },
    { value: 'auction', label: 'المزادات' },
  ];

  // خيارات حالة الإعلان
  const statusOptions = [
    { value: 'all', label: 'جميع الحالات' },
    { value: 'active', label: 'نشط' },
    { value: 'pending', label: 'في الانتظار' },
    { value: 'expired', label: 'منتهي الصلاحية' },
    { value: 'sold', label: 'مباع' },
  ];

  // أيقونة نوع الإعلان
  const getTypeIcon = () => {
    switch (typeFilter) {
      case 'marketplace':
        return <BuildingStorefrontIcon className="h-4 w-4" />;
      case 'auction':
        return <TrophyIcon className="h-4 w-4" />;
      default:
        return <TagIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
      <span className="text-sm font-medium text-gray-700">تصفية حسب:</span>

      {/* فلتر نوع الإعلان */}
      <FilterDropdown
        options={typeOptions}
        value={typeFilter}
        onChange={onTypeChange}
        placeholder="جميع الأنواع"
        icon={getTypeIcon()}
        className="min-w-[160px]"
      />

      {/* فلتر حالة الإعلان */}
      <FilterDropdown
        options={statusOptions}
        value={statusFilter}
        onChange={onStatusChange}
        placeholder="جميع الحالات"
        icon={<ClockIcon className="h-4 w-4" />}
        className="min-w-[160px]"
      />

      {/* عداد النتائج */}
      <div className="flex items-center gap-2 text-sm text-gray-600 sm:mr-auto">
        <span className="font-medium">{totalResults}</span>
        <span>من</span>
        <span className="font-medium">{totalResults}</span>
        <span>إعلان</span>
      </div>
    </div>
  );
};

export default ImprovedFilterBar;
