import type { NextApiRequest, NextApiResponse } from 'next';

// Stub endpoint لتعطيل next-auth ومنع كسر البناء
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return res.status(501).json({
    success: false,
    error: 'نظام المصادقة الخارجي (next-auth) غير مفعل في هذا البناء',
  });
}

// التصدير المطلوب لمنع أخطاء البناء
export const authOptions = {
  providers: [],
  session: {
    strategy: 'jwt' as const,
  },
  pages: {
    signIn: '/login',
  },
};
