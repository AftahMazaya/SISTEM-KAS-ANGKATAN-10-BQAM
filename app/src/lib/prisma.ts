import { PrismaClient } from "@prisma/client";

// Di Next.js dev mode, setiap hot-reload bikin instance baru
// Ini menyebabkan "too many database connections" — solusinya pakai global singleton
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
