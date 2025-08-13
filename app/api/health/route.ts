import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const url = process.env.DATABASE_URL || process.env.DB_URL || "";
  const info = (() => {
    try {
      const u = new URL(url.replace(/^postgres:\/\//, "postgresql://"));
      return {
        present: Boolean(url),
        scheme: u.protocol.replace(":", ""),
        host: u.hostname,
        port: u.port,
        dbname: u.pathname.replace(/^\//, ""),
        hasDbName: !!u.pathname && u.pathname !== "/",
        sslmode: u.searchParams.get("sslmode") || null,
      };
    } catch {
      return { present: Boolean(url), invalid: true } as any;
    }
  })();

  try {
    const t0 = Date.now();
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 800)),
    ]);
    const ms = Date.now() - t0;
    return NextResponse.json({ ok: true, db: "online", ms, info });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, db: "offline", error: err?.message || String(err), info },
      { status: 200 }
    );
  }
}
