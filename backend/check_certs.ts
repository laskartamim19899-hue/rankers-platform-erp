import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const certs = await prisma.certificateRecord.findMany();
  console.log("Certificates:", certs);
}

main().finally(() => prisma.$disconnect());
