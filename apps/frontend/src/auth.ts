import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import type { NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
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
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!response.ok) {
            return null;
          }

          const data = await response.json();

          // El backend devuelve: { access_token, refresh_token, user }
          if (data.user) {
            return {
              id: data.user.id.toString(),
              email: data.user.email,
              name: data.user.name,
              image: null,
            };
          }

          return null;
        } catch (error) {
          console.error('Error en autorización:', error);
          return null;
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  pages: { 
    signIn: "/login",
    error: "/api/auth/error"
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.provider && profile) {
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.provider = token.provider as string;
      }
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
