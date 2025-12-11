import { useState } from 'react';
import { useRouter } from 'next/router';

interface SellerActionsOptions {
  sellerId: string;
  sellerName?: string;
  sellerPhone?: string;
  onContactSuccess?: () => void;
  onContactError?: (error: string) => void;
  onMessageSuccess?: () => void;
  onMessageError?: (error: string) => void;
}

interface UseSellerActionsReturn {
  isLoading: boolean;
  handleContact: () => void;
  handleMessage: () => Promise<void>;
  handleViewProfile: () => Promise<void>;
  handleWhatsApp: () => void;
  handleReport: () => Promise<void>;
}

export const useSellerActions = ({
  sellerId,
  sellerName,
  sellerPhone,
  onContactSuccess,
  onContactError,
  onMessageSuccess,
  onMessageError,
}: SellerActionsOptions): UseSellerActionsReturn => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // معالجة الاتصال الهاتفي
  const handleContact = () => {
    try {
      if (!sellerPhone) {
        onContactError?.('رقم الهاتف غير متوفر');
        return;
      }

      // تنظيف رقم الهاتف
      const cleanPhone = sellerPhone.replace(/[^\d+]/g, '');

      // إضافة رمز البلد إذا لم يكن موجوداً
      const phoneWithCountryCode = cleanPhone.startsWith('+')
        ? cleanPhone
        : `+218${cleanPhone.replace(/^0/, '')}`;

      // فتح تطبيق الهاتف
      window.open(`tel:${phoneWithCountryCode}`, '_self');

      onContactSuccess?.();
    } catch (error) {
      console.error('خطأ في الاتصال:', error);
      onContactError?.('فشل في فتح تطبيق الهاتف');
    }
  };

  // معالجة إرسال رسالة
  const handleMessage = async () => {
    try {
      setIsLoading(true);

      // التحقق من تسجيل الدخول
      const authResponse = await fetch('/api/auth/check');
      const authData = await authResponse.json();

      if (!authData.authenticated) {
        // توجيه لصفحة تسجيل الدخول
        router.push(`/login?redirect=/messages/${sellerId}`);
        return;
      }

      // توجيه لصفحة المحادثة
      await router.push(`/messages/${sellerId}`);
      onMessageSuccess?.();
    } catch (error) {
      console.error('خطأ في إرسال الرسالة:', error);
      onMessageError?.('فشل في فتح المحادثة');
    } finally {
      setIsLoading(false);
    }
  };

  // معالجة عرض الملف الشخصي
  const handleViewProfile = async () => {
    try {
      setIsLoading(true);
      const profileUrl = sellerName
        ? `/seller/${encodeURIComponent(sellerName)}`
        : `/seller/${sellerId}`;

      await router.push(profileUrl);
    } catch (error) {
      console.error('خطأ في فتح الملف الشخصي:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // معالجة WhatsApp
  const handleWhatsApp = () => {
    try {
      if (!sellerPhone) {
        onContactError?.('رقم الهاتف غير متوفر');
        return;
      }

      // تنظيف رقم الهاتف
      const cleanPhone = sellerPhone.replace(/[^\d]/g, '');

      // إضافة رمز البلد إذا لم يكن موجوداً
      const phoneWithCountryCode = cleanPhone.startsWith('218')
        ? cleanPhone
        : `218${cleanPhone.replace(/^0/, '')}`;

      // رسالة افتراضية
      const message = encodeURIComponent(`مرحباً، أنا مهتم بإعلانك في موقع مزاد السيارات`);

      // فتح WhatsApp
      const whatsappUrl = `https://wa.me/${phoneWithCountryCode}?text=${message}`;
      window.open(whatsappUrl, '_blank');

      onContactSuccess?.();
    } catch (error) {
      console.error('خطأ في فتح WhatsApp:', error);
      onContactError?.('فشل في فتح WhatsApp');
    }
  };

  // معالجة الإبلاغ عن البائع
  const handleReport = async () => {
    try {
      setIsLoading(true);

      // التحقق من تسجيل الدخول
      const authResponse = await fetch('/api/auth/check');
      const authData = await authResponse.json();

      if (!authData.authenticated) {
        router.push(`/login?redirect=/report/seller/${sellerId}`);
        return;
      }

      // توجيه لصفحة الإبلاغ
      await router.push(`/report/seller/${sellerId}`);
    } catch (error) {
      console.error('خطأ في الإبلاغ:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleContact,
    handleMessage,
    handleViewProfile,
    handleWhatsApp,
    handleReport,
  };
};

export default useSellerActions;
