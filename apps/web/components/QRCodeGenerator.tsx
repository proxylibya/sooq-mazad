import React, { useEffect, useRef, useState, useCallback } from 'react';
import QRCode from 'qrcode';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  className?: string;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  lazy?: boolean;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  value,
  size = 200,
  className = '',
  errorCorrectionLevel = 'M',
  margin = 4,
  color = {
    dark: '#000000',
    light: '#FFFFFF',
  },
  lazy = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(!lazy);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // دالة إنشاء QR Code محسنة
  const generateQRCode = useCallback(async () => {
    if (!canvasRef.current || !value) return;

    try {
      setIsLoading(true);
      setError(null);

      await QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: margin,
        color: color,
        errorCorrectionLevel: errorCorrectionLevel,
      });
    } catch (err) {
      console.error('خطأ في إنشاء QR Code:', err);
      setError('فشل في إنشاء رمز QR');
    } finally {
      setIsLoading(false);
    }
  }, [value, size, margin, color, errorCorrectionLevel]);

  // Intersection Observer للـ lazy loading
  useEffect(() => {
    if (!lazy || isVisible) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observerRef.current?.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    if (canvasRef.current) {
      observerRef.current.observe(canvasRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [lazy, isVisible]);

  // إنشاء QR Code عند الحاجة
  useEffect(() => {
    if (isVisible && value) {
      generateQRCode();
    }
  }, [isVisible, generateQRCode, value]);

  if (!value) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg bg-gray-100 ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-sm text-gray-500">لا توجد بيانات</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="px-2 text-center text-sm text-red-500">{error}</span>
        <button
          onClick={generateQRCode}
          className="mt-2 rounded bg-red-100 px-3 py-1 text-xs text-red-600 transition-colors hover:bg-red-200"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className={`relative inline-block ${className}`}>
      {isLoading && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-gray-100"
          style={{ width: size, height: size }}
        >
          <div className="flex flex-col items-center gap-2">
            <div
                      className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                      style={{ width: 24, height: 24 }}
                      role="status"
                      aria-label="جاري التحميل"
                    />
            <span className="text-xs text-gray-500">جاري الإنشاء...</span>
          </div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="rounded-lg border border-gray-200"
        style={{
          maxWidth: '100%',
          height: 'auto',
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out',
        }}
      />
    </div>
  );
};

export default QRCodeGenerator;
