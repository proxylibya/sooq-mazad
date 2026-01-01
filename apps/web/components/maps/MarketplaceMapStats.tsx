import ChartBarIcon from '@heroicons/react/24/outline/ChartBarIcon';
import CurrencyDollarIcon from '@heroicons/react/24/outline/CurrencyDollarIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import TruckIcon from '@heroicons/react/24/outline/TruckIcon';
import React from 'react';
import { formatPrice } from '../../utils/formatters';

interface MapStats {
  totalCars: number;
  avgPrice: number;
  priceRange: [number, number];
  popularBrands: Array<{
    brand: string;
    count: number;
  }>;
  citiesDistribution: Array<{
    city: string;
    count: number;
  }>;
}

interface MarketplaceMapStatsProps {
  stats: MapStats;
}

const MarketplaceMapStats: React.FC<MarketplaceMapStatsProps> = ({ stats }) => {
  return (
    <div className="w-80 overflow-hidden rounded-xl bg-white shadow-2xl">
      {/* العنوان */}
      <div className="border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3">
        <h3 className="flex items-center gap-2 text-lg font-bold text-white">
          <ChartBarIcon className="h-6 w-6" />
          إحصائيات السوق
        </h3>
      </div>

      <div className="p-4">
        {/* إجمالي السيارات */}
        <div className="mb-4 rounded-lg bg-blue-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">إجمالي السيارات</p>
              <p className="text-3xl font-bold text-blue-600">{stats.totalCars}</p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <TruckIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* متوسط السعر */}
        <div className="mb-4 rounded-lg bg-green-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">متوسط السعر</p>
              <p className="text-xl font-bold text-green-600">
                {formatPrice(Math.round(stats.avgPrice))} د.ل
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* نطاق الأسعار */}
        {stats.totalCars > 0 && (
          <div className="mb-4 rounded-lg border border-gray-200 p-4">
            <h4 className="mb-2 text-sm font-bold text-gray-700">نطاق الأسعار</h4>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <p className="text-xs text-gray-500">الأدنى</p>
                <p className="font-bold text-gray-900">{formatPrice(stats.priceRange[0])}</p>
              </div>
              <div className="h-px flex-1 bg-gray-300"></div>
              <div className="text-center">
                <p className="text-xs text-gray-500">الأعلى</p>
                <p className="font-bold text-gray-900">{formatPrice(stats.priceRange[1])}</p>
              </div>
            </div>
          </div>
        )}

        {/* الماركات الشائعة */}
        {stats.popularBrands.length > 0 && (
          <div className="mb-4">
            <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-700">
              <TruckIcon className="h-4 w-4" />
              الماركات الأكثر انتشاراً
            </h4>
            <div className="space-y-2">
              {stats.popularBrands.map((item, index) => (
                <div
                  key={item.brand}
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold leading-none text-blue-600">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{item.brand}</span>
                  </div>
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-bold text-blue-600">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* توزيع المدن */}
        {stats.citiesDistribution.length > 0 && (
          <div>
            <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-700">
              <MapPinIcon className="h-4 w-4" />
              المدن الأكثر عرضاً
            </h4>
            <div className="space-y-2">
              {stats.citiesDistribution.map((item, index) => (
                <div
                  key={item.city}
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs font-bold leading-none text-green-600">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{item.city}</span>
                  </div>
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-600">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketplaceMapStats;
