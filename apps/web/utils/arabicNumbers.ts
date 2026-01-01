/**
 * دالة إرجاع الأرقام الإنجليزية كما هي
 * الحفاظ على 0123456789 بدون تحويل
 */
export function convertToArabicNumbers(num: string | number): string {
  return num.toString();
}

/**
 * دالة تحويل الأرقام العربية الهندية إلى الأرقام الإنجليزية
 * تحويل ٠١٢٣٤٥٦٧٨٩ إلى 0123456789
 */
export function convertToEnglishNumbers(num: string): string {
  const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

  return num.replace(/[٠-٩]/g, (digit) => {
    const index = arabicNumbers.indexOf(digit);
    return index !== -1 ? englishNumbers[index] : digit;
  });
}

/**
 * دالة تنسيق رقم الهاتف بالأرقام الإنجليزية فقط
 * تحويل أي أرقام عربية إلى إنجليزية وإزالة الأحرف غير الرقمية
 */
export function formatPhoneNumber(phone: string): string {
  // تحويل الأرقام العربية إلى إنجليزية أولاً
  const convertedPhone = convertToEnglishNumbers(phone);
  // إزالة جميع الأحرف غير الرقمية
  const cleanPhone = convertedPhone.replace(/\D/g, '');
  return cleanPhone; // إرجاع الأرقام الإنجليزية فقط
}

/**
 * دالة تنسيق التاريخ بالأرقام الإنجليزية فقط
 */
export function formatDateEnglish(date: Date): string {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * دالة تنسيق الوقت بالأرقام الإنجليزية فقط
 */
export function formatTimeEnglish(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  const period = hours >= 12 ? 'م' : 'ص';
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;

  const formattedHours = displayHours.toString().padStart(2, '0');
  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSeconds = seconds.toString().padStart(2, '0');

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds} ${period}`;
}

/**
 * دالة تنسيق الأرقام الكبيرة مع فواصل بالأرقام الإنجليزية فقط
 */
export function formatLargeNumber(num: number): string {
  return num.toLocaleString('en-US');
}

/**
 * دالة تنسيق العملة بالأرقام الإنجليزية فقط
 */
export function formatCurrencyEnglish(amount: number, currency: string = 'د.ل'): string {
  const formattedAmount = formatLargeNumber(amount);
  return `${formattedAmount} ${currency}`;
}

/**
 * دالة عامة لضمان عرض جميع الأرقام بالتنسيق الإنجليزي
 */
export function ensureEnglishNumbers(input: string | number): string {
  return convertToEnglishNumbers(String(input));
}

/**
 * أمثلة على الاستخدام:
 *
 * convertToEnglishNumbers("١٢٣٤٥٦٧٨٩٠") // "1234567890"
 * formatPhoneNumber("٠١٦١٩٩٨٤٩٨") // "0161998498"
 * formatPhoneNumber("+218911234567") // "218911234567"
 * formatDateEnglish(new Date()) // "18/1/2024"
 * formatTimeEnglish(new Date()) // "10:30:00 ص"
 * formatLargeNumber(1250000) // "1,250,000"
 * formatCurrencyEnglish(25000) // "25,000 د.ل"
 * ensureEnglishNumbers("٨٨٩٤٩٤٠") // "8894940"
 */
