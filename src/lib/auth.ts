import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import PostgresAdapter from '@auth/pg-adapter';
import { authConfig } from '@/lib/auth.config';
import { pool } from '@/lib/db';

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PostgresAdapter(pool),
  // Only providers with credentials are registered, so a deployment without
  // (say) a Google OAuth client never sends people to a broken Google page.
  // The sign-in pages read the registered list from /api/auth/providers.
  providers: [
    ...(process.env.GITHUB_OAUTH_CLIENT_ID
      ? [
          GitHub({
            clientId: process.env.GITHUB_OAUTH_CLIENT_ID,
            clientSecret: process.env.GITHUB_OAUTH_CLIENT_SECRET,
          }),
        ]
      : []),
    ...(process.env.GOOGLE_OAUTH_CLIENT_ID
      ? [
          Google({
            clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
            clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, account }) {
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      if (session.user && token.provider) {
        session.user.provider = token.provider as string;
      }
      return session;
    },
  },
});
