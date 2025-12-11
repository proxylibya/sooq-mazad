import { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // إحصائيات الشبكة العالمية للعرض العام
    const globalStats = {
      overview: {
        totalCenters: 15,
        activeCenters: 12,
        totalCountries: 8,
        totalInspections: 2450,
        averageRating: 4.5,
        customerSatisfactionRate: 94,
      },

      // توزيع المراكز حسب البلدان
      centersByRegion: {
        'الخليج العربي': {
          countries: ['السعودية', 'الإمارات', 'قطر', 'الكويت', 'البحرين', 'عُمان'],
          activeCenters: 6,
          totalInspections: 1200,
          averageRating: 4.6,
          marketPotential: 'عالي جداً',
        },
        'شمال أفريقيا': {
          countries: ['ليبيا', 'مصر', 'تونس', 'الجزائر', 'المغرب'],
          activeCenters: 4,
          totalInspections: 850,
          averageRating: 4.4,
          marketPotential: 'عالي',
        },
        'بلاد الشام': {
          countries: ['الأردن', 'لبنان', 'سوريا', 'فلسطين'],
          activeCenters: 2,
          totalInspections: 400,
          averageRating: 4.3,
          marketPotential: 'متوسط',
        },
      },

      // الفرص الاستثمارية
      investmentOpportunities: [
        {
          country: 'مصر',
          flag: '🇪🇬',
          marketSize: 'كبير جداً',
          competition: 'منخفض',
          expectedROI: '25-30%',
          investmentRange: '$200K - $500K',
          priority: 'عالية جداً',
          description: 'سوق ضخم مع منافسة محدودة وطلب متزايد',
        },
        {
          country: 'العراق',
          flag: '🇮🇶',
          marketSize: 'كبير',
          competition: 'منخفض جداً',
          expectedROI: '30-35%',
          investmentRange: '$150K - $400K',
          priority: 'عالية',
          description: 'فرصة ذهبية مع إعادة الإعمار والنمو الاقتصادي',
        },
        {
          country: 'الجزائر',
          flag: '🇩🇿',
          marketSize: 'متوسط',
          competition: 'منخفض',
          expectedROI: '20-25%',
          investmentRange: '$180K - $350K',
          priority: 'متوسطة',
          description: 'سوق ناشئ مع إمكانيات نمو جيدة',
        },
        {
          country: 'الأردن',
          flag: '🇯🇴',
          marketSize: 'متوسط',
          competition: 'منخفض',
          expectedROI: '18-23%',
          investmentRange: '$120K - $280K',
          priority: 'متوسطة',
          description: 'موقع استراتيجي ونظام قانوني مستقر',
        },
      ],

      // تم حذف قصص النجاح الوهمية
      successStories: [],

      // الخدمات والتقنيات
      servicesOffered: [
        {
          name: 'فحص شامل للسيارات',
          description: 'فحص كامل للمحرك والهيكل والأنظمة الكهربائية',
          averagePrice: 150,
          duration: '90-120 دقيقة',
          popularity: 95,
        },
        {
          name: 'التصوير الاحترافي',
          description: 'تصوير عالي الجودة من جميع الزوايا',
          averagePrice: 50,
          duration: '30-45 دقيقة',
          popularity: 88,
        },
        {
          name: 'تقرير الفحص المفصل',
          description: 'تقرير شامل مع التوصيات والتقييم',
          averagePrice: 25,
          duration: '15-20 دقيقة',
          popularity: 92,
        },
        {
          name: 'خدمات النقل',
          description: 'نقل السيارة من وإلى المركز',
          averagePrice: 100,
          duration: 'حسب المسافة',
          popularity: 65,
        },
      ],

      // التقنيات المستخدمة
      technologies: [
        {
          name: 'أجهزة الفحص المتقدمة',
          description: 'أحدث أجهزة فحص المحركات والأنظمة',
          benefits: ['دقة عالية', 'سرعة في الفحص', 'تقارير مفصلة'],
        },
        {
          name: 'نظام إدارة المراكز',
          description: 'نظام متكامل لإدارة العمليات والعملاء',
          benefits: ['إدارة المواعيد', 'تتبع الطلبات', 'تقارير مالية'],
        },
        {
          name: 'تطبيق العملاء',
          description: 'تطبيق موبايل لحجز المواعيد والمتابعة',
          benefits: ['سهولة الحجز', 'تتبع الحالة', 'دفع إلكتروني'],
        },
      ],

      // برامج التدريب
      trainingPrograms: [
        {
          name: 'التدريب الأساسي',
          duration: '40 ساعة',
          topics: ['أساسيات الفحص', 'استخدام المعدات', 'خدمة العملاء'],
          certification: 'شهادة معتمدة',
          cost: 'مجاني للشركاء',
        },
        {
          name: 'التدريب المتقدم',
          duration: '80 ساعة',
          topics: ['فحص السيارات الفاخرة', 'التصوير الاحترافي', 'إدارة العمليات'],
          certification: 'شهادة متقدمة',
          cost: 'مجاني للشركاء',
        },
        {
          name: 'التدريب الاحترافي',
          duration: '120 ساعة',
          topics: ['تقنيات متطورة', 'الذكاء الاصطناعي', 'إدارة الفرق'],
          certification: 'شهادة احترافية',
          cost: 'مجاني للشركاء',
        },
      ],

      // الدعم المقدم
      supportServices: [
        {
          type: 'الدعم التقني',
          availability: '24/7',
          channels: ['هاتف', 'بريد إلكتروني', 'دردشة مباشرة'],
          responseTime: 'أقل من ساعة',
        },
        {
          type: 'التدريب المستمر',
          frequency: 'شهري',
          format: ['حضوري', 'عن بُعد', 'فيديوهات تعليمية'],
          cost: 'مجاني',
        },
        {
          type: 'التسويق والإعلان',
          services: ['حملات رقمية', 'مواد تسويقية', 'دعم العلامة التجارية'],
          investment: 'مشترك',
        },
      ],

      // إحصائيات الأداء
      performanceMetrics: {
        averageInspectionTime: 95, // دقيقة
        customerRetentionRate: 87, // نسبة مئوية
        onTimeDeliveryRate: 94, // نسبة مئوية
        qualityScoreAverage: 4.5, // من 5
        partnerSatisfactionRate: 92, // نسبة مئوية
      },

      // النمو والتوسع
      growthProjections: {
        '2024': {
          targetCenters: 25,
          targetCountries: 12,
          projectedRevenue: '$1.2M',
          newMarkets: ['العراق', 'الجزائر', 'الأردن'],
        },
        '2025': {
          targetCenters: 50,
          targetCountries: 18,
          projectedRevenue: '$2.5M',
          newMarkets: ['المغرب', 'لبنان', 'السودان'],
        },
        '2026': {
          targetCenters: 100,
          targetCountries: 25,
          projectedRevenue: '$5M',
          newMarkets: ['اليمن', 'موريتانيا', 'جيبوتي'],
        },
      },

      lastUpdated: new Date().toISOString(),
    };

    return res.status(200).json({
      success: true,
      data: globalStats,
    });
  } catch (error) {
    console.error('خطأ في API الإحصائيات العالمية:', error);
    return res.status(500).json({
      success: false,
      error: 'خطأ في الخادم الداخلي',
    });
  }
}

export default handler;
