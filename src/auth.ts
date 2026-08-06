import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import type { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

declare module "next-auth/jwt" {
  interface JWT {
    primaryColor?: string;
  }
}

declare module "next-auth" {
  interface User {
    currentOrganizationId?: string | null;
    role?: string;
    superAdmin?: boolean;
    industryType?: string;
    primaryColor?: string;
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
      industryType?: string;
      primaryColor?: string;
    };
  }
}

/**
 * Google sign-in issues a JWT but never touched the database, so `user.id` was the
 * Google subject id and no matching User row existed. Provision the row here — same
 * shape the credentials registration produces — and hand back our own id.
 */
async function ensureGoogleUser(input: {
  email: string;
  name?: string | null;
  image?: string | null;
  googleId?: string | null;
}): Promise<string> {
  const email = input.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    // Someone who registered with a password and later used "Sign in with Google"
    // keeps the same account; just backfill what Google gave us.
    if ((!existing.googleId && input.googleId) || (!existing.avatarUrl && input.image)) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          googleId: existing.googleId ?? input.googleId ?? null,
          avatarUrl: existing.avatarUrl ?? input.image ?? null,
        },
      });
    }
    return existing.id;
  }

  const created = await prisma.user.create({
    data: {
      email,
      name: input.name ?? null,
      avatarUrl: input.image ?? null,
      googleId: input.googleId ?? null,
      onboardingCompleted: false,
      // Google has no separate consent step; the login screen carries the notice.
      termsAcceptedAt: new Date(),
    },
  });

  const freePlan = await prisma.subscriptionPlan.findUnique({ where: { tier: "free" } });
  if (freePlan) {
    await prisma.subscription.create({
      data: { userId: created.id, planId: freePlan.id, status: "active" },
    });
  }

  return created.id;
}

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

export const authConfig: NextAuthConfig = {
  providers: [
    // Only register Google when real credentials exist. An empty client_id makes
    // Google's OAuth endpoint reject the flow with 401 invalid_client.
    ...(googleClientId && googleClientSecret
      ? [Google({ clientId: googleClientId, clientSecret: googleClientSecret })]
      : []),
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
    async signIn({ user, account }) {
      if (account?.provider === "google" && user?.email) {
        try {
          await ensureGoogleUser({
            email: user.email,
            name: user.name,
            image: user.image,
            googleId: account.providerAccountId,
          });
        } catch (e) {
          console.error("[auth] Could not provision Google user:", e);
          // Better to refuse the sign-in than to hand out a session whose user id
          // matches no row in the database.
          return false;
        }
      }

      if (user?.email) {
        const method = account?.provider === "google" ? "Google" : "email & password";
        import("@/lib/email").then(({ sendNewLoginEmail }) =>
          sendNewLoginEmail(user.email!, user.name || "there", {
            method,
            timestamp: new Date().toLocaleString(),
          })
        ).catch((e) => console.error("[email] Login notification failed:", e));
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        // Google hands us its own subject id, so always resolve against our User
        // table before anything downstream treats token.id as a database id.
        const dbUser = user.email
          ? await prisma.user.findUnique({
              where: { email: user.email.toLowerCase() },
              select: { id: true, role: true, superAdmin: true, currentOrganizationId: true },
            })
          : null;

        token.id = dbUser?.id ?? user.id;
        token.currentOrganizationId = dbUser?.currentOrganizationId ?? user.currentOrganizationId;
        token.role = dbUser?.role ?? user.role ?? "user";
        token.superAdmin = dbUser?.superAdmin ?? user.superAdmin ?? false;
        const orgId = token.currentOrganizationId as string | null | undefined;
        if (orgId) {
          const org = await prisma.organization.findUnique({
            where: { id: orgId },
            select: { industryType: true, primaryColor: true },
          });
          token.industryType = org?.industryType ?? "construction";
          token.primaryColor = org?.primaryColor ?? "#2563eb";
        } else {
          token.industryType = "construction";
          token.primaryColor = "#2563eb";
        }
      }
      if (trigger === "update") {
        const fresh = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, superAdmin: true, currentOrganizationId: true },
        });
        if (fresh) {
          token.role = fresh.role;
          token.superAdmin = fresh.superAdmin;
          const newOrgId = session?.currentOrganizationId !== undefined
            ? session.currentOrganizationId
            : fresh.currentOrganizationId;
          token.currentOrganizationId = newOrgId;
          if (newOrgId) {
            const org = await prisma.organization.findUnique({
              where: { id: newOrgId },
              select: { industryType: true, primaryColor: true },
            });
            token.industryType = org?.industryType ?? "construction";
            token.primaryColor = org?.primaryColor ?? "#2563eb";
          } else {
            token.industryType = "construction";
            token.primaryColor = "#2563eb";
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
        session.user.industryType = token.industryType as string | undefined;
        session.user.primaryColor = token.primaryColor as string | undefined;
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