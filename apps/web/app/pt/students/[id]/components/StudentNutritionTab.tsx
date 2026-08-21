'use client';

interface StudentNutritionTabProps {
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  breakfastText: string;
  lunchText: string;
  dinnerText: string;
  snackText: string;
  saving: boolean;
  onTargetCaloriesChange: (val: number) => void;
  onTargetProteinChange: (val: number) => void;
  onTargetCarbsChange: (val: number) => void;
  onTargetFatChange: (val: number) => void;
  onBreakfastTextChange: (val: string) => void;
  onLunchTextChange: (val: string) => void;
  onDinnerTextChange: (val: string) => void;
  onSnackTextChange: (val: string) => void;
  onSaveNutrition: () => void;
}

export default function StudentNutritionTab({
  targetCalories,
  targetProtein,
  targetCarbs,
  targetFat,
  breakfastText,
  lunchText,
  dinnerText,
  snackText,
  saving,
  onTargetCaloriesChange,
  onTargetProteinChange,
  onTargetCarbsChange,
  onTargetFatChange,
  onBreakfastTextChange,
  onLunchTextChange,
  onDinnerTextChange,
  onSnackTextChange,
  onSaveNutrition,
}: StudentNutritionTabProps) {
  return (
    <section className="space-y-6">
      {/* Target Macros Settings */}
      <div className="bento-card rounded-3xl p-6 md:p-8 border border-outline-variant/30 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">restaurant_menu</span>
              Mục Tiêu Dinh Dưỡng & Phân Chia Bữa Ăn 1:1
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Thiết lập mục tiêu calo, macro và chỉ định thực đơn từng bữa cho học viên
            </p>
          </div>

          <button
            type="button"
            onClick={onSaveNutrition}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-primary text-dark-slate font-extrabold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(102,200,28,0.4)] hover:bg-primary/90 cursor-pointer transition-all disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            {saving ? 'Đang lưu...' : 'Lưu Targets & Thực Đơn'}
          </button>
        </div>

        {/* Macro Inputs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-surface-bright/30 border border-white/10 space-y-1.5">
            <span className="font-semibold text-on-surface-variant">Target Calo (Kcal)</span>
            <input
              type="number"
              value={targetCalories}
              onChange={(e) => onTargetCaloriesChange(Number(e.target.value))}
              className="w-full bg-black/40 border border-primary/40 rounded-xl px-3 py-2 text-primary font-extrabold text-base outline-none focus:border-primary"
            />
          </div>

          <div className="p-4 rounded-2xl bg-surface-bright/30 border border-white/10 space-y-1.5">
            <span className="font-semibold text-amber-400">Protein (Grams)</span>
            <input
              type="number"
              value={targetProtein}
              onChange={(e) => onTargetProteinChange(Number(e.target.value))}
              className="w-full bg-black/40 border border-amber-400/40 rounded-xl px-3 py-2 text-amber-400 font-extrabold text-base outline-none focus:border-amber-400"
            />
          </div>

          <div className="p-4 rounded-2xl bg-surface-bright/30 border border-white/10 space-y-1.5">
            <span className="font-semibold text-blue-400">Carbs (Grams)</span>
            <input
              type="number"
              value={targetCarbs}
              onChange={(e) => onTargetCarbsChange(Number(e.target.value))}
              className="w-full bg-black/40 border border-blue-400/40 rounded-xl px-3 py-2 text-blue-400 font-extrabold text-base outline-none focus:border-blue-400"
            />
          </div>

          <div className="p-4 rounded-2xl bg-surface-bright/30 border border-white/10 space-y-1.5">
            <span className="font-semibold text-rose-400">Fat (Grams)</span>
            <input
              type="number"
              value={targetFat}
              onChange={(e) => onTargetFatChange(Number(e.target.value))}
              className="w-full bg-black/40 border border-rose-400/40 rounded-xl px-3 py-2 text-rose-400 font-extrabold text-base outline-none focus:border-rose-400"
            />
          </div>
        </div>

        {/* 4 Meal Slots Prescribed Plan */}
        <div className="space-y-4 pt-2">
          <h4 className="text-sm font-bold text-on-surface flex items-center gap-2 border-b border-white/10 pb-2">
            <span className="material-symbols-outlined text-primary text-[18px]">
              local_dining
            </span>
            Phân Chia Thực Đơn Chi Tiết 4 Bữa (Lưu vào CSDL)
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Breakfast */}
            <div className="p-4 rounded-2xl bg-surface-bright/30 border border-white/10 space-y-2">
              <label className="font-extrabold text-amber-400 flex items-center gap-1.5 text-xs">
                <span className="material-symbols-outlined text-[16px]">wb_twilight</span>
                Bữa Sáng (Breakfast)
              </label>
              <textarea
                rows={3}
                value={breakfastText}
                onChange={(e) => onBreakfastTextChange(e.target.value)}
                placeholder="Ví dụ: 2 Quả trứng luộc + 1 Lát bánh mì đen + 1 Ly sữa hạt..."
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-on-surface placeholder-white/30 focus:border-primary outline-none resize-none"
              />
            </div>

            {/* Lunch */}
            <div className="p-4 rounded-2xl bg-surface-bright/30 border border-white/10 space-y-2">
              <label className="font-extrabold text-yellow-400 flex items-center gap-1.5 text-xs">
                <span className="material-symbols-outlined text-[16px]">wb_sunny</span>
                Bữa Trưa (Lunch)
              </label>
              <textarea
                rows={3}
                value={lunchText}
                onChange={(e) => onLunchTextChange(e.target.value)}
                placeholder="Ví dụ: 150g Ức gà áp chảo + 1 Bát cơm gạo lứt + Rau luộc..."
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-on-surface placeholder-white/30 focus:border-primary outline-none resize-none"
              />
            </div>

            {/* Dinner */}
            <div className="p-4 rounded-2xl bg-surface-bright/30 border border-white/10 space-y-2">
              <label className="font-extrabold text-blue-400 flex items-center gap-1.5 text-xs">
                <span className="material-symbols-outlined text-[16px]">nights_stay</span>
                Bữa Tối (Dinner)
              </label>
              <textarea
                rows={3}
                value={dinnerText}
                onChange={(e) => onDinnerTextChange(e.target.value)}
                placeholder="Ví dụ: 150g Thăn bò nướng + 150g Khoai lang + Bông cải xanh..."
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-on-surface placeholder-white/30 focus:border-primary outline-none resize-none"
              />
            </div>

            {/* Snack */}
            <div className="p-4 rounded-2xl bg-surface-bright/30 border border-white/10 space-y-2">
              <label className="font-extrabold text-emerald-400 flex items-center gap-1.5 text-xs">
                <span className="material-symbols-outlined text-[16px]">local_cafe</span>
                Bữa Phụ (Snack)
              </label>
              <textarea
                rows={3}
                value={snackText}
                onChange={(e) => onSnackTextChange(e.target.value)}
                placeholder="Ví dụ: 1 Muỗng Whey Protein + 1 Quả chuối chín trước khi tập..."
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-on-surface placeholder-white/30 focus:border-primary outline-none resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
