import React, { useState } from 'react';
import ChevronDownIcon from '@heroicons/react/24/outline/ChevronDownIcon';
import ChevronUpIcon from '@heroicons/react/24/outline/ChevronUpIcon';

interface Badge {
  text: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'indigo' | 'gray';
}

interface CollapsibleSectionProps {
  title: string;
  subtitle: string;
  badges?: Badge[];
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  buttonClassName?: string;
  contentClassName?: string;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  subtitle,
  badges = [],
  children,
  defaultOpen = false,
  className = '',
  buttonClassName = '',
  contentClassName = '',
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const getBadgeColors = (color: Badge['color']) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      purple: 'bg-purple-100 text-purple-800',
      orange: 'bg-orange-100 text-orange-800',
      indigo: 'bg-indigo-100 text-indigo-800',
      gray: 'bg-gray-100 text-gray-800',
    };
    return colors[color];
  };

  return (
    <div className={`mt-6 ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full transform items-center justify-between rounded-lg border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-indigo-50 p-6 transition-all hover:scale-[1.02] hover:border-purple-400 hover:from-purple-100 hover:to-indigo-100 hover:shadow-lg ${buttonClassName}`}
      >
        <div className="text-right">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
          {badges.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {badges.map((badge, index) => (
                <span
                  key={index}
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getBadgeColors(badge.color)}`}
                >
                  {badge.text}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex-shrink-0">
          {isOpen ? (
            <ChevronUpIcon className="h-8 w-8 font-bold text-purple-600" />
          ) : (
            <ChevronDownIcon className="h-8 w-8 font-bold text-purple-600" />
          )}
        </div>
      </button>

      {isOpen && (
        <div
          className={`mt-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm ${contentClassName}`}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default CollapsibleSection;
