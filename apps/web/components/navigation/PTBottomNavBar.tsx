"use client";

import Link from "next/link";
import React from "react";
import { Home, Calendar, Users, User, Plus } from "lucide-react";
import type { PTBottomNavBarProps } from "../../interface";

const PTBottomNavBar = ({ activeTab }: PTBottomNavBarProps) => {
  return (
    <>
      <div className="md:hidden fixed bottom-10 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-50 flex items-center justify-center gap-3">
        <nav className="flex items-center justify-between rounded-full p-2 shadow-2xl bg-white/95 dark:bg-[#121926]/90 backdrop-blur-xl border border-slate-200 dark:border-white/20">
          {/* Trang chủ */}
          <Link
            href="/pt"
            prefetch={true}
            className={`flex items-center gap-2 rounded-full transition-colors ${
              activeTab === "home"
                ? "bg-green-light/15 text-green-light px-4 py-2 font-bold"
                : "w-10 h-10 shrink-0 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-bright/50"
            }`}
          >
            <Home className="w-5 h-5 shrink-0" />
            {activeTab === "home" && <span className="font-headline-md text-base">Trang chủ</span>}
          </Link>

          <div className="flex items-center">
            {/* Lịch dạy */}
            <Link
              href="/pt/schedule"
              prefetch={true}
              className={`flex items-center gap-2 rounded-full transition-colors ${
                activeTab === "schedule"
                  ? "bg-green-light/15 text-green-light px-4 py-2 font-bold"
                  : "w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-bright/50"
              }`}
            >
              <Calendar className="w-5 h-5 shrink-0" />
              {activeTab === "schedule" && (
                <span className="font-headline-md text-base">Lịch dạy</span>
              )}
            </Link>

            {/* Học viên */}
            <Link
              href="/pt/students"
              prefetch={true}
              className={`flex items-center gap-2 rounded-full transition-colors ${
                activeTab === "students"
                  ? "bg-green-light/15 text-green-light px-4 py-2 font-bold"
                  : "w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-bright/50"
              }`}
            >
              <Users className="w-5 h-5 shrink-0" />
              {activeTab === "students" && (
                <span className="font-headline-md text-base">Học viên</span>
              )}
            </Link>

            {/* Tôi */}
            <Link
              href="/pt/profile"
              prefetch={true}
              className={`flex items-center gap-2 rounded-full transition-colors ${
                activeTab === "profile"
                  ? "bg-green-light/15 text-green-light px-4 py-2 font-bold"
                  : "w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-bright/50"
              }`}
            >
              <User className="w-5 h-5 shrink-0" />
              {activeTab === "profile" && <span className="font-headline-md text-base">Tôi</span>}
            </Link>
          </div>
        </nav>

        {/* Separate Floating Action Button (+) on the right linked to /pt/schedule */}
        <Link
          href="/pt/schedule"
          aria-label="Tạo ca dạy / Giao bài"
          className="w-14 h-14 shrink-0 rounded-full bg-primary text-white flex items-center justify-center shadow-[0_0_15px_rgba(102,200,28,0.4)] active:scale-95 transition-transform cursor-pointer"
        >
          <Plus className="w-7 h-7 font-bold" />
        </Link>
      </div>

      {/* Add space for fixed bottom nav on mobile */}
      <div className="h-32 md:hidden"></div>
    </>
  );
};

export default PTBottomNavBar;
