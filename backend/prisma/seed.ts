import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@rankers.com';
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
    },
  });

  console.log({ admin });
  console.log('Admin user created: admin@rankers.com / admin123');

  // Seed Hostels
  const hostels = await Promise.all([
    prisma.hostel.upsert({ where: { roomNumber: '101' }, update: {}, create: { roomNumber: '101', capacity: 2 } }),
    prisma.hostel.upsert({ where: { roomNumber: '102' }, update: {}, create: { roomNumber: '102', capacity: 3 } }),
    prisma.hostel.upsert({ where: { roomNumber: '201' }, update: {}, create: { roomNumber: '201', capacity: 4 } }),
  ]);
  console.log('Hostels seeded:', hostels.length);

  // Seed Courses/Batches
  const courses = await Promise.all([
    prisma.course.upsert({ where: { id: 'neet-helix' }, update: {}, create: { id: 'neet-helix', name: 'Helix Batch (NEET)', description: 'One-year intensive medical prep' } }),
    prisma.course.upsert({ where: { id: 'jee-alpha' }, update: {}, create: { id: 'jee-alpha', name: 'Alpha Batch (JEE)', description: 'One-year intensive engineering prep' } }),
    prisma.course.upsert({ where: { id: 'crash-2024' }, update: {}, create: { id: 'crash-2024', name: 'Crash Course 2024', description: 'Fast-track revision batch' } }),
  ]);
  console.log('Batches seeded:', courses.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
