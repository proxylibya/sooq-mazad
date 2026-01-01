import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * دالة مساعدة لدمج وتنظيم classNames باستخدام clsx و tailwind-merge
 * تستخدم لدمج classes من Tailwind CSS بشكل صحيح مع إزالة التكرارات
 *
 * @param inputs - مصفوفة من class names أو كائنات شرطية
 * @returns string - class names مدمجة ومنظمة
 *
 * @example
 * ```tsx
 * cn("px-4 py-2", "bg-blue-500", condition && "text-white")
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
