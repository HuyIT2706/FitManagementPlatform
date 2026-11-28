"use client";

import Link from "next/link";
import React from "react";
import { Home, Calendar, Users, User, Plus } from "lucide-react";
import type { PTBottomNavBarProps } from "../../interface";

const PT_NAV_ITEMS: Array<{
  key: PTBottomNavBarProps["activeTab"];
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { key: "home", href: "/pt", label: "Trang chủ", icon: Home },
  { key: "schedule", href: "/pt/schedule", label: "Lịch dạy", icon: Calendar },
  { key: "students", href: "/pt/students", label: "Học viên", icon: Users },
  { key: "profile", href: "/pt/profile", label: "Tôi", icon: User },
];

const PTBottomNavBar = ({ activeTab }: PTBottomNavBarProps) => {
  return (
    <>
      <div className="md:hidden fixed bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 w-[94%] max-w-md z-50 flex items-center justify-center gap-2 sm:gap-2.5">
        <nav className="flex-1 min-w-0 flex items-center justify-between gap-1 rounded-full p-1.5 sm:p-2 shadow-2xl bg-white/95 dark:bg-[#121926]/90 backdrop-blur-xl border border-slate-200 dark:border-white/20">
          {PT_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <Link
                key={item.key}
                href={item.href}
                prefetch={true}
                aria-label={item.label}
                className={`flex items-center justify-center gap-1.5 rounded-full transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? "bg-green-light/15 text-green-light px-3 sm:px-4 py-2 font-bold"
                    : "w-9 h-9 sm:w-10 sm:h-10 text-on-surface-variant hover:text-on-surface hover:bg-surface-bright/50"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {isActive && (
                  <span className="font-headline-md text-xs sm:text-sm">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Separate Floating Action Button (+) on the right linked to /pt/schedule */}
        <Link
          href="/pt/schedule"
          aria-label="Tạo ca dạy / Giao bài"
          className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-full bg-primary text-white flex items-center justify-center shadow-[0_0_15px_rgba(102,200,28,0.4)] active:scale-95 transition-transform cursor-pointer"
        >
          <Plus className="w-6 h-6 sm:w-7 sm:h-7 font-bold" />
        </Link>
      </div>

      {/* Add space for fixed bottom nav on mobile */}
      <div className="h-32 md:hidden"></div>
    </>
  );
};

export default PTBottomNavBar;
