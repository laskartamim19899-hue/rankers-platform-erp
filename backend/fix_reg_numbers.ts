import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '.env') });
const prisma = new PrismaClient();


async function main() {
  const students = await prisma.student.findMany({
    where: { status: 'APPROVED' },
    orderBy: { createdAt: 'asc' }
  });

  console.log(`Found ${students.length} approved students.`);

  for (let i = 0; i < students.length; i++) {
    const newRegNo = (i + 1).toString();
    console.log(`Updating student ${students[i].id}: ${students[i].regNo} -> ${newRegNo}`);
    await prisma.student.update({
      where: { id: students[i].id },
      data: { regNo: newRegNo }
    });
  }

  console.log('Update complete.');
  await prisma.$disconnect();
}

main();
