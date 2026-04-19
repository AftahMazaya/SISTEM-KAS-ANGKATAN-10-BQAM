import "next-auth";
import "next-auth/jwt";

// Extend tipe NextAuth supaya field custom (id, roles) dikenali TypeScript
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      roles: string[];
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    roles: string[];
  }
}
