'use client';

import type { InBodyHistoryPoint } from '@repo/types';
import TransformationJourneySlider from '../../../../profile/components/TransformationJourneySlider';

interface StudentInbodyTabProps {
  studentId: string;
  inbodyWeight: number;
  inbodyHeight: number;
  inbodyFat: number;
  inbodyMuscle: number;
  chartMetric: 'weight' | 'fat' | 'muscle';
  isEditingInBody: boolean;
  historyPoints: InBodyHistoryPoint[];
  saving: boolean;
  onChartMetricChange: (metric: 'weight' | 'fat' | 'muscle') => void;
  onToggleEditInBody: (editing: boolean) => void;
  onInbodyWeightChange: (val: number) => void;
  onInbodyHeightChange: (val: number) => void;
  onInbodyFatChange: (val: number) => void;
  onInbodyMuscleChange: (val: number) => void;
  onSaveInBody: () => void;
}

export default function StudentInbodyTab({
  studentId,
  inbodyWeight,
  inbodyHeight,
  inbodyFat,
  inbodyMuscle,
  chartMetric,
  isEditingInBody,
  historyPoints,
  saving,
  onChartMetricChange,
  onToggleEditInBody,
  onInbodyWeightChange,
  onInbodyHeightChange,
  onInbodyFatChange,
  onInbodyMuscleChange,
  onSaveInBody,
}: StudentInbodyTabProps) {
  return (
    <section className="space-y-6">
      {/* InBody Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bento-card rounded-2xl p-5 border border-outline-variant/30 space-y-1">
          <span className="text-xs text-on-surface-variant font-medium">Cân nặng hiện tại</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-on-surface">{inbodyWeight}</span>
            <span className="text-xs font-bold text-primary">Kg</span>
          </div>
        </div>

        <div className="bento-card rounded-2xl p-5 border border-outline-variant/30 space-y-1">
          <span className="text-xs text-on-surface-variant font-medium">Chiều cao</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-on-surface">{inbodyHeight}</span>
            <span className="text-xs font-bold text-primary">Cm</span>
          </div>
        </div>

        <div className="bento-card rounded-2xl p-5 border border-outline-variant/30 space-y-1">
          <span className="text-xs text-on-surface-variant font-medium">Tỷ lệ mỡ (Body Fat)</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-amber-400">{inbodyFat}</span>
            <span className="text-xs font-bold text-amber-400">%</span>
          </div>
        </div>

        <div className="bento-card rounded-2xl p-5 border border-outline-variant/30 space-y-1">
          <span className="text-xs text-on-surface-variant font-medium">Khối lượng cơ</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-blue-400">{inbodyMuscle}</span>
            <span className="text-xs font-bold text-blue-400">Kg</span>
          </div>
        </div>
      </div>

      {/* InBody Edit / Action Bar */}
      <div className="bento-card rounded-3xl p-6 md:p-8 border border-outline-variant/30 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">analytics</span>
              Theo Dõi Chỉ Số InBody & Thay Đổi
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Cập nhật đo đạc định kỳ để đánh giá mức độ tiến bộ của học viên
            </p>
          </div>

          <button
            type="button"
            onClick={() => onToggleEditInBody(!isEditingInBody)}
            className="px-4 py-2 rounded-xl bg-surface-bright border border-white/10 text-on-surface font-bold text-xs flex items-center justify-center gap-1.5 hover:text-primary hover:border-primary/40 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
            {isEditingInBody ? 'Đóng Form' : 'Cập Nhật InBody Mới'}
          </button>
        </div>

        {/* Edit InBody Form */}
        {isEditingInBody && (
          <div className="p-5 rounded-2xl bg-surface-bright/40 border border-primary/30 space-y-4 animate-in fade-in duration-200">
            <h4 className="font-extrabold text-sm text-primary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">add_chart</span>
              Nhập kết quả đo InBody mới nhất
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-on-surface-variant font-medium mb-1">
                  Cân nặng (Kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={inbodyWeight}
                  onChange={(e) => onInbodyWeightChange(Number(e.target.value))}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-on-surface font-extrabold focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-on-surface-variant font-medium mb-1">
                  Chiều cao (Cm)
                </label>
                <input
                  type="number"
                  value={inbodyHeight}
                  onChange={(e) => onInbodyHeightChange(Number(e.target.value))}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-on-surface font-extrabold focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-on-surface-variant font-medium mb-1">
                  Body Fat (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={inbodyFat}
                  onChange={(e) => onInbodyFatChange(Number(e.target.value))}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-amber-400 font-extrabold focus:border-amber-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-on-surface-variant font-medium mb-1">
                  Khối cơ (Kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={inbodyMuscle}
                  onChange={(e) => onInbodyMuscleChange(Number(e.target.value))}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-blue-400 font-extrabold focus:border-blue-400 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onSaveInBody}
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-primary text-dark-slate font-extrabold text-xs shadow-[0_0_12px_rgba(102,200,28,0.4)] hover:bg-primary/90 cursor-pointer transition-all disabled:opacity-50"
              >
                {saving ? 'Đang lưu...' : 'Lưu Chỉ Số InBody'}
              </button>
            </div>
          </div>
        )}

        {/* Chart View Switcher & Historical Table */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">
                show_chart
              </span>
              Lịch sử các lần đo InBody
            </h4>

            <div className="flex items-center gap-1.5 p-1 bg-surface-bright/50 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => onChartMetricChange('weight')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  chartMetric === 'weight'
                    ? 'bg-primary text-dark-slate'
                    : 'text-on-surface-variant hover:text-white'
                }`}
              >
                Cân nặng
              </button>
              <button
                type="button"
                onClick={() => onChartMetricChange('fat')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  chartMetric === 'fat'
                    ? 'bg-amber-400 text-dark-slate'
                    : 'text-on-surface-variant hover:text-white'
                }`}
              >
                Body Fat
              </button>
              <button
                type="button"
                onClick={() => onChartMetricChange('muscle')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  chartMetric === 'muscle'
                    ? 'bg-blue-400 text-dark-slate'
                    : 'text-on-surface-variant hover:text-white'
                }`}
              >
                Khối cơ
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-on-surface-variant">
                  <th className="py-2.5 px-3 font-semibold">Thời gian</th>
                  <th className="py-2.5 px-3 font-semibold">Cân nặng (Kg)</th>
                  <th className="py-2.5 px-3 font-semibold">Body Fat (%)</th>
                  <th className="py-2.5 px-3 font-semibold">Khối cơ (Kg)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {historyPoints.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-white/40 font-medium">
                      Chưa có lịch sử đo InBody nào được ghi nhận.
                    </td>
                  </tr>
                ) : (
                  historyPoints.map((pt, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-on-surface">{pt.date}</td>
                      <td className="py-2.5 px-3 font-extrabold text-primary">{pt.weightKg}</td>
                      <td className="py-2.5 px-3 font-extrabold text-amber-400">
                        {pt.bodyFatPercent}%
                      </td>
                      <td className="py-2.5 px-3 font-extrabold text-blue-400">
                        {pt.muscleMassKg} Kg
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Interactive Before / After Comparison Slider & Photo Manager for PT */}
      <TransformationJourneySlider
        goal="LOSE_WEIGHT"
        weightKg={inbodyWeight}
        targetWeightKg={70}
        goalTextMap={{ LOSE_WEIGHT: 'Giảm mỡ & Tăng cơ' }}
        studentId={studentId}
        isPtView={true}
      />
    </section>
  );
}
