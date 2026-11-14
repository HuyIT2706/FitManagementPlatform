export interface MealMacros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export function parseMealMacros(text: string | undefined): MealMacros {
  if (!text || !text.trim()) {
    return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  }
  const lines = text.split('\n');
  let cal = 0;
  let p = 0;
  let c = 0;
  let f = 0;

  for (const line of lines) {
    // Extract nutrition clause if present, e.g. "(260 kcal, 56g P, 0g C, 4g F)"
    const parenMatch = line.match(/\(([^)]*kcal[^)]*)\)/i);
    const targetString = parenMatch?.[1] ?? line;

    const calMatch = targetString.match(/(\d+(?:\.\d+)?)\s*kcal/i);
    // Negative lookahead avoids matching Vietnamese words like Cơm or Phở
    const pMatch =
      targetString.match(/(\d+(?:\.\d+)?)\s*g?\s*P(?![a-zA-Zà-ỹÀ-Ỹ])/i);
    const cMatch =
      targetString.match(/(\d+(?:\.\d+)?)\s*g?\s*C(?![a-zA-Zà-ỹÀ-Ỹ])/i);
    const fMatch =
      targetString.match(/(\d+(?:\.\d+)?)\s*g?\s*F(?![a-zA-Zà-ỹÀ-Ỹ])/i);

    if (calMatch && calMatch[1]) cal += parseFloat(calMatch[1]);
    if (pMatch && pMatch[1]) p += parseFloat(pMatch[1]);
    if (cMatch && cMatch[1]) c += parseFloat(cMatch[1]);
    if (fMatch && fMatch[1]) f += parseFloat(fMatch[1]);
  }

  return {
    calories: Math.round(cal),
    protein: Math.round(p * 10) / 10,
    carbs: Math.round(c * 10) / 10,
    fat: Math.round(f * 10) / 10,
  };
}

export function sumMealMacros(macrosList: MealMacros[]): MealMacros {
  return macrosList.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: Math.round((acc.protein + m.protein) * 10) / 10,
      carbs: Math.round((acc.carbs + m.carbs) * 10) / 10,
      fat: Math.round((acc.fat + m.fat) * 10) / 10,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
}
