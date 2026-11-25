/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, ChevronRight, Menu, X } from 'lucide-react';

export default function LandingNavbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('jwt_token');
      setIsLoggedIn(Boolean(token));
    }
  }, []);

  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-black/75 border-b border-white/10 text-white transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo using Official App Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 bg-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
            <img
              src="/logoApp.jpg"
              alt="NutriCore Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-extrabold text-lg tracking-tight text-white">
              Nutri<span className="text-emerald-400">Core</span>
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold uppercase tracking-wider text-zinc-300">
          <a href="#ai-scanner" className="hover:text-white transition">
            Chụp món ăn
          </a>
          <a href="#comparison" className="hover:text-white transition">
            So Sánh
          </a>
          <a href="#reviews" className="hover:text-white transition">
            Đánh Giá
          </a>
          <a href="#roles" className="hover:text-white transition">
            Học Viên & PT
          </a>
          <a href="#faq" className="hover:text-white transition">
            Hỏi Đáp
          </a>
        </nav>

        {/* Action CTAs (Desktop) */}
        <div className="hidden md:flex items-center gap-2.5">
          {isLoggedIn ? (
            <button
              onClick={() => router.push('/home')}
              className="px-5 py-2.5 rounded-full bg-white hover:bg-zinc-100 text-black font-semibold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <span>Vào Dashboard</span>
              <ArrowRight size={13} />
            </button>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white transition"
              >
                Đăng nhập
              </Link>
              <Link
                href="/onboarding"
                className="px-5 py-2.5 rounded-full bg-white hover:bg-zinc-100 text-black font-semibold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5"
              >
                <span>Dùng thử</span>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-800 bg-black/95 backdrop-blur-xl px-4 py-5 space-y-4 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-3 text-sm font-semibold text-zinc-300">
            <a
              href="#ai-scanner"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-1.5 hover:text-white transition flex items-center justify-between"
            >
              <span>Chụp món ăn</span>
              <ChevronRight size={16} className="text-zinc-500" />
            </a>
            <a
              href="#comparison"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-1.5 hover:text-white transition flex items-center justify-between"
            >
              <span>So Sánh Giải Pháp</span>
              <ChevronRight size={16} className="text-zinc-500" />
            </a>
            <a
              href="#reviews"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-1.5 hover:text-white transition flex items-center justify-between"
            >
              <span>Đánh Giá Từ Người Dùng</span>
              <ChevronRight size={16} className="text-zinc-500" />
            </a>
            <a
              href="#roles"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-1.5 hover:text-white transition flex items-center justify-between"
            >
              <span>Học Viên & PT</span>
              <ChevronRight size={16} className="text-zinc-500" />
            </a>
            <a
              href="#faq"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-1.5 hover:text-white transition flex items-center justify-between"
            >
              <span>Hỏi Đáp</span>
              <ChevronRight size={16} className="text-zinc-500" />
            </a>
          </nav>

          <div className="pt-3 border-t border-zinc-800 flex flex-col gap-2.5">
            {isLoggedIn ? (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  router.push('/home');
                }}
                className="w-full py-3 rounded-full bg-white text-black font-semibold text-xs uppercase tracking-wider text-center shadow-sm cursor-pointer"
              >
                Vào Dashboard →
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-full bg-zinc-900 text-center text-xs font-semibold text-zinc-200 hover:text-white"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/onboarding"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-3 rounded-full bg-white text-black text-center text-xs font-semibold uppercase tracking-wider shadow-sm"
                >
                  Trải nghiệm miễn phí
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
