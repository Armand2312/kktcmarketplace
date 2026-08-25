// Bu dosya, projede tek bir Prisma bağlantısı kullanmamızı sağlar.
// Özellikle Next.js development modunda dosyalar tekrar tekrar reload olur.
// Eğer bunu yapmazsak çok fazla database bağlantısı açılabilir.
// Bu dosya, merkezi database erişim noktasıdır.


// The concept of a singleton Prisma Client in a Next.js application is used to ensure
// that only one instance of the Prisma Client is created and reused throughout the application.


import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/* import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
} */