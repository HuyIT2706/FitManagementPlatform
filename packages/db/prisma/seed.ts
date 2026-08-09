import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Bắt đầu xoá dữ liệu cũ...');
  await prisma.foodLibrary.deleteMany();

  console.log('Bắt đầu chèn dữ liệu thực phẩm (FoodLibrary)...');

  const foods = [
    { name: 'Ức gà luộc', caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6 },
    { name: 'Cơm trắng', caloriesPer100g: 130, proteinPer100g: 2.7, carbsPer100g: 28, fatPer100g: 0.3 },
    { name: 'Trứng gà (luộc)', caloriesPer100g: 155, proteinPer100g: 13, carbsPer100g: 1.1, fatPer100g: 11 },
    { name: 'Thịt bò (nạc)', caloriesPer100g: 250, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 15 },
    { name: 'Khoai lang luộc', caloriesPer100g: 86, proteinPer100g: 1.6, carbsPer100g: 20, fatPer100g: 0.1 },
    { name: 'Whey Protein (1 muỗng ~30g)', caloriesPer100g: 396, proteinPer100g: 80, carbsPer100g: 10, fatPer100g: 4 }, // Per 100g scale
    { name: 'Súp lơ xanh luộc', caloriesPer100g: 34, proteinPer100g: 2.8, carbsPer100g: 7, fatPer100g: 0.4 },
    { name: 'Cá hồi', caloriesPer100g: 208, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 13 },
    { name: 'Bánh mì ngũ cốc', caloriesPer100g: 265, proteinPer100g: 11, carbsPer100g: 41, fatPer100g: 4.2 },
    { name: 'Thịt lợn nạc', caloriesPer100g: 143, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 3.5 },
    { name: 'Đậu hũ non', caloriesPer100g: 61, proteinPer100g: 6.6, carbsPer100g: 2.8, fatPer100g: 3.2 },
    { name: 'Phở bò', caloriesPer100g: 115, proteinPer100g: 5.2, carbsPer100g: 18, fatPer100g: 2.3 },
    { name: 'Bún bò Huế', caloriesPer100g: 120, proteinPer100g: 4.5, carbsPer100g: 15, fatPer100g: 4 },
    { name: 'Dưa hấu', caloriesPer100g: 30, proteinPer100g: 0.6, carbsPer100g: 8, fatPer100g: 0.2 },
    { name: 'Chuối tây', caloriesPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 23, fatPer100g: 0.3 },
  ];

  for (const food of foods) {
    await prisma.foodLibrary.create({
      data: food,
    });
  }

  console.log(`Đã chèn thành công ${foods.length} thực phẩm.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
