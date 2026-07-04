import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

declare module "next-auth" {
  interface User {
    currentOrganizationId?: string | null;
    role?: string;
    superAdmin?: boolean;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      currentOrganizationId?: string | null;
      role?: string;
      superAdmin?: boolean;
    };
  }
}

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: (credentials.email as string).toLowerCase() },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatarUrl,
          currentOrganizationId: user.currentOrganizationId,
          role: user.role ?? "user",
          superAdmin: user.superAdmin ?? false,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.currentOrganizationId = user.currentOrganizationId;
        token.role = user.role;
        token.superAdmin = user.superAdmin;
      }
      if (trigger === "update") {
        const fresh = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, superAdmin: true, currentOrganizationId: true },
        });
        if (fresh) {
          token.role = fresh.role;
          token.superAdmin = fresh.superAdmin;
          if (session?.currentOrganizationId !== undefined) {
            token.currentOrganizationId = session.currentOrganizationId;
          } else {
            token.currentOrganizationId = fresh.currentOrganizationId;
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.currentOrganizationId = token.currentOrganizationId as string | undefined;
        session.user.role = token.role as string | undefined;
        session.user.superAdmin = token.superAdmin as boolean | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);