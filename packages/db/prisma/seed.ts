import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const parseNum = (val: any): number | null => {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') return isNaN(val) ? null : val;
  if (typeof val === 'string') {
    const clean = val.replace(/[^\d.-]/g, '');
    if (!clean) return null;
    const n = parseFloat(clean);
    return isNaN(n) ? null : n;
  }
  return null;
};

const parseNumReq = (val: any, defaultVal = 0): number => {
  const n = parseNum(val);
  return n ?? defaultVal;
};

async function main() {
  console.log('Bắt đầu xoá dữ liệu cũ...');
  await prisma.foodLibrary.deleteMany();

  console.log('Đang tìm file dữ liệu thực phẩm...');
  
  const possiblePaths = [
    path.join(__dirname, 'caloer_with_images.json'),
  ];

  let jsonPath = '';
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      jsonPath = p;
      break;
    }
  }

  if (!jsonPath) {
    console.error('Không tìm thấy file caloer_full_data.json hoặc DataFood.json');
    return;
  }

  console.log(`Đang đọc dữ liệu từ: ${jsonPath}`);
  const fileContent = fs.readFileSync(jsonPath, 'utf-8');
  const rawData = JSON.parse(fileContent);

  let itemsArray: any[] = [];
  if (Array.isArray(rawData)) {
    itemsArray = rawData;
  } else if (typeof rawData === 'object' && rawData !== null) {
    itemsArray = Object.entries(rawData).map(([key, val]: [string, any]) => ({
      keyName: key,
      ...val,
    }));
  }

  console.log(`Đã đọc ${itemsArray.length} thực phẩm. Đang chuẩn bị dữ liệu...`);

  const foodsToInsert = itemsArray.map((item: any) => {
    const name = item.ten_mon_an || item['Name (Tên Tiếng Việt)'] || item.keyName || 'Không xác định';
    const calories = parseNumReq(item.nang_luong ?? item['Calorie (kcal)']);
    const protein = parseNumReq(item.dam_protein ?? item['Protein (g)']);
    const carbs = parseNumReq(item.carbohydrate ?? item['Tinh Bột (g)']);
    const fat = parseNumReq(item.chat_beo ?? item['Chất Béo (g)']);

    return {
      name,
      caloriesPer100g: calories,
      proteinPer100g: protein,
      carbsPer100g: carbs,
      fatPer100g: fat,
      fiberPer100g: parseNum(item.chat_xo ?? item['Fiber / Chất Xơ (g)']),
      sugarPer100g: parseNum(item.duong),
      saturatedFatPer100g: parseNum(item.chat_beo_bao_hoa),
      transFatPer100g: parseNum(item.chat_beo_chuyen_hoa),
      waterPer100g: parseNum(item.nuoc ?? item['Water / Nước (g)']),
      calciumPer100g: parseNum(item.canxi),
      ironPer100g: parseNum(item.sat),
      potassiumPer100g: parseNum(item.kali),
      magnesiumPer100g: parseNum(item.magie),
      sodiumPer100g: parseNum(item.natri ?? item['Salt / Muối (g)']),
      vitaminAPer100g: parseNum(item.vitamin_a),
      vitaminCPer100g: parseNum(item.vitamin_c),
      vitaminDPer100g: parseNum(item.vitamin_d),
      vitaminEPer100g: parseNum(item.vitamin_e),
      conAxitPer100g: parseNum(item.con_axit),
      source: item.nguon_tham_khao || null,
      imageUrl: item.image_url || item.imageUrl || item.image || item.anh || item.thumb || null,
    };
  });

  console.log('Bắt đầu chèn dữ liệu thực phẩm vào Database...');

  const chunkSize = 2000;
  for (let i = 0; i < foodsToInsert.length; i += chunkSize) {
    const chunk = foodsToInsert.slice(i, i + chunkSize);
    await prisma.foodLibrary.createMany({
      data: chunk,
      skipDuplicates: true,
    });
    console.log(`Đã chèn ${Math.min(i + chunk.length, foodsToInsert.length)}/${foodsToInsert.length} bản ghi...`);
  }

  console.log('Đã chèn thành công toàn bộ thực phẩm.');

  console.log('-----------------------------------');
  console.log('Bắt đầu xoá dữ liệu bài tập cũ...');
  await prisma.exerciseLibrary.deleteMany();

  const exercisesJsonPath = path.join(__dirname, 'exercises_vi.json');
  if (fs.existsSync(exercisesJsonPath)) {
    console.log(`Đang đọc file bài tập từ: ${exercisesJsonPath}`);
    const exercisesContent = fs.readFileSync(exercisesJsonPath, 'utf-8');
    const rawExercises = JSON.parse(exercisesContent);

    console.log(`Đã đọc ${rawExercises.length} bài tập. Đang chuẩn bị dữ liệu...`);

    const exercisesToInsert = rawExercises.map((ex: any) => ({
      id: ex.id || undefined,
      name: ex.name || 'Bài tập không tên',
      category: ex.category || null,
      force: ex.force || null,
      level: ex.level || null,
      mechanic: ex.mechanic || null,
      equipment: ex.equipment || null,
      primaryMuscles: Array.isArray(ex.primaryMuscles) ? ex.primaryMuscles : [],
      secondaryMuscles: Array.isArray(ex.secondaryMuscles) ? ex.secondaryMuscles : [],
      instructions: Array.isArray(ex.instructions) ? ex.instructions : [],
      setupImageUrl: ex.setup_image_url || null,
      startImageUrl: ex.start_image_url || null,
    }));

    const exChunkSize = 1000;
    for (let i = 0; i < exercisesToInsert.length; i += exChunkSize) {
      const chunk = exercisesToInsert.slice(i, i + exChunkSize);
      await prisma.exerciseLibrary.createMany({
        data: chunk,
        skipDuplicates: true,
      });
      console.log(`Đã chèn ${Math.min(i + chunk.length, exercisesToInsert.length)}/${exercisesToInsert.length} bài tập...`);
    }
    console.log('Đã chèn thành công toàn bộ bài tập.');
  } else {
    console.log('Không tìm thấy file exercises_vi.json để nạp bài tập.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
