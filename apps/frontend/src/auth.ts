import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import type { NextAuthOptions } from "next-auth"

const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET
const githubClientId = process.env.GITHUB_CLIENT_ID
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.aiquaa.com' : undefined,
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.aiquaa.com' : undefined,
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.aiquaa.com' : undefined,
      },
    },
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const { postJson } = await import('./lib/api');
          const data = await postJson('/api/v1/auth/login', {
            email: credentials.email,
            password: credentials.password,
          });

          // El backend devuelve: { access_token, refresh_token, user }
          if (data.user) {
            return {
              id: data.user.id.toString(),
              email: data.user.email,
              name: data.user.name,
              image: null,
              role: data.user.role,
              emailVerifiedAt: data.user.emailVerifiedAt ?? null,
              accessToken: data.access_token ?? null,
            };
          }

          return null;
        } catch (error) {
          console.error('Error en autorización:', error);
          return null;
        }
      }
    }),
    ...(googleClientId && googleClientSecret
      ? [
          GoogleProvider({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          }),
        ]
      : []),
    ...(githubClientId && githubClientSecret
      ? [
          GitHubProvider({
            clientId: githubClientId,
            clientSecret: githubClientSecret,
          }),
        ]
      : []),
  ],
  pages: { 
    signIn: "/login",
    error: "/api/auth/error"
  },
  callbacks: {
    async jwt({ token, account, profile, user }) {
      if (user) {
        token.sub = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = (user as { role?: string }).role;
        token.emailVerifiedAt = (user as { emailVerifiedAt?: string | null }).emailVerifiedAt;
        token.accessToken = (user as { accessToken?: string | null }).accessToken ?? undefined;
      }

      if (account?.provider && profile) {
        token.provider = account.provider;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub || "";
        session.user.role = token.role as string | undefined;
        session.user.emailVerifiedAt = token.emailVerifiedAt as string | null | undefined;
        session.user.provider = token.provider as string;
      }
      session.accessToken = token.accessToken as string | undefined;
      return session;
    },
    async signIn({ user }) {
      const disabled = process.env.NEXT_PUBLIC_DISABLE_REGISTRATION === "true";
      if (!disabled) return true;

      const allowedDomain = process.env.ALLOWED_DOMAIN?.toLowerCase();
      if (allowedDomain && user.email?.toLowerCase().endsWith(`@${allowedDomain}`)) {
        return true;
      }

      return "/login?error=registration_disabled";
    },
  },
}

export default NextAuth(authOptions)
