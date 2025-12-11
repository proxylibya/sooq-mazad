import React from 'react';
import SimpleShowroomCard from './SimpleShowroomCard';

interface Showroom {
  id: string;
  name: string;
  description: string;
  location: string;
  city: string;
  phone: string;
  rating: number;
  reviewsCount: number;
  totalCars: number;
  activeCars: number;
  images: string[];
  verified: boolean;
  featured: boolean;
  specialties: string[];
  vehicleTypes: string[];
  establishedYear: number;
  openingHours: string;
  type: string;
  user: {
    id: string;
    name: string;
    phone: string;
    verified: boolean;
    profileImage?: string;
    accountType: string;
    rating?: number;
    totalReviews?: number;
  };
}

interface SimpleShowroomCardGridProps {
  showrooms: Showroom[];
  onShowroomClick?: (showroom: Showroom) => void;
}

const SimpleShowroomCardGrid: React.FC<SimpleShowroomCardGridProps> = ({
  showrooms,
  onShowroomClick,
}) => {
  if (!showrooms || showrooms.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto mb-4 h-12 w-12 text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="h-full w-full"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.001 3.001 0 01-.621-1.72c0-.966.456-1.821 1.17-2.37a3.001 3.001 0 013.75-.614M21 9.35a3.001 3.001 0 00-.621-1.72c0-.966-.456-1.821-1.17-2.37a3.001 3.001 0 00-3.75-.614"
            />
          </svg>
        </div>
        <h3 className="mb-2 text-lg font-medium text-gray-900">لا توجد معارض</h3>
        <p className="text-gray-500">لم يتم العثور على معارض تطابق معايير البحث</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
      {showrooms.map((showroom) => (
        <SimpleShowroomCard
          key={showroom.id}
          showroom={showroom}
          viewMode="grid"
          onClick={() => onShowroomClick?.(showroom)}
        />
      ))}
    </div>
  );
};

export default SimpleShowroomCardGrid;
