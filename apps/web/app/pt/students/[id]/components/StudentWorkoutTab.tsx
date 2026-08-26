/* eslint-disable @next/next/no-img-element */
"use client";

import type { AssignedExerciseItem } from "@repo/types";

interface StudentWorkoutTabProps {
  assignedExercises: AssignedExerciseItem[];
  newExName: string;
  newExCategory: string;
  newExSets: number;
  newExReps: number;
  newExDay: string;
  saving: boolean;
  onOpenExerciseModal: () => void;
  onExSetsChange: (val: number) => void;
  onExRepsChange: (val: number) => void;
  onExDayChange: (val: string) => void;
  onAddExercise: () => void;
  onRemoveExercise: (id: string) => void;
  onSaveWorkout: () => void;
}

const StudentWorkoutTab = ({
  assignedExercises,
  newExName,
  newExSets,
  newExReps,
  newExDay,
  saving,
  onOpenExerciseModal,
  onExSetsChange,
  onExRepsChange,
  onExDayChange,
  onAddExercise,
  onRemoveExercise,
  onSaveWorkout,
}: StudentWorkoutTabProps) => {
  return (
    <section className="space-y-6">
      {/* Add Exercise Form Card */}
      <div className="bento-card rounded-3xl p-6 md:p-8 border border-outline-variant/30 space-y-4">
        <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">
            add_task
          </span>
          Thêm bài tập mới vào giáo án
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs items-end">
          <div className="sm:col-span-2">
            <label className="block text-on-surface-variant font-medium mb-1">
              Tên bài tập
            </label>
            <button
              type="button"
              onClick={onOpenExerciseModal}
              className="w-full bg-surface-bright border border-primary/40 rounded-xl px-3 py-2.5 text-on-surface font-extrabold text-xs flex items-center justify-between cursor-pointer hover:border-primary transition-all hover:bg-surface-bright/80 shadow-[0_0_12px_rgba(102,200,28,0.1)]"
            >
              <span className="text-primary truncate font-bold">
                {newExName || "Chọn bài tập"}
              </span>
              <span className="material-symbols-outlined text-primary text-[18px] shrink-0">
                expand_more
              </span>
            </button>
          </div>

          <div>
            <label className="block text-on-surface-variant font-medium mb-1">
              Số hiệp (Sets)
            </label>
            <input
              type="number"
              placeholder="0"
              value={newExSets === 0 ? "" : newExSets}
              onChange={(e) =>
                onExSetsChange(
                  e.target.value === "" ? 0 : Number(e.target.value),
                )
              }
              className="w-full bg-surface-bright border border-white/10 rounded-xl px-3 py-2.5 text-on-surface font-semibold focus:border-primary outline-none"
            />
          </div>

          <div>
            <label className="block text-on-surface-variant font-medium mb-1">
              Reps
            </label>
            <input
              type="number"
              placeholder="0"
              value={newExReps === 0 ? "" : newExReps}
              onChange={(e) =>
                onExRepsChange(
                  e.target.value === "" ? 0 : Number(e.target.value),
                )
              }
              className="w-full bg-surface-bright border border-white/10 rounded-xl px-3 py-2.5 text-on-surface font-semibold focus:border-primary outline-none"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-on-surface-variant font-medium mb-1">
              Lịch tập trong tuần
            </label>
            <input
              type="text"
              value={newExDay}
              onChange={(e) => onExDayChange(e.target.value)}
              placeholder="Ví dụ: Thứ 2, Thứ 5"
              className="w-full bg-surface-bright border border-white/10 rounded-xl px-3 py-2.5 text-on-surface font-semibold focus:border-primary outline-none"
            />
          </div>

          <div>
            <button
              type="button"
              onClick={onAddExercise}
              className="w-full bg-primary text-dark-slate hover:bg-primary/90 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1 cursor-pointer transition-all shadow-[0_0_12px_rgba(102,200,28,0.2)]"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Thêm Bài Tập
            </button>
          </div>
        </div>
      </div>

      {/* Currently Assigned Exercises List */}
      <div className="bento-card rounded-3xl p-6 md:p-8 border border-outline-variant/30 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
            Danh sách các bài tập ({assignedExercises.length})
          </h3>

          <button
            type="button"
            onClick={onSaveWorkout}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-primary text-dark-slate font-extrabold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(102,200,28,0.4)] hover:bg-primary/90 cursor-pointer transition-all disabled:opacity-50"
          >
            {saving ? "Đang lưu..." : "Lưu"}
          </button>
        </div>

        {assignedExercises.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl space-y-2">
            <p className="text-sm font-medium text-on-surface-variant">
              Chưa có bài tập nào trong giáo án cá nhân hóa.
            </p>
            <p className="text-xs text-on-surface-variant/70">
              Chọn bài tập từ Thư viện và bấm nút &quot;Thêm Bài Tập&quot; phía
              trên.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {assignedExercises.map((ex, idx) => (
              <div
                key={ex.id || idx}
                className="p-4 rounded-2xl bg-surface-bright/40 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/15 shrink-0 bg-surface-bright/80 flex items-center justify-center">
                    {ex.imageUrl || ex.setupImageUrl || ex.startImageUrl ? (
                      <img
                        src={
                          ex.imageUrl || ex.setupImageUrl || ex.startImageUrl
                        }
                        alt={ex.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                        #{idx + 1}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-on-surface text-sm">
                      {ex.name}
                    </h4>
                    <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                      {ex.category ? `${ex.category} • ` : ""}
                      {ex.sets} Hiệp x {ex.reps} Lần{" "}
                      {ex.dayOfWeek ? `(${ex.dayOfWeek})` : ""}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveExercise(ex.id)}
                  className="w-10 h-10 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 flex items-center justify-center shrink-0 self-end sm:self-center transition-all cursor-pointer shadow-sm hover:scale-105"
                  title="Xóa bài tập này"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    delete
                  </span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default StudentWorkoutTab;
