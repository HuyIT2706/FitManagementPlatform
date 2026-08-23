/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, History, Lock, ChevronsLeftRight, Trash2, Calendar, X, Check } from 'lucide-react';
import apiClient from '../../../api/axios';
import type { TransformationJourneyProps, ProgressPhotoItem } from '../../../interface';
import { toastStore } from '../../../utils/toast/toastStore';

const TransformationJourneySlider = ({
  goal,
  weightKg,
  targetWeightKg,
  goalTextMap,
  studentId,
  isPtView = false,
}: TransformationJourneyProps) => {
  const [photos, setPhotos] = useState<ProgressPhotoItem[]>([]);
  const [sliderPosition, setSliderPosition] = useState(50); // percentage (0 - 100)
  const [isDragging, setIsDragging] = useState(false);

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // New photo form
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newTag, setNewTag] = useState<'BEFORE' | 'AFTER' | 'FRONT' | 'SIDE'>('AFTER');
  const [newWeight, setNewWeight] = useState<string>(weightKg ? String(weightKg) : '75');
  const [submitting, setSubmitting] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const apiEndpoint = isPtView && studentId ? `/pt/students/${studentId}/photos` : '/progress/photos';

  const fetchPhotos = useCallback(() => {
    if (isPtView && !studentId) return;
    apiClient
      .get<ProgressPhotoItem[]>(apiEndpoint)
      .then((res) => {
        setPhotos(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error('Error fetching progress photos:', err);
        setPhotos([]);
      });
  }, [apiEndpoint, isPtView, studentId]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  // Handle Drag logic for Slider
  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 5) percentage = 5;
    if (percentage > 95) percentage = 95;
    setSliderPosition(percentage);
  }, []);

  const handleMouseDown = () => setIsDragging(true);

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) handleMove(e.clientX);
    };
    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches[0]) handleMove(e.touches[0].clientX);
    };
    const handleGlobalUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('touchmove', handleGlobalTouchMove);
      window.addEventListener('mouseup', handleGlobalUp);
      window.addEventListener('touchend', handleGlobalUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('touchmove', handleGlobalTouchMove);
      window.removeEventListener('mouseup', handleGlobalUp);
      window.removeEventListener('touchend', handleGlobalUp);
    };
  }, [isDragging, handleMove]);

  // Determine Before & After photos (fallback to stock images if none uploaded)
  const beforePhoto = photos.find((p) => p.tag === 'BEFORE') || {
    id: 'default-before',
    photoUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1000&q=80',
    takenAt: 'Ban đầu',
    weightAtTime: weightKg ? weightKg + 5 : 85,
  };

  const afterPhoto = photos.find((p) => p.tag === 'AFTER' || p.tag === 'FRONT') || {
    id: 'default-after',
    photoUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1000&q=80',
    takenAt: 'Hôm nay',
    weightAtTime: weightKg ?? 80,
  };

  // Preset sample body photos for quick selection in upload modal
  const samplePhotoPresets = [
    { label: 'Nam thể thao 1', url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80' },
    { label: 'Nam thể thao 2', url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80' },
    { label: 'Nữ thể thao 1', url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80' },
    { label: 'Nữ thể thao 2', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80' },
  ];

  const handleAddPhoto = () => {
    if (!newPhotoUrl.trim()) {
      toastStore.addToast('Vui lòng nhập đường dẫn ảnh hoặc chọn ảnh mẫu', 'error');
      return;
    }

    setSubmitting(true);
    apiClient
      .post(apiEndpoint, {
        photoUrl: newPhotoUrl.trim(),
        tag: newTag,
        weightAtTime: parseFloat(newWeight) || weightKg,
      })
      .then(() => {
        toastStore.addToast('Đã thêm ảnh tiến trình mới thành công!', 'success');
        setIsUploadOpen(false);
        setNewPhotoUrl('');
        fetchPhotos();
      })
      .catch((err) => {
        console.error('Error adding photo:', err);
        toastStore.addToast('Không thể thêm ảnh. Vui lòng thử lại!', 'error');
      })
      .finally(() => setSubmitting(false));
  };

  const handleDeletePhoto = (photoId: string) => {
    if (photoId.startsWith('default-')) return;
    if (!confirm('Bạn có chắc chắn muốn xóa ảnh tiến trình này không?')) return;

    const deleteUrl = isPtView && studentId ? `/pt/students/${studentId}/photos/${photoId}` : `/progress/photos/${photoId}`;

    apiClient
      .delete(deleteUrl)
      .then(() => {
        toastStore.addToast('Đã xóa ảnh tiến trình', 'success');
        fetchPhotos();
      })
      .catch((err) => {
        console.error('Error deleting photo:', err);
        toastStore.addToast('Không thể xóa ảnh', 'error');
      });
  };

  return (
    <section className="bento-card rounded-2xl p-6 md:p-8 flex flex-col gap-4 relative overflow-hidden border border-outline-variant/30">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-headline-md font-bold text-on-surface">
            {isPtView ? 'Ảnh Tiến Trình Học Viên (Before / After)' : 'Hành Trình Lột Xác (Before / After Slider)'}
          </h3>
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-green-light/10 border border-green-light/30 text-green-light text-[10px] font-bold shadow-[0_0_10px_rgba(102,200,28,0.3)] w-max">
            {goalTextMap[goal] || 'Mục tiêu tập luyện'} ({weightKg}kg -&gt; {targetWeightKg}kg)
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors cursor-pointer"
          >
            <Camera size={14} />
            {isPtView ? 'Thêm ảnh cho học viên' : 'Cập nhật ảnh mới'}
          </button>
          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-bright/40 border border-white/5 text-on-surface-variant text-xs font-semibold hover:bg-surface-bright/80 transition-colors cursor-pointer"
          >
            <History size={14} />
            Lịch sử ({photos.length})
          </button>
        </div>
      </div>

      {/* Interactive Split Slider Container */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
        className="relative w-full h-80 md:h-96 rounded-xl overflow-hidden border border-white/10 group cursor-ew-resize select-none"
      >
        {/* AFTER Image (Full background) */}
        <img
          alt="After"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          src={afterPhoto.photoUrl}
        />
        <div className="absolute bottom-4 right-4 px-3 py-1 bg-surface-dim/90 backdrop-blur-md border border-green-light rounded-lg text-green-light text-xs font-bold z-20 pointer-events-none shadow-lg">
          Hiện tại • {afterPhoto.weightAtTime || weightKg} kg
        </div>

        {/* BEFORE Image (Clipped by sliderPosition %) */}
        <div
          className="absolute inset-0 overflow-hidden border-r-2 border-green-light z-10 pointer-events-none"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            alt="Before"
            className="absolute inset-0 h-full object-cover max-w-none pointer-events-none"
            style={{ width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%' }}
            src={beforePhoto.photoUrl}
          />
          <div className="absolute bottom-4 left-4 px-3 py-1 bg-surface-dim/90 backdrop-blur-md border border-white/20 rounded-lg text-on-surface text-xs font-bold pointer-events-none shadow-lg">
            Bắt đầu • {beforePhoto.weightAtTime || (weightKg ? weightKg + 5 : 85)} kg
          </div>
        </div>

        {/* Draggable Handle Button */}
        <div
          className="absolute top-0 bottom-0 flex items-center justify-center z-30 pointer-events-none"
          style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        >
          <div className="w-10 h-10 rounded-full bg-green-light shadow-[0_0_20px_rgba(102,200,28,0.8)] flex items-center justify-center text-dark-slate scale-100 group-hover:scale-110 transition-transform">
            <ChevronsLeftRight size={20} className="stroke-[2.5]" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-on-surface-variant opacity-80">
        <div className="flex items-center gap-2">
          <Lock size={14} className="shrink-0" />
          <p>Kéo thanh trượt để so sánh ảnh Trước & Sau. {isPtView ? 'PT có quyền CRUD ảnh tiến trình.' : 'Ảnh bảo mật chỉ bạn và PT xem.'}</p>
        </div>
        <span className="font-semibold text-green-light">Tỷ lệ: {Math.round(sliderPosition)}%</span>
      </div>

      {/* Modal 1: Upload New Photo */}
      {isUploadOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121815] border border-white/10 rounded-2xl w-full max-w-lg p-6 flex flex-col gap-4 text-white shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <h4 className="text-lg font-bold flex items-center gap-2">
                <Camera className="text-green-light" size={20} />
                {isPtView ? 'Cập nhật ảnh tiến trình cho học viên' : 'Cập nhật ảnh tiến trình hình thể'}
              </h4>
              <button
                type="button"
                onClick={() => setIsUploadOpen(false)}
                className="text-white/60 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">
                  Nhãn loại ảnh:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['BEFORE', 'AFTER', 'FRONT', 'SIDE'] as const).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setNewTag(tag)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                        newTag === tag
                          ? 'border-green-light bg-green-light/20 text-green-light'
                          : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
                      }`}
                    >
                      {tag === 'BEFORE' ? 'Trước (Before)' : tag === 'AFTER' ? 'Hiện tại (After)' : tag === 'FRONT' ? 'Mặt trước' : 'Mặt bên'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">
                  Cân nặng tại thời điểm chụp (kg):
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-green-light focus:outline-none"
                  placeholder="Ví dụ: 72.5"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">
                  Đường dẫn ảnh URL (hoặc chọn ảnh mẫu bên dưới):
                </label>
                <input
                  type="text"
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-green-light focus:outline-none"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">
                  Ảnh mẫu nhanh:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {samplePhotoPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNewPhotoUrl(preset.url)}
                      className="relative h-16 rounded-lg overflow-hidden border border-white/10 hover:border-green-light transition-all group"
                    >
                      <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Check size={16} className="text-green-light" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsUploadOpen(false)}
                className="flex-1 py-2.5 rounded-lg border border-white/10 text-white/70 text-xs font-bold hover:bg-white/5"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleAddPhoto}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-lg bg-green-light text-[#003824] text-xs font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-1"
              >
                {submitting ? 'Đang lưu...' : 'Lưu ảnh tiến trình'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Photo History Gallery */}
      {isHistoryOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121815] border border-white/10 rounded-2xl w-full max-w-2xl p-6 flex flex-col gap-4 text-white shadow-2xl max-h-[85vh] animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <h4 className="text-lg font-bold flex items-center gap-2">
                <History className="text-green-light" size={20} />
                Lịch sử Ảnh Tiến trình ({photos.length})
              </h4>
              <button
                type="button"
                onClick={() => setIsHistoryOpen(false)}
                className="text-white/60 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 pr-1 no-scrollbar">
              {photos.length === 0 ? (
                <div className="py-12 text-center text-white/50 text-sm">
                  Chưa có ảnh tiến trình nào được lưu. Bấm &quot;Thêm ảnh&quot; để tải ảnh lên!
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="relative rounded-xl overflow-hidden border border-white/10 bg-white/5 flex flex-col group"
                    >
                      <div className="h-44 w-full relative">
                        <img
                          src={photo.photoUrl}
                          alt={photo.tag || 'Progress'}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-bold text-green-light border border-green-light/30">
                          {photo.tag || 'PROGRESS'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="p-2.5 text-xs flex justify-between items-center text-white/70">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(photo.takenAt).toLocaleDateString('vi-VN')}
                        </span>
                        {photo.weightAtTime && (
                          <span className="font-bold text-white">{photo.weightAtTime} kg</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default TransformationJourneySlider;
