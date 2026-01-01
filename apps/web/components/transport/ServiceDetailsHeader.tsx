import HeartIcon from '@heroicons/react/24/outline/HeartIcon';
import ShareIcon from '@heroicons/react/24/outline/ShareIcon';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import React from 'react';
import { truncateText } from '../../utils/transportTitleUtils';
import { translateVehicleType } from '../../utils/transportTranslations';

interface ServiceDetailsHeaderProps {
  title: string;
  description: string;
  truckType: string;
  capacity: string;
  serviceArea: string;
  availableDays: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const ServiceDetailsHeader: React.FC<ServiceDetailsHeaderProps> = ({
  title,
  description,
  truckType,
  capacity,
  serviceArea,
  availableDays,
  isFavorite,
  onToggleFavorite,
}) => {
  return (
    <div className="space-y-6">
      {/* العنوان والأزرار */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" title={title}>
            {truncateText(title, 90)}
          </h1>
          <p className="mt-2 text-gray-600">{description}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onToggleFavorite}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-red-500"
            aria-label={isFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
          >
            {isFavorite ? (
              <HeartIconSolid className="h-6 w-6 text-red-500" />
            ) : (
              <HeartIcon className="h-6 w-6" />
            )}
          </button>
          <button
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-blue-500"
            aria-label="مشاركة"
          >
            <ShareIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* تفاصيل الخدمة */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* نوع الشاحنة */}
        <div className="flex items-center gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="h-5 w-5 text-blue-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
            />
          </svg>
          <div>
            <span className="text-sm text-gray-500">نوع الشاحنة</span>
            <p className="font-medium">{translateVehicleType(truckType)}</p>
          </div>
        </div>

        {/* الحمولة */}
        <div className="flex items-center gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="h-5 w-5 text-green-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z"
            />
          </svg>
          <div>
            <span className="text-sm text-gray-500">الحمولة</span>
            <p className="font-medium">{capacity}</p>
          </div>
        </div>

        {/* منطقة الخدمة */}
        <div className="flex items-center gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="h-5 w-5 text-red-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
            />
          </svg>
          <div>
            <span className="text-sm text-gray-500">منطقة الخدمة</span>
            <p className="font-medium">{serviceArea}</p>
          </div>
        </div>

        {/* أيام العمل */}
        <div className="flex items-center gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="h-5 w-5 text-purple-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z"
            />
          </svg>
          <div>
            <span className="text-sm text-gray-500">أيام العمل</span>
            <p className="font-medium">{availableDays}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailsHeader;
