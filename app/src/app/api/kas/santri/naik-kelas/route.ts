import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type S = { id: string; kelas: string };

const NAIK: Record<string, string> = {
  "X.1": "XI.1", "X.2": "XI.2", "X.3": "XI.3", "X.4": "XI.4",
  "XI.1": "XII.1", "XI.2": "XII.2", "XI.3": "XII.3", "XI.4": "XII.4",
};

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const roles = session.user.roles;
  if (!roles.includes("SuperAdmin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { santriIds, luluskan } = body as { santriIds?: string[]; luluskan?: boolean };

  if (santriIds && santriIds.length > 0) {
    const santriList = await prisma.santri.findMany({
      where: { id: { in: santriIds }, isActive: true },
    });

    await Promise.all(
      santriList
        .filter((s: S) => NAIK[s.kelas])
        .map((s: S) =>
          prisma.santri.update({ where: { id: s.id }, data: { kelas: NAIK[s.kelas] } })
        )
    );

    return NextResponse.json({ updated: santriList.filter((s: S) => NAIK[s.kelas]).length });
  }

  const allSantri = await prisma.santri.findMany({ where: { isActive: true } });

  const toNaik = allSantri.filter((s: S) => NAIK[s.kelas]);
  const toLulus = luluskan ? allSantri.filter((s: S) => s.kelas.startsWith("XII.")) : [];

  await Promise.all([
    ...toNaik.map((s: S) =>
      prisma.santri.update({ where: { id: s.id }, data: { kelas: NAIK[s.kelas] } })
    ),
    ...toLulus.map((s: S) =>
      prisma.santri.update({ where: { id: s.id }, data: { isActive: false } })
    ),
  ]);

  return NextResponse.json({ updated: toNaik.length, lulus: toLulus.length });
}
