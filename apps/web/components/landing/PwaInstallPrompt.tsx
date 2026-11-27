/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Download, PlusSquare, Share, Smartphone, X } from 'lucide-react';
import toast from '../../utils/toast';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const DISMISS_STORAGE_KEY = 'nutricore_pwa_prompt_dismissed_at';
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

function isDismissedRecently(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(DISMISS_STORAGE_KEY);
    if (!raw) return false;
    const timestamp = Number(raw);
    if (!Number.isFinite(timestamp)) return false;
    return Date.now() - timestamp < DISMISS_DURATION_MS;
  } catch {
    return false;
  }
}

function isRunningStandaloneOrNative(): boolean {
  if (typeof window === 'undefined') return true;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  const isStandalone =
    window.matchMedia?.('(display-mode: standalone)').matches ||
    nav.standalone === true;
  const isNative =
    navigator.userAgent.includes('NutriCoreApp') ||
    Boolean(
      (
        window as unknown as {
          Capacitor?: { isNativePlatform?: () => boolean };
        }
      ).Capacitor?.isNativePlatform?.(),
    );
  return Boolean(isStandalone || isNative);
}

export default function PwaInstallPrompt() {
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIosDevice, setIsIosDevice] = useState(false);
  const [showManualSteps, setShowManualSteps] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isRunningStandaloneOrNative() || isDismissedRecently()) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e as BeforeInstallPromptEvent;
      setIsVisible(true);
    };

    const handleAppInstalled = () => {
      deferredPromptRef.current = null;
      setIsVisible(false);
      toast.success('Đã cài đặt NutriCore App lên màn hình chính!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    const iosDetected =
      /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    const timer = window.setTimeout(() => {
      if (!isRunningStandaloneOrNative() && !isDismissedRecently()) {
        setIsIosDevice(iosDetected);
        setIsVisible(true);
      }
    }, 1100);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt,
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      localStorage.setItem(DISMISS_STORAGE_KEY, String(Date.now()));
    } catch {
      // Ignore storage errors
    }
  };

  const handleInstallClick = async () => {
    const promptEvent = deferredPromptRef.current;
    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        deferredPromptRef.current = null;
        if (choice.outcome === 'accepted') {
          setIsVisible(false);
          toast.success('Đang thêm NutriCore vào màn hình chính...');
        }
      } catch {
        setShowManualSteps(true);
      }
      return;
    }

    if (showManualSteps) {
      handleDismiss();
      return;
    }
    setShowManualSteps(true);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Cài đặt NutriCore App"
      className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 sm:w-[400px] z-50 rounded-3xl bg-[#0e1511]/95 backdrop-blur-xl border border-white/15 p-4 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.45)] text-white animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="flex items-start gap-3.5">
        {/* App Icon */}
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden border border-emerald-400/35 bg-[#121c16] shadow-lg shadow-emerald-500/20 shrink-0">
          <img
            src="/android-chrome-192x192.png"
            alt="NutriCore App"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Title & Subtitle */}
        <div className="flex-1 min-w-0 pr-1">
          <h2 className="text-sm sm:text-[15px] font-black uppercase tracking-tight text-white leading-snug">
            Cài đặt NutriCore App
          </h2>
          <p className="text-xs text-zinc-300 leading-relaxed mt-1">
            Thêm vào Màn hình chính để sử dụng mượt mà không cần mở trình duyệt.
          </p>
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Đóng thông báo cài đặt"
          className="w-7 h-7 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Inline Fallback Instructions for iOS Safari / browsers without prompt API */}
      {showManualSteps && (
        <div className="mt-3.5 p-3 rounded-2xl bg-white/[0.06] border border-white/10 text-xs text-zinc-200 space-y-2">
          {isIosDevice ? (
            <>
              <p className="font-bold text-lime-300 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 shrink-0" />
                <span>Hướng dẫn cài trên iPhone / iPad (Safari):</span>
              </p>
              <ol className="space-y-1.5 text-[11px] text-zinc-300 pl-1">
                <li className="flex items-center gap-1.5">
                  <span>1. Chạm biểu tượng</span>
                  <Share className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <strong className="text-white">Chia sẻ</strong>
                  <span>ở thanh dưới Safari.</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span>2. Chọn</span>
                  <PlusSquare className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                  <strong className="text-white">Thêm vào MH chính</strong>
                  <span>→ nhấn Thêm.</span>
                </li>
              </ol>
            </>
          ) : (
            <>
              <p className="font-bold text-lime-300 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 shrink-0" />
                <span>Cách cài nhanh trên trình duyệt:</span>
              </p>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                Nhấn biểu tượng menu <strong className="text-white">⋮</strong> ở góc phải trình duyệt (hoặc biểu tượng cài đặt trên thanh địa chỉ) → chọn{' '}
                <strong className="text-white">&ldquo;Cài đặt ứng dụng&rdquo;</strong> /{' '}
                <strong className="text-white">&ldquo;Thêm vào Màn hình chính&rdquo;</strong>.
              </p>
            </>
          )}
        </div>
      )}

      {/* Primary Install CTA */}
      <button
        type="button"
        onClick={handleInstallClick}
        className="mt-4 w-full py-3 rounded-2xl bg-gradient-to-r from-[#a3e635] to-[#10b981] hover:brightness-105 active:scale-[0.98] text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
      >
        <Download className="w-4 h-4 stroke-[2.5]" />
        <span>{showManualSteps ? 'Đã hiểu hướng dẫn' : 'Cài đặt ngay'}</span>
      </button>
    </aside>
  );
}
