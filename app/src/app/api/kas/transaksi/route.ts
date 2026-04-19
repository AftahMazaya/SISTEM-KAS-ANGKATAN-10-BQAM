import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const tipe = searchParams.get("tipe") ?? "";
  const divisi = searchParams.get("divisi") ?? "";
  const bulan = searchParams.get("bulan");
  const tahun = searchParams.get("tahun");

  let dateFilter = {};
  if (tahun) {
    const y = parseInt(tahun);
    const m = bulan && bulan !== "all" ? parseInt(bulan) : null;
    if (m) {
      dateFilter = {
        tanggal: {
          gte: new Date(y, m - 1, 1),
          lt: new Date(y, m, 1),
        },
      };
    } else {
      dateFilter = {
        tanggal: {
          gte: new Date(y, 0, 1),
          lt: new Date(y + 1, 0, 1),
        },
      };
    }
  }

  const transaksi = await prisma.transaksi.findMany({
    where: {
      ...(tipe && { tipe }),
      ...(divisi && { divisi }),
      ...dateFilter,
    },
    include: {
      santri: { select: { nama: true, nomorInduk: true } },
    },
    orderBy: [{ tanggal: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(transaksi);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const roles = session.user.roles;
  if (!roles.includes("SuperAdmin") && !roles.includes("Bendahara")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { tanggal, tipe, nominal, keterangan, divisi, santriId } = body;

  if (!tanggal || !tipe || !nominal || !keterangan || !divisi) {
    return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
  }

  if (!["Pemasukan", "Pengeluaran"].includes(tipe)) {
    return NextResponse.json({ error: "Tipe tidak valid" }, { status: 400 });
  }

  const transaksi = await prisma.transaksi.create({
    data: {
      tanggal: new Date(tanggal),
      tipe,
      nominal: parseInt(nominal),
      keterangan,
      divisi,
      inputBy: session.user.name ?? session.user.email ?? "unknown",
      ...(santriId && { santriId }),
    },
  });

  return NextResponse.json(transaksi, { status: 201 });
}
