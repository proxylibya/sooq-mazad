/**
 * Auction Timer Component
 * مكون عداد وقت المزاد
 */

import React, { useMemo } from 'react';
import { ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { formatTimeRemaining, formatDateTime } from '../../utils/formatters';

interface AuctionTimerProps {
  endTime: number;
  status: 'UPCOMING' | 'LIVE' | 'ENDING_SOON' | 'ENDED' | 'CANCELLED' | 'SUSPENDED';
  isEndingSoon: boolean;
  timeRemaining: number;
}

const AuctionTimer: React.FC<AuctionTimerProps> = ({
  endTime,
  status,
  isEndingSoon,
  timeRemaining,
}) => {
  // Calculate time components
  const timeComponents = useMemo(() => {
    if (timeRemaining <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const totalSeconds = Math.floor(timeRemaining / 1000);
    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = totalSeconds % 60;

    return { days, hours, minutes, seconds };
  }, [timeRemaining]);

  // Status styling
  const getStatusStyles = () => {
    switch (status) {
      case 'UPCOMING':
        return {
          container: 'bg-blue-50 border-blue-200',
          text: 'text-blue-800',
          accent: 'text-blue-600',
          badge: 'bg-blue-100 text-blue-800',
        };
      case 'LIVE':
        return isEndingSoon
          ? {
              container: 'bg-red-50 border-red-200 animate-pulse',
              text: 'text-red-800',
              accent: 'text-red-600',
              badge: 'bg-red-100 text-red-800',
            }
          : {
              container: 'bg-green-50 border-green-200',
              text: 'text-green-800',
              accent: 'text-green-600',
              badge: 'bg-green-100 text-green-800',
            };
      case 'ENDING_SOON':
        return {
          container: 'bg-red-50 border-red-200 animate-pulse',
          text: 'text-red-800',
          accent: 'text-red-600',
          badge: 'bg-red-100 text-red-800',
        };
      case 'ENDED':
        return {
          container: 'bg-gray-50 border-gray-200',
          text: 'text-gray-800',
          accent: 'text-gray-600',
          badge: 'bg-gray-100 text-gray-800',
        };
      default:
        return {
          container: 'bg-gray-50 border-gray-200',
          text: 'text-gray-800',
          accent: 'text-gray-600',
          badge: 'bg-gray-100 text-gray-800',
        };
    }
  };

  const styles = getStatusStyles();

  // Status text
  const getStatusText = () => {
    switch (status) {
      case 'UPCOMING':
        return 'قادم';
      case 'LIVE':
        return isEndingSoon ? 'ينتهي قريباً' : 'مباشر';
      case 'ENDING_SOON':
        return 'ينتهي قريباً';
      case 'ENDED':
        return 'انتهى';
      default:
        return 'غير محدد';
    }
  };

  return (
    <div className={`rounded-lg border-2 p-6 ${styles.container}`}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClockIcon className={`h-5 w-5 ${styles.accent}`} />
          <h3 className={`font-semibold ${styles.text}`}>وقت المزاد</h3>
        </div>

        <div className="flex items-center gap-2">
          {isEndingSoon && (
            <ExclamationTriangleIcon className="h-5 w-5 animate-bounce text-red-500" />
          )}
          <span className={`rounded-full px-3 py-1 text-sm font-medium ${styles.badge}`}>
            {getStatusText()}
          </span>
        </div>
      </div>

      {/* Time Display */}
      {status === 'ENDED' ? (
        <div className="text-center">
          <p className={`text-lg font-medium ${styles.text} mb-2`}>انتهى المزاد</p>
          <p className={`text-sm ${styles.accent}`}>انتهى في: {formatDateTime(endTime)}</p>
        </div>
      ) : (
        <>
          {/* Countdown */}
          <div className="mb-4 grid grid-cols-4 gap-2">
            {/* Days */}
            <div className="text-center">
              <div className={`text-2xl font-bold ${styles.accent}`}>
                {timeComponents.days.toString().padStart(2, '0')}
              </div>
              <div className={`text-xs ${styles.text} opacity-75`}>يوم</div>
            </div>

            {/* Hours */}
            <div className="text-center">
              <div className={`text-2xl font-bold ${styles.accent}`}>
                {timeComponents.hours.toString().padStart(2, '0')}
              </div>
              <div className={`text-xs ${styles.text} opacity-75`}>ساعة</div>
            </div>

            {/* Minutes */}
            <div className="text-center">
              <div className={`text-2xl font-bold ${styles.accent}`}>
                {timeComponents.minutes.toString().padStart(2, '0')}
              </div>
              <div className={`text-xs ${styles.text} opacity-75`}>دقيقة</div>
            </div>

            {/* Seconds */}
            <div className="text-center">
              <div
                className={`text-2xl font-bold ${styles.accent} ${
                  isEndingSoon ? 'animate-pulse' : ''
                }`}
              >
                {timeComponents.seconds.toString().padStart(2, '0')}
              </div>
              <div className={`text-xs ${styles.text} opacity-75`}>ثانية</div>
            </div>
          </div>

          {/* Time Remaining Text */}
          <div className="text-center">
            <p className={`text-sm ${styles.text} mb-1`}>
              {status === 'UPCOMING' ? 'يبدأ خلال:' : 'ينتهي خلال:'}
            </p>
            <p className={`font-medium ${styles.accent}`}>{formatTimeRemaining(timeRemaining)}</p>
          </div>

          {/* End Time */}
          <div className="mt-4 border-t border-gray-200 pt-4">
            <p className={`text-xs ${styles.text} text-center opacity-75`}>
              {status === 'UPCOMING' ? 'وقت البداية:' : 'وقت النهاية:'} {formatDateTime(endTime)}
            </p>
          </div>
        </>
      )}

      {/* Warning Messages */}
      {isEndingSoon && status !== 'ENDED' && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-100 p-3">
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0 text-red-500" />
            <p className="text-sm font-medium text-red-800">
              {timeRemaining <= 60000
                ? 'المزاد ينتهي خلال أقل من دقيقة!'
                : 'المزاد ينتهي قريباً - أسرع بتقديم عروضك!'}
            </p>
          </div>
        </div>
      )}

      {/* Live Indicator */}
      {status === 'LIVE' && !isEndingSoon && (
        <div className="mt-4 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
            <span className="text-sm font-medium text-green-600">المزاد جاري الآن</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuctionTimer;
