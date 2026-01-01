import { NextApiRequest, NextApiResponse } from 'next';
import { convertConditionToEnum } from '../../../utils/carConditionConverter';

/**
 * API للتحقق من صحة البيانات المرسلة دون محاولة الحفظ
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed - POST only',
    });
  }

  try {
    const { carData, images, userId } = req.body;

    console.log('🔍 فحص البيانات الواردة...');

    // التحقق من وجود البيانات الأساسية
    const dataValidation = {
      hasCarData: !!carData,
      hasUserId: !!userId,
      hasImages: !!images,
      carDataType: typeof carData,
      userIdType: typeof userId,
      imagesType: typeof images,
    };

    console.log('تحليل البيانات الأساسية:', dataValidation);

    if (!carData) {
      return res.status(400).json({
        success: false,
        error: 'بيانات السيارة غير موجودة',
        validation: dataValidation,
      });
    }

    // فحص الحقول المطلوبة
    const requiredFields = ['brand', 'model', 'year', 'price', 'location', 'contactPhone'];

    const fieldValidation: Record<
      string,
      {
        exists: boolean;
        hasValue: boolean;
        value: string;
        type: string;
        length: number;
      }
    > = {};
    const missingFields: string[] = [];

    requiredFields.forEach((field) => {
      const value = carData[field];
      const exists = value !== undefined && value !== null;
      const hasValue = exists && String(value).trim() !== '';

      fieldValidation[field] = {
        exists,
        hasValue,
        value: exists ? value : 'غير موجود',
        type: typeof value,
        length: exists ? String(value).length : 0,
      };

      if (!hasValue) {
        missingFields.push(field);
      }
    });

    // فحص البيانات الرقمية
    const numericValidation = {
      year: {
        original: carData.year,
        parsed: parseInt(carData.year),
        isValid: !isNaN(parseInt(carData.year)),
        inRange: false,
      },
      price: {
        original: carData.price,
        parsed: parseFloat(carData.price),
        isValid: !isNaN(parseFloat(carData.price)),
        isPositive: false,
      },
    };

    const currentYear = new Date().getFullYear();
    numericValidation.year.inRange =
      numericValidation.year.isValid &&
      numericValidation.year.parsed >= 1990 &&
      numericValidation.year.parsed <= currentYear + 1;

    numericValidation.price.isPositive =
      numericValidation.price.isValid && numericValidation.price.parsed > 0;

    // فحص حالة السيارة
    const conditionValidation = {
      original: carData.condition,
      converted: convertConditionToEnum(carData.condition || 'مستعمل'),
      isValid: !!carData.condition,
    };

    // فحص الصور
    const imagesValidation = {
      exists: !!images,
      isArray: Array.isArray(images),
      length: Array.isArray(images) ? images.length : 0,
      hasValidImages: false,
    };

    if (Array.isArray(images)) {
      imagesValidation.hasValidImages = images.some(
        (img) => img && typeof img === 'string' && img.trim().length > 0,
      );
    }

    // فحص رقم الهاتف
    const phoneValidation = {
      original: carData.contactPhone,
      exists: !!carData.contactPhone,
      trimmed: carData.contactPhone ? String(carData.contactPhone).trim() : '',
      length: carData.contactPhone ? String(carData.contactPhone).trim().length : 0,
      hasCountryCode: false,
    };

    if (phoneValidation.trimmed) {
      phoneValidation.hasCountryCode = phoneValidation.trimmed.startsWith('+218');
    }

    // النتيجة النهائية
    const allValidations = {
      dataValidation,
      fieldValidation,
      missingFields,
      numericValidation,
      conditionValidation,
      imagesValidation,
      phoneValidation,
    };

    const isValid =
      missingFields.length === 0 &&
      numericValidation.year.inRange &&
      numericValidation.price.isPositive;

    console.log('نتيجة التحقق:', { isValid, missingFields });

    return res.status(200).json({
      success: true,
      message: isValid ? 'البيانات صحيحة' : 'يوجد أخطاء في البيانات',
      isValid,
      validations: allValidations,
      recommendations: {
        missingFields:
          missingFields.length > 0 ? `يرجى ملء الحقول: ${missingFields.join(', ')}` : null,
        yearIssue: !numericValidation.year.inRange
          ? `السنة يجب أن تكون بين 1990 و ${currentYear + 1}`
          : null,
        priceIssue: !numericValidation.price.isPositive ? 'السعر يجب أن يكون رقماً موجباً' : null,
        phoneIssue: !phoneValidation.exists ? 'رقم الهاتف مطلوب' : null,
        imagesIssue: !imagesValidation.hasValidImages ? 'يجب رفع صورة واحدة على الأقل' : null,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ خطأ في التحقق من البيانات:', error);

    return res.status(500).json({
      success: false,
      error: 'خطأ في التحقق من البيانات',
      details: {
        originalError: error instanceof Error ? error.message : 'Unknown error',
        stack:
          process.env.NODE_ENV === 'development' && error instanceof Error
            ? error.stack
            : undefined,
      },
      timestamp: new Date().toISOString(),
    });
  }
}
