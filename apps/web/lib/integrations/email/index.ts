// @ts-nocheck
/**
 * 📧 نظام البريد الإلكتروني الموحد
 * يدير جميع عمليات إرسال البريد الإلكتروني
 */

import nodemailer from 'nodemailer';

// ==========================================
// EMAIL INTERFACES
// ==========================================

interface EmailOptions {
    to: string | string[];
    subject?: string;
    html?: string;
    text?: string;
    template?: string;
    variables?: Record<string, any>;
    attachments?: any[];
}

interface EmailConfig {
    from: string;
    fromName: string;
    replyTo?: string;
    provider: 'smtp' | 'sendgrid' | 'mailgun' | 'mock';
}

// ==========================================
// EMAIL TEMPLATES
// ==========================================

const templates = {
    welcome: {
        subject: 'مرحباً بك في سوق المزاد',
        html: (vars: any) => `
      <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;">
        <h1 style="color: #2563eb;">مرحباً ${vars.name}!</h1>
        <p>شكراً لانضمامك إلى سوق المزاد.</p>
        <p>يمكنك الآن:</p>
        <ul>
          <li>تصفح المزادات النشطة</li>
          <li>المشاركة في المزايدات</li>
          <li>إضافة سياراتك للبيع</li>
        </ul>
        <a href="${vars.url || 'https://sooq-mazad.com'}" 
           style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          ابدأ التصفح
        </a>
      </div>
    `
    },

    passwordReset: {
        subject: 'إعادة تعيين كلمة المرور',
        html: (vars: any) => `
      <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>إعادة تعيين كلمة المرور</h2>
        <p>تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بك.</p>
        <p>اضغط على الرابط التالي خلال ساعة واحدة:</p>
        <a href="${vars.resetLink}" 
           style="background: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          إعادة تعيين كلمة المرور
        </a>
        <p style="margin-top: 20px; color: #666;">
          إذا لم تطلب هذا، يمكنك تجاهل هذا البريد.
        </p>
      </div>
    `
    },

    verification: {
        subject: 'رمز التحقق',
        html: (vars: any) => `
      <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
        <h2>رمز التحقق</h2>
        <p>رمز التحقق الخاص بك هو:</p>
        <div style="font-size: 32px; font-weight: bold; color: #2563eb; 
                    background: #f3f4f6; padding: 20px; border-radius: 10px; letter-spacing: 5px;">
          ${vars.code}
        </div>
        <p style="margin-top: 20px; color: #666;">
          هذا الرمز صالح لمدة 10 دقائق.
        </p>
      </div>
    `
    },

    auctionWin: {
        subject: 'مبروك! لقد فزت بالمزاد',
        html: (vars: any) => `
      <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;">
        <h1 style="color: #16a34a;">🎉 مبروك!</h1>
        <p>لقد فزت بالمزاد التالي:</p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 10px; margin: 20px 0;">
          <strong>${vars.auctionTitle}</strong>
          <p>المبلغ النهائي: <strong>${vars.amount} د.ل</strong></p>
        </div>
        <p>يرجى إتمام عملية الدفع خلال 48 ساعة.</p>
        <a href="${vars.paymentUrl || '#'}" 
           style="background: #16a34a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          إتمام الدفع
        </a>
      </div>
    `
    }
};

// ==========================================
// EMAIL MANAGER
// ==========================================

class EmailManager {
    private transporter: any = null;
    private config: EmailConfig;

    constructor() {
        this.config = {
            from: process.env.EMAIL_FROM || 'noreply@sooq-mazad.com',
            fromName: process.env.EMAIL_FROM_NAME || 'سوق المزاد',
            replyTo: process.env.EMAIL_REPLY_TO,
            provider: (process.env.EMAIL_PROVIDER as any) || 'mock'
        };

        this.initializeTransporter();
    }

    private initializeTransporter() {
        const provider = this.config.provider;

        if (provider === 'mock') {
            console.log('[EmailManager] Using mock provider');
            return;
        }

        if (provider === 'smtp') {
            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST || 'smtp.gmail.com',
                port: parseInt(process.env.SMTP_PORT || '587'),
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });
        } else if (provider === 'sendgrid') {
            this.transporter = nodemailer.createTransport({
                host: 'smtp.sendgrid.net',
                port: 587,
                auth: {
                    user: 'apikey',
                    pass: process.env.SENDGRID_API_KEY
                }
            });
        }
    }

    async send(options: EmailOptions): Promise<boolean> {
        try {
            let html = options.html;
            let subject = options.subject;

            // استخدام القالب إذا تم تحديده
            if (options.template && templates[options.template as keyof typeof templates]) {
                const tmpl = templates[options.template as keyof typeof templates];
                subject = subject || tmpl.subject;
                html = tmpl.html(options.variables || {});
            }

            if (this.config.provider === 'mock') {
                console.log(`[EmailManager] Mock send to: ${options.to}`);
                console.log(`[EmailManager] Subject: ${subject}`);
                return true;
            }

            if (!this.transporter) {
                console.error('[EmailManager] Transporter not initialized');
                return false;
            }

            await this.transporter.sendMail({
                from: `"${this.config.fromName}" <${this.config.from}>`,
                to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
                subject,
                html,
                text: options.text,
                replyTo: this.config.replyTo,
                attachments: options.attachments
            });

            console.log(`[EmailManager] Email sent to: ${options.to}`);
            return true;
        } catch (error: any) {
            console.error('[EmailManager] Send failed:', error.message);
            return false;
        }
    }

    // دوال مساعدة للقوالب الشائعة
    async sendWelcomeEmail(to: string, name: string): Promise<boolean> {
        return this.send({
            to,
            template: 'welcome',
            variables: { name }
        });
    }

    async sendPasswordReset(to: string, resetLink: string): Promise<boolean> {
        return this.send({
            to,
            template: 'passwordReset',
            variables: { resetLink }
        });
    }

    async sendVerification(to: string, code: string): Promise<boolean> {
        return this.send({
            to,
            template: 'verification',
            variables: { code }
        });
    }

    async sendAuctionWin(to: string, auctionTitle: string, amount: number, paymentUrl?: string): Promise<boolean> {
        return this.send({
            to,
            template: 'auctionWin',
            variables: { auctionTitle, amount, paymentUrl }
        });
    }
}

// ==========================================
// EXPORTS
// ==========================================

let emailManagerInstance: EmailManager | null = null;

export function getEmailManager(): EmailManager {
    if (!emailManagerInstance) {
        emailManagerInstance = new EmailManager();
    }
    return emailManagerInstance;
}

export { EmailManager, templates };
export type { EmailConfig, EmailOptions };

