/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { X, Check, Upload, User, Loader2 } from "lucide-react";
import type { EditPtProfileModalProps } from "../../../../interface";
import { toast } from "../../../../utils/toast";

const EditPtProfileModal = ({
  isOpen,
  onClose,
  userData,
  fullName,
  setFullName,
  bio,
  setBio,
  experienceYears,
  setExperienceYears,
  specialties,
  setSpecialties,
  availableSpecialties,
  saving,
  onSave,
  avatarUrl,
  setAvatarUrl,
}: EditPtProfileModalProps) => {
  const [isProcessingAvatar, setIsProcessingAvatar] = useState(false);

  if (!isOpen) return null;

  const toggleSpecialty = (spec: string) => {
    if (specialties.includes(spec)) {
      setSpecialties(specialties.filter((s) => s !== spec));
    } else {
      setSpecialties([...specialties, spec]);
    }
  };

  const processImageFile = (
    file: File,
    maxDimension: number,
    quality = 0.85
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith("image/")) {
        return reject(
          new Error("Vui lòng chọn tệp định dạng hình ảnh (.jpg, .jpeg, .png, .webp)")
        );
      }
      if (file.size > 15 * 1024 * 1024) {
        return reject(new Error("Kích thước ảnh tối đa là 15MB"));
      }

      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Không thể đọc tệp hình ảnh"));
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (!result) return reject(new Error("Tệp hình ảnh rỗng"));

        const img = new window.Image();
        img.onerror = () => {
          if (result.length < 2 * 1024 * 1024) {
            resolve(result);
          } else {
            reject(new Error("Định dạng ảnh không hỗ trợ hoặc tệp bị lỗi"));
          }
        };
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > maxDimension) {
                height = Math.round((height * maxDimension) / width);
                width = maxDimension;
              }
            } else {
              if (height > maxDimension) {
                width = Math.round((width * maxDimension) / height);
                height = maxDimension;
              }
            }

            canvas.width = Math.max(1, width);
            canvas.height = Math.max(1, height);
            const ctx = canvas.getContext("2d");
            if (!ctx) {
              return resolve(result);
            }
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL("image/jpeg", quality);
            resolve(compressed);
          } catch {
            resolve(result);
          }
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !setAvatarUrl) return;
    setIsProcessingAvatar(true);
    try {
      const compressed = await processImageFile(file, 400, 0.85);
      setAvatarUrl(compressed);
      toast.success("Đã tải ảnh đại diện thành công!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi tải ảnh đại diện";
      toast.error(msg);
    } finally {
      setIsProcessingAvatar(false);
      e.target.value = "";
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#12161f] border border-slate-200 dark:border-outline-variant/30 w-full max-w-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden text-left">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10 gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white truncate">
              Cập nhật thông tin Hồ sơ HLV
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng modal"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 dark:bg-white/5 dark:hover:bg-white/10 flex items-center justify-center dark:text-on-surface-variant dark:hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form Inputs */}
        <div className="space-y-3.5 sm:space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 dark:text-on-surface">
              Họ & Tên HLV:
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-surface-bright/50 border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:border-primary outline-none transition-colors"
              placeholder={userData?.fullName || ""}
            />
          </div>

          {/* Avatar Photo Upload */}
          {setAvatarUrl && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-on-surface">
                Ảnh đại diện HLV:
              </label>
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-surface-bright/30 p-2.5 rounded-xl border border-slate-200 dark:border-white/10">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-primary/50 bg-black/40 flex items-center justify-center shrink-0">
                  {isProcessingAvatar ? (
                    <Loader2 size={16} className="text-primary animate-spin" />
                  ) : avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={20} className="text-slate-400" />
                  )}
                </div>
                <div className="flex-1">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/15 border border-primary/40 text-primary-dark dark:text-primary text-xs font-bold hover:bg-primary/25 transition-all">
                    {isProcessingAvatar ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        Đang nén ảnh...
                      </>
                    ) : (
                      <>
                        <Upload size={13} />
                        {avatarUrl ? "Đổi ảnh đại diện" : "Chọn ảnh đại diện"}
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isProcessingAvatar}
                      onChange={handleAvatarFile}
                      className="hidden"
                    />
                  </label>
                  {avatarUrl && !isProcessingAvatar && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl("")}
                      className="ml-2 text-[11px] text-rose-500 hover:underline font-semibold"
                    >
                      Xóa
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Certificate Photo Upload */}
          {/* Experience Years */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 dark:text-on-surface">
              Số năm kinh nghiệm:
            </label>
            <input
              type="number"
              min={0}
              max={50}
              placeholder="0"
              value={experienceYears === 0 ? "" : experienceYears}
              onChange={(e) =>
                setExperienceYears(
                  e.target.value === "" ? 0 : Number(e.target.value),
                )
              }
              className="w-full bg-slate-50 dark:bg-surface-bright/50 border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-extrabold text-primary-dark dark:text-primary focus:border-primary outline-none transition-colors"
            />
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 dark:text-on-surface">
              Tiểu sử HLV (Bio):
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-slate-50 dark:bg-surface-bright/50 border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white/90 focus:border-primary outline-none leading-relaxed transition-colors resize-none no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              placeholder="Giới thiệu về chuyên môn & định hướng huấn luyện..."
            />
          </div>

          {/* Specialties */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 dark:text-on-surface">
              Lĩnh vực Chuyên môn:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
              {availableSpecialties.map((spec) => {
                const isSelected = specialties.includes(spec);
                return (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => toggleSpecialty(spec)}
                    className={`p-2.5 rounded-xl border text-xs font-extrabold text-left flex justify-between items-center transition-all cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/20 text-primary-dark dark:text-primary shadow-[0_0_10px_rgba(102,200,28,0.2)]"
                        : "border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-surface-bright/30 text-slate-700 dark:text-on-surface-variant hover:border-slate-300 dark:hover:border-white/20 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <span>{spec}</span>
                    {isSelected && (
                      <Check
                        size={14}
                        className="text-primary-dark dark:text-primary stroke-[3] shrink-0"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 sm:gap-3 pt-3 sm:pt-4 border-t border-slate-200 dark:border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 hover:bg-slate-200 dark:bg-transparent text-slate-700 dark:text-on-surface-variant hover:text-slate-900 dark:hover:text-white text-xs font-bold transition-colors cursor-pointer text-center"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving || isProcessingAvatar}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary text-dark-slate text-xs font-extrabold shadow-[0_0_15px_rgba(102,200,28,0.4)] hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 text-center"
          >
            {saving ? "Đang lưu..." : "Lưu Thay Đổi"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPtProfileModal;
