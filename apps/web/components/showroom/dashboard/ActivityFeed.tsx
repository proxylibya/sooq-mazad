import React from 'react';
import Link from 'next/link';
import TruckIcon from '@heroicons/react/24/outline/TruckIcon';
import BuildingStorefrontIcon from '@heroicons/react/24/outline/BuildingStorefrontIcon';
import TagIcon from '@heroicons/react/24/outline/TagIcon';
import UserGroupIcon from '@heroicons/react/24/outline/UserGroupIcon';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import HeartIcon from '@heroicons/react/24/outline/HeartIcon';

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  details?: string;
  timeAgo: string;
  icon: string;
  color: string;
  link?: string;
}

interface ActivityFeedProps {
  activities: Activity[];
  loading?: boolean;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, loading = false }) => {
  const getIcon = (iconType: string, color: string) => {
    const iconClass = `h-5 w-5 ${getIconColor(color)}`;

    switch (iconType) {
      case 'car':
        return <TruckIcon className={iconClass} />;
      case 'showroom':
        return <BuildingStorefrontIcon className={iconClass} />;
      case 'offer':
        return <TagIcon className={iconClass} />;
      case 'inquiry':
        return <UserGroupIcon className={iconClass} />;
      case 'view':
        return <EyeIcon className={iconClass} />;
      case 'favorite':
        return <HeartIcon className={iconClass} />;
      default:
        return <TruckIcon className={iconClass} />;
    }
  };

  const getIconColor = (color: string) => {
    switch (color) {
      case 'blue':
        return 'text-blue-600';
      case 'green':
        return 'text-green-600';
      case 'yellow':
        return 'text-yellow-600';
      case 'purple':
        return 'text-purple-600';
      case 'red':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getBgColor = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-50';
      case 'green':
        return 'bg-green-50';
      case 'yellow':
        return 'bg-yellow-50';
      case 'purple':
        return 'bg-purple-50';
      case 'red':
        return 'bg-red-50';
      default:
        return 'bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className="flex animate-pulse items-start gap-4 rounded-lg bg-gray-50 p-4"
          >
            <div className="h-10 w-10 rounded-full bg-gray-200"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-gray-200"></div>
              <div className="h-3 w-1/2 rounded bg-gray-200"></div>
            </div>
            <div className="h-3 w-16 rounded bg-gray-200"></div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="py-12 text-center">
        <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد نشاطات</h3>
        <p className="mt-1 text-sm text-gray-500">لم يتم تسجيل أي نشاطات حتى الآن</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-start gap-4 rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50"
        >
          <div className={`rounded-full p-2 ${getBgColor(activity.color)}`}>
            {getIcon(activity.icon, activity.color)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="mb-1 text-sm font-medium text-gray-900">{activity.title}</h4>
                <p className="mb-1 text-sm text-gray-600">{activity.description}</p>
                {activity.details && <p className="text-xs text-gray-500">{activity.details}</p>}
              </div>
              <span className="mr-2 whitespace-nowrap text-xs text-gray-500">
                {activity.timeAgo}
              </span>
            </div>

            {activity.link && (
              <Link
                href={activity.link}
                className="mt-2 inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
              >
                عرض التفاصيل
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityFeed;
