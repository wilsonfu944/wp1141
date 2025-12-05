import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, TokenPayload } from './jwt';

export interface AuthRequest extends NextRequest {
  user?: TokenPayload;
}

export function getAuthUser(request: NextRequest): TokenPayload | null {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return null;
  }

  try {
    return verifyToken(token);
  } catch (error) {
    return null;
  }
}

export function requireAuth(request: NextRequest): { user: TokenPayload } | NextResponse {
  const user = getAuthUser(request);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Access token required' },
      { status: 401 }
    );
  }

  return { user };
}

