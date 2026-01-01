import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPageNumbers?: boolean;
  maxVisiblePages?: number;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  disabled?: boolean;
  showFirstLast?: boolean;
  showInfo?: boolean;
  totalItems?: number;
  itemsPerPage?: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showPageNumbers = true,
  maxVisiblePages = 5,
  size = 'medium',
  className = '',
  disabled = false,
  showFirstLast = true,
  showInfo = false,
  totalItems,
  itemsPerPage,
}) => {
  // التأكد من صحة القيم
  const safeTotalPages = Math.max(1, totalPages);
  const safeCurrentPage = Math.max(1, Math.min(currentPage, safeTotalPages));

  // حساب الصفحات المرئية
  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, safeCurrentPage - halfVisible);
    const endPage = Math.min(safeTotalPages, startPage + maxVisiblePages - 1);

    // تعديل البداية إذا كانت النهاية أقل من المطلوب
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // إضافة نقاط في البداية
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('...');
      }
    }

    // إضافة الصفحات المرئية
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // إضافة نقاط في النهاية
    if (endPage < safeTotalPages) {
      if (endPage < safeTotalPages - 1) {
        pages.push('...');
      }
      pages.push(safeTotalPages);
    }

    return pages;
  };

  // أحجام الأزرار
  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    medium: 'px-3 py-2 text-sm',
    large: 'px-4 py-3 text-base',
  };

  // أحجام الأيقونات
  const iconSizes = {
    small: 'h-3 w-3',
    medium: 'h-4 w-4',
    large: 'h-5 w-5',
  };

  const handlePageChange = (page: number) => {
    if (disabled || page === safeCurrentPage || page < 1 || page > safeTotalPages) {
      return;
    }
    onPageChange(page);
  };

  // إذا كان هناك صفحة واحدة فقط، لا نعرض الترقيم
  if (safeTotalPages <= 1) {
    return null;
  }

  const visiblePages = getVisiblePages();

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* معلومات الترقيم */}
      {showInfo && totalItems && itemsPerPage && (
        <div className="text-sm text-gray-600">
          عرض {Math.min((safeCurrentPage - 1) * itemsPerPage + 1, totalItems)} -{' '}
          {Math.min(safeCurrentPage * itemsPerPage, totalItems)} من أصل {totalItems} عنصر
        </div>
      )}

      {/* أزرار الترقيم */}
      <nav className="flex items-center gap-1" aria-label="Pagination">
        {/* زر الأول */}
        {showFirstLast && safeCurrentPage > 1 && (
          <button
            onClick={() => handlePageChange(1)}
            disabled={disabled}
            className={` ${sizeClasses[size]} flex items-center gap-1 rounded-lg border border-gray-300 bg-white text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-300 disabled:hover:bg-white`}
            aria-label="الصفحة الأولى"
          >
            <ChevronRightIcon className={iconSizes[size]} />
            <ChevronRightIcon className={`${iconSizes[size]} -mr-1`} />
          </button>
        )}

        {/* زر السابق */}
        <button
          onClick={() => handlePageChange(safeCurrentPage - 1)}
          disabled={disabled || safeCurrentPage <= 1}
          className={` ${sizeClasses[size]} flex items-center gap-1 rounded-lg border border-gray-300 bg-white text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-300 disabled:hover:bg-white`}
          aria-label="الصفحة السابقة"
        >
          <ChevronRightIcon className={iconSizes[size]} />
          <span>السابق</span>
        </button>

        {/* أرقام الصفحات */}
        {showPageNumbers && (
          <div className="flex items-center gap-1">
            {visiblePages.map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className={`${sizeClasses[size]} text-gray-400`}>...</span>
                ) : (
                  <button
                    onClick={() => handlePageChange(page as number)}
                    disabled={disabled}
                    className={` ${sizeClasses[size]} min-w-[2.5rem] rounded-lg border transition-colors ${
                      page === safeCurrentPage
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                    aria-label={`الصفحة ${page}`}
                    aria-current={page === safeCurrentPage ? 'page' : undefined}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* زر التالي */}
        <button
          onClick={() => handlePageChange(safeCurrentPage + 1)}
          disabled={disabled || safeCurrentPage >= safeTotalPages}
          className={` ${sizeClasses[size]} flex items-center gap-1 rounded-lg border border-gray-300 bg-white text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-300 disabled:hover:bg-white`}
          aria-label="الصفحة التالية"
        >
          <span>التالي</span>
          <ChevronLeftIcon className={iconSizes[size]} />
        </button>

        {/* زر الأخير */}
        {showFirstLast && safeCurrentPage < safeTotalPages && (
          <button
            onClick={() => handlePageChange(safeTotalPages)}
            disabled={disabled}
            className={` ${sizeClasses[size]} flex items-center gap-1 rounded-lg border border-gray-300 bg-white text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-300 disabled:hover:bg-white`}
            aria-label="الصفحة الأخيرة"
          >
            <ChevronLeftIcon className={`${iconSizes[size]} -ml-1`} />
            <ChevronLeftIcon className={iconSizes[size]} />
          </button>
        )}
      </nav>
    </div>
  );
};

export default Pagination;
