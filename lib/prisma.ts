import "server-only";
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function normalizePgUrl(input?: string | null): string | undefined {
  if (!input) return undefined;
  try {
    // Accept postgres:// and normalize to postgresql:// for Prisma
    let url = input.replace(/^postgres:\/\//, "postgresql://");
    const u = new URL(url);
    if (!u.pathname || u.pathname === "/") {
      u.pathname = "/NoxKeybordWritter"; // default database
    }
    return u.toString();
  } catch {
    return input;
  }
}

const runtimeUrl = normalizePgUrl(process.env.DB_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL);

// Ensure Prisma sees a valid postgresql:// URL via env as well
if (runtimeUrl) {
  process.env.DB_URL = runtimeUrl;
  process.env.DATABASE_URL = runtimeUrl; // Prisma schema uses DATABASE_URL
}

export const prisma = global.prisma || new PrismaClient(runtimeUrl ? { datasources: { db: { url: runtimeUrl } } } : undefined);
if (process.env.NODE_ENV !== "production") global.prisma = prisma;

export default prisma;
