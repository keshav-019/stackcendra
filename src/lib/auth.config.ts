import type { NextAuthConfig } from 'next-auth';

const PUBLIC_PATHS = ['/login', '/signup'];

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: '/login',
    // Failed sign-ins come back to /login?error=<code> (shown inline there)
    // instead of Auth.js's unstyled default error page.
    error: '/login',
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isPublicPath = PUBLIC_PATHS.some((path) => nextUrl.pathname.startsWith(path));

      if (isPublicPath) {
        if (isLoggedIn) {
          return Response.redirect(new URL('/', nextUrl));
        }
        return true;
      }

      return isLoggedIn;
    },
  },
} satisfies NextAuthConfig;
