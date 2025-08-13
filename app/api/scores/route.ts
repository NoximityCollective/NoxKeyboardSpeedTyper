import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// In-memory fallback when DB is unreachable (dev convenience)
let MEMORY_SCORES: { username: string; wpm: number; duration: number; createdAt: Date }[] = [];

async function withDbTimeout<T>(op: () => Promise<T>, ms = 600): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("db_timeout")), ms)
  );
  return (Promise.race([op(), timeout]) as unknown) as Promise<T>;
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const durationParam = url.searchParams.get("duration");
  const allowed = new Set(["15", "30", "60"]);
  const filter: any = {};
  if (durationParam && allowed.has(durationParam)) {
    filter.duration = Number(durationParam);
  }

  try {
    const scores = await withDbTimeout(
      () =>
        prisma.score.findMany({
          where: filter,
          orderBy: [{ wpm: "desc" }, { createdAt: "asc" }],
          take: 50,
          select: { username: true, wpm: true, duration: true, createdAt: true },
        }),
      800
    );
    return NextResponse.json({ scores, source: "db" });
  } catch (err: any) {
    console.warn("Scores GET falling back to memory:", err?.message || err);
    const scores = [...MEMORY_SCORES]
      .filter((s) => (filter.duration ? s.duration === filter.duration : true))
      .sort((a, b) => b.wpm - a.wpm || +a.createdAt - +b.createdAt)
      .slice(0, 50)
      .map(({ username, wpm, createdAt, duration }) => ({ username, wpm, createdAt, duration }));
    return NextResponse.json({ scores, source: "memory" });
  }
}

export async function POST(request: Request) {
  try {
    const { username, wpm, duration } = await request.json();

    const name = String(username || "").trim().slice(0, 24);
    const w = Number(wpm);
    const d = Number(duration);

    if (!name || !/^[A-Za-z0-9_\-\. ]{1,24}$/.test(name)) {
      return NextResponse.json({ error: "Invalid username" }, { status: 400 });
    }
    if (!Number.isFinite(w) || w <= 0 || w > 400) {
      return NextResponse.json({ error: "Invalid wpm" }, { status: 400 });
    }
    if (![15, 30, 60].includes(d)) {
      return NextResponse.json({ error: "Invalid duration" }, { status: 400 });
    }

    try {
      await withDbTimeout(
        () =>
          prisma.score.create({
            data: { username: name, wpm: Math.round(w), duration: d },
          }),
        800
      );
      return NextResponse.json({ ok: true, source: "db" });
    } catch (e1: any) {
      console.warn("Scores POST falling back to memory:", e1?.message || e1);
      MEMORY_SCORES.push({ username: name, wpm: Math.round(w), duration: d, createdAt: new Date() });
      return NextResponse.json({ ok: true, source: "memory" });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save score" }, { status: 500 });
  }
}
