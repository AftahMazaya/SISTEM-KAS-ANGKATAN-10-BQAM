"use client";

import { SessionProvider } from "next-auth/react";

// Wrapper agar semua Client Component bisa pakai useSession()
export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
