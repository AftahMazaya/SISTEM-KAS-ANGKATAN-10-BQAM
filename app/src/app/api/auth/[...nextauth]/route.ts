import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// NextAuth v4 dengan App Router: export handler sebagai GET dan POST
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
