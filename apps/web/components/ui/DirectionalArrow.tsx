import React, { useEffect, useState } from 'react';

interface DirectionalArrowProps {
  targetSelector: string;
  message: string;
  show: boolean;
  onHide?: () => void;
  autoHideDelay?: number;
}

const DirectionalArrow: React.FC<DirectionalArrowProps> = ({
  targetSelector,
  message,
  show,
  onHide,
  autoHideDelay = 5000,
}) => {
  const [position, setPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      const targetElement = document.querySelector(targetSelector);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        setPosition({
          top: rect.top + scrollTop - 60,
          left: rect.left + scrollLeft + rect.width / 2,
        });
        setIsVisible(true);

        // التمرير إلى العنصر المستهدف
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest',
        });

        // إخفاء السهم تلقائياً بعد فترة
        if (autoHideDelay > 0) {
          const timer = setTimeout(() => {
            setIsVisible(false);
            onHide?.();
          }, autoHideDelay);

          return () => clearTimeout(timer);
        }
      }
    } else {
      setIsVisible(false);
    }
  }, [show, targetSelector, autoHideDelay, onHide]);

  if (!isVisible || !position) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed z-50"
      style={{
        top: position.top,
        left: position.left,
        transform: 'translateX(-50%)',
      }}
    >
      {/* السهم المتحرك */}
      <div className="flex animate-bounce flex-col items-center">
        <div className="mb-2 whitespace-nowrap rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white shadow-lg">
          {message}
        </div>
        <div className="relative">
          <svg
            className="h-8 w-8 animate-pulse text-red-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L11 6.414V16a1 1 0 11-2 0V6.414L7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3z"
              clipRule="evenodd"
            />
          </svg>
          {/* تأثير الوهج */}
          <div className="absolute inset-0 h-8 w-8 animate-ping rounded-full bg-red-500 opacity-30"></div>
        </div>
      </div>
    </div>
  );
};

export default DirectionalArrow;
