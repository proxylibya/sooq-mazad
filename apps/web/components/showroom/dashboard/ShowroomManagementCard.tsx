import React, { useState } from 'react';
import Link from 'next/link';
import BuildingStorefrontIcon from '@heroicons/react/24/outline/BuildingStorefrontIcon';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import PlayIcon from '@heroicons/react/24/outline/PlayIcon';
import PauseIcon from '@heroicons/react/24/outline/PauseIcon';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import StarIcon from '@heroicons/react/24/outline/StarIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import PhoneIcon from '@heroicons/react/24/outline/PhoneIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import PlusIcon from '@heroicons/react/24/outline/PlusIcon';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import SafeImage from '../../SafeImage';

interface ShowroomData {
  id: string;
  name: string;
  description: string;
  images: string[];
  phone?: string;
  email?: string;
  website?: string;
  city: string;
  area: string;
  address: string;
  rating: number;
  reviewsCount: number;
  totalCars: number;
  activeCars: number;
  verified: boolean;
  featured: boolean;
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'SUSPENDED';
  vehicleTypes: string[];
  specialties: string[];
  openingHours?: string;
  establishedYear?: number;
  createdAt: string;
  updatedAt: string;
}

interface ShowroomManagementCardProps {
  showroom: ShowroomData;
  onEdit: (showroomId: string) => void;
  onDelete: (showroomId: string) => void;
  onToggleStatus: (showroomId: string, action: 'approve' | 'suspend') => void;
  onToggleFeatured: (showroomId: string) => void;
  loading?: boolean;
}

const ShowroomManagementCard: React.FC<ShowroomManagementCardProps> = ({
  showroom,
  onEdit,
  onDelete,
  onToggleStatus,
  onToggleFeatured,
  loading = false,
}) => {
  const [imageError, setImageError] = useState(false);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return {
          text: 'معتمد',
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          icon: <CheckCircleIcon className="h-4 w-4" />,
        };
      case 'SUSPENDED':
        return {
          text: 'معلق',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          icon: <PauseIcon className="h-4 w-4" />,
        };
      case 'PENDING':
        return {
          text: 'نشط',
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          icon: <CheckCircleIcon className="h-4 w-4" />,
        };
      case 'REJECTED':
        return {
          text: 'مرفوض',
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          icon: <ExclamationTriangleIcon className="h-4 w-4" />,
        };
      default:
        return {
          text: 'غير محدد',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          icon: <ExclamationTriangleIcon className="h-4 w-4" />,
        };
    }
  };

  const statusInfo = getStatusInfo(showroom.status);
  const mainImage = showroom.images && showroom.images.length > 0 ? showroom.images[0] : null;

  const handleImageError = () => {
    setImageError(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-LY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div
      className={`showroom-management-card overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg transition-all duration-300 hover:shadow-xl ${loading ? 'loading' : ''}`}
    >
      {/* صورة المعرض */}
      <div className="showroom-image-container relative h-48 bg-gray-200">
        <SafeImage
          src={
            Array.isArray(showroom.images) && showroom.images.length > 0
              ? showroom.images[0]
              : '/images/showrooms/default-showroom.svg'
          }
          alt={showroom.name}
          className="h-full w-full object-cover"
          fallbackSrc="/images/showrooms/default-showroom.svg"
          onError={() => setImageError(true)}
        />

        {imageError && (
          <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <BuildingStorefrontIcon className="h-16 w-16 text-gray-400" />
          </div>
        )}

        {/* شارات الحالة */}
        <div className="showroom-badges">
          {/* حالة المعرض */}
          <div
            className={`showroom-badge flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}
          >
            {statusInfo.icon}
            <span>{statusInfo.text}</span>
          </div>

          {/* معرض مميز */}
          {showroom.featured && (
            <div className="showroom-badge flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-600">
              <StarSolid className="h-3 w-3" />
              <span>مميز</span>
            </div>
          )}

          {/* معرض معتمد */}
          {showroom.verified && (
            <div className="showroom-badge flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-600">
              <CheckCircleIcon className="h-3 w-3" />
              <span>معتمد</span>
            </div>
          )}
        </div>

        {/* عدد الصور */}
        {showroom.images && showroom.images.length > 1 && (
          <div className="image-count-badge rounded-full bg-black bg-opacity-60 px-2 py-1 text-xs text-white">
            {showroom.images.length} صور
          </div>
        )}
      </div>

      {/* محتوى البطاقة */}
      <div className="showroom-card-content p-4">
        {/* اسم المعرض والتقييم */}
        <div className="mb-3">
          <h3 className="mb-1 line-clamp-1 text-lg font-bold text-gray-900">{showroom.name}</h3>

          {/* التقييم */}
          <div className="mb-2 flex items-center gap-2">
            <div className="flex items-center gap-1">
              <StarIcon className="h-4 w-4 fill-current text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">
                {showroom.rating.toFixed(1)}
              </span>
              <span className="text-xs text-gray-500">({showroom.reviewsCount} تقييم)</span>
            </div>
          </div>

          {/* الوصف */}
          <p className="mb-3 line-clamp-2 text-sm text-gray-600">{showroom.description}</p>
        </div>

        {/* معلومات إضافية */}
        <div className="showroom-info-grid mb-4">
          {/* الموقع */}
          <div className="showroom-info-item">
            <MapPinIcon className="h-4 w-4" />
            <span className="line-clamp-1 text-sm">
              {showroom.area}, {showroom.city}
            </span>
          </div>

          {/* رقم الهاتف */}
          {showroom.phone && (
            <div className="showroom-info-item">
              <PhoneIcon className="h-4 w-4" />
              <span className="text-sm" dir="ltr">{showroom.phone}</span>
            </div>
          )}

          {/* تاريخ الإنشاء */}
          <div className="showroom-info-item">
            <span className="text-xs text-gray-500">
              تم الإنشاء: {formatDate(showroom.createdAt)}
            </span>
          </div>
        </div>

        {/* إحصائيات السيارات */}
        <div className="showroom-stats">
          <div className="showroom-stat-item">
            <div className="showroom-stat-value">{showroom.totalCars}</div>
            <div className="showroom-stat-label">إجمالي السيارات</div>
          </div>
          <div className="showroom-stat-item">
            <div className="showroom-stat-value text-green-600">{showroom.activeCars}</div>
            <div className="showroom-stat-label">متاحة</div>
          </div>
          <div className="showroom-stat-item">
            <div className="showroom-stat-value text-blue-600">{showroom.rating.toFixed(1)}</div>
            <div className="showroom-stat-label">التقييم</div>
          </div>
        </div>

        {/* أزرار الإجراءات */}
        <div className="showroom-actions space-y-2">
          {/* الصف الأول - أزرار العرض وإضافة المركبات */}
          <div className="flex gap-2">
            <Link
              href={`/showrooms/${showroom.id}`}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              <EyeIcon className="h-4 w-4" />
              <span>عرض</span>
            </Link>

            <Link
              href={`/showroom/add-vehicle/${showroom.id}`}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
            >
              <PlusIcon className="h-4 w-4" />
              <span>إضافة مركبات</span>
            </Link>
          </div>

          {/* الصف الثاني - أزرار الإدارة */}
          <div className="flex gap-2">
            {/* زر التعديل */}
            <button
              onClick={() => onEdit(showroom.id)}
              disabled={loading}
              className="flex items-center justify-center rounded-lg bg-gray-100 px-3 py-2 text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50"
              title="تعديل المعرض"
            >
              <PencilIcon className="h-4 w-4" />
            </button>

            {/* زر التفعيل/الإلغاء */}
            {showroom.status !== 'PENDING' && showroom.status !== 'REJECTED' && (
              <button
                onClick={() =>
                  onToggleStatus(
                    showroom.id,
                    showroom.status === 'APPROVED' ? 'suspend' : 'approve',
                  )
                }
                disabled={loading}
                className={`flex items-center justify-center rounded-lg px-3 py-2 transition-colors disabled:opacity-50 ${
                  showroom.status === 'APPROVED'
                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
                title={showroom.status === 'APPROVED' ? 'تعليق المعرض' : 'اعتماد المعرض'}
              >
                {showroom.status === 'APPROVED' ? (
                  <PauseIcon className="h-4 w-4" />
                ) : (
                  <PlayIcon className="h-4 w-4" />
                )}
              </button>
            )}

            {/* زر الحذف */}
            <button
              onClick={() => onDelete(showroom.id)}
              disabled={loading || showroom.totalCars > 0}
              className="flex items-center justify-center rounded-lg bg-red-100 px-3 py-2 text-red-700 transition-colors hover:bg-red-200 disabled:opacity-50"
              title={showroom.totalCars > 0 ? 'لا يمكن حذف المعرض لوجود سيارات' : 'حذف المعرض'}
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowroomManagementCard;
