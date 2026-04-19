import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const roles = session.user.roles;
  if (!roles.includes("SuperAdmin") && !roles.includes("Bendahara")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { nomorInduk, nama, kelas, divisi } = body;

  if (!nomorInduk || !nama || !kelas || !divisi) {
    return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
  }

  const santri = await prisma.santri.update({
    where: { id },
    data: { nomorInduk, nama, kelas, divisi },
  });

  return NextResponse.json(santri);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const roles = session.user.roles;
  if (!roles.includes("SuperAdmin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  await prisma.santri.update({
    where: { id },
    data: { isActive: false },
  });

  return NextResponse.json({ success: true });
}
