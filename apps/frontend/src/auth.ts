import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";

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
  pages: { signIn: "/login" }, // mantiene tu /login
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.provider && profile) {
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.provider = (token as any).provider;
      return session;
    },
    async signIn({ user }) {
      // Si está activado, bloquea nuevos registros (permite solo inicio si ya hay control propio)
      const disabled = process.env.NEXT_PUBLIC_DISABLE_REGISTRATION === "true";
      if (!disabled) return true;

      // Estrategia mínima sin DB: permitir solo emails de dominio autorizado si se define ALLOWED_DOMAIN
      const allowedDomain = process.env.ALLOWED_DOMAIN?.toLowerCase();
      if (allowedDomain && user.email?.toLowerCase().endsWith(`@${allowedDomain}`)) {
        return true;
      }

      // Si necesitás validar contra DB, acá integrarías tu lookup y devolverías true/false.
      // Por defecto, rechaza para evitar auto-registro.
      return "/login?error=registration_disabled";
    },
  },
});
