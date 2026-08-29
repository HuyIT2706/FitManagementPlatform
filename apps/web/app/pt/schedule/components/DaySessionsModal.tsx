"use client";

import React from "react";
import { X, Calendar, PlusCircle } from "lucide-react";
import type { DaySessionsModalProps } from "../../../../interface";
import PtScheduleSlotCard from "./PtScheduleSlotCard";

export const DaySessionsModal: React.FC<DaySessionsModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  slots,
  checkedSessions,
  onCheckIn,
  onOpenAddModal,
}) => {
  if (!isOpen) return null;

  const dateStr = `${selectedDate.getDate()}/${selectedDate.getMonth() + 1}/${selectedDate.getFullYear()}`;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-4 cursor-pointer animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#121620] border border-white/15 rounded-[28px] sm:rounded-[32px] p-4 sm:p-6 md:p-8 max-w-2xl md:max-w-3xl w-full space-y-5 sm:space-y-6 shadow-2xl relative cursor-default animate-in zoom-in-95 duration-200 max-h-[88vh] overflow-y-auto [&&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/20 text-primary border border-primary/40 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(102,200,28,0.2)]">
              <Calendar size={22} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate">
                  Lịch Dạy Ngày {dateStr}
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/30 shrink-0">
                  {slots.length} ca
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            suppressHydrationWarning
            onClick={onClose}
            aria-label="Đóng"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sessions list */}
        <div className="space-y-4">
          {slots.length > 0 ? (
            <div className="relative pl-5 sm:pl-8 border-l-2 border-outline-variant/30 space-y-4 sm:space-y-5">
              {slots.map((slot) => (
                <PtScheduleSlotCard
                  key={slot.id}
                  slot={slot}
                  isChecked={Boolean(checkedSessions[slot.id])}
                  onCheckIn={onCheckIn}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/10 text-center space-y-3">
              <p className="text-sm font-semibold text-white/70">
                Chưa có ca dạy nào trong ngày này.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center justify-between border-t border-white/10">
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => {
              onClose();
              onOpenAddModal(selectedDate);
            }}
            className="px-4 py-2.5 rounded-xl bg-primary text-dark-slate font-extrabold text-xs shadow-[0_0_15px_rgba(102,200,28,0.4)] hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle size={15} />
            Thêm Ca Cho Ngày Này
          </button>

          <button
            type="button"
            suppressHydrationWarning
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default DaySessionsModal;
