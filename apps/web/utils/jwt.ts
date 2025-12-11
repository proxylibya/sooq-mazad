import jwt, { JwtPayload } from 'jsonwebtoken';

export interface JWTPayload extends JwtPayload {
  userId: string;
  [key: string]: any;
}

function getJWTSecret(): string {
  const secret =
    process.env.JWT_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    (process.env.NODE_ENV !== 'production' ? 'dev-secret-change-me' : '');
  if (!secret) {
    throw new Error('JWT secret is not configured');
  }
  return secret;
}

// Safe verification that never throws, returns null when invalid
export function verifyJWT(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, getJWTSecret()) as JWTPayload | string;
    const payload: JWTPayload =
      typeof decoded === 'string' ? (JSON.parse(decoded) as JWTPayload) : decoded;

    // Normalize userId from common fields
    if (!payload.userId) {
      const candidate = (payload as any).sub || (payload as any).id || (payload as any).uid;
      if (candidate) {
        (payload as any).userId = String(candidate);
      }
    }

    return (payload as any).userId ? (payload as JWTPayload) : null;
  } catch {
    return null;
  }
}
