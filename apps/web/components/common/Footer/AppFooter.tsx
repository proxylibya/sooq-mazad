import React from 'react';
import { MapPinIcon } from '@heroicons/react/24/outline';

interface AppFooterProps {
  className?: string;
}

const AppFooter: React.FC<AppFooterProps> = ({ className = '' }) => {
  const currentYear = new Date().getFullYear();

  return (
    <div className={`mt-8 border-t border-gray-700 pt-8 ${className}`}>
      {/* معلومات الموقع والدولة */}
      <div className="country-footer-info mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPinIcon className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-300">ليبيا</span>
          </div>
          <div className="text-sm text-gray-400">قيد التطوير المستمر</div>
        </div>
      </div>

      {/* حقوق النشر */}
      <div className="text-center text-gray-300">
        <p>© {currentYear} سوق مزاد. جميع الحقوق محفوظة.</p>
      </div>
    </div>
  );
};

export default AppFooter;
