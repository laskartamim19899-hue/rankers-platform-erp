import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function test() {
  console.log('Testing connection to:', process.env.DATABASE_URL?.split('@')[1]);
  try {
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Connection successful:', result);
  } catch (error: any) {
    console.error("Database connection failed!", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
