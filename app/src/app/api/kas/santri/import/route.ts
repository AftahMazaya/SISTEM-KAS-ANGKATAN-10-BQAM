import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Row = { nomorInduk: string; nama: string; kelas: string; divisi: string };

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const roles = session.user.roles;
  if (!roles.includes("SuperAdmin") && !roles.includes("Bendahara")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const rows: Row[] = body.data ?? [];

  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "Data kosong" }, { status: 400 });
  }

  let inserted = 0;
  let skipped = 0;
  const errors: { nomorInduk: string; error: string }[] = [];

  for (const row of rows) {
    try {
      const exists = await prisma.santri.findUnique({
        where: { nomorInduk: row.nomorInduk },
      });

      if (exists) {
        skipped++;
        continue;
      }

      await prisma.santri.create({
        data: {
          nomorInduk: row.nomorInduk,
          nama: row.nama,
          kelas: row.kelas,
          divisi: row.divisi,
        },
      });
      inserted++;
    } catch {
      errors.push({ nomorInduk: row.nomorInduk, error: "Gagal disimpan" });
    }
  }

  return NextResponse.json({ inserted, skipped, errors });
}
