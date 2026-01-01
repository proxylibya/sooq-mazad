import React from 'react';
import Link from 'next/link';
import PlusIcon from '@heroicons/react/24/outline/PlusIcon';
import BuildingStorefrontIcon from '@heroicons/react/24/outline/BuildingStorefrontIcon';
import TagIcon from '@heroicons/react/24/outline/TagIcon';
import CogIcon from '@heroicons/react/24/outline/CogIcon';
import ChartBarIcon from '@heroicons/react/24/outline/ChartBarIcon';
import PhotoIcon from '@heroicons/react/24/outline/PhotoIcon';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo';
  external?: boolean;
}

interface QuickActionsProps {
  className?: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({ className = '' }) => {
  const actions: QuickAction[] = [
    {
      title: 'إضافة سيارة',
      description: 'أضف سيارة جديدة للمعرض',
      icon: <PlusIcon className="h-6 w-6" />,
      link: '/add-listing',
      color: 'blue',
    },
    {
      title: 'إنشاء معرض',
      description: 'أنشئ معرض جديد',
      icon: <BuildingStorefrontIcon className="h-6 w-6" />,
      link: '/showroom/create',
      color: 'green',
    },
    {
      title: 'إدارة العروض',
      description: 'إدارة العروض والخصومات',
      icon: <TagIcon className="h-6 w-6" />,
      link: '/showroom/offers',
      color: 'purple',
    },
    {
      title: 'إعدادات المعرض',
      description: 'تعديل معلومات المعرض',
      icon: <CogIcon className="h-6 w-6" />,
      link: '/showroom/settings',
      color: 'orange',
    },
    {
      title: 'التقارير',
      description: 'عرض التقارير والإحصائيات',
      icon: <ChartBarIcon className="h-6 w-6" />,
      link: '/showroom/reports',
      color: 'indigo',
    },
    {
      title: 'معرض الصور',
      description: 'إدارة صور المعرض',
      icon: <PhotoIcon className="h-6 w-6" />,
      link: '/showroom/gallery',
      color: 'red',
    },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-blue-50 hover:bg-blue-100',
          icon: 'text-blue-600',
          border: 'border-blue-200 hover:border-blue-300',
        };
      case 'green':
        return {
          bg: 'bg-green-50 hover:bg-green-100',
          icon: 'text-green-600',
          border: 'border-green-200 hover:border-green-300',
        };
      case 'purple':
        return {
          bg: 'bg-purple-50 hover:bg-purple-100',
          icon: 'text-purple-600',
          border: 'border-purple-200 hover:border-purple-300',
        };
      case 'orange':
        return {
          bg: 'bg-orange-50 hover:bg-orange-100',
          icon: 'text-orange-600',
          border: 'border-orange-200 hover:border-orange-300',
        };
      case 'red':
        return {
          bg: 'bg-red-50 hover:bg-red-100',
          icon: 'text-red-600',
          border: 'border-red-200 hover:border-red-300',
        };
      case 'indigo':
        return {
          bg: 'bg-indigo-50 hover:bg-indigo-100',
          icon: 'text-indigo-600',
          border: 'border-indigo-200 hover:border-indigo-300',
        };
      default:
        return {
          bg: 'bg-gray-50 hover:bg-gray-100',
          icon: 'text-gray-600',
          border: 'border-gray-200 hover:border-gray-300',
        };
    }
  };

  return (
    <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {actions.map((action, index) => {
        const colorClasses = getColorClasses(action.color);

        const ActionComponent = (
          <div
            className={`group relative rounded-xl border p-6 transition-all duration-200 hover:shadow-lg ${colorClasses.bg} ${colorClasses.border}`}
          >
            <div className="flex items-start gap-4">
              <div className={`rounded-lg bg-white/70 p-3 ${colorClasses.icon}`}>{action.icon}</div>
              <div className="flex-1">
                <h3 className="mb-2 text-lg font-semibold text-gray-900">{action.title}</h3>
                <p className="text-sm leading-relaxed text-gray-600">{action.description}</p>
              </div>
            </div>

            {/* Arrow indicator */}
            <div className="absolute left-4 top-4 opacity-0 transition-opacity group-hover:opacity-100">
              <div
                className={`h-2 w-2 rounded-full ${colorClasses.icon.replace('text-', 'bg-')}`}
              ></div>
            </div>
          </div>
        );

        return action.external ? (
          <a
            key={index}
            href={action.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            {ActionComponent}
          </a>
        ) : (
          <Link key={index} href={action.link} className="block">
            {ActionComponent}
          </Link>
        );
      })}
    </div>
  );
};

export default QuickActions;
