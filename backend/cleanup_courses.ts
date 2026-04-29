import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const allowedCourses = ['NEET', 'JEE', 'BOARD WITH NEET', 'CRASH COURSE'];

  console.log('Cleaning up old courses and all dependent data...');

  const toDelete = await prisma.course.findMany({
    where: {
      NOT: {
        name: { in: allowedCourses }
      }
    }
  });

  for (const course of toDelete) {
    console.log(`Deep cleaning course: ${course.name}`);

    // Delete Student associations
    await prisma.studentCourse.deleteMany({ where: { courseId: course.id } });

    // Delete Payments linked to fees of this course
    const fees = await prisma.fee.findMany({ where: { courseId: course.id } });
    const feeIds = fees.map(f => f.id);

    await prisma.payment.deleteMany({
      where: { feeId: { in: feeIds } }
    });

    // Delete Fees
    await prisma.fee.deleteMany({ where: { courseId: course.id } });

    // Delete Batches and their attendance
    const batches = await prisma.batch.findMany({ where: { courseId: course.id } });
    const batchIds = batches.map(b => b.id);

    await prisma.attendance.deleteMany({ where: { batchId: { in: batchIds } } });
    await prisma.batch.deleteMany({ where: { courseId: course.id } });

    // Delete the course
    await prisma.course.delete({ where: { id: course.id } });
  }

  console.log('Cleanup complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
