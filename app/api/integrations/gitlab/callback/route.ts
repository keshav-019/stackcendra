import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { appUrl } from '@/lib/app-url';
import { auth } from '@/lib/auth';
import { fetchGitlabUser, saveConnection } from '@/lib/integrations';

const STATE_COOKIE = 'gitlab_integration_oauth_state';
const RETURN_TO_COOKIE = 'gitlab_integration_return_to';

function isSafeRelativePath(path: string | undefined): path is string {
  return !!path && path.startsWith('/') && !path.startsWith('//');
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.redirect(appUrl('/login', request));
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const cookieStore = await cookies();
  const returnToCookie = cookieStore.get(RETURN_TO_COOKIE)?.value;
  const returnTo = isSafeRelativePath(returnToCookie) ? returnToCookie : '/settings';
  const settingsUrl = appUrl(returnTo, request);
  cookieStore.delete(RETURN_TO_COOKIE);

  if (error) {
    settingsUrl.searchParams.set('gitlab_error', error);
    return NextResponse.redirect(settingsUrl.toString());
  }

  const expectedState = cookieStore.get(STATE_COOKIE)?.value;
  cookieStore.delete(STATE_COOKIE);

  if (!code || !state || !expectedState || state !== expectedState) {
    settingsUrl.searchParams.set('gitlab_error', 'invalid_state');
    return NextResponse.redirect(settingsUrl.toString());
  }

  const clientId = process.env.GITLAB_INTEGRATION_CLIENT_ID;
  const clientSecret = process.env.GITLAB_INTEGRATION_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    settingsUrl.searchParams.set('gitlab_error', 'not_configured');
    return NextResponse.redirect(settingsUrl.toString());
  }

  const redirectUri = appUrl('/api/integrations/gitlab/callback', request).toString();
  const tokenRes = await fetch('https://gitlab.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenRes.ok) {
    settingsUrl.searchParams.set('gitlab_error', 'token_exchange_failed');
    return NextResponse.redirect(settingsUrl.toString());
  }

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    settingsUrl.searchParams.set('gitlab_error', tokenData.error ?? 'no_access_token');
    return NextResponse.redirect(settingsUrl.toString());
  }

  const gitlabUser = await fetchGitlabUser(tokenData.access_token);

  await saveConnection({
    userId: session.user.id,
    provider: 'gitlab',
    accessToken: tokenData.access_token,
    providerAccountLogin: gitlabUser.username,
    scope: tokenData.scope ?? '',
    refreshToken: tokenData.refresh_token ?? null,
    expiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null,
  });

  settingsUrl.searchParams.set('gitlab_connected', '1');
  return NextResponse.redirect(settingsUrl.toString());
}
