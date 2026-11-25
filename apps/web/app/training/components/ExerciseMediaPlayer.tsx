/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useEffect, useState } from 'react';
import { ExternalLink, Maximize2, Pause, Play, X } from 'lucide-react';

export type ExerciseMediaMode = 'video' | 'animation' | 'frames';

interface ExerciseMediaPlayerProps {
  name: string;
  setupImageUrl?: string | null;
  startImageUrl?: string | null;
  mode: ExerciseMediaMode;
}

const DEFAULT_EXERCISE_IMG =
  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80';

function resolveImg(primary?: string | null, fallback?: string | null): string {
  if (primary && primary.trim() !== '') return primary.trim();
  if (fallback && fallback.trim() !== '') return fallback.trim();
  return DEFAULT_EXERCISE_IMG;
}

const ExerciseMediaPlayer = ({
  name,
  setupImageUrl,
  startImageUrl,
  mode,
}: ExerciseMediaPlayerProps) => {
  const [frameIndex, setFrameIndex] = useState<0 | 1>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const setupImg = resolveImg(setupImageUrl, startImageUrl);
  const startImg = resolveImg(startImageUrl, setupImageUrl);

  useEffect(() => {
    if (mode !== 'animation' || !isPlaying) return;
    const timer = setInterval(() => {
      setFrameIndex((prev) => (prev === 0 ? 1 : 0));
    }, 1150);
    return () => clearInterval(timer);
  }, [mode, isPlaying]);

  useEffect(() => {
    if (!isFullscreen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isFullscreen]);

  const currentLabel = frameIndex === 0 ? 'Bắt đầu' : 'Thực hiện';
  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${name} exercise form tutorial`)}`;

  if (mode === 'frames') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm aspect-[4/3]">
          <img
            src={setupImg}
            alt={`${name} - Bắt đầu`}
            onError={(e) => {
              if (e.currentTarget.src !== DEFAULT_EXERCISE_IMG) {
                e.currentTarget.src = DEFAULT_EXERCISE_IMG;
              }
            }}
            className="w-full h-full object-cover"
          />
          <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-xs font-bold">
            1. Bắt đầu
          </span>
        </div>

        <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-lime-400/50 shadow-sm aspect-[4/3]">
          <img
            src={startImg}
            alt={`${name} - Thực hiện`}
            onError={(e) => {
              if (e.currentTarget.src !== DEFAULT_EXERCISE_IMG) {
                e.currentTarget.src = DEFAULT_EXERCISE_IMG;
              }
            }}
            className="w-full h-full object-cover"
          />
          <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-lime-400 text-slate-950 text-xs font-extrabold">
            2. Kết thúc / Thực hiện
          </span>
        </div>
      </div>
    );
  }

  if (mode === 'video') {
    return (
      <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-white/10 shadow-lg aspect-[4/3] sm:aspect-[16/11] flex items-center justify-center group">
        <img
          src={startImg}
          alt={`${name} Video`}
          onError={(e) => {
            if (e.currentTarget.src !== DEFAULT_EXERCISE_IMG) {
              e.currentTarget.src = DEFAULT_EXERCISE_IMG;
            }
          }}
          className="absolute inset-0 w-full h-full object-cover opacity-55 group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/30" />

        <div className="relative z-10 text-center px-6 space-y-4">
          <a
            href={youtubeSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mx-auto w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-[0_8px_28px_rgba(220,38,38,0.45)] hover:scale-110 transition-all cursor-pointer"
            aria-label={`Xem video hướng dẫn ${name} trên YouTube`}
          >
            <Play size={26} fill="currentColor" className="ml-1" />
          </a>

          <div className="space-y-1">
            <p className="text-white font-bold text-sm sm:text-base line-clamp-1">
              Video hướng dẫn kỹ thuật chuẩn
            </p>
            <p className="text-white/75 text-xs">
              Mở tìm kiếm video chi tiết cho bài {name} trên YouTube
            </p>
          </div>

          <a
            href={youtubeSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-slate-950 hover:bg-slate-100 font-bold text-xs shadow-lg transition-all"
          >
            <span>Xem trên YouTube</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-200/80 dark:border-white/10 shadow-md aspect-[4/3] sm:aspect-[16/11]">
        <img
          src={setupImg}
          alt={`${name} - Bắt đầu`}
          onError={(e) => {
            if (e.currentTarget.src !== DEFAULT_EXERCISE_IMG) {
              e.currentTarget.src = DEFAULT_EXERCISE_IMG;
            }
          }}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            frameIndex === 0 ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <img
          src={startImg}
          alt={`${name} - Thực hiện`}
          onError={(e) => {
            if (e.currentTarget.src !== DEFAULT_EXERCISE_IMG) {
              e.currentTarget.src = DEFAULT_EXERCISE_IMG;
            }
          }}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            frameIndex === 1 ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Bottom Floating Animation Control Pill */}
        <div className="absolute bottom-3 left-3 right-3 z-20 bg-white/95 dark:bg-[#131a16]/95 backdrop-blur-xl rounded-2xl px-3 py-2.5 shadow-xl border border-black/5 dark:border-white/10 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsPlaying((prev) => !prev)}
            aria-label={isPlaying ? 'Tạm dừng hoạt ảnh' : 'Phát hoạt ảnh'}
            className="w-9 h-9 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center shrink-0 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          >
            {isPlaying ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" className="ml-0.5" />}
          </button>

          <div className="flex-1 min-w-0 space-y-1.5">
            {/* Clickable 2-frame progress track */}
            <div
              className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-white/15 overflow-hidden flex cursor-pointer"
              onClick={() => {
                setIsPlaying(false);
                setFrameIndex((prev) => (prev === 0 ? 1 : 0));
              }}
              title="Bấm để chuyển khung hình Bắt đầu / Thực hiện"
            >
              <div
                className={`h-full bg-slate-900 dark:bg-lime-400 transition-all duration-300 ${
                  frameIndex === 0 ? 'w-1/2' : 'w-full'
                }`}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              <span>{currentLabel}</span>
              <span className="text-slate-400 dark:text-slate-400">2 khung hình</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            aria-label="Phóng to toàn màn hình"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
          >
            <Maximize2 size={16} />
          </button>
        </div>
      </div>

      {/* Fullscreen Lightbox */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-[300] bg-black/95 flex flex-col items-center justify-center p-4"
          onClick={() => setIsFullscreen(false)}
        >
          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            aria-label="Đóng toàn màn hình"
            className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer"
          >
            <X size={20} />
          </button>

          <div
            className="max-w-4xl w-full space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative rounded-3xl overflow-hidden bg-slate-900 aspect-[4/3] max-h-[75vh] mx-auto">
              <img
                src={frameIndex === 0 ? setupImg : startImg}
                alt={`${name} - ${currentLabel}`}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="max-w-md mx-auto bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2.5 flex items-center gap-3 text-white">
              <button
                type="button"
                onClick={() => setIsPlaying((prev) => !prev)}
                className="w-9 h-9 rounded-full bg-white text-slate-950 flex items-center justify-center shrink-0 cursor-pointer"
              >
                {isPlaying ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" className="ml-0.5" />}
              </button>
              <span className="text-xs font-bold flex-1">{currentLabel}</span>
              <button
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setFrameIndex((prev) => (prev === 0 ? 1 : 0));
                }}
                className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 cursor-pointer"
              >
                Đổi khung hình ({frameIndex + 1}/2)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExerciseMediaPlayer;
