import { useState } from 'react';
import {
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

export default function AdScheduler({ value, onChange }) {
  const [schedule, setSchedule] = useState(value || {
    enabled: false,
    startDate: '',
    endDate: '',
    startTime: '00:00',
    endTime: '23:59',
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateSchedule = (key, val) => {
    const updated = { ...schedule, [key]: val };
    setSchedule(updated);
    onChange(updated);
  };

  const getTotalDays = () => {
    if (!schedule.startDate || !schedule.endDate) return 0;
    const start = new Date(schedule.startDate);
    const end = new Date(schedule.endDate);
    const diff = end.getTime() - start.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  const isDateValid = () => {
    if (!schedule.startDate || !schedule.endDate) return true;
    return new Date(schedule.startDate) <= new Date(schedule.endDate);
  };

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
      <div className="mb-4 flex items-center gap-3">
        <CalendarIcon className="h-5 w-5 text-amber-500" />
        <h3 className="font-bold text-white">جدولة العرض</h3>
      </div>

      <div className="space-y-4">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={schedule.enabled}
            onChange={(e) => updateSchedule('enabled', e.target.checked)}
            className="h-4 w-4 rounded border-slate-600"
          />
          <span className="text-sm text-slate-300">
            تفعيل الجدولة الزمنية
          </span>
        </label>

        {schedule.enabled && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs text-slate-400">
                  تاريخ البدء
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={schedule.startDate}
                    onChange={(e) => updateSchedule('startDate', e.target.value)}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 p-3 pr-10 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs text-slate-400">
                  تاريخ الانتهاء
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={schedule.endDate}
                    onChange={(e) => updateSchedule('endDate', e.target.value)}
                    min={schedule.startDate}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 p-3 pr-10 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {!isDateValid() && (
              <div className="flex items-center gap-2 rounded-lg bg-red-500/10 p-3">
                <XCircleIcon className="h-5 w-5 text-red-500" />
                <p className="text-sm text-red-400">
                  تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء
                </p>
              </div>
            )}

            {schedule.startDate && schedule.endDate && isDateValid() && (
              <div className="flex items-center gap-2 rounded-lg bg-green-500/10 p-3">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                <p className="text-sm text-green-400">
                  سيتم عرض الإعلان لمدة {getTotalDays()} يوم
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-amber-500 hover:text-amber-400"
            >
              {showAdvanced ? 'إخفاء' : 'عرض'} الإعدادات المتقدمة
            </button>

            {showAdvanced && (
              <div className="rounded-lg border border-slate-700 bg-slate-700/50 p-4">
                <h4 className="mb-3 text-sm font-bold text-white">
                  ساعات العرض اليومية
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs text-slate-400">
                      من الساعة
                    </label>
                    <div className="relative">
                      <ClockIcon className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="time"
                        value={schedule.startTime}
                        onChange={(e) => updateSchedule('startTime', e.target.value)}
                        className="w-full rounded-lg border border-slate-600 bg-slate-700 p-3 pr-10 text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs text-slate-400">
                      إلى الساعة
                    </label>
                    <div className="relative">
                      <ClockIcon className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="time"
                        value={schedule.endTime}
                        onChange={(e) => updateSchedule('endTime', e.target.value)}
                        className="w-full rounded-lg border border-slate-600 bg-slate-700 p-3 pr-10 text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-400">
                  سيتم عرض الإعلان فقط خلال الفترة من {schedule.startTime} إلى {schedule.endTime} يومياً
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
