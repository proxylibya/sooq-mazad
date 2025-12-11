/**
 * مكون اختيار مدة المزاد الموحد
 * Unified Auction Duration Selector Component
 *
 * يدعم:
 * - أوقات جاهزة للاختيار السريع
 * - إدخال يدوي مخصص (رقم + وحدة)
 * - سمتان: light للويب / dark للوحة التحكم
 */

import {
  CalendarDaysIcon,
  CheckIcon,
  ClockIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import { useCallback, useEffect, useState } from 'react';

// أنواع الوحدات الزمنية
export type TimeUnit = 'minutes' | 'hours' | 'days';

// خيار مدة جاهز
export interface DurationPreset {
  id: string;
  label: string;
  description: string;
  value: number; // بالدقائق
  unit: TimeUnit;
  displayValue: number;
}

// قيمة المدة المختارة
export interface DurationValue {
  type: 'preset' | 'custom';
  presetId?: string;
  customValue?: number;
  customUnit?: TimeUnit;
  totalMinutes: number;
}

// خصائص المكون
export interface AuctionDurationSelectorProps {
  value: DurationValue;
  onChange: (value: DurationValue) => void;
  theme?: 'light' | 'dark';
  presets?: DurationPreset[];
  minMinutes?: number;
  maxMinutes?: number;
  showCustomInput?: boolean;
  label?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

// الخيارات الجاهزة الافتراضية
export const DEFAULT_DURATION_PRESETS: DurationPreset[] = [
  {
    id: '1_hour',
    label: '1 ساعة',
    description: '60 دقيقة',
    value: 60,
    unit: 'hours',
    displayValue: 1,
  },
  {
    id: '3_hours',
    label: '3 ساعات',
    description: '180 دقيقة',
    value: 180,
    unit: 'hours',
    displayValue: 3,
  },
  {
    id: '6_hours',
    label: '6 ساعات',
    description: '360 دقيقة',
    value: 360,
    unit: 'hours',
    displayValue: 6,
  },
  {
    id: '12_hours',
    label: '12 ساعة',
    description: 'نصف يوم',
    value: 720,
    unit: 'hours',
    displayValue: 12,
  },
  {
    id: '1_day',
    label: '1 يوم',
    description: '24 ساعة',
    value: 1440,
    unit: 'days',
    displayValue: 1,
  },
  {
    id: '3_days',
    label: '3 أيام',
    description: '72 ساعة',
    value: 4320,
    unit: 'days',
    displayValue: 3,
  },
  {
    id: '7_days',
    label: '7 أيام',
    description: 'أسبوع',
    value: 10080,
    unit: 'days',
    displayValue: 7,
  },
  {
    id: '14_days',
    label: '14 يوم',
    description: 'أسبوعان',
    value: 20160,
    unit: 'days',
    displayValue: 14,
  },
  {
    id: '30_days',
    label: '30 يوم',
    description: 'شهر',
    value: 43200,
    unit: 'days',
    displayValue: 30,
  },
];

// وحدات الوقت للإدخال اليدوي
const TIME_UNITS: { value: TimeUnit; label: string; multiplier: number }[] = [
  { value: 'minutes', label: 'دقيقة', multiplier: 1 },
  { value: 'hours', label: 'ساعة', multiplier: 60 },
  { value: 'days', label: 'يوم', multiplier: 1440 },
];

// دالة مساعدة لتحويل الدقائق لعرض مقروء
export function formatDuration(totalMinutes: number): string {
  if (totalMinutes < 60) {
    return `${totalMinutes} دقيقة`;
  } else if (totalMinutes < 1440) {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return mins > 0 ? `${hours} ساعة و ${mins} دقيقة` : `${hours} ساعة`;
  } else {
    const days = Math.floor(totalMinutes / 1440);
    const remainingHours = Math.floor((totalMinutes % 1440) / 60);
    return remainingHours > 0 ? `${days} يوم و ${remainingHours} ساعة` : `${days} يوم`;
  }
}

// القيمة الافتراضية
export const DEFAULT_DURATION_VALUE: DurationValue = {
  type: 'preset',
  presetId: '7_days',
  totalMinutes: 10080,
};

export default function AuctionDurationSelector({
  value,
  onChange,
  theme = 'light',
  presets = DEFAULT_DURATION_PRESETS,
  minMinutes = 60, // الحد الأدنى: ساعة
  maxMinutes = 43200, // الحد الأقصى: 30 يوم
  showCustomInput = true,
  label = 'مدة المزاد',
  required = false,
  error,
  disabled = false,
}: AuctionDurationSelectorProps) {
  const [isCustomMode, setIsCustomMode] = useState(value.type === 'custom');
  const [customNumber, setCustomNumber] = useState<number>(value.customValue || 1);
  const [customUnit, setCustomUnit] = useState<TimeUnit>(value.customUnit || 'days');
  const [customError, setCustomError] = useState<string>('');

  // تصنيفات الستايل حسب السمة
  const isDark = theme === 'dark';

  const styles = {
    container: isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200',
    label: isDark ? 'text-slate-300' : 'text-gray-700',
    presetCard: {
      base: isDark
        ? 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
        : 'border-gray-200 bg-gray-50 hover:border-gray-300',
      selected: isDark
        ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/30'
        : 'border-blue-500 bg-blue-50 ring-2 ring-blue-200',
    },
    presetText: {
      title: isDark ? 'text-white' : 'text-gray-900',
      desc: isDark ? 'text-slate-400' : 'text-gray-500',
    },
    customToggle: {
      base: isDark
        ? 'border-slate-600 bg-slate-700 text-slate-300 hover:border-slate-500'
        : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300',
      active: isDark
        ? 'border-purple-500 bg-purple-500/10 text-purple-400'
        : 'border-purple-500 bg-purple-50 text-purple-600',
    },
    input: isDark
      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/30'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-200',
    select: isDark
      ? 'bg-slate-700 border-slate-600 text-white focus:border-blue-500'
      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500',
    error: 'text-red-500 text-sm mt-1',
    summary: isDark
      ? 'bg-slate-700/50 border-slate-600 text-slate-300'
      : 'bg-gray-50 border-gray-200 text-gray-600',
    summaryValue: isDark ? 'text-blue-400' : 'text-blue-600',
  };

  // حساب الدقائق الإجمالية للإدخال المخصص
  const calculateCustomMinutes = useCallback((num: number, unit: TimeUnit): number => {
    const unitConfig = TIME_UNITS.find((u) => u.value === unit);
    return num * (unitConfig?.multiplier || 1);
  }, []);

  // التحقق من صحة الإدخال المخصص
  const validateCustomInput = useCallback(
    (num: number, unit: TimeUnit): string => {
      const totalMinutes = calculateCustomMinutes(num, unit);

      if (num <= 0) {
        return 'يجب أن تكون القيمة أكبر من صفر';
      }
      if (totalMinutes < minMinutes) {
        return `الحد الأدنى للمدة هو ${formatDuration(minMinutes)}`;
      }
      if (totalMinutes > maxMinutes) {
        return `الحد الأقصى للمدة هو ${formatDuration(maxMinutes)}`;
      }
      return '';
    },
    [calculateCustomMinutes, minMinutes, maxMinutes],
  );

  // التحقق من صحة الإدخال المخصص
  useEffect(() => {
    if (isCustomMode) {
      const validationError = validateCustomInput(customNumber, customUnit);
      setCustomError(validationError);
    }
  }, [isCustomMode, customNumber, customUnit, validateCustomInput]);

  // اختيار خيار جاهز
  const handlePresetSelect = (preset: DurationPreset) => {
    if (disabled) return;
    setIsCustomMode(false);
    setCustomError('');
    onChange({
      type: 'preset',
      presetId: preset.id,
      totalMinutes: preset.value,
    });
  };

  // تفعيل الوضع المخصص
  const handleCustomModeToggle = () => {
    if (disabled) return;
    setIsCustomMode(true);
    const totalMinutes = calculateCustomMinutes(customNumber, customUnit);
    onChange({
      type: 'custom',
      customValue: customNumber,
      customUnit: customUnit,
      totalMinutes,
    });
  };

  const handleCustomNumberChange = (newNumber: number) => {
    setCustomNumber(newNumber);
    const validationError = validateCustomInput(newNumber, customUnit);
    if (!validationError) {
      const totalMinutes = calculateCustomMinutes(newNumber, customUnit);
      onChange({
        type: 'custom',
        customValue: newNumber,
        customUnit: customUnit,
        totalMinutes,
      });
    }
  };

  const handleCustomUnitChange = (newUnit: TimeUnit) => {
    setCustomUnit(newUnit);
    const validationError = validateCustomInput(customNumber, newUnit);
    if (!validationError) {
      const totalMinutes = calculateCustomMinutes(customNumber, newUnit);
      onChange({
        type: 'custom',
        customValue: customNumber,
        customUnit: newUnit,
        totalMinutes,
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* العنوان */}
      <div className="flex items-center gap-2">
        <CalendarDaysIcon className={`h-5 w-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
        <label className={`text-sm font-medium ${styles.label}`}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      </div>

      {/* الخيارات الجاهزة */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {presets.map((preset) => {
          const isSelected = !isCustomMode && value.presetId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              disabled={disabled}
              onClick={() => handlePresetSelect(preset)}
              className={`relative flex flex-col items-center justify-center gap-1 rounded-lg border-2 p-3 transition-all ${isSelected ? styles.presetCard.selected : styles.presetCard.base} ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} `}
            >
              {isSelected && (
                <div className="absolute -right-1 -top-1">
                  <CheckIcon className="h-4 w-4 rounded-full bg-blue-500 p-0.5 text-white" />
                </div>
              )}
              <span className={`text-sm font-semibold ${styles.presetText.title}`}>
                {preset.label}
              </span>
              <span className={`text-xs ${styles.presetText.desc}`}>{preset.description}</span>
            </button>
          );
        })}
      </div>

      {/* زر الإدخال المخصص */}
      {showCustomInput && (
        <div className="space-y-3">
          <button
            type="button"
            disabled={disabled}
            onClick={handleCustomModeToggle}
            className={`flex w-full items-center justify-center gap-2 rounded-lg border-2 p-3 transition-all ${isCustomMode ? styles.customToggle.active : styles.customToggle.base} ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} `}
          >
            <PencilSquareIcon className="h-5 w-5" />
            <span className="font-medium">مدة مخصصة</span>
          </button>

          {/* حقول الإدخال المخصص */}
          {isCustomMode && (
            <div
              className="flex items-start gap-3 rounded-lg border p-4 transition-all"
              style={{
                backgroundColor: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(249, 250, 251, 1)',
                borderColor: isDark ? 'rgb(71, 85, 105)' : 'rgb(229, 231, 235)',
              }}
            >
              {/* حقل الرقم */}
              <div className="flex-1">
                <label className={`mb-1 block text-xs font-medium ${styles.label}`}>القيمة</label>
                <input
                  type="number"
                  min="1"
                  max="999"
                  value={customNumber}
                  onChange={(e) => handleCustomNumberChange(parseInt(e.target.value) || 1)}
                  disabled={disabled}
                  className={`w-full rounded-lg border px-3 py-2 text-center text-lg font-semibold focus:outline-none focus:ring-2 ${styles.input}`}
                />
              </div>

              {/* حقل الوحدة */}
              <div className="flex-1">
                <label className={`mb-1 block text-xs font-medium ${styles.label}`}>الوحدة</label>
                <select
                  value={customUnit}
                  onChange={(e) => handleCustomUnitChange(e.target.value as TimeUnit)}
                  disabled={disabled}
                  className={`w-full rounded-lg border px-3 py-2.5 focus:outline-none focus:ring-2 ${styles.select}`}
                >
                  {TIME_UNITS.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* رسالة خطأ الإدخال المخصص */}
          {isCustomMode && customError && <p className={styles.error}>{customError}</p>}
        </div>
      )}

      {/* ملخص المدة المختارة */}
      <div className={`flex items-center gap-2 rounded-lg border p-3 ${styles.summary}`}>
        <ClockIcon className={`h-5 w-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
        <span>المدة المختارة:</span>
        <span className={`font-semibold ${styles.summaryValue}`}>
          {formatDuration(value.totalMinutes)}
        </span>
      </div>

      {/* رسالة الخطأ الخارجية */}
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
