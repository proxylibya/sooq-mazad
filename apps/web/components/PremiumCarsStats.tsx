import React from 'react';
import StarIcon from '@heroicons/react/24/outline/StarIcon';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import HeartIcon from '@heroicons/react/24/outline/HeartIcon';
import PhoneIcon from '@heroicons/react/24/outline/PhoneIcon';
import TrophyIcon from '@heroicons/react/24/outline/TrophyIcon';
import SparklesIcon from '@heroicons/react/24/outline/SparklesIcon';

interface PremiumCarsStatsProps {
  totalCars: number;
  totalViews: number;
  totalFavorites: number;
  totalContacts: number;
  className?: string;
}

const PremiumCarsStats: React.FC<PremiumCarsStatsProps> = ({
  totalCars,
  totalViews,
  totalFavorites,
  totalContacts,
  className = '',
}) => {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const stats = [
    {
      id: 'cars',
      label: 'سيارة مميزة',
      value: totalCars,
      icon: StarIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
    },
    {
      id: 'views',
      label: 'مشاهدة',
      value: totalViews,
      icon: EyeIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      id: 'favorites',
      label: 'إعجاب',
      value: totalFavorites,
      icon: HeartIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
    {
      id: 'contacts',
      label: 'استفسار',
      value: totalContacts,
      icon: PhoneIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
  ];

  return (
    <div className={`grid grid-cols-2 gap-4 md:grid-cols-4 ${className}`}>
      {stats.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={stat.id}
            className={`${stat.bgColor} ${stat.borderColor} rounded-xl border p-4 text-center transition-all duration-300 hover:scale-105 hover:shadow-md`}
          >
            <div
              className={`${stat.color} mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm`}
            >
              <IconComponent className="h-6 w-6" />
            </div>
            <div className="mb-1 text-2xl font-bold text-gray-900">{formatNumber(stat.value)}</div>
            <div className="text-sm font-medium text-gray-600">{stat.label}</div>
          </div>
        );
      })}
    </div>
  );
};

export default PremiumCarsStats;
