import React from 'react';
import CogIcon from '@heroicons/react/24/outline/CogIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import CalendarIcon from '@heroicons/react/24/outline/CalendarIcon';
import TruckIcon from '@heroicons/react/24/outline/TruckIcon';
import FireIcon from '@heroicons/react/24/outline/FireIcon';

// أيقونات المواصفات
export const CarSpecIcons = {
  transmission: CogIcon,
  mileage: TruckIcon,
  fuel: FireIcon,
  year: CalendarIcon,
  location: MapPinIcon,
};

interface CarSpec {
  label: string;
  value: string | number;
  icon: React.ComponentType<any>;
  show: boolean;
}

interface CarSpecsDisplayProps {
  specs: CarSpec[];
  maxSpecs?: number;
  layout?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
}

const CarSpecsDisplay: React.FC<CarSpecsDisplayProps> = ({
  specs,
  maxSpecs = 6,
  layout = 'horizontal',
  size = 'md',
}) => {
  const visibleSpecs = specs.filter((spec) => spec.show).slice(0, maxSpecs);

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  if (layout === 'vertical') {
    return (
      <div className="space-y-2">
        {visibleSpecs.map((spec, index) => {
          const IconComponent = spec.icon;
          return (
            <div key={index} className="flex items-center gap-2">
              <IconComponent className={`${iconSizes[size]} text-gray-500`} />
              <span className={`${sizeClasses[size]} text-gray-600`}>
                {spec.label}: {spec.value}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {visibleSpecs.map((spec, index) => {
        const IconComponent = spec.icon;
        return (
          <div key={index} className="flex items-center gap-1">
            <IconComponent className={`${iconSizes[size]} text-gray-500`} />
            <span className={`${sizeClasses[size]} text-gray-600`}>{spec.value}</span>
          </div>
        );
      })}
    </div>
  );
};

export default CarSpecsDisplay;
