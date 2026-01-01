/**
 * 🎯 Hook مخصص لأسهم التنقل
 * يضمن الاستخدام الصحيح والمتسق للأسهم عبر جميع المكونات
 */

import { useState, useCallback } from 'react';

export interface NavigationArrowsConfig {
  /** مصفوفة الصور */
  images: string[];
  /** الفهرس الابتدائي (افتراضي: 0) */
  initialIndex?: number;
  /** تفعيل التنقل الدائري (افتراضي: true) */
  loop?: boolean;
  /** callback عند تغيير الصورة */
  onImageChange?: (index: number) => void;
}

export interface NavigationArrowsReturn {
  /** الفهرس الحالي للصورة */
  currentIndex: number;
  /** الانتقال للصورة التالية */
  nextImage: (e?: React.MouseEvent) => void;
  /** الانتقال للصورة السابقة */
  prevImage: (e?: React.MouseEvent) => void;
  /** الانتقال لصورة محددة */
  goToImage: (index: number) => void;
  /** هل يجب إظهار الأسهم */
  shouldShowArrows: boolean;
  /** معلومات إضافية */
  info: {
    totalImages: number;
    hasMultipleImages: boolean;
    isFirstImage: boolean;
    isLastImage: boolean;
  };
}

/**
 * Hook لإدارة أسهم التنقل بين الصور
 *
 * @example
 * ```tsx
 * const { currentIndex, nextImage, prevImage, shouldShowArrows } = useNavigationArrows({
 *   images: carImages,
 *   onImageChange: (index) => console.log('تغيرت الصورة إلى:', index)
 * });
 *
 * return (
 *   <div className="group relative">
 *     <img src={images[currentIndex]} alt="..." />
 *
 *     <UnifiedNavigationArrows
 *       onPrevious={prevImage}
 *       onNext={nextImage}
 *       show={shouldShowArrows}
 *       alwaysVisible={false}
 *     />
 *   </div>
 * );
 * ```
 */
export function useNavigationArrows({
  images,
  initialIndex = 0,
  loop = true,
  onImageChange,
}: NavigationArrowsConfig): NavigationArrowsReturn {
  // التحقق من صحة البيانات
  const validImages = Array.isArray(images) ? images.filter((img) => img && img.trim()) : [];
  const safeInitialIndex = Math.max(0, Math.min(initialIndex, validImages.length - 1));

  const [currentIndex, setCurrentIndex] = useState(safeInitialIndex);

  // الانتقال للصورة التالية
  const nextImage = useCallback(
    (e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      setCurrentIndex((prevIndex) => {
        let newIndex;

        if (prevIndex >= validImages.length - 1) {
          // إذا كنا في الصورة الأخيرة
          newIndex = loop ? 0 : prevIndex;
        } else {
          newIndex = prevIndex + 1;
        }

        if (newIndex !== prevIndex && onImageChange) {
          onImageChange(newIndex);
        }

        return newIndex;
      });
    },
    [validImages.length, loop, onImageChange],
  );

  // الانتقال للصورة السابقة
  const prevImage = useCallback(
    (e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      setCurrentIndex((prevIndex) => {
        let newIndex;

        if (prevIndex <= 0) {
          // إذا كنا في الصورة الأولى
          newIndex = loop ? validImages.length - 1 : prevIndex;
        } else {
          newIndex = prevIndex - 1;
        }

        if (newIndex !== prevIndex && onImageChange) {
          onImageChange(newIndex);
        }

        return newIndex;
      });
    },
    [validImages.length, loop, onImageChange],
  );

  // الانتقال لصورة محددة
  const goToImage = useCallback(
    (index: number) => {
      const safeIndex = Math.max(0, Math.min(index, validImages.length - 1));

      if (safeIndex !== currentIndex) {
        setCurrentIndex(safeIndex);
        if (onImageChange) {
          onImageChange(safeIndex);
        }
      }
    },
    [currentIndex, validImages.length, onImageChange],
  );

  // معلومات إضافية
  const info = {
    totalImages: validImages.length,
    hasMultipleImages: validImages.length > 1,
    isFirstImage: currentIndex === 0,
    isLastImage: currentIndex === validImages.length - 1,
  };

  return {
    currentIndex,
    nextImage,
    prevImage,
    goToImage,
    shouldShowArrows: info.hasMultipleImages,
    info,
  };
}

/**
 * Hook مبسط للاستخدام السريع
 *
 * @example
 * ```tsx
 * const arrows = useSimpleArrows(carImages);
 *
 * return (
 *   <div className="group relative">
 *     <img src={carImages[arrows.currentIndex]} alt="..." />
 *     <UnifiedNavigationArrows {...arrows.props} />
 *   </div>
 * );
 * ```
 */
export function useSimpleArrows(images: string[]) {
  const navigation = useNavigationArrows({ images });

  return {
    currentIndex: navigation.currentIndex,
    props: {
      onPrevious: navigation.prevImage,
      onNext: navigation.nextImage,
      show: navigation.shouldShowArrows,
      alwaysVisible: false,
    },
  };
}
