/**
 * 🎯 النظام الموحد النهائي لفك التشفير - الحل الجذري الشامل
 * يضمن عدم ظهور أي اسم مشفر في أي مكان في النظام
 */

import React from 'react';
import { quickDecodeName as originalDecoder } from '../utils/universalNameDecoder';

/**
 * فك التشفير العميق للكائنات والمصفوفات
 */
export function deepDecodeNames(data: any): any {
  // الحفاظ على null/undefined كما هي
  if (data === null || data === undefined) return data;

  // الحفاظ على كائنات التاريخ كما هي (سيتم تحويلها تلقائياً إلى ISO عبر res.json)
  if (data instanceof Date) {
    return data;
  }

  // معالجة المصفوفات
  if (Array.isArray(data)) {
    return data.map((item) => deepDecodeNames(item));
  }

  // معالجة الكائنات البسيطة فقط (Plain Objects)
  if (typeof data === 'object') {
    const proto = Object.getPrototypeOf(data);
    const isPlainObject = proto === Object.prototype || proto === null;
    if (!isPlainObject) {
      // كائنات غير بسيطة (مثل Date/Map/Set/Prisma Decimal...) تُعاد كما هي
      return data;
    }

    const nameFields = [
      'name',
      'fullName',
      'firstName',
      'lastName',
      'displayName',
      'userName',
      'sellerName',
      'bidderName',
      'ownerName',
      'authorName',
    ];

    const decoded: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string' && nameFields.includes(key)) {
        decoded[key] = originalDecoder(value);
      } else {
        decoded[key] = deepDecodeNames(value);
      }
    }
    return decoded;
  }

  // القيم البدائية الأخرى (string/number/boolean) تُعاد كما هي
  return data;
}

/**
 * Middleware لـ API Responses - يطبق على كل استجابة
 */
export function decodeApiResponse(response: any): any {
  if (!response) return response;
  
  // إذا كان response يحتوي على data
  if (response.data) {
    response.data = deepDecodeNames(response.data);
  }
  
  // إذا كان response مباشر
  if (response.users || response.auctions || response.cars || response.showrooms) {
    Object.keys(response).forEach(key => {
      if (Array.isArray(response[key])) {
        response[key] = deepDecodeNames(response[key]);
      }
    });
  }
  
  // إذا كان response كائن مفرد
  return deepDecodeNames(response);
}

/**
 * Higher-Order Component للـ React Components
 */
export function withAutoDecoding<P extends Record<string, any>>(
  WrappedComponent: React.ComponentType<P>
): React.ComponentType<P> {
  return function DecodedComponent(props: P) {
    // استخدام any لتجنب أخطاء الفهرسة على النوع العام P
    const decodedProps: any = { ...props };

    // فك تشفير جميع props
    Object.keys(decodedProps).forEach((key) => {
      if (decodedProps[key]) {
        decodedProps[key] = deepDecodeNames(decodedProps[key]);
      }
    });

    return React.createElement(WrappedComponent, decodedProps as P);
  };
}

/**
 * Hook للاستخدام في المكونات
 */
export function useDecodedData<T>(data: T): T {
  return React.useMemo(() => deepDecodeNames(data), [data]);
}

/**
 * دالة مساعدة سريعة لفك تشفير النصوص
 */
export function safeName(name: string | null | undefined): string {
  if (!name) return 'مستخدم';
  return originalDecoder(name);
}

export default {
  deepDecodeNames,
  decodeApiResponse,
  withAutoDecoding,
  useDecodedData,
  safeName
};
