import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TransaksiTable } from "./components/transaksi-table";

export default async function TransaksiPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const roles = session.user.roles;
  const canEdit = roles.includes("SuperAdmin") || roles.includes("Bendahara");
  const canDelete = roles.includes("SuperAdmin");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Transaksi</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Riwayat pemasukan dan pengeluaran kas
        </p>
      </div>
      <TransaksiTable canEdit={canEdit} canDelete={canDelete} />
    </div>
  );
}
