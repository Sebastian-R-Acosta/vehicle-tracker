import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrisma() {
  const url = process.env.DATABASE_URL;
  if (process.env.DIRECT_URL && process.env.NODE_ENV === "production") {
    return new PrismaClient({
      log: ["error"],
      datasources: { db: { url } },
    });
  }
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    datasources: { db: { url } },
  });
}

export const prisma = globalForPrisma.prisma ?? createPrisma();
globalForPrisma.prisma = prisma;