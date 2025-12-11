import { NextApiRequest, NextApiResponse } from 'next';
import { CenterApplicationRequest } from '../../types/internationalCenters';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getApplications(req, res);
      case 'POST':
        return await submitApplication(req, res);
      case 'PUT':
        return await updateApplication(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('خطأ في API طلبات المراكز:', error);
    return res.status(500).json({ error: 'خطأ في الخادم الداخلي' });
  }
}

async function getApplications(req: NextApiRequest, res: NextApiResponse) {
  const { status, country, page = 1, limit = 10 } = req.query;

  // تم حذف البيانات التجريبية لطلبات إنشاء المراكز
  const applications: CenterApplicationRequest[] = [];

  // تطبيق الفلاتر
  let filteredApplications = applications;

  if (status) {
    filteredApplications = filteredApplications.filter((app) => app.status === status);
  }

  if (country) {
    filteredApplications = filteredApplications.filter(
      (app) => app.proposedCenter.country === country,
    );
  }

  // تطبيق التصفح
  const startIndex = (Number(page) - 1) * Number(limit);
  const endIndex = startIndex + Number(limit);
  const paginatedApplications = filteredApplications.slice(startIndex, endIndex);

  return res.status(200).json({
    success: true,
    data: paginatedApplications,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(filteredApplications.length / Number(limit)),
      totalItems: filteredApplications.length,
      itemsPerPage: Number(limit),
    },
    summary: {
      pending: applications.filter((app) => app.status === 'pending').length,
      under_review: applications.filter((app) => app.status === 'under_review').length,
      approved: applications.filter((app) => app.status === 'approved').length,
      rejected: applications.filter((app) => app.status === 'rejected').length,
    },
  });
}

async function submitApplication(req: NextApiRequest, res: NextApiResponse) {
  const applicationData = req.body;

  // التحقق من صحة البيانات
  const requiredFields = [
    'applicant.name',
    'applicant.email',
    'applicant.phone',
    'proposedCenter.name',
    'proposedCenter.country',
    'proposedCenter.city',
  ];

  for (const field of requiredFields) {
    const fieldValue = field.split('.').reduce((obj, key) => obj?.[key], applicationData);
    if (!fieldValue) {
      return res.status(400).json({
        error: `الحقل ${field} مطلوب`,
        field,
      });
    }
  }

  // إنشاء طلب جديد
  const newApplication: CenterApplicationRequest = {
    ...applicationData,
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // إرسال إشعار للإدارة
  console.log('طلب جديد لإنشاء مركز:', {
    applicant: newApplication.applicant.name,
    country: newApplication.proposedCenter.country,
    city: newApplication.proposedCenter.city,
  });

  return res.status(201).json({
    success: true,
    message: 'تم تقديم الطلب بنجاح. سيتم مراجعته خلال 5-7 أيام عمل.',
    data: newApplication,
  });
}

async function updateApplication(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const updateData = req.body;

  if (!id) {
    return res.status(400).json({ error: 'معرف الطلب مطلوب' });
  }

  // تحديث حالة الطلب
  const updatedApplication = {
    ...updateData,
    updatedAt: new Date(),
  };

  // إرسال إشعار للمتقدم حسب الحالة الجديدة
  if (updateData.status === 'approved') {
    // إرسال بريد إلكتروني للمتقدم
  } else if (updateData.status === 'rejected') {
    // إرسال بريد إلكتروني بأسباب الرفض
  }

  return res.status(200).json({
    success: true,
    message: 'تم تحديث الطلب بنجاح',
    data: updatedApplication,
  });
}

export default handler;
