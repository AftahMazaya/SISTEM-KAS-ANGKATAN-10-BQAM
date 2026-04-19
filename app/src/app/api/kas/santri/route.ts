import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const divisi = searchParams.get("divisi") ?? "";

  const santri = await prisma.santri.findMany({
    where: {
      isActive: true,
      ...(q && {
        OR: [
          { nama: { contains: q, mode: "insensitive" } },
          { nomorInduk: { contains: q, mode: "insensitive" } },
        ],
      }),
      ...(divisi && { divisi }),
    },
    orderBy: { nama: "asc" },
  });

  return NextResponse.json(santri);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const roles = session.user.roles;
  if (!roles.includes("SuperAdmin") && !roles.includes("Bendahara")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { nomorInduk, nama, kelas, divisi } = body;

  if (!nomorInduk || !nama || !kelas || !divisi) {
    return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
  }

  const exists = await prisma.santri.findUnique({ where: { nomorInduk } });
  if (exists) {
    return NextResponse.json({ error: "Nomor induk sudah terdaftar" }, { status: 400 });
  }

  const santri = await prisma.santri.create({
    data: { nomorInduk, nama, kelas, divisi },
  });

  return NextResponse.json(santri, { status: 201 });
}
