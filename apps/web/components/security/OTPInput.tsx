import React, { useState, useEffect, useRef } from 'react';
import PhoneIcon from '@heroicons/react/24/outline/PhoneIcon';
import EnvelopeIcon from '@heroicons/react/24/outline/EnvelopeIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';

/**
 * مكون إدخال OTP مع التحقق
 * OTP Input Component with Verification
 */

interface OTPInputProps {
  type:
    | 'LOGIN'
    | 'REGISTRATION'
    | 'PASSWORD_RESET'
    | 'PHONE_VERIFICATION'
    | 'EMAIL_VERIFICATION'
    | 'TRANSACTION';
  deliveryMethod: 'SMS' | 'EMAIL' | 'VOICE';
  recipient: string;
  onVerified: (success: boolean) => void;
  onError?: (error: string) => void;
  className?: string;
  autoFocus?: boolean;
  disabled?: boolean;
}

const OTPInput: React.FC<OTPInputProps> = ({
  type,
  deliveryMethod,
  recipient,
  onVerified,
  onError,
  className = '',
  autoFocus = true,
  disabled = false,
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpId, setOtpId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // إرسال OTP عند التحميل
  useEffect(() => {
    if (!disabled) {
      sendOTP();
    }
  }, []);

  // عداد الوقت
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // التركيز التلقائي
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const sendOTP = async () => {
    setSending(true);
    setError(null);

    try {
      const response = await fetch('/api/security/otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate',
          type,
          deliveryMethod,
          recipient,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setOtpId(data.data.otpId);
        setTimeLeft(getExpiryTime(type));
        setError(null);
      } else {
        setError(data.error || 'فشل في إرسال رمز التحقق');
        onError?.(data.error || 'فشل في إرسال رمز التحقق');
      }
    } catch (error) {
      const errorMessage = 'خطأ في الاتصال بالخادم';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setSending(false);
    }
  };

  const verifyOTP = async () => {
    if (!otpId || otp.some((digit) => !digit)) {
      setError('يرجى إدخال رمز التحقق كاملاً');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/security/otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'verify',
          otpId,
          code: otp.join(''),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setError(null);
        onVerified(true);
      } else {
        setAttempts((prev) => prev + 1);
        setError(data.error || 'رمز التحقق غير صحيح');

        if (data.remainingAttempts !== undefined) {
          setMaxAttempts(attempts + data.remainingAttempts);
        }

        // مسح الحقول عند الخطأ
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();

        onVerified(false);
        onError?.(data.error || 'رمز التحقق غير صحيح');
      }
    } catch (error) {
      const errorMessage = 'خطأ في التحقق من الرمز';
      setError(errorMessage);
      onVerified(false);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (index: number, value: string) => {
    if (disabled || success) return;

    // السماح بالأرقام فقط
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // أخذ آخر رقم فقط
    setOtp(newOtp);

    // الانتقال للحقل التالي
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // التحقق التلقائي عند اكتمال الرمز
    if (newOtp.every((digit) => digit) && !loading) {
      setTimeout(() => verifyOTP(), 100);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (disabled || success) return;

    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (disabled || success) return;

    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');

    if (pastedData.length === 6) {
      const newOtp = pastedData.split('').slice(0, 6);
      setOtp(newOtp);

      // التحقق التلقائي
      setTimeout(() => verifyOTP(), 100);
    }
  };

  const getExpiryTime = (type: string): number => {
    const times = {
      LOGIN: 5 * 60,
      REGISTRATION: 10 * 60,
      PASSWORD_RESET: 15 * 60,
      PHONE_VERIFICATION: 10 * 60,
      EMAIL_VERIFICATION: 30 * 60,
      TRANSACTION: 3 * 60,
    };
    return times[type as keyof typeof times] || 5 * 60;
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getDeliveryIcon = () => {
    switch (deliveryMethod) {
      case 'SMS':
      case 'VOICE':
        return <PhoneIcon className="h-5 w-5" />;
      case 'EMAIL':
        return <EnvelopeIcon className="h-5 w-5" />;
      default:
        return <PhoneIcon className="h-5 w-5" />;
    }
  };

  const getDeliveryText = () => {
    const maskedRecipient =
      deliveryMethod === 'EMAIL'
        ? recipient.replace(/(.{2}).*(@.*)/, '$1***$2')
        : recipient.replace(/(\d{3}).*(\d{3})/, '$1***$2');

    switch (deliveryMethod) {
      case 'SMS':
        return `تم إرسال رمز التحقق عبر رسالة نصية إلى ${maskedRecipient}`;
      case 'EMAIL':
        return `تم إرسال رمز التحقق عبر البريد الإلكتروني إلى ${maskedRecipient}`;
      case 'VOICE':
        return `سيتم الاتصال بك على ${maskedRecipient} لإملاء رمز التحقق`;
      default:
        return `تم إرسال رمز التحقق إلى ${maskedRecipient}`;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* رسالة التوضيح */}
      <div className="flex items-center space-x-3 rounded-lg bg-blue-50 p-4">
        {getDeliveryIcon()}
        <div className="flex-1">
          <p className="text-sm text-blue-800">{getDeliveryText()}</p>
          {timeLeft > 0 && (
            <div className="mt-1 flex items-center text-xs text-blue-600">
              <ClockIcon className="ml-1 h-4 w-4" />
              <span>ينتهي خلال {formatTime(timeLeft)}</span>
            </div>
          )}
        </div>
      </div>

      {/* حقول إدخال OTP */}
      <div className="flex justify-center space-x-2" dir="ltr">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleInputChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={disabled || loading || success}
            className={`h-12 w-12 rounded-lg border-2 text-center text-lg font-semibold focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${success ? 'border-green-500 bg-green-50' : 'border-gray-300'} ${error ? 'border-red-500' : ''} ${disabled || loading ? 'cursor-not-allowed bg-gray-100' : 'bg-white'} `}
          />
        ))}
      </div>

      {/* رسائل الحالة */}
      {error && (
        <div className="flex items-center space-x-2 rounded-lg bg-red-50 p-3">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center space-x-2 rounded-lg bg-green-50 p-3">
          <CheckCircleIcon className="h-5 w-5 text-green-500" />
          <p className="text-sm text-green-700">تم التحقق بنجاح!</p>
        </div>
      )}

      {/* معلومات المحاولات */}
      {attempts > 0 && !success && (
        <div className="text-center">
          <p className="text-xs text-gray-500">
            المحاولة {attempts} من {maxAttempts}
          </p>
        </div>
      )}

      {/* زر إعادة الإرسال */}
      {timeLeft === 0 && !success && (
        <div className="text-center">
          <button
            onClick={sendOTP}
            disabled={sending || disabled}
            className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
          >
            {sending ? 'جاري الإرسال...' : 'إعادة إرسال الرمز'}
          </button>
        </div>
      )}

      {/* مؤشر التحميل */}
      {loading && (
        <div className="flex justify-center">
          <div
                      className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                      style={{ width: 24, height: 24 }}
                      role="status"
                      aria-label="جاري التحميل"
                    />
        </div>
      )}
    </div>
  );
};

export default OTPInput;
