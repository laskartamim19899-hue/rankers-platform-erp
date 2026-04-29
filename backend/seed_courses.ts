import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const courses = [
    { name: 'NEET', description: 'Medical Entrance Exam Preparation' },
    { name: 'JEE', description: 'Engineering Entrance Exam Preparation' },
    { name: 'BOARD WITH NEET', description: 'School Boards + Medical Preparation' },
    { name: 'CRASH COURSE', description: 'Intensive Short-term Preparation' }
  ];

  console.log('Checking and seeding courses...');

  for (const course of courses) {
    const existing = await prisma.course.findFirst({
      where: { name: course.name }
    });

    if (existing) {
      console.log(`Course ${course.name} already exists.`);
    } else {
      await prisma.course.create({
        data: {
          name: course.name,
          description: course.description
        }
      });
      console.log(`Created course: ${course.name}`);
    }
  }

  console.log('Courses sync complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
