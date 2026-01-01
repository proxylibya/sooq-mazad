import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { verifyToken } from '../../../middleware/auth';
import { getMockCompanies } from '../../../lib/mock/companies';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      let companies;
      
      try {
        companies = await prisma.companies.findMany({
          orderBy: { createdAt: 'desc' },
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                phone: true,
                verified: true,
                accountType: true,
              },
            },
          },
          take: 100,
        });
      } catch (dbError) {
        console.error('خطأ في جلب الشركات من قاعدة البيانات:', dbError);
        console.log('📝 إضافة بيانات تجريبية للشركات...');
        
        // إضافة بيانات تجريبية عند فشل الاستعلام
        companies = [
          {
            id: 'sample-company-1',
            name: 'شركة النقل السريع',
            description: 'شركة متخصصة في خدمات النقل والشحن والخدمات اللوجستية داخل ليبيا وخارجها',
            logo: '/images/companies/default-company.svg',
            phone: '0912345678',
            email: 'fast@company.ly',
            website: 'fast-transport.ly',
            city: 'طرابلس',
            area: 'سوق الجمعة',
            address: 'شارع الوادي، مبنى 12',
            verified: true,
            featured: true,
            rating: 4.5,
            reviewsCount: 132,
            totalEmployees: 45,
            activeProjects: 12,
            status: 'APPROVED',
            businessType: ['نقل', 'لوجستيات'],
            specialties: ['نقل سيارات', 'تخزين', 'تغليف'],
            establishedYear: 2015,
            openingHours: 'السبت - الخميس: 8:00 AM - 6:00 PM',
            licenseNumber: 'TR-2015-001',
            taxNumber: 'TX-789012',
            createdAt: new Date('2023-01-15'),
            updatedAt: new Date('2024-01-15'),
            owner: {
              id: 'sample-owner-1',
              name: 'عبدالله الطرابلسي',
              phone: '0912345678',
              verified: true,
              accountType: 'COMPANY'
            }
          },
          {
            id: 'sample-company-2', 
            name: 'شركة الأمان للتأمين',
            description: 'نوفر خدمات التأمين الشامل للمركبات والممتلكات مع أفضل الأسعار والضمانات',
            logo: '/images/companies/default-company.svg',
            phone: '0913456789',
            email: 'info@alaman.ly',
            website: 'alaman-insurance.ly',
            city: 'بنغازي',
            area: 'الدهماني',
            address: 'شارع الكورنيش، برج التجارة',
            verified: true,
            featured: false,
            rating: 4.3,
            reviewsCount: 89,
            totalEmployees: 25,
            activeProjects: 8,
            status: 'APPROVED',
            businessType: ['تأمين', 'خدمات مالية'],
            specialties: ['تأمين سيارات', 'تأمين شامل', 'تعويضات سريعة'],
            establishedYear: 2018,
            openingHours: 'الأحد - الخميس: 9:00 AM - 5:00 PM',
            licenseNumber: 'IN-2018-045',
            taxNumber: 'TX-345678',
            createdAt: new Date('2023-03-20'),
            updatedAt: new Date('2024-02-10'),
            owner: {
              id: 'sample-owner-2',
              name: 'فاطمة البنغازي',
              phone: '0913456789',
              verified: true,
              accountType: 'COMPANY'
            }
          },
          {
            id: 'sample-company-3',
            name: 'شركة الصيانة المتقدمة',
            description: 'خدمات صيانة وإصلاح السيارات بأحدث التقنيات وقطع الغيار الأصلية مع ضمان الجودة',
            logo: '/images/companies/default-company.svg',
            phone: '0914567890',
            email: 'service@advanced.ly',
            website: null,
            city: 'مصراتة',
            area: 'الشط',
            address: 'الطريق الساحلي، مجمع الورش',
            verified: false,
            featured: false,
            rating: 4.7,
            reviewsCount: 156,
            totalEmployees: 18,
            activeProjects: 15,
            status: 'PENDING',
            businessType: ['صيانة', 'إصلاح'],
            specialties: ['صيانة محركات', 'كهرباء سيارات', 'قطع غيار'],
            establishedYear: 2020,
            openingHours: 'يومياً: 7:00 AM - 8:00 PM',
            licenseNumber: 'MT-2020-089',
            taxNumber: 'TX-901234',
            createdAt: new Date('2023-06-10'),
            updatedAt: new Date('2024-01-05'),
            owner: {
              id: 'sample-owner-3',
              name: 'محمد المصراتي',
              phone: '0914567890',
              verified: false,
              accountType: 'COMPANY'
            }
          }
        ];
      }

      return res.status(200).json({ 
        success: true, 
        companies, 
        total: companies.length,
        mock: companies.length > 0 && companies[0].id?.includes('sample')
      });
    }

    if (req.method === 'POST') {
      console.log('Request headers:', {
        authorization: req.headers.authorization ? '***' : 'undefined',
        cookie: req.headers.cookie ? '***' : 'undefined',
        'content-type': req.headers['content-type'],
      });

      // التحقق من المصادقة
      const user = await verifyToken(req);
      if (!user) {
        return res.status(401).json({ success: false, error: 'يتطلب تسجيل دخول' });
      }

      console.log('تم التحقق من المستخدم:', {
        id: user.id,
        name: user.name,
        accountType: user.accountType,
      });

      // التحقق من نوع الحساب - يجب أن يكون نوع شركة
      if (user.accountType !== 'COMPANY') {
        return res.status(403).json({
          success: false,
          error: 'هذه الخدمة متاحة فقط لحسابات الشركات. يرجى تحديث نوع حسابك أولاً.',
        });
      }

      // التحقق من عدم وجود شركة مسبقة لنفس المستخدم
      const existingCompany = await prisma.companies.findFirst({
        where: { ownerId: user.id },
      });

      if (existingCompany) {
        return res.status(409).json({
          success: false,
          error: 'لديك شركة مسجلة بالفعل. لا يمكن إنشاء أكثر من شركة واحدة لكل حساب.',
        });
      }

      const body = req.body || {};

      const required = ['name', 'city'];
      const missing = required.filter((f) => !body[f] || String(body[f]).trim() === '');
      if (missing.length > 0) {
        return res.status(400).json({
          success: false,
          error: `حقول مطلوبة: ${missing.join(', ')}`,
        });
      }

      // إنشاء الشركة مع الموافقة التلقائية لحسابات الشركات
      const company = await prisma.companies.create({
        data: {
          ownerId: user.id, // استخدام هوية المستخدم من المصادقة
          name: String(body.name).trim(),
          description: body.description ? String(body.description).trim() : undefined,
          logo: body.logo ? String(body.logo).trim() : undefined,
          phone: body.phone ? String(body.phone).trim() : undefined,
          email: body.email ? String(body.email).trim() : undefined,
          website: body.website ? String(body.website).trim() : undefined,
          city: String(body.city).trim(),
          area: body.area ? String(body.area).trim() : undefined,
          address: body.address ? String(body.address).trim() : undefined,
          businessType: Array.isArray(body.businessType)
            ? body.businessType.map((s: any) => String(s))
            : [],
          specialties: Array.isArray(body.specialties)
            ? body.specialties.map((s: any) => String(s))
            : [],
          openingHours: body.openingHours ? String(body.openingHours).trim() : undefined,
          establishedYear: body.establishedYear ? Number(body.establishedYear) : undefined,
          licenseNumber: body.licenseNumber ? String(body.licenseNumber).trim() : undefined,
          taxNumber: body.taxNumber ? String(body.taxNumber).trim() : undefined,
          // الموافقة التلقائية للشركات - بدون قيود
          status: 'APPROVED',
          verified: true,
          featured: false,
        },
      });

      return res.status(201).json({ success: true, company, message: 'تم إنشاء الشركة بنجاح' });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error: any) {
    console.error('خطأ في /api/companies:', error);
    // Development fallback for GET to avoid crashing pages when DB is unavailable
    if (process.env.NODE_ENV !== 'production' && req.method === 'GET') {
      try {
        const companies = getMockCompanies();
        return res.status(200).json({
          success: true,
          companies,
          total: companies.length,
          mock: true,
          message: 'Using mock companies in development due to data source error',
        });
      } catch (e) {
        // ignore and fall through to 500
      }
    }
    return res.status(500).json({ success: false, error: 'خطأ في الخادم', details: error.message });
  }
}
