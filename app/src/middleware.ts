import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// withAuth otomatis cek JWT dari cookie
// Kalau ga ada/expired → redirect ke authOptions.pages.signIn (/login)
export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // token ada → boleh akses
    },
  }
);

// Middleware hanya berlaku untuk path ini
// /login dan /api/auth/* tidak diproteksi (public)
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/transaksi/:path*",
    "/konfirmasi/:path*",
    "/santri/:path*",
    "/rka/:path*",
    "/pengaturan/:path*",
    "/api/kas/:path*",    // API routes kita juga diproteksi
  ],
};
