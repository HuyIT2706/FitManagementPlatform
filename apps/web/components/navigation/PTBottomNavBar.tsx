"use client";

import Link from "next/link";
import React from "react";

interface PTBottomNavBarProps {
  activeTab: "home" | "schedule" | "students" | "profile";
}

const PTBottomNavBar = ({ activeTab }: PTBottomNavBarProps) => {
  return (
    <>
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-50 flex items-center justify-center gap-3">
        <nav className="flex items-center justify-between rounded-full p-2 shadow-lg bg-white/10 backdrop-blur-xl border border-white/20">
          {/* Trang chủ */}
          <Link
            href="/pt"
            className={`flex items-center gap-2 rounded-full transition-colors ${
              activeTab === "home"
                ? "bg-green-light/10 text-green-light px-4 py-2 font-bold"
                : "w-10 h-10 shrink-0 flex items-center justify-center text-on-surface-variant/40 hover:bg-surface-bright/10"
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={activeTab === "home" ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              home
            </span>
            {activeTab === "home" && <span className="font-headline-md text-base">Trang chủ</span>}
          </Link>

          <div className="flex items-center">
            {/* Lịch dạy */}
            <Link
              href="/pt/schedule"
              className={`flex items-center gap-2 rounded-full transition-colors ${
                activeTab === "schedule"
                  ? "bg-green-light/10 text-green-light px-4 py-2 font-bold"
                : "w-10 h-10 flex items-center justify-center text-on-surface-variant/40 hover:bg-surface-bright/10"
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={activeTab === "schedule" ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                calendar_today
              </span>
              {activeTab === "schedule" && (
                <span className="font-headline-md text-base">Lịch dạy</span>
              )}
            </Link>

            {/* Học viên */}
            <Link
              href="/pt/students"
              className={`flex items-center gap-2 rounded-full transition-colors ${
                activeTab === "students"
                  ? "bg-green-light/10 text-green-light px-4 py-2 font-bold"
                  : "w-10 h-10 flex items-center justify-center text-on-surface-variant/40 hover:bg-surface-bright/10"
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={activeTab === "students" ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                group
              </span>
              {activeTab === "students" && (
                <span className="font-headline-md text-base">Học viên</span>
              )}
            </Link>

            {/* Tôi */}
            <Link
              href="/pt/profile"
              className={`flex items-center gap-2 rounded-full transition-colors ${
                activeTab === "profile"
                  ? "bg-green-light/10 text-green-light px-4 py-2 font-bold"
                  : "w-10 h-10 flex items-center justify-center text-on-surface-variant/40 hover:bg-surface-bright/10"
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={activeTab === "profile" ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                person
              </span>
              {activeTab === "profile" && <span className="font-headline-md text-base">Tôi</span>}
            </Link>
          </div>
        </nav>

        {/* Separate Floating Action Button (+) on the right */}
        <button
          aria-label="Tạo ca dạy / Giao bài"
          className="w-14 h-14 shrink-0 rounded-full bg-primary text-white flex items-center justify-center shadow-[0_0_15px_rgba(102,200,28,0.4)] active:scale-95 transition-transform cursor-pointer"
        >
          <span className="material-symbols-outlined text-3xl font-bold">add</span>
        </button>
      </div>

      {/* Add space for fixed bottom nav on mobile */}
      <div className="h-32 md:hidden"></div>
    </>
  );
};

export default PTBottomNavBar;
