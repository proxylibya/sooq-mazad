/**
 * Unified Animation System - Reusable Animation Wrapper
 * نظام التأثيرات الموحد - مكون قابل لإعادة الاستخدام
 */

import { useState, useEffect } from 'react';

const AnimatedWrapper = ({
  children,
  animation = 'fade-in',
  delay = 0,
  duration = 'base',
  hover = null,
  className = '',
  as = 'div',
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const animationMap = {
    'fade-in': 'animate-fade-in',
    'fade-in-up': 'animate-fade-in-up',
    'slide-down': 'animate-slide-down',
    'slide-up': 'animate-slide-up',
    'slide-in-right': 'animate-slide-in-right',
    'slide-in-left': 'animate-slide-in-left',
    'scale-in': 'animate-scale-in',
    expand: 'animate-expand',
    collapse: 'animate-collapse',
  };

  const hoverMap = {
    lift: 'hover-lift',
    glow: 'hover-glow',
    scale: 'hover-scale',
    'scale-down': 'hover-scale-down',
  };

  const animationClass = animationMap[animation] || '';
  const hoverClass = hover ? hoverMap[hover] || '' : '';

  const Component = as;

  return (
    <Component
      className={`${isVisible ? animationClass : 'opacity-0'} ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

export default AnimatedWrapper;

export const AnimatedCard = ({ children, delay = 0, className = '', ...props }) => (
  <AnimatedWrapper
    animation="fade-in-up"
    hover="lift"
    delay={delay}
    className={`card-entrance ${className}`}
    {...props}
  >
    {children}
  </AnimatedWrapper>
);

export const AnimatedButton = ({ children, className = '', ...props }) => (
  <AnimatedWrapper
    hover="scale"
    className={`admin-btn hover-scale-down ${className}`}
    as="button"
    {...props}
  >
    {children}
  </AnimatedWrapper>
);

export const AnimatedDropdown = ({ children, isOpen, className = '', ...props }) => (
  <div
    className={`dropdown-menu ${isOpen ? 'animate-slide-down' : 'hidden'} ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const AnimatedTableRow = ({ children, index = 0, className = '', ...props }) => (
  <tr
    className={`table-row-entrance ${className}`}
    style={{ animationDelay: `${index * 30}ms` }}
    {...props}
  >
    {children}
  </tr>
);

export const AnimatedInput = ({ className = '', ...props }) => (
  <input className={`search-input admin-input ${className}`} {...props} />
);
