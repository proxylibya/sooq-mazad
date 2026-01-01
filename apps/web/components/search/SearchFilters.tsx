import { FunnelIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

/**
 * مكون فلاتر البحث الموحد
 */

interface SearchFiltersProps {
  filters: Record<string, any>;
  onChange: (filters: Record<string, any>) => void;
  type?: string;
}

export default function SearchFilters({ filters, onChange, type = 'all' }: SearchFiltersProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onChange(newFilters);
  };

  const clearFilters = () => {
    setLocalFilters({});
    onChange({});
  };

  const activeFiltersCount = Object.values(localFilters).filter(
    (v) => v !== undefined && v !== '',
  ).length;

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      {/* رأس الفلاتر */}
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <FunnelIcon className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">الفلاتر</h3>
          {activeFiltersCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
              {activeFiltersCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <button onClick={clearFilters} className="text-sm text-blue-600 hover:text-blue-800">
              مسح الكل
            </button>
          )}
          <button onClick={() => setIsOpen(!isOpen)} className="rounded p-1 hover:bg-gray-100">
            <svg
              className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* محتوى الفلاتر */}
      {isOpen && (
        <div className="space-y-4 p-4">
          {/* نوع القسم */}
          {type === 'all' && (
            <FilterSection label="نوع النتيجة">
              <select
                value={filters.type || ''}
                onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">الكل</option>
                <option value="cars">سيارات</option>
                <option value="auctions">مزادات</option>
                <option value="showrooms">معارض</option>
                <option value="transport">نقل</option>
              </select>
            </FilterSection>
          )}

          {/* الماركة */}
          {(type === 'all' || type === 'cars' || type === 'auctions') && (
            <FilterSection label="الماركة">
              <input
                type="text"
                value={filters.brand || ''}
                onChange={(e) => handleFilterChange('brand', e.target.value || undefined)}
                placeholder="تويوتا، هوندا..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </FilterSection>
          )}

          {/* الموديل */}
          {(type === 'all' || type === 'cars' || type === 'auctions') && (
            <FilterSection label="الموديل">
              <input
                type="text"
                value={filters.model || ''}
                onChange={(e) => handleFilterChange('model', e.target.value || undefined)}
                placeholder="كامري، كورولا..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </FilterSection>
          )}

          {/* المدينة */}
          <FilterSection label="المدينة">
            <input
              type="text"
              value={filters.city || ''}
              onChange={(e) => handleFilterChange('city', e.target.value || undefined)}
              placeholder="طرابلس، بنغازي..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </FilterSection>

          {/* السعر */}
          {(type === 'all' || type === 'cars' || type === 'auctions') && (
            <FilterSection label="السعر (د.ل)">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={filters.minPrice || ''}
                  onChange={(e) =>
                    handleFilterChange(
                      'minPrice',
                      e.target.value ? parseFloat(e.target.value) : undefined,
                    )
                  }
                  placeholder="من"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
                <input
                  type="number"
                  value={filters.maxPrice || ''}
                  onChange={(e) =>
                    handleFilterChange(
                      'maxPrice',
                      e.target.value ? parseFloat(e.target.value) : undefined,
                    )
                  }
                  placeholder="إلى"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </FilterSection>
          )}

          {/* السنة */}
          {(type === 'all' || type === 'cars' || type === 'auctions') && (
            <FilterSection label="سنة الصنع">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={filters.yearFrom || ''}
                  onChange={(e) =>
                    handleFilterChange(
                      'yearFrom',
                      e.target.value ? parseInt(e.target.value) : undefined,
                    )
                  }
                  placeholder="من"
                  min="1950"
                  max={new Date().getFullYear() + 1}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
                <input
                  type="number"
                  value={filters.yearTo || ''}
                  onChange={(e) =>
                    handleFilterChange(
                      'yearTo',
                      e.target.value ? parseInt(e.target.value) : undefined,
                    )
                  }
                  placeholder="إلى"
                  min="1950"
                  max={new Date().getFullYear() + 1}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </FilterSection>
          )}

          {/* الحالة */}
          {(type === 'all' || type === 'cars') && (
            <FilterSection label="حالة السيارة">
              <select
                value={filters.condition || ''}
                onChange={(e) => handleFilterChange('condition', e.target.value || undefined)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">الكل</option>
                <option value="NEW">جديد</option>
                <option value="USED">مستعمل</option>
              </select>
            </FilterSection>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * مكون قسم فلتر واحد
 */
function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}
