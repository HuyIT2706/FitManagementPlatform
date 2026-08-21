const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const exercises = await prisma.exerciseLibrary.findMany({
    select: { primaryMuscles: true, category: true },
  });

  const muscleSet = new Set();
  const categorySet = new Set();

  exercises.forEach((ex) => {
    if (ex.category) categorySet.add(ex.category);
    if (Array.isArray(ex.primaryMuscles)) {
      ex.primaryMuscles.forEach((m) => muscleSet.add(m));
    }
  });

  console.log('Categories in DB:', Array.from(categorySet));
  console.log('Primary Muscles in DB:', Array.from(muscleSet));
  await prisma.$disconnect();
}

main().catch(console.error);
