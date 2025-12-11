/**
 * صفحة شحن المحفظة
 * توجيه إلى صفحة الإيداع المناسبة
 */

import { useRouter } from 'next/router';
import { useEffect } from 'react';

const TopupPage = () => {
  const router = useRouter();
  const { returnUrl } = router.query;

  useEffect(() => {
    // توجيه إلى صفحة الإيداع المحلي مع حفظ رابط العودة
    const depositUrl = returnUrl
      ? `/wallet/deposit/local?returnUrl=${encodeURIComponent(returnUrl as string)}`
      : '/wallet/deposit/local';

    router.replace(depositUrl);
  }, [router, returnUrl]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50" dir="rtl">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
        <p className="text-gray-600">جاري التوجيه لصفحة شحن المحفظة...</p>
      </div>
    </div>
  );
};

export default TopupPage;
