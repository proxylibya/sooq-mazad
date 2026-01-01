import { useEffect, useState } from 'react';

interface PageElement {
  id: string;
  pageType: string;
  elementType: string;
  elementName: string;
  elementKey: string;
  isVisible: boolean;
  isInteractive: boolean;
  displayOrder: number;
  description: string;
  category: string;
}

interface PageConfig {
  pageType: string;
  pageName: string;
  pageUrl: string;
  elements: PageElement[];
}

interface UsePageElementsReturn {
  elements: PageElement[];
  loading: boolean;
  error: string | null;
  isElementVisible: (elementKey: string) => boolean;
  isElementInteractive: (elementKey: string) => boolean;
  getElementOrder: (elementKey: string) => number;
  refreshElements: () => void;
}

export function usePageElements(pageType: string): UsePageElementsReturn {
  const [elements, setElements] = useState<PageElement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchElements = async () => {
    try {
      setLoading(true);
      setError(null);

      // محاولة جلب البيانات من API
      try {
        const response = await fetch('/api/site-sections');
        if (response.ok) {
          const data = await response.json();
          if (data.elements) {
            const filteredElements = data.elements.filter(
              (el: PageElement) => el.pageType === pageType
            );
            if (filteredElements.length > 0) {
              setElements(filteredElements);
              return;
            }
          }
        }
      } catch (apiError) {
        console.warn('فشل في جلب العناصر من API، استخدام البيانات الافتراضية');
      }

      // استخدام البيانات الافتراضية في حال فشل API
      const mockData = getDefaultPageElements(pageType);
      setElements(mockData);
    } catch (err) {
      setError('خطأ في جلب إعدادات العناصر');
      console.error('خطأ في جلب إعدادات العناصر:', err);
      // استخدام البيانات الافتراضية حتى في حال الخطأ
      const mockData = getDefaultPageElements(pageType);
      setElements(mockData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElements();
  }, [pageType]);

  const isElementVisible = (elementKey: string): boolean => {
    const element = elements.find((el) => el.elementKey === elementKey);
    return element?.isVisible ?? true; // افتراضي: مرئي
  };

  const isElementInteractive = (elementKey: string): boolean => {
    const element = elements.find((el) => el.elementKey === elementKey);
    return element?.isInteractive ?? true; // افتراضي: تفاعلي
  };

  const getElementOrder = (elementKey: string): number => {
    const element = elements.find((el) => el.elementKey === elementKey);
    return element?.displayOrder ?? 999; // افتراضي: في النهاية
  };

  const refreshElements = () => {
    fetchElements();
  };

  return {
    elements,
    loading,
    error,
    isElementVisible,
    isElementInteractive,
    getElementOrder,
    refreshElements,
  };
}

// بيانات افتراضية للعناصر
function getDefaultPageElements(pageType: string): PageElement[] {
  const elementConfigs: Record<string, PageElement[]> = {
    'auction-detail': [
      {
        id: '1',
        pageType: 'auction-detail',
        elementType: 'component',
        elementName: 'معرض الصور',
        elementKey: 'image_gallery',
        isVisible: true,
        isInteractive: true,
        displayOrder: 1,
        description: 'عرض صور السيارة مع إمكانية التنقل',
        category: 'media',
      },
      {
        id: '2',
        pageType: 'auction-detail',
        elementType: 'component',
        elementName: 'العداد التنازلي',
        elementKey: 'auction_timer',
        isVisible: true,
        isInteractive: false,
        displayOrder: 2,
        description: 'عداد تنازلي لانتهاء المزاد',
        category: 'auction',
      },
      {
        id: '3',
        pageType: 'auction-detail',
        elementType: 'component',
        elementName: 'قسم المزايدات',
        elementKey: 'bidding_section',
        isVisible: true,
        isInteractive: true,
        displayOrder: 3,
        description: 'عرض المزايدة الحالية وإمكانية المزايدة',
        category: 'auction',
      },
      {
        id: '4',
        pageType: 'auction-detail',
        elementType: 'component',
        elementName: 'تفاصيل السيارة',
        elementKey: 'car_details',
        isVisible: true,
        isInteractive: false,
        displayOrder: 4,
        description: 'عرض مواصفات وتفاصيل السيارة',
        category: 'information',
      },
      {
        id: '5',
        pageType: 'auction-detail',
        elementType: 'component',
        elementName: 'معلومات الساحة',
        elementKey: 'yard_info',
        isVisible: true,
        isInteractive: true,
        displayOrder: 5,
        description: 'معلومات الساحة والتقييم',
        category: 'information',
      },
      {
        id: '6',
        pageType: 'auction-detail',
        elementType: 'component',
        elementName: 'خريطة الموقع',
        elementKey: 'location_map',
        isVisible: true,
        isInteractive: true,
        displayOrder: 6,
        description: 'عرض موقع السيارة على الخريطة',
        category: 'location',
      },
      {
        id: '7',
        pageType: 'auction-detail',
        elementType: 'component',
        elementName: 'تاريخ المزايدات',
        elementKey: 'bid_history',
        isVisible: true,
        isInteractive: false,
        displayOrder: 7,
        description: 'عرض تاريخ المزايدات السابقة',
        category: 'auction',
      },
      {
        id: '8',
        pageType: 'auction-detail',
        elementType: 'component',
        elementName: 'شروط المزاد',
        elementKey: 'auction_terms',
        isVisible: true,
        isInteractive: false,
        displayOrder: 8,
        description: 'عرض شروط وأحكام المزاد',
        category: 'information',
      },
      {
        id: '9',
        pageType: 'auction-detail',
        elementType: 'button',
        elementName: 'زر المفضلة',
        elementKey: 'favorite_button',
        isVisible: true,
        isInteractive: true,
        displayOrder: 9,
        description: 'إضافة/إزالة من المفضلة',
        category: 'interaction',
      },
      {
        id: '10',
        pageType: 'auction-detail',
        elementType: 'button',
        elementName: 'زر المشاركة',
        elementKey: 'share_button',
        isVisible: true,
        isInteractive: true,
        displayOrder: 10,
        description: 'مشاركة المزاد على وسائل التواصل',
        category: 'interaction',
      },
    ],
    homepage: [
      {
        id: '11',
        pageType: 'homepage',
        elementType: 'section',
        elementName: 'البنر الإعلاني الرئيسي',
        elementKey: 'hero_ad_banner',
        isVisible: true,
        isInteractive: true,
        displayOrder: 0,
        description: 'مساحة إعلانية رئيسية 1200x400 بكسل - 500-1000 د.ل شهرياً',
        category: 'advertisement',
      },
      {
        id: '12',
        pageType: 'homepage',
        elementType: 'section',
        elementName: 'البانر الرئيسي',
        elementKey: 'hero_banner',
        isVisible: true,
        isInteractive: true,
        displayOrder: 1,
        description: 'البانر الرئيسي في أعلى الصفحة',
        category: 'hero',
      },
      {
        id: '13',
        pageType: 'homepage',
        elementType: 'section',
        elementName: 'شريط البحث',
        elementKey: 'search_bar',
        isVisible: true,
        isInteractive: true,
        displayOrder: 2,
        description: 'شريط البحث الرئيسي',
        category: 'navigation',
      },
      {
        id: '14',
        pageType: 'homepage',
        elementType: 'section',
        elementName: 'الأقسام الرئيسية',
        elementKey: 'main_categories',
        isVisible: true,
        isInteractive: true,
        displayOrder: 3,
        description: 'أزرار الوصول السريع للأقسام الرئيسية',
        category: 'navigation',
      },
      {
        id: '15',
        pageType: 'homepage',
        elementType: 'section',
        elementName: 'المزادات المميزة',
        elementKey: 'featured_auctions',
        isVisible: true,
        isInteractive: true,
        displayOrder: 4,
        description: 'عرض أهم المزادات الجارية',
        category: 'content',
      },
      {
        id: '19',
        pageType: 'homepage',
        elementType: 'section',
        elementName: 'البنر الإعلاني الثانوي',
        elementKey: 'secondary_ad_banner',
        isVisible: true,
        isInteractive: true,
        displayOrder: 4.5,
        description: 'مساحة إعلانية ثانوية 1200x128 بكسل - 300-600 د.ل شهرياً',
        category: 'advertisement',
      },
      {
        id: '16',
        pageType: 'homepage',
        elementType: 'section',
        elementName: 'السيارات المميزة',
        elementKey: 'premium_cars_ads',
        isVisible: true,
        isInteractive: true,
        displayOrder: 5,
        description: 'بطاقات السيارات المميزة مدفوعة - 100-300 د.ل شهرياً للبطاقة',
        category: 'advertisement',
      },
      {
        id: '17',
        pageType: 'homepage',
        elementType: 'section',
        elementName: 'الحزم الإعلانية للشركات',
        elementKey: 'business_packages',
        isVisible: true,
        isInteractive: true,
        displayOrder: 6,
        description: 'عرض الحزم الإعلانية والخدمات التجارية المتقدمة',
        category: 'advertisement',
      },
      {
        id: '18',
        pageType: 'homepage',
        elementType: 'section',
        elementName: 'إحصائيات الموقع',
        elementKey: 'site_stats',
        isVisible: true,
        isInteractive: false,
        displayOrder: 7,
        description: 'عرض إحصائيات الموقع والمستخدمين',
        category: 'information',
      },
    ],
    'auctions-list': [
      {
        id: '19',
        pageType: 'auctions-list',
        elementType: 'component',
        elementName: 'فلاتر البحث',
        elementKey: 'search_filters',
        isVisible: true,
        isInteractive: true,
        displayOrder: 1,
        description: 'فلاتر البحث والتصفية',
        category: 'navigation',
      },
      {
        id: '20',
        pageType: 'auctions-list',
        elementType: 'component',
        elementName: 'شبكة المزادات',
        elementKey: 'auctions_grid',
        isVisible: true,
        isInteractive: true,
        displayOrder: 2,
        description: 'عرض المزادات في شبكة',
        category: 'content',
      },
      {
        id: '21',
        pageType: 'auctions-list',
        elementType: 'component',
        elementName: 'ترقيم الصفحات',
        elementKey: 'pagination',
        isVisible: true,
        isInteractive: true,
        displayOrder: 3,
        description: 'التنقل بين صفحات النتائج',
        category: 'navigation',
      },
    ],
    'open-market': [
      {
        id: '19',
        pageType: 'open-market',
        elementType: 'component',
        elementName: 'فلاتر البحث',
        elementKey: 'search_filters',
        isVisible: true,
        isInteractive: true,
        displayOrder: 1,
        description: 'فلاتر البحث والتصفية',
        category: 'navigation',
      },
      {
        id: '20',
        pageType: 'open-market',
        elementType: 'component',
        elementName: 'شبكة الإعلانات',
        elementKey: 'listings_grid',
        isVisible: true,
        isInteractive: true,
        displayOrder: 2,
        description: 'عرض الإعلانات في شبكة',
        category: 'content',
      },
      {
        id: '21',
        pageType: 'open-market',
        elementType: 'component',
        elementName: 'الإعلانات المميزة',
        elementKey: 'featured_listings',
        isVisible: true,
        isInteractive: true,
        displayOrder: 3,
        description: 'عرض الإعلانات المميزة',
        category: 'content',
      },
    ],
    wallet: [
      {
        id: '22',
        pageType: 'wallet',
        elementType: 'component',
        elementName: 'رصيد المحفظة',
        elementKey: 'wallet_balance',
        isVisible: true,
        isInteractive: false,
        displayOrder: 1,
        description: 'عرض رصيد المحفظة الحالي',
        category: 'information',
      },
      {
        id: '23',
        pageType: 'wallet',
        elementType: 'component',
        elementName: 'تاريخ المعاملات',
        elementKey: 'transaction_history',
        isVisible: true,
        isInteractive: true,
        displayOrder: 2,
        description: 'عرض تاريخ المعاملات المالية',
        category: 'information',
      },
      {
        id: '24',
        pageType: 'wallet',
        elementType: 'button',
        elementName: 'زر تعبئة الرصيد',
        elementKey: 'topup_button',
        isVisible: true,
        isInteractive: true,
        displayOrder: 3,
        description: 'زر تعبئة رصيد المحفظة',
        category: 'interaction',
      },
      {
        id: '25',
        pageType: 'wallet',
        elementType: 'input',
        elementName: 'حقل مبلغ الإيداع',
        elementKey: 'deposit_amount_input',
        isVisible: true,
        isInteractive: true,
        displayOrder: 4,
        description: 'حقل إدخال مبلغ الإيداع مع حد أدنى 100',
        category: 'interaction',
      },
    ],
  };

  return elementConfigs[pageType] || [];
}
