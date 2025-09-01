import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, account, profile }: any) {
      if (account?.provider && profile) {
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }: any) {
      session.user.provider = (token as any).provider;
      return session;
    },
    async signIn({ user }: any) {
      const disabled = process.env.NEXT_PUBLIC_DISABLE_REGISTRATION === "true";
      if (!disabled) return true;

      const allowedDomain = process.env.ALLOWED_DOMAIN?.toLowerCase();
      if (allowedDomain && user.email?.toLowerCase().endsWith(`@${allowedDomain}`)) {
        return true;
      }

      return "/login?error=registration_disabled";
    },
  },
} as any)
