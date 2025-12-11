/**
 * API إدارة تكاملات بوابات الدفع
 * Payment Gateway Integrations Management API
 */
import { NextApiRequest, NextApiResponse } from 'next';

// نوع التكامل
interface PaymentIntegration {
    id: string;
    name: string;
    nameAr: string;
    type: 'local' | 'international' | 'crypto';
    provider: string;
    status: 'connected' | 'disconnected' | 'error' | 'testing';
    apiEndpoint?: string;
    webhookUrl?: string;
    credentials: {
        key: string;
        value: string;
        isSecret: boolean;
        label: string;
    }[];
    testMode: boolean;
    lastSync?: string;
    supportedCurrencies: string[];
    features: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// تخزين مؤقت للتكاملات (في الإنتاج يجب استخدام قاعدة البيانات)
let integrationsStore: PaymentIntegration[] = [];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // التحقق من المصادقة
    const adminSession = req.cookies['admin-session'];
    if (!adminSession) {
        return res.status(401).json({
            success: false,
            message: 'غير مصرح - يرجى تسجيل الدخول',
        });
    }

    try {
        switch (req.method) {
            case 'GET':
                return handleGetIntegrations(req, res);
            case 'POST':
                return handleCreateIntegration(req, res);
            default:
                return res.status(405).json({
                    success: false,
                    message: 'طريقة غير مدعومة',
                });
        }
    } catch (error) {
        console.error('خطأ في API التكاملات:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ داخلي',
        });
    }
}

// جلب جميع التكاملات
async function handleGetIntegrations(req: NextApiRequest, res: NextApiResponse) {
    const { type, status } = req.query;

    let filteredIntegrations = [...integrationsStore];

    if (type && type !== 'all') {
        filteredIntegrations = filteredIntegrations.filter(i => i.type === type);
    }

    if (status && status !== 'all') {
        filteredIntegrations = filteredIntegrations.filter(i => i.status === status);
    }

    // إخفاء القيم السرية
    const safeIntegrations = filteredIntegrations.map(integration => ({
        ...integration,
        credentials: integration.credentials.map(cred => ({
            ...cred,
            value: cred.isSecret ? '••••••••' : cred.value,
        })),
    }));

    return res.status(200).json({
        success: true,
        integrations: safeIntegrations,
        stats: {
            total: integrationsStore.length,
            connected: integrationsStore.filter(i => i.status === 'connected').length,
            local: integrationsStore.filter(i => i.type === 'local').length,
            international: integrationsStore.filter(i => i.type === 'international').length,
            crypto: integrationsStore.filter(i => i.type === 'crypto').length,
        },
    });
}

// إنشاء تكامل جديد
async function handleCreateIntegration(req: NextApiRequest, res: NextApiResponse) {
    const integrationData = req.body;

    if (!integrationData.id || !integrationData.name || !integrationData.type) {
        return res.status(400).json({
            success: false,
            message: 'بيانات التكامل غير مكتملة',
        });
    }

    // التحقق من عدم وجود تكامل بنفس المعرف
    const existing = integrationsStore.find(i => i.id === integrationData.id);
    if (existing) {
        return res.status(400).json({
            success: false,
            message: 'يوجد تكامل بنفس المعرف',
        });
    }

    const newIntegration: PaymentIntegration = {
        ...integrationData,
        status: 'disconnected',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    integrationsStore.push(newIntegration);

    return res.status(201).json({
        success: true,
        message: 'تم إنشاء التكامل بنجاح',
        integration: newIntegration,
    });
}
