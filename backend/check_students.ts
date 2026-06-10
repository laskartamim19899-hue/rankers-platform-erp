import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.student.count();
  const students = await prisma.student.findMany({
    select: { regNo: true }
  });
  console.log('Total students:', count);
  console.log('Current registration numbers:', students.map(s => s.regNo));
  await prisma.$disconnect();
}

main();
