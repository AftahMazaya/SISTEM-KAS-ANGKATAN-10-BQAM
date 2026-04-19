import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Dipisah dari route.ts supaya bisa dipakai di middleware
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
        });

        if (!user || !user.isActive) return null;

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!passwordMatch) return null;

        // Object yang dikembalikan masuk ke JWT token
        return {
          id: user.id,
          name: user.nama,
          email: user.username, // NextAuth butuh field "email", kita isi username
          roles: user.roles,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",         // Simpan session sebagai JWT di cookie (stateless)
    maxAge: 8 * 60 * 60,    // 8 jam — sama kayak GAS
  },

  callbacks: {
    // jwt callback dipanggil saat token dibuat/diperbarui
    async jwt({ token, user }) {
      if (user) {
        // user hanya ada saat pertama login
        token.id = user.id;
        token.roles = (user as unknown as { roles: string[] }).roles;
      }
      return token;
    },
    // session callback dipanggil saat getServerSession() dipanggil
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.roles = token.roles as string[];
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",   // Redirect ke /login kalau belum auth
  },
};
