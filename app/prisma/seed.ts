import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("admin123", 12);

  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      nama: "Administrator",
      password: hash,
      roles: ["SuperAdmin"],
      isActive: true,
    },
  });

  await prisma.konfigSistem.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });

  console.log("Seed selesai. Login: admin / admin123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
