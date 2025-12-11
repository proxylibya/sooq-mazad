/**
 * Unified Animation System - Custom Hooks
 * نظام التأثيرات الموحد - Custom Hooks
 */

import { useEffect, useRef, useState } from 'react';

export const useIntersectionAnimation = (options = {}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        if (options.once) {
          observer.disconnect();
        }
      } else if (!options.once) {
        setIsVisible(false);
      }
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options]);

  return [ref, isVisible];
};

export const useDelayedAnimation = (delay = 0) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return isReady;
};

export const useStaggeredAnimation = (count, baseDelay = 0, staggerDelay = 50) => {
  const [visibleItems, setVisibleItems] = useState(new Set());

  useEffect(() => {
    const timers = [];
    for (let i = 0; i < count; i++) {
      const timer = setTimeout(() => {
        setVisibleItems((prev) => new Set([...prev, i]));
      }, baseDelay + i * staggerDelay);
      timers.push(timer);
    }

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [count, baseDelay, staggerDelay]);

  return visibleItems;
};

export const useHoverAnimation = () => {
  const [isHovered, setIsHovered] = useState(false);

  const hoverHandlers = {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
  };

  return [isHovered, hoverHandlers];
};

export const useDropdownAnimation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const open = () => {
    setIsOpen(true);
    setIsAnimating(true);
  };

  const close = () => {
    setIsAnimating(false);
    setTimeout(() => setIsOpen(false), 250);
  };

  const toggle = () => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  };

  return {
    isOpen,
    isAnimating,
    open,
    close,
    toggle,
  };
};

export const usePageTransition = () => {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const startTransition = (callback) => {
    setIsTransitioning(true);
    setTimeout(() => {
      callback();
      setTimeout(() => {
        setIsTransitioning(false);
      }, 100);
    }, 250);
  };

  return [isTransitioning, startTransition];
};
