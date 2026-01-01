import React, { useState, useEffect } from 'react';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import XCircleIcon from '@heroicons/react/24/outline/XCircleIcon';
import BellIcon from '@heroicons/react/24/outline/BellIcon';

interface PaymentCountdownTimerProps {
  deadline: Date;
  onTimeUp?: () => void;
  onWarning?: (minutesLeft: number) => void;
  showNotifications?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'warning' | 'danger';
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

const PaymentCountdownTimer: React.FC<PaymentCountdownTimerProps> = ({
  deadline,
  onTimeUp,
  onWarning,
  showNotifications = true,
  size = 'medium',
  variant = 'default',
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);
  const [hasWarned, setHasWarned] = useState(false);

  // حساب الوقت المتبقي
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const deadlineTime = new Date(deadline).getTime();
      const difference = deadlineTime - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        const totalSeconds = Math.floor(difference / 1000);

        setTimeLeft({ days, hours, minutes, seconds, totalSeconds });

        // تحذير عند بقاء ساعة واحدة
        if (totalSeconds <= 3600 && !hasWarned && onWarning) {
          setHasWarned(true);
          onWarning(minutes + hours * 60);
        }

        setIsExpired(false);
      } else {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          totalSeconds: 0,
        });
        if (!isExpired) {
          setIsExpired(true);
          if (onTimeUp) {
            onTimeUp();
          }
        }
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [deadline, onTimeUp, onWarning, hasWarned, isExpired]);

  // تحديد نوع التحذير بناءً على الوقت المتبقي
  const getVariant = () => {
    if (isExpired) return 'danger';
    if (timeLeft.totalSeconds <= 3600) return 'warning'; // أقل من ساعة
    if (timeLeft.totalSeconds <= 7200) return 'warning'; // أقل من ساعتين
    return variant;
  };

  // تحديد الألوان بناءً على النوع
  const getColors = () => {
    const currentVariant = getVariant();
    switch (currentVariant) {
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          accent: 'text-yellow-600',
          icon: 'text-yellow-600',
        };
      case 'danger':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          accent: 'text-red-600',
          icon: 'text-red-600',
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          accent: 'text-blue-600',
          icon: 'text-blue-600',
        };
    }
  };

  // تحديد حجم المكون
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'p-3',
          title: 'text-sm',
          time: 'text-lg',
          icon: 'h-4 w-4',
        };
      case 'large':
        return {
          container: 'p-6',
          title: 'text-xl',
          time: 'text-3xl',
          icon: 'h-8 w-8',
        };
      default:
        return {
          container: 'p-4',
          title: 'text-base',
          time: 'text-2xl',
          icon: 'h-6 w-6',
        };
    }
  };

  const colors = getColors();
  const sizeClasses = getSizeClasses();

  // تنسيق عرض الوقت
  const formatTime = (value: number) => value.toString().padStart(2, '0');

  // رسالة الحالة
  const getStatusMessage = () => {
    if (isExpired) {
      return 'انتهت مهلة تأكيد الدفع';
    }
    if (timeLeft.totalSeconds <= 1800) {
      // أقل من 30 دقيقة
      return 'مهلة قصيرة جداً - يرجى الإسراع!';
    }
    if (timeLeft.totalSeconds <= 3600) {
      // أقل من ساعة
      return 'مهلة قصيرة - يرجى تأكيد الدفع قريباً';
    }
    return 'الوقت المتبقي لتأكيد الدفع';
  };

  // أيقونة الحالة
  const getStatusIcon = () => {
    if (isExpired) {
      return <XCircleIcon className={`${sizeClasses.icon} ${colors.icon}`} />;
    }
    if (timeLeft.totalSeconds <= 3600) {
      return <ExclamationTriangleIcon className={`${sizeClasses.icon} ${colors.icon}`} />;
    }
    return <ClockIcon className={`${sizeClasses.icon} ${colors.icon}`} />;
  };

  return (
    <div className={`rounded-lg ${colors.bg} ${colors.border} border ${sizeClasses.container}`}>
      {/* رأس المؤقت */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center">
          {getStatusIcon()}
          <span className={`font-semibold ${colors.text} ${sizeClasses.title} mr-2`}>
            {getStatusMessage()}
          </span>
        </div>

        {showNotifications && timeLeft.totalSeconds <= 3600 && !isExpired && (
          <BellIcon className={`h-5 w-5 ${colors.icon} animate-pulse`} />
        )}
      </div>

      {/* عرض الوقت */}
      {!isExpired ? (
        <div className="flex items-center justify-center gap-2" dir="ltr">
          {timeLeft.days > 0 && (
            <>
              <div className="text-center">
                <div className={`font-mono font-bold ${colors.accent} ${sizeClasses.time}`}>
                  {formatTime(timeLeft.days)}
                </div>
                <div className={`text-xs ${colors.text}`}>يوم</div>
              </div>
              <span className={`${colors.accent} ${sizeClasses.time}`}>:</span>
            </>
          )}

          <div className="text-center">
            <div className={`font-mono font-bold ${colors.accent} ${sizeClasses.time}`}>
              {formatTime(timeLeft.hours)}
            </div>
            <div className={`text-xs ${colors.text}`}>ساعة</div>
          </div>

          <span className={`${colors.accent} ${sizeClasses.time}`}>:</span>

          <div className="text-center">
            <div className={`font-mono font-bold ${colors.accent} ${sizeClasses.time}`}>
              {formatTime(timeLeft.minutes)}
            </div>
            <div className={`text-xs ${colors.text}`}>دقيقة</div>
          </div>

          <span className={`${colors.accent} ${sizeClasses.time}`}>:</span>

          <div className="text-center">
            <div className={`font-mono font-bold ${colors.accent} ${sizeClasses.time}`}>
              {formatTime(timeLeft.seconds)}
            </div>
            <div className={`text-xs ${colors.text}`}>ثانية</div>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div className={`font-bold ${colors.accent} ${sizeClasses.time}`}>00:00:00</div>
          <div className={`text-sm ${colors.text} mt-2`}>
            يرجى التواصل مع المشتري لتأكيد حالة الدفع
          </div>
        </div>
      )}

      {/* شريط التقدم */}
      {!isExpired && (
        <div className="mt-4">
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className={`h-2 rounded-full transition-all duration-1000 ${
                timeLeft.totalSeconds <= 3600
                  ? 'bg-red-500'
                  : timeLeft.totalSeconds <= 7200
                    ? 'bg-yellow-500'
                    : 'bg-blue-500'
              }`}
              style={{
                width: `${Math.max(0, Math.min(100, (timeLeft.totalSeconds / (24 * 60 * 60)) * 100))}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentCountdownTimer;
