/**
 * API إدارة تكامل فردي
 * Single Integration Management API
 */
import { NextApiRequest, NextApiResponse } from 'next';

// تخزين مؤقت (في الإنتاج يجب استخدام Prisma)
const integrationsStore: Map<string, any> = new Map();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // التحقق من المصادقة
    const adminSession = req.cookies['admin-session'];
    if (!adminSession) {
        return res.status(401).json({
            success: false,
            message: 'غير مصرح - يرجى تسجيل الدخول',
        });
    }

    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({
            success: false,
            message: 'معرف التكامل مطلوب',
        });
    }

    try {
        switch (req.method) {
            case 'GET':
                return handleGetIntegration(id, res);
            case 'PUT':
                return handleUpdateIntegration(id, req, res);
            case 'DELETE':
                return handleDeleteIntegration(id, res);
            default:
                return res.status(405).json({
                    success: false,
                    message: 'طريقة غير مدعومة',
                });
        }
    } catch (error) {
        console.error('خطأ في API التكامل:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ داخلي',
        });
    }
}

// جلب تكامل محدد
function handleGetIntegration(id: string, res: NextApiResponse) {
    const integration = integrationsStore.get(id);

    if (!integration) {
        return res.status(404).json({
            success: false,
            message: 'التكامل غير موجود',
        });
    }

    // إخفاء القيم السرية
    const safeIntegration = {
        ...integration,
        credentials: integration.credentials?.map((cred: any) => ({
            ...cred,
            value: cred.isSecret ? '••••••••' : cred.value,
        })),
    };

    return res.status(200).json({
        success: true,
        integration: safeIntegration,
    });
}

// تحديث تكامل
function handleUpdateIntegration(id: string, req: NextApiRequest, res: NextApiResponse) {
    const updateData = req.body;

    // في الإنتاج، يجب تحديث قاعدة البيانات
    const existingIntegration = integrationsStore.get(id) || { id };

    const updatedIntegration = {
        ...existingIntegration,
        ...updateData,
        id, // تأكيد المعرف
        updatedAt: new Date().toISOString(),
    };

    integrationsStore.set(id, updatedIntegration);

    console.log(`[INTEGRATION UPDATE] ${id}:`, {
        type: updatedIntegration.type,
        provider: updatedIntegration.provider,
        testMode: updatedIntegration.testMode,
    });

    return res.status(200).json({
        success: true,
        message: 'تم تحديث التكامل بنجاح',
        integration: {
            ...updatedIntegration,
            credentials: updatedIntegration.credentials?.map((cred: any) => ({
                ...cred,
                value: cred.isSecret ? '••••••••' : cred.value,
            })),
        },
    });
}

// حذف تكامل
function handleDeleteIntegration(id: string, res: NextApiResponse) {
    if (integrationsStore.has(id)) {
        integrationsStore.delete(id);
    }

    return res.status(200).json({
        success: true,
        message: 'تم حذف التكامل بنجاح',
    });
}
