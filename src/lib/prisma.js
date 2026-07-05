// Bu dosya, projede tek bir Prisma bağlantısı kullanmamızı sağlar.
// Özellikle Next.js development modunda dosyalar tekrar tekrar reload olur.
// Eğer bunu yapmazsak çok fazla database bağlantısı açılabilir.
import { PrismaClient } from "../../app/generated/prisma/client";

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}