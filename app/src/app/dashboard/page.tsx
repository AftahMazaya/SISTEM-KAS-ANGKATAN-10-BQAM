import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  ArrowUpCircle,
  ArrowDownCircle,
  ClipboardCheck,
  Wallet,
} from "lucide-react";

async function getStats() {
  const [totalSantri, totalTransaksi, pendingKonfirmasi, transaksiList] =
    await Promise.all([
      prisma.santri.count({ where: { isActive: true } }),
      prisma.transaksi.count(),
      prisma.konfirmasiKas.count({ where: { status: "Menunggu Verifikasi" } }),
      prisma.transaksi.findMany({ select: { tipe: true, nominal: true } }),
    ]);

  const pemasukan = transaksiList
    .filter((t: { tipe: string; nominal: number }) => t.tipe === "Pemasukan")
    .reduce((a: number, t: { tipe: string; nominal: number }) => a + t.nominal, 0);

  const pengeluaran = transaksiList
    .filter((t: { tipe: string; nominal: number }) => t.tipe === "Pengeluaran")
    .reduce((a: number, t: { tipe: string; nominal: number }) => a + t.nominal, 0);

  return { totalSantri, totalTransaksi, pendingKonfirmasi, pemasukan, pengeluaran };
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const stats = await getStats();
  const saldo = stats.pemasukan - stats.pengeluaran;

  const cards = [
    {
      title: "Saldo Kas",
      value: formatRupiah(saldo),
      description: "Total saldo saat ini",
      icon: Wallet,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Total Santri",
      value: stats.totalSantri.toString(),
      description: "Santri aktif terdaftar",
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Pemasukan",
      value: formatRupiah(stats.pemasukan),
      description: `${stats.totalTransaksi} total transaksi`,
      icon: ArrowUpCircle,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Pengeluaran",
      value: formatRupiah(stats.pengeluaran),
      description: "Total pengeluaran",
      icon: ArrowDownCircle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      title: "Konfirmasi Pending",
      value: stats.pendingKonfirmasi.toString(),
      description: "Menunggu verifikasi",
      icon: ClipboardCheck,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Selamat datang, <span className="font-medium text-foreground">{session.user.name}</span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((card) => (
          <Card key={card.title} className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`${card.bg} p-2 rounded-lg`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
