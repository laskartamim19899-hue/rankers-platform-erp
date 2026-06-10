import prisma from '../src/prisma';

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'admin@rankers.com' }
  });
  console.log('User Details:', user);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
