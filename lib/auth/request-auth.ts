import { NextRequest } from 'next/server';
import { verifyToken, TokenPayload } from './jwt';

export function getUserFromRequest(request: NextRequest): TokenPayload | null {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  return verifyToken(token);
}

export function requireRole(payload: TokenPayload | null, allowedRoles: string[]) {
    if (!payload) throw new Error('Unauthorized');
    if (!allowedRoles.includes(payload.role)) {
        throw new Error('Forbidden: Insufficient permissions');
    }
}
