import { NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/lib/calendar/google';
import { encryptToken } from '@/lib/calendar/crypto';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const returnTo = url.searchParams.get('state') || '/war-room';

  if (!code) {
    return NextResponse.redirect(new URL('/error', request.url));
  }

  try {
    const redirectUri = `${url.protocol}//${url.host}/api/calendar/callback`;
    const tokens = await exchangeCodeForTokens(code, redirectUri);

    if (tokens.access_token) {
      const encrypted = encryptToken(tokens.access_token);
      const cookieStore = await cookies();
      cookieStore.set('calendar_token', encrypted, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        maxAge: tokens.expires_in || 3600,
        path: '/'
      });
    }

    return NextResponse.redirect(new URL(returnTo, request.url));
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.redirect(new URL('/error', request.url));
  }
}
