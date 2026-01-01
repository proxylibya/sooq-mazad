import React, { useState, useEffect } from 'react';
import { ClockIcon, FireIcon } from '@heroicons/react/24/outline';

interface EnhancedCountdownProps {
  endTime: string | Date;
  onTimeUp?: () => void;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  urgent?: boolean;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

const EnhancedCountdown: React.FC<EnhancedCountdownProps> = ({
  endTime,
  onTimeUp,
  size = 'md',
  showIcon = true,
  urgent = false,
  className = '',
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
  });

  const [isUrgent, setIsUrgent] = useState(false);
  const [shouldPulse, setShouldPulse] = useState(false);

  const calculateTimeLeft = (): TimeLeft => {
    const now = new Date().getTime();
    const targetTime = new Date(endTime).getTime();
    const difference = targetTime - now;

    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        total: difference,
      };
    }

    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      // تحديد حالة الإلحاح (أقل من ساعة)
      const isNowUrgent = newTimeLeft.total > 0 && newTimeLeft.total <= 3600000; // ساعة واحدة
      setIsUrgent(isNowUrgent || urgent);

      // تأثير النبض عند الثواني الأخيرة
      if (newTimeLeft.total <= 60000 && newTimeLeft.total > 0) {
        // آخر دقيقة
        setShouldPulse(true);
      } else {
        setShouldPulse(false);
      }

      // استدعاء callback عند انتهاء الوقت
      if (newTimeLeft.total <= 0 && onTimeUp) {
        onTimeUp();
      }
    }, 1000);

    // حساب الوقت المتبقي فوراً
    const initialTimeLeft = calculateTimeLeft();
    setTimeLeft(initialTimeLeft);

    return () => clearInterval(timer);
  }, [endTime, onTimeUp, urgent]);

  // تحديد أحجام النص والمكونات
  const sizeClasses = {
    sm: {
      container: 'text-xs',
      number: 'text-sm font-bold',
      label: 'text-xs',
      icon: 'h-3 w-3',
    },
    md: {
      container: 'text-sm',
      number: 'text-lg font-bold',
      label: 'text-xs',
      icon: 'h-4 w-4',
    },
    lg: {
      container: 'text-base',
      number: 'text-2xl font-bold',
      label: 'text-sm',
      icon: 'h-5 w-5',
    },
  };

  const currentSize = sizeClasses[size];

  // تحديد الألوان بناءً على الحالة
  const getColorClasses = () => {
    if (timeLeft.total <= 0) {
      return 'text-gray-500 bg-gray-100';
    }

    if (isUrgent) {
      return shouldPulse
        ? 'text-red-600 bg-red-50 animate-pulse border-red-200'
        : 'text-red-600 bg-red-50 border-red-200';
    }

    if (timeLeft.total <= 86400000) {
      // أقل من يوم
      return 'text-orange-600 bg-orange-50 border-orange-200';
    }

    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  // تنسيق العرض
  const formatDisplay = () => {
    if (timeLeft.total <= 0) {
      return (
        <div className="flex items-center gap-1">
          {showIcon && <ClockIcon className={`${currentSize.icon} text-gray-400`} />}
          <span className="font-medium text-gray-500">انتهى المزاد</span>
        </div>
      );
    }

    const parts = [];

    if (timeLeft.days > 0) {
      parts.push(
        <div key="days" className="text-center">
          <div className={currentSize.number}>{timeLeft.days}</div>
          <div className={`${currentSize.label} text-gray-600`}>يوم</div>
        </div>,
      );
    }

    if (timeLeft.hours > 0 || timeLeft.days > 0) {
      parts.push(
        <div key="hours" className="text-center">
          <div className={currentSize.number}>{timeLeft.hours}</div>
          <div className={`${currentSize.label} text-gray-600`}>ساعة</div>
        </div>,
      );
    }

    parts.push(
      <div key="minutes" className="text-center">
        <div className={currentSize.number}>{timeLeft.minutes}</div>
        <div className={`${currentSize.label} text-gray-600`}>دقيقة</div>
      </div>,
    );

    // إظهار الثواني فقط في الحالات الملحة
    if (isUrgent) {
      parts.push(
        <div key="seconds" className="text-center">
          <div className={`${currentSize.number} ${shouldPulse ? 'animate-bounce' : ''}`}>
            {timeLeft.seconds}
          </div>
          <div className={`${currentSize.label} text-gray-600`}>ثانية</div>
        </div>,
      );
    }

    return (
      <div className="flex items-center gap-2">
        {showIcon && (
          <div className="flex items-center">
            {isUrgent ? (
              <FireIcon className={`${currentSize.icon} ${shouldPulse ? 'animate-pulse' : ''}`} />
            ) : (
              <ClockIcon className={currentSize.icon} />
            )}
          </div>
        )}
        <div className="flex items-center gap-3">{parts}</div>
      </div>
    );
  };

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 ${getColorClasses()} ${currentSize.container} ${className} transition-all duration-300`}
    >
      {formatDisplay()}
    </div>
  );
};

export default EnhancedCountdown;
