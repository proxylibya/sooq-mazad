/**
 * ✅ نظام الأسماء المحدث - بعد تنظيف قاعدة البيانات
 * جميع الأسماء الآن محفوظة مباشرة بالعربية (UTF-8)
 * لا حاجة لفك التشفير
 */

/**
 * فحص ما إذا كان النص مشفراً (للتوافق مع الكود القديم)
 */
export function isEncodedName(text: string | null | undefined): boolean {
  // بعد التنظيف، لا توجد أسماء مشفرة
  return false;
}

/**
 * إرجاع اسم المستخدم مباشرة (بدون فك تشفير)
 */
export function decodeUserName(name: string | null | undefined): string {
  if (!name || typeof name !== 'string') {
    return 'مستخدم';
  }

  // الأسماء الآن محفوظة مباشرة بالعربية
  return name;
}

/**
 * واجهة بيانات المستخدم
 */
export interface DecodedUser {
  id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  role?: string;
  accountType?: string;
  verified?: boolean;
  profileImage?: string | null;
  [key: string]: any;
}

/**
 * معالجة كائن المستخدم (بدون فك تشفير - البيانات نظيفة)
 */
export function decodeUserObject(user: any): DecodedUser {
  if (!user || typeof user !== 'object') {
    return {
      name: 'مستخدم',
      accountType: 'REGULAR_USER',
    };
  }

  const processed = { ...user };

  // التأكد من وجود اسم
  if (!processed.name || processed.name === 'مستخدم') {
    processed.name =
      processed.firstName && processed.lastName
        ? `${processed.firstName} ${processed.lastName}`
        : processed.fullName || processed.displayName || 'مستخدم';
  }

  return processed;
}

/**
 * معالجة قائمة مستخدمين
 */
export function decodeUsersList(users: any[]): DecodedUser[] {
  if (!Array.isArray(users)) return [];

  return users.map((user) => decodeUserObject(user));
}

/**
 * معالجة استجابة API (بدون فك تشفير - البيانات نظيفة)
 */
export function decodeApiResponse(response: any): any {
  if (!response || typeof response !== 'object') return response;

  const processed = { ...response };

  // معالجة بيانات المستخدمين فقط للتحقق من الاسم
  if (processed.user) {
    processed.user = decodeUserObject(processed.user);
  }

  if (processed.users && Array.isArray(processed.users)) {
    processed.users = decodeUsersList(processed.users);
  }

  if (processed.data?.users && Array.isArray(processed.data.users)) {
    processed.data.users = decodeUsersList(processed.data.users);
  }

  if (Array.isArray(processed.data)) {
    if (processed.data.length > 0 && processed.data[0].name !== undefined) {
      processed.data = decodeUsersList(processed.data);
    }
  }

  if (processed.seller) {
    processed.seller = decodeUserObject(processed.seller);
  }

  if (processed.owner) {
    processed.owner = decodeUserObject(processed.owner);
  }

  if (processed.bidder) {
    processed.bidder = decodeUserObject(processed.bidder);
  }

  if (processed.bids && Array.isArray(processed.bids)) {
    processed.bids = processed.bids.map((bid: any) => ({
      ...bid,
      user: bid.user ? decodeUserObject(bid.user) : bid.user,
      bidder: bid.bidder ? decodeUserObject(bid.bidder) : bid.bidder,
    }));
  }

  return processed;
}

/**
 * Hook لمعالجة بيانات المستخدم مع React
 */
export function useDecodedUser(user: any): DecodedUser {
  if (!user) return { name: 'مستخدم', accountType: 'REGULAR_USER' };
  return decodeUserObject(user);
}

/**
 * دالة مساعدة سريعة لإرجاع الاسم (بدون فك تشفير - البيانات نظيفة)
 */
export const quickDecodeName = (name: string | null | undefined): string => {
  return decodeUserName(name);
};

/**
 * معالجة بيانات localStorage
 */
export function decodeStorageData(storageKey: string): any {
  if (typeof window === 'undefined') return null;

  try {
    const data = localStorage.getItem(storageKey);
    if (!data) return null;

    const parsed = JSON.parse(data);

    // معالجة بيانات المستخدم
    if (storageKey === 'user' || parsed.name !== undefined) {
      return decodeUserObject(parsed);
    }

    return parsed;
  } catch (error) {
    console.warn('خطأ في معالجة بيانات التخزين:', error);
    return null;
  }
}

/**
 * تصدير الدوال الرئيسية
 */
export default {
  isEncodedName,
  decodeUserName,
  decodeUserObject,
  decodeUsersList,
  decodeApiResponse,
  useDecodedUser,
  quickDecodeName,
  decodeStorageData,
};
