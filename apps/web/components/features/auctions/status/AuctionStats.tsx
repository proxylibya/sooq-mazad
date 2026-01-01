import React from 'react';
import HandRaisedIcon from '@heroicons/react/24/outline/HandRaisedIcon';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import HeartIcon from '@heroicons/react/24/outline/HeartIcon';
import UserGroupIcon from '@heroicons/react/24/outline/UserGroupIcon';
import TrophyIcon from '@heroicons/react/24/outline/TrophyIcon';

interface AuctionStatsProps {
  bidCount: number;
  viewCount?: number;
  favoriteCount?: number;
  participantCount?: number;
  auctionType: 'upcoming' | 'live' | 'ended' | 'sold';
  size?: 'small' | 'medium' | 'large';
  layout?: 'horizontal' | 'vertical' | 'grid';
}

const AuctionStats: React.FC<AuctionStatsProps> = ({
  bidCount,
  viewCount = 0,
  favoriteCount = 0,
  participantCount = 0,
  auctionType,
  size = 'medium',
  layout = 'horizontal',
}) => {
  // تحديد الألوان حسب نوع المزاد
  const getColors = () => {
    switch (auctionType) {
      case 'live':
        return {
          primary: 'text-blue-600',
          secondary: 'text-blue-500',
          bg: 'bg-blue-50',
          border: 'border-blue-200',
        };
      case 'upcoming':
        return {
          primary: 'text-amber-600',
          secondary: 'text-amber-500',
          bg: 'bg-amber-50',
          border: 'border-amber-200',
        };
      case 'sold':
        return {
          primary: 'text-green-600',
          secondary: 'text-green-500',
          bg: 'bg-green-50',
          border: 'border-green-200',
        };
      case 'ended':
        return {
          primary: 'text-gray-600',
          secondary: 'text-gray-500',
          bg: 'bg-gray-50',
          border: 'border-gray-200',
        };
      default:
        return {
          primary: 'text-gray-600',
          secondary: 'text-gray-500',
          bg: 'bg-gray-50',
          border: 'border-gray-200',
        };
    }
  };

  // تحديد أحجام العناصر
  const getSizes = () => {
    switch (size) {
      case 'small':
        return {
          icon: 'w-3 h-3',
          text: 'text-xs',
          number: 'text-sm font-semibold',
          padding: 'p-2',
          gap: 'gap-1',
        };
      case 'large':
        return {
          icon: 'w-5 h-5',
          text: 'text-base',
          number: 'text-lg font-bold',
          padding: 'p-4',
          gap: 'gap-3',
        };
      default: // medium
        return {
          icon: 'w-4 h-4',
          text: 'text-sm',
          number: 'text-base font-semibold',
          padding: 'p-3',
          gap: 'gap-2',
        };
    }
  };

  const colors = getColors();
  const sizes = getSizes();

  // تنسيق الأرقام
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  // إنشاء عنصر إحصائية واحد
  const StatItem: React.FC<{
    icon: React.ReactNode;
    value: number;
    label: string;
    highlight?: boolean;
  }> = ({ icon, value, label, highlight = false }) => (
    <div
      className={`flex items-center ${sizes.gap} ${highlight ? colors.primary : 'text-gray-600'}`}
    >
      <div className={`${sizes.icon} flex-shrink-0`}>{icon}</div>
      <div className="flex flex-col">
        <span className={`${sizes.number} ${highlight ? colors.primary : 'text-gray-900'}`}>
          {formatNumber(value)}
        </span>
        <span className={`${sizes.text} text-gray-500`}>{label}</span>
      </div>
    </div>
  );

  // تحديد التخطيط
  const getLayoutClasses = () => {
    switch (layout) {
      case 'vertical':
        return 'flex flex-col space-y-3';
      case 'grid':
        return 'grid grid-cols-1 gap-3';
      default: // horizontal
        return 'flex items-center justify-between';
    }
  };

  // تحديد الإحصائيات المعروضة حسب نوع المزاد
  const getStatsToShow = () => {
    const baseStats = [
      {
        icon: <HandRaisedIcon />,
        value: bidCount,
        label: 'مزايدة',
        highlight: auctionType === 'live',
      },
      {
        icon: <EyeIcon />,
        value: viewCount,
        label: 'مشاهدة',
        highlight: false,
      },
      {
        icon: <HeartIcon />,
        value: favoriteCount,
        label: 'المفضلة',
        highlight: false,
      },
    ];

    if (auctionType === 'live') {
      baseStats.push({
        icon: <UserGroupIcon />,
        value: participantCount,
        label: 'مشارك',
        highlight: false,
      });
    }

    if (auctionType === 'ended' || auctionType === 'sold') {
      baseStats.push({
        icon: <TrophyIcon />,
        value: 1,
        label: 'فائز',
        highlight: true,
      });
    }

    return baseStats;
  };

  const statsToShow = getStatsToShow();

  return (
    <div
      className={` ${colors.bg} ${colors.border} rounded-lg border ${sizes.padding} transition-all duration-200`}
    >
      <div className={getLayoutClasses()}>
        {statsToShow.map((stat, index) => (
          <StatItem
            key={index}
            icon={stat.icon}
            value={stat.value}
            label={stat.label}
            highlight={stat.highlight}
          />
        ))}
      </div>
    </div>
  );
};

export default AuctionStats;
