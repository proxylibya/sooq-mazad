/**
 * أداة تشخيص مشاكل الصور في المزادات
 */

export interface ImageDebugInfo {
  carId: string;
  hasImage: boolean;
  hasImages: boolean;
  hasImageList: boolean;
  imageType: string;
  imagesType: string;
  imageListType: string;
  imageValue: any;
  imagesValue: any;
  imageListValue: any;
  processedImages: string[];
  errors: string[];
}

/**
 * تشخيص مشاكل الصور في بيانات السيارة
 */
export function debugCarImages(car: any): ImageDebugInfo {
  const debug: ImageDebugInfo = {
    carId: car.id || 'unknown',
    hasImage: !!car.image,
    hasImages: !!car.images,
    hasImageList: !!car.imageList,
    imageType: typeof car.image,
    imagesType: typeof car.images,
    imageListType: typeof car.imageList,
    imageValue: car.image,
    imagesValue: car.images,
    imageListValue: car.imageList,
    processedImages: [],
    errors: [],
  };

  // معالجة imageList
  if (car.imageList) {
    if (Array.isArray(car.imageList)) {
      const cleanImages = car.imageList
        .map((img) => {
          if (typeof img === 'string') {
            return img.trim();
          } else if (img && typeof img === 'object' && img.url) {
            return img.url;
          }
          return null;
        })
        .filter((img) => img && img.length > 0);
      if (cleanImages.length > 0) {
        debug.processedImages = cleanImages;
      } else {
        debug.errors.push('imageList array موجود لكن لا يحتوي على صور صالحة');
      }
    } else {
      debug.errors.push('imageList موجود لكن ليس array');
    }
  }

  // معالجة images إذا لم نجد imageList صالح
  if (debug.processedImages.length === 0 && car.images) {
    if (Array.isArray(car.images)) {
      const cleanImages = car.images
        .map((img) => {
          if (typeof img === 'string') {
            return img.trim();
          } else if (img && typeof img === 'object' && img.url) {
            return img.url;
          }
          return null;
        })
        .filter((img) => img && img.length > 0);
      if (cleanImages.length > 0) {
        debug.processedImages = cleanImages;
      } else {
        debug.errors.push('images array موجود لكن لا يحتوي على صور صالحة');
      }
    } else if (typeof car.images === 'string' && car.images.trim()) {
      try {
        // محاولة تحليل JSON أولاً
        const parsedImages = JSON.parse(car.images);
        if (Array.isArray(parsedImages)) {
          const cleanImages = parsedImages
            .map((img) => {
              if (typeof img === 'string') {
                return img.trim();
              } else if (img && typeof img === 'object' && img.url) {
                return img.url;
              }
              return null;
            })
            .filter((img) => img && img.length > 0);
          if (cleanImages.length > 0) {
            debug.processedImages = cleanImages;
          } else {
            debug.errors.push('images JSON موجود لكن لا يحتوي على صور صالحة');
          }
        } else {
          debug.errors.push('images JSON موجود لكن ليس array');
        }
      } catch (e) {
        // إذا فشل التحليل، تعامل كنص عادي
        const imageArray = car.images
          .split(',')
          .map((img) => img.trim())
          .filter((img) => img);
        if (imageArray.length > 0) {
          debug.processedImages = imageArray;
        } else {
          debug.errors.push('images string موجود لكن لا يحتوي على صور صالحة بعد التقسيم');
        }
      }
    } else {
      debug.errors.push('images موجود لكن ليس array أو string صالح');
    }
  }

  // معالجة image المفردة إذا لم نجد شيء آخر
  if (debug.processedImages.length === 0 && car.image) {
    if (typeof car.image === 'string' && car.image.trim()) {
      debug.processedImages = [car.image];
    } else {
      debug.errors.push('image موجود لكن ليس string صالح');
    }
  }

  // إذا لم نجد أي صور
  if (debug.processedImages.length === 0) {
    debug.errors.push('لم يتم العثور على أي صور صالحة');
    debug.processedImages = ['https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=صورة+السيارة'];
  }

  return debug;
}

/**
 * طباعة تقرير تشخيص الصور
 */
export function printImageDebugReport(debug: ImageDebugInfo): void {
  console.group(`الصورة تشخيص صور السيارة ${debug.carId}`);

  console.log('الإحصائيات معلومات أساسية:', {
    hasImage: debug.hasImage,
    hasImages: debug.hasImages,
    hasImageList: debug.hasImageList,
  });

  console.log('البحث أنواع البيانات:', {
    imageType: debug.imageType,
    imagesType: debug.imagesType,
    imageListType: debug.imageListType,
  });

  if (debug.imageValue) {
    console.log('الصورة قيمة image:', debug.imageValue);
  }

  if (debug.imagesValue) {
    console.log('الصورة قيمة images:', debug.imagesValue);
  }

  if (debug.imageListValue) {
    console.log('الصورة قيمة imageList:', debug.imageListValue);
  }

  console.log('تم بنجاح الصور المعالجة:', debug.processedImages);

  if (debug.errors.length > 0) {
    console.warn('تحذير أخطاء:', debug.errors);
  }

  console.groupEnd();
}

/**
 * تشخيص مجموعة من السيارات
 */
export function debugMultipleCarImages(cars: any[]): void {
  console.group('السيارة تشخيص صور متعددة');

  const summary = {
    total: cars.length,
    withImages: 0,
    withoutImages: 0,
    withErrors: 0,
  };

  cars.forEach((car, index) => {
    const debug = debugCarImages(car);

    if (debug.processedImages.length > 0 && !debug.processedImages[0].includes('placeholder')) {
      summary.withImages++;
    } else {
      summary.withoutImages++;
    }

    if (debug.errors.length > 0) {
      summary.withErrors++;
    }

    // طباعة تفاصيل السيارات التي بها مشاكل
    if (debug.errors.length > 0 || debug.processedImages[0].includes('placeholder')) {
      printImageDebugReport(debug);
    }
  });

  console.log('التحليل ملخص:', summary);
  console.groupEnd();
}

/**
 * اختبار تحميل صورة
 */
export function testImageLoad(imageUrl: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      console.log('تم بنجاح تم تحميل الصورة بنجاح:', imageUrl);
      resolve(true);
    };

    img.onerror = () => {
      console.error('فشل فشل في تحميل الصورة:', imageUrl);
      resolve(false);
    };

    img.src = imageUrl;
  });
}

/**
 * اختبار تحميل مجموعة من الصور
 */
export async function testMultipleImageLoad(
  imageUrls: string[],
): Promise<{ success: number; failed: number; results: boolean[] }> {
  console.group('الاختبار اختبار تحميل الصور');

  const results = await Promise.all(imageUrls.map((url) => testImageLoad(url)));

  const summary = {
    success: results.filter((r) => r).length,
    failed: results.filter((r) => !r).length,
    results,
  };

  console.log('الإحصائيات نتائج الاختبار:', summary);
  console.groupEnd();

  return summary;
}
