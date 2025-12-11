/**
 * مساعدات لإدارة عدد المركبات في المعارض
 * Vehicle count utilities for showrooms
 */

export interface VehicleCountOption {
  value: string;
  label: string;
  min?: number;
  max?: number;
}

// خيارات عدد المركبات المتاحة
export const vehicleCountOptions: VehicleCountOption[] = [
  { value: 'unspecified', label: 'بدون تحديد' },
  { value: '1-10', label: '1 - 10 مركبات', min: 1, max: 10 },
  { value: '11-25', label: '11 - 25 مركبة', min: 11, max: 25 },
  { value: '26-50', label: '26 - 50 مركبة', min: 26, max: 50 },
  { value: '51-100', label: '51 - 100 مركبة', min: 51, max: 100 },
  { value: '100+', label: 'أكثر من 100 مركبة', min: 101 },
];

/**
 * الحصول على تسمية عدد المركبات من القيمة
 * Get vehicle count label from value
 */
export const getVehicleCountLabel = (count: string): string => {
  const option = vehicleCountOptions.find((option) => option.value === count);
  return option ? option.label : count;
};

/**
 * التحقق من صحة عدد المركبات
 * Validate vehicle count against selected range
 */
export const validateVehicleCount = (actualCount: number, selectedRange: string): boolean => {
  if (selectedRange === 'unspecified') return true;

  const option = vehicleCountOptions.find((opt) => opt.value === selectedRange);
  if (!option) return false;

  if (option.min !== undefined && actualCount < option.min) return false;
  if (option.max !== undefined && actualCount > option.max) return false;

  return true;
};

/**
 * اقتراح نطاق مناسب بناءً على العدد الفعلي
 * Suggest appropriate range based on actual count
 */
export const suggestVehicleCountRange = (actualCount: number): string => {
  for (const option of vehicleCountOptions) {
    if (option.value === 'unspecified') continue;

    const { min = 0, max = Infinity } = option;
    if (actualCount >= min && actualCount <= max) {
      return option.value;
    }
  }

  return actualCount > 100 ? '100+' : 'unspecified';
};

/**
 * الحصول على لون مناسب لعدد المركبات
 * Get appropriate color for vehicle count display
 */
export const getVehicleCountColor = (count: string): string => {
  switch (count) {
    case 'unspecified':
      return 'text-gray-600 bg-gray-100';
    case '1-10':
      return 'text-blue-600 bg-blue-100';
    case '11-25':
      return 'text-green-600 bg-green-100';
    case '26-50':
      return 'text-yellow-600 bg-yellow-100';
    case '51-100':
      return 'text-orange-600 bg-orange-100';
    case '100+':
      return 'text-purple-600 bg-purple-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

/**
 * تحويل عدد المركبات إلى رقم للمقارنة
 * Convert vehicle count to number for comparison
 */
export const getVehicleCountNumber = (count: string): number => {
  const option = vehicleCountOptions.find((opt) => opt.value === count);
  if (!option) return 0;

  if (option.value === 'unspecified') return 0;
  if (option.value === '100+') return 101;

  return option.min || 0;
};
