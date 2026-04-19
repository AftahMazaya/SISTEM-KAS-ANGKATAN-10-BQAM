import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

// Server Component — bisa langsung akses session tanpa useSession()
export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // Kalau middleware lolos tapi session null (edge case), redirect manual
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Halo, <span className="font-semibold">{session.user.name}</span>!
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Role: {session.user.roles.join(", ")}
        </p>

        <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100 text-sm text-blue-700">
          Dashboard dalam pengembangan. Auth sudah berjalan.
        </div>
      </div>
    </div>
  );
}
