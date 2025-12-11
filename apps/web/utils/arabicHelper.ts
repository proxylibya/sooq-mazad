// @ts-nocheck
﻿// Converted from JavaScript to TypeScript
// Original: arabicHelper.js
// Date: 2025-11-25

/**
 * مساعد النصوص العربية
 * حل مؤقت لمشكلة الترميز في قاعدة البيانات
 */

// تحويل النص العربي إلى تنسيق آمن للحفظ
export function encodeArabicText(text) {
  if (!text) return text;

  try {
    // تحويل النص العربي إلى Base64 للحفظ الآمن
    return Buffer.from(text, 'utf8').toString('base64');
  } catch (error) {
    console.error('خطأ في تشفير النص العربي:', error);
    return text; // إرجاع النص الأصلي في حالة الخطأ
  }
}

// استرجاع النص العربي من التنسيق الآمن
export function decodeArabicText(encodedText) {
  if (!encodedText) return encodedText;

  try {
    // فحص إذا كان النص مشفراً بـ Base64
    if (isBase64(encodedText)) {
      return Buffer.from(encodedText, 'base64').toString('utf8');
    }
    return encodedText; // إرجاع النص كما هو إذا لم يكن مشفراً
  } catch (error) {
    console.error('خطأ في فك تشفير النص العربي:', error);
    return encodedText; // إرجاع النص المشفر في حالة الخطأ
  }
}

// فحص إذا كان النص مشفراً بـ Base64
function isBase64(str) {
  try {
    return btoa(atob(str)) === str;
  } catch (error) {
    return false;
  }
}

// معالجة النصوص العربية للحفظ الآمن
export function safeArabicSave(data) {
  if (!data || typeof data !== 'object') return data;

  const processedData = { ...data };

  // قائمة الحقول التي قد تحتوي على نصوص عربية
  const arabicFields = [
    'name',
    'firstName',
    'lastName',
    'title',
    'description',
    'address',
    'notes',
  ];

  for (const field of arabicFields) {
    if (processedData[field] && typeof processedData[field] === 'string') {
      processedData[field] = encodeArabicText(processedData[field]);
    }
  }

  return processedData;
}

// معالجة النصوص العربية للعرض
export function safeArabicDisplay(data) {
  if (!data || typeof data !== 'object') return data;

  const processedData = { ...data };

  // قائمة الحقول التي قد تحتوي على نصوص عربية مشفرة
  const arabicFields = [
    'name',
    'firstName',
    'lastName',
    'title',
    'description',
    'address',
    'notes',
  ];

  for (const field of arabicFields) {
    if (processedData[field] && typeof processedData[field] === 'string') {
      processedData[field] = decodeArabicText(processedData[field]);
    }
  }

  return processedData;
}
