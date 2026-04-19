import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export const proxy = withAuth(
  function proxy(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/transaksi/:path*",
    "/konfirmasi/:path*",
    "/santri/:path*",
    "/rka/:path*",
    "/pengaturan/:path*",
    "/api/kas/:path*",
  ],
};
