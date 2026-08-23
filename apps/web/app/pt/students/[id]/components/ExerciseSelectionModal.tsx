/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { Search, X, Dumbbell, ExternalLink, Check, PlayCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import AppLoading from '../../../../../components/ui/AppLoading';
import apiClient from '../../../../../api/axios';
import type { ExerciseItem, ExercisePaginatedResponse } from '../../../../../interface';

interface ExerciseSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: ExerciseItem) => void;
  currentSelectedName?: string;
}

export default function ExerciseSelectionModal({
  isOpen,
  onClose,
  onSelectExercise,
  currentSelectedName,
}: ExerciseSelectionModalProps) {
  const [exercises, setExercises] = useState<ExerciseItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedMuscle, setSelectedMuscle] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalExercises, setTotalExercises] = useState<number>(0);

  const muscleCategories = [
    { key: 'ALL', label: 'Tất cả' },
    { key: 'cơ ngực', label: 'Ngực' },
    { key: 'cơ lưng', label: 'Lưng' },
    { key: 'cơ vai', label: 'Vai' },
    { key: 'cơ đùi trước', label: 'Đùi & Mông' },
    { key: 'cơ tay trước', label: 'Tay' },
    { key: 'cơ bụng', label: 'Bụng & Core' },
  ];

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    const muscleQuery = selectedMuscle === 'ALL' ? '' : `&muscle=${encodeURIComponent(selectedMuscle)}`;
    const searchQueryStr = searchQuery.trim() ? `&search=${encodeURIComponent(searchQuery.trim())}` : '';

    apiClient
      .get<ExercisePaginatedResponse>(
        `/workout/exercises?page=${currentPage}&limit=8${muscleQuery}${searchQueryStr}`
      )
      .then((res) => {
        setExercises(res.data.data || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalExercises(res.data.total || 0);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching DB exercises in modal:', err);
        setLoading(false);
      });
  }, [isOpen, selectedMuscle, searchQuery, currentPage]);

  if (!isOpen) return null;

  const handleMuscleSelect = (catKey: string) => {
    setSelectedMuscle(catKey);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#121814] border border-primary/30 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-[0_0_30px_rgba(102,200,28,0.15)] overflow-hidden">
        {/* Header */}
        <div className="p-5 md:p-6 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/20 text-primary border border-primary/30 flex items-center justify-center">
              <Dumbbell size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Thư viện bài tập</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5 border-b border-white/10 space-y-4 bg-surface-bright/20">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 text-white/40" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Tìm kiếm bài tập theo tên hoặc nhóm cơ..."
              className="w-full bg-black/40 border border-white/15 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-primary transition-all"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 [&&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
            {muscleCategories.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => handleMuscleSelect(cat.key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedMuscle === cat.key
                    ? 'bg-primary text-dark-slate shadow-[0_0_12px_rgba(102,200,28,0.3)] scale-105'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise List */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3 [&&::-webkit-scrollbar]:w-1.5 [&&::-webkit-scrollbar-thumb]:bg-primary/40 [&&::-webkit-scrollbar-thumb]:rounded-full [&&::-webkit-scrollbar-track]:bg-black/20">
          {loading ? (
            <AppLoading size="sm" message="Đang lấy danh sách bài tập..." />
          ) : exercises.length === 0 ? (
            <div className="text-center py-12 text-white/50 space-y-2">
              <Dumbbell size={36} className="mx-auto text-white/20" />
              <p className="text-sm font-medium">Không tìm thấy bài tập phù hợp</p>
            </div>
          ) : (
            exercises.map((ex) => {
              const isSelected = currentSelectedName === ex.name;
              const imgUrl =
                ex.setupImageUrl ||
                ex.startImageUrl ||
                'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=400&q=80';

              const muscleGroupText = ex.primaryMuscles?.join(', ') || ex.equipment || 'Toàn thân';

              return (
                <div
                  key={ex.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                    isSelected
                      ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(102,200,28,0.15)]'
                      : 'border-white/10 bg-black/30 hover:border-primary/50 hover:bg-black/50'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/10 bg-black/60 shrink-0 relative group">
                      <img
                        src={imgUrl}
                        alt={ex.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-primary/20 text-primary text-[10px] font-extrabold capitalize border border-primary/30">
                          {muscleGroupText}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-white text-sm mt-0.5 truncate">
                        {ex.name}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name + ' exercise guidance')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-white/5 text-amber-400 hover:bg-amber-400/20 hover:text-amber-300 border border-white/10 transition-colors flex items-center gap-1 text-xs font-semibold"
                      title="Xem video hướng dẫn phom dáng"
                    >
                      <PlayCircle size={16} />
                      <span className="hidden sm:inline">Video phom</span>
                      <ExternalLink size={12} />
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        onSelectExercise(ex);
                        onClose();
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-primary text-dark-slate shadow-[0_0_10px_rgba(102,200,28,0.4)]'
                          : 'bg-white/10 text-white hover:bg-primary hover:text-dark-slate'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check size={15} />
                          Đã chọn
                        </>
                      ) : (
                        'Chọn bài tập'
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-between gap-3 text-xs">
          <span className="text-white/60 font-medium">
            Trang <strong className="text-white">{currentPage}</strong> / {totalPages} ({totalExercises} bài tập)
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1 || loading}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/15 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-bold transition-all cursor-pointer"
            >
              <ChevronLeft size={16} />
              Trước
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages || loading}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              className="px-3 py-1.5 rounded-xl bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-bold transition-all cursor-pointer"
            >
              Sau
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
