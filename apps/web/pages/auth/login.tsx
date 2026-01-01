/**
 * صفحة تسجيل الدخول - إعادة توجيه للصفحة الرئيسية
 */
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function AuthLoginRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/login');
  }, [router]);
  
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">جاري التحويل...</p>
      </div>
    </div>
  );
}
