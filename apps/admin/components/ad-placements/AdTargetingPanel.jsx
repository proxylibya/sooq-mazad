import { useState } from 'react';
import {
  MapPinIcon,
  ClockIcon,
  UserGroupIcon,
  DevicePhoneMobileIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';

const LIBYAN_CITIES = [
  'طرابلس', 'بنغازي', 'مصراتة', 'الزاوية', 'بيدا', 'صبراتة', 'الخمس', 'زليتن',
  'زوارة', 'طبرق', 'درنة', 'سبها', 'غريان', 'يفرن', 'ترهونة', 'صرمان'
];

const DAYS_OF_WEEK = [
  { value: 'MON', label: 'الاثنين' },
  { value: 'TUE', label: 'الثلاثاء' },
  { value: 'WED', label: 'الأربعاء' },
  { value: 'THU', label: 'الخميس' },
  { value: 'FRI', label: 'الجمعة' },
  { value: 'SAT', label: 'السبت' },
  { value: 'SUN', label: 'الأحد' },
];

export default function AdTargetingPanel({ value, onChange }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [targeting, setTargeting] = useState(value || {
    targetCities: [],
    excludeCities: [],
    targetDays: [],
    targetHours: null,
    targetUserTypes: [],
    targetRoles: [],
    deviceTypes: [],
    minPreviousVisits: null,
  });

  const updateTargeting = (key, val) => {
    const updated = { ...targeting, [key]: val };
    setTargeting(updated);
    onChange(updated);
  };

  const toggleCity = (city, isExclude = false) => {
    const key = isExclude ? 'excludeCities' : 'targetCities';
    const current = targeting[key] || [];
    const updated = current.includes(city)
      ? current.filter(c => c !== city)
      : [...current, city];
    updateTargeting(key, updated);
  };

  const toggleDay = (day) => {
    const current = targeting.targetDays || [];
    const updated = current.includes(day)
      ? current.filter(d => d !== day)
      : [...current, day];
    updateTargeting('targetDays', updated);
  };

  const toggleUserType = (type) => {
    const current = targeting.targetUserTypes || [];
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    updateTargeting('targetUserTypes', updated);
  };

  const toggleDevice = (device) => {
    const current = targeting.deviceTypes || [];
    const updated = current.includes(device)
      ? current.filter(d => d !== device)
      : [...current, device];
    updateTargeting('deviceTypes', updated);
  };

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800/50">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between p-4 text-right hover:bg-slate-700/30"
      >
        <div className="flex items-center gap-3">
          <UserGroupIcon className="h-5 w-5 text-amber-500" />
          <h3 className="font-bold text-white">إعدادات الاستهداف (اختياري)</h3>
        </div>
        {isExpanded ? (
          <ChevronUpIcon className="h-5 w-5 text-slate-400" />
        ) : (
          <ChevronDownIcon className="h-5 w-5 text-slate-400" />
        )}
      </button>

      {isExpanded && (
        <div className="space-y-6 border-t border-slate-700 p-4">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <MapPinIcon className="h-5 w-5 text-slate-400" />
              <h4 className="text-sm font-bold text-white">الاستهداف الجغرافي</h4>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-2 block text-xs text-slate-400">المدن المستهدفة</label>
                <div className="flex flex-wrap gap-2">
                  {LIBYAN_CITIES.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => toggleCity(city)}
                      className={`rounded-full px-3 py-1 text-xs ${
                        targeting.targetCities?.includes(city)
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-slate-400" />
              <h4 className="text-sm font-bold text-white">الاستهداف الزمني</h4>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-2 block text-xs text-slate-400">أيام الأسبوع</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className={`rounded-lg px-3 py-2 text-xs ${
                        targeting.targetDays?.includes(day.value)
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs text-slate-400">من الساعة</label>
                  <input
                    type="time"
                    value={targeting.targetHours?.start || ''}
                    onChange={(e) =>
                      updateTargeting('targetHours', {
                        ...targeting.targetHours,
                        start: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 p-2 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs text-slate-400">إلى الساعة</label>
                  <input
                    type="time"
                    value={targeting.targetHours?.end || ''}
                    onChange={(e) =>
                      updateTargeting('targetHours', {
                        ...targeting.targetHours,
                        end: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 p-2 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2">
              <DevicePhoneMobileIcon className="h-5 w-5 text-slate-400" />
              <h4 className="text-sm font-bold text-white">نوع الجهاز</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {['desktop', 'mobile', 'tablet'].map((device) => (
                <button
                  key={device}
                  type="button"
                  onClick={() => toggleDevice(device)}
                  className={`rounded-lg px-4 py-2 text-xs ${
                    targeting.deviceTypes?.includes(device)
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {device === 'desktop' ? 'ديسكتوب' : device === 'mobile' ? 'موبايل' : 'تابلت'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2">
              <UserGroupIcon className="h-5 w-5 text-slate-400" />
              <h4 className="text-sm font-bold text-white">نوع المستخدم</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {['BUYER', 'SELLER', 'DEALER', 'VISITOR'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleUserType(type)}
                  className={`rounded-lg px-4 py-2 text-xs ${
                    targeting.targetUserTypes?.includes(type)
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {type === 'BUYER' ? 'مشتري' : type === 'SELLER' ? 'بائع' : type === 'DEALER' ? 'معرض' : 'زائر'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs text-slate-400">
              الحد الأدنى للزيارات السابقة
            </label>
            <input
              type="number"
              min="0"
              value={targeting.minPreviousVisits || ''}
              onChange={(e) => updateTargeting('minPreviousVisits', parseInt(e.target.value) || null)}
              placeholder="مثال: 5"
              className="w-full rounded-lg border border-slate-600 bg-slate-700 p-3 text-white focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
