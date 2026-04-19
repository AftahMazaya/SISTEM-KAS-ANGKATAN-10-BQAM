import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SantriTable } from "./components/santri-table";

export default async function SantriPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const roles = session.user.roles;
  const canEdit = roles.includes("SuperAdmin") || roles.includes("Bendahara");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Data Santri</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Kelola data santri yang terdaftar
        </p>
      </div>
      <SantriTable canEdit={canEdit} />
    </div>
  );
}
