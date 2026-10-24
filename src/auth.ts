import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        const email = String(credentials?.email || "");
        const password = String(credentials?.password || "");
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.emailVerified) return null;
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;
        return { id: user.id, email: user.email };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) token.userId = user.id;
      return token;
    },
    async session({ session, token }: any) {
      if (token?.userId) (session.user as { id?: string }).id = String(token.userId);
      return session;
    },
  },
});
