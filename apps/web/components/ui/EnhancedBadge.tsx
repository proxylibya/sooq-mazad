import React, { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';

// CSS animations للعدادات المحسنة
const badgeStyles = `
  @keyframes pulse-once {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); box-shadow: 0 0 20px rgba(239, 68, 68, 0.6); }
    100% { transform: scale(1); }
  }
  
  @keyframes pulse-continuous {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.05); }
  }
  
  @keyframes fade-in-scale {
    0% { 
      opacity: 0; 
      transform: scale(0.3); 
    }
    50% { 
      opacity: 0.8; 
      transform: scale(1.1); 
    }
    100% { 
      opacity: 1; 
      transform: scale(1); 
    }
  }
  
  @keyframes bounce-in {
    0% { 
      transform: scale(0.3) translateY(-50px); 
      opacity: 0; 
    }
    50% { 
      transform: scale(1.05); 
    }
    70% { 
      transform: scale(0.9); 
    }
    100% { 
      transform: scale(1); 
      opacity: 1; 
    }
  }
  
  .animate-pulse-once {
    animation: pulse-once 0.6s ease-out;
  }
  
  .animate-pulse-continuous {
    animation: pulse-continuous 2s ease-in-out infinite;
  }
  
  .animate-fade-in-scale {
    animation: fade-in-scale 0.4s ease-out;
  }
  
  .animate-bounce-in {
    animation: bounce-in 0.7s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }
  
  /* تحسين الخطوط العربية */
  .enhanced-badge {
    font-family: 'Cairo', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    letter-spacing: -0.02em;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
  }
`;

// حقن الـ CSS في الصفحة
if (typeof document !== 'undefined') {
  const styleElement = document.getElementById('enhanced-badge-styles');
  if (!styleElement) {
    const style = document.createElement('style');
    style.id = 'enhanced-badge-styles';
    style.textContent = badgeStyles;
    document.head.appendChild(style);
  }
}

interface EnhancedBadgeProps {
  count: number;
  maxCount?: number;
  size?: 'sm' | 'md' | 'lg' | 'xs';
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center';
  color?: 'red' | 'blue' | 'green' | 'orange' | 'purple' | 'yellow' | 'gray';
  animate?: boolean;
  pulse?: boolean; // نبض مستمر للعدادات الجديدة
  bounce?: boolean; // حركة ارتداد للعدادات الجديدة
  glow?: boolean; // توهج للعدادات المهمة
  className?: string;
  onClick?: () => void; // إضافة وظيفة النقر
  disabled?: boolean; // تعطيل العداد
}

const EnhancedBadge: React.FC<EnhancedBadgeProps> = ({
  count,
  maxCount = 99,
  size = 'md',
  position = 'top-right',
  color = 'red',
  animate = true,
  pulse = false,
  bounce = false,
  glow = false,
  className = '',
  onClick,
  disabled = false,
}) => {
  const [prevCount, setPrevCount] = useState(count);
  const [showPulse, setShowPulse] = useState(false);
  const [showBounce, setShowBounce] = useState(false);
  const [displayCount, setDisplayCount] = useState(count);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(count > 0);

  // مراقبة تغيير العدد لتفعيل النبضة والحركة
  useEffect(() => {
    if (count !== prevCount) {
      // تحديث الرؤية أولاً
      if (count > 0 && prevCount === 0) {
        setIsVisible(true);
        if (bounce) setShowBounce(true);
      } else if (count === 0) {
        setTimeout(() => setIsVisible(false), 300);
      }
      
      if (animate && count > 0) {
        setIsAnimating(true);
        setShowPulse(true);
        
        // حركة تدريجية للأرقام
        if (count > prevCount) {
          let current = prevCount;
          const increment = Math.ceil((count - prevCount) / 8); // تقسيم الحركة لـ 8 خطوات
          const timer = setInterval(() => {
            current = Math.min(current + increment, count);
            setDisplayCount(current);
            if (current >= count) {
              clearInterval(timer);
              setIsAnimating(false);
            }
          }, 50); // تحديث كل 50ms للحركة السلسة
          
          // إيقاف النبضة والارتداد
          setTimeout(() => {
            setShowPulse(false);
            setShowBounce(false);
          }, 600);
          return () => clearInterval(timer);
        } else {
          // للأرقام المتناقصة - تحديث فوري
          setDisplayCount(count);
          setIsAnimating(false);
          setTimeout(() => {
            setShowPulse(false);
            setShowBounce(false);
          }, 400);
        }
      } else if (count !== prevCount) {
        // بدون حركة - تحديث فوري
        setDisplayCount(count);
      }
    }
    setPrevCount(count);
  }, [count, prevCount, animate, bounce]);

  // إذا العدد 0 أو أقل أو غير مرئي، لا نعرض شيء
  if (count <= 0 || !isVisible || disabled) return null;

  // تحديد النص المعروض مع الحركة
  const displayText = displayCount > maxCount ? `${maxCount}+` : displayCount.toString();

  // تحديد أحجام العداد - أحجام محسنة ومتنوعة  
  const sizeClasses = {
    xs: 'h-3 w-3 min-w-[12px] text-[7px] leading-3 font-bold',
    sm: 'h-3.5 w-3.5 min-w-[14px] text-[8px] leading-3.5 font-bold',
    md: 'h-4 w-4 min-w-[16px] text-[9px] leading-4 font-extrabold',
    lg: 'h-5 w-5 min-w-[20px] text-[10px] leading-5 font-extrabold',
  };

  // تحديد مواضع العداد
  const positionClasses = {
    'top-right': '-right-1 top-0',
    'top-left': '-left-1 top-0',
    'bottom-right': '-right-1 -bottom-1',
    'bottom-left': '-left-1 -bottom-1',
    'center': 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
  };

  // تحديد ألوان العداد مع تدرج جميل وأرقام واضحة
  const colorClasses = {
    red: 'bg-gradient-to-br from-red-500 to-red-700 text-white shadow-lg shadow-red-500/50',
    blue: 'bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-500/50',
    green: 'bg-gradient-to-br from-green-500 to-green-700 text-white shadow-lg shadow-green-500/50',
    orange: 'bg-gradient-to-br from-orange-500 to-orange-700 text-white shadow-lg shadow-orange-500/50',
    purple: 'bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-lg shadow-purple-500/50',
    yellow: 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white shadow-lg shadow-yellow-500/50',
    gray: 'bg-gradient-to-br from-gray-500 to-gray-700 text-white shadow-lg shadow-gray-500/50',
  };
  
  // إضافة توهج للعدادات المهمة
  const glowEffect = glow ? {
    red: 'shadow-red-500/70 shadow-2xl',
    blue: 'shadow-blue-500/70 shadow-2xl', 
    green: 'shadow-green-500/70 shadow-2xl',
    orange: 'shadow-orange-500/70 shadow-2xl',
    purple: 'shadow-purple-500/70 shadow-2xl',
    yellow: 'shadow-yellow-500/70 shadow-2xl',
    gray: 'shadow-gray-500/70 shadow-2xl',
  } : {};

  // معالجة النقر
  const handleClick = () => {
    if (onClick && !disabled) {
      onClick();
    }
  };

  return (
    <span
      className={cn(
        // الأساسيات - دائرة نظيفة مع أرقام واضحة ومُركزة تماماً
        'enhanced-badge absolute flex items-center justify-center rounded-full text-center font-bold select-none',
        // المقاس
        sizeClasses[size],
        // الموضع
        positionClasses[position],
        // اللون
        colorClasses[color],
        // التوهج إذا مطلوب
        glow && glowEffect[color],
        // تحسين العرض والوضوح
        'border-0 backdrop-blur-sm',
        // الحركة إذا مطلوبة
        animate && 'transition-all duration-300 ease-out',
        // حركة النبض للعداد الجديد
        showPulse && 'animate-pulse-once',
        // النبض المستمر
        pulse && 'animate-pulse-continuous',
        // حركة الارتداد
        showBounce && 'animate-bounce-in',
        // تأثير الحركة أثناء التحديث
        isAnimating && 'scale-110 transition-transform duration-300',
        // الظهور والاختفاء
        isVisible && 'animate-fade-in-scale',
        // القابلية للنقر
        onClick && !disabled && 'cursor-pointer hover:scale-105 active:scale-95',
        // حالة التعطيل
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
      // إضافة بيانات للوصولية
      role={onClick ? 'button' : 'status'}
      aria-label={`${count} عنصر جديد`}
      title={`${count} عنصر جديد`}
      tabIndex={onClick && !disabled ? 0 : -1}
      onClick={handleClick}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick && !disabled) {
          e.preventDefault();
          handleClick();
        }
      }}
      // إضافة خصائص للتحكم في الحركة
      style={{
        animationDelay: animate ? '0.1s' : '0s',
        zIndex: 50, // التأكد من الظهور فوق العناصر الأخرى
      }}
    >
      {displayText}
    </span>
  );
};

// Hook مساعد لاستخدام العداد مع حالة محلية
export const useEnhancedBadge = (initialCount: number = 0) => {
  const [count, setCount] = useState(initialCount);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const increment = (amount: number = 1) => {
    setCount(prev => prev + amount);
    setLastUpdated(new Date());
  };
  
  const decrement = (amount: number = 1) => {
    setCount(prev => Math.max(0, prev - amount));
    setLastUpdated(new Date());
  };
  
  const reset = () => {
    setCount(0);
    setLastUpdated(new Date());
  };
  
  const set = (newCount: number) => {
    setCount(Math.max(0, newCount));
    setLastUpdated(new Date());
  };
  
  return {
    count,
    increment,
    decrement,
    reset,
    set,
    lastUpdated,
    hasItems: count > 0,
  };
};

export default EnhancedBadge;

// مكونات مُعدة مسبقاً للاستخدام السريع
export const MessagesBadge: React.FC<{ count: number; onClick?: () => void }> = ({ count, onClick }) => (
  <EnhancedBadge 
    count={count} 
    color="red" 
    size="md" 
    animate={true} 
    pulse={count > 0}
    glow={count > 5}
    onClick={onClick}
  />
);

export const NotificationsBadge: React.FC<{ count: number; onClick?: () => void }> = ({ count, onClick }) => (
  <EnhancedBadge 
    count={count} 
    color="blue" 
    size="md" 
    animate={true} 
    bounce={count > 0}
    onClick={onClick}
  />
);

export const FavoritesBadge: React.FC<{ count: number; onClick?: () => void }> = ({ count, onClick }) => (
  <EnhancedBadge 
    count={count} 
    color="yellow" 
    size="sm" 
    animate={true} 
    pulse={count > 0}
    onClick={onClick}
  />
);

export const CartBadge: React.FC<{ count: number; onClick?: () => void }> = ({ count, onClick }) => (
  <EnhancedBadge 
    count={count} 
    color="green" 
    size="md" 
    animate={true} 
    bounce={count > 0}
    glow={count > 3}
    onClick={onClick}
  />
);
