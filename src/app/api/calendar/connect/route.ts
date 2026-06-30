import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: 'OAuth not configured' }, { status: 500 });
  }

  const url = new URL(request.url);
  const redirectUri = `${url.protocol}//${url.host}/api/calendar/callback`;
  
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.append('client_id', clientId);
  authUrl.searchParams.append('redirect_uri', redirectUri);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('scope', 'https://www.googleapis.com/auth/calendar.events');
  authUrl.searchParams.append('access_type', 'offline');
  authUrl.searchParams.append('prompt', 'consent');
  
  // Save state (returnTo path)
  const returnTo = url.searchParams.get('returnTo') || '/war-room';
  authUrl.searchParams.append('state', returnTo);

  return NextResponse.redirect(authUrl.toString());
}
