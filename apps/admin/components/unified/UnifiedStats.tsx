/**
 * 📊 مكون الإحصائيات الموحد
 * Unified Stats Component
 */

import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  BuildingStorefrontIcon,
  ChartBarIcon,
  CheckBadgeIcon,
  ClockIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  NoSymbolIcon,
  ShoppingBagIcon,
  SparklesIcon,
  StarIcon,
  TruckIcon,
  UserGroupIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import React from 'react';
import { STAT_COLORS, formatNumber, type StatCard } from '../../lib/unified-admin-system';

// ================== أيقونات الإحصائيات ==================

const STAT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  users: UserGroupIcon,
  active: CheckBadgeIcon,
  blocked: NoSymbolIcon,
  suspended: XCircleIcon,
  pending: ClockIcon,
  total: ChartBarIcon,
  revenue: BanknotesIcon,
  views: EyeIcon,
  orders: ShoppingBagIcon,
  products: CubeIcon,
  auctions: SparklesIcon,
  transport: TruckIcon,
  showrooms: BuildingStorefrontIcon,
  featured: StarIcon,
  warning: ExclamationTriangleIcon,
};

// ================== مكون بطاقة الإحصائية ==================

interface StatCardProps {
  stat: StatCard;
  size?: 'sm' | 'md' | 'lg';
}

export function StatCardComponent({ stat, size = 'md' }: StatCardProps) {
  const colors = STAT_COLORS[stat.color];
  const Icon = STAT_ICONS[stat.icon] || ChartBarIcon;

  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const valueSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const iconSizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  return (
    <div className={`rounded-xl border ${colors.border} ${colors.bg} ${sizeClasses[size]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`font-bold ${colors.text} ${valueSizes[size]}`}>
            {typeof stat.value === 'number' ? formatNumber(stat.value) : stat.value}
          </p>
          <p className={`text-sm ${colors.text} opacity-70`}>{stat.label}</p>

          {/* Trend indicator */}
          {stat.trend && (
            <div className="mt-1 flex items-center gap-1">
              {stat.trend.direction === 'up' ? (
                <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-400" />
              ) : (
                <ArrowTrendingDownIcon className="h-4 w-4 text-red-400" />
              )}
              <span
                className={`text-xs ${
                  stat.trend.direction === 'up' ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {stat.trend.value}%
              </span>
            </div>
          )}
        </div>
        <Icon className={`${iconSizes[size]} ${colors.icon}`} />
      </div>
    </div>
  );
}

// ================== مكون شبكة الإحصائيات ==================

interface UnifiedStatsProps {
  stats: StatCard[];
  columns?: 2 | 3 | 4 | 5;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function UnifiedStats({
  stats,
  columns = 4,
  size = 'md',
  className = '',
}: UnifiedStatsProps) {
  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
    5: 'md:grid-cols-5',
  };

  return (
    <div className={`grid grid-cols-1 gap-4 ${gridCols[columns]} ${className}`}>
      {stats.map((stat) => (
        <StatCardComponent key={stat.id} stat={stat} size={size} />
      ))}
    </div>
  );
}

// ================== إحصائيات جاهزة ==================

export const StatsPresets = {
  /** إحصائيات المستخدمين */
  users: (data: {
    total: number;
    active: number;
    blocked: number;
    suspended: number;
  }): StatCard[] => [
    { id: 'total', label: 'إجمالي المستخدمين', value: data.total, icon: 'users', color: 'blue' },
    { id: 'active', label: 'نشط', value: data.active, icon: 'active', color: 'emerald' },
    { id: 'blocked', label: 'محظور', value: data.blocked, icon: 'blocked', color: 'red' },
    { id: 'suspended', label: 'موقوف', value: data.suspended, icon: 'suspended', color: 'amber' },
  ],

  /** إحصائيات المزادات */
  auctions: (data: {
    total: number;
    active: number;
    ended: number;
    pending: number;
  }): StatCard[] => [
    { id: 'total', label: 'إجمالي المزادات', value: data.total, icon: 'auctions', color: 'blue' },
    { id: 'active', label: 'نشط', value: data.active, icon: 'active', color: 'emerald' },
    { id: 'ended', label: 'منتهي', value: data.ended, icon: 'total', color: 'slate' },
    { id: 'pending', label: 'قيد المراجعة', value: data.pending, icon: 'pending', color: 'amber' },
  ],

  /** إحصائيات السوق */
  marketplace: (data: {
    total: number;
    active: number;
    sold: number;
    featured: number;
  }): StatCard[] => [
    { id: 'total', label: 'إجمالي الإعلانات', value: data.total, icon: 'products', color: 'blue' },
    { id: 'active', label: 'نشط', value: data.active, icon: 'active', color: 'emerald' },
    { id: 'sold', label: 'مباع', value: data.sold, icon: 'orders', color: 'purple' },
    { id: 'featured', label: 'مميز', value: data.featured, icon: 'featured', color: 'amber' },
  ],

  /** إحصائيات خدمات النقل */
  transport: (data: {
    total: number;
    active: number;
    inactive: number;
    pending: number;
  }): StatCard[] => [
    { id: 'total', label: 'إجمالي الخدمات', value: data.total, icon: 'transport', color: 'blue' },
    { id: 'active', label: 'نشط', value: data.active, icon: 'active', color: 'emerald' },
    { id: 'inactive', label: 'غير نشط', value: data.inactive, icon: 'suspended', color: 'slate' },
    { id: 'pending', label: 'قيد المراجعة', value: data.pending, icon: 'pending', color: 'amber' },
  ],

  /** إحصائيات المعارض */
  showrooms: (data: {
    total: number;
    active: number;
    pending: number;
    featured: number;
  }): StatCard[] => [
    { id: 'total', label: 'إجمالي المعارض', value: data.total, icon: 'showrooms', color: 'blue' },
    { id: 'active', label: 'نشط', value: data.active, icon: 'active', color: 'emerald' },
    { id: 'pending', label: 'قيد المراجعة', value: data.pending, icon: 'pending', color: 'amber' },
    { id: 'featured', label: 'مميز', value: data.featured, icon: 'featured', color: 'purple' },
  ],
};
