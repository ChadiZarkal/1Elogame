import { NextRequest, NextResponse } from 'next/server';
import { createApiSuccess, createApiError } from '@/lib/utils';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

// Admin password hash from environment variable
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

// Simple token generation (in production, use a proper JWT library)
function generateToken(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `admin_${timestamp}_${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        createApiError('VALIDATION_ERROR', 'Mot de passe requis'),
        { status: 400 }
      );
    }

    // Check if we're in mock mode
    const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';

    if (isMockMode) {
      // In mock mode, accept "admin" as password
      if (password === 'admin') {
        const token = generateToken();
        return NextResponse.json(
          createApiSuccess({ token, expiresIn: 3600 })
        );
      }
      return NextResponse.json(
        createApiError('UNAUTHORIZED', 'Mot de passe incorrect'),
        { status: 401 }
      );
    }

    // In production, verify against hashed password
    if (!ADMIN_PASSWORD_HASH) {
      console.error('ADMIN_PASSWORD_HASH not configured');
      return NextResponse.json(
        createApiError('CONFIGURATION_ERROR', 'Authentification non configurée'),
        { status: 500 }
      );
    }

    const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);

    if (!isValid) {
      return NextResponse.json(
        createApiError('UNAUTHORIZED', 'Mot de passe incorrect'),
        { status: 401 }
      );
    }

    const token = generateToken();
    
    return NextResponse.json(
      createApiSuccess({ token, expiresIn: 3600 })
    );
  } catch (error) {
    console.error('Error in POST /api/admin/login:', error);
    return NextResponse.json(
      createApiError('INTERNAL_ERROR', 'Une erreur interne est survenue'),
      { status: 500 }
    );
  }
}
