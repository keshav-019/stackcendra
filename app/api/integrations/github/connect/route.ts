import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { auth } from '@/lib/auth';

const STATE_COOKIE = 'github_integration_oauth_state';
const RETURN_TO_COOKIE = 'github_integration_return_to';

function isSafeRelativePath(path: string | null): path is string {
  return !!path && path.startsWith('/') && !path.startsWith('//');
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const { searchParams } = new URL(request.url);
  const returnTo = searchParams.get('returnTo');

  // Without an OAuth app there is nothing to connect to: send the user back
  // where they came from with an error the page can explain.
  const clientId = process.env.GITHUB_INTEGRATION_CLIENT_ID;
  if (!clientId) {
    const back = new URL(isSafeRelativePath(returnTo) ? returnTo : '/settings', request.url);
    back.searchParams.set('github_error', 'not_configured');
    return NextResponse.redirect(back);
  }

  const state = crypto.randomBytes(24).toString('hex');
  const cookieStore = await cookies();
  cookieStore.set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  });
  cookieStore.set(RETURN_TO_COOKIE, isSafeRelativePath(returnTo) ? returnTo : '/settings', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  });

  const redirectUri = new URL('/api/integrations/github/callback', request.url).toString();
  const authorizeUrl = new URL('https://github.com/login/oauth/authorize');
  authorizeUrl.searchParams.set('client_id', clientId);
  authorizeUrl.searchParams.set('redirect_uri', redirectUri);
  authorizeUrl.searchParams.set('scope', 'repo read:user');
  authorizeUrl.searchParams.set('state', state);

  return NextResponse.redirect(authorizeUrl.toString());
}
