import prisma from './src/prisma';

async function fix() {
  const result = await prisma.fee.updateMany({
    where: { type: 'ACADEMIC', status: { in: ['PENDING', 'PARTIAL'] } },
    data: { dueDate: new Date() }
  });
  console.log(`Fixed ${result.count} Academic fee(s) — due date set to today.`);
  await prisma.$disconnect();
}

fix();
