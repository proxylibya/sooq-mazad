/**
 * دالة لتوليد عنوان خدمة النقل مع تقييد الطول إلى 90 حرف كحد أقصى
 * @param truckType نوع الساحبة
 * @param serviceRegions مناطق الخدمة
 * @param maxLength الحد الأقصى لطول العنوان (افتراضي: 90)
 * @returns العنوان المقصر
 */
export function generateTransportServiceTitle(
  truckType: string, 
  serviceRegions: string[], 
  maxLength: number = 90
): string {
  const baseTitle = `خدمة نقل ${truckType}`;
  
  if (serviceRegions.length === 0) {
    return baseTitle;
  }
  
  const separator = ' - ';
  const availableLength = maxLength - baseTitle.length - separator.length;
  
  if (availableLength <= 0) {
    return baseTitle.substring(0, maxLength);
  }
  
  const regionsText = serviceRegions.join(', ');
  
  if (regionsText.length <= availableLength) {
    return `${baseTitle}${separator}${regionsText}`;
  } else {
    // قطع النص وإضافة "..." 
    const truncatedRegions = regionsText.substring(0, availableLength - 3) + '...';
    return `${baseTitle}${separator}${truncatedRegions}`;
  }
}

/**
 * دالة لقطع أي نص إلى طول محدد مع إضافة "..."
 * @param text النص المراد قطعه
 * @param maxLength الحد الأقصى للطول
 * @returns النص المقطوع
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + '...';
}
