import { NextApiRequest, NextApiResponse } from 'next';
import { getKeyDBClient } from './keydb';
import crypto from 'crypto';

interface CaptchaChallenge {
  id: string;
  question: string;
  answer: string;
  type: 'math' | 'text' | 'image';
  createdAt: number;
  expiresAt: number;
}

interface CaptchaOptions {
  difficulty?: 'easy' | 'medium' | 'hard';
  type?: 'math' | 'text';
  ttl?: number; // بالثواني
}

class CaptchaService {
  private readonly keydbClient = getKeyDBClient();
  private readonly defaultTTL = 300; // 5 دقائق

  // توليد تحدي CAPTCHA رياضي
  private generateMathChallenge(difficulty: 'easy' | 'medium' | 'hard'): {
    question: string;
    answer: string;
  } {
    let num1: number, num2: number, operation: string, answer: number;

    switch (difficulty) {
      case 'easy':
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        operation = Math.random() > 0.5 ? '+' : '-';
        if (operation === '+') {
          answer = num1 + num2;
        } else {
          // تأكد من أن النتيجة موجبة
          if (num1 < num2) [num1, num2] = [num2, num1];
          answer = num1 - num2;
        }
        break;

      case 'medium':
        num1 = Math.floor(Math.random() * 20) + 1;
        num2 = Math.floor(Math.random() * 20) + 1;
        const ops = ['+', '-', '*'];
        operation = ops[Math.floor(Math.random() * ops.length)];

        if (operation === '+') {
          answer = num1 + num2;
        } else if (operation === '-') {
          if (num1 < num2) [num1, num2] = [num2, num1];
          answer = num1 - num2;
        } else {
          // للضرب، استخدم أرقام أصغر
          num1 = Math.floor(Math.random() * 10) + 1;
          num2 = Math.floor(Math.random() * 10) + 1;
          answer = num1 * num2;
        }
        break;

      case 'hard':
        num1 = Math.floor(Math.random() * 50) + 1;
        num2 = Math.floor(Math.random() * 50) + 1;
        const hardOps = ['+', '-', '*'];
        operation = hardOps[Math.floor(Math.random() * hardOps.length)];

        if (operation === '+') {
          answer = num1 + num2;
        } else if (operation === '-') {
          if (num1 < num2) [num1, num2] = [num2, num1];
          answer = num1 - num2;
        } else {
          num1 = Math.floor(Math.random() * 15) + 1;
          num2 = Math.floor(Math.random() * 15) + 1;
          answer = num1 * num2;
        }
        break;
    }

    return {
      question: `${num1} ${operation} ${num2} = ؟`,
      answer: answer.toString(),
    };
  }

  // توليد تحدي نصي
  private generateTextChallenge(): { question: string; answer: string } {
    const challenges = [
      { question: 'ما هو لون السماء؟', answer: 'أزرق' },
      { question: 'كم عدد أيام الأسبوع؟', answer: '7' },
      { question: 'ما هي عاصمة مصر؟', answer: 'القاهرة' },
      { question: 'كم عدد شهور السنة؟', answer: '12' },
      { question: 'ما هو أكبر محيط في العالم؟', answer: 'الهادئ' },
      { question: 'كم عدد حروف الأبجدية العربية؟', answer: '28' },
      { question: 'ما هي أطول قارة في العالم؟', answer: 'آسيا' },
      { question: 'في أي اتجاه تشرق الشمس؟', answer: 'الشرق' },
    ];

    const challenge = challenges[Math.floor(Math.random() * challenges.length)];
    return challenge;
  }

  // إنشاء CAPTCHA جديد
  async createCaptcha(
    options: CaptchaOptions = {},
  ): Promise<{ id: string; question: string; type: string }> {
    const { difficulty = 'easy', type = 'math', ttl = this.defaultTTL } = options;

    const id = crypto.randomBytes(16).toString('hex');
    const now = Date.now();

    let challenge: { question: string; answer: string };

    if (type === 'math') {
      challenge = this.generateMathChallenge(difficulty);
    } else {
      challenge = this.generateTextChallenge();
    }

    const captchaData: CaptchaChallenge = {
      id,
      question: challenge.question,
      answer: challenge.answer.toLowerCase().trim(),
      type,
      createdAt: now,
      expiresAt: now + ttl * 1000,
    };

    // حفظ في KeyDB
    if (this.keydbClient) {
      const key = `captcha:${id}`;
      this.keydbClient && await this.keydbClient.setex(key, ttl, JSON.stringify(captchaData));
    } else {
      // Fallback للذاكرة المحلية
      this.memoryCaptchas.set(id, captchaData);
    }

    return {
      id,
      question: challenge.question,
      type,
    };
  }

  // التحقق من إجابة CAPTCHA
  async verifyCaptcha(id: string, userAnswer: string): Promise<boolean> {
    try {
      let captchaData: CaptchaChallenge | null = null;

      // البحث في KeyDB أولاً
      if (this.keydbClient) {
        const key = `captcha:${id}`;
        const data = await this.keydbClient.get(key);
        if (data) {
          captchaData = JSON.parse(data as string);
          // حذف CAPTCHA بعد الاستخدام
          await this.keydbClient?.del(key);
        }
      } else {
        // البحث في الذاكرة المحلية
        captchaData = this.memoryCaptchas.get(id) || null;
        if (captchaData) {
          this.memoryCaptchas.delete(id);
        }
      }

      if (!captchaData) {
        return false;
      }

      // التحقق من انتهاء الصلاحية
      if (Date.now() > captchaData.expiresAt) {
        return false;
      }

      // مقارنة الإجابة
      const normalizedUserAnswer = userAnswer.toLowerCase().trim();
      const normalizedCorrectAnswer = captchaData.answer.toLowerCase().trim();

      return normalizedUserAnswer === normalizedCorrectAnswer;
    } catch (error) {
      console.error('خطأ في التحقق من CAPTCHA:', error);
      return false;
    }
  }

  // تنظيف CAPTCHA المنتهية الصلاحية من الذاكرة
  private memoryCaptchas = new Map<string, CaptchaChallenge>();

  private cleanupExpiredCaptchas(): void {
    const now = Date.now();
    for (const [id, captcha] of this.memoryCaptchas.entries()) {
      if (now > captcha.expiresAt) {
        this.memoryCaptchas.delete(id);
      }
    }
  }

  // إحصائيات CAPTCHA
  async getCaptchaStats(): Promise<{
    totalActive: number;
    totalCreatedToday: number;
    successRate: number;
  }> {
    try {
      let totalActive = 0;
      let totalCreatedToday = 0;

      if (this.keydbClient) {
        const keys = await this.keydbClient.keys('captcha:*');
        totalActive = keys.length;

        // حساب المنشأة اليوم
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        for (const key of keys) {
          const data = await this.keydbClient.get(key);
          if (data) {
            const captcha: CaptchaChallenge = JSON.parse(data as string);
            if (captcha.createdAt > oneDayAgo) {
              totalCreatedToday++;
            }
          }
        }
      } else {
        totalActive = this.memoryCaptchas.size;
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        for (const captcha of this.memoryCaptchas.values()) {
          if (captcha.createdAt > oneDayAgo) {
            totalCreatedToday++;
          }
        }
      }

      return {
        totalActive,
        totalCreatedToday,
        successRate: 0.75, // يمكن تحسينها بإضافة تتبع للنجاح
      };
    } catch (error) {
      console.error('خطأ في الحصول على إحصائيات CAPTCHA:', error);
      return { totalActive: 0, totalCreatedToday: 0, successRate: 0 };
    }
  }
}

export const captchaService = new CaptchaService();

// Middleware للتحقق من CAPTCHA
export function withCaptcha(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
  required: boolean = true,
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'GET') {
      // للـ GET requests، إرجاع CAPTCHA جديد
      const captcha = await captchaService.createCaptcha();
      return res.status(200).json(captcha);
    }

    if (required && (req.method === 'POST' || req.method === 'PUT')) {
      const { captchaId, captchaAnswer } = req.body;

      if (!captchaId || !captchaAnswer) {
        return res.status(400).json({
          error: 'CAPTCHA مطلوب',
          message: 'يجب تقديم معرف ومن إجابة CAPTCHA',
        });
      }

      const isValid = await captchaService.verifyCaptcha(captchaId, captchaAnswer);
      if (!isValid) {
        return res.status(400).json({
          error: 'CAPTCHA غير صحيح',
          message: 'الإجابة غير صحيحة أو انتهت صلاحية CAPTCHA',
        });
      }
    }

    return handler(req, res);
  };
}

// HOCs محددة لحالات الاستخدام
export const withAuthCaptcha = (
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
) => withCaptcha(handler, true);

export const withContactCaptcha = (
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
) => withCaptcha(handler, true);

export const withCommentCaptcha = (
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
) => withCaptcha(handler, true);

// تنظيف دوري للـ CAPTCHA المنتهية الصلاحية (كل 10 دقائق)
setInterval(
  () => {
    if (captchaService['cleanupExpiredCaptchas']) {
      captchaService['cleanupExpiredCaptchas']();
    }
  },
  10 * 60 * 1000,
);
